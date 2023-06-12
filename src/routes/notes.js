const express = require('express');
const router = express.Router();
//const mongopagi = require('mongoose-paginate-v2') Paginacion de mongodb

// tengo que requerir los modelos para que mongoose me cree las tablas
const Expediente = require('../models/Expediente')
const Note = require('../models/Note')
const Intimacion = require('../models/Intimacion')
const Infraccion = require('../models/Infraccion')
const Estadistica = require('../models/Estadistica')
const Mesaentrada = require('../models/mesaentrada')
const Ticket = require('../models/Ticket')
const Cicloinspeccion = require('../models/cicloinspeccion')
const Multas = require('../models/Multas')
const Tasas = require('../models/Tasas')
const Users = require('../models/User')

const fs = require('fs').promises

const { isAuthenticated } = require('../helpers/auth')

// *ZONA PDF* //
const pdf = require("html-pdf")
var pdfoptionsA4 = { format: 'A4' };

router.get('/factura', isAuthenticated, async (req, res) => {
    //const multas = await Multas.find({ impreso: "No" }).lean().sort({ date: 'desc' });
    const multas = await Multas.find({ impreso: 'No' }).lean().sort({ propietario: 'desc' }); // temporal poner el d arriba despues
    res.render('notes/factura', { multas });
    //res.render('notes/factura', { layouts: "pdf"});
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

router.get('/descargarfactura', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/facturaimprimir.hbs")
    //const puerto = "172.25.2.215";
    var fstemp = require('fs');
    let tabla = "";
    let contenidoHtml = fstemp.readFileSync(ubicacionPlantilla, 'utf8');
    const tablamultas = await Multas.find({ impreso: 'No' }).lean().sort({ propietario: 'desc' }); // temporal poner el d arriba despues    

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
    await Multas.updateMany({ impreso: "No" }, { impreso: "Si", fechaimpreso: new Date() });
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

router.get('/mesaentradas/add', isAuthenticated, (req, res) => {
    res.render('notes/newmesaentradas');
})
router.get('/mesaentradas/add/:id', isAuthenticated, (req, res) => {
    res.render('notes/newmesaentradas');
})
router.get('/multas/add', isAuthenticated, async (req, res) => {
    const tasaactual = await Tasas.findOne({ tipotasa: { $regex: "T.C.", $options: "i" } }).lean().sort({ date: 'desc' });
    res.render('notes/newmultas', { tasaactual });
})
// router.get('/multas/add/:id', isAuthenticated, (req, res) => {
//     res.render('notes/newmultas');
// })
router.get('/multas/addtasas', isAuthenticated, (req, res) => {
    res.render('notes/newtasas');
})

router.get('/tickets/add', isAuthenticated, (req, res) => {
    res.render('notes/newtickets');
})

router.get('/expedientes/add', isAuthenticated, (req, res) => {
    res.render('notes/newexpedientes');
})

router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/newnotes');
})

router.get('/intimaciones/add', isAuthenticated, (req, res) => {
    res.render('notes/newintimaciones');
})

router.get('/intimaciones/add/:id', isAuthenticated, (req, res) => {
    res.render('notes/newintimaciones');
})

router.get('/infracciones/add', isAuthenticated, (req, res) => {
    res.render('notes/newinfracciones');
})

router.get('/estadisticas/add', isAuthenticated, (req, res) => {
    res.render('notes/newestadisticas');
})

router.post('/notes/newmesaentradas', isAuthenticated, async (req, res) => {
    const { sector, numturno, fechaingreso, horaingreso, numexpediente, nomyape, dni,
        contacto, hora, observaciones, user, name
    } = req.body;
    const newMesaentrada = new Mesaentrada({
        sector, numturno, fechaingreso, horaingreso, numexpediente, nomyape, dni,
        contacto, hora, observaciones, user, name
    })
    newMesaentrada.user = req.user.id;
    newMesaentrada.name = req.user.name;
    await newMesaentrada.save();
    req.flash('success_msg', 'Turno Agregado Exitosamente');
    res.redirect('/mesaentrada/listado');

})

router.post("/notes/newmultas", isAuthenticated, async (req, res) => {
    const { fecha, acta, numacta, expediente, adrema, inciso, propietario, ubicacion, infraccionoparalizacion,
        tcactual, formulamulta, montototal, observaciones, sancionprof, sancionprorc, reiteracion, user, name, date } = req.body;

    const newMultas = new Multas({
        fecha, acta, numacta, expediente, adrema, inciso, propietario, ubicacion, infraccionoparalizacion,
        tcactual, formulamulta, montototal, observaciones,sancionprof, sancionprorc, reiteracion, user, name, date
    })
    newMultas.user = req.user.id;
    newMultas.name = req.user.name;
    newMultas.date = new Date();
    await newMultas.save();
    req.flash('success_msg', 'Multa Agregada Exitosamente');
    res.redirect('/multas');
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

router.post('/notes/newtickets', isAuthenticated, async (req, res) => {

    const { plataforma, numticket, iniciador, ubicacion, celular, email, adrema, directordeobra,
        destinodeobra, superficieterreno, superficieaconstruir, supsubptabja, supsubptaaltaymas,
        zona, observaciones, permisoobra, actainfraccion, fechaentradainspecciones,
        inspeccionfecha, inspeccioninspector, intimaciones, infracciones, pasea, fechapasea,
        user, name
    } = req.body;

    const newTicket = new Ticket({
        plataforma, numticket, ubicacion, celular, email,
        adrema, directordeobra, destinodeobra, superficieterreno, superficieaconstruir,
        supsubptabja, supsubptaaltaymas, zona, observaciones, permisoobra, actainfraccion,
        fechaentradainspecciones, inspeccionfecha, inspeccioninspector, intimaciones,
        infracciones, pasea, fechapasea,
        user, name
    })
    const mayu = iniciador.replace(/\b\w/g, l => l.toUpperCase())
    newTicket.iniciador = mayu
    newTicket.user = req.user.id;
    newTicket.name = req.user.name;
    await newTicket.save();
    req.flash('success_msg', 'Ticket Agregado Exitosamente');
    res.redirect('/ticket/listado');
})

router.post('/notes/newmesaentradas/:id', isAuthenticated, async (req, res) => {
    const { sector, numturno, fechaingreso, horaingreso, numexpediente, nomyape, dni,
        contacto, hora, observaciones, user, name } = req.body;
    const newMesaentrada = new Mesaentrada({
        sector, numturno, fechaingreso, horaingreso, numexpediente, nomyape, dni,
        contacto, hora, observaciones, user, name
    })
    newMesaentrada.user = req.user.id;
    newMesaentrada.name = req.user.name;
    await newMesaentrada.save();
    req.flash('success_msg', 'Turno Agregado Exitosamente');
    res.redirect('/mesaentrada');
})

router.post('/notes/newexpedientes', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { numexpediente, estado, iniciadornomyape, domicilio, adremaexp,
        fiduciariopropsocio, direcfiduciariopropsocio, correofiduciariopropsocio,
        directorobraoperitovisor, destinodeobra, superficieterreno, superficieaconstruir,
        superficiesubsueloplantabaja, superficieprimerpisoymaspisos, observaciones,
        permisobraoactainfrac, fotoexpediente, fechainicioentrada, user, name
    } = req.body;
    const errors = [];
    if (!numexpediente) {
        errors.push({ text: "Ingrese Nº Expediente" })
    }
    if (!estado) {
        errors.push({ text: "Ingrese Estado" })
    }

    console.log(errors)
    if (errors.length > 0) {
        res.render('notes/newexpediente', {
            errors,
            numexpediente, estado, iniciadornomyape
        })
    } else {
        const newExpediente = new Expediente({
            numexpediente, estado, iniciadornomyape, domicilio, adremaexp,
            fiduciariopropsocio, direcfiduciariopropsocio, correofiduciariopropsocio,
            directorobraoperitovisor, destinodeobra, superficieterreno, superficieaconstruir,
            superficiesubsueloplantabaja, superficieprimerpisoymaspisos, observaciones,
            permisobraoactainfrac, fotoexpediente, fechainicioentrada, user, name
        })
        newExpediente.user = req.user.id;
        newExpediente.name = req.user.name;
        await newExpediente.save();
        req.flash('success_msg', 'Expediente Agregado Exitosamente');
        res.redirect('/expedientes');
    }
})

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
        numcodigoint, inspectorint, user, name
    } = req.body;

    const newIntimacion = new Intimacion({
        boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, user, name
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
        numcodigoint, inspectorint, user, name
    } = req.body;

    const newIntimacion = new Intimacion({
        boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, user, name
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
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/mesaentrada', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Mesa-Entrada") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const mesaentradas = await Mesaentrada.find().lean().sort({ dateturno: 'desc' });
        res.render('notes/allmesaentrada', { mesaentradas });
    } else if (rolusuario == "Administrador") {
        const mesaentradas = await Mesaentrada.find().lean().sort({ dateturno: 'desc' });
        res.render('notes/allmesaentradaadm', { mesaentradas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/multas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Liquidaciones") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const multas = await Multas.find().lean().sort({ date: 'desc' });
        res.render('notes/allmultas', { multas });
    } else if (rolusuario == "Administrador") {
        const multas = await Multas.find().lean().sort({ date: 'desc' });
        res.render('notes/allmultasadm', { multas });
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
        res.render('notes/multaestadisticaadm', { multas, montofinal });
    } else if (rolusuario == "Administrador") {
        const multas = await Multas.find().lean().sort({ date: 'desc' });
        for (let i = 0; i < multas.length; i++) {
            montofinal = montofinal + parseInt(multas[i].montototal)
        }
        res.render('notes/multaestadisticaadm', { multas, montofinal });
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
            res.render('notes/multaestadisticaadm', { multas, montofinal });
        } else if (adrema) {
            const multas = await Multas.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < multas.length; i++) {
                montofinal = montofinal + parseInt(multas[i].montototal)
            }
            res.render('notes/multaestadisticaadm', { multas, montofinal });
        } else if (numacta) {
            const multas = await Multas.find({ numacta: { $regex: numacta, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < multas.length; i++) {
                montofinal = montofinal + parseInt(multas[i].montototal)
            }
            res.render('notes/multaestadisticaadm', { multas, montofinal });
        } else if (desde && hasta) {
            //console.log("DESDE", desde)
            //console.log("HASTA", hasta)
            var d = new Date(hasta);
            const hastad = d.setDate(d.getDate() + 1);

            const multas = await Multas.find({ date: { $gte: desde, $lte: hastad } }).lean().sort({ date: 'asc' });
            //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
            //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });            
            for (let i = 0; i < multas.length; i++) {
                montofinal = montofinal + parseInt(multas[i].montototal)
            }
            res.render('notes/multaestadisticaadm', { multas, montofinal });
        }
    } else if (rolusuario == "Liquidaciones") {
        if (propietario) {
            const multas = await Multas.find({ propietario: { $regex: propietario, $options: "i" } }).lean().sort({ date: 'desc' });
            res.render('notes/multaestadisticaadm', { multas });
        } else if (adrema) {
            const multas = await Multas.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' });
            res.render('notes/multaestadisticaadm', { multas });
        } else if (numacta) {
            const multas = await Multas.find({ numacta: { $regex: numacta, $options: "i" } }).lean().sort({ date: 'desc' });
            res.render('notes/multaestadisticaadm', { multas });
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
    var multas =  "";
    let contenidoHtml = fstemp.readFileSync(ubicacionPlantilla, 'utf8');
    var filtro = "";
    var tipofiltro = "";
    //const tablamultas = await Multas.find({ impreso: 'No' }).lean().sort({ propietario: 'desc' }); // temporal poner el d arriba despues    
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user       
    const {propietarioo, adremao, numactao, desdeo, hastao} = req.body;
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
        filtro = desdeo+"-"+hastao;
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
        const multas = await Multas.find({ impreso: "No" }).lean().sort({ date: 'desc' });
        res.render('notes/allmultasadmimp', { multas });
    } else if (rolusuario == "Administrador") {
        const multas = await Multas.find({ impreso: "No" }).lean().sort({ date: 'desc' });
        res.render('notes/allmultasadmimp', { multas });
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
        const tasas = await Tasas.find().lean().sort({ date: 'desc' });
        res.render('notes/alltasasadm', { tasas });
    } else if (rolusuario == "Administrador") {
        const tasas = await Tasas.find().lean().sort({ date: 'desc' });
        res.render('notes/alltasasadm', { tasas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});


router.get('/mesaentrada/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Mesa-Entrada") {
        const mesaentradas = await Mesaentrada.find().limit(60).lean().sort({ dateturno: 'asc' });
        res.render('notes/planillalistaturnero', { mesaentradas });
    } else if (rolusuario == "Administrador") {
        const mesaentradas = await Mesaentrada.find().limit(60).lean().sort({ dateturno: 'asc' });
        res.render('notes/planillalistaturnero', { mesaentradas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
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

router.get('/expedientes', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const expedientes = await Expediente.find().lean().limit(200).sort({ numexpediente: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/allexpedientesadm', { expedientes });
    } else if (rolusuario == "Inspector") {
        const expedientes = await Expediente.find().lean().limit(200).sort({ numexpediente: 'desc' }); //
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
        const expedientes = await Expediente.find().lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/planillalistaexpedientes', { expedientes });
    } else if (rolusuario == "Inspector") {
        const expedientes = await Expediente.find().lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/planillalistaexpedientes', { expedientes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/notes', isAuthenticated, async (req, res) => { // (INSPECCIONES)
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const notes = await Note.find().lean().sort({ numinspeccion: 'desc' });
        res.render('notes/allnotesadm', { notes });
    } else if (rolusuario == "Inspector") {
        const notes = await Note.find().lean().sort({ numinspeccion: 'desc' });
        res.render('notes/allnotes', { notes });
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
        res.render('notes/planillalistainspeccion', { inspeccions });
    } else if (rolusuario == "Inspector") {
        const inspeccions = await Note.find().lean().sort({ date: 'desc' });
        res.render('notes/planillalistainspeccion', { inspeccions });
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



router.get('/estadisticas', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const estadisticas = await Estadistica.find().lean().sort({ estadisticanum: 'asc' });
    //para que muestre notas de un solo user
    // const estadisticas = await Estadistica.find({user : req.user.id}).lean().sort({estadisticanum:'desc'}); 
    res.render('notes/allestadistica', { estadisticas });
});

// ***** Aca los GET para EDITAR ******

router.get('/mesaentrada/add/:id', isAuthenticated, async (req, res) => {
    const mesaentrada = await Mesaentrada.findById(req.params.id).lean()
    res.render('notes/newmesaentradas', { mesaentrada })
});

router.get('/multas/add/:id', isAuthenticated, async (req, res) => {
    const tasaactual = await Tasas.findOne({ tipotasa: { $regex: "T.C.", $options: "i" } }).lean().sort({ date: 'desc' });
    const multas = await Multas.findById(req.params.id).lean()
    res.render('notes/newmultas', { multas, tasaactual })
});


router.get('/tickets/edit/:id', isAuthenticated, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id).lean()
    res.render('notes/editticket', { ticket })
});

router.get('/mesaentrada/edit/:id', isAuthenticated, async (req, res) => {
    const mesaentrada = await Mesaentrada.findById(req.params.id).lean()
    res.render('notes/editmesaentrada', { mesaentrada })
});

router.get('/expedientes/edit/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    res.render('notes/editexpediente', { expediente })
});

router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean()
    res.render('notes/editnote', { note })
});

router.get('/intimaciones/edit/:id', isAuthenticated, async (req, res) => {
    const intimacion = await Intimacion.findById(req.params.id).lean()
    res.render('notes/editintimacion', { intimacion })
});

router.get('/infracciones/edit/:id', isAuthenticated, async (req, res) => {
    const infraccion = await Infraccion.findById(req.params.id).lean()
    res.render('notes/editinfraccion', { infraccion })
});

router.get('/estadisticas/edit/:id', isAuthenticated, async (req, res) => {
    const estadistica = await Estadistica.findById(req.params.id).lean()
    res.render('notes/editestadistica', { estadistica })
});

// ***** informacion de cada dato ******

router.get('/mesaentrada/list/:id', isAuthenticated, async (req, res) => {
    const mesaentrada = await Mesaentrada.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/listmesaentrada', { mesaentrada })
});

router.get('/multas/list/:id', isAuthenticated, async (req, res) => {
    const multas = await Multas.findById(req.params.id).lean()
    res.render('notes/listmultas', { multas })
});

router.get('/ticket/list/:id', isAuthenticated, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id).lean()
    res.render('notes/listticket', { ticket })
});

router.get('/expedientes/list/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    res.render('notes/listexpediente', { expediente })
});

router.get('/notes/list/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean()
    res.render('notes/listnote', { note })
});

router.get('/intimaciones/list/:id', isAuthenticated, async (req, res) => {
    const intimacion = await Intimacion.findById(req.params.id).lean()
    res.render('notes/listintimacion', { intimacion })
});

router.get('/infracciones/list/:id', isAuthenticated, async (req, res) => {
    const infraccion = await Infraccion.findById(req.params.id).lean()
    res.render('notes/listinfraccion', { infraccion })
});

router.get('/estadisticas/list/:id', isAuthenticated, async (req, res) => {
    const estadistica = await Estadistica.findById(req.params.id).lean()
    res.render('notes/listestadistica', { estadistica })
});

//  ***** SECTOR BUSQUEDA *****

// *** BUSCAR LIQUIDACIONES O MULTAS ***
router.post('/multa/findpropietario', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { propietario } = req.body;
    const multas = await Multas.find({ propietario: { $regex: propietario, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones") {
        if (!multas) {
            req.flash('success_msg', 'cargue Nombre y/o Apellido')
            return res.render("notes/allmultas");
        } else {
            res.render('notes/allmultas', { multas })
        }
    } else if (rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmultasadm");
        } else {
            res.render('notes/allmultasadm', { multas })
        }
    } else {
        res.render('notes/allmultasadm', { multas })
    }
});
router.post('/multa/findnumacta', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numacta } = req.body;
    const multas = await Multas.find({ numacta: { $regex: numacta, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/allmultas");
        } else {
            res.render('notes/allmultas', { multas })
        }
    } else if (rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/allmultasadm");
        } else {
            res.render('notes/allmultasadm', { multas })
        }
    } else {
        res.render('notes/allmultasadm', { multas })
    }
});
router.post('/multa/findubicacion', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { ubicacion } = req.body;
    const multas = await Multas.find({ ubicacion: { $regex: ubicacion, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/allmultas");
        } else {
            res.render('notes/allmultas', { multas })
        }
    } else if (rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'Cargue Número Acta')
            return res.render("notes/allmultasadm");
        } else {
            res.render('notes/allmultasadm', { multas })
        }
    } else {
        res.render('notes/allmultas', { multas })
    }
});
router.post('/multa/findexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { expediente } = req.body;
    const multas = await Multas.find({ expediente: { $regex: expediente, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Liquidaciones") {
        if (!multas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmultas");
        } else {
            res.render('notes/allmultas', { multas })
        }
    } else if (rolusuario == "Administrador") {
        if (!multas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmultasadm");
        } else {
            res.render('notes/allmultasadm', { multas })
        }
    } else {
        res.render('notes/allmultasadm', { multas })
    }
});

// *** BUSCAR TURNOS ***
router.post('/mesaentrada/findsector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const mesaentradas = await Mesaentrada.find({ sector: { $regex: sector, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/findmesaentrada', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/findmesaentradaadm', { mesaentradas })
        }
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});
router.post('/mesaentrada/findiniciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const mesaentradas = await Mesaentrada.find({ nomyape: { $regex: nomyape, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/findmesaentrada', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/findmesaentradaadm', { mesaentradas })
        }
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});
router.post('/mesaentrada/findlistasector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const mesaentradas = await Mesaentrada.find({ sector: { $regex: sector, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});
router.post('/mesaentrada/findlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const mesaentradas = await Mesaentrada.find({ nomyape: { $regex: nomyape, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});
router.post('/mesaentrada/finddni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const mesaentradas = await Mesaentrada.find({ dni: { $regex: dni, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});
router.post('/mesaentrada/findlistadni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const mesaentradas = await Mesaentrada.find({ dni: { $regex: dni, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});
router.post('/mesaentrada/findexpediente', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const mesaentradas = await Mesaentrada.find({ numexpediente: { $regex: numexpediente, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue un Número de Expediente')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});
router.post('/mesaentrada/findlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numexpediente } = req.body;
    const mesaentradas = await Mesaentrada.find({ numexpediente: { $regex: numexpediente, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});
router.post('/mesaentrada/findfechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const mesaentradas = await Mesaentrada.find({ fechaingreso: { $regex: fechaingreso, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});
router.post('/mesaentrada/findlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const mesaentradas = await Mesaentrada.find({ fechaingreso: { $regex: fechaingreso, $options: "i" } }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});
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

// *** BUSCAR EXPEDIENTES (NOTES) - LISTADO ***
router.post('/expedientes/find', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedientes = await Expediente.find({ numexpediente: { $regex: numexpediente, $options: "i" } }).lean().sort({ fechainicioentrada: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/planillalistaexpedientes");
    } else {
        res.render('notes/planillalistaexpedientes', { expedientes })
    }
});
router.post('/expedientes/findadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    const expedientes = await Expediente.find({ adremaexp: { $regex: adremaexp, $options: "i" } }).lean().sort({ adremaexp: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/planillalistaexpedientes");
    } else {
        res.render('notes/planillalistaexpedientes', { expedientes })
    }
});
router.post('/expedientes/findiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    const expedientes = await Expediente.find({ iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }).lean().sort({ iniciadornomyape: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Iniciador (N y A)')
        return res.render("notes/planillalistaexpedientes");
    } else {
        res.render('notes/planillalistaexpedientes', { expedientes })
    }
});

// *** BUSCAR EXPEDIENTES (NOTES) - CARTAS ***
router.post('/notes/find', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedientes = await Expediente.find({ numexpediente: { $regex: numexpediente, $options: "i" } }).lean().sort({ fechainicioentrada: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/allexpedientes");
    } else {
        res.render('notes/findexpediente', { expedientes })
    }
});
router.post('/notes/findadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    const expedientes = await Expediente.find({ adremaexp: { $regex: adremaexp, $options: "i" } }).lean().sort({ adremaexp: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/allexpedientes");
    } else {
        res.render('notes/findexpediente', { expedientes })
    }
});
router.post('/notes/findiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    const expedientes = await Expediente.find({ iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }).lean().sort({ iniciadornomyape: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Iniciador (N y A)')
        return res.render("notes/allexpedientes");
    } else {
        res.render('notes/findexpediente', { expedientes })
    }
});

// *** BUSCAR INSPECCIONES ***
router.post('/notes/findinspeccion', isAuthenticated, async (req, res) => {
    const { numinspeccion } = req.body;
    const notes = await Note.find({ numinspeccion: { $regex: numinspeccion, $options: "i" } }).lean().sort({ numinspeccion: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});
router.post('/notes/findexpediente', isAuthenticated, async (req, res) => {
    const { expediente } = req.body;
    const notes = await Note.find({ expediente: { $regex: expediente, $options: "i" } }).lean().sort({ expediente: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});
router.post('/notes/findadrema', isAuthenticated, async (req, res) => {
    const { adrema } = req.body;
    const notes = await Note.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ adrema: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});
router.post('/notes/findinspector', isAuthenticated, async (req, res) => {
    const { inspector } = req.body;
    const notes = await Note.find({ inspector: { $regex: inspector, $options: "i" } }).lean().sort({ inspector: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Inspector')
        return res.render("notes/allnotes");
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


// **** AGREGAR TURNO A CLIENTE HABITUAL ****
router.put('/notes/editaddmesaentrada/:id', isAuthenticated, async (req, res) => {
    const { sector, numturno, fechaingreso, horaingreso, numexpediente,
        nomyape, dni, observaciones, contacto, dateturno } = req.body
    await Mesaentrada.findByIdAndUpdate(req.params.id, {
        sector, numturno, fechaingreso, horaingreso, numexpediente,
        nomyape, dni, contacto, dateturno
    });
    req.flash('success_msg', 'Turno nuevo Agregado')
    res.redirect('/mesaentrada');
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

router.put('/notes/editmesaentrada/:id', isAuthenticated, async (req, res) => {
    const { sector, numturno, fechaingreso, horaingreso, numexpediente,
        nomyape, dni, observaciones, contacto, dateturno } = req.body
    await Mesaentrada.findByIdAndUpdate(req.params.id, {
        sector, numturno, fechaingreso, horaingreso, numexpediente,
        nomyape, dni, contacto, dateturno
    });
    req.flash('success_msg', 'Turno Actualizado')
    res.redirect('/mesaentrada');
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

router.put('/notes/editexpediente/:id', isAuthenticated, async (req, res) => {
    const { numexpediente, estado, iniciadornomyape, domicilio, adremaexp,
        fiduciariopropsocio, direcfiduciariopropsocio, correofiduciariopropsocio,
        directorobraoperitovisor, destinodeobra, superficieterreno, superficieaconstruir,
        superficiesubsueloplantabaja, superficieprimerpisoymaspisos, observaciones,
        permisobraoactainfrac, fotoexpediente, fechainicioentrada } = req.body
    await Expediente.findByIdAndUpdate(req.params.id, {
        numexpediente, estado, iniciadornomyape, domicilio, adremaexp,
        fiduciariopropsocio, direcfiduciariopropsocio, correofiduciariopropsocio,
        directorobraoperitovisor, destinodeobra, superficieterreno, superficieaconstruir,
        superficiesubsueloplantabaja, superficieprimerpisoymaspisos, observaciones,
        permisobraoactainfrac, fotoexpediente, fechainicioentrada
    });
    req.flash('success_msg', 'Expediente actualizado')
    res.redirect('/expedientes');
});

router.put('/notes/editnote/:id', isAuthenticated, async (req, res) => {
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
    res.redirect('/notes');
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

router.put('/notes/editestadistica/:id', isAuthenticated, async (req, res) => {
    const { estadisticanum, fechaestadistica, horaestadistica } = req.body
    await Estadistica.findByIdAndUpdate(req.params.id, {
        estadisticanum, fechaestadistica, horaestadistica
    });
    req.flash('success_msg', 'Estadistica actualizada')
    res.redirect('/estadisticas');
});


// **** SECTOR DELETE ****

router.delete('/mesaentrada/delete/:id', isAuthenticated, async (req, res) => {
    await Mesaentrada.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Turno Eliminado')
    res.redirect('/mesaentrada')
});

router.delete('/tasas/delete/:id', isAuthenticated, async (req, res) => {
    await Tasas.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Tasa Eliminada')
    res.redirect('/Tasas')
});

router.delete('/multas/delete/:id', isAuthenticated, async (req, res) => {
    await Multas.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Multa Eliminada')
    res.redirect('/multas')
});

router.delete('/tickets/delete/:id', isAuthenticated, async (req, res) => {
    await Ticket.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Ticket Eliminado')
    res.redirect('/ticket/listado')
});

router.delete('/expedientes/delete/:id', isAuthenticated, async (req, res) => {
    await Expediente.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'expediente Eliminado')
    res.redirect('/expedientes')
});

//notes es inspecciones
router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Inspección Eliminada')
    res.redirect('/notes')
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

// **** sector IMAGEN ESTADISTICA ****

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