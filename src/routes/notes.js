const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
//const mongopagi = require('mongoose-paginate-v2') Paginacion de mongodb

// tengo que requerir los modelos para que mongoose me cree las tablas
// const Expediente = require('../models/Expediente')
const Note = require('../models/Note')
const Intimacion = require('../models/Intimacion')
const Infraccion = require('../models/Infraccion')
//const Estadistica = require('../models/Estadistica')
const Ticket = require('../models/Ticket')
const Users = require('../models/User')
//const Cicloinspeccion = require('../models/cicloinspeccion')
const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')

// *ZONA PDF* //
const pdf = require("html-pdf");
const User = require('../models/User');
var pdfoptionsA4 = { format: 'A4' };

//**** sector de recuperacoin de borrados a bases de datos no preparadas *****/
router.get('/marcarborradosennoall', isAuthenticated, async (req, res) => {    
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        const infraccions = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/borrados/marcarborradosennoall');
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA ESTE AREA')
        return res.redirect('/');
    }
});

router.get('/tickets/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/newtickets');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TICKETS')
        return res.redirect('/');
    }
});

router.get('/notes/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/newnotes');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INSPECCIONES')
        return res.redirect('/');
    }
});

router.get('/intimaciones/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/newintimaciones');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/intimaciones/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        const intimacion = await Intimacion.findById(req.params.id).lean();
        res.render('notes/newintimaciones', { intimacion });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
})

router.get('/infracciones/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/newinfracciones');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INFRACCIONES')
        return res.redirect('/');
    }
})

// router.get('/estadisticas/add', isAuthenticated, (req, res) => {
//     const rolusuario = req.user.rolusuario;
//     if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
//         res.render('notes/newestadisticas');
//     } else {
//         req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
//         return res.redirect('/');
//     }
// })

router.post('/notes/newtickets', isAuthenticated, async (req, res) => {

    const { plataforma, numticket, iniciador, ubicacion, celular, email, adrema, directordeobra,
        destinodeobra, superficieterreno, superficieaconstruir, supsubptabja, supsubptaaltaymas,
        zona, observaciones, permisoobra, actainfraccion, fechaentradainspecciones,
        inspeccionfecha, inspeccioninspector, intimaciones, infracciones, pasea, fechapasea, eliminado,
        user, name
    } = req.body;

    const newTicket = new Ticket({
        plataforma, numticket, ubicacion, celular, email,
        adrema, directordeobra, destinodeobra, superficieterreno, superficieaconstruir,
        supsubptabja, supsubptaaltaymas, zona, observaciones, permisoobra, actainfraccion,
        fechaentradainspecciones, inspeccionfecha, inspeccioninspector, intimaciones,
        infracciones, pasea, fechapasea, eliminado,
        user, name
    })
    const mayu = iniciador.replace(/\b\w/g, l => l.toUpperCase())
    newTicket.iniciador = mayu
    newTicket.user = req.user.id;
    newTicket.name = req.user.name;
    await newTicket.save();
    req.flash('success_msg', 'Ticket Agregado Exitosamente');
    res.redirect('/ticket/listado');
});

router.post('/notes/newnotes', isAuthenticated, async (req, res) => {
    const newNote = new Note();
    newNote.origeninspeccion = req.body.origeninspeccion;
    newNote.numinspeccion = req.body.numinspeccion;
    newNote.expediente = req.body.expediente;
    newNote.oficio = req.body.oficio;
    newNote.acta = req.body.acta;
    newNote.adrema = req.body.adrema;
    newNote.date = req.body.date;
    newNote.inspuser = req.body.inspuser;
    newNote.informeinspnum = req.body.informeinspnum;
    newNote.fechaentradinspec = req.body.fechaentradinspec;
    newNote.inspecfecha = req.body.inspecfecha;
    newNote.inspector = req.body.inspector;
    newNote.paseanumdestino = req.body.paseanumdestino;
    newNote.pasea = req.body.pasea;
    newNote.fechapasea = req.body.fechapasea
    if (req.files[0]) {
        newNote.filename = req.files[0].filename;
        newNote.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newNote.filenamedos = req.files[1].filename;
        newNote.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newNote.filenametres = req.files[2].filename;
        newNote.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newNote.filenamecuatro = req.files[3].filename;
        newNote.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newNote.filenamecinco = req.files[4].filename;
        newNote.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newNote.filenameseis = req.files[5].filename;
        newNote.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newNote.filenamesiete = req.files[6].filename;
        newNote.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newNote.filenameocho = req.files[7].filename;
        newNote.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newNote.user = req.user.id;
    newNote.name = req.user.name;
    await newNote.save();
    req.flash('success_msg', 'Inspección Agregado Exitosamente');
    // console.log (newNote)
    res.redirect('/notes');
    // res.send('ok');
    // }
})

router.post('/notes/newintimaciones', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, eliminado, user, name
    } = req.body;

    const newIntimacion = new Intimacion({
        boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, eliminado, user, name
    })

    if (req.files[0]) {
        newIntimacion.filename = req.files[0].filename;
        newIntimacion.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newIntimacion.filenamedos = req.files[1].filename;
        newIntimacion.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newIntimacion.filenametres = req.files[2].filename;
        newIntimacion.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newIntimacion.filenamecuatro = req.files[3].filename;
        newIntimacion.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newIntimacion.filenamecinco = req.files[4].filename;
        newIntimacion.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newIntimacion.filenameseis = req.files[5].filename;
        newIntimacion.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newIntimacion.filenamesiete = req.files[6].filename;
        newIntimacion.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newIntimacion.filenameocho = req.files[7].filename;
        newIntimacion.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newIntimacion.user = req.user.id;
    newIntimacion.name = req.user.name;
    await newIntimacion.save();
    req.flash('success_msg', 'Intimación Agregada Exitosamente');
    res.redirect('/intimaciones');
})

router.post('/notes/newintimaciones/:id', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, eliminado, user, name
    } = req.body;

    const newIntimacion = new Intimacion({
        boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, eliminado, user, name
    })

    if (req.files[0]) {
        newIntimacion.filename = req.files[0].filename;
        newIntimacion.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newIntimacion.filenamedos = req.files[1].filename;
        newIntimacion.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newIntimacion.filenametres = req.files[2].filename;
        newIntimacion.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newIntimacion.filenamecuatro = req.files[3].filename;
        newIntimacion.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newIntimacion.filenamecinco = req.files[4].filename;
        newIntimacion.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newIntimacion.filenameseis = req.files[5].filename;
        newIntimacion.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newIntimacion.filenamesiete = req.files[6].filename;
        newIntimacion.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newIntimacion.filenameocho = req.files[7].filename;
        newIntimacion.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newIntimacion.user = req.user.id;
    newIntimacion.name = req.user.name;
    await newIntimacion.save();
    req.flash('success_msg', 'Intimación Agregada Exitosamente');
    res.redirect('/intimaciones');
})

router.post('/notes/newinfracciones', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const newInfraccion = new Infraccion();
    newInfraccion.actainfnum = req.body.actainfnum;
    newInfraccion.fechainfraccion = req.body.fechainfraccion;
    newInfraccion.horainfraccion = req.body.horainfraccion;
    newInfraccion.numexpedienteinf = req.body.numexpedienteinf;
    newInfraccion.adremainf = req.body.adremainf;
    newInfraccion.apellidonombrepropietarioinf = req.body.apellidonombrepropietarioinf;
    newInfraccion.domiciliopropietarioinf = req.body.domiciliopropietarioinf;
    newInfraccion.dnipropietarioinf = req.body.dnipropietarioinf;
    newInfraccion.cuilpropietarioinf = req.body.cuilpropietarioinf;
    newInfraccion.lugardeconstitucioninf = req.body.lugardeconstitucioninf;
    newInfraccion.causasinf = req.body.causasinf;
    newInfraccion.ordenanzanum = req.body.ordenanzanum;
    newInfraccion.notificadoinf = req.body.notificadoinf;
    newInfraccion.incisonum = req.body.incisonum;
    newInfraccion.observacion = req.body.observacion;
    newInfraccion.apellidonombretestigoinf = req.body.apellidonombretestigoinf;
    newInfraccion.inspectorinf = req.body.inspectorinf;
    newInfraccion.inspectorcod = req.body.inspectorcod;
    newInfraccion.detallegeneral = req.body.detallegeneral;
    newInfraccion.informeinspecnum = req.body.informeinspecnum;
    newInfraccion.inforinspecobsevaciones = req.body.inforinspecobsevaciones;

    if (req.files[0]) {
        newInfraccion.filename = req.files[0].filename;
        newInfraccion.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newInfraccion.filenamedos = req.files[1].filename;
        newInfraccion.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newInfraccion.filenametres = req.files[2].filename;
        newInfraccion.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newInfraccion.filenamecuatro = req.files[3].filename;
        newInfraccion.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newInfraccion.filenamecinco = req.files[4].filename;
        newInfraccion.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newInfraccion.filenameseis = req.files[5].filename;
        newInfraccion.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newInfraccion.filenamesiete = req.files[6].filename;
        newInfraccion.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newInfraccion.filenameocho = req.files[7].filename;
        newInfraccion.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newInfraccion.user = req.user.id;
    newInfraccion.name = req.user.name;
    await newInfraccion.save();
    req.flash('success_msg', 'Infracción Agregada Exitosamente');
    // console.log (newNote)
    res.redirect('/infracciones');
    // res.send('ok');
    // }
})


// *** DESACTIVADO TEMPORALMENTE ESTADISTICA ****
// router.post('/notes/newestadisticas', isAuthenticated, async (req, res) => {
//     //console.log(req.body)
//     const {  estadisticanum, fechaestadistica, horaestadistica, user ,name
//     } = req.body;
//     const errors = [];
//     if (!estadisticanum) {
//         errors.push({ text: "Ingrese Nº Estadistica" })
//     }
//     if (!fechaestadistica) {
//         errors.push({ text: "Ingrese Fecha Actual" })
//     }
//     // if (!inspector){
//     //     errors.push({text: "Ingrese Nombre Inspector/Usuario"})
//     // }
//     console.log(errors)
//     if (errors.length > 0) {
//         res.render('notes/newestadisticas', {
//             errors,
//             estadisticanum, fechaestadistica, horaestadistica
//         })
//     } else {
//         const newEstadistica = new Estadistica({
//             estadisticanum, fechaestadistica, horaestadistica, user ,name
//         })
//         newEstadistica.user = req.user.id;
//         newEstadistica.name = req.user.name;
//         await newEstadistica.save();
//         req.flash('success_msg', 'Estadistica Creada Exitosamente');
//         // console.log (newNote)
//         res.redirect('/estadisticas');
//         // res.send('ok');
//     }
// })

// aca llama los expedientes de la bd, pero si necesito que llame solo de usuarios especificos debo especificar en find
//
router.get('/usuarios', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA USUARIOS')
        return res.redirect('/');
    }
});

router.get('/ticket/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Inspector") {
        const ticket = await Ticket.find().limit(500).lean().sort({ date: 'desc' });;
        res.render('notes/planillalistaticket', { ticket });
    } else if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const ticket = await Ticket.find().limit(500).lean().sort({ date: 'desc' });
        res.render('notes/planillalistaticketadm', { ticket });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/notes', isAuthenticated, async (req, res) => { // (INSPECCIONES)
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const notes = await Note.find().lean().sort({ numinspeccion: 'desc' });
        res.render('notes/inspecciones/allnotesadm', { notes });
    } else if (rolusuario == "Inspector") {
        const notes = await Note.find().lean().sort({ numinspeccion: 'desc' });
        res.render('notes/inspecciones/allnotes', { notes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INSPECCIONES')
        return res.redirect('/');
    }
});

router.get('/notes/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const inspeccions = await Note.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/planillalistainspeccionadm', { inspeccions });
    } else if (rolusuario == "Inspector") {
        const inspeccions = await Note.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/planillalistainspeccionusr', { inspeccions });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/intimaciones', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const intimacions = await Intimacion.find().lean().sort({ date: 'desc' });
        res.render('notes/allintimadm', { intimacions });
    } else if (rolusuario == "Inspector") {
        const intimacions = await Intimacion.find().lean().sort({ date: 'desc' });
        res.render('notes/allintim', { intimacions });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/intimaciones/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const intimacions = await Intimacion.find().lean().sort({ date: 'desc' });
        res.render('notes/planillalistaintimacion', { intimacions });
    } else if (rolusuario == "Inspector") {
        const intimacions = await Intimacion.find().lean().sort({ date: 'desc' });
        res.render('notes/planillalistaintimacion', { intimacions });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/infracciones', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const infraccions = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/allinfraccadm', { infraccions });
    } else if (rolusuario == "Inspector") {
        const infraccions = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/allinfracc', { infraccions });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INFRACCIONES')
        return res.redirect('/');
    }
});

router.get('/infracciones/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const infracciones = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/planillalistainfraccion', { infracciones });
    } else if (rolusuario == "Inspector") {
        const infracciones = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/planillalistainfraccion', { infracciones });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INFRACCIONES')
        return res.redirect('/');
    }
});

// router.get('/estadisticas', isAuthenticated, async (req, res) => {
//     // res.send('Notes from data base');
//     const rolusuario = req.user.rolusuario;
//     if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
//         const estadisticas = await Estadistica.find().lean().sort({ estadisticanum: 'asc' });
//         res.render('notes/allestadistica', { estadisticas });
//     } else {
//         req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
//         return res.redirect('/');
//     }
//     //para que muestre notas de un solo user
//     // const estadisticas = await Estadistica.find({user : req.user.id}).lean().sort({estadisticanum:'desc'}); 

// });

router.get('/usuarios', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        const infracciones = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/allusuariosadm', { infracciones });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA USUARIOS')
        return res.redirect('/');
    }
});


// ***** Aca los GET para EDITAR ******

router.get('/usuarios/edit/:id', isAuthenticated, async (req, res) => {
    const usuarios = await Users.findById(req.params.id).lean()
    res.render('users/editusuarios', { usuarios })
});

router.get('/tickets/edit/:id', isAuthenticated, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id).lean()
    res.render('notes/editticket', { ticket })
});

router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean()
    res.render('notes/inspecciones/editnote', { note })
});

router.get('/intimaciones/edit/:id', isAuthenticated, async (req, res) => {
    const intimacion = await Intimacion.findById(req.params.id).lean()
    res.render('notes/editintimacion', { intimacion })
});

router.get('/infracciones/edit/:id', isAuthenticated, async (req, res) => {
    const infraccion = await Infraccion.findById(req.params.id).lean()
    res.render('notes/editinfraccion', { infraccion })
});

// router.get('/estadisticas/edit/:id', isAuthenticated, async (req, res) => {
//     const estadistica = await Estadistica.findById(req.params.id).lean()
//     res.render('notes/editestadistica', { estadistica })
// });

// ***** informacion de cada dato ****** LISTADOS

router.get('/usuario/list', isAuthenticated, async (req, res) => {
    const email = req.user.email;
    const users = await Users.find({ email: email }).lean()
    // console.log(note.date);
    res.render('notes/listusuario', { users })
});

router.get('/ticket/list/:id', isAuthenticated, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id).lean()
    res.render('notes/listticket', { ticket })
});

router.get('/notes/list/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean()
    res.render('notes/inspecciones/listnote', { note })
});

router.get('/intimaciones/list/:id', isAuthenticated, async (req, res) => {
    const intimacion = await Intimacion.findById(req.params.id).lean()
    res.render('notes/listintimacion', { intimacion })
});

router.get('/infracciones/list/:id', isAuthenticated, async (req, res) => {
    const infraccion = await Infraccion.findById(req.params.id).lean()
    res.render('notes/listinfraccion', { infraccion })
});

// router.get('/estadisticas/list/:id', isAuthenticated, async (req, res) => {
//     const estadistica = await Estadistica.findById(req.params.id).lean()
//     res.render('notes/listestadistica', { estadistica })
// });

//  ***** SECTOR BUSQUEDA *****

// *** BUSCAR EN TICKET ***
router.post('/ticket/findlistaticket', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numticket } = req.body;
    const ticket = await Ticket.find({ numticket: { $regex: numticket, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});

router.post('/ticket/findlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { iniciador } = req.body;
    const ticket = await Ticket.find({ iniciador: { $regex: iniciador, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Inspector") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});

router.post('/ticket/findlistaadrema', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { adrema } = req.body;
    const ticket = await Ticket.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Inspector") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});

router.post('/ticket/findlistadireccion', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { ubicacion } = req.body;
    const ticket = await Ticket.find({ ubicacion: { $regex: ubicacion, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Inspector") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});

router.post('/ticket/findlistafechainsp', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { inspeccionfecha } = req.body;
    const ticket = await Ticket.find({ inspeccionfecha: { $regex: inspeccionfecha, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Inspector") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});



// *** BUSCAR INSPECCIONES ***
router.post('/notes/findinspeccion', isAuthenticated, async (req, res) => {
    const { numinspeccion } = req.body;
    const notes = await Note.find({ numinspeccion: { $regex: numinspeccion, $options: "i" } }).lean().sort({ numinspeccion: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/inspecciones/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});


router.post('/notes/findadrema', isAuthenticated, async (req, res) => {
    const { adrema } = req.body;
    const notes = await Note.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ adrema: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});

router.post('/notes/findinspector', isAuthenticated, async (req, res) => {
    const { inspector } = req.body;
    const notes = await Note.find({ inspector: { $regex: inspector, $options: "i" } }).lean().sort({ inspector: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Inspector')
        return res.render("notes/inspecciones/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});

// *** BUSCAR INTIMACIONES ***
router.post('/notes/findintimacion', isAuthenticated, async (req, res) => {
    const { boletaintnum } = req.body;
    const intimacions = await Intimacion.find({ boletaintnum: { $regex: boletaintnum, $options: "i" } }).lean().sort({ numinspeccion: 'desc' });;
    if (!intimacions) {
        req.flash('success_msg', 'cargue una Boleta Intimación')
        return res.render("notes/allintimaciones");
    } else {
        res.render('notes/findintimacion', { intimacions })
    }
});

router.post('/notes/findexpedienteintimacion', isAuthenticated, async (req, res) => {
    const { numexpedienteint } = req.body;
    const intimacions = await Intimacion.find({ numexpedienteint: { $regex: numexpedienteint, $options: "i" } }).lean().sort({ numexpedienteint: 'desc' });;
    if (!intimacions) {
        req.flash('success_msg', 'cargue una Boleta Intimación')
        return res.render("notes/allintimaciones");
    } else {
        res.render('notes/findintimacion', { intimacions })
    }
});

router.post('/notes/findadremaintim', isAuthenticated, async (req, res) => {
    const { adrema } = req.body;
    const intimacions = await Intimacion.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ adrema: 'desc' });;
    if (!intimacions) {
        req.flash('success_msg', 'cargue un Adrema')
        return res.render("notes/allintimaciones");
    } else {
        res.render('notes/findintimacion', { intimacions })
    }
});

router.post('/notes/findinspectorintim', isAuthenticated, async (req, res) => {
    const { inspectorint } = req.body;
    const intimacions = await Intimacion.find({ inspectorint: { $regex: inspectorint, $options: "i" } }).lean().sort({ inspectorint: 'desc' });;
    if (!intimacions) {
        req.flash('success_msg', 'cargue un Inspector')
        return res.render("notes/allintimaciones");
    } else {
        res.render('notes/findintimacion', { intimacions })
    }
});

// *** BUSCAR INFRACCIONES - CARTAS ***
router.post('/notes/findinfraccion', isAuthenticated, async (req, res) => {

    const { actainfnum } = req.body;
    const infraccions = await Infraccion.find({ actainfnum: { $regex: actainfnum, $options: "i" } }).lean().sort({ actainfnum: 'desc' });;
    if (!infraccions) {
        req.flash('success_msg', 'cargue una Boleta Intimación')
        return res.render("notes/allinfracciones");
    } else {
        res.render('notes/findinfraccion', { infraccions })
    }
});

router.post('/notes/findexpedienteinf', isAuthenticated, async (req, res) => {
    const { numexpedienteinf } = req.body;
    const infraccions = await Infraccion.find({ numexpedienteinf: { $regex: numexpedienteinf, $options: "i" } }).lean().sort({ numexpedienteinf: 'desc' });;
    if (!infraccions) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/allinfracciones");
    } else {
        res.render('notes/findinfraccion', { infraccions })
    }
});
router.post('/notes/findadremainf', isAuthenticated, async (req, res) => {
    const { adremainf } = req.body;
    const infraccions = await Infraccion.find({ adremainf: { $regex: adremainf, $options: "i" } }).lean().sort({ adremainf: 'desc' });;
    if (!infraccions) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/allinfracciones");
    } else {
        res.render('notes/findinfraccion', { infraccions })
    }
});

router.post('/notes/findpropietainf', isAuthenticated, async (req, res) => {
    const { apellidonombrepropietarioinf } = req.body;
    const infraccions = await Infraccion.find({ apellidonombrepropietarioinf: { $regex: apellidonombrepropietarioinf, $options: "i" } }).lean().sort({ apellidonombrepropietarioinf: 'desc' });;
    if (!infraccions) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/allinfracciones");
    } else {
        res.render('notes/findinfraccion', { infraccions })
    }
});

// *** BUSCAR INFRACCIONES - LISTADO ***
router.post('/infracciones/findinfraccion', isAuthenticated, async (req, res) => {
    const { actainfnum } = req.body;
    const infracciones = await Infraccion.find({ actainfnum: { $regex: actainfnum, $options: "i" } }).lean().sort({ actainfnum: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue una Boleta Intimación')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/findexpedienteinf', isAuthenticated, async (req, res) => {
    const { numexpedienteinf } = req.body;
    const infracciones = await Infraccion.find({ numexpedienteinf: { $regex: numexpedienteinf, $options: "i" } }).lean().sort({ numexpedienteinf: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/dniinf', isAuthenticated, async (req, res) => {
    const { dnipropietarioinf } = req.body;
    const infracciones = await Infraccion.find({ dnipropietarioinf: { $regex: dnipropietarioinf, $options: "i" } }).lean().sort({ dnipropietarioinf: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue un Nº D.N.I.')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/findlistaadrema', isAuthenticated, async (req, res) => {
    const { adremainf } = req.body;
    const infracciones = await Infraccion.find({ adremainf: { $regex: adremainf, $options: "i" } }).lean().sort({ adremainf: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/findpropietainf', isAuthenticated, async (req, res) => {
    const { apellidonombrepropietarioinf } = req.body;
    const infracciones = await Infraccion.find({ apellidonombrepropietarioinf: { $regex: apellidonombrepropietarioinf, $options: "i" } }).lean().sort({ apellidonombrepropietarioinf: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue un Nombre y Apellido')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/findlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechainfraccion } = req.body;
    const infracciones = await Infraccion.find({ fechainfraccion: { $regex: fechainfraccion, $options: "i" } }).lean().sort({ fechainfraccion: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue una Fecha')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

// *** BUSCAR ESTADISTICAS - CARTAS ***
router.post('/notes/findnumestadistica', isAuthenticated, async (req, res) => {
    const { estadisticanum } = req.body;
    const estadisticas = await Estadistica.find({ estadisticanum: { $regex: estadisticanum, $options: "i" } }).lean().sort({ estadisticanum: 'desc' });;
    if (!estadisticas) {
        req.flash('success_msg', 'cargue un Nº Estadistica')
        return res.render("notes/allestadistica");
    } else {
        res.render('notes/findestadistica', { estadisticas })
    }
});
router.post('/notes/findfechaestadistica', isAuthenticated, async (req, res) => {
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
    const { fechaestadistica } = req.body;
    const estadisticas = await Estadistica.find({ fechaestadistica: { $regex: fechaestadistica, $options: "i" } }).lean().sort({ fechaestadistica: 'desc' });;
    if (!estadisticas) {
        req.flash('success_msg', 'cargue una Fecha Valida')
        return res.render("notes/allestadistica");
    } else {
        res.render('notes/findestadistica', { estadisticas })
    }
});

// **** AGREGAR OTRA INTIMACION A MISMA PERSONA****
router.put('/notes/editaddintimacion/:id', isAuthenticated, async (req, res) => {
    const { boletaintnum, numexpedienteint, adremaint, senorsenora, domiciliopart,
        lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint } = req.body
    await Intimacion.findByIdAndUpdate(req.params.id, {
        boletaintnum, numexpedienteint, adremaint,
        senorsenora, domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint
    });
    req.flash('success_msg', 'Nueva Intimación Agregada')
    res.redirect('/intimaciones');
});

// **** SECTOR EDITAR ****

router.put('/users/editusuarios/:id', isAuthenticated, async (req, res) => {
    const { name, dni, email, rolusuario } = req.body
    await Users.findByIdAndUpdate(req.params.id, {
        name, dni, email, rolusuario
    });
    req.flash('success_msg', 'Usuario Actualizado')
    res.redirect('/usuarios');
});

router.put('/notes/editticket/:id', isAuthenticated, async (req, res) => {
    const { plataforma, numticket, iniciador, ubicacion, celular, email, adrema, directordeobra,
        destinodeobra, superficieterreno, superficieaconstruir, supsubptabja, supsubptaaltaymas,
        zona, observaciones, permisoobra, actainfraccion, fechaentradainspecciones,
        inspeccionfecha, inspeccioninspector, intimaciones, infracciones, pasea, fechapasea,
        user, name
    } = req.body
    await Ticket.findByIdAndUpdate(req.params.id, {
        plataforma, numticket, iniciador, ubicacion, celular, email, adrema, directordeobra,
        destinodeobra, superficieterreno, superficieaconstruir, supsubptabja, supsubptaaltaymas,
        zona, observaciones, permisoobra, actainfraccion, fechaentradainspecciones,
        inspeccionfecha, inspeccioninspector, intimaciones, infracciones, pasea, fechapasea,
        user, name
    });
    req.flash('success_msg', 'Ticket Actualizado')
    res.redirect('/ticket/listado');
});

router.put('/notes/inspecciones/editnote/:id', isAuthenticated, async (req, res) => {
    const { numinspeccion, expediente, oficio, acta, adrema, date, inspuser,
        informeinspnum, fechaentradinspec, inspecfecha, inspector,
        fotoinspeccion, intimacion, infraccion, observacion, paseanumdestino,
        pasea, fechapasea } = req.body
    await Note.findByIdAndUpdate(req.params.id, {
        numinspeccion, expediente, oficio, acta, adrema, date, inspuser,
        informeinspnum, fechaentradinspec, inspecfecha, inspector,
        fotoinspeccion, intimacion, infraccion, observacion, paseanumdestino,
        pasea, fechapasea
    });
    req.flash('success_msg', 'Inspección actualizada')
    res.redirect('/notes/listado');
});

router.put('/notes/editintimacion/:id', isAuthenticated, async (req, res) => {
    const { boletaintnum, numexpedienteint, adremaint, senorsenora, domiciliopart,
        lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint } = req.body
    await Intimacion.findByIdAndUpdate(req.params.id, {
        boletaintnum, numexpedienteint, adremaint,
        senorsenora, domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint
    });
    req.flash('success_msg', 'Intimación actualizada')
    res.redirect('/intimaciones');
});

router.put('/notes/editinfraccion/:id', isAuthenticated, async (req, res) => {
    const { actainfnum, fechainfraccion, horainfraccion, numexpedienteinf, adremainf,
        apellidonombrepropietarioinf, domiciliopropietarioinf, dnipropietarioinf, cuilpropietarioinf,
        lugardeconstitucioninf, causasinf, ordenanzanum, notificadoinf, incisonum,
        observacion, apellidonombretestigoinf, inspectorinf, inspectorcod, detallegeneral,
        informeinspecnum, inforinspecobsevaciones, fotoinf } = req.body
    await Infraccion.findByIdAndUpdate(req.params.id, {
        actainfnum, fechainfraccion, horainfraccion, numexpedienteinf, adremainf,
        apellidonombrepropietarioinf, domiciliopropietarioinf, dnipropietarioinf, cuilpropietarioinf,
        lugardeconstitucioninf, causasinf, ordenanzanum, notificadoinf, incisonum,
        observacion, apellidonombretestigoinf, inspectorinf, inspectorcod, detallegeneral,
        informeinspecnum, inforinspecobsevaciones, fotoinf
    });
    req.flash('success_msg', 'Infraccion actualizada')
    res.redirect('/infracciones');
});

// **** SECTOR DELETE ****

router.delete('/usuarios/delete/:id', isAuthenticated, async (req, res) => {
    var usuarios = await Users.find().lean().sort();
    if (usuarios.length > 1) {
        await Users.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Usuario Eliminado')
        res.redirect('/usuarios')
    }
    else {
        req.flash('success_msg', 'No puede eliminar usuario único')
        res.redirect('/usuarios')
    }
});

router.delete('/tickets/delete/:id', isAuthenticated, async (req, res) => {
    await Ticket.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Ticket Eliminado')
    res.redirect('/ticket/listado')
});

//NOTES es inspecciones
router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Inspección Eliminada')
    res.redirect('/notes/listado')
});

router.delete('/intimaciones/delete/:id', isAuthenticated, async (req, res) => {
    await Intimacion.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Intimación Eliminada')
    res.redirect('/intimaciones')
});

router.delete('/infracciones/delete/:id', isAuthenticated, async (req, res) => {
    await Infraccion.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Infracción Eliminada')
    res.redirect('/infracciones')
});

// router.delete('/estadisticas/delete/:id', isAuthenticated, async (req, res) => {
//     const idfile = req.params.id;
//     const datosfile = Estadistica.find({ idfile: { $regex: idfile, $options: "i" } }).lean();
//     await Estadistica.findByIdAndDelete(req.params.id);
//     // const filenamepru = datosfile[0].filename
//     // console.log ('filnamepru', datosfile[0].filename)
//     console.log('filenamepru', datosfile)
//     // fs.unlink(`./src/public/img/uploads/${filenamepru}`)
//     // // fs.unlink('\src\public\img\uploads\',filenamepru)
//     //     .then(() => {
//     //         console.log('File removed')
//     //     }).catch(err => {
//     //         console.error('Something wrong happened removing the file', err)
//     //     })

//     req.flash('success_msg', 'Estadistica Eliminada')
//     res.redirect('/estadisticas')
//     // console.log(req.params.id)
//     // res.send('ok')
// });

// **** sector IMAGEN ESTADISTICA ****

// router.post('/notes/newestadisticas', isAuthenticated, async (req, res) => {
//     const newEstadistica = new Estadistica();
//     newEstadistica.estadisticanum = req.body.estadisticanum;
//     newEstadistica.fechaestadistica = req.body.fechaestadistica;
//     newEstadistica.horaestadistica = req.body.horaestadistica;
//     if (req.files[0]) {
//         // const file = req.files[0]        
//         // req.files[0].nameest='Estadistica'        
//         // console.log('req files 0', req.files[0]);
//         newEstadistica.filename = req.files[0].filename;
//         newEstadistica.path = '/img/uploads/' + req.files[0].filename;
//         // newEstadistica.nameest = req.files[0].nameest;
//     }
//     if (req.files[1]) {
//         newEstadistica.filenamedos = req.files[1].filename;
//         newEstadistica.pathdos = '/img/uploads/' + req.files[1].filename;
//     }
//     if (req.files[2]) {
//         newEstadistica.filenametres = req.files[2].filename;
//         newEstadistica.pathtres = '/img/uploads/' + req.files[2].filename;
//     }
//     if (req.files[3]) {
//         newEstadistica.filenamecuatro = req.files[3].filename;
//         newEstadistica.pathcuatro = '/img/uploads/' + req.files[3].filename;
//     }
//     if (req.files[4]) {
//         newEstadistica.filenamecinco = req.files[4].filename;
//         newEstadistica.pathcinco = '/img/uploads/' + req.files[4].filename;
//     }
//     if (req.files[5]) {
//         newEstadistica.filenameseis = req.files[5].filename;
//         newEstadistica.pathseis = '/img/uploads/' + req.files[5].filename;
//     }
//     if (req.files[6]) {
//         newEstadistica.filenamesiete = req.files[6].filename;
//         newEstadistica.pathsiete = '/img/uploads/' + req.files[6].filename;
//     }
//     if (req.files[7]) {
//         newEstadistica.filenameocho = req.files[7].filename;
//         newEstadistica.pathocho = '/img/uploads/' + req.files[7].filename;
//     }
//     newEstadistica.user = req.user.id;
//     newEstadistica.name = req.user.name;
//     // newEstadistica.originalname = req.file.originalname;
//     // newEstadistica.mimetype = req.file.mimetype;
//     // newEstadistica.size = req.file.size;
//     // console.log(req.files[2].filename) 
//     await newEstadistica.save();
//     req.flash('success_msg', 'Estadistica Creada Exitosamente');
//     // console.log (newNote)
//     res.redirect('/estadisticas');
//     // await Estadistica.save();
//     // res.redirect('/');
// });

//** ejemplo de subida de archivos */
// uploadImage: (req, res, nex) => {
//     //...
//     if(req.files && req.files.uploads && Array.isArray(req.files.uploads)) { // suponiendo que espero el input llamado 'uploads'
//       let images = req.files.uploads.map(file => {
//         // operaciones con cada elemento file para obtener el nombre del archivo y guardarlo en una lista
//         return fileName;
//       });
//       Project.findByIdAndUpdate(id, { $push: {images: {$each: images} } }, callback);
//       // ...
//     } else if(req.files && req.files.uploads) { // caso de un único archivo
//       // lógica para obtener el nombre del archivo
//       // let imageName = ...
//       Project.findByIdAndUpdate(id, { $push: {images: imageName} }, callback);
//       //..
//     } else {
//       // caso de no recibir imágenes
//     }
//   }

//// *** SECTOR PARA ELIMINAR FISICAMENTE IMAGENES ***

// router.get('/inspeccion/imagenes/:id', isAuthenticated, async (req, res) => {

// })

// router.get('/image/:id/delete', isAuthenticated, async (req, res) => {

// })


module.exports = router;