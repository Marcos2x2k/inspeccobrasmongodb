const express = require ('express');
const morgan = require('morgan');
const multer = require('multer');
const uuid = require('uuid/v4');
const path = require('path');
const exphbs = require("express-handlebars");
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require ('connect-flash'); // modulo para enviar mensajes de advertencia
const passport = require('passport');
// const { format } = require('timeago.js');


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
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));

// ** original andando 29-11-22
// const storage = multer.diskStorage({
//     destination: path.join(__dirname, 'public/img/uploads'),
//     filename: (req, file, cb, filename) => {
//         // console.log(file);
//         cb(null, uuid() + path.extname(file.originalname));
//     }
// }) 

// nuevo prueba de varios archivos
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'src/public/img/uploads')
  },
  filename: function (req, file, cb) {
      cb(null,Date.now()+path.basename(file.originalname))//path.extname(file.originalname)) //Appending extension
  }
})

//** viejo anda */
app.use(multer({storage:storage}).any('image'));

// ** nuevo
// app.use(multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//       if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
//           cb(null, true);
//       } else {
//           cb(null, false);
//           return cb(new Error('Only .png, .jpg and .jpeg Formatos Incorrectos!'));
//       }
//   }
// }).array('image',8))


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

// Routes aca defino las Rutas que utilizo
app.use(require('./routes/index.js'))
app.use(require('./routes/notes.js'))
app.use(require('./routes/users.js'))
app.use(require('./routes/mesaentrada.js'));
app.use(require('./routes/liquidaciones.js'));


// Static Files
app.use(express.static(path.join(__dirname, 'public')));


//Server is listen
// app.listen(app.get('port'), () => {
//     console.log ('Server on Port', app.get('port'));
// });

// Modifica el listener ****************************
// const port = 8080;
// //aquí va tu ip de mi pc o servidor q tenga el sistema
// const IP = "172.25.2.119";
// const IP = "172.25.2.106" // PC DOC

// app.listen(app.get('port'), () => {
// app.listen(port, () => {
//   console.log("http://"+ IP +":" + port + "/");
// });
// ******************************* //


// Server is listen en 3001 - desde Casa
// app.listen(app.get('port'), () => {
//   console.log ('Server on Port', app.get('port'));
// });


/// *****--- copiado del doc --- *****
// Modifica el listener ****************************
const port = 8080;
//aquí va tu ip de mi pc o servidor q tenga el sistema
//const IP = "172.25.2.119";
// const IP = "172.25.2.215" // Mi PC
const IP ="MADaGo";

//app.listen(app.get('port'), () => {
app.listen(port, () => {
  console.log("http://"+ IP +":" + port + "/");
});