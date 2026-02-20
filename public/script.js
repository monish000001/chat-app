const socket = io();

// Ask username & room safely
let username = prompt("Enter your name:");
let room = prompt("Enter room name:");

if (!username) username = "Guest" + Math.floor(Math.random() * 1000);
if (!room) room = "General";

// Join room
socket.emit("join room", { username, room });

// Update room title
document.getElementById("roomName").textContent = room;

// DOM elements
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const typingDiv = document.getElementById("typing");
const userCount = document.getElementById("userCount");

// Send message
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const message = input.value.trim();
    if (message !== "") {
        socket.emit("chat message", {
            user: username,
            message: message,
        });

        input.value = "";
        input.focus();
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
    addSystemMessage(msg);
});

socket.on("user left", function (msg) {
    addSystemMessage(msg);
});

function addSystemMessage(text) {
    const item = document.createElement("li");
    item.classList.add("system");
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

// Online users count
socket.on("update users", function (users) {
    userCount.textContent = users.length;
});

// Typing indicator (improved)
let typingTimeout;

input.addEventListener("input", () => {
    socket.emit("typing", username);
});

socket.on("typing", function (user) {
    if (user === username) return;

    typingDiv.textContent = user + " is typing...";

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingDiv.textContent = "";
    }, 1000);
});