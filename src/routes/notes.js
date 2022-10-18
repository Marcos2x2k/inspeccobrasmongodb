const express = require('express');
const router = express.Router();

// tengo que requerir los modelos para que mongoose me cree las tablas

const Note = require('../models/Note')
const Intimacion = require('../models/Intimacion')
const Infraccion = require('../models/Infraccion')
const Estadistica = require('../models/Estadistica')

const { isAuthenticated } = require('../helpers/auth')


router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/newnotes');
})

router.get('/intimaciones/add', isAuthenticated, (req, res) => {
    res.render('notes/newintimaciones');
})

router.get('/infracciones/add', isAuthenticated, (req, res) => {
    res.render('notes/newinfracciones');
})

router.get('/estadisticas/add', isAuthenticated, (req, res) => {
    res.render('notes/newestadisticas');
})


router.post('/notes/newintimaciones', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { boletaintnum, numexpedienteint, adremaint, señorseñora, domiciliopart,
        lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint, user , name
    } = req.body;
    const errors = [];
    if (!boletaintnum) {
        errors.push({ text: "Ingrese Nº Boleta Intimación" })
    }
    // if (!adrema){
    //     errors.push({text: "Ingrese Nº Adrema"})
    // }
    console.log(errors)
    if (errors.length > 0) {
        res.render('notes/newintimaciones', {
            errors,
            boletaintnum, numexpedienteint, adremaint, señorseñora, domiciliopart,
            lugaractuacion, otorgaplazode, paracumplimientoa,
            fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
            numcodigoint, inspectorint, fotoint, user
        })
    } else {
        const newIntimacion = new Intimacion({
            boletaintnum, numexpedienteint, adremaint, señorseñora, domiciliopart,
            lugaractuacion, otorgaplazode, paracumplimientoa,
            fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
            numcodigoint, inspectorint, fotoint, user ,name
        })
        newIntimacion.user = req.user.id;
        newIntimacion.name = req.user.name;
        await newIntimacion.save();
        req.flash('success_msg', 'Intimación Agregado Exitosamente');
        // console.log (newNote)
        res.redirect('/intimaciones');
        // res.send('ok');
    }
})

router.post('/notes/newnotes', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { numinspeccion, expediente, oficio, acta, adrema, date, inspuser,
        informeinspnum, fechaentradinspec, inspecfecha,
        inspector, fotoinspeccion, intimacion, infraccion, observacion,
        paseanumdestino, pasea, fechapasea, user ,name
    } = req.body;
    const errors = [];
    if (!numinspeccion) {
        errors.push({ text: "Ingrese Nº Inspección" })
    }
    if (!date) {
        errors.push({ text: "Ingrese Fecha Actual" })
    }
    // if (!inspector){
    //     errors.push({text: "Ingrese Nombre Inspector/Usuario"})
    // }
    console.log(errors)
    if (errors.length > 0) {
        res.render('notes/newnotes', {
            errors,
            numinspeccion, expediente, adrema
        })
    } else {
        const newNote = new Note({
            numinspeccion, expediente,  oficio, acta, adrema, date, inspuser,
            informeinspnum, fechaentradinspec, inspecfecha,
            inspector, fotoinspeccion, intimacion, infraccion, observacion,
            paseanumdestino, pasea, fechapasea, user ,name
        })
        newNote.user = req.user.id;
        newNote.name = req.user.name;
        await newNote.save();
        req.flash('success_msg', 'Inspección Agregado Exitosamente');
        // console.log (newNote)
        res.redirect('/notes');
        // res.send('ok');
    }
})

router.post('/notes/newinfracciones', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { actainfnum, fechainfraccion, horainfraccion, numexpedienteinf, adremainf,
        apellidonombrepropietarioinf, domiciliopropietarioinf, dnipropietarioinf, cuilpropietarioinf,
        lugardeconstitucioninf, causasinf, ordenanzanum, notificadoinf, incisonum,
        observacion, apellidonombretestigoinf, inspectorinf, inspectorcod, detallegeneral,
        informeinspecnum, inforinspecobsevaciones, fotoinf, user ,name
    } = req.body;
    const errors = [];
    if (!actainfnum) {
        errors.push({ text: "Ingrese Nº Acta Infracción" })
    }
    if (!adremainf) {
        errors.push({ text: "Ingrese Nº Adrema" })
    }
    console.log(errors)
    if (errors.length > 0) {
        res.render('notes/newintimaciones', {
            errors,
            actainfnum, fechainfraccion, horainfraccion, numexpedienteinf, adremainf,
            apellidonombrepropietarioinf, domiciliopropietarioinf, dnipropietarioinf, cuilpropietarioinf,
            lugardeconstitucioninf, causasinf, ordenanzanum, notificadoinf, incisonum,
            observacion, apellidonombretestigoinf, inspectorinf, inspectorcod, detallegeneral,
            informeinspecnum, inforinspecobsevaciones, fotoinf, user ,name
        })
    } else {
        const newInfraccion = new Infraccion({
            actainfnum, fechainfraccion, horainfraccion, numexpedienteinf, adremainf,
            apellidonombrepropietarioinf, domiciliopropietarioinf, dnipropietarioinf, cuilpropietarioinf,
            lugardeconstitucioninf, causasinf, ordenanzanum, notificadoinf, incisonum,
            observacion, apellidonombretestigoinf, inspectorinf, inspectorcod, detallegeneral,
            informeinspecnum, inforinspecobsevaciones, fotoinf, user ,name
        })
        newInfraccion.user = req.user.id;
        newInfraccion.name = req.user.name;
        await newInfraccion.save();
        req.flash('success_msg', 'Infracción Agregada Exitosamente');
        // console.log (newNote)
        res.redirect('/infracciones');
        // res.send('ok');
    }
})

router.post('/notes/newestadisticas', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const {  estadisticanum, fechaestadistica, horaestadistica, user ,name
    } = req.body;
    const errors = [];
    if (!estadisticanum) {
        errors.push({ text: "Ingrese Nº Estadistica" })
    }
    if (!fechaestadistica) {
        errors.push({ text: "Ingrese Fecha Actual" })
    }
    // if (!inspector){
    //     errors.push({text: "Ingrese Nombre Inspector/Usuario"})
    // }
    console.log(errors)
    if (errors.length > 0) {
        res.render('notes/newestadisticas', {
            errors,
            estadisticanum, fechaestadistica, horaestadistica
        })
    } else {
        const newEstadistica = new Estadistica({
            estadisticanum, fechaestadistica, horaestadistica, user ,name
        })
        newEstadistica.user = req.user.id;
        newEstadistica.name = req.user.name;
        await newEstadistica.save();
        req.flash('success_msg', 'Estadistica Creada Exitosamente');
        // console.log (newNote)
        res.redirect('/estadisticas');
        // res.send('ok');
    }
})


// aca llama las notas de la bd, pero si necesito que llame solo de usuarios especificos debo especificar en find
router.get('/notes', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const notes = await Note.find().lean().sort({ numinspeccion: 'desc' });
    res.render('notes/allnotes', { notes });
});

router.get('/intimaciones', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const intimacions = await Intimacion.find().lean().sort({ date: 'desc' });
    res.render('notes/allintim', { intimacions });
});
router.get('/infracciones', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const infraccions = await Infraccion.find().lean().sort({ date: 'desc' });
    res.render('notes/allinfracc', { infraccions });
});

router.get('/estadisticas', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const estadisticas = await Estadistica.find().lean().sort({estadisticanum:'asc'}); 
    //para que muestre notas de un solo user
    // const estadisticas = await Estadistica.find({user : req.user.id}).lean().sort({estadisticanum:'desc'}); 
    res.render('notes/allestadistica', { estadisticas });
});

router.get('/mesaentrada', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const notes = await Note.find().lean().sort({ numinspeccion: 'desc' });
    res.render('notes/allmesaentrada', { notes });
});


router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean()
    // console.log(note.date);
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


router.get('/notes/list/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean()
    console.log(note.date);
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


router.put('/notes/editnote/:id', isAuthenticated, async (req, res) => {
    const { numinspeccion, expediente,  oficio, acta, adrema, date, inspuser,
        informeinspnum, fechaentradinspec, inspecfecha, inspector,
        fotoinspeccion, intimacion, infraccion, observacion, paseanumdestino,
        pasea, fechapasea } = req.body
    await Note.findByIdAndUpdate(req.params.id, {
        numinspeccion, expediente,  oficio, acta, adrema, date, inspuser,
        informeinspnum, fechaentradinspec, inspecfecha, inspector,
        fotoinspeccion, intimacion, infraccion, observacion, paseanumdestino,
        pasea, fechapasea
    });
    req.flash('success_msg', 'Inspección actualizada')
    res.redirect('/notes');
});

router.put('/notes/editintimacion/:id', isAuthenticated, async (req, res) => {
    const { boletaintnum, numexpedienteint, adremaint, señorseñora, domiciliopart,
        lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint } = req.body
    await Intimacion.findByIdAndUpdate(req.params.id, {
        boletaintnum, numexpedienteint, adremaint,
        señorseñora, domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
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

router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Inspección Eliminada')
    res.redirect('/notes')
    // console.log(req.params.id)
    // res.send('ok')
});

router.delete('/intimaciones/delete/:id', isAuthenticated, async (req, res) => {
    await Intimacion.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Intimación Eliminada')
    res.redirect('/intimaciones')
    // console.log(req.params.id)
    // res.send('ok')

});

router.delete('/infracciones/delete/:id', isAuthenticated, async (req, res) => {
    await Infraccion.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Infracción Eliminada')
    res.redirect('/infracciones')
    // console.log(req.params.id)
    // res.send('ok')
});

router.delete('/estadisticas/delete/:id', isAuthenticated, async (req, res) => {
    await Estadistica.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Estadistica Eliminada')
    res.redirect('/estadisticas')
    // console.log(req.params.id)
    // res.send('ok')
});

module.exports = router;
