const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../../models/User');
const LocalStrategy = require('passport-local');
const path = require('path');

const router = express.Router();

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {    
    const user = await User.findOne({email:email});

    if(user!=null){

      console.log(user.password + " " + password);

      bcrypt.compare(password, user.password, function(err, result) {

        console.log(result);
        if (result){
          return done(null, user, {message:'ok'})
        }else {
          return done(null, false, { message: 'Incorrect password.' });
        }
      });
    }else{
      return done(null, false, { message: 'Email not found.' });
    }
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// tell passport how to deserialize the user
passport.deserializeUser(async (id, done) => {
  await User.findById(id, (err, user)=>{
    done(err, user);
  });
});

router.use(passport.initialize());
router.use(passport.session());


router.get('/login', (req, res)=>{
  res.render("login");
});

router.get('/register', (req, res)=>{
  res.render("register");
});

router.get('/editor', (req, res)=>{
  if(req.isAuthenticated()){
    res.render('editor');
  } else {
    res.render('login');
  }
});

//Handle registration

router.post('/register', async (req, res)=>{
  let userData = req.body;

  if(userData.password1!=userData.password2){
    res.send("Error: Passwords don't match");
  }else if(userData.password1.length<6){
    res.send("Error: Password must be 6 characters or longer");
  }else{

    let another = await User.findOne({email:userData.email});
    if(!another){
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
  }
});

//handle logins
router.post('/login', (req, res, next)=>{
  let userData = req.body;
  
  passport.authenticate('local', (err, user, info) => {

    if(info.message == "ok"){
      req.login(user, (err) => {
        return res.render('editor');
      })  
    } else{
      return res.send(info.message);
    }

  })(req, res, next);
});

//handle logout
router.get('/logout', (req, res)=>{
  req.logout();
  res.redirect('/users/login');
});


module.exports = router;
