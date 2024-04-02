let userName;
/**
 * This function initializes the startup process by loading the summary.
 */
async function initSummary() {
    await includeHTML();
    //await loadRemote();
    await loadRemoteTodos();   
    await loadRemoteTodos(); 
    await tasksForSummary();
    await urgentTask();
    getTimeandGreets();
  
}

/**
 * This function counts the tasks.
 */
async function tasksForSummary() {
    let countTodo = tasks.filter(task => task.state === '0').length;
    let countProgress = tasks.filter(task => task.state === '1').length;
    let countFeedback = tasks.filter(task => task.state === '2').length;
    let countDone = tasks.filter(task => task.state === '3').length;
    document.getElementById('amountBoard').innerHTML = tasks.length;
    document.getElementById('amountTodo').innerHTML = countTodo;
    document.getElementById('amountProgress').innerHTML = countProgress;
    document.getElementById('amountFeedback').innerHTML = countFeedback;
    document.getElementById('amountDone').innerHTML = countDone;
}


/**
 * This function filters the urgent tasks and displays the next deadline due.
 */
async function urgentTask() {
    let countUrgentTasks = tasks.filter(task => task.prio === '0').length;
    document.getElementById('amountUrgent').innerHTML = countUrgentTasks;

    let urgentTasks = tasks.filter(task => task.prio === '0' && task.date);
    urgentTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (urgentTasks.length > 0) {
        let nextDueDate = new Date(urgentTasks[0].date);
        let formattedDate = nextDueDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        document.getElementById('date').innerHTML = formattedDate;
    } else {
        document.getElementById('date').innerHTML = '';
    }
}

/**
 * This function generates a personalized greeting message based on the current time of day.
 */
async function getTimeandGreets() {
    // const urlParams = new URLSearchParams(window.location.search);
    let userName =  localStorage.getItem('username');
    console. log(userName);
    // userName = urlParams.get('name');
    // const id = urlParams.get('id');
    let greetingTextElement = document.getElementById('greetingText');
    let userElement = document.getElementById('user');
    let today = new Date();
    let currentHour = today.getHours();
    let greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good day' : 'Good evening';

    if (userName === null || userName === '') {
        userElement.textContent = 'Guest';
        greetingTextElement.textContent = greeting + ',';
        greetingTextElement.style.color = 'black';
    } else {
        userElement.textContent = userName;
        greetingTextElement.textContent = greeting + ',';
    }
 
};

/**
 * This function redirects to the board.
 */
function openBoard() {
    window.location.href = `board.html?name=${userName}`;
}



