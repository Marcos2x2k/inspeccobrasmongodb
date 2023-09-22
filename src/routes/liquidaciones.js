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
const Multas = require('../models/Multas')
const Tasas = require('../models/Tasas')

// **esto es para agregar campo borrado a todos los q no tienen borrado marcado**
router.put('/multas/listadoborradosenno', isAuthenticated, async (req, res) => {
    await Multas.update({}, { $set: { borrado: "No" } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Todas las Liquidaciones Marcadas')
    res.redirect('/multas');
});

// **** liquidaciones ****
router.get('/factura', isAuthenticated, async (req, res) => {
    //const multas = await Multas.find({ impreso: "No" }).lean().sort({ date: 'desc' });
    const multas = await Multas.find({ $and: [{ impreso: 'No' }, { apercibimientoprofesional: "No" }] }).lean().sort({ propietario: 'desc' }); // temporal poner el d arriba despues
    res.render('notes/factura', { multas });
    //res.render('notes/factura', { layouts: "pdf"});
})

router.get('/facturaprofesional', isAuthenticated, async (req, res) => {
    //const multas = await Multas.find({ impreso: "No" }).lean().sort({ date: 'desc' });
    const multas = await Multas.find({ $and: [{ impreso: "No" }, { apercibimientoprofesional: "Si" }] }).lean().sort({ propietario: 'desc' }); // temporal poner el d arriba despues
    res.render('notes/liquidaciones/facturaprofesional', { multas });
})

router.get('/multas/reimprimirfactura/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const impreso = "No";
    const fechaimpreso = "Esperando Re-Impresion";
    const reimpreso = "Si";
    const vecesreimpreso = "1 o Más";
    const fechareimpreso = new Date();
    await Multas.findByIdAndUpdate(req.params.id, {
        impreso, fechaimpreso, reimpreso,
        fechareimpreso, vecesreimpreso
    });
    req.flash('success_msg', 'Re-Impresión actualizada')
    res.redirect('/multas');
});

router.get('/multas/reimprimirfacturaprofesional/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const impreso = "No";
    const fechaimpreso = "Esperando Re-Impresion";
    const reimpreso = "Si";
    const vecesreimpreso = "1 o Más";
    const fechareimpreso = new Date();
    await Multas.findByIdAndUpdate(req.params.id, {
        impreso, fechaimpreso, reimpreso,
        fechareimpreso, vecesreimpreso
    });
    req.flash('success_msg', 'Re-Impresión actualizada')
    res.redirect('/multasprofesionales');
});

router.get('/descargarfactura', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/facturaimprimir.hbs")
    //const puerto = "172.25.2.215";
    var fstemp = require('fs');
    let tabla = "";
    let contenidoHtml = fstemp.readFileSync(ubicacionPlantilla, 'utf8');
    const tablamultas = await Multas.find({ $and: [{ impreso: 'No' }, { apercibimientoprofesional: 'No' }] }).lean().sort({ propietario: 'desc' });

    //<td>${multas.fecha}</td> este etaba en tablamultas
    for (const multas of tablamultas) {
        // Y concatenar las multas                    
        tabla += `<tr>    
    <td>${multas.numacta}</td>
    <td>${multas.propietario}</td>
    <td>${multas.ubicacion}</td>
    <td>${multas.inciso}</td>
    <td>${multas.formulamulta}</td>
    <td>${multas.sancionprof}</td>
    <td>${multas.sancionprorc}</td>
    <td>${multas.montototal}</td>
    <td>${multas.infraccionoparalizacion}</td>    
    </tr>`;
    }
    // console.log("MULTAS", tablamultas)
    // console.log("TABLA", tabla)
    contenidoHtml = contenidoHtml.replace("{{tablamultas}}", tabla);
    //contenidoHtml = contenidoHtml.replace("{{multas}}");
    await Multas.updateMany({ $and: [{ impreso: 'No' }, { apercibimientoprofesional: 'No' }] }, { impreso: "Si", fechaimpreso: new Date() });
    pdf.create(contenidoHtml, pdfoptionsA4).toStream((error, stream) => {
        if (error) {
            res.end("Error creando PDF: " + error)
        } else {
            req.flash('success_msg', 'Multas Impresas')
            res.setHeader("Content-Type", "application/pdf");
            stream.pipe(res);
        }
    });
})

router.get('/descargarfacturaprofesional', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/liquidaciones/facturaimprimirprofesional.hbs")
    //const puerto = "172.25.2.215";
    var fstemp = require('fs');
    let tabla = "";
    let contenidoHtml = fstemp.readFileSync(ubicacionPlantilla, 'utf8');
    const tablamultas = await Multas.find({ $and: [{ impreso: 'No' }, { apercibimientoprofesional: 'Si' }] }).lean().sort({ propietario: 'desc' });

    //<td>${multas.fecha}</td> este etaba en tablamultas
    for (const multas of tablamultas) {
        // Y concatenar las multas                    
        tabla += `<tr>    
    <td>${multas.numacta}</td>
    <td>${multas.propietario}</td>
    <td>${multas.ubicacion}</td>
    <td>${multas.inciso}</td>
    <td>${multas.formulamulta}</td>
    <td>${multas.sancionprof}</td>
    <td>${multas.sancionprorc}</td>
    <td>${multas.montototal}</td>
    <td>${multas.infraccionoparalizacion}</td>    
    </tr>`;
    }
    // console.log("MULTAS", tablamultas)
    // console.log("TABLA", tabla)
    contenidoHtml = contenidoHtml.replace("{{tablamultas}}", tabla);
    //contenidoHtml = contenidoHtml.replace("{{multas}}");
    await Multas.updateMany({ $and: [{ impreso: 'No' }, { apercibimientoprofesional: 'Si' }] }, { impreso: "Si", fechaimpreso: new Date() });
    pdf.create(contenidoHtml, pdfoptionsA4).toStream((error, stream) => {
        if (error) {
            res.end("Error creando PDF: " + error)
        } else {
            req.flash('success_msg', 'Multas Impresas')
            res.setHeader("Content-Type", "application/pdf");
            stream.pipe(res);
        }
    });
})

router.get('/multas/add', isAuthenticated, async (req, res) => {
    const tasaactual = await Tasas.findOne({ tipotasa: { $regex: "T.C.", $options: "i" } }).lean().sort({ date: 'desc' });
    res.render('notes/newmultas', { tasaactual });
})
router.get('/multasprofesional/add', isAuthenticated, async (req, res) => {
    const tasaactual = await Tasas.findOne({ tipotasa: { $regex: "T.C.", $options: "i" } }).lean().sort({ date: 'desc' });
    res.render('notes/newmultasprofesional', { tasaactual });
})

router.get('/multas/addtasas', isAuthenticated, (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Liquidaciones") {
        res.render('notes/newtasas');
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS')
        return res.redirect('/');
    }
})

router.post("/notes/newmultas", isAuthenticated, async (req, res) => {
    const { fecha, acta, numacta, expediente, adrema, inciso, propietario, ubicacion, infraccionoparalizacion,
        tcactual, formulamulta, montototal, observaciones, apercibimientoprofesional, sancionprof, sancionprorc,
        reiteracion, user, name, date} = req.body;

    const newMultas = new Multas({
        fecha, acta, numacta, expediente, adrema, inciso, propietario, ubicacion, infraccionoparalizacion,
        tcactual, formulamulta, montototal, observaciones, apercibimientoprofesional, sancionprof, sancionprorc,
        reiteracion, user, name, date
    })
    newMultas.user = req.user.id;
    newMultas.name = req.user.name;
    await newMultas.save();
    req.flash('success_msg', 'Multa a Propietario Agregada');
    res.redirect('/multas');
})

router.post("/notes/newmultasprofesional", isAuthenticated, async (req, res) => {
    const { fecha, acta, numacta, expediente, adrema, inciso, propietario, ubicacion, infraccionoparalizacion,
        tcactual, formulamulta, montototal, observaciones, apercibimientoprofesional, sancionprof, sancionprorc,
        reiteracion, user, name, date } = req.body;

    const newMultas = new Multas({
        fecha, acta, numacta, expediente, adrema, inciso, propietario, ubicacion, infraccionoparalizacion,
        tcactual, formulamulta, montototal, observaciones, apercibimientoprofesional, sancionprof, sancionprorc,
        reiteracion, user, name, date
    })
    newMultas.user = req.user.id;
    newMultas.name = req.user.name;
    await newMultas.save();
    req.flash('success_msg', 'Multa a Profesional Agregada');
    res.redirect('/multasprofesionales');
})

router.post('/notes/newtasas', isAuthenticated, async (req, res) => {
    const { tasaconstruccion, tipotasa, fechaactual, observaciones, user, name, date
    } = req.body;
    const newTasas = new Tasas({
        tasaconstruccion, tipotasa, fechaactual, observaciones, user, name, date
    })
    newTasas.user = req.user.id;
    newTasas.name = req.user.name;
    await newTasas.save();
    req.flash('success_msg', 'Tasa Agregada Exitosamente');
    res.redirect('/tasas');
})

router.get('/multas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const multas = await Multas.find({$and:[{ apercibimientoprofesional: "No" },{borrado:"No"}]}).lean().sort({ date: 'desc' });
        res.render('notes/liquidaciones/allmultasusr', { multas });    
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/multas/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const multas = await Multas.find({borrado:"Si"}).lean().sort({ date: 'desc' });
        res.render('notes/borrados/borradolistliquidaciones', { multas });    
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/multas/infoborradolist/:id', isAuthenticated, async (req, res) => {
    const multas = await Multas.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/borrados/infoborradoliquidaciones', { multas })
});

router.get('/multasprofesionales', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    //const user = await Multas.find().lean().sort();
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const multas = await Multas.find( {$and:[{apercibimientoprofesional: "Si" },{borrado:"No"}]}).lean().sort({ date: 'desc' });
        res.render('notes/liquidaciones/allmultasprofusr', { multas, rolusuario });    
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/multas/imprimirestadisticas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Liquidaciones") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const multas = await Multas.find().lean().sort({ date: 'desc' });
        res.render('notes/multaestadictarmar', { multas });
    } else if (rolusuario == "Administrador") {
        const multas = await Multas.find().lean().sort({ date: 'desc' });
        res.render('notes/multaestadictarmar', { multas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
})

router.get('/multas/Estadisticas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    var montofinal = 0;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Liquidaciones") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const multas = await Multas.find().lean().sort({ date: 'desc' });
        for (let i = 0; i < multas.length; i++) {
            montofinal = montofinal + parseInt(multas[i].montototal)
        }
        res.render('notes/liquidaciones/multaestadisticaadm', { multas, montofinal });
    } else if (rolusuario == "Administrador") {
        const multas = await Multas.find().lean().sort({ date: 'desc' });
        for (let i = 0; i < multas.length; i++) {
            montofinal = montofinal + parseInt(multas[i].montototal)
        }
        res.render('notes/liquidaciones/multaestadisticaadm', { multas, montofinal });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.post('/multas/sacarestadistica', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { propietario, adrema, numacta, desde, hasta } = req.body;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Liquidaciones") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        var montofinal = 0;
        if (propietario) {
            const multas = await Multas.find({ propietario: { $regex: propietario, $options: "i" } }).lean().sort({ date: 'desc' });
            //console.log("Multas Estadistica", multas)
            for (let i = 0; i < multas.length; i++) {
                montofinal = montofinal + parseInt(multas[i].montototal)
            }
            res.render('notes/liquidaciones/multaestadisticaadm', { multas, montofinal });
        } else if (adrema) {
            const multas = await Multas.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < multas.length; i++) {
                montofinal = montofinal + parseInt(multas[i].montototal)
            }
            res.render('notes/liquidaciones/multaestadisticaadm', { multas, montofinal });
        } else if (numacta) {
            const multas = await Multas.find({ numacta: { $regex: numacta, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < multas.length; i++) {
                montofinal = montofinal + parseInt(multas[i].montototal)
            }
            res.render('notes/liquidaciones/multaestadisticaadm', { multas, montofinal });
        } else if (desde && hasta) {
            console.log("DESDE", desde)
            console.log("HASTA", hasta)
            var d = new Date(hasta);
            const hastad = d.setDate(d.getDate() + 1);
            console.log("HASTAD", hastad)
            console.log("D", d)
            const multas = await Multas.find({ date: { $gte: desde, $lte: hastad } }).lean().sort({ date: 'asc' });
            //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
            //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });            
            for (let i = 0; i < multas.length; i++) {
                montofinal = montofinal + parseInt(multas[i].montototal)
            }
            res.render('notes/liquidaciones/multaestadisticaadm', { multas, montofinal });
        }
    } else if (rolusuario == "Liquidaciones") {
        if (propietario) {
            const multas = await Multas.find({ propietario: { $regex: propietario, $options: "i" } }).lean().sort({ date: 'desc' });
            res.render('notes/liquidaciones/multaestadisticaadm', { multas });
        } else if (adrema) {
            const multas = await Multas.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' });
            res.render('notes/liquidaciones/multaestadisticaadm', { multas });
        } else if (numacta) {
            const multas = await Multas.find({ numacta: { $regex: numacta, $options: "i" } }).lean().sort({ date: 'desc' });
            res.render('notes/liquidaciones/multaestadisticaadm', { multas });
        }
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.post('/multas/descargarmultaestadistica', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/estadisticamultaimprimir.hbs")
    var fstemp = require('fs');
    var tabla = "";
    var montofinal = 0;
    var tablamultas = "";
    var multas = "";
    let contenidoHtml = fstemp.readFileSync(ubicacionPlantilla, 'utf8');
    var filtro = "";
    var tipofiltro = "";
    //const tablamultas = await Multas.find({ impreso: 'No' }).lean().sort({ propietario: 'desc' }); // temporal poner el d arriba despues    
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user       
    const { propietarioo, adremao, numactao, desdeo, hastao } = req.body;
    //const propietario = "Marcos"
    //console.log("PROPIETARIO", propietario)
    if (propietarioo) {
        tablamultas = await Multas.find({ propietario: { $regex: propietarioo, $options: "i" } }).lean();
        filtro = propietarioo;
        tipofiltro = "por Propietario"
        //console.log("Multas Estadistica", multas)
        for (let i = 0; i < tablamultas.length; i++) {
            montofinal = montofinal + parseInt(tablamultas[i].montototal)
        }
    } else if (adremao) {
        tablamultas = await Multas.find({ adrema: { $regex: adremao, $options: "i" } }).lean();
        filtro = adremao;
        tipofiltro = "por Adrema"
        for (let i = 0; i < tablamultas.length; i++) {
            montofinal = montofinal + parseInt(tablamultas[i].montototal)
        }
    } else if (numactao) {
        tablamultas = await Multas.find({ numacta: { $regex: numactao, $options: "i" } }).lean();
        filtro = numactao;
        tipofiltro = "por Número Acta"
        for (let i = 0; i < tablamultas.length; i++) {
            montofinal = montofinal + parseInt(tablamultas[i].montototal)
        }
    } else if (desdeo && hastao) {
        filtro = desdeo + "-" + hastao;
        tipofiltro = "Fecha Desde y Fecha Hasta"
        var d = new Date(hastao);
        const hasta = d.setDate(d.getDate() + 1);
        tablamultas = await Multas.find({ date: { $gte: desdeo, $lte: hastao } }).lean();
        //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //.find({ desde: { $regex: date, $options: "i" } }).lean();            
        for (let i = 0; i < tablamultas.length; i++) {
            montofinal = montofinal + parseInt(tablamultas[i].montototal)
        }
    }
    //<td>${multas.fecha}</td> estaba en tablamultas
    for (multas of tablamultas) {
        // Y concatenar las multas                    
        tabla += `<tr>    
    <td>${multas.numacta}</td>
    <td>${multas.propietario}</td>
    <td>${multas.ubicacion}</td>
    <td>${multas.inciso}</td>
    <td>${multas.formulamulta}</td>
    <td>${multas.sancionprof}</td>
    <td>${multas.montototal}</td>
    <td>${multas.infraccionoparalizacion}</td>    
    </tr>`;
    }
    //console.log("MULTAS", multas)
    //console.log("TABLA", tabla)
    //console.log("TABLA MULTAS", tablamultas)
    contenidoHtml = contenidoHtml.replace("{{tablamultas}}", tabla);
    contenidoHtml = contenidoHtml.replace("{{montofinal}}", montofinal);
    contenidoHtml = contenidoHtml.replace("{{tipofiltro}}", tipofiltro);
    contenidoHtml = contenidoHtml.replace("{{filtro}}", filtro);
    //contenidoHtml = contenidoHtml.replace("{{multas}}");
    //await Multas.updateMany({ impreso: "No" }, { impreso: "Si", fechaimpreso: new Date() });
    pdf.create(contenidoHtml, pdfoptionsA4).toStream((error, stream) => {
        if (error) {
            res.end("Error creando PDF: " + error)
        } else {
            req.flash('success_msg', 'Multas Impresas')
            res.setHeader("Content-Type", "application/pdf");
            stream.pipe(res);
        }
    });
})

router.get('/multas/impresas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Liquidaciones") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const multas = await Multas.find({ $and: [{ impreso: "No" }, { apercibimientoprofesional: "No" }] }).lean().sort({ date: 'desc' });
        res.render('notes/liquidaciones/allmultasadmimp', { multas });
    } else if (rolusuario == "Administrador") {
        const multas = await Multas.find({ $and: [{ impreso: "No" }, { apercibimientoprofesional: "No" }] }).lean().sort({ date: 'desc' });
        res.render('notes/liquidaciones/allmultasadmimp', { multas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/multas/impresasprofesional', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Liquidaciones") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const multas = await Multas.find({ $and: [{ impreso: "No" }, { apercibimientoprofesional: "Si" }] }).lean().sort({ date: 'desc' });
        res.render('notes/liquidaciones/allmultasadmprofimp', { multas });
    } else if (rolusuario == "Administrador") {
        const multas = await Multas.find({ $and: [{ impreso: "No" }, { apercibimientoprofesional: "Si" }] }).lean().sort({ date: 'desc' });
        res.render('notes/liquidaciones/allmultasadmprofimp', { multas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/multas/imprimir', isAuthenticated, async (req, res) => {
    await Multas.updateMany({ impreso: "No" }, { impreso: "Si", fechaimpreso: new Date() });
    const multasimprimir = Multas.find().lean().sort({ propietario: 'desc' });
    req.flash('success_msg', 'Multas Impresas')
    res.render('notes/multas', { multasimprimir });
});

router.get('/tasas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Liquidaciones") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const tasas = await Tasas.find({borrado:"No"}).lean().sort({ date: 'desc' });
        res.render('notes/alltasasadm', { tasas });
    } else if (rolusuario == "Administrador") {
        const tasas = await Tasas.find({borrado:"No"}).lean().sort({ date: 'desc' });
        res.render('notes/alltasasadm', { tasas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});


router.get('/tasas/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        const tasas = await Tasas.find().limit(500).lean().sort({ date: 'desc' });;
        res.render('notes/planillalistaticket', { tasas });
    } else if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const tasas = await Tasas.find().limit(500).lean().sort({ date: 'desc' });
        res.render('notes/planillalistaticketadm', { tasas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/multas/add/:id', isAuthenticated, async (req, res) => {
    const tasaactual = await Tasas.findOne({ tipotasa: { $regex: "T.C.", $options: "i" } }).lean().sort({ date: 'desc' });
    const multas = await Multas.findById(req.params.id).lean()
    res.render('notes/newmultas', { multas, tasaactual })
});

router.get('/multasprofesional/add/:id', isAuthenticated, async (req, res) => {
    const tasaactual = await Tasas.findOne({ tipotasa: { $regex: "T.C.", $options: "i" } }).lean().sort({ date: 'desc' });
    const multas = await Multas.findById(req.params.id).lean()
    res.render('notes/newmultasprofesional', { multas, tasaactual })
});

router.get('/multas/list/:id', isAuthenticated, async (req, res) => {
    const multas = await Multas.findById(req.params.id).lean()
    res.render('notes/listmultas', { multas })
});

router.get('/multasprofesional/list/:id', isAuthenticated, async (req, res) => {
    const multas = await Multas.findById(req.params.id).lean()
    res.render('notes/liquidaciones/listmultaprofesional', { multas })
});

// *** BUSCAR LIQUIDACIONES O MULTAS ***
router.post('/multa/findpropietario', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { propietario } = req.body;
    const multas = await Multas.find({$and:[{borrado:"No"},{ propietario: { $regex: propietario, $options: "i" }}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/liquidaciones/allmultasusr");   
        } else {
            res.render('notes/liquidaciones/allmultasusr', { multas })
        }
    } 
});
router.post('/multa/findnumacta', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numacta } = req.body;
    const multas = await Multas.find({$and:[{borrado:"No"},{ numacta: { $regex: numacta, $options: "i" }}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/liquidaciones/allmultasusr");   
        } else {
            res.render('notes/liquidaciones/allmultasusr', { multas })
        }
    } 
});
router.post('/multa/findubicacion', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { ubicacion } = req.body;
    const multas = await Multas.find({$and:[{borrado:"No"},{ ubicacion: { $regex: ubicacion, $options: "i" }}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/liquidaciones/allmultasusr");   
        } else {
            res.render('notes/liquidaciones/allmultasusr', { multas })
        }
    } 
});
router.post('/multa/findexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { expediente } = req.body;
    const multas = await Multas.find({$and:[{borrado:"No"},{ expediente: { $regex: expediente, $options: "i" }}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/liquidaciones/allmultasusr");   
        } else {
            res.render('notes/liquidaciones/allmultasusr', { multas })
        }
    } 
});


// *** BUSCAR LIQUIDACIONES O MULTAS BORRADAS ***
router.post('/multa/borradofindpropietario', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { propietario } = req.body;
    const multas = await Multas.find({$and:[{borrado:"Si"},{ propietario: { $regex: propietario, $options: "i" }}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/liquidaciones/allmultasusr");   
        } else {
            res.render('notes/borrados/borradolistliquidaciones', { multas })
        }
    } 
});
router.post('/multa/borradofindnumacta', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numacta } = req.body;
    const multas = await Multas.find({$and:[{borrado:"Si"},{ numacta: { $regex: numacta, $options: "i" }}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/borrados/borradolistliquidaciones");   
        } else {
            res.render('notes/borrados/borradolistliquidaciones', { multas })
        }
    } 
});
router.post('/multa/borradofindubicacion', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { ubicacion } = req.body;
    const multas = await Multas.find({$and:[{borrado:"Si"},{ ubicacion: { $regex: ubicacion, $options: "i" }}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/borrados/borradolistliquidaciones");   
        } else {
            res.render('notes/borrados/borradolistliquidaciones', { multas })
        }
    } 
});
router.post('/multa/borradofindexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { expediente } = req.body;
    const multas = await Multas.find({$and:[{borrado:"Si"},{ expediente: { $regex: expediente, $options: "i" }}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/borrados/borradolistliquidaciones");   
        } else {
            res.render('notes/borrados/borradolistliquidaciones', { multas })
        }
    } 
});

router.post('/multa/findnumactaborrado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numacta } = req.body;
    const multas = await Multas.find({$and:[{ numacta: { $regex: numacta, $options: "i" }},{borrado:"Si"}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/liquidaciones/borrados/borradolistliquidaciones");   
        } else {
            res.render('notes/liquidaciones/allmultasusr', { multas })
        }
    } 
});

// **** SECTOR DELETE ****
router.post('/multa/findexpedienteborrado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { expediente } = req.body;
    const multas = await Multas.find({$and:[{ expediente: { $regex: expediente, $options: "i" }},{borrado:"Si"}]}).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones" || rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/liquidaciones/borrados/borradolistliquidaciones");   
        } else {
            res.render('notes/liquidaciones/allmultasusr', { multas })
        }
    } 
});

router.put('/multas/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "No";    
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Multas.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Liquidación Restaurada')
    res.redirect('/multas/borradolistado');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.delete('/multas/delete/:id', isAuthenticated, async (req, res) => {
    await Multas.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Multa a Propietario Eliminada')
    res.redirect('/multas')
});

router.put('/multas/marcadelete/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "Si";    
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Multas.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Liquidación a Papelera Reciclaje')
    res.redirect('/multas');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});


router.put('/multas/recuperarlistado', isAuthenticated, async (req, res) => {         
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Multas.updateMany({ borrado: 'Si', apercibimientoprofesional:"No" }, { borrado: "No", fechaborrado:"Recuperado"});
    req.flash('success_msg', 'todos los datos de liquidación de Propietarios recuperados')
    res.redirect('/multas/borradolistado');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.put('/multas/recuperarlistadoprop', isAuthenticated, async (req, res) => {         
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Multas.updateMany({ borrado: 'Si', apercibimientoprofesional:"No" }, { borrado: "No", fechaborrado:"Recuperado"});
    req.flash('success_msg', 'todos los datos de liquidación de propietarios recuperados')
    res.redirect('/multas/borradolistado');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.put('/multas/recuperarlistadoprof', isAuthenticated, async (req, res) => {         
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Multas.updateMany({ borrado: 'Si', apercibimientoprofesional:"Si" }, { borrado: "No", fechaborrado:"Recuperado"});
    req.flash('success_msg', 'todos los datos de liquidación de profesionales recuperados')
    res.redirect('/multas/borradolistado');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.delete('/multasprofesional/delete/:id', isAuthenticated, async (req, res) => {
    await Multas.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Multa a Profesional Eliminada')
    res.redirect('/multas/borradolistado')
});

router.put('/tasas/marcadelete/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "Si";    
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Tasas.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Tasas a Papelera Reciclaje')
    res.redirect('/Tasas');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.delete('/tasas/delete/:id', isAuthenticated, async (req, res) => {
    await Tasas.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Tasa Eliminada')
    res.redirect('/Tasas')
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;