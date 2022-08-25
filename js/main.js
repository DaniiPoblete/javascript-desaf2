const uid = () => {
	return Date.now();
};

const emptyState = `
	<lottie-player src="https://assets2.lottiefiles.com/packages/lf20_kgbbisxb.json"
	               background="transparent" speed="1" style="width: 500px; height: 500px;" loop
	               autoplay></lottie-player>`;

const randomColors = ['#cec6d9', '#c7dbe7', '#cfe3ca', '#d2d5dd', '#eddfef', '#ece4db', '#dee2ff'];

function getRandomColor() {
	return randomColors[Math.floor(Math.random() * randomColors.length)];
}

/* Listas y tarjetas del usuario */
const defaultUserLists = [{
	id: uid(), name: 'Lista de tareas', color: '#cec6d9', cards: []
}, {
	id: uid() - 1, name: 'En proceso', color: '#c7dbe7', cards: []
}, {
	id: uid() - 2, name: 'Hecho', color: '#cfe3ca', cards: []
}];

/* Seteo de LocalStorage */
let userLists = JSON.parse(localStorage.getItem('Lists')) ?? defaultUserLists.map(a => {
	return {...a};
});

function setLocalStorage() {
	localStorage.setItem('Lists', JSON.stringify(userLists));
}

const listsElement = document.querySelector('#lanes');

/* Genera HTML en base al arreglo userLists */
function showLists() {
	let listsTemplate = ``;

	if (userLists.length === 0) {
		listsElement.innerHTML = emptyState;
		return;
	}

	userLists.forEach(list => {
		let cardsTemplate = ``;

		list.cards.forEach(card => {
			const tooltipText = card.assignedUser ? card.assignedUser.name.first + ' ' + card.assignedUser.name.last : 'Asignar usuario';

			cardsTemplate += `
				<div class="card" data-id="${card.id}" draggable="true">
					<span contenteditable="false">${card.name}</span>
					<div class="details">
						<div class="actions">
							<i class="edit-card-btn fa-solid fa-pencil"></i>
							<i class="delete-card-btn fa-solid fa-xmark"></i>
						</div>
						<div class="user tooltip">
							<img src="${card.assignedUser?.picture.medium || 'resources/images/user.png'}" alt="">
							<span class="tooltiptext">${tooltipText}</span>
						</div>
					</div>
				</div>
			`;
		});

		listsTemplate += `
			<div class="lane" data-id="${list.id}" style="background: ${list.color}">
				<div class="details">
					<div class="title">
						<input class="color-picker" type="color" value="${list.color}">
						<p class="name">${list.name}</p>
					</div>
					<div class="actions">
						<i class="edit-list-btn fa-solid fa-pencil"></i>
						<i class="delete-list-btn fa-solid fa-xmark"></i>
					</div>
				</div>
				<div class="list" data-id="${list.id}">
					${cardsTemplate}
				</div>
				<button class="add-card-btn" data-id="${list.id}">Agregar una tarjeta</button>
			</div>
		`;
	});

	listsElement.innerHTML = listsTemplate;
}

showLists();

/* Se agregan Event Listener para funcionalidades Agregar, Editar y Eliminar tarjeta */
function setCardEvents() {
	listsElement.addEventListener('click', (e) => {
		if (e.target?.classList.contains('edit-card-btn')) {
			let elementCardId = parseInt(e.target.closest('.card').getAttribute('data-id'));
			editCard(elementCardId);
		}
		if (e.target?.classList.contains('delete-card-btn')) {
			let elementCardId = parseInt(e.target.closest('.card').getAttribute('data-id'));
			deleteCard(elementCardId);
		}
		if (e.target?.className === 'add-card-btn') {
			let elementListId = parseInt(e.target.getAttribute('data-id'));
			addCard(elementListId);
		}
		if (e.target?.tagName === 'IMG') {
			let elementCardId = parseInt(e.target.closest('.card').getAttribute('data-id'));
			setProfile(elementCardId);
		}
	});
}

setCardEvents();

/* Funcionalidad Drag & Drop */
let dragSourceCard = null;
let dragSourceList = null;
let dragTargetCard = null;
let dragTargetList = null;
let dropAfterFlag; // boolean true --> insertar después, false --> insertar antes

let availableContainerFlag = false;
let nextSibling = null;

let lanesElements = document.querySelectorAll('.lane');

function setDragAndDropEvents() {
	lanesElements.forEach(el => {
		el.addEventListener('dragstart', handleDragStart);
		el.addEventListener('dragend', handleDragEnd);
		el.addEventListener('dragover', handleDragOver);
		el.addEventListener('dragenter', handleDragEnter);
		el.addEventListener('drop', handleDrop);
	});
}

function handleDragStart(e) {
	availableContainerFlag = false;

	if (e.target.classList.contains('card')) {
		dragSourceCard = e.target;
		dragSourceList = dragSourceCard.parentElement;
		dragSourceCard.classList.add('dragging');
		dragTargetCard = dragSourceCard;

		nextSibling = dragSourceCard.nextSibling;

	} else { // Previene drag en img usuario
		e.preventDefault();
	}
}

function handleDragEnd() {
	dragSourceCard.classList.remove('dragging');

	// Termina evento drag en un contenedor no habilitado
	if (!availableContainerFlag) {
		// Existe un elemento después de la posición original
		if (nextSibling?.nextSibling) {
			dragSourceList.insertBefore(dragSourceCard, nextSibling);
		} else {
			dragSourceList.appendChild(dragSourceCard);
		}
	}

	dragSourceCard = null;
	dragSourceList = null;
	dragTargetCard = null;
	dragTargetList = null;
	nextSibling = null;
}

function handleDragEnter(e) {
	const target = e.target;
	dragTargetList = target.closest('.lane').querySelector('.list');

	// Sobre contenedor habilitado
	if (target.classList.contains('lane') || target.classList.contains('list') ||
		target.classList.contains('add-card-btn') || target.classList.contains('title')) {

		if (dragTargetList !== document.querySelector('.dragging').parentElement) {
			dragTargetList.appendChild(dragSourceCard);
			dragTargetCard = null;
		}
	}

	// Sobre otra tarjeta
	if (target.classList.contains('card') && !target.classList.contains('dragging')) {
		dragTargetCard = target;
	}
}

function handleDragOver(e) {
	e.preventDefault?.();

	if (e.target.classList.contains('card') && !e.target.classList.contains('dragging')) {
		const offset = e.y - dragSourceCard.getBoundingClientRect().top - (e.target.getBoundingClientRect().height / 2);

		if (offset >= 0) {
			dragTargetCard.parentNode.insertBefore(dragSourceCard, dragTargetCard.nextSibling);
			dropAfterFlag = true;
		} else {
			dragTargetCard.parentNode.insertBefore(dragSourceCard, dragTargetCard);
			dropAfterFlag = false;
		}
	}
}

function handleDrop() { // Se dispara cuando termina en contenedor habilitado
	if (dragSourceCard !== dragTargetCard) {
		availableContainerFlag = true;
		moveCard();
	} else {
		availableContainerFlag = false;
	}
}

setDragAndDropEvents();

/* Funcionalidad Color picker */
function setColorPickerEvents() {
	listsElement.addEventListener('input', watchColorPicker);
	listsElement.addEventListener('change', changeColorPicker);
}

function watchColorPicker(e) {
	if (e.target?.classList.contains('color-picker')) {
		e.target.closest('.lane').style.background = e.target.value;
	}
}

function changeColorPicker(e) {
	if (e.target?.classList.contains('color-picker')) {
		e.target.setAttribute('value', e.target.value);
		const listId = parseInt(e.target.closest('.lane').getAttribute('data-id'));
		const list = getList(listId);
		list.color = e.target.value;
		localStorage.setItem('Lists', JSON.stringify(userLists));
	}
}

setColorPickerEvents();

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
	laneElement.innerHTML += `<button class="save-card-btn hidden">Guardar</button>`;

	const listElement = laneElement.querySelector('.list');
	listElement.innerHTML += `<div id="input" contenteditable="true"></div>`;

	const inputElement = listElement.querySelector('#input');
	inputElement.focus();

	const addButtonElement = laneElement.querySelector('.add-card-btn');
	const saveButtonElement = laneElement.querySelector('.save-card-btn');

	function saveCard() {
		if (inputElement.textContent.trim().length > 0) {
			const card = {id: uid(), name: inputElement.textContent, listId: list.id};

			const html = `
				<div class="card" data-id="${card.id}" draggable="true">
					<span contenteditable="false">${card.name}</span>
					<div class="details">
						<div class="actions">
							<i class="edit-card-btn fa-solid fa-pencil"></i>
							<i class="delete-card-btn fa-solid fa-xmark"></i>
						</div>
						<div class="user tooltip">
							<img src="resources/images/user.png" alt="">
							<span class="tooltiptext">Asignar usuario</span>
						</div>
					</div>
				</div>
			`;

			const template = document.createElement('template');
			template.innerHTML = html.trim();
			const cardElement = template.content.firstElementChild;
			listElement.appendChild(cardElement);
			list.cards.push(card);

			setLocalStorage();
		}
	}

	inputElement.addEventListener('keydown', e => {
		if (e.key === 'Enter') {
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
			}, 50);
		} else {
			inputElement.remove();
			saveButtonElement.remove();
			addButtonElement.classList.remove('hidden');
		}
	});

	saveButtonElement.addEventListener('click', () => {
		saveCard();
		inputElement.remove();
		saveButtonElement.remove();
		addButtonElement.classList.remove('hidden');
	});
}

/* Funcionalidad para editar Tarjeta */
function editCard(cardId) {
	const card = getCard(cardId);
	const list = getList(card.listId);

	const laneElement = document.querySelector(`.lane[data-id="${list.id}"]`);
	laneElement.innerHTML += `<button class="save-card-btn hidden">Guardar</button>`;

	const cardElement = laneElement.querySelector(`.card[data-id="${cardId}"]`);
	const spanElement = cardElement.querySelector('span');

	spanElement.setAttribute('contenteditable', 'true');
	setCursorPositionAtEnd(spanElement);
	laneElement.scrollIntoView();

	const addButtonElement = laneElement.querySelector('.add-card-btn');
	const saveButtonElement = laneElement.querySelector('.save-card-btn');

	function saveCard() {
		if (spanElement.textContent.trim().length > 0 && spanElement.textContent !== card.name) {
			card.name = spanElement.textContent;

			setLocalStorage();
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
			}, 50);
		}
	});

	spanElement.addEventListener('focusout', e => {
		if (e.relatedTarget === saveButtonElement) {
			setTimeout(() => {
			}, 50);
		} else {
			spanElement.setAttribute('contenteditable', 'false');
			spanElement.textContent = card.name;
			saveButtonElement.remove();
			addButtonElement.classList.remove('hidden');
		}
	});

	saveButtonElement.addEventListener('click', () => {
		saveCard();
		spanElement.setAttribute('contenteditable', 'false');
		spanElement.textContent = card.name;
		saveButtonElement.remove();
		addButtonElement.classList.remove('hidden');
	});
}

/* Funcionalidad para mover Tarjeta */
function moveCard() {
	const card = getCard(parseInt(dragSourceCard.getAttribute('data-id')));
	const oldList = getList(card.listId);
	const newList = getList(parseInt(dragTargetList.getAttribute('data-id')));

	card.listId = newList.id;
	oldList.cards = oldList.cards.filter(obj => obj.id !== card.id);

	if (dragTargetCard) {
		const targetCard = getCard(parseInt(dragTargetCard.getAttribute('data-id')));
		let index = newList.cards.findIndex(obj => obj.id === targetCard.id);

		if (dropAfterFlag) {
			newList.cards.splice(index + 1, 0, card);
		} else {
			newList.cards.splice(index, 0, card);
		}

	} else {
		newList.cards.push(card);
	}

	setLocalStorage();
}

/* Funcionalidad para eliminar Tarjeta */
function deleteCard(cardId) {
	const card = getCard(cardId);
	const list = getList(card.listId);
	const cardElement = document.querySelector(`.card[data-id="${cardId}"]`);

	Swal.fire({
		title: `¿Estás seguro de que deseas borrar la tarjeta <b>${card.name}</b>?`,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Sí',
		cancelButtonText: 'No',
		position: 'top',
		width: '450px',
		customClass: {
			title: 'swal2-title-custom'
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
					title: 'swal2-title-custom'
				}
			});
		}
	});
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

/* Funcionalidad para eliminar todas las listas */
const deleteAllBtnElement = document.querySelector('.delete-all-btn');
deleteAllBtnElement.addEventListener('click', deleteAllLists);

function deleteAllLists() {
	if (userLists.length === 0) return;

	Swal.fire({
		title: '¿Estás seguro de borrar todas las listas y tarjetas?',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Sí',
		cancelButtonText: 'No',
		position: 'top',
		width: '450px',
		customClass: {
			title: 'swal2-title-custom'
		}
	}).then((result) => {
		if (result.isConfirmed) {
			listsElement.innerHTML = emptyState;
			userLists = [];
			setLocalStorage();

			Swal.fire({
				icon: 'success',
				title: 'Se han eliminado todas las listas y tarjetas',
				position: 'top',
				width: '450px',
				customClass: {
					title: 'swal2-title-custom'
				}
			});
		}
	});
}

/* Funcionalidad para asignar usuario a tarjeta */
let userProfiles = JSON.parse(localStorage.getItem('User Profiles')) ?? [];

async function getUsers() {
	const res = await fetch('https://randomuser.me/api/?results=9&nat=mx&inc=gender,name,picture');
	const data = await res.json();
	return data['results'];
}

if (userProfiles.length === 0) {
	getUsers()
		.then(res => {
			userProfiles = res;
			localStorage.setItem('User Profiles', JSON.stringify(userProfiles));
		})
		.catch(err => {
			console.log('Error API:', err);
		});
}

function setProfile(cardId) {
	let html = '<div class="profiles">';

	userProfiles.forEach((el, i) => {
		let {name, picture} = el;

		html += `
			<div class="profile" data-index="${i}">
				<img src="${picture['medium']}" alt="">
				<p>${name['first']} ${name['last']}</p>
			</div>
		`;
	});

	html += '</div>';

	Swal.fire({
		title: 'Asignar un usuario',
		html: html,
		position: 'top',
		showCancelButton: true,
		focusConfirm: false,
		confirmButtonText: 'Guardar',
		cancelButtonText: 'Cancelar',
		customClass: {
			title: 'swal2-title-custom'
		},
		preConfirm: () => {
			if (!selectedProfileIndex) {
				Swal.showValidationMessage('Selecciona un usuario');
			}
		}
	}).then(result => {
		if (result.isConfirmed) {
			let selectedProfile = userProfiles[selectedProfileIndex];

			const cardElement = document.querySelector(`.card[data-id="${cardId}"]`);
			const tooltipText = selectedProfile.name.first + ' ' + selectedProfile.name.last;

			const assignedUserElement = cardElement.querySelector('.user');
			assignedUserElement.classList.add('tooltip');
			assignedUserElement.innerHTML = `
				<img src="${selectedProfile.picture.medium}" alt="">
				<span class="tooltiptext">${tooltipText}</span>
			`;

			const card = getCard(cardId);
			card.assignedUser = selectedProfile;

			setLocalStorage();

			const title = selectedProfile.gender === 'female' ? `Usuaria <b>${tooltipText}</b> asignada exitosamente` : `Usuario <b>${tooltipText}</b> asignado exitosamente`;

			Swal.fire({
				icon: 'success',
				title: title,
				position: 'top',
				width: '450px',
				customClass: {
					title: 'swal2-title-custom'
				}
			});
		}
	});

	const profileElements = document.querySelectorAll('.profile');
	let selectedProfileIndex;
	const confirmBtnElement = document.querySelector('.swal2-confirm');

	profileElements.forEach(el => {
		el.addEventListener('click', e => {
			document.querySelector('.selected')?.classList.remove('selected');
			selectedProfileIndex = e.target.closest('.profile').getAttribute('data-index');
			e.target.closest('.profile').classList.add('selected');
			e.detail === 1 ? confirmBtnElement.focus() : confirmBtnElement.click();
		});
	});
}

/* Se agregan Event Listener para funcionalidades Editar y Eliminar lista */
function setListEvents() {
	listsElement.addEventListener('click', (e) => {
		if (e.target?.classList.contains('edit-list-btn')) {
			let elementListId = parseInt(e.target.closest('.lane').getAttribute('data-id'));
			editList(elementListId);
		}
		if (e.target?.classList.contains('delete-list-btn')) {
			let elementListId = parseInt(e.target.closest('.lane').getAttribute('data-id'));
			deleteList(elementListId);
		}
	});
}

setListEvents();

function editList(listId) {
	const list = getList(listId);
	const laneElement = document.querySelector(`.lane[data-id="${listId}"]`);
	laneElement.scrollIntoView();

	const nameElement = laneElement.querySelector('.name');
	nameElement.setAttribute('contenteditable', 'true');
	setCursorPositionAtEnd(nameElement);

	function saveList() {
		if (nameElement.textContent.trim().length > 0 && nameElement.textContent !== list.name) {
			list.name = nameElement.textContent;
			setLocalStorage();
		}
	}

	nameElement.addEventListener('keydown', e => {
		if (e.key === 'Enter') {
			saveList();
			nameElement.blur();
		}

		if (e.key === 'Escape') {
			nameElement.blur();
		}
	});

	nameElement.addEventListener('focusout', () => {
		nameElement.setAttribute('contenteditable', 'false');
		nameElement.textContent = list.name;
	});
}

function deleteList(listId) {
	const list = getList(listId);
	const laneElement = document.querySelector(`.lane[data-id="${listId}"]`);

	Swal.fire({
		title: `¿Estás seguro de que deseas borrar la lista <b>${list.name}</b>?`,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Sí',
		cancelButtonText: 'No',
		position: 'top',
		width: '450px',
		customClass: {
			title: 'swal2-title-custom'
		}
	}).then((result) => {
		if (result.isConfirmed) {
			laneElement.remove();
			userLists = userLists.filter(obj => obj.id !== list.id);

			if (userLists.length === 0) {
				listsElement.innerHTML = emptyState;
			}

			setLocalStorage();

			Swal.fire({
				icon: 'success',
				title: `Lista <b>${list.name}</b> eliminada exitosamente`,
				position: 'top',
				width: '450px',
				customClass: {
					title: 'swal2-title-custom'
				}
			});
		}
	});
}

/* Funcionalidad para agregar lista */
const addListBtnElement = document.querySelector('.add-list-btn');
addListBtnElement.addEventListener('click', addList);

function addList() {
	if (userLists.length === 0) {
		listsElement.innerHTML = '';
	}

	const list = {id: uid(), name: 'Nueva lista', color: getRandomColor(), cards: []};

	let newLaneTemplate = `
		<div class="lane" data-id="${list.id}" style="background: ${list.color}">
			<div class="details">
				<div class="title">
					<input class="color-picker" type="color" value="${list.color}">
					<p class="name">${list.name}</p>
				</div>
				<div class="actions">
					<i class="edit-list-btn fa-solid fa-pencil"></i>
					<i class="delete-list-btn fa-solid fa-xmark"></i>
				</div>
			</div>
			<div class="list" data-id="${list.id}">
			</div>
			<button class="add-card-btn" data-id="${list.id}">Agregar una tarjeta</button>
		</div>
	`;

	listsElement.innerHTML += newLaneTemplate;
	userLists.push(list);
	setLocalStorage();

	lanesElements = document.querySelectorAll('.lane');
	setDragAndDropEvents();

	editList(list.id);
}