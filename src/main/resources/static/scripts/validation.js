function validateUsernameForm() {
    const usernameValue = document.usernameForm.usernameInput.value.trim();
    return checkIfNotEmpty('usernameInput', usernameValue);
}

function checkIfNotEmpty(fieldName, fieldValue) {
    if (!fieldValue) {
        document.getElementById(`${fieldName}`).className='form-control is-invalid';
        if (document.getElementById(`${fieldName}ErrorMessage`).style.display === 'none') { // check if error message is not displaying
            document.getElementById(`${fieldName}ErrorMessage`).style.display = ''; // display error message
            document.getElementById(`${fieldName}`).value = '';
        }

        return false;
    }

    document.getElementById(`${fieldName}`).className='form-control';
    if (document.getElementById(`${fieldName}ErrorMessage`).style.display === '') {
        document.getElementById(`${fieldName}ErrorMessage`).style.display = 'none';
    }

    return true;
}
