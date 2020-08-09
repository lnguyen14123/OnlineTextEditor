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
  res.sendFile(path.join(__dirname, 'login.html'));
});

router.get('/logout', (req, res)=>{
  console.log("HEY");
  req.logout();
  res.redirect('/users/login');
});

router.get('/register', (req, res)=>{
  res.sendFile(path.join(__dirname, 'register.html'));
});

// router.get('/editor', (req, res, next)=>{
//   if(req.isAuthenticated()){
//     console.log('yoy');
//     next();
//   } else {
//     res.redirect('/users/login')
//   }
// });

router.use(express.static(path.join(__dirname, "editor")));

router.post('/login', async (req, res, next) => {
  let userData = req.body;
  
  passport.authenticate('local', (err, user, info) => {

    if(info.message == "ok"){
      req.login(user, (err) => {
        return res.sendFile(path.join(__dirname, 'editor', 'editor.html'));
      })  
    } else{
      return res.send(info.message);
    }

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