const socket = io();

// Ask username & room
const username = prompt("Enter your name:");
const room = prompt("Enter room name:");

// Join room
socket.emit("join room", { username, room });

// Update room title in header
document.getElementById("roomName").textContent = room;

// DOM elements
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const typingDiv = document.getElementById("typing");

// Send message
form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (input.value.trim() !== "") {
        socket.emit("chat message", {
            user: username,
            message: input.value,
        });

        input.value = "";
    }
});

// Receive message
socket.on("chat message", function (data) {
    const item = document.createElement("li");
    item.classList.add("message");

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    if (data.user === username) {
        item.classList.add("me");
        item.innerHTML = `
            <div>${data.message}</div>
            <small>${time}</small>
        `;
    } else {
        item.classList.add("other");
        item.innerHTML = `
            <strong>${data.user}</strong><br>
            ${data.message}
            <br><small>${time}</small>
        `;
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

// System messages
socket.on("user joined", function (msg) {
    const item = document.createElement("li");
    item.classList.add("system");
    item.textContent = msg;
    messages.appendChild(item);
});

socket.on("user left", function (msg) {
    const item = document.createElement("li");
    item.classList.add("system");
    item.textContent = msg;
    messages.appendChild(item);
});

// Online users count
socket.on("update users", function (users) {
    document.getElementById("userCount").textContent = users.length;
});

// Typing indicator
input.addEventListener("input", () => {
    socket.emit("typing", username);
});

socket.on("typing", function (user) {
    typingDiv.textContent = user + " is typing...";

    setTimeout(() => {
        typingDiv.textContent = "";
    }, 1000);
});
