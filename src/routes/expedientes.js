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
const Expedcoordinado = require('../models/expedcoordinado');
const Expedcoordresultado = require('../models/expedcoordresultado');
const Inspectores = require('../models/inspectores');

//** ver tema NOTE */
const Note = require('../models/Note');

// *ZONA PDF* //
const expedinspeccion = require('../models/expedinspeccion');
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
    await Expediente.update({ numexpediente: numexpediente }, { $set: { estado: estado } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Estado de Expediente Modificado Exitosamente');
    res.redirect('/expedientes/listado');
});

router.get('/expedientes/movimientosestadosexpedientes/:id', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    //var id = req.params.id;
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



router.get('/expedientes/coordinados', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const expedcoordinado = await Expedcoordinado.find({ borrado: "No" }).lean().limit(200).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado });
    } else if (rolusuario == "Inspector") {
        const expedcoordinado = await Expedcoordinado.find({ borrado: "No" }).lean().limit(200).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/listaexpcoordininsp', { expedcoordinado });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES COORDINADOS')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/intimacionesvencidas', isAuthenticated, async (req, res) => {
    // buscar por fecha
    //const { fechaingreso } = req.body;
    //const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })    
    const rolusuario = req.user.rolusuario;
    // Obtén la fecha actual
    //var miArray = String(new Date());
    // Comparar fechas usando $gte y $lt
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        //console.log("HASTAD", fechaActual)
        console.log("D", d)
        const expedcoordresultadotabla = await Expedcoordresultado.find({$and : [ {borrado : "No"}, {desestimar : "No"}, { vencimientointimacion: { $lte: fechaActual } }]}).lean().sort({ vencimientointimacion: 'desc' });
        //console.log("Expedientes Coordinados", expedcoordresultado)
        for (var expedcoordresultado of expedcoordresultadotabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;   
            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = expedcoordresultado.vencimientointimacion;
            if (tipoint != null) {
                const fecha = new Date(expedcoordresultado.vencimientointimacion);
                const dia = fecha.getDate()
                var mes = 0
                const calcmes = fecha.getMonth() + 1
                if (calcmes < 10) {
                    mes = "0" + calcmes + "-"
                } else {
                    mes = calcmes + "-"
                }
                if (dia > 0 && dia < 10) {
                    var diastring = "0" + dia + "-"
                } else {
                    var diastring = dia + "-"
                }
                const ano = fecha.getFullYear()
                //const fullyear = fecha.toLocaleDateString();
                const fullyear = diastring + mes + ano
                //const fullyear = fecha.toLocaleDateString();
                expedcoordresultado.vencimientointimacion = fullyear;
            } else {
                expedcoordresultado.vencimientointimacion = "----"
            }           

            // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

            // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
            // necesito igualar para que se copie el cambio
            expedcoordresultado = expedcoordresultadotabla
            console.log("expedcoordresultado", expedcoordresultado);
            console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado });
    } else if (rolusuario == "Inspector") {
        const expedcoordresultado = await Expedcoordresultado.find({ borrado: "No" }).lean().limit(200).sort({ numexpediente: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES COORDINADOS')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/intiminfracdesestimados', isAuthenticated, async (req, res) => {
    // buscar por fecha
    //const { fechaingreso } = req.body;
    //const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })    
    const rolusuario = req.user.rolusuario;
    // Obtén la fecha actual
    //var miArray = String(new Date());
    // Comparar fechas usando $gte y $lt
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        //console.log("HASTAD", fechaActual)
        console.log("D", d)
        const expedcoordresultadotabla = await Expedcoordresultado.find({$and : [ {borrado : "No"}, {desestimar : "Si"}, { vencimientointimacion: { $lte: fechaActual } }]}).lean().sort({ vencimientointimacion: 'desc' });
        //console.log("Expedientes Coordinados", expedcoordresultado)
        for (var expedcoordresultado of expedcoordresultadotabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = expedcoordresultado.vencimientointimacion;
            if (tipoint != null) {
                const fecha = new Date(expedcoordresultado.vencimientointimacion);
                const dia = fecha.getDate()
                var mes = 0
                const calcmes = fecha.getMonth() + 1
                if (calcmes < 10) {
                    mes = "0" + calcmes + "-"
                } else {
                    mes = calcmes + "-"
                }
                if (dia > 0 && dia < 10) {
                    var diastring = "0" + dia + "-"
                } else {
                    var diastring = dia + "-"
                }
                const ano = fecha.getFullYear()
                //const fullyear = fecha.toLocaleDateString();
                const fullyear = diastring + mes + ano
                //const fullyear = fecha.toLocaleDateString();
                expedcoordresultado.vencimientointimacion = fullyear;
            } else {
                expedcoordresultado.vencimientointimacion = "----"
            }           

            // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

            // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
            // necesito igualar para que se copie el cambio
            expedcoordresultado = expedcoordresultadotabla
            console.log("expedcoordresultado", expedcoordresultado);
            console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        res.render('notes/inspecciones/listexpcordintvencdes', { expedcoordresultado });
    } else if (rolusuario == "Inspector") {
        const expedcoordresultado = await Expedcoordresultado.find({ borrado: "No" }).lean().limit(200).sort({ numexpediente: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/listexpcordintvencdes', { expedcoordresultado });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES COORDINADOS')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/newexpcoordin');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/list/:id', isAuthenticated, async (req, res) => {
    const expedcoordinado = await Expedcoordinado.findById(req.params.id).lean()
    res.render('notes/inspecciones/listexpedcood', { expedcoordinado })
});

router.get('/expedcoordin/intimacionesvencidas/list/:id', isAuthenticated, async (req, res) => {
    const expedcoordresultado = await Expedcoordresultado.findById(req.params.id).lean()
    res.render('notes/inspecciones/listexpedcoodvenc', { expedcoordresultado })
});

router.get('/expedientes/coordinados/listresultado/:id', isAuthenticated, async (req, res) => {
    var expedcoordinado = await Expedcoordinado.findById(req.params.id).lean()
    //const expedientes = await Expediente.findById(id).lean().sort({ numexpediente: 'desc' });
    var idexpediente = expedcoordinado._id
    var expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { idexpediente: idexpediente }] }).lean().sort({date: 'desc'});

    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.fechaintimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.fechaintimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.fechaintimacion = fullyear;
        } else {
            expedcoordresultado.fechaintimacion = "----"
        }

        var tipoinf = expedcoordresultado.fechainfraccion;
        if (tipoinf != null) {
            const fecha = new Date(expedcoordresultado.fechainfraccion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.fechainfraccion = fullyear;
        } else {
            expedcoordresultado.fechainfraccion = "----"
        }

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        console.log("expedcoordresultado", expedcoordresultado);
        console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    res.render('notes/inspecciones/listaexpedcoordmov', { expedcoordresultado, expedcoordinado })
});

// *** BUSCAR EXPEDIENTES COORDINADOS - LISTADO *** SECTOR BUSQUEDAS
router.post('/expedientes/coordinados/find', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ fechainicioentrada: 'desc' });;
    if (!expedcoordinado) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/inspecciones/listaexpcoordinadm");
    } else {
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado })
    }
});

router.post('/expedientes/coordinados/findadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { adremaexp: { $regex: adremaexp, $options: "i" } }] }).lean().sort({ adremaexp: 'desc' });;
    if (!expedcoordinado) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/listaexpcoordinadm");
    } else {
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado })
    }
});

router.post('/expedientes/coordinados/findiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });;
    if (!expedcoordinado) {
        req.flash('success_msg', 'cargue un Iniciador (N y A)')
        return res.render("notes/inspecciones/listaexpcoordinadm");
    } else {
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado })
    }
});

router.post('/expedientes/coordinados/findestado', isAuthenticated, async (req, res) => {
    const { estado } = req.body;
    const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { estado: { $regex: estado, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });
    if (!expedcoordinado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listaexpcoordinadm");
    } else {
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado })
    }
});

// busqueda lista intimaciones vencida - lisexpcordintvenc.hbs

router.post('/expedientes/coordinados/intimacionesvencidas/find', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    //const expedcoordresultadotabla = await Expedcoordresultado.find({ vencimientointimacion: { $lte: fechaActual } }).lean().sort({ vencimientointimacion: 'desc' });
    const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { vencimientointimacion: { $lte: fechaActual } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ vencimientointimacion: 'desc' });
    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.vencimientointimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.vencimientointimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.vencimientointimacion = fullyear;
        } else {
            expedcoordresultado.vencimientointimacion = "----"
        }           

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        console.log("expedcoordresultado", expedcoordresultado);
        console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!expedcoordresultado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listexpcordintvenc");
    } else {
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado })
    }
});

router.post('/expedientes/coordinados/intimacionesvencidas/findadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    //const expedcoordresultadotabla = await Expedcoordresultado.find({ vencimientointimacion: { $lte: fechaActual } }).lean().sort({ vencimientointimacion: 'desc' });
    const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { vencimientointimacion: { $lte: fechaActual } }, { adremaexp: { $regex: adremaexp, $options: "i" } }] }).lean().sort({ vencimientointimacion: 'desc' });
    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.vencimientointimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.vencimientointimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.vencimientointimacion = fullyear;
        } else {
            expedcoordresultado.vencimientointimacion = "----"
        }           

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        console.log("expedcoordresultado", expedcoordresultado);
        console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!expedcoordresultado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listexpcordintvenc");
    } else {
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado })
    }
});

router.post('/expedientes/coordinados/intimacionesvencidas/findiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    //const expedcoordresultadotabla = await Expedcoordresultado.find({ vencimientointimacion: { $lte: fechaActual } }).lean().sort({ vencimientointimacion: 'desc' });
    const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { vencimientointimacion: { $lte: fechaActual } }, { iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }] }).lean().sort({ vencimientointimacion: 'desc' });
    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.vencimientointimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.vencimientointimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.vencimientointimacion = fullyear;
        } else {
            expedcoordresultado.vencimientointimacion = "----"
        }           

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        console.log("expedcoordresultado", expedcoordresultado);
        console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!expedcoordresultado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listexpcordintvenc");
    } else {
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado })
    }
});

router.post('/expedientes/coordinados/intimacionesvencidas/findinspector', isAuthenticated, async (req, res) => {
    const { inspector } = req.body;
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    //const expedcoordresultadotabla = await Expedcoordresultado.find({ vencimientointimacion: { $lte: fechaActual } }).lean().sort({ vencimientointimacion: 'desc' });
    const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { vencimientointimacion: { $lte: fechaActual } }, { inspector: { $regex: inspector, $options: "i" } }] }).lean().sort({ vencimientointimacion: 'desc' });
    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.vencimientointimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.vencimientointimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.vencimientointimacion = fullyear;
        } else {
            expedcoordresultado.vencimientointimacion = "----"
        }           

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        console.log("expedcoordresultado", expedcoordresultado);
        console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!expedcoordresultado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listexpcordintvenc");
    } else {
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado })
    }
});
// *** FIN DEL SECTOR BUSCAR BUSQUEDA FIND ///

// **** SECTOR NEW ALTAS NUEVOS ******
router.post('/notes/newexpedcoordin', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, adremaexp, numexpediente, estado, fechainspeccion, horainspeccion, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, motivoinspeccion,
        eliminado, user, name, date } = req.body;
    const newexpedcoordin = new Expedcoordinado({
        borrado, userborrado, fechaborrado, adremaexp, numexpediente, fechainspeccion, horainspeccion, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, motivoinspeccion,
        eliminado, user, name, date
    })
    Expedcoordinado.user = req.user.id;
    Expedcoordinado.name = req.user.name;
    await newexpedcoordin.save();
    req.flash('success_msg', 'Expediente Coordinado Agregado Exitosamente');
    res.redirect('/expedientes/coordinados');
});

router.post('/notes/newexpedcoordinresult', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, adremaexp, idexpediente, numexpediente, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, intimvinculadainfraccion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, fechainspeccion, horainspeccion, motivoinspeccion,
        eliminado, user, name, date } = req.body;
    const newexpedcoordresultado = new Expedcoordresultado({
        borrado, userborrado, fechaborrado, adremaexp, idexpediente, numexpediente, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, intimvinculadainfraccion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, fechainspeccion, horainspeccion, motivoinspeccion,
        eliminado, user, name, date
    })    
    Expedcoordresultado.user = req.user.id;
    Expedcoordresultado.name = req.user.name;
    await newexpedcoordresultado.save();
    await Expedcoordinado.update({ $set: { estado: estado } })
    req.flash('success_msg', 'Resultado de Expediente Coordinado Agregado');
    res.redirect('/expedientes/coordinados');
});

router.get('/movimientoexpedientecoord/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const expedcoordinado = await Expedcoordinado.findById(req.params.id).lean();
    //const usuarios = await Users.find().lean().sort({ date: 'desc' });
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Jefe-Inspectores") {
        res.render('notes/inspecciones/movimientoexpedcoord', { expedcoordinado });;
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.put('/expedcoordin/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expedcoordinado.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    const idexpediente = req.params.id
    await Expedcoordresultado.updateMany({idexpediente : idexpediente, borrado : "No"},{ 
        borrado : borrado, fechaborrado: fechaborrado, userborrado: userborrado
});
    req.flash('success_msg', 'Expediente y sus Movimientos a Papelera Reciclaje')
    //res.render('notes/inspecciones/listexpcordintvenc');
    res.redirect('/expedientes/coordinados');
});

router.put('/expedcoordinmov/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expedcoordresultado.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Expediente a Papelera Reciclaje')
    res.render('notes/inspecciones/listexpcordintvenc');
    //res.redirect('/expedientes/coordinados');
});

router.put('/expedcoordinmovdes/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expedcoordresultado.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Expediente a Papelera Reciclaje')
    res.render('notes/inspecciones/listexpcordintvenc');
    //res.redirect('/expedientes/coordinados');
});

router.delete('/expedcoordin/delete/:id', isAuthenticated, async (req, res) => {
    await Expedcoordinado.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'expediente Eliminado')
    res.redirect('/expedientes/coordinados')
});

router.put('/expedcoordinmov/marcadesestimar/:id', isAuthenticated, async (req, res) => {
    const desestimar = "Si";
    const fechadesestimado = new Date();
    await Expedcoordresultado.findByIdAndUpdate(req.params.id, {
        desestimar, fechadesestimado
    });
    req.flash('success_msg', 'Intimación Desestimada')
    res.render('notes/inspecciones/listexpcordintvenc');
});


router.put('/expedcoordinmov/borrarmarcadesestimar/:id', isAuthenticated, async (req, res) => {
    const desestimar = "No";
    const fechadesestimado = new Date();
    await Expedcoordresultado.findByIdAndUpdate(req.params.id, {
        desestimar, fechadesestimado
    });
    req.flash('success_msg', 'Intimación Recuperada de Desestimación')
    res.render('notes/inspecciones/listexpcordintvenc');
});


router.get('/expedcoordin/edit/:id', isAuthenticated, async (req, res) => {
    const expedcoordinado = await Expedcoordinado.findById(req.params.id).lean()
    res.render('notes/inspecciones/editexpedcood', { expedcoordinado })
});

router.put('/notes/expedcoordin/:id', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, adremaexp, numexpediente, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, fechainspeccion, horainspeccion, motivoinspeccion,
        eliminado, user, name, date } = req.body
    await Expedcoordinado.findByIdAndUpdate(req.params.id, {
        borrado, userborrado, fechaborrado, numexpediente, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, adremaexp, fechainspeccion, horainspeccion, motivoinspeccion,
        eliminado, user, name, date
    });
    req.flash('success_msg', 'Coordinación actualizada')
    res.redirect('/expedientes/coordinados');
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
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores" || rolusuario == "Inspector") {
        //const mesaentrada = await Mesaentrada.findById(req.params.id).lean() 
        const expediente = await Expediente.findById(req.params.id).lean()
        //const expedientes = await Expediente.findById(id).lean().sort({ numexpediente: 'desc' });
        var idexpediente = expediente._id
        const expedisnpeccion = await Expedinspeccion.find({ $and: [{ idexpediente: idexpediente }, { fechaentradainspeccion: { $exists: true } }] }).lean().sort({ date: 'desc' }); //
        res.render('notes/inspecciones/planillalistaexpconinformes', { expedisnpeccion, expediente });
        // } else if (rolusuario == "Inspector") {
        //     const expedisnpeccion = await Expedinspeccion.find().lean().limit(100).sort({ date: 'desc' }); //
        //     // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        //     res.render('notes/inspecciones/planillalistainformeexped', { expedisnpeccion });
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