const userLists = [
    {
        id: 1,
        name: 'Lista de tareas',
        cards: [
            {id: 1, name: 'Tarea 1', listId: 1},
            {id: 2, name: 'Tarea 2', listId: 1},
        ]
    },
    {
        id: 2,
        name: 'En proceso',
        cards: [
            {id: 3, name: 'Tarea 3', listId: 2},
        ]
    },
    {
        id: 3,
        name: 'Hecho',
        cards: []
    },
];

let idCount = userLists.map(obj => obj.cards).flat().length; // revisar

const listsElement = document.querySelector('#lists');
showLists();
setEvents();

function showLists() {
    let listsTemplate = ``;

    userLists.forEach(list => {
        let cardsTemplate = ``;

        list.cards.forEach(card => {
            cardsTemplate += `
                    <li id="card${card.id}">
                        <span data-id="${card.id}">${card.name}</span>
                        <i class="edit-btn fa-solid fa-pencil" data-id="${card.id}"></i>
                        <i class="delete-btn fa-solid fa-xmark" data-id="${card.id}"></i>
                    </li>
                `;
        })

        listsTemplate += `
            <div class="list">
                <p>${list.name}</p>
                    <ul id="list${list.id}">
                    ${cardsTemplate}
                    </ul>
                <button class="add-btn" data-id="${list.id}">Agregar una tarjeta</button>
            </div>
        `;
    })

    listsElement.innerHTML = listsTemplate;
}

function setEvents() {
    listsElement.addEventListener('click', (e) => {
        if (e.target) {
            if (e.target.tagName === 'SPAN') {
                moveCard(parseInt(e.target.getAttribute('data-id')));
            }
            if (e.target.classList.contains('edit-btn')) {
                editCard(parseInt(e.target.getAttribute('data-id')));
            }
            if (e.target.classList.contains('delete-btn')) {
                deleteCard(parseInt(e.target.getAttribute('data-id')));
            }
            if (e.target.className === 'add-btn') {
                addCard(parseInt(e.target.getAttribute('data-id')))
            }
        }
    })
}

function validateCard(cardName, list) {
    if (!cardName) return false;

    if (cardName.trim().length === 0) {
        alert('El nombre no puede ser vacío, intenta nuevamente');
        return false;
    }

    return validateSameName(cardName, list);
}

function validateSameName(cardName, list) {
    if (list.cards.some(obj => (obj.name.toLowerCase() === cardName.toLowerCase() && obj.listId === list.id))) {
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
                <span data-id=${idCount}">${cardName}</span>
                <i class="edit-btn fa-solid fa-pencil" data-id=${idCount}"></i>
                <i class="delete-btn fa-solid fa-xmark" data-id=${idCount}"></i>
            </li>
        `;

        const template = document.createElement('template');
        template.innerHTML = html.trim();
        const cardElement = template.content.firstElementChild;
        listElement.appendChild(cardElement);

        list.cards.push({id: idCount, name: cardName, listId: list.id});

        console.log(`Tarjeta "${cardName}" agregada exitosamente`)
        console.log('Nuevo array > ', userLists)
    }
}

function moveCard(cardId) {
    const newListId = parseInt(prompt('¿A qué lista deseas mover la tarea? Ingresa un número 1: "Lista de tareas", 2: "En proceso", 3: "Hecho"'));
    const userCards = userLists.map(obj => obj.cards).flat(); // revisar
    const card = userCards.find(obj => obj.id === cardId);
    const oldList = userLists.find(obj => obj.id === card.listId);
    const newList = userLists.find(obj => obj.id === newListId);

    if (card.listId !== newListId && newListId > 0 && newListId <= 3) {
        if (validateSameName(card.name, newList)) {
            const cardElement = document.querySelector('#card' + card.id);
            cardElement.remove();
            const newListElement = document.querySelector('#list' + newListId);
            newListElement.appendChild(cardElement);

            card.listId = newListId;
            oldList.cards = oldList.cards.filter(obj => obj.id !== card.id);
            newList.cards.push(card);

            console.log(`Tarjeta "${card.name}" movida exitosamente`)
            console.log('Nuevo array > ', userLists)
        }

    } else if (card.listId === newListId) {
        alert('La tarea ya pertenece a esa lista');
    } else {
        alert('Ingrese una opción válida');
    }
}

function deleteCard(cardId) {
    const userCards = userLists.map(obj => obj.cards).flat(); // revisar
    const card = userCards.find(obj => obj.id === cardId);
    const list = userLists.find(obj => obj.id === card.listId);
    const cardElement = document.querySelector('#card' + cardId);
    const confirmation = parseInt(prompt(`¿Estás seguro de querer borrar la tarjeta "${card.name}"? Ingresa 1 para confirmar`));

    if (confirmation === 1) {
        cardElement.remove();
        list.cards = list.cards.filter(obj => obj.id !== card.id);

        console.log(`Tarjeta "${card.name}" eliminada exitosamente`)
        console.log('Nuevo array > ', userLists)
    }
}

function editCard(cardId) {
    const userCards = userLists.map(obj => obj.cards).flat(); // revisar
    const card = userCards.find(obj => obj.id === cardId);
    const list = userLists.find(obj => obj.id === card.listId);
    const newName = prompt('Ingresa la nueva información de la tarjeta');

    if (validateCard(newName, list)) {
        const cardElement = document.querySelector('#card' + cardId);
        cardElement.querySelector('span').textContent = newName;
        card.name = newName;

        console.log(`Tarjeta "${card.name}" actualizada exitosamente`)
        console.log('Nuevo array > ', userLists)
    }
}