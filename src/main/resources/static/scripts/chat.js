let usernameFormContainer = document.getElementById('usernameFormContainer');
usernameFormContainer.addEventListener('submit', connect, true);
let chatPage = document.getElementById('chatPage');
let messageArea = document.getElementById('messageArea');
let messagesSpinner = document.getElementById('messagesSpinner');
let messageForm = document.getElementById('messageForm');
messageForm.addEventListener('submit', sendMessage, true);
let usersArea = document.getElementById('usersArea');
let usersSpinner = document.getElementById('usersSpinner');

const url = 'ws://localhost:8080/ws';
let client = null;
let sessionId = '';
let username = '';
let messageSound = new Audio('/sounds/message.wav');
let soundOn = true;

function connect(event) {
    username = document.getElementById('usernameInput').value.trim();

    if (username) {
        usernameFormContainer.classList.add('hidden');
        chatPage.classList.remove('hidden');
        client = Stomp.client(url);
        client.connect({ username: username }, onConnected, onError);
    } else {
        validateUsernameForm();
    }

    event.preventDefault();
}

function onConnected() {
    client.subscribe('/topic/public', onMessageReceived);
    let chatMessage = {
        sender: 'Server',
        content: username + ' has joined!',
        type: 'JOIN'
    }
    client.send('/app/ws', {}, JSON.stringify(chatMessage));

    messagesSpinner.classList.add('hidden');
}

function onError(error) {
    alert('Could not connect to WebSocket server. Please refresh this page to try again!');
}

function sendMessage(event) {
    let messageInput = document.getElementById('messageInput');
    if (client && messageInput.value) {
        let chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        }
        client.send('/app/ws', {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }

    event.preventDefault();
}

function onMessageReceived(response) {
    const chatMessage = JSON.parse(response.body);

    createMessage(chatMessage);

    if (soundOn && chatMessage.sender !== username) {
        messageSound.play();
    }
}

function createMessage(chatMessage) {
    let chatMessageElement = document.createElement('li');
    chatMessageElement.id = chatMessage.id;

    if (chatMessage.sender === 'Server') {
        chatMessageElement.classList.add('server-message');

        if (chatMessage.type === 'JOIN') {
            sessionId = chatMessage.sessionId;
        }
    }

    if (chatMessage.type === 'CHAT') {
        let usernameDateElement = document.createElement('div');

        chatMessageElement.classList.add('chat-message');
        let usernameElement = document.createElement('span');
        usernameElement.classList.add('username');
        let usernameText = document.createTextNode(chatMessage.sender);
        usernameElement.appendChild(usernameText);
        usernameDateElement.appendChild(usernameElement);

        let dateElement = document.createElement('span');
        dateElement.classList.add('date');
        let date = document.createTextNode(chatMessage.date);
        dateElement.appendChild(date);
        usernameDateElement.appendChild(dateElement);

        chatMessageElement.appendChild(usernameDateElement);
    }

    let contentElement = document.createElement('p');
    let contentText = document.createTextNode(chatMessage.content);
    contentElement.appendChild(contentText);
    chatMessageElement.appendChild(contentElement);

    messageArea.appendChild(chatMessageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function turnSoundOnOff() {
    soundOn = !soundOn;

    let speakerIcon = document.getElementById('speakerIcon');

    if (soundOn) {
        speakerIcon.classList.remove('fa-volume-xmark');
        speakerIcon.classList.add('fa-volume-high');
    } else {
        speakerIcon.classList.remove('fa-volume-high');
        speakerIcon.classList.add('fa-volume-xmark');
    }
}
