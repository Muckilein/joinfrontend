let contentContent = ""; // Saves the innerHTML of the  container with id="content"
let contentBoard = "";  // Saves the innerHTML of the  container with id="borbaner"
let contentformEdit = ""; // Saves the innerHTML of the  container with id="formEdit"
let currentDraggedElement; //id of tasks, that is dragged
let added = false;          //ist true, when some contacts are yet shown in the assingment checkboxes from the addTask (the first two contacts)
let addedEdit = false;      //ist true, when some contacts are yet shown in the assingment checkboxes form the editDialog (the first two contacts)
let editIndex = 0;          // index of the task, that is edited
let fullscreen = true;      // is the screen bigger than 800px
let nameUser;
let details = false;        // are the details of a task blend in
let isSmall;                // did we went from <800px to <=800px in the dialog
let subsEdit = [];  // the recently selected subtasks
let headCreatButton = `<img id="logo" src="../img/jLogo.svg"><span id="lineHeadText">Kanban Project Management Tool</span><button class="taskButton" id="create1" type="submit" form="form">Create<img src="../img/checkOne.svg"> </button>`;
let expandSub = false;
let addedEditsubs = false;

//---------------------------------------------------------------render tasks---------------------------------------------------------------------------------

/**
 * render als task on the board
 */
async function renderTasks() {
    //clears up all areas   
    document.getElementById('taskArea0').innerHTML = getNotTask(0,'to do');
    document.getElementById('taskArea1').innerHTML = getNotTask(1,'progress');
    document.getElementById('taskArea2').innerHTML = getNotTask(2,'awaiting feedback');
    document.getElementById('taskArea3').innerHTML = getNotTask(3,'done');
    //only not filteres tasks are shown
    for (let i = 0; i < tasks.length; i++) {

        if (!filterTask(i)) {
            //renders the task
            createTaskHTML(i);
        }
    }
    renderNoTaskLabel();
}

/**
 * Blends in a application with "no task in progress"
 */
function renderNoTaskLabel() {
    let a = isAreaEmpty();

    for (let ind = 0; ind < 4; ind++) {
        if (a[ind]) {
            document.getElementById('noTask' + ind).classList.remove('d-none');
        } else {
            document.getElementById('noTask' + ind).classList.add('d-none');
        }
    }
}


/**Creates the HTML code for a tasks with the given index (boxes of a task in the board).
 * 
 * @param {number} index  indes of the 
 */
function createTaskHTML(index) {
    let t;   
    let color = tasks[index]['color'];
    let maxSubs = tasks[index]['subtask'].length;  
    let madeSubs = getAmountMadeSubs(index);
    let barAre = '';
    if (maxSubs > 0) {
        let w = 200 * (madeSubs / maxSubs);
        barAre = ` <div class="barArea">
        <div class="bar"><div class="barColor" style="width:${w}px"></div></div>
        <div class="textBar">${madeSubs}/${maxSubs} Done</div>
        </div>`;
    }
    t = taskHTMLCode(barAre, index, color);
    document.getElementById('taskArea' + tasks[index]['state']).innerHTML += t;
    renderMember(index);
}

/**
 * 
 * @param {String} barAre 
 * @param {number} index 
 * @param {String} color  
 * @returns     String that contains the htmls code for the tasksdetails
 */
function taskHTMLCode(barAre, index, color) {
    let drag = `draggable="true" ondragstart="startDragging(${index})"`;
    let up = `<img onclick="moveState(event,1,${index})" class="moveState"   src="../img/arrowUpState.svg">`;
    let down = `<img onclick="moveState(event,0,${index})" class="moveState"  src="../img/arrow.svg">`;
    if (tasks[index]['state'] == '0') { up = ''; }
    if (tasks[index]['state'] == '3') { down = ''; }
    let t = `<div class="task" onclick="openTask(${index})" ${drag} ondblclick="toNextState(${index})">
    	    <div style="display:flex;justify-content:space-between"><div class="category" style="background-color: ${tasks[index]['color']};">${tasks[index]['category']['title']}</div>
            <div class="moveStateArrows">${up}${down}</div></div>
            <div>
                <div class="taskTitel">${tasks[index]['title']}</div>
                <div class="taskText">${tasks[index]['description']}</div>
            </div>
            ${barAre}
            <div class="taskLastSection">
            <div class="memberArea" id=memberArea${index}>        
            </div>
            <img src=${prioImage(tasks[index]['prio'])}>
            </div>
            </div>`;
             return t;
}

//-----------------------------------------------resizeing of the screen-------------------------------------------------------------

/**
 * Handles resizing to small.
 */
function resizeListernerToSmall() {
    if (dialog) {
        document.getElementById('rightSection').classList.add('d-none');
        document.getElementById('create1').classList.remove('d-none');
        document.getElementById('bordbaner').classList.add('d-none');
    }
    if (details) {
        document.getElementById('bordbaner').classList.add('d-none');
    }
    isSmall = true;
}

/**
 * Handles resizing to fullscreen.
 */
function resizeListernerToFull() {
    if (dialog) {
        document.getElementById('rightSection').classList.remove('d-none');
        document.getElementById('create1').classList.add('d-none');
        document.getElementById('bordbaner').classList.remove('d-none');
    }
    if (details) {
        document.getElementById('bordbaner').classList.remove('d-none');
    }
    isSmall = false;
}

/**
 * Is executed, when the window of the screen is resized
 */

function resizeListener() {

    if (window.innerWidth <= 800 && !isSmall) {
        resizeListernerToSmall();
    }

    if (window.innerWidth > 800 && isSmall) {
        resizeListernerToFull();
    }
}

//-----------------------------------------------------edit task--------------------------------------------------------------------
/**
 * Sets the new information, that where specified in the edit dialog to the task
 * 
 * @param {string} id       is of the form element that is responsible for the form validation and submits the editTask
 */
function editTask(id) {
    let index = editIndex;
    console.log("task",index);
    console.log(tasks[index]);
    //in add-task.js checks if at least one checkbox with attribut checkEdit is clicked
    checkboxValidation(id, '[checkEdit]');
    // if formvalidation was succesful
    if (checked) {             
       editTaskCorrectForm(index,id);
    }
    else {
        if (!expanded) {
            showCheckboxesEdit(0);
            checkboxValidation(id, '[checkEdit]');
        }
    }
}

/**
 * Creates the task with the current Values from the Input
 * @param {number} index 
 * @param {String} id     id of the Form object, that submits the editTask 
 */

function editTaskCorrectForm(index,id){
    console.log("Call Edit Correct Form");
    if (!expandSub) { openSubtasks(); }
    addSubtaskToTasks();
    //reads the required informations from all kind of inputs and set the information to the task
    tasks[index]['title'] = document.getElementById('titleEdit').value;
    tasks[index]['description'] = document.getElementById('descriptionEdit').value;
    tasks[index]['prio'] = '' + prio;
    tasks[index]['assignments'] = getAssignmentsEdit(id);
    tasks[index]['date'] = document.getElementById('dateEdit').value;
    console.log(tasks[index]['subtask']);
    console.log(tasks[index]['assignments']);
    //setTask('tasks', tasks);
    setRemoteTodos(tasks[index]);
    addedEdit = false;
    document.getElementById('taskEdit').classList.add('d-none');
    document.getElementById('dialogTask').classList.add('d-none');
    document.getElementById('bordbaner').classList.remove('d-none');
    renderTasks();
}


//------------------------------------------------------------------Open add task------------------------------------------------------------

/**
 * Opens the AddTask dialog from the board.
 * 
 * @param {number} num  the state in which the task is located: e.g. 0 for "To do", 1 for In progress
 */
async function openAddTask(num) {
   
    dialog = true;
    state = num;
    document.getElementById('assignedIcon').innerHTML = '';
    document.getElementById('subtasksArea').innerHTML = '';
    addDummyUser();
    numberSubtasks=1;
    //fullscreen
    if (window.innerWidth > 800) {
        fullscreen = true;
    }  
    else {
        openAddTaskSmallScreen();
    }
    document.getElementById("dialog").classList.remove("d-none");
    setTimeout(movePos, 150, 1);
    expandedCategory = true;
    showCategory();
}

/**
 * Adds the first two contacts of the Contactlist in the Assignment checkbox
 */
function addDummyUser(){
    if (!added) {
        addContact(users[0], '');       
        added = true;
    }
}

/**
 * Handles the opening of the addTask dialog for the smallscreen
 */
function openAddTaskSmallScreen() {
    document.getElementById('create1').classList.remove('d-none');
    document.getElementById('rightSection').classList.add('d-none');
    document.getElementById('bordbaner').classList.add('d-none');
    fullscreen = false;
}

//----------------------------------------------------------- open and close task ----------------------------------------------------------------------
/**
 * Opens the details of a task with the given id.
 * 
 * @param {number} index   the index of the task in the array
 */
function openTask(index) {
    details = true;
    editIndex = index;
    document.getElementById("dialogTask").classList.remove("d-none");
    document.getElementById("taskdialog").classList.remove("d-none");
    createTaskDetails(index);
    if (!isFull()) {
        document.getElementById('bordbaner').classList.add('d-none');
    }
}

/**
 * close the dialog of the details of the opened task
 */
function closeTask() {
    document.getElementById("dialogTask").classList.add("d-none");
    document.getElementById('bordbaner').classList.remove('d-none');
    addedEdit = false;
    details = false;
}

//------------------------------------------------------------------Assignments --------------------------------------------------------------------------
/**Blends in the checkboxes for the assignments in die edit Mode
 * 
 * @param {number} index    index of the task you wanr to edit
 */
function showAssignmentCheckboxesEdit(index) {
    let assing = tasks[index]['assignments'];
    let checkbox = document.getElementById("assignmentChoicesEdit");
    checkboxes = form.querySelectorAll('[checkEdit]');
    // checkboxes = form.querySelectorAll('input[type=checkbox]');
    if (!expanded) {
        checkbox.classList.remove('d-none');
        document.getElementById('selectionContainerEdit').classList.add('paddingButtom');
        expanded = true;
    } else {
        checkbox.classList.add('d-none');
        document.getElementById('selectionContainerEdit').classList.remove('paddingButtom');
        expanded = false;

    }
    //renders all the assigments of the tasks in the checkbox
    
    if (!addedEdit) {
        addContactEdit(assing); addedEdit = true;
    }
}

/**
 * 
 * @returns invite new Member html code
 */
function getInviteNewAssignment() {
    t = `<div class="selectGapArrow" onclick="stoppen(event)" style="position: absolute;bottom:10px;">
    <div>Invite new member</div>
    <img src="../img/mailIcon.png" onclick="changeSelect('Edit')" style="height:30px;width: auto; cursor:pointer">
    </div>`;
    return t;
}

/**
 * Renders the the given assignments as Checkboxes
 * Called from  showAssignmentCheckboxesEdit(index)
 * 
 * @param {Array} elem        An JSON Array of all assignments 
 * 
 */

function addContactEdit(elem) {
    let t = "";
    elem.forEach(element => {
        t += ` <div class="selectGapArrow" onclick="stoppen(event)">
        <label for="selContEdit${element['id']}">${element['username']}</label>
        <input checkEdit type="checkbox" id="selContEdit${element['id']}" name="${element['username']}" />
        </div>`;
    });
    document.getElementById('assignmentChoicesEdit').innerHTML = '' + t + getInviteNewAssignment();
    elem.forEach(element => {
        document.getElementById(`selContEdit${element['id']}`).checked = true;
    });
}

/**
 * Is called when a tasks is edited. 
 * It returns a list with all the contacts, that are chosen as an assigment (checkboxes are clicked) .
 * When a task is edited all of this assigments are linked to the task. 
 * 
 * @param {string} id   id of the form element, that checks the form validation of the checkboxes
 * @returns             list of all contacts that are clicked in the assignment checkboxes
 */
function getAssignmentsEdit(id) {
    let form = document.getElementById(id);
    // All checkboxes from the assignments in the editmode have the attribut 'checkEdit'
    let assignments = form.querySelectorAll('[checkEdit]');
    let newAssignments = [];
    assignments.forEach(element => {
        if (element.checked) {
            getJSONContact(element.name);
            newAssignments.push(dummy);
        }
    });
    console.log("newAssignments");
    console.log(newAssignments);
    return newAssignments;
}

/**
 * Checks, if a given contact is still in the contact List
 * 
 * @param {Object} cont   JSON Object of a contact
 * @returns               returns weather a given contact is still in the List
 */
function isContactExisting(cont) {
    let ret = false;
    dummyContacts.forEach(e => {
        if (e['username'] == cont['username']) {
            ret = true;
        }

    })
    return ret;
}

/**  
 * @param {Array} assingments  An Array of JSON of the assignments of the recent task
 * @returns                         a JSON Array of the assigned contacts of a task, that still are in the contact list
 */
function filterExistingAssignments(assingments) {
    let ass = [];
    assingments.forEach(a => {
       // if (isContactExisting(a)) {
            ass.push(a);
       // }
    })
    return ass;
}

/**
 * Displays all the members that are assigned to the task with the given index in the detailed view
 * 
 * @param {number} index  index of the task
 * @param {string} id     id of the container, where the assigned members should be displayed
 */
function renderMemberDialog(index, id) {

    let member = document.getElementById(id);
    let memberList = tasks[index]['assignments'];
    memberList = filterExistingAssignments(memberList);
    let l = 0;
    member.innerHTML = "";
    if (memberList.length > 0) {
        memberList.forEach(element => {
            member.innerHTML += ` <div style="display: flex; gap:25px;align-items: center;">
        <div class="memberDialog" style=" background-color: ${element['iconColor']};">${element['short']}</div>
        <div class="memberNameDialog">${element['username']}</div>
    </div></div>`
            l++;

        });
    }
    //tasks[index]['assignments'] = memberList;
}



/**
 * Renders the assigned members of the task in the board view (the short view)
 * 
 * @param {number } index index of the task
 */
function renderMember(index) {
    let member = document.getElementById('memberArea' + index);
    let memberList = tasks[index]['assignments'];    
    memberList = filterExistingAssignments(tasks[index]['assignments']);
    let l = 0;
    if (memberList.length > 0) {
        memberList.forEach(element => {
            member.innerHTML += ` <div class="member" style=" background-color: ${element['iconColor']}; left:${30 * l}px ">${element['short']}</div>`
            l++;
        });
    }
    tasks[index]['assignments'] = memberList;
}
