const userLists = [
    {id: 1, name: 'Lista de tareas'},
    {id: 2, name: 'En proceso'},
    {id: 3, name: 'Hecho'},
];

let userCards = [
    {id: 1, name: 'Tarea 1', listId: 1},
    {id: 2, name: 'Tarea 2', listId: 1},
];

let idCount = userCards.length;

function validateCard(cardName, list) {
    if (!cardName) return false;

    if (cardName.trim().length === 0) {
        alert('El nombre no puede ser vacío, intenta nuevamente');
        return false;
    }

    return validateSameName(cardName, list);
}

function validateSameName(cardName, list) {
    if (userCards.some(obj => (obj.name.toLowerCase() === cardName.toLowerCase() && obj.listId === list.id))) {
        alert(`Ya existe una tarjeta con el mismo nombre en la lista "${list.name}"`);
        return false;
    }

    return true;
}

function addCard(listId) {
    const list = userLists.find(obj => obj.id === listId);
    const cardName = prompt('Ingresa el nombre de la tarjeta');
    const isValid = validateCard(cardName, list);

    if (isValid) {
        idCount += 1;
        const listElement = document.getElementById('list' + list.id);
        const cardElement = document.createElement('li');
        cardElement.setAttribute('id', 'card' + idCount);

        // Agrega span con funcionalidad mover
        const spanElement = document.createElement('span');
        spanElement.setAttribute('onclick', `moveCard(${idCount})`);
        spanElement.appendChild(document.createTextNode(cardName));

        // Agregar btn con funcionalidad borrar
        const buttonElement = document.createElement('button');
        buttonElement.appendChild(document.createTextNode('x'));
        buttonElement.setAttribute('onclick', `deleteCard(${idCount})`);

        cardElement.appendChild(spanElement);
        cardElement.appendChild(buttonElement);
        listElement.appendChild(cardElement);
        userCards.push({id: idCount, name: cardName, listId: list.id});
    }
}

function moveCard(cardId) {
    const newListId = parseInt(prompt('¿A qué lista deseas mover la tarea? Ingresa un número 1: "Lista de tareas", 2: "En proceso", 3: "Hecho"'));
    const card = userCards.find(obj => obj.id === cardId);
    const list = userLists.find(obj => obj.id === newListId);

    if (card.listId !== newListId && newListId > 0 && newListId <= 3) {
        if (validateSameName(card.name, list)) {
            const cardElement = document.getElementById('card' + card.id);
            cardElement.remove();
            const newListElement = document.getElementById('list' + newListId);
            newListElement.appendChild(cardElement);
            card.listId = newListId;

            console.log(`Tarjeta "${card.name}" movida exitosamente`)
            console.log('Nuevo array > ', userCards)
        }

    } else if (card.listId === newListId) {
        alert('La tarea ya pertenece a esa lista');
    } else {
        alert('Ingrese una opción válida');
    }
}

function deleteCard(cardId) {
    const card = userCards.find(obj => obj.id === cardId);
    const cardElement = document.getElementById('card' + cardId);

    const confirmation = parseInt(prompt(`¿Estás seguro de querer borrar la tarjeta "${card.name}"? Ingresa 1 para confirmar`));

    if (confirmation === 1) {
        cardElement.remove();
        userCards = userCards.filter(obj => obj.id !== card.id);

        console.log(`Tarjeta "${card.name}" eliminada exitosamente`)
        console.log('Nuevo array > ', userCards)
    }
}