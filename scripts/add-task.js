/**
 * return the color of the icon of the task type
 * 
 * @param {string} type     type of the task like: Design, Marketing....
 * */
function getTypeColorAddTask(type) {

    let c = "";
    colorsCategory.forEach(col => {
        if (col['name'] == type)
            c = col['color'];
    });
    return c;
}

/**
 * Reads the name of the logged in Person from the query parameter and saves it
 */
function readQueryParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const msg = urlParams.get('name');

    if (msg) {
        userNameAddTask = msg;
    }
}

/**
 * Loads basic data lile User, Contacts, Categories
 */
async function loadBasicsAddTask(){
    loadContacts();
    await includeHTML();
    await loadRemote();
    colorsCategory = await loadRemoteColor();
    addContact(dummyContacts[0], '');
    addContact(dummyContacts[1], '');
}

/** 
Initialized add-task.
Loads: the contacts, the external html FileSystem, and two contacts that are shown in the assignemnt selection
*/

async function init() {
    expanded = false;
    addTask = true;
    loadBasicsAddTask();
    readQueryParameters();
    setNameToHrefs(userNameAddTask);
    // Handles the rezising
    window.addEventListener("resize", resizeListenerAddTask);
    //Handles wheather the size of the screen is fullsize or not
    sizeAction();
    categoryTitle = document.getElementById('selectionCategory').innerHTML;
    // Sets the minDate
    document.getElementById('date').min = new Date().toLocaleDateString('fr-ca');
}

/**
 * When a task is created/edited than we need the possibility to search for contacts that can be assigned to the task.
 * This funtion switched between the checkboxes of contacts that can be assigned and the input field,where we enter the
 * email of a contact that should be assigned
 * 
 * @param {string} add   is 'Edit', when we are in the Edit-mode of a task. If a new task is creatd it is '';
 * 
 */
function changeSelect(add) {
    if (!changed) {
        document.getElementById('selectionContainer' + add).classList.add('d-none');
        document.getElementById('addContact' + add).classList.remove('d-none');

        changed = true;
    } else {
        document.getElementById('selectionContainer' + add).classList.remove('d-none');
        document.getElementById('addContact' + add).classList.add('d-none');
        document.getElementById('mailContact' + add).value = "";
        changed = false;
    }
}

/**
 * Clears every entry in Add-Task
 *
 */
function clearInput() {
    // clears all the inuts
    document.getElementById("title").value = "";
    document.getElementById("discription").value = "";
    document.getElementById("date").value = "";
    document.getElementById("subtask").value = "";
    for (let i = 0; i < 3; i++) {
        document.getElementById('prio' + i).style.backgroundColor = "white";
    }
    let subTasks = form.querySelectorAll('[subtasks]');
    // resets all the subtasks to unclick
    subTasks.forEach(element => {
        if (element.checked) {
            element.click();
        }
    });
    //unchecks all the checkboxes of the assignment
    uncheckAll();
    if (expanded) {
        showCheckboxes();
    }
}

/**
 *  Blend in/out the popUp "Task added to board"
 * @param {number} num num = 1 blend out, otherwise blend in the popUp
 */
function removeBottom() {
    document.getElementById('popUpAdded').classList.remove('bottom');
}

/**
 * Make the popUp ("Task addet to board") moves up
 */
function movePopUp() {
    document.getElementById('popUpAdded').classList.add('bottom');
}

function handlePopUpAfterSuccess() {
    document.getElementById('popUpAdded').classList.remove('d-none');
    document.getElementById('popUpAddedContainer').classList.remove('d-none');
    //PopUp ("Task addet to board") moves up
    setTimeout(movePopUp, 100);
    setTimeout(removeBottom, 1300);
    if (!dialog) { setTimeout(removePopUP, 1000); }
}

/**
 * Removes the pop up, that appears when a task is succesfully created
 */
function removePopUP() {
    document.getElementById('popUpAdded').classList.add('d-none');
    document.getElementById('popUpAddedContainer').classList.add('d-none');
    // document.getElementById('popUpAdded').classList.remove('top');
}

/**
 * Handles what happens when we return to the board from the addtask dialog
 */
function handleDialog(newCreated) {
    document.getElementById('bordbaner').classList.remove('d-none');
    if (newCreated) {
        handlePopUpAfterSuccess();

        //moves dialog out
        setTimeout(movePos, 875, 0);
        //blend out dialog
        setTimeout(closeDialog, 1000, 1);
        setTimeout(renderTasks, 1000);

    } else {
        setTimeout(movePos, 350, 0);
        setTimeout(closeDialog, 500, 0);
    }
}

/**
 * Handlles the pop up after a Task was creates directly form the addtask.html
 */

function handleAddTaskHTML(newCreated) {
    if (newCreated) {
        handlePopUpAfterSuccess();

    }
    document.getElementById('colorChoice').classList.add('d-none');
    expandedCategory = true;
    showCategory();
}

/**
 * return back from AddTask
 * 
 * @param {boolean} newCreated   was a new task succesfully created
 */

function returnFromAddTask(newCreated) {

    // delete content of all inputs
    clearInput();

    if (dialog) {
        handleDialog(newCreated);

    } else {
        handleAddTaskHTML(newCreated);
    }
    setPrioWhiteColor('prioAdd', 'prio', prio);
    setBackgroundWhite('prio');
    dialog = false;
}

/**
 * Actions that should be performed, when the cross in the AddTask dialog is clicked.
 */
function crossAddTask() {
    closeDialog();
    document.getElementById('popUpAdded').classList.add('d-none');
    document.getElementById('popUpAddedContainer').classList.add('d-none');
    dialog = false;
    document.getElementById('bordbaner').classList.remove('d-none');
    setPrioWhiteColor('prioAdd', 'prio', prio);
    setBackgroundWhite('prio');
}

function validationCategory() {
    document.getElementById('selectionCategory').classList.add('red');
    setTimeout(setWhite, 500);
}

function setWhite() {
    document.getElementById('selectionCategory').classList.remove('red');
}

//-------------------------------------------------create Task-----------------------------------------------------------------
/**
 * Creates a new task.
 * 
 * @param {boolean} calledFromBoard  If we call the function from Board
 */
async function createTask() {

    checkboxValidation('form', '[check]');
    if (chosenCategory == "") {
        validationCategory();
    }
    else {
        if (checked) {
            handleCreateTaskCorrectForm();
        } else {
            if (!expanded) {
                showCheckboxes();
                firstCheckbox.reportValidity();
            }
        }
        checked = false;
    }
}

/**
 * Handles the createTask, when the Form validation was successfull.
 * Actually creates the new task
 */
function handleCreateTaskCorrectForm() {

    let checked = [];
    let st = setSubtasks();
    st.forEach(s => {
        checked.push(false);
    })
    checkedContacts();

    let task = giveTask(st, checked);

    document.getElementById('prio' + prioOld).style.backgroundColor = 'white';
    tasks.push(task);
    //saves tasks remote
    setTask('tasks', tasks);
    // handles what happend after the task was created      
    returnFromAddTask(true);
    if (addTask) { setTimeout(backBoard, 1500); }
}

/**
 * Return a new task
 * 
 * @param {Array} st    Array of String Subtasks      
 * @param {Array} checked Array of boolean containing weather a subtasks is fulfilled or not
 * @returns return a new task
 */
function giveTask(st, checked) {
    let task = {
        "title": `${document.getElementById("title").value}`,
        "discription": `${document.getElementById("discription").value}`,
        "category": chosenCategory,
        "assignments": addedContacts,
        "date": `${document.getElementById("date").value}`,
        "prio": '' + prio,
        "subtask": st,
        "state": '' + state,
        "color": '' + categoryColor,
        "maxSubs": '' + st.length,
        "checked": checked,
    }

    return task;
}

function backBoard() {
    window.location.href = `./board.html?name=${userNameAddTask || 'Guest'}`;
}

//---------------------------------------------------------------------------------------------------------------------------------------
/**
 * Calls showCategory() even if the enclosing div container calls an other function.
 * 
 * @param {event} event Button click event 
 */
function showCategoryPrevent(event) {
    stoppen(event);
    showCategory();
}

/**
 * 
 * @param {event} event     stops the call of the function of the enclosing div container
 * @param {string} color    choosen color
 * @param {number} idNr     number of the 6 available color
 */
function chooseColor(event, color, idNr) {
    stoppen(event);
    categoryColor = color;
    for (let i = 1; i < 7; i++) {
        if (i != idNr) { document.getElementById(`c${i}`).classList.remove('bigger'); }
    }
    document.getElementById(`c${idNr}`).classList.add('bigger');
}

/**
 * Sets all checkboxes, that are saved in "checkboxes" to not klicked
 */
function uncheckAll() {

    if (checkboxes) {
        checkboxes.forEach(element => {
            if (element.checked)
                element.click();
        });
    }
}

/**
 * 
 * @param {string} name  name of a Contact where we want to knwo if it is already in the checkboxes
 * @param {string} add   "" when we are in add task mode, "Edit", when we are in edid mode
 * @returns             Is the given name already in the List of the checkboxes       
 */
function isAllreadyInSelection(name, add) {
    let b = false;
    let addLow = add.toLowerCase();
    checkboxes = document.getElementById('form' + add).querySelectorAll(`[check${addLow}]`);
    checkboxes.forEach(
        e => {
            if (e.name == name) {
                b = true;
            }
        }
    );
    return b;
}

/**Applies a contact (with the email adress written in the input 'mailContact') from the contact list to the checkboxes.
 * 
 * @param {string} add  'Edit' add a new contact to the checkboxes in the assignment selection of a task in Edit-mode. When its '' its called in add-task mode
 */
function addAssignment(add) {
    let mail = document.getElementById('mailContact' + add).value;
    let b = false;
    dummyContacts.forEach(element => {
        if (element['email'] == mail) {
            //dummyContact = element;
            if (!isAllreadyInSelection(element['name'], add)) {
                addContact(element, add);
                changeSelect(add);

            } else {
                document.getElementById('mailContact' + add).value = 'Schon zugewiesen';
            }
            b = true;
        }

    });
    if (!b) { document.getElementById('mailContact' + add).value = 'Keine gültige Mail'; }
}

/**
 * Saves a list of all assigned contacts in the variable addedContacts.This list is saved later in the 'assignments' from a tasks JSON Object
 */
function checkedContacts() {
    addedContacts = []
    let form = document.getElementById('form');
    checkboxes = form.querySelectorAll('[check]');

    //adds the JSON Object of a clicked contact in addedContacts
    checkboxes.forEach(element => {
        if (element.checked) {
            getJSONContact(element.name)
            addedContacts.push(dummy);
        }
    });
}


function closeAllSelections(event) {

    if (expanded) {
        showCheckboxes();
    }
    if (expandedCategory) {
        showCategory(event);
    }
}

/**
 * Blends in/out the selection with the assigment checkboxes
 */
function showCheckboxes() {
    let checkbox = document.getElementById("assignmentChoices");
    checkboxes = document.getElementById('form').querySelectorAll('[check]');
    // checkboxes = form.querySelectorAll('input[type=checkbox]');
    if (!expanded) {
        checkbox.classList.remove('d-none');
        document.getElementById('selectionContainer').classList.add('paddingButtom');
        // if (window.innerWidth < 800) { document.getElementById('selectionContainer').style.paddingBottom = "50px"; }
        expanded = true;
    } else {
        checkbox.classList.add('d-none');
        // if (window.innerWidth < 800) { document.getElementById('selectionContainer').style.paddingBottom = "5px"; }
        document.getElementById('selectionContainer').classList.remove('paddingButtom');
        expanded = false;
        renderMemberAddTask('assignedIcon', checkboxes);
    }
}

/**
 * Prevents a object from the standard action if clicked. E.g if a <div> has an onclick() function but an inner <div> should act differently.
 * This method prevents that the onclick() function of the outer <div> runs, when the inner <div> is clicked.
 * 
 * @param {event} event    
 */
function stoppen(event) {
    event.stopPropagation();
}

