let madeSmall;//madeSmall= true, when we went from fullscreen to smallscreen, false, when we went from smallcreen to fullscreen
let actualContact;
let detailDialog = false;
let colorsIcon = ['#FF7A00', '#9327FF', '#29ABE2', '#FC71FF', '#02CF2F', '#AF1616', '#462F8A', '#FFC700', '#0223cf','#0456cf'];
let nameUser = "";
setMadeSmall();
window.addEventListener("resize", resizeListenerContacts);
contacts = [];
users = [];
/**
 * sets the initial values for madeSmall
 */
function setMadeSmall() {
  if (window.innerWidth <= 800) {
    newContact
    madeSmall = true;
  } else { madeSmall = false; }
}

/**
 * Used, wenn wie resize from <=800 to <800 and back
 */
function resizeListenerContacts() {
  if (window.innerWidth <= 800 && !madeSmall) {
    madeSmall = true;
    document.getElementById('contactsContainer').style.display = 'none';
  }

  if (window.innerWidth > 800 && madeSmall) {
    madeSmall = false;
    if (detailDialog) {
      responsiveContactDetailsBackButton();
    } else {
      document.getElementById('contactsContainer').style.display = 'block';
    }
  }
}

/**
 * Give contacts a value and load every created contact from the Server
 */

async function loadContactsOld() {
  try {
    const response = await getItem('contacts');
    if (response && response.data && response.data.value) {
      contacts = JSON.parse(response.data.value).sort((a, b) => a.name.localeCompare(b.name));
    } else {
      contacts = []; // Fallback, wenn die Server-Antwort kein gültiges JSON enthält
    }
  } catch (error) {
    console.error('Error loading contacts:', error);
    contacts = []; // Fallback, wenn ein Fehler beim Laden der Kontakte auftritt
  }
}


async function loadContacts() {
  id = getidFromLocalStorage();
  let c = []
  c = await getContactBE(id);
  users = await getUsers();
  let i = 0;
  c.forEach(element => { //colors[i % 9]
    let a = { "username": element['username'], "email": element['email'], "id": element['id'] + '', "iconColor": element['iconColor'], "short": element['short'] ,"phone":element['phone']};
    i++;
    contacts.push(a);
    contacts.sort((a, b) => a.username.localeCompare(b.username));
  });
  //await loadRemoteColor();
}
/**
 * This function is an onload function. It will render every contact, from the server. And will only stop when 
 * the length from contacts(array) is reached. It will also create the seperator and letters and sort it 
 * alphabetical. LettersHtml and contactListHtml is a created function only for returning the HTML part.
 */
async function renderContacts() {
  if (contacts.length == 0) { await loadContacts(); }

  let containerContactlist = document.getElementById('contactList');
  containerContactlist.innerHTML = "";

  for (let i = 0; i < contacts.length; i++) {
    let contact = contacts[i];
    let currentLetter = contact['username'].charAt(0).toUpperCase();
    let prevLetter = i > 0 ? contacts[i - 1]['username'].charAt(0).toUpperCase() : null;

    if (currentLetter !== prevLetter) {
      containerContactlist.innerHTML += lettersHtml(currentLetter);
      generatedLetters.push(currentLetter);
    }
    containerContactlist.innerHTML += contactListHtml(contact, i);
  }
 
}

/**
 * Make the name of the current user available in all tabs
 */
// async function addNameToHref() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const msg = urlParams.get('name');
//   const id = urlParams.get('id');
//   if (msg) {
//     nameUser = msg;

//   }
//   setNameToHrefs(nameUser, id);
// }

/**
 * First it will get the value from the inputfields. After that it will split the first letter from the first- and 
 * secondname. After that it will create the short-Icon. Max Mustermann -> MM . After that it will push everything
 * in the current place from the contacts-array and save so the changes.
 */
async function saveContactChanges(i) {

  let name = document.getElementById('changeName').value;
  let email = document.getElementById('changeEmail').value;
  // let regUser = filterFromUser(email);
  let phone = document.getElementById('changePhone').value;
  
  contactId = contacts[i]['id'];
  contacts[i].username = name;
  contacts[i].email = email;
  contacts[i].phone = phone; 
  let newContact = document.getElementById('newContact');
  newContact.classList.add('d-none');
  saveContact(contactId,contacts[i])
  showContactDetails(i);
  renderContacts();

}

// function filterFromUser(email) {
//   regUser = null;
//   users.forEach((u) => {
//     if (u.email == email) {
//       regUser = u;
//     }
//   }); 
//   return regUser;
// }

/**
 * This will delete the selected contact from the array contacts.
 */
async function deleteContact(i) { //---old  delete

  await deleteThisContact(contacts[i]);
  contacts.splice(i, 1);
  let newContact = document.getElementById('newContact');
  newContact.classList.add('d-none');
  document.getElementById('resetName').innerHTML = "";
  document.getElementById('resetInfo').innerHTML = "";
  document.getElementById('resetEmailPhone').innerHTML = "";
  await renderContacts();
  document.getElementById('contactList').classList.remove('d-none');
  document.getElementById('responsiveButton').classList.remove('d-none');
  document.getElementById('responsiveHeadlinePhrase').classList.add('d-none');
  document.getElementById('responsiveDelete').classList.add('d-none');
  document.getElementById('responsiveEdit').classList.add('d-none');
  document.getElementById('backArrowResponsive').classList.add('d-none');

}

/**
 * First it checks the validity from the inputfields, after that it will save the created contact in contacts
 * and push it into the remote server.
 */
async function newContact() {
  let name = document.getElementById('newName').value;
  let split = name.split(' ');
  console.log(split);
  let email = document.getElementById('newEmail').value;
  id = await getidFromLocalStorage();
  let phone = document.getElementById('newPhone').value;
  let form = document.querySelector('form');
  let index = Math.floor(Math.random() * 10);
  id = getidFromLocalStorage();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  let contact = {
    "username": name,
    "email": email,
    "phone": phone,
    "short": split[0].charAt(0) + split[1].charAt(0),
    "iconColor": colorsIcon[index]
  };

  let contactData = await makeContact(id, contact);
  contacts.push(contactData);
  let newContact = document.getElementById('newContact');
  newContact.classList.add('d-none');
  renderContacts();

}

/**
 * Show the current clicked contact and give details about it.
 */
function showContactDetails(i) {
  actualContact = i;
  let container = document.getElementById('contactDetails');
  let contact = contacts[i];
  container.innerHTML = "";

  if (window.innerWidth >= 800) {
    container.innerHTML = showContactDetailsHtml(contact, i);
  } else {
    detailDialog = true;
    container.innerHTML = showContactDetailsHtml(contact, i);
    contactDetailsSmall();
  }
}
function contactDetailsSmall() {
  document.getElementById('contactList').classList.add('d-none');
  document.getElementById('responsiveButton').classList.add('d-none');
  document.getElementById('responsiveHeadlinePhrase').classList.remove('d-none');
  document.getElementById('responsiveDelete').classList.remove('d-none');
  document.getElementById('responsiveEdit').classList.remove('d-none');
  document.getElementById('backArrowResponsive').classList.remove('d-none')
  document.getElementById('contactsContainer').style.display = 'block';
}

/**
 * Add and remove some classes for the responsive view
 */
function responsiveContactDetailsBackButton() {
  detailDialog = false;
  document.getElementById('contactList').classList.remove('d-none');
  document.getElementById('responsiveButton').classList.remove('d-none');
  document.getElementById('responsiveHeadlinePhrase').classList.add('d-none');
  document.getElementById('responsiveDelete').classList.add('d-none');
  document.getElementById('responsiveEdit').classList.add('d-none');
  document.getElementById('backArrowResponsive').classList.add('d-none')
  if (window.innerWidth <= 800) { document.getElementById('contactsContainer').style.display = 'none'; }
}

/**
 * Show the pop-up window for new contact.
 */
function showPopUpWindowNewContact() {
  let newContact = document.getElementById('newContact');
  newContact.classList.remove('d-none');
  newContact.innerHTML = newContactPopUpHtml();
}

/**
 * close the pop-up window for new contact.
 */
function closePopUpWindow() {
  document.getElementById('newContact').classList.add('d-none');
}

/**
 * Show the pop-up window for edit contact.
 */
function editContact(i) {
  let newContact = document.getElementById('newContact');
  newContact.classList.remove('d-none');
  newContact.innerHTML = editContactHtml(i);
}

/**
 * only show the new contact button for responsive side, when the window is smaller than 800px
 */
async function buttonVisibility() {
  let button = document.getElementById('responsiveButton');
  if (window.innerWidth < 800) {

    button.classList.remove('d-none');
    await renderContacts();
  } else {

    button.classList.add('d-none');
  }
}

window.addEventListener('resize', function (event) {
  buttonVisibility();
});

function toggleDropdown() {
  const dropdown = document.getElementById("dropdown");
  dropdown.classList.toggle("open");
}

/*-------------------------------HTML-Templates-------------------------*/

function lettersHtml(currentLetter) {
  return `
<div class="firstLetterContainer">
  <span class="firstLetter">${currentLetter}</span>
</div>
<img src="../img/separator_contacts.svg">
`
}

function contactListHtml(contact, i) {

  return `
    <div class="contactContainer" onclick="showContactDetails(${i})">
      <div class="profile " style="background-color:${contact['iconColor']}">${contact['short']}</div>
      <div class="contact">
        <div class="name">${contact['username']}</div>
        <a  class="email">${contact['email']}</a>
      </div>
    </div>
  `
}


function showContactDetailsHtml(contact, i) {
  return `
<div class="nameContainer" id="resetName">
                      <div class="detailsProfile" style="background-color:${contacts[i]['iconColor']}">${contacts[i]['short']}</div>
                      <div class="detailsName">
                          <h2>${contact['username']}</h2>
                          <div class="addTask">
                          <a href="./add-task.html?name=${nameUser}"><svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8.5 1V16" stroke="#29ABE2" stroke-width="2" stroke-linecap="round"/>
                                  <path d="M16 8.64148L1 8.64148" stroke="#29ABE2" stroke-width="2" stroke-linecap="round"/>
                              </svg>
                              <span>Add Task</span>
                          </a>
                          </div>
                      </div>
                      </div>
                  <div class="detailsContactInfo" id="resetInfo">
                      <div class="contactInfo">Contact Information</div>
                      <div class="editContact" onclick="editContact(${i})">
                          <svg width="21" height="30" viewBox="0 0 21 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2.87121 22.0156L7.69054 24.9405L20.3337 4.10836C20.6203 3.63622 20.4698 3.02119 19.9977 2.73465L16.8881 0.847421C16.4159 0.560878 15.8009 0.71133 15.5144 1.18347L2.87121 22.0156Z" fill="#2A3647"/>
                              <path d="M2.28614 22.9793L7.10547 25.9042L2.37685 28.1891L2.28614 22.9793Z" fill="#2A3647"/>
                          </svg>
                          <span>Edit Contact</span>
                      </div>
                  </div>
                  <div class="emailPhone" id="resetEmailPhone">
                      <div class="contactEmail">
                          <span class="designation">Email</span>
                          <a href="mailto:${contact['email']}" class="email">${contact['email']}</a>
                      </div>
                      <div class="contactPhone">
                          <span class="designation">Phone</span>
                          <span>${contact['phone']}</span>
                      </div>
                  </div>

                  <img  onclick="deleteContact(${i})" src="../img/deleteButtonResponsive.png" id="responsiveDelete" class="responsiveButtons respButtDel d-none">
                  <img onclick="editContact(${i})"src="../img/editButtonResponsive.png"  id="responsiveEdit" class="responsiveButtons respButtEdit d-none">
                  <img  onclick="responsiveContactDetailsBackButton()" src="../img/backArrowResponsive.png" id="backArrowResponsive" class="responsiveBackArrowButton d-none">
              </div>`
}
/**
 * Finds all Users that contain the given Sting in their email address
 */
// function findUser(){
//   console.log("find user");
//   document.getElementById("userMail").classList.remove('d-none');
//   mail = document.getElementById("newEmail").value;
//   let mailLow = mail.toLowerCase();
//   let mailUser="";
//   let mailList=[]
//   if(mailLow==""){
//     document.getElementById("userMail").innerHTML="";
//     document.getElementById("userMail").classList.add('d-none');
//   }
//   else{
//   users.forEach((u)=>{
//     mailUser= u['email'].toLowerCase();
//     if(mailUser.includes(mailLow))
//     {
//       mailList.push(u['email']);
//     }
//   }); 
//   let mailWindow =document.getElementById("userMail");
//   mailWindow.innerHTML="";
//   mailList.forEach((m)=>{  
//   mailWindow.innerHTML+=`<div onclick="setMail('${m}')">${m}</div>`;
//   });
// }
// }

// function setMail(mail){ 

//   document.getElementById("newEmail").value = mail;
//   document.getElementById("userMail").innerHTML = "";
//   document.getElementById("userMail").classList.add('d-none');
// }

function newContactPopUpHtml() {
  return `
<div class="newContactContent">
<div class="newContactContainer">
  <div class="leftSideNewContactContainer">
      <img class="contact-logo" src="../img/sidebar-img/logo-sidebar.png">
      <h2>Add contact</h2>
      <p>Tasks are better with a team!</p>
      <div class="leftSideNewContactContainerSeperator"></div>
  </div>
  <div class="rightSideNewContactContainer">
  
      <span class="plr60px newIcon"><img class="" src="../img/newContact.png"></span>
      <span class="mb-120">
      <div class="closeAddContactButton" onclick="closePopUpWindow()"><img class="" src="../img/cancelIcon.png"></div>
          <form id"formContact" onsubmit="newContact();return false;">
              <input type="text" id="newName"  placeholder="Name">              
              <input type="email" id="newEmail" class="emailIcon" placeholder="Email" required >
              <input type="number" id="newPhone" class="phoneIcon" placeholder="Phone">
          <div class="buttonContainer">
          <button class="cancelButton" onclick="closePopUpWindow()">Cancel <img class="" src="../img/cancelIcon.png"></button>
          <button  type="submit" class="createButton" >Create contact <img class="" src="../img/createAccIcon.png"> </button>
          </form>
          </div>
      </span>
  </div>
</div>
</div>
`
}
//<input type="text"  id="newName" class="avatarIcon" placeholder="Name" required>

function editContactHtml(i) {
  return `
<div class="newContactContent">
<div class="newContactContainer">
    <div class="leftSideNewContactContainer">
        <img class="contact-logo" src="../img/sidebar-img/logo-sidebar.png">
        <h2>Edit contact</h2>
        <div class="leftSideNewContactContainerSeperator"></div>
    </div>
    <div class="rightSideNewContactContainer h450">
    
        <span class="editContactAvatar " style="background-color:${contacts[i]['iconColor']}">${contacts[i]['short']}</span>
        <span class="mb-30 pt60">
        <div class="closeAddContactButton" onclick="closePopUpWindow()"><img class="" src="../img/cancelIcon.png"></div>
            <form id="edCont" onsubmit="saveContactChanges(${i});return false;">
                <input required type="text" id="changeName" class="avatarIcon" placeholder="Name" value="${contacts[i]['username']}">
                <input required type="email" id="changeEmail" class="emailIcon" placeholder="Email" value="${contacts[i]['email']}">
                <input type="number" id="changePhone" class="phoneIcon" placeholder="Phone" value="${contacts[i]['phone']}">
            </form>
            <div class="buttonContainer">
            <button class="cancelButton" onclick="deleteContact(${i})">Delete</button>
            <button form="edCont" type="submit" class="createButton">Save</button>
            </div>
        </span>
    </div>
</div>
</div>
`
}

















