
// const STORAGE_TOKENold = 'EU3DCTQFLIIRYKT20VZ7FI6JEYQ6G4WUYDV99ESF';   
const STORAGE_TOKEN = '7WLO2N6502EXUOLVYTZHZH3VTBY404CF2A5ZADMU';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';
let tasks = [];
let tasksNew = [];
let p;
let contacts;
let generatedLetters = [];
let colorsCategory = []
// let pathBackend = "http://127.0.0.1:8000/";
// let frontendPath = "http://127.0.0.1:5500/"
let pathBackend = "https://join.julia-developer.de/";
let frontendPath = "https://julia-developer.de/Join-frontend/";

/**
 * load all external html files with the attribut w3-include-html
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        file = element.getAttribute("w3-include-html"); // "includes/header.html"
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}


/*-----------------Summary---------------*/

async function logout() {
    const url = pathBackend + "logout/"
    await loadRemoteNew(url);
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    // window.location.href = `https://julia-wessolleck.developerakademie.net/Join-frontend/index.html`;
    window.location.href = frontendPath + `index.html`;
}


async function getContactBE(id) {
    const url = pathBackend + "contacts/" + id + "/";
    let co = await loadRemoteNew(url)
    return co;
}

async function makeContact(id, contact) {
    const url = pathBackend + "contacts/" + id + "/";
    let co = saveRemoteNew(url, contact, 'POST', true);
    return co;
}
async function saveContact(id, contact) {
    const url = pathBackend + "contacts/" + id + "/";
    let co = saveRemoteNew(url, contact, 'PUT', true);
    return co;
}
async function deleteThisContact(contact) {
    const url = pathBackend + "contacts/" + contact['id'] + "/";
    let co = saveRemoteNew(url, {}, 'DELETE', true);
    return co;
}

async function getUsers() {
    const url = pathBackend + "users/";
    let co = await loadRemoteNew(url)
    return co;
}

async function loadRemoteColor() {
    const url = pathBackend + "categoryAPI/"
    cat = await loadRemoteNew(url)
    return cat;
}

/**
 * 
 * @param {task} task    Task that is edited and should be stored
 */
async function setRemoteTodos(task) {
    let id = task['id'];
    const url = pathBackend + "createTodoAPI/" + id + "/";
    saveRemoteNew(url, task, 'PUT', true);
}

async function deleteTodo(id) {
    const url = pathBackend + "createTodoAPI/" + id + "/";
    saveRemoteNew(url, {}, 'DELETE', true);
}

async function makeCategory(newCat) {
    const url = pathBackend + "categoryAPI/";
    saveRemoteNew(url, newCat, 'POST', true);
}
async function makeNewTodos(task) {
    const url = pathBackend + "createTodoAPI/";
    saveRemoteNew(url, task, 'POST', true);
}



async function registerUser(userData) {

    const url = pathBackend + "registerAPI/";
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let state = "";
    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(userData),
        redirect: 'follow',
    };
    try {
        let resp = await fetch(url, requestOptions).then(st => state = st.ok);
    } catch (e) {
        //console.error(e);
    }
    return state;
}

async function getUserbyId(id) {

    const url = pathBackend + "user/" + id + "/";
    let data = await loadRemoteNew(url);
    return data
}


function setToken(token) {
    localStorage.setItem('token', token);
}

function getidFromLocalStorage() {
    let data = localStorage.getItem('id')
    id = JSON.parse(data);
    return id;
}

async function loadRemoteTodos() {
    const url = pathBackend + "createTodoAPI/";
    tasks = await loadRemoteNew(url);
    return tasks
}



async function loadRemoteNew(url) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", 'Token ' + localStorage.getItem('token'));
    let data = [];
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };
    try {
        let resp = await fetch(url, requestOptions);
        data = await resp.json();
    } catch (e) {
        console.error(e);
    }
    return data;
}

async function saveRemoteNew(url, dataUpload, method, bool) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (bool) {
        myHeaders.append("Authorization", 'Token ' + localStorage.getItem('token'));
    }
    let data = [];
    const requestOptions = {
        method: method,
        headers: myHeaders,
        body: JSON.stringify(dataUpload),
        redirect: 'follow',
    };
    try {
        let resp = await fetch(url, requestOptions);
        data = await resp.json();

    } catch (e) {
        //console.error(e);
    }
    return data;
}

/**
 * This function loads the tasks from the remote storage and saves it in tasks.
 * @returns returns the tasks as an JSON Array
 */
// async function loadRemote() { //-------------------------detele-----------------
//     try {
//         await getTasks('tasks');
//         tasks = JSON.parse(p.replaceAll('\'', '"'));
//         return tasks;
//     } catch (e) {
//         console.info('Could not found tasks');
//     }
// }

/**
 * This function stores a value under a specific key in the remote storage and handles error cases.
 */
async function setItemRegister(key, value) {
    const payload = { key, value, token: STORAGE_TOKEN };
    try {
        const response = await fetch('https://remote-storage.developerakademie.org/item', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

/**
 * This function retrieves the value of a specific key from the remote storage and handles error cases.
 */
async function getItemRegister(key) {
    const url = `https://remote-storage.developerakademie.org/item?key=${key}&token=${STORAGE_TOKEN}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.data) {
            return data.data.value;
        } else {
            throw new Error(`Could not find data with key "${key}".`);
        }
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}
