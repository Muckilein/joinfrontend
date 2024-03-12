let dummyContacts = [];
//let colorsCategory = [];
let usersRegistered = [];
let dummy;              // helpvariable for creating the assignment list of a task
let isSmallAdd;     // true if the window is gone in the smallscreen
let prio = 2;   //  proprity of a task
let prioOld = 0;// previouse proprity of a task
let state = 0;      // standard state of a task when it is created and not specified (in add-task a new task has the state 0 ("to do"))
let addedContacts = []; // assigned contacts for a tasks
let chosenCategory = "";
let categoryColor = '#1FD7C1';
let expandedCategory = false;
let categoryTitle;
let categoryChoices;  // aktual choosen category
let newCategoryField = ` <div class="selectionChoice" onclick="renderInputCategory(event)" value="newCategory">new Category</div>`;
let dialog = false; // is the dialog open
let expanded = false; // is the selection with the checkboxed of the assignments expanded
let checkboxes = [];  // saves all the checkboxes that are relevant at the moment
let firstCheckbox;    // first checkbox of the assigments (when form validation fails: 'At least one checkbox must be selected.' is blend in here )
let checked = false;  // is at least one checkbox in the assignment selection chlicked?
let changed = false;  // is the enter-email input open or not
let numberSubtasks = 1; //number of the subtasks of the aktual task
let subtasks = [];      // list that contains the titles of a subtask
let colorAll = ['#FF7A00', '#9327FF', '#29ABE2', '#FC71FF', '#02CF2F', '#AF1616', '#462F8A', '#FFC700', '#0223cf'];
let userNameAddTask; // name of the actual logged in user
let newCategory = "";
let addTask;        // true, when we are in dhe AddTask html false, wehen we are on board
let initialColors = [
    { name: 'Design', color: '#FF7A00' },
    { name: 'Sales', color: '#FC71FF' },
    { name: 'Backoffice', color: '#1FD7C1' },
    { name: 'Media', color: '#FFC701' },
    { name: 'Marketing', color: '#0038FF' }]
let contacts2;
//---------------------------------------------------Loading the contacts and registered person--------------------------------------------------
/**
 * Loads the list of registered users from the data source.
 * @function
 * @async
 * @returns {Promise<Array<Object>>} - A Promise that resolves to an array of user objects containing the registered users.
 * @throws {Error} - If there is an error while loading the user data.
 */




/**
 * Loads the contacs from the remote server in dummyContacts
 */
async function loadContacts() {
    //contacts = [];
    //contacts = JSON.parse(await getContact('contacts')).sort((a, b) => a.name.localeCompare(b.name));
    contacts2 = await getContactBE();
    let i = 0;
    contacts2.forEach(element => { //colors[i % 9]
        let a = { "name": element['name'], "email": element['email'], "id": element['id'] + '', "iconColor": element['iconColor'], "short": element['short'], "reg": true };
        i++;
        dummyContacts.push(a);
    });
    colorsCategory = await loadRemoteColor();
}

/**
 * Is used in loadContacts(). Fetches the contacts as a JSON Array
 * 
 * @param {string} key  key where the contacts are stored
 * @returns             JSON array that contains the list of the contats
 */
async function getContact(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    return fetch(url)
        .then(res => res.json())
        .then(res => {
            if (res.data) {
                return res.data.value;
            }
            throw `Could not find data with key "${key}".`;
        });
}

function getJ() {
    let j = {
        "id": 4,
        "title": "IT Department Konsultieren",
        "description": "Rufe in der IT an",
        "date": "2024-03-04",
        "color": "#ffffff",
        "checked": true,
        "prio": "2",
        "state": "1",
        "category": {
            "id": 3,
            "title": "Development"
        },
        "assignments": [{ "id": 4, "name": "AnniMaus" }],
        "subtask": [
            {
                "id": 46,
                "title": "Lesen",
                "checked": false
            },
            {
                "id": 47,
                "title": "Rabarba",
                "checked": true
            }
        ]
    }
    return j;
}

async function setValues(url, newCat) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", 'Token ' + "826a8ea96595f1ae6f14e374ebc715d27dc2600f");
    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(newCat),
        redirect: 'follow'
    };
    try {
        let resp = await fetch("http://127.0.0.1:8000/" + url, requestOptions);
        let json = await resp.json();
        console.log(resp);
        console.log(json);

    } catch (e) {
        // Show error message
        console.error(e);

    }
}

async function save() {
    console.log("call save");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", 'Token ' + "826a8ea96595f1ae6f14e374ebc715d27dc2600f");
    const raw = getJ();
    const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(raw),
        redirect: 'follow'
    };
    try {
        let resp = await fetch("http://127.0.0.1:8000/createTodoAPI/4/", requestOptions);
        let json = await resp.json();
        console.log(resp);
        console.log(json);

        // TODO: Redirect
        //this.router.navigateByUrl('/todos');
    } catch (e) {
        // Show error message
        console.error(e);

    }
}

/**
 * 
 * @param {string} n  Saves the JSON object of a contact with the name n in the variable 'dummy'
 */
function getJSONContact(n) {
    dummyContacts.forEach(element => {
        if (element['name'] == n) {
            dummy = element;
            return dummy;
        };
    });
}


/** Sets the actual choosen prio and saves the old one
 * In the add task dialog it sets the color of the choosen prio to rgb(255, 178, 36) and make the preiviouse white again
 * 
 * @param {*} num 
 * @param {*} id 
 */
function selectPrio(num, id) {
    prio = num;
    document.getElementById('' + id + 0).style.backgroundColor = 'white';
    document.getElementById('' + id + 1).style.backgroundColor = 'white';
    document.getElementById('' + id + 2).style.backgroundColor = 'white';
    document.getElementById('' + id + num).style.backgroundColor = calculatePrioAddTask('' + prio)[2];// 'rgb(255, 178, 36)';
    if (id == 'prioEdit') {
        setPrioWhiteColor('prioE', 'prioEdit', num);
        document.getElementById('prioE' + num).classList.add('iconWhite');
        document.getElementById('prioEdit' + num).classList.add('bold');
    } else {
        setPrioWhiteColor('prioAdd', 'prio', num);
        document.getElementById('prioAdd' + num).classList.add('iconWhite');
        document.getElementById('prio' + num).classList.add('bold');
    }

    prioOld = prio;
}

/**
 * Is executed, when the window of the screen is resized
 */

function resizeListenerAddTask() {
    if (window.innerWidth <= 800 && !isSmallAdd) {
        document.getElementById('rightSection').classList.add('d-none');
        document.getElementById('create1').classList.remove('d-none');
        isSmallAdd = true;
    } if (window.innerWidth > 800 && isSmallAdd) {
        document.getElementById('rightSection').classList.remove('d-none');
        document.getElementById('create1').classList.add('d-none');
        isSmallAdd = false;
    }
}

/**
 * Handles wheather the size of the screen is fullsize or not
 */
function sizeAction() {
    if (window.innerWidth > 800) {
        isSmallAdd = false;

    } else {
        isSmallAdd = true;
        document.getElementById('rightSection').classList.add('d-none');
        document.getElementById('create1').classList.remove('d-none');
    }
}

/**
 * Renders the HTML code for a new contact checkbox in the assigmnets selection.
 * called in addAssignment(add)
 * 
 * @param {Object} elem    A JSON objects, that represents a contact
 * @param {string} add          'Edit' add a new contact to the checkboxes in the assignment selection of a task in Edit-mode. When its '' its called in add-task mode
 */

function addContact(elem, add) {
    let t = ` <div class="selectGapArrow" onclick="stoppen(event)">
    <label style="cursor:pointer"  for="selCont${add + '' + elem['id']}">${elem['name']}</label>
    <input check${add} type="checkbox" id="selCont${add + '' + elem['id']}" name="${elem['name']}" style="cursor:pointer" />
    </div>`;
    let cont = document.getElementById('assignmentChoices' + add).innerHTML;
    document.getElementById('assignmentChoices' + add).innerHTML = '' + t + cont;
    if (add == 'Edit') { document.getElementById(`selCont${add + '' + elem['id']}`).checked = true; }

}

/**
 * 
 * @param {String} name Name of a  contact
 * @returns             return a JSON Object of a contacts with the given name (with attribute 'check')
 */
function getMemberByName(name) {
    let ret = {};
    dummyContacts.forEach(cont => {
        if (cont['name'] == name) { ret = cont; }
    });
    return ret;
}


/**
 * Renders the assigned members in the Add Task dialog
 * 
 * @param {String} id           id of the <div> that schould contain the Member
 * @param {Nodes} checkboxes    All checkboxes the the assigned Member selection
 */
function renderMemberAddTask(id, checkboxes) {

    let memberArea = document.getElementById(id);
    let memberList = [];
    checkboxes.forEach(elem => {
        if (elem.checked) {
            memberList.push(getMemberByName(elem.name));
        }
    });
    let l = 0;
    memberArea.innerHTML = "";
    memberList.forEach(element => {

        memberArea.innerHTML += ` <div style="display: flex; gap:25px;align-items: center;">
        <div class="memberDialog" style=" background-color: ${element['iconColor']};">${element['short']}</div>       
       </div>`;
        l++;
    });
}

//-------------------------------------------------------set Task categorys-------------------------------------------

/**
 * Chooses the given category (name and color) and displays it in the head closed selection.
 * 
 * @param {string} cat          name of the new category
 * @param {event} event         stops the call of the function of the enclosing div container
 */
function setCategory(cat, event) {
    stoppen(event);
    chosenCategory = cat;
    categoryColor = getTypeColorAddTask(cat);
    expandedCategory = false;
    let color = getTypeColorAddTask(chosenCategory);
    document.getElementById('selectionCategory').innerHTML = `<div class="selectionChoice"  value=${chosenCategory}>${chosenCategory} <div class="circle"  style="background-color:${color} "></div></div>`;
}

/**
 * * 
 * @param {string} key Key of the Colors stored on the remote server
 * @returns             JSON Array with the colors and names of the cateories
 */
async function getColor(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    colorsCategory = await fetch(url).then(resp => resp.json()).then(resp => resp.data.value);
    return colorsCategory;
}

/** 
 * Saves a JSON Array with the colors and names of each category and stores it in the variable colorsCategory
 *   
 */
async function loadRemoteColorOld() {
    try {
        await getColor('category');
        colorsCategory = JSON.parse(colorsCategory.replaceAll('\'', '"'));
        return colorsCategory;
    } catch (e) {
        console.info('Could not found tasks');
    }
}

// async function loadRemoteColor() {
//     const url = "http://127.0.0.1:8000/categoryAPI/"
//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
//     myHeaders.append("Authorization", 'Token ' + "826a8ea96595f1ae6f14e374ebc715d27dc2600f");//+ localStorage.getItem('token'))        
//     let cat = [];
//     const requestOptions = {
//         method: 'GET',
//         headers: myHeaders,
//         redirect: 'follow',
//     };
//     try {
//         let resp = await fetch(url, requestOptions);
//         cat = await resp.json();
//         colorsCategory = cat;
//     } catch (e) {
//         console.error(e);
//     }
//     return cat;
// }

/**
 * Renders a new Category on the Category selection
 * 
 * @param {*} event     stops the call of the function of the enclosing div container  
 */
function renderInputCategory(event) {
    event.stopPropagation();
    document.getElementById('colorChoice').classList.remove('d-none');
    document.getElementById('selectionCategory').innerHTML =
        `<div style="display:flex;justify-content: space-between;" onclick="stoppen(event)"><input style="padding-left:21px" placeholder="new catagory" id="newCategory" class="mailContact" >
    <div style="margin-right:5px;justify-content: space-between;">
        <img  src="../img/cross.svg" onclick="showCategory()">
        <img  src="../img/checkWhiteBackground.svg" style="width:25px; border-left: solid grey 1px; padding-left: 3px;" onclick="newCategoryChoosen()">
    </div></div>`;
    document.getElementById('selectionCategory').classList.add('noBackgroundImage');
}

/**
 * creates a new Category with the earlier choosen  color and the name given in the input field
 * 
 */
function newCategoryChoosen() {
    chosenCategory = document.getElementById('newCategory').value;

    if (chosenCategory != "") {
        newCategory += `<div class="selectionChoice" onclick="setCategory('${chosenCategory}',event)" value="${chosenCategory}">${chosenCategory}<div class="circle"  style="background-color:${categoryColor} "></div></div>`;
        // let elem = { "name": '' + chosenCategory, "color": '' + categoryColor };
        // colorsCategory.push(elem);
        expandedCategory = false;
        //setTask('category', colorsCategory);// delete later
        let cat = setValues('categoryAPI/', { "title": chosenCategory, "color": categoryColor });
        colorsCategory.push(cat);
        console.log("created Category", cat);
        showCategory(categoryColor);
        document.getElementById('selectionCategory').innerHTML += newCategory;
        document.getElementById('colorChoice').classList.add('d-none');

    }
}

//-----------------------------------------------------------------------------------------------------------------------------
/**
 * Removes the White Bold color of all the prioIcons
 * 
 * @param {String} prioLetter text of prio Icon
 * @param {String} prioIcon   image of proIcon
 */
function setPrioWhiteColor(prioLetter, prioIcon) {
    document.getElementById(prioLetter + '0').classList.remove('iconWhite');
    document.getElementById(prioIcon + '0').classList.remove('bold');
    document.getElementById(prioLetter + '1').classList.remove('iconWhite');
    document.getElementById(prioIcon + '1').classList.remove('bold');
    document.getElementById(prioLetter + '2').classList.remove('iconWhite');
    document.getElementById(prioIcon + '2').classList.remove('bold');
}

/**
 * Sets the background of all propicons white.
 * 
 * @param {String} prioIcon Id of the prioIcon
 */
function setBackgroundWhite(prioIcon) {
    document.getElementById(prioIcon + '0').style.backgroundColor = 'white';
    document.getElementById(prioIcon + '1').style.backgroundColor = 'white';
    document.getElementById(prioIcon + '2').style.backgroundColor = 'white';
}


/**
 * Returns information how to display the icon of the priority of a task
 * 
 * @param {string} priority     priority of a task
 * @returns                     Array with 3 strings [priority,path of the iconimage,color of the priority icon]
 */
function calculatePrioAddTask(priority) {
    let prioInfo = []
    switch (priority) {
        case '2':
            prioInfo.push('Low');
            prioInfo.push('../img/arrow.svg');
            prioInfo.push('#7be300');
            break;
        case '1':
            prioInfo.push('Medium');
            prioInfo.push('../img/equal.svg');
            prioInfo.push('#ffea00');
            break;
        case '0':
            prioInfo.push('Urgent');
            prioInfo.push('../img/arrowUpWhite.svg');
            prioInfo.push('#FF3D00');
            break;
    }
    return prioInfo;
}

/**
 * Renders all categories in the selection, when the selection is opened
 */
function showCategory() {
    let cat = `${categoryTitle} ${newCategoryField}`;
    console.log("call showCategory");
    console.log(colorsCategory);
    // checkboxes = form.querySelectorAll('input[type=checkbox]');
    if (!expandedCategory) {
        console.log(colorsCategory);
        colorsCategory.forEach(c => {
            if (c['title'] != undefined) {
                cat += `
            <div class="selectionChoice" onclick="setCategory('${c['title']}',event)" value="${c['title']}">${c['title']} <div class="circle"  style="background-color:${c['color']} "></div></div>`;
            }
        })

        document.getElementById('selectionCategory').innerHTML = cat;
        expandedCategory = true;
    } else {
        document.getElementById('selectionCategory').innerHTML = categoryTitle;
        expandedCategory = false;
        document.getElementById('selectionCategory').classList.remove('noBackgroundImage');
        document.getElementById('colorChoice').classList.add('d-none');
    }
}
//-------------------------------------------------------- check validity------------------------------------------------------------
/**
 * checks the validity of the assignments checkboxes (at least one need to be selected)
 * 
 * @param {string} id       id of the form object
 * @param {string} query    the attribut that all the relevant checkboxes contain
 */
function checkboxValidation(id, query) {
    const form = document.getElementById(id);
    checkboxes = form.querySelectorAll(query);
    firstCheckbox = checkboxes.length > 0 ? checkboxes[0] : null;
    checkValidity();
}
/**
 * 
 * @returns  is at least one checkbox selected
 */
function isChecked() {
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checked = true;
            return true;
        }
    }
    checked = false;
    return false;
}

/**
 * If no checkbox of the assignements is selected, it blend in an error message 'At least one checkbox must be selected.' at the first checkbox.
 */
function checkValidity() {
    const errorMessage = !isChecked() ? 'At least one checkbox must be selected.' : '';

    firstCheckbox.setCustomValidity(errorMessage);
    firstCheckbox.reportValidity(); // ist wichtig, dass es angezeigt wird
    setTimeout(clearfirst, 1500);
}
/**
 * deletes the error message at the first checkbox
 */
function clearfirst() {
    firstCheckbox.setCustomValidity('');
}

//----------------------------------------------------------------Subtasks----------------------------------------------------------------

/**
 * Adds the subtak that is written in the subtask input-field to the checkbox area of the subtasks
 */
function addSubtask() {
    let sub = document.getElementById('subtask').value;
    let checkedList = [];
    for (let i = 1; i < numberSubtasks; i++) {
        if (document.getElementById(`subtask${i}`).checked) {
            checkedList.push(i);
        }
    }
    if (!sub == "") {
        let t = ` <div>
        <input subtasks type="checkbox" name="${sub}" id="subtask${numberSubtasks}">
        <label id="checktext" checked for="subtask${numberSubtasks}">${sub}</label>
    </div>`;
        document.getElementById('subtasksArea').innerHTML += t;
    }
    document.getElementById('subtask').value = "";
    for (let i = 0; i < checkedList.length; i++) { document.getElementById(`subtask${checkedList[i]}`).checked = true; }
    document.getElementById(`subtask${numberSubtasks}`).checked = true;
    numberSubtasks++;
}

/**
 * 
 * @returns returns a list with the names of the subtasks, that are assigned to the currently created task
 */
function setSubtasks() {
    let form = document.getElementById('form');
    let subTasks = form.querySelectorAll('[subtasks]');
    subtasks = [];
    subTasks.forEach(element => {
        if (element.checked) {
            subtasks.push(element.name);
        }
    });
    return subtasks;
}