const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Project = require('./models/Project');
const User = require('./models/User');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);
const PORT = process.env.PORT || 3000;

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true });

//setup bodyparser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', async socket=>{
  //give all projects of the current user to the front end
  let projectArr = await Project.find();
  socket.emit('userProjects', projectArr);

  socket.on('create', async ({projectName, code})=>{
    if(projectName!=null){

      let temp = await Project.find({projectName:projectName});
      
      if(temp.length>0) {
        socket.emit('status', 'A project with that name already exists!');
      }else{
        let newProject = new Project({
          projectName:projectName,
          code:code
        });
        newProject.save()
        .then()
        .catch(err=>console.log(err));
        
        socket.emit('status', {status: 'createdProject', projectName:newProject.projectName});
      }
    }
  });

  socket.on('getProject', async (projectName)=>{
    let project = await Project.findOne({projectName:projectName});
    socket.emit('project', project);
  });

  socket.on('save', ({projectName, code})=>{

    Project.update({projectName:projectName}, { $set: {code:code}})
      .then(()=>{
        socket.emit('status', {status: 'savedProject', projectName:projectName});
      })
      .catch((e)=>{
        socket.emit('status', 'An error occured while saving, please try again!');
      });

  });

  socket.on('changeName', ({currentName, newName})=>{
    Project.update({projectName:currentName}, { $set: {projectName:newName}})
      .then(()=>{
        socket.emit('changedName', {projectName: currentName, newName:newName});
      })
      .catch((e)=>{
        socket.emit('status', {status: 'An error occured while changing project name, please try again!'});
      });
  });
});

server.listen(PORT, ()=>console.log('SERVER RUNNING AT PORT: ' + PORT));
