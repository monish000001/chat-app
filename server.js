const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Store users by room
let users = {};

io.on("connection", (socket) => {

    // Join Room
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

    // Chat Message
    socket.on("chat message", (data) => {
        if (socket.room) {
            io.to(socket.room).emit("chat message", data);
        }
    });

    // Typing Indicator
    socket.on("typing", (user) => {
        socket.broadcast.to(socket.room).emit("typing", user);
    });

    // Disconnect
    socket.on("disconnect", () => {
        if (socket.room && users[socket.room]) {
            delete users[socket.room][socket.id];

            io.to(socket.room).emit("user left", `${socket.username} left`);

            io.to(socket.room).emit(
                "update users",
                Object.values(users[socket.room])
            );

            // Clean empty rooms
            if (Object.keys(users[socket.room]).length === 0) {
                delete users[socket.room];
            }
        }
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});