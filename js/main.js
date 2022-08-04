/* Listas y tarjetas del usuario */
const userLists = [
    {
        id: 1,
        name: 'Lista de tareas',
        cards: [
            {id: 1, name: 'Tarea 1', listId: 1},
        ]
    },
    {
        id: 2,
        name: 'En proceso',
        cards: [
            {id: 2, name: 'Tarea 2', listId: 2},
            {id: 3, name: 'Tarea 3', listId: 2},
            {id: 4, name: 'Tarea 4', listId: 2},
        ]
    },
    {
        id: 3,
        name: 'Hecho',
        cards: []
    },
];

const listsElement = document.querySelector('#lanes');


/* Genera HTML en base al arreglo userLists */
function showLists() {
    let listsTemplate = ``;

    userLists.forEach(list => {
        let cardsTemplate = ``;

        list.cards.forEach(card => {
            cardsTemplate += `
                    <li id="card${card.id}" data-id="${card.id}" draggable="true">
                        <span data-id="${card.id}" contenteditable="false">${card.name}</span>
                        <div>
                            <i class="edit-btn fa-solid fa-pencil" data-id="${card.id}"></i>
                            <i class="move-btn fa-solid fa-arrows-up-down-left-right" data-id=${card.id}"></i>
                            <i class="delete-btn fa-solid fa-xmark" data-id="${card.id}"></i>
                        </div>                  
                    </li>
                `;
        })

        listsTemplate += `
            <div class="lane">
                <p>${list.name}</p>
                    <ul class="list" id="list${list.id}" data-id="${list.id}">
                        ${cardsTemplate}
                    </ul>
                <button class="add-btn" data-id="${list.id}">Agregar una tarjeta</button>
            </div>
        `;
    })

    listsElement.innerHTML = listsTemplate;
}

showLists();

/* Se agregan Event Listener para funcionalidades Agregar, Editar y Eliminar tarjeta */
function setCardEvents() {
    listsElement.addEventListener('click', (e) => {
        if (e.target) {
            if (e.target.classList.contains('edit-btn')) {
                editCard(parseInt(e.target.getAttribute('data-id')));
            }
            if (e.target.classList.contains('delete-btn')) {
                deleteCard(parseInt(e.target.getAttribute('data-id')));
            }
            if (e.target.className === 'add-btn') {
                addCard(parseInt(e.target.getAttribute('data-id')));
            }
        }
    });
}

setCardEvents();

/* Funcionalidad Drag & Drop */
// TODO revisar caso en que se dropea en contenedor no habilitado

const ulElements = document.querySelectorAll('.lane');
let dragSourceCard;
let dragSourceList;
let dragTargetCard;
let dragTargetList;

function setDragAndDropEvents() {
    ulElements.forEach(el => {
        el.addEventListener('dragstart', handleDragStart);
        el.addEventListener('dragend', handleDragEnd);
        el.addEventListener('dragover', handleDragOver);
        el.addEventListener('dragenter', handleDragEnter);
        el.addEventListener('drop', handleDrop);
    })
}

function handleDragStart(e) {
    if (e.target.tagName === 'LI') {
        dragSourceCard = e.target;
        dragSourceList = dragSourceCard.parentElement;
        dragSourceCard.classList.add('dragging');
    }
}

function handleDragEnd(e) {
    if (e.target.tagName === 'LI') {
        dragSourceCard.classList.remove('dragging');
        moveCard();
    }
}

function handleDragEnter(e) {
    if (e.target.classList.contains('list')) { // sobre lista vacía
        dragTargetList = e.target;
        dragTargetCard = null;
        dragTargetList.appendChild(dragSourceCard);
    }

    if (e.target.tagName === 'LI' && !e.target.classList.contains('dragging')) { // sobre tarjeta
        dragTargetCard = e.target;
        dragTargetList = dragTargetCard.parentElement;
        dragTargetCard.parentNode.insertBefore(dragSourceCard, dragTargetCard.nextSibling);
        // TODO agregar funcionalidad para mover tarjeta sobre otra
    }
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    return false;
}

function handleDrop(e) {
    e.stopPropagation();

    return false;
}

setDragAndDropEvents();

/* Funciones de búsqueda (Listas y Tarjetas) */
function getAllUserCards() {
    return userLists.map(obj => obj.cards).flat();
}

function getCard(cardId) {
    const userCards = getAllUserCards();
    return userCards.find(obj => obj.id === cardId);
}

function getList(listId) {
    return userLists.find(obj => obj.id === listId);
}

let idCount = getAllUserCards().length;

/* Funcionalidad para agregar Tarjeta */
function addCard(listId) {
    const list = getList(listId);
    const listElement = document.querySelector('#list' + list.id);

    listElement.innerHTML += `<li id="input" contenteditable="true"></li>`;

    const inputElement = document.querySelector('#input');
    inputElement.focus();

    function saveCard() {
        if (inputElement.textContent.trim().length > 0) {
            const cardName = inputElement.textContent;
            idCount += 1;

            const html = `
                <li id="card${idCount}" data-id="${idCount}" draggable="true">
                    <span data-id=${idCount}" contenteditable="false">${cardName}</span>
                    <div>
                        <i class="edit-btn fa-solid fa-pencil" data-id=${idCount}"></i>
                        <i class="move-btn fa-solid fa-arrows-up-down-left-right" data-id=${idCount}"></i>
                        <i class="delete-btn fa-solid fa-xmark" data-id=${idCount}"></i>
                    </div>
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

    inputElement.addEventListener('focusout', e => {
        inputElement.remove();
    })

    inputElement.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            saveCard();
            inputElement.blur();
        }

        if (e.key === 'Escape') {
            inputElement.blur();
        }
    })
}

/* Funcionalidad para editar Tarjeta */
function editCard(cardId) {
    const card = getCard(cardId);
    const cardElement = document.querySelector('#card' + cardId);
    const spanElement = cardElement.querySelector('span');

    spanElement.setAttribute('contenteditable', 'true');
    setCursorPositionAtEnd(spanElement);

    function saveCard() {
        if (spanElement.textContent.trim().length > 0 && spanElement.textContent !== card.name) {
            card.name = spanElement.textContent;

            console.log(`Tarjeta "${card.name}" actualizada exitosamente`)
            console.log('Nuevo array > ', userLists)
        }
    }

    spanElement.addEventListener('focusout', e => {
        spanElement.setAttribute('contenteditable', 'false');
        spanElement.textContent = card.name;
    })

    spanElement.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            saveCard();
            spanElement.blur();
        }

        if (e.key === 'Escape') {
            spanElement.blur();
        }
    })
}

/* Funcionalidad para mover Tarjeta */
function moveCard() {
    const card = getCard(parseInt(dragSourceCard.getAttribute('data-id')));
    const oldList = getList(card.listId);
    const newList = getList(parseInt(dragTargetList.getAttribute('data-id')));
    let afterCard;

    card.listId = newList.id;
    oldList.cards = oldList.cards.filter(obj => obj.id !== card.id);

    if (dragTargetCard) {
        afterCard = getCard(parseInt(dragTargetCard.getAttribute('data-id')));
        let i = newList.cards.findIndex(obj => obj.id === afterCard.id)

        newList.cards.splice(i+1, 0, card);
    } else {
        newList.cards.push(card);
    }

    console.log(`Tarjeta "${card.name}" movida exitosamente`)
    console.log('Nuevo array > ', userLists)
}

/* Funcionalidad para eliminar Tarjeta */
function deleteCard(cardId) {
    const card = getCard(cardId);
    const list = getList(card.listId);
    const cardElement = document.querySelector('#card' + cardId);
    const confirmation = window.confirm(`¿Estás seguro que deseas borrar la tarjeta "${card.name}"?`);

    if (confirmation) {
        cardElement.remove();
        list.cards = list.cards.filter(obj => obj.id !== card.id);

        console.log(`Tarjeta "${card.name}" eliminada exitosamente`)
        console.log('Nuevo array > ', userLists)
    }
}

/* Funcionalidad para posicionar el cursor al final del texto editable */
function setCursorPositionAtEnd(element) {
    const selection = window.getSelection();
    const range = document.createRange();
    selection.removeAllRanges();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.addRange(range);
    element.focus();
}