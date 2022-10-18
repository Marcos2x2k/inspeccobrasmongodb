const express = require ('express');
const path = require('path');
const exphbs = require("express-handlebars");
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require ('connect-flash'); // modulo para enviar mensajes de advertencia
const passport = require('passport');


// Inicilializaciones
const app = express();
require('./database');
require('./config/passport');

//setting
app.set("port", process.env.PORT || 3001);
app.set("views", path.join(__dirname, "views"));

const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(app.get("views"), "layouts"),
  partialsDir: path.join(app.get("views"), "partials"),
  extname: ".hbs",
});
app.engine(".hbs", hbs.engine);
app.set ('view engine', '.hbs');

//midlewares
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(session({
    secret:'mysecretapp',
    resave: true,
    saveUninitialized: true
}));
//aca definimos inicio de sesion
app.use(passport.initialize())
app.use(passport.session());
app.use(flash());

//Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use(require('./routes/index.js'))
app.use(require('./routes/notes.js'))
app.use(require('./routes/users.js'))

// Static Files
app.use(express.static(path.join(__dirname, 'public')));


// Server is listen
// app.listen(app.get('port'), () => {
//     console.log ('Server on Port', app.get('port'));
// });

// Modifica el listener
const port = 8080;
//aquí va tu ip de mi pc o servidor q tenga el sistema
const IP = "172.25.2.119";

// app.listen(app.get('port'), () => {
app.listen(port, () => {
  console.log("http://"+ IP +":" + port + "/");
});


