let usernameFormContainer = document.getElementById('usernameFormContainer');
usernameFormContainer.addEventListener('submit', connect, true);
let chatPage = document.getElementById('chatPage');
let messageArea = document.getElementById('messageArea');
let messagesSpinner = document.getElementById('messagesSpinner');
let messageForm = document.getElementById('messageForm');
messageForm.addEventListener('submit', sendMessage, true);
let messageInput = document.getElementById('messageInput');
messageInput.addEventListener('keyup', startTyping, true);
let usersArea = document.getElementById('usersArea');
let usersSpinner = document.getElementById('usersSpinner');
let disconnectForm = document.getElementById('disconnectForm');
disconnectForm.addEventListener('submit', disconnect, true);

var socket = null;
let client = null;
let sessionId = '';
let username = '';
let messageSound = new Audio('/sounds/message.wav');
let soundOn = true;
let numberOfOnlineUsers = 0;
let timeoutId;

function connect(event) {
    username = document.getElementById('usernameInput').value.trim();

    if (username) {
        usernameFormContainer.classList.add('hidden');
        chatPage.classList.remove('hidden');
        socket = new SockJS('/ws');
        client = Stomp.over(socket);
        client.connect({ username: username }, onConnected, onError);
    } else {
        validateUsernameForm();
    }

    event.preventDefault();
}

function onConnected() {
    var urlArray = socket._transport.url.split('/');
    var index = urlArray.length - 2;
    sessionId = urlArray[index];

    client.subscribe('/app/topic/public.previousMessages', getPreviousMessages);

    client.subscribe('/app/topic/public.onlineUsers', getOnlineUsers);

    client.subscribe('/topic/public', onMessageReceived);
    let chatMessage = {
        sender: 'Server',
        content: username + ' has joined!',
        type: 'JOIN'
    }
    client.send('/app/ws', {}, JSON.stringify(chatMessage));

    client.subscribe('/topic/public.deleteOldestMessage', deleteOldestMessage);

    client.subscribe('/topic/public.addUser', addUser);

    client.subscribe('/topic/public.deleteUser', deleteUser);

    client.subscribe('/topic/public.typing', onTyping);

    messagesSpinner.classList.add('hidden');
    usersSpinner.classList.add('hidden');
}

function onError(error) {
    $('#connectionErrorModal').modal('show');

    while (messageArea.firstChild) {
        messageArea.removeChild(messageArea.firstChild);
    }
    while (usersArea.firstChild) {
        usersArea.removeChild(usersArea.firstChild);
    }

    messagesSpinner.classList.remove('hidden');
    usersSpinner.classList.remove('hidden');
}

function sendMessage(event) {
    clearTimeout(timeoutId);
    stopTyping();
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

function getPreviousMessages(response) {
    const chatMessages = JSON.parse(response.body);

    for (const chatMessage of chatMessages) {
        createMessage(chatMessage);
    }
}

function deleteOldestMessage(response) {
    let message = document.getElementById(response.body);
    message.remove();
}

function getOnlineUsers(response) {
    let onlineUsers = new Map(Object.entries(JSON.parse(response.body)));

    numberOfOnlineUsers = onlineUsers.size;
    let usersHeader = document.getElementById('usersHeader');
    usersHeader.textContent = 'Users (' + numberOfOnlineUsers + ')';
    onlineUsers.forEach(createUserTab)
}

function addUser(response) {
    const newUser = JSON.parse(response.body);

    numberOfOnlineUsers++;
    let usersHeader = document.getElementById('usersHeader');
    usersHeader.textContent = 'Users (' + numberOfOnlineUsers + ')';
    createUserTab(newUser);
}

function deleteUser(response) {
    numberOfOnlineUsers--;
    let usersHeader = document.getElementById('usersHeader');
    usersHeader.textContent = 'Users (' + numberOfOnlineUsers + ')';
    document.getElementById(response.body).remove();
}

function createUserTab(user) {
    let userElement = document.createElement('li');
    userElement.id = user.sessionId;
    userElement.classList.add('user-tab');

    let usernameElement = document.createElement('span');
    usernameElement.classList.add('username');
    let usernameText = document.createTextNode(user.username);
    usernameElement.appendChild(usernameText);
    userElement.appendChild(usernameElement);

    let typingInfoElement = document.createElement('span');
    typingInfoElement.id = 'typing';
    typingInfoElement.classList.add('hidden');
    let typingText = document.createTextNode(' is typing a message...');
    typingInfoElement.appendChild(typingText);
    userElement.appendChild(typingInfoElement);

    usersArea.appendChild(userElement);
}

function startTyping(event) {
    if (event.key !== 'Enter') {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { stopTyping(); }, 2000);
        client.send("/topic/public.typing", {}, JSON.stringify({ sessionId: sessionId, typing: true }));
    }
}

function stopTyping() {
    client.send("/topic/public.typing", {}, JSON.stringify({ sessionId: sessionId, typing: false }));
}

function onTyping(response) {
    let typingResponse = JSON.parse(response.body);

    let userTab = document.getElementById(typingResponse.sessionId);
    if (typingResponse.typing) {
        userTab.lastElementChild.classList.remove('hidden');
    } else {
        userTab.lastElementChild.classList.add('hidden');
    }
}

function disconnect() {
    client.disconnect();
}
