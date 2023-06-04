//the index.js file
//set up a new WebSocket connection to the server
const socket = new WebSocket('wss://localhost:8080');

//get the chat input, chat messages div, and the send button from the DOM
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendButton = document.querySelector('button');

//function to handle sending a message
function handleSendMessage() {
  const message = chatInput.value;
  if (message) {
    socket.send(message);
    chatInput.value = '';
  }
}

//add the handleSendMessage function to the send button's onclick event
sendButton.onclick = handleSendMessage;

//handle incoming messages
socket.onmessage = function(event) {
  //create a new message div
  const messageDiv = document.createElement('div');
  messageDiv.textContent = event.data;

  //append the new message div to the chat messages div
  chatMessages.appendChild(messageDiv);

  //scroll to the bottom of the chat messages div
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

//handle WebSocket errors
socket.onerror = function(event) {
  console.error("WebSocket error observed:", event);
};