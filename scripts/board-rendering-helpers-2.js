/**
 * Sometimes onsubmit="function();return false;" does not prevent the page from reload.
 * This function stops the reload for a form element with the given id
 * 
 * @param {string} id   id of the form object
 */
function preventLoadNew(id) {
    let form = document.getElementById(id);
    // Adds a listener for the "submit" event.
    form.addEventListener('submit', function (e) {
        e.preventDefault();
    })
}

/**
 * Make the name of the current user available in all tabs
 */
async function addNameToHref() {
    const urlParams = new URLSearchParams(window.location.search);
    const msg = urlParams.get('name');

    if (msg) {
        nameUser = msg;
    }
    setNameToHrefs(nameUser);
}

/**
 * delets the task with the given id
 * 
* @param {number} index     indes of the task, that shell be deleted
 * @param {boolean} full    fullstrean or not
 */
async function deleteTask(index, full) {
    tasks.splice(index, 1);
    await setTask('tasks', tasks);
    if (full) {
        closeTask();
    } else {

        backToBoardFromedit();
    }
    setTimeout(renderTasks, 200);
}

/**
 * Moves a task to another state depending on "upDown"
 * 
 * @param {event} event     Stops the call of the function of the enclosing div container
 * @param {number} upDown   1 we clicked on arrow up, 0 we clicked on arrow down
 * @param {index} index     index of the current tasks
 */
function moveState(event, upDown, index) {
    stoppen(event);
    let state = parseInt(tasks[index]['state'], 10);
    if (upDown == 1 && state > 0) {
        state--;
        tasks[index]['state'] = '' + state;
    }
    if (upDown == 0 && state < 4) {
        state++;
        tasks[index]['state'] = '' + state;
    }
    setTask('tasks', tasks);
    renderTasks();
}

//-------------------------------------------------------------------------Render Task Details------------------------------------------------------------
/**
 * Fullscreen: Renders the detailed view of a task 
 * Not a fullscreen: it returs the html code for the detailed view. This is used in openTask(index)
 * 
 * @param {number} index    index of the task
 * @param {boolean} full    fullscreen or not fullscreen
 * @returns                 returs the html code for the detailed view
 */
function createTaskDetails(index) {

    let pr = calculatePrio(tasks[index]['prio']);
    // let taskList = tasks[index]['subtask'];

    let subT = getHTMLSubtasksinDetails(index);
    let t = getHTMLTaskDetails(index, pr, subT);
    document.getElementById('taskdialog').innerHTML = t;
    //renders the assigend member of the task
    renderMemberDialog(index, 'memberDialogSection');
    return t;
}

/**
 * 
 * @param {number} index Index of the current task.
 * @returns              return HTML code of the Subtasks in the details
 */
function getHTMLSubtasksinDetails(index) {
    let taskList = getActiveTasks(index);
    let subT = "";
    //HTML code, if there are subtasks
    if (taskList.length > 0) {
        subT = `<div style="display:flex;flex-direction:column; gap :25px">
    <div class="titleTaskDialog">Subtasks</div>    
    </div>`;
    }
    taskList.forEach(element => {
        subT += `<li class="taskTextDialog">${element}</li>`;
    });
    return subT;
}

/**
 * 
 * @param {number} index 
 * @param {Array} pr     An array that contain information about the priority(name,iconimage and color)
 * @param {String} subT  String that renders the subtasks
 * @returns              String with the HTML content of the task details
 */
function getHTMLTaskDetails(index, pr, subT) {
    let t = `  <img src="../img/cross.svg" class="cossDialog" onclick="closeTask()">
        <div id="buttonDialog" class="buttonDialog">
            <img src="../img/delete button v1.svg" alt="garbage" style="cursor:pointer" onclick="deleteTask(${index},true)">
            <img src="../img/edit button v1.svg" alt="pencil" style="cursor:pointer" onclick="editdialog(${index})">
        </div>
        <div class="categoryDialog" style="background-color: ${tasks[index]['color']};">${tasks[index]['category']}</div>
        <div class="taskTitelDialog">${tasks[index]['title']}</div>
        <div class="taskTextDialog">${tasks[index]['discription']}</div>
        <div style="display:flex; gap :25px">
        <div class="titleTaskDialog">Due Date</div>
        <div class="dateDialogNum">${tasks[index]['date']}</div>
        </div>
        <div style="display:flex; gap :25px ;align-items: center;">
        <div class="titleTaskDialog">Priority</div>
        <div class="categoryPrio" style=" background-color: ${pr[2]};" >${pr[0]}<img class="iconWhite" src=${pr[1]}></div>
        </div>
        ${subT}
        <div class="titleTaskDialog">Assigned To</div>
        <div class="memberDialogSection" id="memberDialogSection" style="display:flex;gap:10px;flex-direction:column;">    
        </div>`;
        return t;
}
