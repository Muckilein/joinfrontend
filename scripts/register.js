let users = [];
let email;
let user;
let colorsIcon = ['#FF7A00', '#9327FF', '#29ABE2', '#FC71FF', '#02CF2F', '#AF1616', '#462F8A', '#FFC700', '#0223cf'];

// const STORAGE_TOKEN = 'EU3DCTQFLIIRYKT20VZ7FI6JEYQ6G4WUYDV99ESF';  
// const STORAGE_TOKEN = '7WLO2N6502EXUOLVYTZHZH3VTBY404CF2A5ZADMU';  


/**
 * This function initializes the startup process by loading the user data.
 */
async function initIndex() {


    let dat = loadData();
    let mail = dat[0];
    let pw = dat[1];
    if (mail != "") {
        document.getElementById('checkbox').checked = true;
        document.getElementById('emailLogin').value = mail;
        document.getElementById('passwordLogin').value = pw;
    }
}

function handleErrorSignUp() {
    document.getElementById('notePassword').classList.remove("d-none");
    setTimeout(() => {
        document.getElementById('notePassword').classList.add("d-none");
    },3000);

}


/**
 * This function handles the registration process by checking if the email already exists, adding the new user, resetting the form, and displaying a success message.
 */
async function register() {
    let passwordInput = document.getElementById('password');
    if (passwordInput.lenght < 8) {
        handleErrorSignUp()
    }
    else {
        const newUser = getNewUserFromInputs();
        try {
            let resp = await registerUser(newUser);
            console.log("status is", resp);
            if (resp == true) {
                resetForm();
                displayRegistrationSuccess();
            }else{
                handleErrorSignUp();
                document.getElementById('password').value="";
            }
        }

        catch (e) {
            console.error(e);
            handleErrorSignUp();
        }

    }



}


function backtoLogin() {
    window.location.href = "../index.html";
}
/**
 * This function reads the values from the input fields for name, email, and password, and returns an object with the user data. 
 */
function getNewUserFromInputs() {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('emailLogin');
    const passwordInput = document.getElementById('password');
    let split = nameInput.value.split(' ');
    split.push(" ");
    let nameKorrekt = "";
    split.forEach((s) => {
        nameKorrekt += s;
    });
    return {
        "username": nameKorrekt,
        "email": emailInput.value,
        "password": passwordInput.value,
        "password2": passwordInput.value,
        "first_name": split[0],
        "last_name": split[1],
        // "iconColor":colorsIcon[Math.random()*9],
        "iconColor": colorsIcon[5],
        "short": split[0][0] + split[1][0],
        "phone": "Phone Number"
    };
}

function displayEmailExistsMessage() {
    alert('The email is already registered.');
}

/**
 * Adds a new user to the user list, disables the registration button, and saves the updated user list.
 * @param {Object} user - The user object to be added to the user list.
 */
function addUser(user) {
    const registerBtn = document.getElementById('registerBtn');
    registerBtn.disabled = true;

    users.push(user);
    //setItem('users', JSON.stringify(users));
    setItem('users', users);
}

/**
 * This function resets the registration form by clearing the values of the input fields and enabling the registration button.
 */
function resetForm() {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('emailLogin');
    const passwordInput = document.getElementById('password');
    const registerBtn = document.getElementById('registerBtn');

    nameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    registerBtn.disabled = false;
}

/**
 * This function displays a success message for registration and redirects the user to the login page after a short delay.
 */
function displayRegistrationSuccess() {
    let infoBox = document.getElementById("infoBox");
    infoBox.style.display = "block";

    setTimeout(() => {
        infoBox.style.display = "none";
    }, 1500); // Weiterleitung nach 1 Sekunde (1000 Millisekunden)
}


function showInfoBox() {
    let infoBox = document.getElementById("infoBox");
    infoBox.style.display = "block";
    setTimeout(() => {
        infoBox.style.display = "none";
    }, 1500); // Weiterleitung nach 1 Sekunde (1000 Millisekunden)

}

// Login // 



async function registerGuest() {
    let url = pathBackend + 'guest/';
    let resp = await fetch(url);
    data = await resp.json();
    console.log(data);
    if (data == 'NO') {
        guest = {
            "username": "Guest",
            "email": "Guest@mail.de",
            "password": "666aaaaaaa",
            "password2": "666aaaaaaa",
            "first_name": "User",
            "last_name": "Guest",
            // "iconColor":colorsIcon[Math.random()*9],
            "iconColor": colorsIcon[5],
            "short": "UG",
            "phone": "0000000000"
        };
        await registerUser(guest);
        setTimeout(() => { login("Guest@mail.de", "666aaaaaaa"); }, 2000);
    } else {
        await login("Guest@mail.de", "666aaaaaaa");
    }
}


async function openGuestLogin() {
    await registerGuest();

}

/**
 * Handles the login process by comparing the entered email and password with the registered users.
 * If a matching user is found, the page is redirected to the summary page with the user's name.
 * Otherwise, a login error message is displayed.
 * @param {Event} event - The event object from the login form submission.
 */
async function loginUser(event) {
    event.preventDefault();
    const emailInput = document.getElementById('emailLogin');
    const passwordInput = document.getElementById('passwordLogin');
    let email = emailInput.value;
    let password = passwordInput.value;
    await login(email, password);



}

async function login(email, password) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "username": email,
        "password": password
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    try {
        let resp = await fetch(pathBackend + "login/", requestOptions);
        let json = await resp.json();
        setToken(json.token);
        id = json['user_id'];
        if (id == undefined) {

        } else {
            localStorage.setItem('id', id);
            let user = await getUserbyId(id);
            localStorage.setItem('username', user.username);
            // TODO: Redirect
            //window.location.href = `./html/summary.html?name=${user.username}&id=${id}`;   
            window.location.href = `html/summary.html?name=${user.username}&id=${id}`;

        }

    } catch (e) {
        // Show error message    
        console.error(e);
        window.location.href = `/html/index.html`;
    }
}

/**
 * When the checkbox remember me is clicked, than the user Data is stored in the local storage.
 * 
 * @param {Object} user JSON object of the user
 * @param {Checkbox} check   Checkbox "remember me"
 * @param {Object} loginError 
 */
function setDataToStorage(user, check, loginError) {
    if (user) {
        if (check.checked) {
            saveMe(user.email, user.password);
        }
        else {
            saveMe("", "");
        }
        window.location.href = `./html/summary.html?name=${user.name}`;
    } else {

        loginError.style.display = 'block';
    }
}

/**
 * Stors the given information in the local storage
 * 
 * @param {string} email 
 * @param {string} pw   password of the user
 */
function saveMe(email, pw) {
    let em = JSON.stringify(email);
    let pass = JSON.stringify(pw);
    localStorage.setItem('email', em);
    localStorage.setItem('password', pass);
}

/** * 
 * @returns Returns an array [mail,password] of the user that should be rememberd
 */
function loadData() {
    let ret = [];
    let mail = localStorage.getItem('email');
    let pw = localStorage.getItem('password');
    if (mail && pw) {
        mail = JSON.parse(mail);
        pw = JSON.parse(pw);

    } else { mail = ""; pw = "" }

    ret.push(mail);
    ret.push(pw);
    return ret;
}

/**
 * Loads the list of registered users from the data source.
 * @function
 * @async
 * @returns {Promise<Array<Object>>} - A Promise that resolves to an array of user objects containing the registered users.
 * @throws {Error} - If there is an error while loading the user data.
 */

async function loadUsers() {
    try {
        const usersData = await getItem('users');
        return JSON.parse(usersData) || [];
    } catch (error) {
        console.error('Loading error:', error);
        return [];
    }
}

async function loadUsersReset() {
    try {
        const usersData = await getItem('users');
        users = JSON.parse(usersData) || [];
        return users;

    } catch (error) {
        console.error('Loading error:', error);
        return [];
    }
}

/**
 * Checks if the specified email address exists in the list of registered users and returns a boolean value.
 * @param {string} email - The email address to be checked for existence in the list of registered users.
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean value indicating whether the email exists.
 */

async function checkEmailExists(email) {
    const registeredUsers = await loadUsers();
    const user = registeredUsers.find(user => user.email === email);
    return !!user;
}

/**
 * This function greets the user based on the URL parameters and updates the greeting message according to the time of day.
 */
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get('name');
    const greetingTextElement = document.getElementById('greetingText');
    const userElement = document.getElementById('user');

    let today = new Date();
    let currentHour = today.getHours();

    let greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good day" : "Good evening";

    if (userName === null || userName === "") {
        userElement.textContent = "Guest";
        greetingTextElement.textContent = greeting + ",";
        greetingTextElement.style.color = "black";
    } else {
        userElement.textContent = userName;
        greetingTextElement.textContent = greeting + ",";
    }
};

/**
 * This function changes the source of the logo image after the page has loaded to display the "Join-Logo.svg" image.
 */
window.onload = function () {
    setTimeout(function () {
        let logo = document.getElementById("join-logo");
        logo.src = "./img/Join-Logo.svg";
    }, 800);
}


/**
 * Sets a key-value pair in the remote storage using a provided token.
 * @function
 * @async
 * @param {string} key - The key to set in the remote storage.
 * @param {any} value - The value to associate with the specified key.
 * @returns {Promise<any>} - A Promise that resolves to the response data from the remote storage API.
 * @throws {Error} - If there is an error while making the request or processing the response.
 */
// async function setItem(key, value) {      //delete
//     const payload = { key, value, token: STORAGE_TOKEN };
//     try {
//         const response = await fetch('https://remote-storage.developerakademie.org/item', {
//             method: 'POST',
//             body: JSON.stringify(payload)
//         });
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error('Request error:', error);
//         throw error;
//     }
// }

/**
 * Retrieves the value associated with the specified key from the remote storage using the provided token.
 * @function
 * @async
 * @param {string} key - The key for which to retrieve the value from the remote storage.
 * @returns {Promise<any>} - A Promise that resolves to the value associated with the specified key.
 * @throws {Error} - If there is an error while making the request, processing the response, or if the key is not found.
 */
// async function getItem(key) { //delete
//     const url = `https://remote-storage.developerakademie.org/item?key=${key}&token=${STORAGE_TOKEN}`;
//     try {
//         const response = await fetch(url);
//         const data = await response.json();
//         if (data.data) {
//             return data.data.value;
//         } else {
//             throw new Error(`Could not find data with key "${key}".`);
//         }
//     } catch (error) {
//         console.error('Request error:', error);
//         throw error;
//     }
// }


async function resetPassword(event) {
    event.preventDefault();
    let mail = document.getElementById('emailLogin').value;
    let url = pathBackend + 'password_reset/?email=' + mail;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestInit = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ "email": mail })
    };
    fetch(url, requestInit)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {

        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

}

function action(formData) {
    const input = 'https://julia-wessolleck.developerakademie.net/Join/send_mail.php';
    const requestInit = {
        method: 'post',
        body: formData
    };

    return fetch(input, requestInit);
}

function getEmailUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const email = urlParams.get('email');
    return email;
}








