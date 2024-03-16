let nameUser;

async function initLegal() {
    await includeHTML();   
    addNameToHref();
}

/**
 * Make the name of the current user available in all tabs
 */
async function addNameToHref() {
    const urlParams = new URLSearchParams(window.location.search);
    const msg = urlParams.get('name');
    const id = urlParams.get('id');
    if (msg) {
      nameUser = msg;
  
    }  
    setNameToHrefs(nameUser,id);
  }
  
function toggleDropdown() {
    const dropdown = document.getElementById("dropdown");
    dropdown.classList.toggle("open");
}

