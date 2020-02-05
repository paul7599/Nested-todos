var todos = [];
var id = 0;
var enterKey = 13;
var escapeKey = 27;
var todosUl = document.getElementById('todo-table');

$('#add-todos').on('keyup', create);
$('#todo-table').on('click', createNestedTodos);
$('#todo-table').on('click', toggle);
$('#todo-table').on('click', destroy);
$('#todo-table').on('dblclick', edit);
$('body').on('click', toggleAll);
$('body').on('click', destroyCompleted);

$('#todo-table').on('keyup', editKeyUp);
$(window).on('focusout', editKeyUp);

$('#todo-table').on('keyup', displayNestedTodos);
$(window).on('focusout', clickOutside);


// CREATE TODOS
function create(event) {
  if (event.which !== enterKey) {
    return;
  } else {
    var input = event.target;        
    var val = input.value.trim();
    var el = input.closest('li');
    
    if (!val) {
      return;
    }
    
    todos.push({
      value: val,
      completed: false,
      id: id++,
      nestedTodos: []
    });
    
    input.value = '';
    
    display(el, todos);
  } 
}


// CREATE NESTED TODOS
function createNestedTodos(event) {
  var elementClicked = event.target;
  if (elementClicked.className !== 'nested') {
    return;
  }
  
  var el = elementClicked.closest('li');  
  var nestedTodosInput = document.createElement('input');
  
  nestedTodosInput.classList.add('nested-todo-input');
  
  el.appendChild(nestedTodosInput);
  
  nestedTodosInput.focus(); 
}


// TOGGLE TODOS
function toggle(event) {
  var elementClicked = event.target;
  if (elementClicked.className !== 'toggle') {
    return;
  }
  
  var el = elementClicked.closest('li');
  var parentElement = el.parentNode.parentNode.firstChild;
  var goodTodo = getGoodTodo(el, todos);
  
  if (parentElement.tagName === 'INPUT') {
    var parentTodo = getGoodTodo(parentElement.closest('li'), todos);
  }
  
  if (goodTodo.completed === false) {
    goodTodo.completed = true;
    toggleNestedDown(el, goodTodo);
    if (parentElement.tagName === 'INPUT') {
      toggleNestedUp(parentElement, parentTodo);
    }    
  } else {
    goodTodo.completed = false;
    if (parentElement.tagName === 'INPUT') {
      toggleNestedUp(parentElement, parentTodo);
    }
  }
}


// TOGGLE ALL TODOS
function toggleAll(event) {
  var elementClicked = event.target;
  if (elementClicked.id !== 'toggle-all') {
    return;
  }
  
  var completedTodos = 0;
  window.completedTodos = completedTodos;
  var toggleArray = [];
  var toggleEl = document.querySelectorAll('.toggle');
  
  for (var i = 0; i < toggleEl.length; i++) {
    if (toggleEl[i].closest('ul').id === 'todo-table') {
      toggleArray.push(toggleEl[i]);
    }
  }

  for (var i = 0; i < todos.length; i++) {
    if (todos[i].completed === false) {
      todos[i].completed = true;
      toggleArray[i].checked = true;
    } else {
      window.completedTodos++;
    }
    toggleNestedDown(toggleArray[i].closest('li'), todos[i]);
  }  
    
  if (window.completedTodos === toggleEl.length) {
    for (var i = 0; i < todos.length; i++) {
      todos[i].completed = false;
      toggleArray[i].checked = false;      
      toggleNestedDown(toggleArray[i].closest('li'), todos[i]);
    }
  }
}


// AUTOMATICALLY TOGGLE NESTED TODOS DOWN THE TREE
function toggleNestedDown(element, goodTodo) {
  var todo = goodTodo.nestedTodos;
  
  if (goodTodo.completed === false) {
    for (var i = 0; i < todo.length; i++) {
      todo[i].completed = false;
      element.lastChild.children[i].firstChild.checked = false; // nested checkbox
      if (todo[i].nestedTodos.length > 0) {
        toggleNestedDown(element.lastChild.children[i], todo[i]);
      } 
    }  
  } else {
    for (var i = 0; i < todo.length; i++) {
      if (todo[i].completed === true) {
        window.completedTodos++;
      }
      todo[i].completed = true;
      element.lastChild.children[i].firstChild.checked = true; // nested checkbox
      if (todo[i].nestedTodos.length > 0) {
        toggleNestedDown(element.lastChild.children[i], todo[i]);
      } 
    }  
  }
}


// AUTOMATICALLY TOGGLE NESTED TODOS UP THE TREE
function toggleNestedUp(element, goodTodo) {
  if (goodTodo.nestedTodos.length === 0) {
    return;
  }
  
  var numberOfCompletedNested = 0;
  
  for (var i = 0; i < goodTodo.nestedTodos.length; i++) {
    if (goodTodo.nestedTodos[i].completed === true) {
      numberOfCompletedNested++;
    }
  }
  
  if (numberOfCompletedNested === goodTodo.nestedTodos.length) {
    goodTodo.completed = true; 
    element.checked = true;
    var parentElement = element.parentNode.parentNode.parentNode.firstChild;
    if (parentElement.tagName === 'INPUT') {
      toggleNestedUp(parentElement, getGoodTodo(parentElement.closest('li'), todos));
    }
  } else {
    goodTodo.completed = false; 
    element.checked = false;
    var parentElement = element.parentNode.parentNode.parentNode.firstChild;
    if (parentElement.tagName === 'INPUT') {
      toggleNestedUp(parentElement, getGoodTodo(parentElement.closest('li'), todos));
    } 
  }  
}


// DELETE TODOS
function destroy(event) {
  var elementClicked = event.target || event;
  if (elementClicked.className !== 'destroy') {
    return;
  }
  
  var el = elementClicked.closest('li');  
  var elementUl = el.closest('ul');
  
  if (elementUl.id === 'todo-table') {
    todos.splice(indexOfEl(el, todos), 1);
  } else {
    var elementLi = elementUl.closest('li');
    var goodTodo = getGoodTodo(elementLi, todos);
    goodTodo.nestedTodos.splice(indexOfEl(el, todos), 1);
    toggleNestedUp(elementLi.firstChild, goodTodo);
  }
  
  el.parentNode.removeChild(el);
}


// DELETE ALL COMPLETED TODOS
function destroyCompleted(event) {
  var elementClicked = event.target;
  if (elementClicked.id !== 'destroy-completed') {
    return;
  }
  
  var toggleEl = document.querySelectorAll('.toggle');
  var elementsToBeDestroyed = [];
  
  for (var i = 0; i < toggleEl.length; i++) {
    if (toggleEl[i].checked === true) {
      elementsToBeDestroyed.push(toggleEl[i]);
    }
  }
  
  for (var i = 0; i < elementsToBeDestroyed.length; i++) {
    if (getGoodTodo(elementsToBeDestroyed[i].closest('li'), todos)) {
      destroy(elementsToBeDestroyed[i].closest('li').children[3]);
    }
  }
}


// EDIT TODOS
function edit(event) {
  var input = event.target;
  if (input.className !== 'todo-text') {
    return;
  }
  
  var el = input.closest('li');
  var goodTodo = getGoodTodo(el, todos);
  
  var elFirstChild = el.firstChild;
  elFirstChild.type = 'text';
  elFirstChild.classList.add('edit');
  elFirstChild.value = goodTodo.value;
  elFirstChild.focus();
  el.children[1].style.visibility = 'hidden';
  el.children[2].style.visibility = 'hidden';
  el.children[3].style.visibility = 'hidden';
}


// EDIT TODOS ON KEYUP
function editKeyUp(event) {
  var input = event.target;
  if (input.className !== 'toggle edit') {
    return;
  }
  
  var el = input.closest('li');
  var goodTodo = getGoodTodo(el, todos);  
  var label = input.closest('li').children[1];
  
  if (event.which === enterKey || event.which === 0) {
    goodTodo.value = input.value;
    input.type = 'checkbox';
    input.classList.remove('edit');
    label.textContent = input.value;
    label.style.visibility = 'visible';
    el.children[2].style.visibility = 'visible';
    el.children[3].style.visibility = 'visible';
    
    if (!input.value) {
      input.classList.add('destroy');
      input.classList.remove('toggle');
      destroy(event);
      return;
    }
    
  } else if (event.which === escapeKey) {
    input.type = 'checkbox';
    input.classList.remove('edit');
    label.textContent = goodTodo.value;
    label.style.visibility = 'visible';
    el.children[2].style.visibility = 'visible';
    el.children[3].style.visibility = 'visible';
  } 
}


// DISPLAY TODOS ON CREATE
function display(element, goodTodo) {    
  var todosLi = document.createElement('li');
  todosLi.classList.add('todo-list');
  
  var toggleButton = document.createElement('input');
  toggleButton.type = 'checkbox';
  toggleButton.className = 'toggle';

  var label = document.createElement('label');
  label.className = 'todo-text';
  
  var destroyButton = document.createElement('button');
  destroyButton.className = 'destroy';
  
  var nestedTodosButton = document.createElement('button');
  nestedTodosButton.className = 'nested';
  
  // THIS IS FOR NESTED TODOS
  
  if (goodTodo !== todos) {
    if (!goodTodo[1]) {
      var nestedTodosUl = document.createElement('ul');
      nestedTodosUl.id = 'nested-table';
      element.appendChild(nestedTodosUl);
      nestedTodosUl.appendChild(todosLi);
    } else {
      var nestedTodosUl = element.lastChild;
      nestedTodosUl.appendChild(todosLi);
    }
  } else {
    todosUl.appendChild(todosLi);
  }
  
  todosLi.appendChild(toggleButton);
  todosLi.appendChild(label);
  todosLi.appendChild(nestedTodosButton);
  todosLi.appendChild(destroyButton);
  
  label.textContent = goodTodo[goodTodo.length - 1].value;
  todosLi.setAttribute('data-id', goodTodo[goodTodo.length-1].id);
  
  if (element !== null) {
    if (getGoodTodo(nestedTodosUl.closest('li'), todos).completed === true) {
    toggleNestedUp(element.firstChild, getGoodTodo(nestedTodosUl.closest('li'), todos));
    }
  }
}


// DISPLAY NESTED TODOS
function displayNestedTodos(event) {
  var input = event.target;
  if (input.className !== 'nested-todo-input') {
    return;
  }
  
  if (event.which === escapeKey) {
    input.setAttribute('abort', false);
    input.blur();
    input.parentNode.removeChild(input);  
  } else if (event.which === enterKey) {
    input.setAttribute('abort', false);
    input.blur();
    
    var el = input.closest('li');     

    var val = input.value.trim();

    if (!val) {
      input.parentNode.removeChild(input);
      return;
    }

    var goodTodo = getGoodTodo(el, todos);

    goodTodo.nestedTodos.push({
      value: val,
      completed: false,
      id: id++,
      nestedTodos: []
    });

    input.parentNode.removeChild(input);

    display(el, goodTodo.nestedTodos);
  } 
}


// REMOVE NESTED TODOS ON CLICK OUTSIDE (ON CREATION)
function clickOutside(event) {
  var input = event.target;
  if (input.className === 'nested-todo-input') {
    if (!input.getAttribute('abort')) {
      input.parentNode.removeChild(input);
    }
  }
}

  
// GET THE RIGHT TODO
function getGoodTodo(element, goodTodo) {
  for (var i = 0; i < goodTodo.length; i++) {
    if (goodTodo[i].id === parseInt(element.dataset.id)) {
      return goodTodo[i];
    } else {
      if (goodTodo[i].nestedTodos.length > 0) {
        if (getGoodTodo(element, goodTodo[i].nestedTodos) !== undefined) {
          return getGoodTodo(element, goodTodo[i].nestedTodos);
        }
      }
    } 
  }
}


// GRAB THE RIGHT INDEX
function indexOfEl(element, goodTodo) { 
  for (var i = 0; i < goodTodo.length; i++) {
    if (goodTodo[i].id === parseInt(element.dataset.id)) {
      return i;
    } else {
      if (goodTodo[i].nestedTodos.length > 0) {
        if (indexOfEl(element, goodTodo[i].nestedTodos) !== undefined) {
          return indexOfEl(element, goodTodo[i].nestedTodos);
        }
      }
    } 
  }
}