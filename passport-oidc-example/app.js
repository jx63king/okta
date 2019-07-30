var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// passport.JS
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var OidcStrategy = require('passport-openidconnect').Strategy;



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//passport js
app.use(session({
  secret: 'MyVoiceIsMyPassportVerifyMe',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
//passport js done

// set up passport
// set up Strategy
passport.use('oidc', new OidcStrategy({
  issuer: 'https://dev-664271.okta.com/oauth2/default',
  authorizationURL: 'https://dev-664271.okta.com/oauth2/default/v1/authorize',
  tokenURL: 'https://dev-664271.okta.com/oauth2/default/v1/token',
  userInfoURL: 'https://dev-664271.okta.com/oauth2/default/v1/userinfo',
  clientID: '0oa10v63t8GaMxlMs357',
  clientSecret: 'qqEr62n_k2D8Y3gqJ052TZ7tNtx0B86Lldx5YYZU',
  callbackURL: 'http://localhost:3000/authorization-code/callback',
  scope: 'openid profile'
}, (issuer, sub, profile, accessToken, refreshToken, done) => {
  return done(null, profile);
}));
// set up passport done
// serialize users
passport.serializeUser((user, next) => {
  next(null, user);
});

passport.deserializeUser((obj, next) => {
  next(null, obj);
});
// serialize users

app.use(function(req, res, next) {
    if(req.user) req.user.whatever = 'you like';
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

//this is for passport js authorization
app.use('/login', passport.authenticate('oidc'));

app.use('/authorization-code/callback',
  passport.authenticate('oidc', { failureRedirect: '/error' }),
  (req, res) => {
    res.redirect('/profile'); //redirect to the profile page
  }
);

// redirect to profile page
app.use('/profile', ensureLoggedIn, (req, res) => {
  res.render('profile', { title: 'Express', user: req.user, profile: req.profile });
  console.log(req.profile);

});

// this function ensure that only logged in users can see the profile page
function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login')
}

// log out
app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
