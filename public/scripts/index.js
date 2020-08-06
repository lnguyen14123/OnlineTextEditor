const socket = io();
const typingArea = document.getElementById('typing-area');
const runBtn = document.getElementById('run-btn');
const createBtn = document.getElementById('create-btn');
const changeNameBtn = document.getElementById('change-name-btn');
const selectProject = document.getElementById('project-select');
const infoDisplay = document.getElementById('info-display');

const TAB_SIZE = 4;
const SAVE_INTERVALS = 3;
let saved = true;

//recieve code projects of user from the server
socket.on('userProjects', projectArr=>{
  projectArr.forEach(element => {
    let newP = document.createElement('option');
    newP.appendChild(document.createTextNode(element.projectName));
    selectProject.appendChild(newP);
  });  
  socket.emit('getProject', getProjectName());
});

//handle the response of project create
socket.on('status', ({status, projectName}) => {
  if(status == 'createdProject'){
    infoDisplay.innerHTML = 'New project created!';
    let newP = document.createElement('p');
    newP.value = projectName;
    selectProject.appendChild(newP);
  } else if(status == 'savedProject'){
    infoDisplay.innerHTML = projectName + " successfully saved!";
  }else if(status == 'changedName'){
    infoDisplay.innerHTML = 'Changed name to ' + projectName;
    
  }else{
    alert(status);
  }
});

socket.on('project', (project) => {
  typingArea.value = project.code;
});


selectProject.onchange = (e)=>{
  socket.emit('getProject', getProjectName());
};

//create a new project
createBtn.addEventListener('click', (e)=>{
  let code = typingArea.value;
  let projectName = prompt('Choose a name for your project!');

  while(projectName==''){
    projectName = prompt('Error: project name must be longer than 0 characters');
  }
  socket.emit('create', {projectName ,code});
});

//run the project
runBtn.addEventListener('click', (e)=>{
  console.clear();
  try{
    eval(typingArea.value);
  }catch(e){
    console.log('Error');
  };
});

//change name of project
changeNameBtn.addEventListener('click', (e)=>{
  let newName = prompt('Choose a new name for the project!');

  while(newName==''){
    newName = prompt('Error: project name must be longer than 0 characters');
  }
  let currentName = getProjectName();

  socket.emit('changeName', {currentName ,newName});
});

//tabbing and delete tab functionality
typingArea.addEventListener('keydown', (e)=>{
  //stop default tabbing functionality
  if(e.key == "Tab"){
    insertTextAtCursor(typingArea, " ".repeat(TAB_SIZE));
    e.preventDefault();
    e.stopPropagation();
  } else if(e.key == 'Backspace'){
    let cursorPos = typingArea.selectionStart;
    if(cursorPos>=TAB_SIZE){
      let code = typingArea.value;
      let tab = true;
      for(var i = cursorPos-TAB_SIZE; i<cursorPos; i++){
        if(code[i]!=' '){
          tab = false;
        }
      }
      if(tab){
        e.preventDefault(); 
        typingArea.value = code.slice(0, cursorPos-TAB_SIZE)+code.slice(cursorPos);
        typingArea.selectionStart = cursorPos-TAB_SIZE;
        typingArea.selectionEnd = cursorPos-TAB_SIZE;
      }
    }
  }
});

//handle autosave
typingArea.addEventListener('keypress', (e)=>{
  //autosave functionality
  if(saved){
    setTimeout(()=>{
      saveProject();
      saved = true;
    }, 1000*SAVE_INTERVALS);
    saved = false;
    infoDisplay.innerHTML = 'saving project . . .';
  }
});


function insertTextAtCursor(el, text) {
  var val = el.value, endIndex, range, doc = el.ownerDocument;
  if (typeof el.selectionStart == "number"
          && typeof el.selectionEnd == "number") {
      endIndex = el.selectionEnd;
      el.value = val.slice(0, endIndex) + text + val.slice(endIndex);
      el.selectionStart = el.selectionEnd = endIndex + text.length;
  } else if (doc.selection != "undefined" && doc.selection.createRange) {
      el.focus();
      range = doc.selection.createRange();
      range.collapse(false);
      range.text = text;
      range.select();
  }
}

function getProjectName(){
  return selectProject.options[selectProject.selectedIndex].value;
}

function saveProject(){
  let code = typingArea.value;
  let projectName = getProjectName();
  socket.emit('save', {projectName, code});
}

