let email = "";
let users;
let newPW;




async function onPageLoad() {
    email = getEmailUrlPrameter();
    //  users = getUsers();
    users = await loadUsersRegister();
}

/**
 * This function loads the user data from a remote storage and handles potential loading errors.
 */
async function loadUsersRegister() {

    try {
        let item = await getItem('users') || [];
        let data = item.data.value;
        let u = JSON.parse(data) || [];
        console.log(users)
        return u;

    } catch (e) {
        console.error('Loading error:', e);
    }
}

function getEmailUrlPrameter() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const email = urlParams.get('email');
    return email;
}

/**
 * 
 * @returns Are both passwords the same
 */
function checkPassword() {
    let p1 = document.getElementById('pw1').value;
    let p2 = document.getElementById('pw2').value;
    newPW = p1;
    return p1 == p2;
}

/**
 * Sets the new password and stores it.
 * 
 * @param {event} event 
 */
async function newPassword(event) {    //change 
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    let valid = await validToken(token);
    let url = urlParams.get('path');
    let pw1 = document.getElementById('pw1').value;
    let pw2 = document.getElementById('pw2').value;
    if (pw1 == pw2 && valid['status'] == 'OK') {
        if (token != null) {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            let data = {
                "password": pw1,
                "token": token
            };
            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                redirect: 'follow',
                body: JSON.stringify(data)
            };
            try {
                let resp = await fetch(url, requestOptions);
                data = await resp.json();
                //setTimeout(() => { window.location.href = "http://127.0.0.1:5500/index.html" }, 2000)
                setTimeout(() => { window.location.href = "http://julia-wessolleck.developerakademie.net/Join-frontend/index.html" }, 2000)

            } catch (e) {
                console.error(e);
            }
        }
    }
}

async function validToken(token) {    //change 

    let url = pathBackend+'password_reset/validate_token/'

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let data = {
        "token": token
    };
    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body: JSON.stringify(data)
    };
    try {
        let resp = await fetch(url, requestOptions);
        data = await resp.json();
    } catch (e) {
        console.error(e);
    }
    return data;
}


function showInfoBox() {
    let infoBox = document.getElementById("infoBox");
    infoBox.style.display = "block";
}


