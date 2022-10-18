const express = require('express')
const router = express.Router()
const bcrypt = require("bcrypt");
const User =  require ('../models/User')

const passport = require ('passport');

router.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local',{
    successRedirect: '/about',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

router.get ('/users/signup', (req, res) => {
    res.render ('users/signup');
});

router.post('/users/signup', async (req, res) =>{
    const {name, email, password, confirm_password} = req.body;
    const errors = [];
    if(name.length<=0 || email.length<=0 || password.length<=0 || confirm_password.length<=0){
        errors.push({text:'Todos los Datos deben ser Cargados'})
    }
    if (password != confirm_password){
        errors.push({text: "Las contraseñas deben ser iguales"});
    }
    if (password.length < 4 ){
        errors.push({text: "Contraseña debe tener mas de 4 caracteres"});
    }
    if (errors.length>0){
        res.render('users/signup', {errors, name, email, password, confirm_password});
    } else {
        const emailUser = await User.findOne({ email: email });
        if (emailUser) {
                // req.flash('error_msg', 'El Correo ya esta en Uso!');
                req.flash('success_msg', 'El Correo está en Uso. Pruebe ingresando un Correo Distinto')
                return res.redirect("/users/signup");
                // res.render('users/signup', {errors, name, email, password, confirm_password});
        }
        const newUser = new User({name, email, password});
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);
        // newUser.password = await newUser.EncryptPassword(password); //NOSE PORQUE NO ANDA
        await newUser.save();
        req.flash('success_msg', 'Estas Registrado');
        res.redirect('/users/signin');
        console.log(req.body);
    // res.send('OK')}s
}});

// router.get('/users/logout',  (req, res, next) => {    
//       req.logout() 
//     //   ("success_msg", "You are logged out now.");
//       res.redirect("/users/signin");
//     });

router.get('/users/logout', function (req, res, next) {
    req.logout(function(err) {
      if (err) { 
        return next(err); 
        }
      res.redirect('/');
    });
  });
// router.get ("/users/logout", (req, res) => {
//     req.logout();
//     res.redirect("/");
// })


module.exports = router;
