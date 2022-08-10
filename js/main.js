/* Listas y tarjetas del usuario */
const defaultUserLists = [{
    id: 1, name: 'Lista de tareas', cards: []
}, {
    id: 2, name: 'En proceso', cards: []
}, {
    id: 3, name: 'Hecho', cards: []
},];

/* Seteo de LocalStorage */
const userLists = JSON.parse(localStorage.getItem('Lists')) ?? defaultUserLists;
let idCount = JSON.parse(localStorage.getItem('ID counter')) ?? 0;

function setLocalStorage() {
    localStorage.setItem('Lists', JSON.stringify(userLists));
    localStorage.setItem('ID counter', JSON.stringify(idCount));
}

const listsElement = document.querySelector('#lanes');

/* Genera HTML en base al arreglo userLists */
function showLists() {
    let listsTemplate = ``;

    userLists.forEach(list => {
        let cardsTemplate = ``;

        list.cards.forEach(card => {
            cardsTemplate += `
                <li data-id="${card.id}" draggable="true">
                    <span contenteditable="false">${card.name}</span>
                    <div>
                        <i class="edit-btn fa-solid fa-pencil"></i>
                        <i class="move-btn fa-solid fa-arrows-up-down-left-right"></i>
                        <i class="delete-btn fa-solid fa-xmark"></i>
                    </div>
                </li>
            `;
        });

        listsTemplate += `
            <div class="lane">
                <p>${list.name}</p>
                <ul class="list" data-id="${list.id}">
                    ${cardsTemplate}
                </ul>
                <button class="add-btn">Agregar una tarjeta</button>
            </div>
        `;
    });

    listsElement.innerHTML = listsTemplate;
}

showLists();

/* Se agregan Event Listener para funcionalidades Agregar, Editar y Eliminar tarjeta */
function setCardEvents() {
    listsElement.addEventListener('click', (e) => {
        if (e.target?.classList.contains('edit-btn')) {
            let elementCardId = parseInt(e.target.closest('li').getAttribute('data-id'));
            editCard(elementCardId);
        }
        if (e.target?.classList.contains('delete-btn')) {
            let elementCardId = parseInt(e.target.closest('li').getAttribute('data-id'));
            deleteCard(elementCardId);
        }
        if (e.target?.className === 'add-btn') {
            let elementListId = parseInt(e.target.closest('.lane').querySelector('.list').getAttribute('data-id'));
            addCard(elementListId);
        }
    });
}

setCardEvents();

/* Funcionalidad Drag & Drop */
// TODO revisar caso en que se dropea en contenedor no habilitado
let dragSourceCard;
let dragSourceList;
let dragTargetCard;
let dragTargetList;

function setDragAndDropEvents() {
    listsElement.addEventListener('dragstart', handleDragStart);
    listsElement.addEventListener('dragend', handleDragEnd);
    listsElement.addEventListener('dragover', handleDragOver);
    listsElement.addEventListener('dragenter', handleDragEnter);
    listsElement.addEventListener('drop', handleDrop);
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
        dragSourceCard.removeAttribute('class');
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
    e.preventDefault?.();
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

/* Funcionalidad para agregar Tarjeta */
function addCard(listId) {
    const list = getList(listId);
    const listElement = document.querySelector(`ul[data-id="${list.id}"]`);

    listElement.innerHTML += `<li id="input" contenteditable="true"></li>`;

    const inputElement = document.querySelector('#input');
    inputElement.focus();

    function saveCard() {
        if (inputElement.textContent.trim().length > 0) {
            const cardName = inputElement.textContent;
            idCount++;

            const html = `
                <li data-id="${idCount}" draggable="true">
                    <span contenteditable="false">${cardName}</span>
                    <div>
                        <i class="edit-btn fa-solid fa-pencil"></i>
                        <i class="move-btn fa-solid fa-arrows-up-down-left-right"></i>
                        <i class="delete-btn fa-solid fa-xmark"></i>
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

            setLocalStorage();
        }
    }

    inputElement.addEventListener('focusout', inputElement.remove);

    inputElement.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            saveCard();
            inputElement.blur();
        }

        if (e.key === 'Escape') {
            inputElement.blur();
        }
    });
}

/* Funcionalidad para editar Tarjeta */
function editCard(cardId) {
    const card = getCard(cardId);
    const cardElement = document.querySelector(`li[data-id="${cardId}"]`);
    const spanElement = cardElement.querySelector('span');

    spanElement.setAttribute('contenteditable', 'true');
    setCursorPositionAtEnd(spanElement);

    function saveCard() {
        if (spanElement.textContent.trim().length > 0 && spanElement.textContent !== card.name) {
            card.name = spanElement.textContent;

            console.log(`Tarjeta "${card.name}" actualizada exitosamente`)
            console.log('Nuevo array > ', userLists)

            setLocalStorage();
        }
    }

    spanElement.addEventListener('focusout', () => {
        spanElement.setAttribute('contenteditable', 'false');
        spanElement.textContent = card.name;
    });

    spanElement.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            saveCard();
            spanElement.blur();
        }

        if (e.key === 'Escape') {
            spanElement.blur();
        }
    });
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
        let i = newList.cards.findIndex(obj => obj.id === afterCard.id);
        newList.cards.splice(i + 1, 0, card);
    } else {
        newList.cards.push(card);
    }

    console.log(`Tarjeta "${card.name}" movida exitosamente`)
    console.log('Nuevo array > ', userLists)

    setLocalStorage();
}

/* Funcionalidad para eliminar Tarjeta */
function deleteCard(cardId) {
    const card = getCard(cardId);
    const list = getList(card.listId);
    const cardElement = document.querySelector(`li[data-id="${cardId}"]`);
    const confirmation = window.confirm(`¿Estás seguro que deseas borrar la tarjeta "${card.name}"?`);

    if (confirmation) {
        cardElement.remove();
        list.cards = list.cards.filter(obj => obj.id !== card.id);

        console.log(`Tarjeta "${card.name}" eliminada exitosamente`)
        console.log('Nuevo array > ', userLists)

        setLocalStorage();
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

/* Funcionalidad para eliminar todas las tarjetas */
const deleteAllBtnElement = document.querySelector('.delete-all-btn');
deleteAllBtnElement.addEventListener('click', deleteAllCards);

function deleteAllCards() {
    const confirmation = window.confirm('¿Estás seguro que deseas borrar todas las tarjetas?');
    if (confirmation) {
        userLists.forEach(list => {
            list.cards = [];
        });

        idCount = 0;
        localStorage.clear();
        showLists();
    }
}