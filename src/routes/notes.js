const express = require('express');
const router = express.Router();
const mongopagi = require('mongoose-paginate-v2')

// tengo que requerir los modelos para que 
// mongoose me cree las tablas
const Expediente = require('../models/Expediente')
const Note = require('../models/Note')
const Intimacion = require('../models/Intimacion')
const Infraccion = require('../models/Infraccion')
const Estadistica = require('../models/Estadistica')

const { isAuthenticated } = require('../helpers/auth')

router.get('/expedientes/add', isAuthenticated, (req, res) => {
    res.render('notes/newexpedientes');
})

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

router.post('/notes/newexpedientes', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { numexpediente, estado, iniciadornomyape, domicilio, adremaexp, 
        fiduciariopropsocio, direcfiduciariopropsocio, correofiduciariopropsocio,
        directorobraoperitovisor, destinodeobra, superficieterreno, superficieaconstruir,
        superficiesubsueloplantabaja, superficieprimerpisoymaspisos, observaciones, 
        permisobraoactainfrac, fotoexpediente, fechainicioentrada, user ,name
    } = req.body;
    const errors = [];
    if (!numexpediente) {
        errors.push({ text: "Ingrese Nº Expediente" })
    }
    if (!estado) {
        errors.push({ text: "Ingrese Estado" })
    }
    // if (!inspector){
    //     errors.push({text: "Ingrese Nombre Inspector/Usuario"})
    // }
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
        permisobraoactainfrac, fotoexpediente, fechainicioentrada, user ,name
        })
        newExpediente.user = req.user.id;
        newExpediente.name = req.user.name;
        await newExpediente.save();
        req.flash('success_msg', 'Expediente Agregado Exitosamente');
        // console.log (newNote)
        res.redirect('/expedientes');
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

router.post('/notes/newintimaciones', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { boletaintnum, numexpedienteint, adremaint, señorseñora, domiciliopart,
        lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint, user , name
    } = req.body;
    const errors = [];
    if (!boletaintnum) {
        errors.push({ text: "Rellene Numero de Boleta" })
    }
    if (!numexpedienteint) {
        errors.push({ text: "Rellene Numero de expediente si tiene sino poner 000" })
    }
    if (!adremaint ) {
        errors.push({ text: "Rellene Numero de expediente si tiene sino poner 000" })
    }
    // if (!señorseñora) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!domiciliopart) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!lugaractuacion) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!otorgaplazode) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!paracumplimientoa) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!fechaintimacion) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!horaintimacion) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!vencimientoint) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!notificadoint) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!aclaracion) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!numcodigoint) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    // if (!inspectorint) {
    //     errors.push({ text: "Rellene Todos Los Campos/Datos" })
    // }
    console.log(errors)
    if (errors.length > 0) {
        res.render('notes/newintimaciones', {
            errors
            ,boletaintnum, numexpedienteint, adremaint, 
            señorseñora, domiciliopart,
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
        req.flash('success_msg', 'Intimación Agregada Exitosamente');
        // console.log (newNote)
        res.redirect('/intimaciones');
        // res.send('ok');
    }
})

router.post('/notes/newinfracciones', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { actainfnum,
     fechainfraccion, horainfraccion, numexpedienteinf   = "No Posee", adremainf,
        apellidonombrepropietarioinf, domiciliopropietarioinf, dnipropietarioinf, cuilpropietarioinf,
        lugardeconstitucioninf, causasinf, ordenanzanum, notificadoinf, incisonum,
        observacion, apellidonombretestigoinf, inspectorinf, inspectorcod, detallegeneral,
        informeinspecnum, inforinspecobsevaciones, fotoinf, user ,name
    } = req.body;
    const errors = [];
    if (!actainfnum) {
        errors.push({ text: "Ingrese Nº Acta Infracción" })
    }
    if (!fechainfraccion) {
        errors.push({ text: "Ingrese Fecha Infracción" })
    }
    if (!inspectorinf) {
        errors.push({ text: "Ingrese NyA Inspector" })
    }

    console.log(errors)
    if (errors.length > 0) {
        res.render('notes/newinfracciones', {
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

// aca llama los expedientes de la bd, pero si necesito que llame solo de usuarios especificos debo especificar en find
//
router.get('/expedientes', isAuthenticated, async (req, res) => {   
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const expedientes = await Expediente.find().lean().limit(200).sort({ numexpediente: 'desc' }); //
       
    // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
    res.render('notes/allexpedientes', { expedientes });
});

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

router.get('/expedientes/edit/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/editexpediente', { expediente })
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

router.get('/expedientes/list/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/listexpediente', { expediente })
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

//  ***** SECTOR BUSQUEDA *****

router.post('/expedientes/find', isAuthenticated, async (req, res) => {
        // const numexpediente = req.query.id;
        // ({"name": /desarrolladores/i})
        const {numexpediente} = req.body;
        const expedientes = await Expediente.find({numexpediente : {$regex: numexpediente, $options:"i"}}).lean().sort({ numexpediente: 'desc' });;
        if (!expedientes){
            req.flash('success_msg', 'cargue un Nº de expediente')
            return res.render("notes/allexpedientes");
        }else{        
        res.render('notes/findexpediente', { expedientes })
    }});
    router.post('/expedientes/findadrema', isAuthenticated, async (req, res) => {
        // const numexpediente = req.query.id;
        // ({"name": /desarrolladores/i})
        const  {adremaexp} = req.body;
        const expedientes = await Expediente.find({adremaexp : {$regex: adremaexp, $options:"i"}}).lean().sort({ adremaexp: 'desc' });;
        if (!expedientes){
            req.flash('success_msg', 'cargue un Nº de Adrema')
            return res.render("notes/allexpedientes");
        }else{        
        res.render('notes/findexpediente', { expedientes })
    }});
    router.post('/expedientes/findiniciador', isAuthenticated, async (req, res) => {
        // const numexpediente = req.query.id;
        // ({"name": /desarrolladores/i})
        const {iniciadornomyape} = req.body;
        const expedientes = await Expediente.find({iniciadornomyape : {$regex: iniciadornomyape, $options:"i"}}).lean().sort({ iniciadornomyape: 'desc' });;
        if (!expedientes){
            req.flash('success_msg', 'cargue un Iniciador (N y A)')
            return res.render("notes/allexpedientes");
        }else{        
        res.render('notes/findexpediente', { expedientes })
    }});
    
   // *** BUSCAR INSPECCIONES ***
router.post('/notes/findinspeccion', isAuthenticated, async (req, res) => {
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
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
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
    const {expediente} = req.body;
    const notes = await Note.find({expediente : {$regex: expediente, $options:"i"}}).lean().sort({ expediente: 'desc' });;
    if (!notes){
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/allnotes");
    }else{        
    res.render('notes/findinspeccion', { notes })
}});
router.post('/notes/findadrema', isAuthenticated, async (req, res) => {
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
    const  {adrema} = req.body;
    const notes = await Note.find({adrema : {$regex: adrema, $options:"i"}}).lean().sort({ adrema: 'desc' });;
    if (!notes){
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/allnotes");
    }else{        
    res.render('notes/findinspeccion', { notes })
}});
router.post('/notes/findinspector', isAuthenticated, async (req, res) => {
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
    const  {inspector} = req.body;
    const notes = await Note.find({inspector : {$regex: inspector, $options:"i"}}).lean().sort({ inspector: 'desc' });;
    if (!notes){
        req.flash('success_msg', 'cargue un Inspector')
        return res.render("notes/allnotes");
    }else{        
    res.render('notes/findinspeccion', { notes })
}});

// *** BUSCAR INTIMACIONES ***
router.post('/notes/findintimacion', isAuthenticated, async (req, res) => {
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
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
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
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
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
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
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
    const { inspectorint } = req.body;
    const intimacions = await Intimacion.find({ inspectorint: { $regex: inspectorint, $options: "i" } }).lean().sort({ inspectorint: 'desc' });;
    if (!intimacions) {
        req.flash('success_msg', 'cargue un Inspector')
        return res.render("notes/allintimaciones");
    } else {
        res.render('notes/findintimacion', { intimacions })
    }
});

// *** BUSCAR INFRACCIONES ***
router.post('/notes/findinfraccion', isAuthenticated, async (req, res) => {
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
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
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
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
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
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
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
    const { apellidonombrepropietarioinf } = req.body;
    const infraccions = await Infraccion.find({ apellidonombrepropietarioinf: { $regex: apellidonombrepropietarioinf, $options: "i" } }).lean().sort({ apellidonombrepropietarioinf: 'desc' });;
    if (!infraccions) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/allinfracciones");
    } else {
        res.render('notes/findinfraccion', { infraccions })
    }
});
   // *** BUSCAR ESTADISTICAS ***
   router.post('/notes/findnumestadistica', isAuthenticated, async (req, res) => {
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
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



// **** SECTOR EDITAR ****

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


// **** SECTOR DELETE ****

router.delete('/expedientes/delete/:id', isAuthenticated, async (req, res) => {
    await Expediente.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'expediente Eliminado')
    res.redirect('/expedientes')
    // console.log(req.params.id)
    // res.send('ok')
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
