// load all external html files with the attribut w3-include-html
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
 * Loads basic Inforamtions like Users, contacts...
 */
async function loadBasics() {
    await loadContacts();
    await includeHTML();
    colorsCategory = await loadRemoteColor();
    await loadRemoteTodos();
    setTimeout(() => {
       changeAssignments();      
       renderTasks();
    }, 500);

    

}

function changeAssignments() {
    console.log('call changeAssignments');
    tasks.forEach((t) => {
        makeAssignmentList(t)
    });
}

function makeAssignmentList(t) {
    let taskAss = t['assignments'];
    let ass = []
    taskAss.forEach((ta) => {
        let id = ta['id'];
        let aU = getUserByID(id);
        if (aU != null)
            ass.push(getUserByID(id))
    });
    t['assignments'] = ass;
}

function getUserByID(id) {
    let u = null;
    users.forEach((c) => {
        if (c['id'] == id) {
            u = c;
            return c;
        }
    });
    return u;
}

/** 
Initialized the board.
Loads: the contacts, the external html FileSystem, the tasks and renders the board
*/

async function initBoard() {
    addTask = false;
    await loadBasics();
    
    setTimeout(() => {
        renderTasks();
    }, 1500);
    addNameToHref();
    window.addEventListener("resize", resizeListener);
    if (isFull) {
        isSmall = false;
    } else {
        isSmall = true;
    }
    categoryTitle = document.getElementById('selectionCategory').innerHTML;
    //set min Date
    document.getElementById('date').min = new Date().toLocaleDateString('fr-ca');
    document.getElementById('dateEdit').min = new Date().toLocaleDateString('fr-ca');
    document.addEventListener('keyup', (event) => {
        renderTasks();
    }, false);
}

/**
 * Is called, when we are in Edit-dialog and want so go back to the board
 */
function backToBoardFromedit() {
    document.getElementById('taskEdit').classList.add('d-none');
    closeTask();
}

/**
 * retuns whether we are in fullscreen or not
 */
function isFull() {
    return (window.innerWidth > 800);
}

/**
 * Changes the position of the AddTask dialog so it slides in or out.
 * 
 * @param {number} num  num=1, when the addTask dialog is be blend in. num=0, when the taskbanner should is blend out
 */
function movePos(num) {
    if (num == 1)
        document.getElementById("askBannerDialog").classList.remove("pos");
    else { document.getElementById("askBannerDialog").classList.add("pos"); }
}

/** 
 * Closes the AddTask dialog 
 * 
 * @param {number} num   num = 1 a new task was created and the popUp ("Task addet to board") window will be blend in.
 */
function closeDialog(num) {
    document.getElementById('create1').classList.add('d-none');
    document.getElementById('rightSection').classList.remove('d-none');

    document.getElementById("askBannerDialog").classList.add("pos");
    document.getElementById("dialog").classList.add("d-none");
    if (num == 1) {
        document.getElementById('popUpAdded').classList.add('d-none');
        document.getElementById('popUpAddedContainer').classList.add('d-none');
        document.getElementById('popUpAdded').classList.remove('top');
    }
}

/**
 * filters, if a task is filtered out
 * 
 * @param {number} index  index of the task in "tasks"
 * @returns true if the task is filtered out, false if the task is not filtered out
 */
function filterTask(index) {   
    let filterValue = document.getElementById('input').value.toLowerCase();
     
    let title = tasks[index]['title'].toLowerCase();
    let descrip = tasks[index]['description'].toLowerCase();
   
    if (!filterValue == "") {
        return (!(title.includes(filterValue) || descrip.includes(filterValue)));
    }
    return false;
}

/**
 * Every task ha a priority. The function gives the icon to a given priority
 * 
 * @param {string} num      Priority 2 is low, 1 is equal and 0 is urgent
 * @returns                 gives the path of the image
 */
function prioImage(num) {
    switch (num) {
        case '2': return '../img/arrow.svg'; break;
        case '0': return '../img/arrowUp.svg'; break;
        case '1': return '../img/equal.svg'; break;
    }
}

/**Set the task that shellbe moved
 * 
 * @param {number} id  index of the task, that should be moved
 */
function startDragging(id) {
    currentDraggedElement = id;
}

function allowDrop(ev) {
    ev.preventDefault();
}

/** * 
 * @returns  A list with boolean values. For every state area ("To do"...) the entry show whether its empty or not
 */
function isAreaEmpty() {
    let list = [true, true, true, true];
    tasks.forEach(element => {
        let a = element['state'];
        switch (a) {
            case '0': list[0] = false; break;
            case '1': list[1] = false; break;
            case '2': list[2] = false; break;
            case '3': list[3] = false; break;
        }
    });
    return list;
}
/**
 * Moves a task to an other state area
 * 
 * @param {number} num      The state to which the dragged task shell be moved
 */
function moveTo(num) {
    tasks[currentDraggedElement]['state'] = '' + num;
    renderTasks();
    setRemoteTodos(tasks[currentDraggedElement]);

}

/**
 * Action when klick the loop icon. Deletes what os written in the field
 */
function clickLoop() {
    document.getElementById('input').value = "";
    renderTasks();

}

/**
 * 
 * @param {number} stateArea   Number of the state area (0 is "To do")   
 * @returns                    return the HTML code of the placeholder "No task in progress", when a state area has no tasks
 */
function getNotTask(stateArea, cat) {
    return `<div id="noTask${stateArea}" class="noTask d-none";>No task in ${cat}</div>`;
}


/**
 * 
 * @param {Array} array Contains an array with bool that shows weather a subtasktasks was made or not (true means have to to them, false done)
 * @returns             Amount of subs, that are made
 */
function getAmountMadeSubs(index) {
    let t = tasks[index];
    let subs = t['subtask'];
    let i = 0;
    subs.forEach(s => {
        if (s['checked']) i++;
    });
    return i;
}

/**
 * Closes all checkboxes
 */
function unshowCheckboxesEdit() {
    if (expanded) {
        showAssignmentCheckboxesEdit(0);

    }
    if (expandSub) {
        openSubtasks();
    }
}

function getIndexOfSub(subs, element) {
    let i = 0;
    let index = -1;
    subs.forEach((s) => {
        if (s['title'] == element.name) {
            index = i;
        }
        i++;
    });
    return index;
}

/**
 * Add the selected subtast to the task
 */
function addSubtaskToTasks() {
    let checkbox = document.getElementById("subtasksEdit");
    let checkboxes = checkbox.querySelectorAll('[subEdit]')
    //tasks[editIndex]['maxSubs']= checkboxes.length;
    let subs = tasks[editIndex]['subtask'];
    checkboxes.forEach(element => {
        if (getIndexOfSub(subs, element) < 0) {
            let su = { "id": "null", "title": element.name, "checked": false };
            tasks[editIndex]['subtask'].push(su);
        }
    });
    let i = 0;
    checkboxes.forEach(element => {
        if (element.checked) {
            tasks[editIndex]['subtask'][i]['checked'] = true;
        } else { tasks[editIndex]['subtask'][i]['checked'] = false; }
        i++;
    });
}
function addSubtaskToTasksOLD() { //--------------------------------------------------------------------------delete------------------
    let checkbox = document.getElementById("subtasksEdit");
    let checkboxes = checkbox.querySelectorAll('[subEdit]')
    //tasks[editIndex]['maxSubs']= checkboxes.length;
    let subs = tasks[editIndex]['subtask'];
    checkboxes.forEach(element => {
        if (subs.indexOf(element.name) < 0) {
            tasks[editIndex]['subtask'].push(element.name);

            tasks[editIndex]['checked'].push(false);
        }
    });
    let i = 0;
    checkboxes.forEach(element => {
        if (element.checked) {
            tasks[editIndex]['checked'][i] = true;
        } else { tasks[editIndex]['checked'][i] = false; }
        i++;
    });
}

/**
 * adds the subtask from the input to the selection
 */
function addSubtaskEdit() {
    let sub = document.getElementById('inputSub').value;
    if (sub != "") {
        let newSub = {
            "id": 'null',
            "title": sub,
            "checked": true
        };
        subsEdit.push(newSub);
        addSubEdit(subsEdit);
    }
}

/**
 * creates the checkboxes for a given array of subtasks
 * 
 * @param {Array} sub  Array of String: The subtasks for which a checkbox should be created
 */
function addSubEdit(sub) {
    let t = "";
    let i = 0;
    let subs = sub;
    t = "";
    subs.forEach(element => {
        console.log(element);

        t += ` <div class="selectGapArrow" onclick="stoppen(event)">
        <label for="subsEdit${i}">${element['title']}</label>
        <input subEdit type="checkbox" id="selSubEdit${i}" name="${element['title']}" checked = ${element['checked']}  />
        </div>`;
        i++;
    });
    let input = ` <div style="position:relative;" onclick="stoppen(event)"><input placeholder="add a Subtask" style="font-size: 21px;position:absolute; margin-top: 5px; margin-left: 20px; left:0px;" id="inputSub"><img  style="width:20px; position:absolute; right:5px;"src="../img/checkWhiteBackground.svg" onclick="addSubtaskEdit()"><div>`;

    document.getElementById('subtasksEdit').innerHTML = `` + t + input;
    let checkboxes = document.getElementById('subtaskContainerEdit').querySelectorAll('[subEdit]');
    i = 0;
    checkboxes.forEach(element => {
        element.checked = subsEdit[i]['checked'];
        i++;
    });

};

/**
 * Blends in the subtask selection with the checkboxes in the edit mode
 */
function openSubtasks() {

    let checkbox = document.getElementById("subtasksEdit");
    if (!expandSub) {
        checkbox.classList.remove('d-none');
        document.getElementById('subtaskContainerEdit').classList.add('paddingButtomEdit');
        expandSub = true;
        // addSubEdit(tasks[editIndex]['subtask']);
        addSubEdit(subsEdit);

    } else {
        checkbox.classList.add('d-none');
        document.getElementById('subtaskContainerEdit').classList.remove('paddingButtomEdit');
        expandSub = false;

    }
}

/**
 * 
 * @param {String} prio priority of a task
 * @returns             return background Color of the priority Icon
 */
function setColorEdit(prio) {
    let p = tasks[editIndex]['prio'];
    if (prio != p) {
        return 'white';
    } else {
        let c = calculatePrio(prio);
        return c[2];
    }
}

/**
 * Returns information how to display the icon of the priority of a task
 * 
 * @param {string} priority     priority of a task
 * @returns                     Array with 3 strings [priority,path of the iconimage,color of the priority icon]
 */
function calculatePrio(priority) {
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
 * Gives back a lilst of Subtasks of a given task that are not done yet. They are shoown in the detail view of a task.
 * 
 * @param {number} index Index of the task
 * @returns              Returns the unchecked  subtasks of a task with the given index(subtasks to do)
 */
function getActiveTasks(index) {
    let list = [];
    let subs = tasks[index]['subtask'];
    for (let i = 0; i < subs.length; i++) {
        if (!subs[i]['checked']) {
            list.push(subs[i]['title']);
        }
    }
    return list;
}

/**
 * displays the informations of the tasks in the edit dialog
 * 
 * @param {number} index    index of the task
 */
function displayTaskDetailsEdit(index) {
    let elem = tasks[index];
    let p = parseInt(tasks[index]['prio'], 10);
    selectPrio(p, 'prioEdit');
    document.getElementById('titleEdit').value = elem['title'];
    document.getElementById('descriptionEdit').value = elem['description'];
    document.getElementById('dateEdit').value = elem['date'];
    renderMemberDialog(index, 'memberDialogSectionEdit');
    document.getElementById('taskEdit').classList.add('gap');
    showAssignmentCheckboxesEdit(index);
    document.getElementById('prioEdit0').style.backgroundColor = setColorEdit('0');
    document.getElementById('prioEdit1').style.backgroundColor = setColorEdit('1');
    document.getElementById('prioEdit2').style.backgroundColor = setColorEdit('2');
    // if (!expandSub) {
    //     openSubtasks();
    // }
    expandSub = false;
    openSubtasks();
}

/**
 * Displayd the edit dialog and insert all the actual data of the task
 * 
* @param {number} index     index of the task, that shell be deleted
 * @param {boolean} full    fullstrean or not
 */

function editdialog(index) {
    editIndex = index;
    subsEdit = [];
    let i = 0;
    tasks[editIndex]['subtask'].forEach(element => {
        subsEdit.push(element);
        i++;
    });
    document.getElementById('taskEdit').classList.remove('d-none');
    document.getElementById('dialogTask').classList.remove('d-none');
    document.getElementById('taskdialog').classList.add('d-none');
    displayTaskDetailsEdit(index);
}
