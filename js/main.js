const userList = ['Tarea Ejemplo']

function validateCard(card) {
    if (!card) return false;

    if (card.trim().length === 0) {
        alert('El nombre no puede ser vacío, intenta nuevamente');
        return false;
    }

    for (let i = 0; i < userList.length; i++) {
        if (userList[i].toLowerCase() === card.toLowerCase()) {
            alert('Ya existe una tarjeta con ese nombre');
            return false;
        }
    }

    return true;
}

function addCard(listId) {
    const cardName = prompt('Ingresa el nombre de la tarjeta');
    const isValid = validateCard(cardName);

    if (isValid) {
        const listElement = document.getElementById(listId);
        const card = document.createElement('li');
        card.appendChild(document.createTextNode(cardName));
        listElement.appendChild(card);
        userList.push(cardName);
    }
}