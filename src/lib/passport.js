const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require( 'passport-google-oauth').OAuth2Strategy;
const pool = require("../database");
const helpers = require("./helpers");
const credentials = require('../../credentials.json');

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true
    },
    async (req, username, password, done) => {
      const rows = await pool.query("SELECT * FROM users WHERE username = ?", [
        username
      ]);
      if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(
          password,
          user.password
        );
        if (validPassword) {
          done(null, user, req.flash("success", "Welcome " + user.username));
        } else {
          done(null, false, req.flash("message", "Incorrect Password"));
        }
      } else {
        return done(
          null,
          false,
          req.flash("message", "The Username does not exists.")
        );
      }
    }
  )
);
passport.use(
  "googleLogin",
  new GoogleStrategy({
  clientID: "370951440329-qr076p3vri2dvokdklqt55obe6oprdsn.apps.googleusercontent.com",
  clientSecret:"KlbPoi5ke2uKlnD4-nnoNE7b",
  // callbackURL:'http://gam-sql-demo.uc.r.appspot.com/'
   callbackURL:'/auth/callback'
},
(token, refreshToken, profile, done) => {
  return done(null, {
      profile: profile,
      token: token,
      refreshToken:refreshToken
  });
}));
passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true
    },
    async (req, username, password, done) => {
      const { fullname } = req.body;

      let newUser = {
        fullname,
        username,
        password
      };

      newUser.password = await helpers.encryptPassword(password);
      // Saving in the Database
      const result = await pool.query("INSERT INTO users SET ? ", newUser);
      newUser.id = result.insertId;
      return done(null, newUser);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  done(null, user);
});