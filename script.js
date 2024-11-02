// BroadcastChannel for communication between tabs
const chatChannel = new BroadcastChannel("chatChannel");

// DOM elements
const loginScreen = document.getElementById("login-screen");
const chatApp = document.getElementById("chat-app");
const chatWindow = document.getElementById("chat-window");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const typingIndicator = document.getElementById("typing-indicator");

// Check for existing username
const username = localStorage.getItem("username");
if (username) {
	initializeChat();
} else {
	loginScreen.style.display = "flex";
}

// Initialize chat app
function initializeChat() {
	loginScreen.style.display = "none";
	chatApp.style.display = "flex";
}

// Login button click event
loginBtn.addEventListener("click", () => {
	const username = usernameInput.value.trim();
	if (username) {
		localStorage.setItem("username", username);
		initializeChat();
	}
});

// Logout button click event
logoutBtn.addEventListener("click", () => {
	localStorage.removeItem("username");
	location.reload();
});

// Event listener for sending messages
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", handleTyping);

// Broadcast a typing notification
function handleTyping() {
	const username = localStorage.getItem("username");
	if (username) {
		chatChannel.postMessage({ type: "typing", user: username });
	}
}

// Send a message
function sendMessage() {
	const username = localStorage.getItem("username");
	if (!username || !messageInput.value.trim()) return;

	const messageData = {
		type: "message",
		user: username,
		text: messageInput.value.trim(),
		timestamp: new Date().toLocaleTimeString(),
	};

	chatChannel.postMessage(messageData);
	displayMessage(messageData, true);
	messageInput.value = "";
}

// Display incoming messages
function displayMessage(data, isSender = false) {
	const messageElement = document.createElement("div");
	messageElement.classList.add("message");
	messageElement.classList.toggle("sent", isSender);

	const textElement = document.createElement("div");
	textElement.classList.add("text");
	textElement.textContent = `${data.user}: ${data.text}`;

	const timestampElement = document.createElement("div");
	timestampElement.classList.add("timestamp");
	timestampElement.textContent = data.timestamp;

	textElement.appendChild(timestampElement);
	messageElement.appendChild(textElement);
	chatWindow.appendChild(messageElement);
	chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Listen for BroadcastChannel messages
chatChannel.onmessage = (event) => {
	const data = event.data;

	switch (data.type) {
		case "message":
			displayMessage(data);
			typingIndicator.textContent = "";
			break;
		case "typing":
			typingIndicator.textContent = `${data.user} is typing...`;
			setTimeout(() => (typingIndicator.textContent = ""), 1000);
			break;
	}
};
