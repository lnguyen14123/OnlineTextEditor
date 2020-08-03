const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Project = require('./models/Project');
const { EDESTADDRREQ } = require('constants');
require('dotenv/config');

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true });


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.post('/', (req, res)=>{

  if(req.body){
    //create a system to autosave, and save projects in the same document within the db
    
    let project = new Project({
        code:req.body
      });
    
      project.save()
        .then((data)=>{
          console.log(data);
        })
        .catch(err=console.log(err));
      
      res.redirect('/')

  }

});

app.listen(PORT, ()=>console.log('SERVER RUNNING AT PORT: ' + PORT));
