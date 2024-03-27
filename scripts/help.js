let userName;


async function initHelp(){ 
    const urlParams = new URLSearchParams(window.location.search);
    userName = urlParams.get('name');
    const id = urlParams.get('id');  
    setTimeout(setNameToHrefs,1000,userName,id);
}

