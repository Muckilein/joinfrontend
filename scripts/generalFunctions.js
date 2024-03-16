
// const STORAGE_TOKENold = 'EU3DCTQFLIIRYKT20VZ7FI6JEYQ6G4WUYDV99ESF';   
const STORAGE_TOKEN = '7WLO2N6502EXUOLVYTZHZH3VTBY404CF2A5ZADMU';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';
let tasks = [];
let tasksNew = [];
let p;
let contacts;
let generatedLetters = [];
let colorsCategory = []

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

/**
 * Adds the username to the href of the links.
 * 
 * @param {string} userNameAddTask  username
 */
function setNameToHrefs(userNameAddTask,id) {
    let other = `&id=${id}`;
    document.getElementById('menu_board').href = `board.html?name=${userNameAddTask}`+other;
    document.getElementById('menu_add-task').href = `add-task.html?name=${userNameAddTask}`+other;
    document.getElementById('menu_contacts').href = `contacts.html?name=${userNameAddTask}`+other;
    document.getElementById('menu_summary').href = `summary.html?name=${userNameAddTask}`+other;
    document.getElementById('menu_legal-notice').href = `legal-notice.html?name=${userNameAddTask}`+other;
    document.getElementById('helpId').href = `help.html?name=${userNameAddTask}`+other;
    document.getElementById('menu_help').href = `help.html?name=${userNameAddTask}`+other;
}

/**
 * Stores a key-value pair in the remote storage using the provided token.
 * @async
 * @param {string} key - The key to be stored in the remote storage.
 * @param {any} value - The value to be associated with the specified key.
 * @returns {Promise<any>} - A Promise that contains the response data from the remote storage API.
 * @throws {Error} - If there is an error while making the request or processing the response.
 */
async function setItem(key, value) {
    const payload = { key, value, token: STORAGE_TOKEN };
    try {
        const response = await fetch(STORAGE_URL, {
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
 * Retrieves the value associated with the specified key from the remote storage using the provided token.
 * @async
 * @param {string} key - The key for which to retrieve the value from the remote storage.
 * @returns {Promise<any>} - A Promise that contains the value associated with the specified key.
 * @throws {Error} - If there is an error while making the request or processing the response, or if the key is not found.
 */
async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

/**
 * This function saves the tasks on the remote storage.
 * @param {string} key - key e.g. 'tasks'
 * @param {string} value - the JSON Array, that should be saved
 * @returns - the promise
 */
// async function setTask(key, value) {  //------------------------delete----------------
//     let v = value
//     if (value.length == 0) {
//         v = '[]';
//     }
//     const payload = { key: key, value: v, token: STORAGE_TOKEN };
//     return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) }).then(resp => resp.json());
// }

/*-----------------Summary---------------*/
/**
 * This function used in loadRemote(). Fetches the object with the key from remote storage.
 * @param {string} key - key where the objects is stored remote.
 * @returns - returns the data.value
 */
async function getTasks(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    p = await fetch(url).then(resp => resp.json()).then(resp => resp.data.value);
    return p;
}

async function logout(){
    const url = "http://127.0.0.1:8000/logout/"
    await loadRemoteNew(url);
    localStorage.removeItem('token');
    window.location.href = `/index.html`; 
}


async function getContactBE() {
    const url = "http://127.0.0.1:8000/contacts/";
    let co = await loadRemoteNew(url)
    return co;
}

async function getUsers() {
    const url = "http://127.0.0.1:8000/users/";
    let co = await loadRemoteNew(url)
    return co;
}

async function loadRemoteColor() {
    const url = "http://127.0.0.1:8000/categoryAPI/"
    cat = await loadRemoteNew(url)
    console.log('loadremotecolors',cat);
    return cat;
}

async function loadRemoteTodos() {
    const url = "http://127.0.0.1:8000/createTodoAPI/"
    tasks = await loadRemoteNew(url);
    return tasks
}

/**
 * 
 * @param {task} task    Task that is edited and should be stored
 */
async function setRemoteTodos(task) {
    let id = task['id'];
    const url = "http://127.0.0.1:8000/createTodoAPI/" + id + "/";
    console.log("url to send ", url);
    saveRemoteNew(url, task, 'PUT',true);
}

async function makeCategory(newCat) {    
    const url = "http://127.0.0.1:8000/categoryAPI/";
    console.log("url to send ", url);
    saveRemoteNew(url, newCat, 'POST',true);
}
async function makeNewTodos(task) {    
    const url = "http://127.0.0.1:8000/createTodoAPI/";
    console.log("url to send ", url);
    saveRemoteNew(url, task, 'POST',true);
}

async function registerUser(userData) {

    const url = "http://127.0.0.1:8000/registerAPI/";
    let data = saveRemoteNew(url, userData, 'POST',false);
    console.log(data);
}

async function getUserbyId(id) {

    const url = "http://127.0.0.1:8000/user/"+id+"/";
    let data = await loadRemoteNew(url);
    console.log(data);
    return data    
}


function setToken(token) { 
    localStorage.setItem('token', token);
}

function getidFromLocalStorage(){
    let  data = localStorage.getItem('id')
    id = JSON.parse(data);    
    return id;
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
    console.log("dataupload");
    console.log(dataUpload);
    myHeaders.append("Content-Type", "application/json");
    if (bool) {
        myHeaders.append("Authorization", 'Token ' + localStorage.getItem('token')) ;
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
        console.log(resp);
        data = await resp.json();
        console.log(data);
    } catch (e) {
        console.error(e);
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
