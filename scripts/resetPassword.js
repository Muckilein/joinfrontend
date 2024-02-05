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
function newPassword(event) {    
    event.preventDefault();
    if (checkPassword()) {
        users.forEach(u => {
            if (u['email'] == email) {
                u['password']=newPW;
                setItem('users',users);
            }
        });
        window.location.href="https://julia-wessolleck.developerakademie.net/Join/index.html"
    }
    
   

}
// function onSubmit(event) {
//     event.preventDefault(); 

// }



function showInfoBox() {
    let infoBox = document.getElementById("infoBox");
    infoBox.style.display = "block";
}


