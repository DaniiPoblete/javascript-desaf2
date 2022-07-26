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
        const listElement = document.querySelector('#list' + list.id);

        const html = `
            <li id="card${idCount}">
                <span onclick="moveCard(${idCount})">${cardName}</span>
                <button onclick="editCard(${idCount})"><i class="fa-solid fa-pencil"></i></button>
                <button onclick="deleteCard(${idCount})"><i class="fa-solid fa-xmark"></i></button>
            </li>
        `;

        const template = document.createElement('template');
        template.innerHTML = html.trim();
        const cardElement = template.content.firstElementChild;
        listElement.appendChild(cardElement);

        userCards.push({id: idCount, name: cardName, listId: list.id});

        console.log(`Tarjeta "${cardName}" agregada exitosamente`)
        console.log('Nuevo array > ', userCards)
    }
}

function moveCard(cardId) {
    const newListId = parseInt(prompt('¿A qué lista deseas mover la tarea? Ingresa un número 1: "Lista de tareas", 2: "En proceso", 3: "Hecho"'));
    const card = userCards.find(obj => obj.id === cardId);
    const list = userLists.find(obj => obj.id === newListId);

    if (card.listId !== newListId && newListId > 0 && newListId <= 3) {
        if (validateSameName(card.name, list)) {
            const cardElement = document.querySelector('#card' + card.id);
            cardElement.remove();
            const newListElement = document.querySelector('#list' + newListId);
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
    const cardElement = document.querySelector('#card' + cardId);

    const confirmation = parseInt(prompt(`¿Estás seguro de querer borrar la tarjeta "${card.name}"? Ingresa 1 para confirmar`));

    if (confirmation === 1) {
        cardElement.remove();
        userCards = userCards.filter(obj => obj.id !== card.id);

        console.log(`Tarjeta "${card.name}" eliminada exitosamente`)
        console.log('Nuevo array > ', userCards)
    }
}

function editCard(cardId) {
    const card = userCards.find(obj => obj.id === cardId);
    const list = userLists.find(obj => obj.id === card.listId);
    const newName = prompt('Ingresa la nueva información de la tarjeta');

    if (validateSameName(newName, list)) {
        const cardElement = document.querySelector('#card' + cardId);
        cardElement.querySelector('span').textContent = newName;
        card.name = newName;

        console.log(`Tarjeta "${card.name}" actualizada exitosamente`)
        console.log('Nuevo array > ', userCards)
    }
}