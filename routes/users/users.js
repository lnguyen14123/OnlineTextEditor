const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../../models/User');

let router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get('/login', (req, res)=>{
  res.sendFile(path.join(__dirname, 'login.html'));
});

router.get('/register', (req, res)=>{
  res.sendFile(path.join(__dirname, 'register.html'));
});

router.post('/login', async (req, res, next) => {
  let userData = req.body;

  try{
    let user = await User.findOne({email:userData.email});
    if(user!=null){
      bcrypt.compare(userData.password, user.password, function(err, result) {
        if (result){
          res.send('CORRECT');
        }else {
          res.send('INCORRECT');
        }
      });
    }else{
      res.send("Email can't be found")
    }
    // Load hash from the db, which was preivously stored 

  }catch(err){
    console.log(err);
    res.send(err)
  }

  // passport.authenticate('local', (err, user, info) => {
  //   console.log('Inside passport.authenticate() callback');
  //   console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
  //   console.log(`req.user: ${JSON.stringify(req.user)}`)
  //   req.login(user, (err) => {
  //     console.log('Inside req.login() callback')
  //     console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
  //     console.log(`req.user: ${JSON.stringify(req.user)}`)
  //     return res.send('You were authenticated & logged in!\n');
  //   })
  // })(req, res, next);
})

router.post('/register', async (req, res)=>{
  let userData = req.body;

  if(userData.password1!=userData.password2){
    res.send("Error: Passwords don't match");
  }else if(userData.password1.length<6){
    res.send("Error: Password must be 6 characters or longer");
  }else{

    let another = await User.findOne({email:email});



    bcrypt.genSalt(saltRounds, (err, salt) => {
      bcrypt.hash(userData.password1, salt, async (err, hash) => {
          // Now we can store the password hash in db.
        let user = new User({
          email:userData.email,
          password:hash
        });
        let data = await user.save();
        res.send(data);
      });
    });
  }
});


module.exports = router;