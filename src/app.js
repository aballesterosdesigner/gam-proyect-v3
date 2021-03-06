const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { database } = require('./keys');
// Intializations
const app = express();
require('./lib/passport');
/*Settings*/
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');


/*Middlewares*/
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: 'faztmysqlnodemysql',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use(cookieParser());



app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.users = req.flash('users');
  app.locals.logs = req.flash('logs');
  app.locals.user = req.user;
  next();
});

// Routes

// app.use(require('./routes/index.routes'));




/* Crear usuarios */
app.use(require('./routes/apis/users_create/routes'));
/*Forzar contraseña */
app.use(require('./routes/apis/forzar_pass/routes'));
/*Crear carpetas compartidas*/
app.use(require('./routes/apis/crear_compartidas/routes'));
/*Dobles verificaciones*/
app.use(require('./routes/apis/dobles_verificaciones/routes'));
/* Crear grupos */
app.use(require('./routes/apis/create_groups/routes'));
/* Personalizar plantilla mail merge */
app.use(require('./routes/apis/mail_merge_sheet/routes'))
/* Logs routes */
app.use(require('./routes/apis/routes.logs/routes'));
app.use(require('./routes/auth.routes'));
app.use(require('./routes/user.routes'));
app.use(require('./routes/index.routes'));

app.use('/links', require('./routes/links.routes'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;