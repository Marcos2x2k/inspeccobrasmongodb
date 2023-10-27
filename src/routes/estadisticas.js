const express = require('express')
const router = express.Router()
// const bcrypt = require("bcrypt");
// const passport = require ('passport');
// const User =  require ('../models/User')
//const bcrypt = require("bcrypt");
//const mongopagi = require('mongoose-paginate-v2') Paginacion de mongodb
const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')

// tengo que requerir los modelos para que mongoose me cree las tablas
const Estadistica = require('../models/Estadistica')

router.get('/estadisticas/list/:id', isAuthenticated, async (req, res) => {
    const estadistica = await Estadistica.findById(req.params.id).lean()
    res.render('notes/listestadistica', { estadistica })
});

router.get('/estadisticas', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const estadisticas = await Estadistica.find({ borrado: "No" }).lean().sort({ estadisticanum: 'asc' });
        res.render('notes/allestadistica', { estadisticas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
        return res.redirect('/');
    }
    //para que muestre notas de un solo user
    // const estadisticas = await Estadistica.find({user : req.user.id}).lean().sort({estadisticanum:'desc'}); 
});

router.get('/estadisticas/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const estadisticas = await Estadistica.find({ borrado: "No" }).lean().sort({ date: 'asc' });
        res.render('notes/estadisticaexp/planillalistaestadexp', { estadisticas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
        return res.redirect('/');
    }
    //para que muestre notas de un solo user
    // const estadisticas = await Estadistica.find({user : req.user.id}).lean().sort({estadisticanum:'desc'}); 
});

router.get('/estadisticas/add', isAuthenticated, (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        res.render('notes/newestadisticas');
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
        return res.redirect('/');
    }
})

router.post('/notes/newestadisticas', isAuthenticated, async (req, res) => {
    const newEstadistica = new Estadistica();
    newEstadistica.estadisticanum = req.body.estadisticanum;
    newEstadistica.fechaestadistica = req.body.fechaestadistica;
    newEstadistica.horaestadistica = req.body.horaestadistica;
    if (req.files[0]) {
        // const file = req.files[0]        
        // req.files[0].nameest='Estadistica'        
        // console.log('req files 0', req.files[0]);
        newEstadistica.filename = req.files[0].filename;
        newEstadistica.path = '/img/uploads/' + req.files[0].filename;
        // newEstadistica.nameest = req.files[0].nameest;
    }
    if (req.files[1]) {
        newEstadistica.filenamedos = req.files[1].filename;
        newEstadistica.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newEstadistica.filenametres = req.files[2].filename;
        newEstadistica.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newEstadistica.filenamecuatro = req.files[3].filename;
        newEstadistica.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newEstadistica.filenamecinco = req.files[4].filename;
        newEstadistica.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newEstadistica.filenameseis = req.files[5].filename;
        newEstadistica.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newEstadistica.filenamesiete = req.files[6].filename;
        newEstadistica.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newEstadistica.filenameocho = req.files[7].filename;
        newEstadistica.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newEstadistica.user = req.user.id;
    newEstadistica.name = req.user.name;
    // newEstadistica.originalname = req.file.originalname;
    // newEstadistica.mimetype = req.file.mimetype;
    // newEstadistica.size = req.file.size;
    // console.log(req.files[2].filename) 
    await newEstadistica.save();
    req.flash('success_msg', 'Estadistica Creada Exitosamente');
    // console.log (newNote)
    res.redirect('/estadisticas');
    // await Estadistica.save();
    // res.redirect('/');
});

router.get('/estadisticas/edit/:id', isAuthenticated, async (req, res) => {
    const estadistica = await Estadistica.findById(req.params.id).lean()
    res.render('notes/editestadistica', { estadistica })
});

router.delete('/estadisticas/delete/:id', isAuthenticated, async (req, res) => {
    const idfile = req.params.id;
    const datosfile = Estadistica.find({ idfile: { $regex: idfile, $options: "i" } }).lean();
    await Estadistica.findByIdAndDelete(req.params.id);
    // const filenamepru = datosfile[0].filename
    // console.log ('filnamepru', datosfile[0].filename)
    console.log('filenamepru', datosfile)
    // fs.unlink(`./src/public/img/uploads/${filenamepru}`)
    // // fs.unlink('\src\public\img\uploads\',filenamepru)
    //     .then(() => {
    //         console.log('File removed')
    //     }).catch(err => {
    //         console.error('Something wrong happened removing the file', err)
    //     })

    req.flash('success_msg', 'Estadistica Eliminada')
    res.redirect('/estadisticas')
    // console.log(req.params.id)
    // res.send('ok')
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;