let usernameFormContainer = document.getElementById('usernameFormContainer');
usernameFormContainer.addEventListener('submit', connect, true);

function connect(event) {
    username = document.getElementById('usernameInput').value.trim();

    if (username) {
        usernameFormContainer.classList.add('hidden');
        chatPage.classList.remove('hidden');
    } else {
        validateUsernameForm();
    }

    event.preventDefault();
}
