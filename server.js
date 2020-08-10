const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const FileStore = require('session-file-store') (session);
const expressLayouts = require('express-ejs-layouts');
const http = require('http');

var sockets = require('./socketio');

const app = express();
const server = http.createServer(app);
sockets.connect(server);

const PORT = process.env.PORT || 3000;

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true });

//setup bodyparser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//set up express session
app.use(session({
  genid: (req)=>{
    return uuidv4();
  },
  store: new FileStore(),
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:true,
  maxAge: 1000*60*60*24
}));

//set up views (.ejs files), .render with express instead of with .send
app.use(expressLayouts);
app.set('view engine', 'ejs');


//set up static public files
app.use(express.static(path.join(__dirname, 'public')));

//set up routes
app.use('/users', require('./public/scripts/users'));

app.get('/', (req, res)=>{
  res.redirect('/users/login');
});

server.listen(PORT, ()=>console.log('SERVER RUNNING AT PORT: ' + PORT));
