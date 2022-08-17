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
                <div class="card" data-id="${card.id}" draggable="true">
                    <span contenteditable="false">${card.name}</span>
                    <div class="details">
                        <div class="actions">
                            <i class="edit-btn fa-solid fa-pencil"></i>
                            <i class="move-btn fa-solid fa-arrows-up-down-left-right"></i>
                            <i class="delete-btn fa-solid fa-xmark"></i>
                        </div>
                    </div>
                </div>
            `;
        });

        listsTemplate += `
            <div class="lane" data-id="${list.id}">
                <p>${list.name}</p>
                <div class="list" data-id="${list.id}">
                    ${cardsTemplate}
                </div>
                <button class="add-btn" data-id="${list.id}">Agregar una tarjeta</button>
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
            let elementCardId = parseInt(e.target.closest('.card').getAttribute('data-id'));
            editCard(elementCardId);
        }
        if (e.target?.classList.contains('delete-btn')) {
            let elementCardId = parseInt(e.target.closest('.card').getAttribute('data-id'));
            deleteCard(elementCardId);
        }
        if (e.target?.className === 'add-btn') {
            let elementListId = parseInt(e.target.getAttribute('data-id'));
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
let dropAfter; // boolean true --> insertar después, false --> insertar antes
const lanesElements = document.querySelectorAll('.lane');

function setDragAndDropEvents() {
    lanesElements.forEach(el => {
        el.addEventListener('dragstart', handleDragStart);
        el.addEventListener('dragend', handleDragEnd);
        el.addEventListener('dragover', handleDragOver);
        el.addEventListener('dragenter', handleDragEnter);
        el.addEventListener('drop', handleDrop);
    })
}

function handleDragStart(e) {
    if (e.target.classList.contains('card')) {
        dragSourceCard = e.target;
        dragSourceList = dragSourceCard.parentElement;
        dragSourceCard.classList.add('dragging');
    }
}

function handleDragEnd(e) {
    if (e.target.classList.contains('card')) {
        dragSourceCard.classList.remove('dragging');
        moveCard();
    }
}

function handleDragEnter(e) {
    if (e.target.classList.contains('list') && e.target.innerHTML.trim() === '') {
        dragTargetCard = null;
        dragTargetList = e.target;
        dragTargetList.appendChild(dragSourceCard);
    } else if (e.target.classList.contains('card') && !e.target.classList.contains('dragging')) {
        dragTargetCard = e.target;
        dragTargetList = dragTargetCard.parentElement;
    }
}

function handleDragOver(e) {
    if (e.target.classList.contains('card') && !e.target.classList.contains('dragging')) {
        const offset = e.y - dragSourceCard.getBoundingClientRect().top - (e.target.getBoundingClientRect().height / 2);

        if (offset >= 0) {
            dragTargetCard.parentNode.insertBefore(dragSourceCard, dragTargetCard.nextSibling);
            dropAfter = true;
        } else {
            dragTargetCard.parentNode.insertBefore(dragSourceCard, dragTargetCard);
            dropAfter = false;
        }
    }

    e.preventDefault?.();
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

    const laneElement = document.querySelector(`.lane[data-id="${listId}"]`);
    laneElement.innerHTML += `<button class="save-btn hidden">Guardar</button>`;

    const listElement = laneElement.querySelector('.list');
    listElement.innerHTML += `<div class="card" id="input" contenteditable="true"></div>`;

    const inputElement = listElement.querySelector('#input');
    inputElement.focus();

    const addButtonElement = laneElement.querySelector('.add-btn');
    const saveButtonElement = laneElement.querySelector('.save-btn');

    function saveCard() {
        if (inputElement.textContent.trim().length > 0) {
            const cardName = inputElement.textContent;
            idCount++;

            const html = `
                <div class="card" data-id="${idCount}" draggable="true">
                    <span contenteditable="false">${cardName}</span>
                    <div class="details">
                        <div class="actions">
                            <i class="edit-btn fa-solid fa-pencil"></i>
                            <i class="move-btn fa-solid fa-arrows-up-down-left-right"></i>
                            <i class="delete-btn fa-solid fa-xmark"></i>
                        </div>
                    </div>
                </div>
            `;

            const template = document.createElement('template');
            template.innerHTML = html.trim();
            const cardElement = template.content.firstElementChild;

            listElement.appendChild(cardElement);
            list.cards.push({id: idCount, name: cardName, listId: list.id});

            setLocalStorage();

            Swal.fire({
                icon: 'success',
                title: `Tarjeta <b>${cardName}</b> agregada exitosamente`,
                position: 'top',
                width: '450px',
                customClass: {
                    title: 'swal2-title-custom',
                }
            });

            console.log('Nuevo array > ', userLists)
        }
    }

    inputElement.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita propagar 'enter' a SweetAlert
            saveCard();
            inputElement.blur();
        }

        if (e.key === 'Escape') {
            inputElement.blur();
        }

        if (((/^.$/u).test(e.key) || e.key === 'Dead') && e.key !== ' ' && inputElement.textContent.trim().length === 0) {
            addButtonElement.classList.add('hidden');
            saveButtonElement.classList.remove('hidden');
        }

        if ((e.key === 'Backspace' || e.key === 'Delete') && inputElement.textContent.trim().length === 1) {
            addButtonElement.classList.remove('hidden');
            saveButtonElement.classList.add('hidden');
        }
    });

    inputElement.addEventListener('focusout', e => {
        if (e.relatedTarget === saveButtonElement) {
            setTimeout(() => {
            }, 50)
        } else {
            inputElement.remove();
            saveButtonElement.remove();
            addButtonElement.classList.remove('hidden');
        }
    });

    saveButtonElement.addEventListener('click', e => {
        saveCard();
        inputElement.remove();
        saveButtonElement.remove();
        addButtonElement.classList.remove('hidden');
    })
}

/* Funcionalidad para editar Tarjeta */
function editCard(cardId) {
    const card = getCard(cardId);
    const list = getList(card.listId);

    const laneElement = document.querySelector(`.lane[data-id="${list.id}"]`);
    laneElement.innerHTML += `<button class="save-btn hidden">Guardar</button>`;

    const cardElement = laneElement.querySelector(`.card[data-id="${cardId}"]`);
    const spanElement = cardElement.querySelector('span');

    spanElement.setAttribute('contenteditable', 'true');
    setCursorPositionAtEnd(spanElement);

    const addButtonElement = laneElement.querySelector('.add-btn');
    const saveButtonElement = laneElement.querySelector('.save-btn');

    function saveCard() {
        if (spanElement.textContent.trim().length > 0 && spanElement.textContent !== card.name) {
            card.name = spanElement.textContent;

            setLocalStorage();

            Swal.fire({
                icon: 'success',
                title: `Tarjeta <b>${card.name}</b> actualizada exitosamente`,
                showConfirmButton: true,
                position: 'top',
                width: '450px',
                customClass: {
                    title: 'swal2-title-custom',
                }
            });

            console.log('Nuevo array > ', userLists)
        }
    }

    spanElement.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita propagar 'enter' a SweetAlert
            saveCard();
            spanElement.blur();
        }

        if (e.key === 'Escape') {
            spanElement.blur();
        }

        if (((/^.$/u).test(e.key) || e.key === 'Dead' || e.key === ' ' || e.key === 'Backspace' || e.key === 'Delete')) {
            setTimeout(() => {
                if (spanElement.textContent !== card.name && spanElement.textContent.trim().length > 0) {
                    addButtonElement.classList.add('hidden');
                    saveButtonElement.classList.remove('hidden');
                } else {
                    addButtonElement.classList.remove('hidden');
                    saveButtonElement.classList.add('hidden');
                }
            }, 50)
        }
    });

    spanElement.addEventListener('focusout', e => {
        if (e.relatedTarget === saveButtonElement) {
            setTimeout(() => {
            }, 50)
        } else {
            spanElement.setAttribute('contenteditable', 'false');
            spanElement.textContent = card.name;
            saveButtonElement.remove();
            addButtonElement.classList.remove('hidden');
        }
    });

    saveButtonElement.addEventListener('click', e => {
        saveCard();
        spanElement.setAttribute('contenteditable', 'false');
        spanElement.textContent = card.name;
        saveButtonElement.remove();
        addButtonElement.classList.remove('hidden');
    })
}

/* Funcionalidad para mover Tarjeta */
function moveCard() {
    const card = getCard(parseInt(dragSourceCard.getAttribute('data-id')));
    const oldList = getList(card.listId);
    const newList = getList(parseInt(dragTargetList.getAttribute('data-id')));
    let targetCard;

    card.listId = newList.id;
    oldList.cards = oldList.cards.filter(obj => obj.id !== card.id);

    if (dragTargetCard) {
        targetCard = getCard(parseInt(dragTargetCard.getAttribute('data-id')));
        let i = newList.cards.findIndex(obj => obj.id === targetCard.id);

        if (dropAfter) {
            newList.cards.splice(i + 1, 0, card);
        } else {
            newList.cards.splice(i, 0, card);
        }

    } else {
        newList.cards.push(card);
    }

    setLocalStorage();

    console.log('Nuevo array > ', userLists)
}

/* Funcionalidad para eliminar Tarjeta */
function deleteCard(cardId) {
    const card = getCard(cardId);
    const list = getList(card.listId);
    const cardElement = document.querySelector(`.card[data-id="${cardId}"]`);

    Swal.fire({
        title: `¿Estás seguro que deseas borrar la tarjeta <b>${card.name}</b>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        position: 'top',
        width: '450px',
        customClass: {
            title: 'swal2-title-custom',
        }
    }).then((result) => {
        if (result.isConfirmed) {
            cardElement.remove();
            list.cards = list.cards.filter(obj => obj.id !== card.id);

            setLocalStorage();

            Swal.fire({
                icon: 'success',
                title: `Tarjeta <b>${card.name}</b> eliminada exitosamente`,
                position: 'top',
                width: '450px',
                customClass: {
                    title: 'swal2-title-custom',
                }
            });

            console.log('Nuevo array > ', userLists)
        }
    })
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
    if (getAllUserCards().length === 0) return;

    Swal.fire({
        title: '¿Estás seguro de borrar todas las tarjetas?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        position: 'top',
        width: '450px',
        customClass: {
            title: 'swal2-title-custom',
        }
    }).then((result) => {
        if (result.isConfirmed) {
            userLists.forEach(list => {
                list.cards = [];
            });

            idCount = 0;
            localStorage.clear();
            showLists();

            Swal.fire({
                icon: 'success',
                title: 'Se han eliminado todas las tarjetas',
                position: 'top',
                width: '450px',
                customClass: {
                    title: 'swal2-title-custom',
                }
            });

            console.log('Nuevo array > ', userLists)
        }
    })
}