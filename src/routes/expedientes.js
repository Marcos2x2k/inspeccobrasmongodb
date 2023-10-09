const express = require('express');
const router = express.Router();

const fs = require('fs').promises;
const { isAuthenticated } = require('../helpers/auth');

const Users = require('../models/User');
const Expediente = require('../models/Expediente');
const Expedinspeccion = require('../models/expedinspeccion');
const Expedticket = require('../models/Expedticket')
const Expedticketentrainsp = require('../models/Expedticketentrainsp')
const Expedentrsalida = require('../models/expedentrsalida');

//** ver tema NOTE */
const Note = require('../models/Note');

// *ZONA PDF* //
const expedinspeccion = require('../models/expedinspeccion');
// *ZONA PDF* //
const pdf = require("html-pdf");
const User = require('../models/User');
var pdfoptionsA4 = { format: 'A4' };

// **esto es para agregar campo borrado a todos los q no tienen borrado marcado**
router.put('/expedientes/listadoborradosenno', isAuthenticated, async (req, res) => {
    await Expediente.update({}, { $set: { borrado: "No" } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Todos los Expedientes Marcados')
    res.redirect('/expedientes/listado');
});

router.get('/expedientes/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/newexpedientes');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/informeinspeccion/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const notes = await Note.findById(req.params.id).lean();
    const expedientes = await Expediente.findById(req.params.id).lean();
    //const usuarios = await Users.find().lean().sort({ date: 'desc' });
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        res.render('notes/newinformeinspeccion', { notes, expedientes });;
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/movimientoexpediente/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const expedientes = await Expediente.findById(req.params.id).lean();
    //const usuarios = await Users.find().lean().sort({ date: 'desc' });
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        res.render('notes/inspecciones/movimientoexped', { expedientes });;
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }    
});


// Cambio el estado del expediente y agendo el estado nuevo en la base de datos expedentrsalida.js
// anda con 2 tablas y en una crea nuevo y en otra actualiza
router.put('/notes/newestadoexpediente', isAuthenticated, async (req, res) => {
    // new estado expediente
    const { borrado, userborrado, fechaborrado, numexpediente, estado, motivoentsal, iniciadornomyape, domicilio, adremaexp,
        user, name
    } = req.body;
    const newExpedentrsalida = new Expedentrsalida({
        borrado, userborrado, fechaborrado, numexpediente, estado, motivoentsal, iniciadornomyape, domicilio, adremaexp,
        user, name
    })
    newExpedentrsalida.user = req.user.id;
    newExpedentrsalida.name = req.user.name;  
    await newExpedentrsalida.save();    
    await Expediente.update({numexpediente:numexpediente}, { $set: { estado: estado } }, { upsert: false, multi: true })         
    req.flash('success_msg', 'Estado de Expediente Modificado Exitosamente');
    res.redirect('/expedientes/listado');
});

router.get('/expedientes/movimientosestadosexpedientes/:id', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    var id = req.params.id;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        //const mesaentrada = await Mesaentrada.findById(req.params.id).lean() 
        const expediente = await Expediente.findById(req.params.id).lean()
        //const expedientes = await Expediente.findById(id).lean().sort({ numexpediente: 'desc' });
        var numexpediente = expediente.numexpediente
        const expedentrsalida = await Expedentrsalida.find({ numexpediente: numexpediente }).lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/planillamovestados', { expedentrsalida, expediente });    
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/notes/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const notes = await Note.findById(req.params.id).lean();
    const expedientes = await Expediente.findById(req.params.id).lean();
    //const usuarios = await Users.find().lean().sort({ date: 'desc' });
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        res.render('notes/inspecciones/newnotes', { notes, expedientes });
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INSPECCIONES')
        return res.redirect('/');
    }
});

router.post('/notes/newexpedientes', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, numexpediente, estado, motivoentsal, iniciadornomyape, domicilio, adremaexp,
        fiduciariopropsocio, direcfiduciariopropsocio, correofiduciariopropsocio,
        directorobraoperitovisor, destinodeobra, superficieterreno, superficieaconstruir,
        superficiesubsueloplantabaja, superficieprimerpisoymaspisos, observaciones,
        permisobraoactainfrac, selecpermisoedificacion, permisoedificacionnumero, fechapermisoedificacion,
        selecpermisodemolicion, permisodemolicionnumero, fechapermisodemolicion, fotoexpediente,
        fechainicioentrada, user, name
    } = req.body;
    const newExpediente = new Expediente({
        borrado, userborrado, fechaborrado, numexpediente, estado, motivoentsal, iniciadornomyape, domicilio, adremaexp,
        fiduciariopropsocio, direcfiduciariopropsocio, correofiduciariopropsocio,
        directorobraoperitovisor, destinodeobra, superficieterreno, superficieaconstruir,
        superficiesubsueloplantabaja, superficieprimerpisoymaspisos, observaciones,
        permisobraoactainfrac, selecpermisoedificacion, permisoedificacionnumero, fechapermisoedificacion,
        selecpermisodemolicion, permisodemolicionnumero, fechapermisodemolicion, fotoexpediente,
        fechainicioentrada, user, name
    })
    newExpediente.user = req.user.id;
    newExpediente.name = req.user.name;
    await newExpediente.save();
    req.flash('success_msg', 'Expediente Agregado Exitosamente');
    res.redirect('/expedientes/listado');
});

router.get('/expedientes', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const expedientes = await Expediente.find({ borrado: "No" }).lean().limit(200).sort({ numexpediente: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/allexpedientesadm', { expedientes });
    } else if (rolusuario == "Inspector") {
        const expedientes = await Expediente.find({ borrado: "No" }).lean().limit(200).sort({ numexpediente: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/allexpedientes', { expedientes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const expedientes = await Expediente.find({ borrado: "No" }).lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/planillalistaexpedientesadm', { expedientes });
    } else if (rolusuario == "Inspector") {
        const expedientes = await Expediente.find({ borrado: "No" }).lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/planillalistaexpedientesusr', { expedientes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/borradolistado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        const expedientes = await Expediente.find({ $or: [{ borrado: "Si" }, { borrado: "" }] }).lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/borrados/borradolistexpedientes', { expedientes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/AREA PAPELERA DE EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/infoborradolist/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/borrados/infoborradoexpediente', { expediente })
});

router.put('/expedientes/recuperarlistado', isAuthenticated, async (req, res) => {
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Expediente.updateMany({ borrado: 'Si' }, { borrado: "No", fechaborrado: "Recuperado" });
    //await Expediente.update({},{$set:{borrado: "No"}},{upsert:false,multi:true})
    req.flash('success_msg', 'todos los Expedientes recuperados')
    res.redirect('/expedientes/borradolistado');
});

// **esto es para agregar campo borrado a todos los q no tienen borrado marcado**
router.put('/expedientes/listadoborradosenno', isAuthenticated, async (req, res) => {
    await Expediente.update({}, { $set: { borrado: "No" } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Todos los Expedientes Marcados')
    res.redirect('/expedientes/borradolistado');
});


router.get('/expedientes/expedconinformeinspeccion/:id', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    var id = req.params.id;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        //const mesaentrada = await Mesaentrada.findById(req.params.id).lean() 
        const expediente = await Expediente.findById(req.params.id).lean()
        //const expedientes = await Expediente.findById(id).lean().sort({ numexpediente: 'desc' });
        var numexpediente = expediente.numexpediente
        const expedisnpeccion = await Expedinspeccion.find({ numexpediente: numexpediente }).lean().sort({ date: 'desc' }); //

        res.render('notes/inspecciones/planillalistaexpconinformes', { expedisnpeccion, expediente });
    } else if (rolusuario == "Inspector") {
        const expedisnpeccion = await Expedinspeccion.find().lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/planillalistainformeexped', { expedisnpeccion });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/edit/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    res.render('notes/editexpediente', { expediente })
});

router.get('/expedientes/list/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    res.render('notes/listexpediente', { expediente })
});

// *** BUSCAR EXPEDIENTES (NOTES) - LISTADO ***
router.post('/expedientes/find', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ fechainicioentrada: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/inspecciones/planillalistaexpedientesadm");
    } else {
        res.render('notes/inspecciones/planillalistaexpedientesadm', { expedientes })
    }
});

router.post('/expedientes/findadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { adremaexp: { $regex: adremaexp, $options: "i" } }] }).lean().sort({ adremaexp: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/planillalistaexpedientesadm");
    } else {
        res.render('notes/inspecciones/planillalistaexpedientesadm', { expedientes })
    }
});

router.post('/expedientes/findiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Iniciador (N y A)')
        return res.render("notes/inspecciones/planillalistaexpedientesadm");
    } else {
        res.render('notes/inspecciones/planillalistaexpedientesadm', { expedientes })
    }
});

router.post('/expedientes/findestado', isAuthenticated, async (req, res) => {
    const { estado } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { estado: { $regex: estado, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });
    if (!expedientes) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/planillalistaexpedientesadm");
    } else {
        res.render('notes/inspecciones/planillalistaexpedientesadm', { expedientes })
    }
});

// *** BUSCAR EXPEDIENTES (NOTES) - CARTAS ***
router.post('/notes/find', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ fechainicioentrada: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/allexpedientes");
    } else {
        res.render('notes/findexpediente', { expedientes })
    }
});

router.post('/notes/findadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { adremaexp: { $regex: adremaexp, $options: "i" } }] }).lean().sort({ adremaexp: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/allexpedientes");
    } else {
        res.render('notes/findexpediente', { expedientes })
    }
});

router.post('/notes/findiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Iniciador (N y A)')
        return res.render("notes/allexpedientes");
    } else {
        res.render('notes/findexpediente', { expedientes })
    }
});

router.post('/notes/findexpediente', isAuthenticated, async (req, res) => {
    const { expediente } = req.body;
    const notes = await Note.find({ $and: [{ borrado: "No" }, { expediente: { $regex: expediente, $options: "i" } }] }).lean().sort({ expediente: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/inspecciones/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});

// *** BUSCAR EXPEDIENTES BORRADOS (NOTES) - LISTADO ***
router.post('/expedientes/borradofind', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "Si" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ fechainicioentrada: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/borrados/borradolistexpedientes");
    } else {
        res.render('notes/borrados/borradolistexpedientes', { expedientes })
    }
});

router.post('/expedientes/borradofindadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "Si" }, { adremaexp: { $regex: adremaexp, $options: "i" } }] }).lean().sort({ adremaexp: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/borrados/borradolistexpedientes");
    } else {
        res.render('notes/borrados/borradolistexpedientes', { expedientes })
    }
});

router.post('/expedientes/borradofindiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "Si" }, { iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Iniciador (N y A)')
        return res.render("notes/borrados/borradolistexpedientes");
    } else {
        res.render('notes/borrados/borradolistexpedientes', { expedientes })
    }
});

router.post('/expedientes/borradofindestado', isAuthenticated, async (req, res) => {
    const { estado } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "Si" }, { estado: { $regex: estado, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });
    if (!expedientes) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/borrados/borradolistexpedientes");
    } else {
        res.render('notes/borrados/borradolistexpedientes', { expedientes })
    }
});


router.put('/notes/editexpediente/:id', isAuthenticated, async (req, res) => {
    const { numexpediente, estado, motivoentsal, iniciadornomyape, domicilio, adremaexp,
        fiduciariopropsocio, direcfiduciariopropsocio, correofiduciariopropsocio,
        directorobraoperitovisor, destinodeobra, superficieterreno, superficieaconstruir,
        superficiesubsueloplantabaja, superficieprimerpisoymaspisos, observaciones,
        permisobraoactainfrac, selecpermisoedificacion, permisoedificacionnumero, fechapermisoedificacion,
        selecpermisodemolicion, permisodemolicionnumero, fechapermisodemolicion, fotoexpediente,
        fechainicioentrada, eliminado, user, name } = req.body
    await Expediente.findByIdAndUpdate(req.params.id, {
        numexpediente, estado, motivoentsal, iniciadornomyape, domicilio, adremaexp,
        fiduciariopropsocio, direcfiduciariopropsocio, correofiduciariopropsocio,
        directorobraoperitovisor, destinodeobra, superficieterreno, superficieaconstruir,
        superficiesubsueloplantabaja, superficieprimerpisoymaspisos, observaciones,
        permisobraoactainfrac, selecpermisoedificacion, permisoedificacionnumero, fechapermisoedificacion,
        selecpermisodemolicion, permisodemolicionnumero, fechapermisodemolicion, fotoexpediente,
        fechainicioentrada, eliminado, user, name
    });
    req.flash('success_msg', 'Expediente actualizado')
    res.redirect('/expedientes/listado');
});

router.delete('/expedientes/delete/:id', isAuthenticated, async (req, res) => {
    await Expediente.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'expediente Eliminado')
    res.redirect('/expedientes/borradolistado')
});

router.put('/expedientes/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expediente.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Expediente a Papelera Reciclaje')
    res.redirect('/expedientes/listado');
});

router.put('/expedientes/recuperarlistado', isAuthenticated, async (req, res) => {
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Expediente.updateMany({ borrado: 'Si' }, { borrado: "No", fechaborrado: "Recuperado" });
    req.flash('success_msg', 'todos los datos de Expedientes recuperados')
    res.redirect('/expedientes/listado');
});

router.put('/expedientes/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Expediente.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Expediente Restaurado')
    res.redirect('/expedientes/borradolistado');
});

// ********* ZONA DE INFORMES DE INSPECCION *********

router.post('/informeinspeccion/newinformeinspeccion', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { idexpediente, numexpediente, numadrema, fechaentradainspeccion, fechaeinspectorinspeccion,
        numintimacion, darcumplimientoa, plazointimacion, numinfraccion, causas, paralizacion, causasparalizacion, informe, destinopase, fechasalida, user, name, date
    } = req.body;

    const newInformeinspeccion = new Expedinspeccion({
        idexpediente, numexpediente, numadrema, fechaentradainspeccion, fechaeinspectorinspeccion,
        numintimacion, darcumplimientoa, plazointimacion, numinfraccion, causas, paralizacion, causasparalizacion, informe, destinopase, fechasalida, user, name, date
    })
    newInformeinspeccion.user = req.user.id;
    newInformeinspeccion.name = req.user.name;
    await newInformeinspeccion.save();
    req.flash('success_msg', 'Informe de Inspección Agregado Exitosamente');
    res.redirect('/expedientes/listado');
});

router.get('/expedientes/informeinspeccion', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const expedisnpeccion = await Expedinspeccion.find().lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/planillalistainformeexped', { expedisnpeccion });
    } else if (rolusuario == "Inspector") {
        const expedisnpeccion = await Expedinspeccion.find().lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/planillalistainformeexped', { expedisnpeccion });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/informexpedientes/edit/:id', isAuthenticated, async (req, res) => {
    const expedinspeccion = await Expedinspeccion.findById(req.params.id).lean()
    res.render('notes/inspecciones/editinformexpediente', { expedinspeccion })
});

router.get('/informexpedientes/list/:id', isAuthenticated, async (req, res) => {
    const expedinspeccion = await Expedinspeccion.findById(req.params.id).lean()
    res.render('notes/inspecciones/listinformexpediente', { expedinspeccion })
});

router.put('/notes/editinformexpediente/:id', isAuthenticated, async (req, res) => {
    const { idexpediente, numexpediente, numadrema, fechaentradainspeccion, fechaeinspectorinspeccion,
        numintimacion, darcumplimientoa, numinfraccion, causas, paralizacion, causasparalizacion, informe, destinopase, fechasalida, user, name, date } = req.body
    await Expedinspeccion.findByIdAndUpdate(req.params.id, {
        idexpediente, numexpediente, numadrema, fechaentradainspeccion, fechaeinspectorinspeccion,
        numintimacion, darcumplimientoa, numinfraccion, causas, paralizacion, causasparalizacion, informe, destinopase, fechasalida, user, name, date
    });
    req.flash('success_msg', 'Informe de Expediente actualizado')
    res.redirect('/expedientes/listado');
});

router.delete('/expedinspeccion/delete/:id', isAuthenticated, async (req, res) => {
    await expedinspeccion.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Informe de Expediente Eliminado')
    res.redirect('/expedientes/informeinspeccion')
});

// ********* ZONA DE TICKETS DE INSPECCION *********

router.get('/expedientes/listadoticket', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const expedticket = await Expedticket.find().lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/expticket/planillaexpticketinsp.hbs', { expedticket });
    } else if (rolusuario == "Inspector") {
        const expedticket = await Expedticket.find().lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/expticket/planillaexpticketinsp.hbs', { expedticket });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/ticket/ticketexpedconinformeinspeccion/:id', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    var id = req.params.id;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        //const mesaentrada = await Mesaentrada.findById(req.params.id).lean() 
        const expedticket = await Expedticket.findById(req.params.id).lean()
        //const expedientes = await Expediente.findById(id).lean().sort({ numexpediente: 'desc' });
        var numticket = expedticket.numticket
        const expedticketentrainsp = await Expedticketentrainsp.find({ numticket: numticket }).lean().sort({ date: 'desc' }); //
        res.render('notes/inspecciones/expticket/planillalistaticketconinforme', { expedticketentrainsp, expedticket });
    } else if (rolusuario == "Inspector") {
        //const mesaentrada = await Mesaentrada.findById(req.params.id).lean() 
        const expedticket = await Expedticket.findById(req.params.id).lean()
        //const expedientes = await Expediente.findById(id).lean().sort({ numexpediente: 'desc' });
        var numticket = expedticket.numticket
        const expedticketentrainsp = await Expedticketentrainsp.find({ numticket: numticket }).lean().sort({ date: 'desc' }); //
        res.render('notes/inspecciones/expticket/planillalistaticketconinforme', { expedticketentrainsp, expedticket });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/ticket/edit/:id', isAuthenticated, async (req, res) => {
    const expedticket = await Expedticket.findById(req.params.id).lean()
    res.render('notes/inspecciones/expticket/editticketexpediente', { expedticket })
});

router.get('/expedientes/listadoticket/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const expedticket = await Expedticket.findById(req.params.id).lean();
    const expedticketentrainsp = await Expedticketentrainsp.findById(req.params.id).lean();
    //const usuarios = await Users.find().lean().sort({ date: 'desc' });
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        res.render('notes/inspecciones/expticket/newinforexpticket', { expedticket, expedticketentrainsp });;
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/ticket/list/:id', isAuthenticated, async (req, res) => {
    const expedticket = await Expedticket.findById(req.params.id).lean()
    res.render('notes/inspecciones/expticket/listticketexp.hbs', { expedticket })
});

// *** BUSCAR TICKETS DE EXPEDIENTES - LISTADO ***
router.post('/ticketexp/findlistaticket', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numeroticket } = req.body;
    const expedticket = await Expedticket.find({ numticket: { $regex: numeroticket, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        res.render("notes/inspecciones/expticket/planillaexpticketinsp.hbs", { expedticket })
    } else {
        res.render("notes/inspecciones/expticket/planillaexpticketinsp.hbs", { expedticket })
    }
});

router.post('/ticketexp/findlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { iniciador } = req.body;
    const expedticket = await Expedticket.find({ iniciador: { $regex: iniciador, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        if (!expedticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/inspecciones/expticket/planillaexpticketinsp.hbs");
        } else {
            res.render('notes/inspecciones/expticket/planillaexpticketinsp.hbs', { expedticket })
        }
    } else {
        res.render('notes/planillalistaticket', { expedticket })
    }
});

router.post('/ticketexp/findlistaadrema', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { adrema } = req.body;
    const expedticket = await Expedticket.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        if (!expedticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/inspecciones/expticket/planillaexpticketinsp.hbs");
        } else {
            res.render('notes/inspecciones/expticket/planillaexpticketinsp.hbs', { expedticket })
        }
    } else {
        res.render('notes/inspecciones/expticket/planillaexpticketinsp.hbs', { expedticket })
    }
});

router.put('/notes/editexpedticket/:id', isAuthenticated, async (req, res) => {
    const { estado, numticket, iniciador, domicilio, adrema, fiduciariopropsocio, direcfiduciariopropsocio,
        correofiduciariopropsocio, directorobraoperitovisor, destinodeobra,
        superficieterreno, superficieaconstruir, superficiesubsueloplantabaja, superficieprimerpisoymaspisos,
        observaciones, permisobraoactainfrac, user, name, date } = req.body
    await Expedticket.findByIdAndUpdate(req.params.id, {
        estado, numticket, iniciador, domicilio, adrema, fiduciariopropsocio, direcfiduciariopropsocio,
        correofiduciariopropsocio, directorobraoperitovisor, destinodeobra,
        superficieterreno, superficieaconstruir, superficiesubsueloplantabaja, superficieprimerpisoymaspisos
        , observaciones, permisobraoactainfrac, user, name, date
    });
    req.flash('success_msg', 'Ticket de Expediente actualizado')
    res.redirect('/expedientes/listadoticket');
});

// ********* ZONA DE TICKET CON ENTRADA A INFORMES DE INSPECCION ********* (Expedticketentrainsp)

router.get('/expedientes/ticket/informeinspeccion', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const expedticketentrainsp = await Expedticketentrainsp.find().lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/expticket/planillalistainforticketexp', { expedticketentrainsp });
    } else if (rolusuario == "Inspector") {
        const expedticketentrainsp = await Expedticketentrainsp.find().lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/expticket/planillalistainforticketexp', { expedticketentrainsp });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TICKET EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/informexpedtickets/list/:id', isAuthenticated, async (req, res) => {
    const expedticketentrainsp = await Expedticketentrainsp.findById(req.params.id).lean()
    res.render('notes/inspecciones/expticket/listinforticket', { expedticketentrainsp })
});

router.put('/notes/editinformeticket/:id', isAuthenticated, async (req, res) => {
    const { idexpediente, numexpediente, numadrema, fechaentradainspeccion, fechaeinspectorinspeccion, numintimacion,
        numinfraccion, observaciones, destinopase, fechasalida,
        user, name, date } = req.body
    await Expedticketentrainsp.findByIdAndUpdate(req.params.id, {
        idexpediente, numexpediente, numadrema, fechaentradainspeccion, fechaeinspectorinspeccion, numintimacion,
        numinfraccion, observaciones, destinopase, fechasalida,
        user, name, date
    });
    req.flash('success_msg', 'Informe de ticket de Expediente actualizado')
    res.redirect('/expedientes/listadoticket');
});

router.get('/informexpedtickets/edit/:id', isAuthenticated, async (req, res) => {
    const expedticketentrainsp = await Expedticketentrainsp.findById(req.params.id).lean()
    res.render('notes/inspecciones/expticket/editinformeticket.hbs', { expedticketentrainsp })
});

router.post('/ticket/informeinspeccion/newinforexpticket', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { idexpediente, numexpediente, numadrema, numticket, fechaentradainspeccion, fechaeinspectorinspeccion,
        selectintimacion, numintimacion, darcumplimientoa, plazointimacion, selectinfraccion,
        numinfraccion, causas, paralizacion, causasparalizacion, informe, destinopase, fechasalida,
        user, name, date
    } = req.body;

    const newExpedticketentrainsp = new Expedticketentrainsp({
        idexpediente, numexpediente, numadrema, numticket, fechaentradainspeccion, fechaeinspectorinspeccion,
        selectintimacion, numintimacion, darcumplimientoa, plazointimacion, selectinfraccion,
        numinfraccion, causas, paralizacion, causasparalizacion, informe, destinopase, fechasalida,
        user, name, date
    })
    newExpedticketentrainsp.user = req.user.id;
    newExpedticketentrainsp.name = req.user.name;
    await newExpedticketentrainsp.save();
    req.flash('success_msg', 'Informe Expediente de Inspección Ticket Agregado Exitosamente');
    res.redirect('/expedientes/listadoticket');
});

router.delete('/expedinspeccion/ticket/delete/:id', isAuthenticated, async (req, res) => {
    await Expedticketentrainsp.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Informe de Ticket de Expediente Eliminado')
    res.redirect('/expedientes/listadoticket')
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;