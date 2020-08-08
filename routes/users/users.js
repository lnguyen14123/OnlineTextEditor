const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../../models/User');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

let router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {    
    const user = await User.findOne({email:email});

    if(user!=null){

      console.log(user.password + " " + password);

      bcrypt.compare(password, user.password, function(err, result) {

        console.log(result);
        if (result){
          console.log('Local strategy returned true')
          return done(null, user)
        }else {
          console.log('Local strategy returned false')
        }
      });
    }else{
      console.log("Local strategy returned email can't be found")
    }
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  console.log('Inside serializeUser callback. User id is save to the session file store here')
  done(null, user.id);
});

router.use(passport.initialize());
router.use(passport.session());

router.get('/login', (req, res)=>{
  res.sendFile(path.join(__dirname, 'login.html'));
});

router.get('/register', (req, res)=>{
  res.sendFile(path.join(__dirname, 'register.html'));
});

router.post('/login', async (req, res, next) => {
  let userData = req.body;
  
  passport.authenticate('local', (err, user, info) => {
    req.login(user, (err) => {
      return res.send('You were authenticated & logged in!\n');
    })
  })(req, res, next);
})

router.post('/register', async (req, res)=>{
  let userData = req.body;

  if(userData.password1!=userData.password2){
    res.send("Error: Passwords don't match");
  }else if(userData.password1.length<6){
    res.send("Error: Password must be 6 characters or longer");
  }else{

    let another = await User.findOne({email:userData.email});



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