const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Project = require('./models/Project');
const User = require('./models/User');
const http = require('http');
const socketio = require('socket.io');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const FileStore = require('session-file-store') (session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);
const PORT = process.env.PORT || 3000;

require('dotenv').config();

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    console.log('Inside local strategy callback')
    
    const user = null;
    User.findOne({email:email})
      .then(e=>user=e)
      .catch(err=>console.log(err));

    if(email === user.email && password === user.password) {
      console.log('Local strategy returned true')
      return done(null, user)
    }
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  console.log('Inside serializeUser callback. User id is save to the session file store here')
  done(null, user.id);
});


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true });

//setup bodyparser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//set up static files
app.use(express.static(path.join(__dirname, 'public')));

//set up express session
app.use(session({
  genid: (req)=>{
    return uuidv4();
  },
  store: new FileStore(),
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());

//set up routes
const users = require('./routes/users/users');
app.use('/users', users);


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
