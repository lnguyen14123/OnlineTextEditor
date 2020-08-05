const socket = io();
const typingArea = document.getElementById('typing-area');
const runBtn = document.getElementById('run-btn');
const createBtn = document.getElementById('create-btn');


socket.on('status', status=>{

  if(status == 'createdProject'){
    alert('New project created!');
  }else{
    alert(status);
  }
});

createBtn.addEventListener('click', (e)=>{
  let code = typingArea.value;
  let projectName = prompt('Choose a name for your project!');

  while(projectName==''){
    projectName = prompt('Error: project name must be longer than 0 characters');
  }
  socket.emit('create', {projectName ,code});
});

typingArea.addEventListener('keydown', (e)=>{
  if(e.key == "Tab"){
    insertTextAtCursor(typingArea, "    ");
    e.preventDefault();
    e.stopPropagation();
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
