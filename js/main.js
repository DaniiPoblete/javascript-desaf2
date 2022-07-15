const userList = [
    {id: 1, name: 'Tarea Ejemplo', listId: 1}
]

function validateCard(cardName, list) {
    if (!cardName) return false;

    if (cardName.trim().length === 0) {
        alert('El nombre no puede ser vacío, intenta nuevamente');
        return false;
    }

    if (userList.some(el => (el.name.toLowerCase() === cardName.toLowerCase() && el.listId === list.id))) {
        alert(`Ya existe una tarjeta con ese nombre en la lista "${list.name}"`);
        return false;
    }

    return true;
}

function addCard(list) {
    const cardName = prompt('Ingresa el nombre de la tarjeta');
    const isValid = validateCard(cardName, list);

    if (isValid) {
        const listElement = document.getElementById('list'+ list.id);
        const card = document.createElement('li');
        card.appendChild(document.createTextNode(cardName));
        listElement.appendChild(card);
        userList.push({id: userList.length +1, name: cardName, listId: list.id});

        console.log(userList);
    }
}