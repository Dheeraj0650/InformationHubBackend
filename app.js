require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
var cors = require('cors');
var fetch = require("cross-fetch");

const app = express();
app.use(cors());

app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set("useCreateIndex", true);
mongoose.connect("mongodb+srv://dheeraj0650:" + process.env.PASSWORD + "@cluster0.vejhn.mongodb.net/InformationHub", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('open', function() {
  console.log('Connected to mongo server.');
});


const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  googleId: String,

});

userSchema.index({
  "email": 1
}, {
  sparse: true
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//
//
// //OAuth Configuration for Outlook
// passport.use(new OutlookStrategy({
//     clientID: process.env.OUTLOOK_CLIENT_ID,
//     clientSecret: process.env.OUTLOOK_CLIENT_SECRETS,
//     callbackURL: "https://limitless-cove-52361.herokuapp.com/auth/outlook/Grocery_Kart",
//   },
//   function(accessToken, refreshToken, profile, done) {
//     var user = {
//       outlookId: profile.id,
//       name: profile.DisplayName,
//       email: profile.EmailAddress,
//       accessToken: accessToken
//     };
//     if (refreshToken)
//       user.refreshToken = refreshToken;
//     if (profile.MailboxGuid)
//       user.mailboxGuid = profile.MailboxGuid;
//     if (profile.Alias)
//       user.alias = profile.Alias;
//     User.findOrCreate(user, function(err, user) {
//       return done(err, user);
//     });
//   }
// ));
//
// app.get('/auth/outlook',
//   passport.authenticate('windowslive', {
//     scope: [
//       'openid',
//       'profile',
//       'offline_access',
//       'https://outlook.office.com/Mail.Read'
//     ]
//   })
// );
//
// app.get('/auth/outlook/Grocery_Kart',
//   passport.authenticate('windowslive', {
//     failureRedirect: "/"
//   }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect("/main");
//   });

app.post("/auth/google", function(req, res) {
  User.findOrCreate({
      googleId: req.body.googleId,
      username: req.body.username,
      email:req.body.email
  }, function(err) {
      if (err) {
        res.send(err.message);
      } else {
          res.send("Successful");
      }
    });
});

app.post("/auth/github", function(req, res) {
  User.findOrCreate({
    googleId: req.body.googleId,
    username: req.body.username,
    email:req.body.email
  }, function(err) {
      if (err) {
        res.send(err.message);
      } else {
          res.send("Successful");
      }
    });
});

app.post("/auth/microsoft", function(req, res) {
  User.findOrCreate({
    googleId: req.body.googleId,
    username: req.body.username,
    email:req.body.email
  }, function(err) {
      if (err) {
        res.send(err.message);
      } else {
          res.send("Successful");
      }
    });
});


app.post("/register", function(req, res) {
  User.register({
    username: req.body.username,
    email:req.body.email
  }, req.body.password, function(err, user) {
    if (err) {
      res.send(err.message);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.send("Successful");
      });
    }
  });
});

app.get("/", function(req, res) {
  res.send(false);
});

app.get("/isLoggedIn", function(req, res) {
  res.send(req.isAuthenticated());
});

app.post("/login", function(req, res) {
  const user = new User({
    password: req.body.password,
    username: req.body.username,
  });
  req.login(user, function(err) {
    if (err) {
      res.send(err.message);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.send("Successful");

      });
    }
  });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.send("Successful");
});


app.post("/Weather", function(req, res) {
  var formBody = [];
  var details = req.body;
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody.push('appid' + "=" + "e98e494d2485a6f10a35f567bdd96e42");
  formBody = formBody.join("&");
  fetch('https://api.openweathermap.org/data/2.5/onecall?' + formBody,{
    method: 'GET',
  })
  .then(function(resp) { return resp.json() }) // Convert data to json
  .then(function(data) {
    var data = JSON.stringify(data);
    res.send(data);
  })
  .catch(err => {
  	console.error(err);
  });
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}
app.listen(port, function() {
  console.log("Server started");
});
