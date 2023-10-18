const express = require('express')
const router = express.Router()
// const bcrypt = require("bcrypt");
// const passport = require ('passport');
// const User =  require ('../models/User')

//const bcrypt = require("bcrypt");
//const mongopagi = require('mongoose-paginate-v2') Paginacion de mongodb
const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')

// *ZONA PDF* //
const pdf = require("html-pdf");
const User = require('../models/User');
var pdfoptionsA4 = { format: 'A4' };

// tengo que requerir los modelos para que mongoose me cree las tablas
const Usosuelo = require('../models/usosuelo')

// **esto es para agregar campo borrado a todos los q no tienen borrado marcado**
router.put('/usosuelo/listadoborradosenno', isAuthenticated, async (req, res) => {
    await Usosuelo.update({}, { $set: { borrado: "No" } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Todos los Expedientes Marcados')
    res.redirect('/Usosuelo/listado');
});

router.get('/usosuelo/add', isAuthenticated, (req, res) => {
    res.render('notes/usosuelo/newusosuelo');
})
router.get('/usosuelo/add/:id', isAuthenticated, (req, res) => {
    res.render('notes/usosuelo/newusosuelo');
})

router.post('/notes/usosuelo/newusosuelo', isAuthenticated, async (req, res) => {
    const newUsosuelo = new Usosuelo();
    newUsosuelo.fechainicio = req.body.fechainicio;
    newUsosuelo.expediente = req.body.expediente;
    newUsosuelo.iniciador = req.body.iniciador;
    newUsosuelo.dni = req.body.dni;
    newUsosuelo.extracto = req.body.extracto;
    newUsosuelo.motivo = req.body.motivo;
    newUsosuelo.adrema = req.body.adrema;
    newUsosuelo.direccion = req.body.direccion;
    newUsosuelo.contacto = req.body.contacto;
    newUsosuelo.profesional = req.body.profesional;
    newUsosuelo.correo = req.body.correo;
    newUsosuelo.fechaingresodus = req.body.fechaingresodus;
    newUsosuelo.fechaegresodus = req.body.fechaegresodus;
    newUsosuelo.observaciones = req.body.observaciones;

    if (req.files[0]) {
        newUsosuelo.filename = req.files[0].filename;
        newUsosuelo.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newUsosuelo.filenamedos = req.files[1].filename;
        newUsosuelo.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newUsosuelo.filenametres = req.files[2].filename;
        newUsosuelo.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    newUsosuelo.user = req.user.id;
    newUsosuelo.name = req.user.name;
    await newUsosuelo.save();
    req.flash('success_msg', 'Expediente Agregado Exitosamente');
    res.redirect('/usosuelo/listado');
})

router.post('/notes/usosuelo/newusosuelo/:id', isAuthenticated, async (req, res) => {
    const { fechainicio, expediente, iniciador, dni, extracto, motivo,
        adrema, direccion, contacto, profesional, correo, fechaingresodus,
        fechaegresodus, observaciones, user, name } = req.body;
    const newUsosuelo = new Usosuelo({
        fechainicio, expediente, iniciador, dni, extracto, motivo,
        adrema, direccion, contacto, profesional, correo, fechaingresodus,
        fechaegresodus, observaciones, user, name
    })
    newUsosuelo.user = req.user.id;
    newUsosuelo.name = req.user.name;
    await newUsosuelo.save();
    req.flash('success_msg', 'Expediente Agregado Exitosamente');
    res.redirect('/usosuelo/listado');
})

router.get('/usosuelo', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Uso-de-Suelo") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const usosuelo = await Usosuelo.find({ borrado: "No" }).lean().sort({ date: 'desc' });
        res.render('notes/usosuelo/allusosuelo', { usosuelo });
    } else if (rolusuario == "Administrador") {
        const usosuelo = await Usosuelo.find({ borrado: "No" }).lean().sort({ date: 'desc' });
        res.render('notes/usosuelo/allusosuelo', { usosuelo });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.post('/usosuelo/descargarestadisticamesa', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/usosuelo/usosueloestadisticaimprimir.hbs")
    //const puerto = "172.25.2.215";
    var fstemp = require('fs');
    let tabla = "";
    var contador = 0;
    var filtro = "";
    var tipofiltro = "";
    let contenidoHtml = fstemp.readFileSync(ubicacionPlantilla, 'utf8');
    var tablausosuelo = "" //await Usosuelo.find().lean().sort({ date: 'desc' });
    //<td>${multas.fecha}</td> este etaba en tablamultas
    const { iniciador, adrema, direccion, desde, hasta } = req.body;
    if (iniciador) {
        const dni = iniciador
        tablausosuelo = await Usosuelo.find({ $or: [{ iniciador: { $regex: iniciador, $options: "i" } }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ date: 'desc' });
        //tablausosuelo = await Usosuelo.find({ iniciador: { $regex: iniciador, $options: "i" } }).lean();
        filtro = iniciador;
        tipofiltro = "por Nombre y Apellido/DNI"
        //console.log("Multas Estadistica", multas)
        //contador = 0
        // for (let i = 0; i < tablausosuelo.length; i++) {
        //     contador = i
        // }
    } else if (adrema) {
        const expediente = adrema;
        tablausosuelo = await Usosuelo.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { expediente: { $regex: expediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
        filtro = adrema;
        tipofiltro = "por Adrema"
        //contador = 0
        // for (let i = 0; i < tablausosuelo.length; i++) {
        //     contador = i
        // }    
    } else if (desde && hasta) {
        if (direccion) {
            filtro = "Sector: " + direccion + " - por Fecha: " + desde + " / " + hasta;
            tipofiltro = "Sector con Fecha Desde y Fecha Hasta"
            var o = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
            const hastao = o.setDate(o.getDate() + 1); //HASTAD= 1690243200000
            console.log("HASTAO", hastao)
            console.log("D", o)
            tablausosuelo = await Usosuelo.find({ $and: [{ date: { $gte: desde, $lte: hastao } }, { direccion: { $regex: direccion, $options: "i" } }] }).lean().sort({ date: 'desc' });
        } else {
            filtro = "por Fecha" + desde + "/" + hasta;
            tipofiltro = "Fecha Desde y Fecha Hasta"
            //contador = 0
            var d = new Date(hasta);
            const hastao = d.setDate(d.getDate() + 1);
            tablausosuelo = await Usosuelo.find({ date: { $gte: desde, $lte: hastao } }).lean().sort({ direccion: 'desc' });;
            //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
            //.find({ desde: { $regex: date, $options: "i" } }).lean();            
            // for (let i = 0; i < tablausosuelo.length; i++) {
            //     contador += 1
        }
    } else if (direccion) {
        tablausosuelo = await Usosuelo.find({ direccion: { $regex: direccion, $options: "i" } }).lean();
        filtro = direccion;
        tipofiltro = "por Sector interviniente"
        ///contador = 0
        // for (let i = 0; i < tablausosuelo.length; i++) {
        //     contador += 1
        // }
    }
    for (const usosuelo of tablausosuelo) {
        // Y concatenar las multas 
        if (usosuelo.direccion === undefined || usosuelo.direccion === "") {
            usosuelo.direccion = "Sin Datos"
        } else if (usosuelo.expediente === undefined || usosuelo.expediente === "") {
            usosuelo.expediente = "Sin Datos"
        } else if (usosuelo.iniciador === undefined || usosuelo.iniciador === "") {
            usosuelo.iniciador = "Sin Datos"
        } else if (usosuelo.contacto === undefined || usosuelo.contacto === "") {
            usosuelo.contacto = "Sin Datos"
        } else if (usosuelo.fechaingresodus === undefined || usosuelo.fechaingresodus === "") {
            usosuelo.fechaingresodus = "Sin Datos"
        } else if (usosuelo.fechaegresodus === undefined || usosuelo.fechaegresodus === "") {
            usosuelo.fechaegresodus = "Sin Datos"
        }

        contador += 1
        tabla += `<tr>    
    <td style="text-transform: lowercase;">${usosuelo.direccion}</td>
    <td style="text-transform: lowercase;">${usosuelo.expediente}</td>
    <td style="text-transform: lowercase;">${usosuelo.iniciador}</td>    
    <td style="text-transform: lowercase;">${usosuelo.contacto}</td>
    <td style="text-transform: lowercase;">${usosuelo.fechaingresodus}</td>
    <td style="text-transform: lowercase;">${usosuelo.fechaegresodus}</td>
    </tr>`;
    }
    contenidoHtml = contenidoHtml.replace("{{tablausosuelo}}", tabla);
    contenidoHtml = contenidoHtml.replace("{{contador}}", contador);
    contenidoHtml = contenidoHtml.replace("{{filtro}}", filtro);
    contenidoHtml = contenidoHtml.replace("{{tipofiltro}}", tipofiltro);

    //contenidoHtml = contenidoHtml.replace("{{multas}}");    
    pdf.create(contenidoHtml, pdfoptionsA4).toStream((error, stream) => {
        if (error) {
            res.end("Error creando PDF: " + error)
        } else {
            req.flash('success_msg', 'Mesa Entrada Estadistica impresa')
            res.setHeader("Content-Type", "application/pdf");
            stream.pipe(res);
        }
    });
})

router.get('/usosuelo/Estadisticas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    var contador = 0;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Uso-de-Suelo" || rolusuario == "Administrador") {
        const usosuelo = await Usosuelo.find({ borrado: "No" }).lean().sort({ date: 'desc' });
        for (let i = 0; i < usosuelo.length; i++) {
            contador = contador + 1
        }
        res.render('notes/usosuelo/estadisticausosuelo', { usosuelo, contador });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.post('/usosuelo/sacarestadistica', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { iniciador, adrema, direccion, desde, hasta } = req.body;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Uso-de-Suelo") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        var contador = 0;
        if (iniciador) {
            var dni = "";
            if (typeof iniciador == 'number') {
                dni = parseInt(iniciador)
            } else {
                dni = ""
            }
            const usosuelo = await Usosuelo.find({ $or: [{ iniciador: { $regex: iniciador, $options: "i" } }, { dni: dni }] }).lean().sort({ date: 'desc' });
            //console.log("Multas Estadistica", multas)
            for (let i = 0; i < usosuelo.length; i++) {
                contador = contador + 1
            }
            res.render('notes/usosuelo/estadisticausosuelo', { usosuelo, contador });
        } else if (adrema) {
            var expediente = adrema;
            const usosuelo = await Usosuelo.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { expediente: { $regex: expediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
            //const usosuelo = await Usosuelo.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < usosuelo.length; i++) {
                contador = contador + 1
            }
            res.render('notes/usosuelo/estadisticausosuelo', { usosuelo, contador });
        } else if (direccion) {
            const usosuelo = await Usosuelo.find({ direccion: { $regex: direccion, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < usosuelo.length; i++) {
                contador = contador + 1
            }
            res.render('notes/usosuelo/estadisticausosuelo', { usosuelo, contador });
        }
    } else if (desde && hasta) {
        console.log("DESDE", desde)
        console.log("HASTA", hasta)
        var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
        console.log("HASTAD", hastad)
        console.log("D", d)
        const usosuelo = await Usosuelo.find({ date: { $gte: desde, $lte: hastad } }).lean().sort({ date: 'desc' });
        //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });            
        for (let i = 0; i < usosuelo.length; i++) {
            contador = contador + 1
        }
        res.render('notes/usosuelo/estadisticausosuelo', { usosuelo, contador });
        // } else if ((desde && hasta) && direccion) {            
        //     var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        //     const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000                     
        //     const usosuelo = await Usosuelo.find({ $and: [{date: { $gte: desde, $lte: hastad }},{direccion: direccion}]}).lean().sort({ direccion: 'desc' });
        //     //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //     //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });                      
        //     for (let i = 0; i < usosuelo.length; i++) {                
        //         contador = contador + 1
        //     }
        //     res.render('notes/usosuelo/estadisticausosuelo', { usosuelo, contador });
        // }
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/usosuelo/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Uso-de-Suelo") {
        const usosuelo = await Usosuelo.find({ borrado: "No" }).limit(60).lean().sort({ date: 'desc' });
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo });
    } else if (rolusuario == "Administrador") {
        const usosuelo = await Usosuelo.find({ borrado: "No" }).limit(60).lean().sort({ date: 'desc' });
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/usosuelo/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador") {
        const usosuelo = await Usosuelo.find({ borrado: "Si" }).limit(60).lean().sort({ date: 'desc' });
        res.render('notes/borrados/borradolistusosuelo', { usosuelo });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/AREA PAPELERA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/usosuelo/add/:id', isAuthenticated, async (req, res) => {
    const usosuelo = await Usosuelo.findById(req.params.id).lean()
    res.render('notes/usosuelo/newusosuelo', { usosuelo })
});

router.get('/usosuelo/edit/:id', isAuthenticated, async (req, res) => {
    const usosuelo = await Usosuelo.findById(req.params.id).lean()
    res.render('notes/usosuelo/editusosuelo', { usosuelo })
});

router.get('/usosuelo/list/:id', isAuthenticated, async (req, res) => {
    const usosuelo = await Usosuelo.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/usosuelo/listusosuelo', { usosuelo })
});
router.get('/usosuelo/borradolist/:id', isAuthenticated, async (req, res) => {
    const usosuelo = await Usosuelo.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/usosuelo/borrados/borradolistusosuelo', { usosuelo })
});

router.get('/usosuelo/infoborradolist/:id', isAuthenticated, async (req, res) => {
    const usosuelo = await Usosuelo.findById(req.params.id).lean()
    res.render('notes/borrados/infoborradousosuelo', { usosuelo })
});


// *** SECTOR BUSQUEDA ***
router.post('/usosuelo/finddireccion', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { direccion } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { direccion: { $regex: direccion, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (rolusuario == "Uso-de-Suelo") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/findusosuelo', { usosuelo })
        }
    } else if (rolusuario == "Administrador") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/findusosueloadm', { usosuelo })
        }
    } else {
        res.render('notes/usosuelo/findusosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findiniciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { iniciador } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { iniciador: { $regex: iniciador, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (rolusuario == "Uso-de-Suelo") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/findusosuelo', { usosuelo })
        }
    } else if (rolusuario == "Administrador") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/findusosueloadm', { usosuelo })
        }
    } else {
        res.render('notes/usosuelo/findusosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findlistadireccion', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { direccion } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { direccion: { $regex: direccion, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (rolusuario == "Uso-de-Suelo") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
        }
    } else if (rolusuario == "Administrador") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
        }
    } else {
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { iniciador } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { iniciador: { $regex: iniciador, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (rolusuario == "Uso-de-Suelo") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
        }
    } else if (rolusuario == "Administrador") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
        }
    } else {
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
    }
});
router.post('/usosuelo/finddni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/findusosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findlistadni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findexpediente', isAuthenticated, async (req, res) => {
    const { expediente } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { expediente: { $regex: expediente, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue un Número de Expediente')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/findusosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { expediente } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { expediente: { $regex: expediente, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (rolusuario == "Uso-de-Suelo") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
        }
    } else if (rolusuario == "Administrador") {
        if (!usosuelo) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/usosuelo/allusosuelo");
        } else {
            res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
        }
    } else {
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findfechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingresodus } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { fechaingresodus: { $regex: fechaingresodus, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/findusosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingresodus } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { fechaingresodus: { $regex: fechaingresodus, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
    }
});

router.post('/usosuelo/findlistafechasalida', isAuthenticated, async (req, res) => {
    const { fechaegresodus } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { fechaegresodus: { $regex: fechaegresodus, $options: "i" } }] }).lean().sort({ date: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue Fecha Egreso')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
    }
});

// *** SECTOR BUSQUEDA BORRADOS***
router.post('/usosuelo/borradofindlistadireccion', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { direccion } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { direccion: { $regex: direccion, $options: "i" } }] }).lean().sort({ date: 'desc' })
    res.render('notes/borrados/borradolistusosuelo', { usosuelo })
});

router.post('/usosuelo/borradofindlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { iniciador } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { iniciador: { $regex: iniciador, $options: "i" } }] }).lean().sort({ date: 'desc' })
    res.render('notes/borrados/borradolistusosuelo', { usosuelo })
});

router.post('/usosuelo/borradofindlistadni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ date: 'desc' })
    res.render('notes/borrados/borradolistusosuelo', { usosuelo })
});

router.post('/usosuelo/borradofindlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { expediente } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { expediente: { $regex: expediente, $options: "i" } }] }).lean().sort({ date: 'desc' })
    res.render('notes/borrados/borradolistusosuelo', { usosuelo })
});

router.post('/usosuelo/borradofindlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingresodus } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { fechaingresodus: { $regex: fechaingresodus, $options: "i" } }] }).lean().sort({ date: 'desc' })
    res.render('notes/borrados/borradolistusosuelo', { usosuelo })
});

// **** AGREGAR TURNO A CLIENTE HABITUAL ****
router.put('/notes/usosuelo/editaddusosuelo/:id', isAuthenticated, async (req, res) => {
    const { fechainicio, expediente, iniciador, dni, extracto, motivo,
        adrema, direccion, contacto, profesional, correo, fechaingresodus,
        fechaegresodus, observaciones, user, name } = req.body
    await Usosuelo.findByIdAndUpdate(req.params.id, {
        fechainicio, expediente, iniciador, dni, extracto, motivo,
        adrema, direccion, contacto, profesional, correo, fechaingresodus,
        fechaegresodus, observaciones, user, name
    });
    req.flash('success_msg', 'Turno nuevo Agregado')
    res.redirect('/usosuelo/listado');
});

// ** SECTOR EDITAR **
router.put('/usosuelo/editusosuelo/:id', isAuthenticated, async (req, res) => {
    const { fechainicio, expediente, iniciador, dni, extracto, motivo,
        adrema, direccion, contacto, profesional, correo, fechaingresodus,
        fechaegresodus, observaciones, user, name } = req.body
    await Usosuelo.findByIdAndUpdate(req.params.id, {
        fechainicio, expediente, iniciador, dni, extracto, motivo,
        adrema, direccion, contacto, profesional, correo, fechaingresodus,
        fechaegresodus, observaciones, user, name
    });
    req.flash('success_msg', 'Expediente Actualizado')
    res.redirect('/usosuelo/listado');
});

// **** SECTOR DELETE ****

router.put('/usosuelo/marcadelete/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Usosuelo.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Turno a Papelera Reciclaje')
    res.redirect('/usosuelo/listado');
    // await Usosuelo.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/usosuelo/listado')
});

router.put('/usosuelo/recuperarlistado', isAuthenticated, async (req, res) => {
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Usosuelo.updateMany({ borrado: 'Si' }, { borrado: "No", fechaborrado: "Recuperado" });
    req.flash('success_msg', 'todos los datos de Mesa de Entradas recuperados')
    res.redirect('/usosuelo/listado');
    // await Usosuelo.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/usosuelo/listado')
});

router.put('/usosuelo/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Usosuelo.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Turno Restaurado')
    res.redirect('/usosuelo/borradolistado');
    // await Usosuelo.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/usosuelo/listado')
});

router.delete('/usosuelo/delete/:id', isAuthenticated, async (req, res) => {
    await Usosuelo.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Turno Eliminado')
    res.redirect('/usosuelo/listado')
});


// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;