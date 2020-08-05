const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Project = require('./models/Project');
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

//handles when user runs code, saves code within a database, (wont save onto db, uncomment code inside)
app.post('/', (req, res)=>{
  if(req.body != undefined){
    //create a system to autosave, and save projects in the same document within the db
    let project = new Project({
        projectName:'New Project',
        code:req.body.paragraph_text
      });

      // commenting because i dont want to fill up the db
    // project.save()
    //   .then((data)=>{
    //     console.log(data);
    //   })
    //   .catch(err=>console.log(err));

      io.emit('projectCode', project);
  }
  
  res.redirect('/')
});


io.on('connection', socket=>{

  socket.on('create', async ({projectName, code})=>{
    if(projectName!=null){

      let temp = await Project.find({projectName:projectName});
      
      console.log(temp);

      if(temp.length>0) {
        socket.emit('status', 'A project with that name already exists!');
      }else{
        let newProject = new Project({
          projectName:projectName,
          code:code
        });
        newProject.save()
        .then((data)=>{
          console.log(data);
        })
        .catch(err=>console.log(err));
        socket.emit('status', 'createdProject');
      }
    }
  });
});

server.listen(PORT, ()=>console.log('SERVER RUNNING AT PORT: ' + PORT));
