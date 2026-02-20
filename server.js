const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Root route fix (important for Render)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Store users by room
let users = {};

io.on("connection", (socket) => {

  socket.on("join room", ({ username, room }) => {
    socket.username = username;
    socket.room = room;

    socket.join(room);

    if (!users[room]) {
      users[room] = {};
    }

    users[room][socket.id] = username;

    io.to(room).emit("user joined", `${username} joined ${room}`);
    io.to(room).emit("update users", Object.values(users[room]));
  });

  socket.on("chat message", (data) => {
    if (socket.room) {
      io.to(socket.room).emit("chat message", data);
    }
  });

  socket.on("typing", (user) => {
    socket.broadcast.to(socket.room).emit("typing", user);
  });

  socket.on("disconnect", () => {
    if (socket.room && users[socket.room]) {
      delete users[socket.room][socket.id];

      io.to(socket.room).emit("user left", `${socket.username} left`);
      io.to(socket.room).emit(
        "update users",
        Object.values(users[socket.room])
      );

      if (Object.keys(users[socket.room]).length === 0) {
        delete users[socket.room];
      }
    }
  });
});

// 🔥 IMPORTANT: Use Render's port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
