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
    req.flash('success_msg', 'Todos las Multas Marcadas')
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
    newUsosuelo.fechaingreso = req.body.fechaingreso;
    newUsosuelo.horaingreso = req.body.horaingreso;
    newUsosuelo.numexpediente = req.body.numexpediente;
    newUsosuelo.adrema = req.body.adrema;
    newUsosuelo.nomyape = req.body.nomyape;
    newUsosuelo.dni = req.body.dni;
    newUsosuelo.contacto = req.body.contacto;
    newUsosuelo.hora = req.body.hora;
    newUsosuelo.observaciones = req.body.observaciones;    
    newUsosuelo.date = req.body.date;    
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
    const { fechaingreso, horaingreso, numexpediente, nomyape, dni,
        contacto, hora, observaciones, user, name } = req.body;
    const newUsosuelo = new Usosuelo({
        fechaingreso, horaingreso, numexpediente, nomyape, dni,
        contacto, hora, observaciones, user, name
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
    if (rolusuario == "Uso-Suelo") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const usosuelo = await Usosuelo.find({ borrado: "No" }).lean().sort({ date: 'asc' });
        res.render('notes/usosuelo/allusosuelo', { usosuelo });
    } else if (rolusuario == "Administrador") {
        const usosuelo = await Usosuelo.find({ borrado: "No" }).lean().sort({ date: 'asc' });
        res.render('notes/usosuelo/allusosuelo', { usosuelo });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.post('/usosuelo/descargarestadisticamesa', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/usosuelo/usosuelo/usosueloestadisticaimprimir.hbs")
    //const puerto = "172.25.2.215";
    var fstemp = require('fs');
    let tabla = "";
    var contio = 0;
    var contop = 0;
    var contvis = 0;
    var contsub = 0;
    var contador = 0;
    var filtro = "";
    var tipofiltro = "";
    let contenidoHtml = fstemp.readFileSync(ubicacionPlantilla, 'utf8');
    var tablausosuelo = "" //await Usosuelo.find().lean().sort({ date: 'desc' });
    //<td>${multas.fecha}</td> este etaba en tablamultas
    const { nomyape, adrema, sector, desde, hasta } = req.body;
    if (nomyape) {
        const dni = nomyape
        tablausosuelo = await Usosuelo.find({ $or: [{ nomyape: { $regex: nomyape, $options: "i" } }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ date: 'desc' });
        //tablausosuelo = await Usosuelo.find({ nomyape: { $regex: nomyape, $options: "i" } }).lean();
        filtro = nomyape;
        tipofiltro = "por Nombre y Apellido/DNI"
        //console.log("Multas Estadistica", multas)
        //contador = 0
        // for (let i = 0; i < tablausosuelo.length; i++) {
        //     contador = i
        // }
    } else if (adrema) {
        const numexpediente = adrema;
        tablausosuelo = await Usosuelo.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
        filtro = adrema;
        tipofiltro = "por Adrema"
        //contador = 0
        // for (let i = 0; i < tablausosuelo.length; i++) {
        //     contador = i
        // }    
    } else if (desde && hasta) {
        if (sector) {
            filtro = "Sector: " + sector + " - por Fecha: " + desde + " / " + hasta;
            tipofiltro = "Sector con Fecha Desde y Fecha Hasta"
            var o = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
            const hastao = o.setDate(o.getDate() + 1); //HASTAD= 1690243200000
            console.log("HASTAO", hastao)
            console.log("D", o)
            tablausosuelo = await Usosuelo.find({ $and: [{ date: { $gte: desde, $lte: hastao } }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ date: 'asc' });
        } else {
            filtro = "por Fecha" + desde + "/" + hasta;
            tipofiltro = "Fecha Desde y Fecha Hasta"
            //contador = 0
            var d = new Date(hasta);
            const hastao = d.setDate(d.getDate() + 1);
            tablausosuelo = await Usosuelo.find({ date: { $gte: desde, $lte: hastao } }).lean().sort({ sector: 'desc' });;
            //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
            //.find({ desde: { $regex: date, $options: "i" } }).lean();            
            // for (let i = 0; i < tablausosuelo.length; i++) {
            //     contador += 1
        }
    } else if (sector) {
        tablausosuelo = await Usosuelo.find({ sector: { $regex: sector, $options: "i" } }).lean();
        filtro = sector;
        tipofiltro = "por Sector interviniente"
        ///contador = 0
        // for (let i = 0; i < tablausosuelo.length; i++) {
        //     contador += 1
        // }
    }
    for (const usosuelo of tablausosuelo) {
        // Y concatenar las multas 
        if (usosuelo.sector == "Inspección Obras") {
            contio += 1
        } else if (usosuelo.sector == "Obras Particulares") {
            contop += 1
        } else if (usosuelo.sector == "Visado") {
            contvis += 1
        } else if (usosuelo.sector == "Sub Secretaria") {
            contsub += 1
        }
        contador += 1
        tabla += `<tr>    
    <td>${usosuelo.sector}</td>
    <td>${usosuelo.numexpediente}</td>
    <td>${usosuelo.nomyape}</td>
    <td>${usosuelo.dni}</td>
    <td>${usosuelo.contacto}</td>
    <td>${usosuelo.fechaingreso}</td>
    <td>${usosuelo.horaingreso}</td>
    </tr>`;
    }
    contenidoHtml = contenidoHtml.replace("{{tablausosuelo}}", tabla);
    contenidoHtml = contenidoHtml.replace("{{contador}}", contador);
    contenidoHtml = contenidoHtml.replace("{{filtro}}", filtro);
    contenidoHtml = contenidoHtml.replace("{{tipofiltro}}", tipofiltro);
    contenidoHtml = contenidoHtml.replace("{{contio}}", contio);
    contenidoHtml = contenidoHtml.replace("{{contop}}", contop);
    contenidoHtml = contenidoHtml.replace("{{contvis}}", contvis);
    contenidoHtml = contenidoHtml.replace("{{contsub}}", contsub);

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
    if (rolusuario == "Uso-Suelo" || rolusuario == "Administrador") {
        const usosuelo = await Usosuelo.find().lean().sort({ date: 'desc' });
        for (let i = 0; i < usosuelo.length; i++) {
            contador = contador + 1
        }
        res.render('notes/usosuelo/usosuelo/estadisticausosuelo', { usosuelo, contador });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.post('/usosuelo/sacarestadistica', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape, adrema, sector, desde, hasta } = req.body;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Uso-Suelo") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        var contador = 0;
        if (nomyape) {
            var dni = "";
            if (typeof nomyape == 'number') {
                dni = parseInt(nomyape)
            } else {
                dni = ""
            }
            const usosuelo = await Usosuelo.find({ $or: [{ nomyape: { $regex: nomyape, $options: "i" } }, { dni: dni }] }).lean().sort({ date: 'desc' });
            //console.log("Multas Estadistica", multas)
            for (let i = 0; i < usosuelo.length; i++) {
                contador = contador + 1
            }
            res.render('notes/usosuelo/usosuelo/estadisticausosuelo', { usosuelo, contador });
        } else if (adrema) {
            var numexpediente = adrema;
            const usosuelo = await Usosuelo.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
            //const usosuelo = await Usosuelo.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < usosuelo.length; i++) {
                contador = contador + 1
            }
            res.render('notes/usosuelo/usosuelo/estadisticausosuelo', { usosuelo, contador });
        } else if (sector) {
            if ((desde && hasta)) {
                var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
                const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000                     
                const usosuelo = await Usosuelo.find({ $and: [{ date: { $gte: desde, $lte: hastad } }, { sector: sector }] }).lean().sort({ sector: 'asc' });
                //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
                //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });  

                for (let i = 0; i < usosuelo.length; i++) {
                    contador = contador + 1
                }
                res.render('notes/usosuelo/usosuelo/estadisticausosuelo', { usosuelo, contador });
            }
        } else {
            const usosuelo = await Usosuelo.find({ sector: { $regex: sector, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < usosuelo.length; i++) {
                contador = contador + 1
            }
            res.render('notes/usosuelo/usosuelo/estadisticausosuelo', { usosuelo, contador });
        }
    } else if (desde && hasta) {
        console.log("DESDE", desde)
        console.log("HASTA", hasta)
        var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
        console.log("HASTAD", hastad)
        console.log("D", d)
        const usosuelo = await Usosuelo.find({ date: { $gte: desde, $lte: hastad } }).lean().sort({ sector: 'desc' });
        //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });            
        for (let i = 0; i < usosuelo.length; i++) {
            contador = contador + 1
        }
        res.render('notes/usosuelo/usosuelo/estadisticausosuelo', { usosuelo, contador });
        // } else if ((desde && hasta) && sector) {            
        //     var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        //     const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000                     
        //     const usosuelo = await Usosuelo.find({ $and: [{date: { $gte: desde, $lte: hastad }},{sector: sector}]}).lean().sort({ sector: 'asc' });
        //     //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //     //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });                      
        //     for (let i = 0; i < usosuelo.length; i++) {                
        //         contador = contador + 1
        //     }
        //     res.render('notes/usosuelo/usosuelo/estadisticausosuelo', { usosuelo, contador });
        // }
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/usosuelo/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Uso-Suelo") {
        const usosuelo = await Usosuelo.find({ borrado: "No" }).limit(60).lean().sort({ dateturno: 'desc' });
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo });
    } else if (rolusuario == "Administrador") {
        const usosuelo = await Usosuelo.find({ borrado: "No" }).limit(60).lean().sort({ dateturno: 'desc' });
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
        const usosuelo = await Usosuelo.find({ borrado: "Si" }).limit(60).lean().sort({ dateturno: 'desc' });
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
    // console.log(note.date);
    res.render('notes/usosuelo/borrados/infoborradousosuelo', { usosuelo })
});


// *** SECTOR BUSQUEDA ***
router.post('/usosuelo/findsector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Uso-Suelo") {
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
    const { nomyape } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Uso-Suelo") {
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
router.post('/usosuelo/findlistasector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Uso-Suelo") {
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
    const { nomyape } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Uso-Suelo") {
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
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/findusosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findlistadni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findexpediente', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue un Número de Expediente')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/findusosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numexpediente } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Uso-Suelo") {
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
    const { fechaingreso } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/findusosuelo', { usosuelo })
    }
});
router.post('/usosuelo/findlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!usosuelo) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/usosuelo/allusosuelo");
    } else {
        res.render('notes/usosuelo/planillalistausosuelo', { usosuelo })
    }
});

// *** SECTOR BUSQUEDA BORRADOS***
router.post('/usosuelo/borradofindlistasector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/usosuelo/borrados/borradolistusosuelo', { usosuelo })
});

router.post('/usosuelo/borradofindlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/usosuelo/borrados/borradolistusosuelo', { usosuelo })
});

router.post('/usosuelo/borradofindlistadni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/usosuelo/borrados/borradolistusosuelo', { usosuelo })
});

router.post('/usosuelo/borradofindlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numexpediente } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/usosuelo/borrados/borradolistusosuelo', { usosuelo })
});

router.post('/usosuelo/borradofindlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const usosuelo = await Usosuelo.find({ $and: [{ borrado: "Si" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/usosuelo/borrados/borradolistusosuelo', { usosuelo })
});

// **** AGREGAR TURNO A CLIENTE HABITUAL ****
router.put('/notes/usosuelo/editaddusosuelo/:id', isAuthenticated, async (req, res) => {
    const { fechaingreso, horaingreso, numexpediente,
        nomyape, dni, observaciones, contacto, dateturno } = req.body
    await Usosuelo.findByIdAndUpdate(req.params.id, {
        fechaingreso, horaingreso, numexpediente,
        nomyape, dni, contacto, dateturno
    });
    req.flash('success_msg', 'Turno nuevo Agregado')
    res.redirect('/usosuelo/listado');
});

// ** SECTOR EDITAR **
router.put('/usosuelo/editusosuelo/:id', isAuthenticated, async (req, res) => {
    const { fechaingreso, horaingreso, numexpediente, adrema,
        nomyape, dni, observaciones, contacto, dateturno } = req.body
    await Usosuelo.findByIdAndUpdate(req.params.id, {
        fechaingreso, horaingreso, numexpediente, adrema,
        nomyape, dni, observaciones, contacto, dateturno
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