const express = require('express');
const router = express.Router();
const app = express();
const auth = require('auth');
const passport = require('passport');
const { renderSignUp, signUp, renderSignIn, signIn, logout, signInGoogle, renderGoogleSignIn } = require('../controllers/auth.controller')

app.use(passport.initialize());

// SIGNUP
router.get('/signup', renderSignUp);
router.post('/signup', signUp);

// SINGIN
router.get('/signin', renderSignIn);



router.get('/google/signin', (req, res) => {
  res.render('auth/signinGoogle');
});

router.get('/auth/callback',
  passport.authenticate('googleLogin', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  }),
  (req, res) => {
    req.session.token = req.user.token;
    res.send(req.session.oauth2return);
  }
);


router.get('test', (req, res) => {
  console.log()
})
router.get(
  // Login url
  '/auth/google',

  // Save the url of the user's current page so the app can redirect back to
  // it after authorization
  (req, res, next) => {
    if (req.query.return) {
      req.session.token = req.user.token;
      req.session.oauth2return = req.query.return;
    }
    next();
  },

  // Start OAuth 2 flow using Passport.js
  passport.authenticate('googleLogin', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/admin.directory.user', 'https://www.googleapis.com/auth/admin.reports.audit.readonly', 'https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/apps.order', 'https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/admin.directory.group'] })
);
// router.get('/auth/google', passport.authenticate('googleLogin', {
//     scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/admin.directory.user']
// }));



router.post('/signin', signIn);

router.get('/logout', logout);

module.exports = router;