const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos


const IntimacionSchema = new Schema({
        fechaintimacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        senorsenora: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        domiciliopart: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        inspectorint: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        zona:{
                type: Number,
                require: true,
                default: "No Posee Información"
        },
        descripcion: {
                type: String,
                require: true,
                default: "No Posee Información"
        },
        boletaintnum: {
                type: Number,
                require: true,
                default: "No Posee Información"
        },
        tipointimacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },        
        otorgaplazode: {
                type: Number,
                require: false,
                default: "No Posee Información"
        },
        paracumplimientoaobservacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        }, 
        tipoacta: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        fecharealcontrol: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        statuscontrolintimacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        codinspector: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        notificadoint: {
                type: String,
                require: false,
                default: "No Posee Información"
        },//
        adremaint: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        numexpedienteint: {
                type: String,
                require: false,
                default: "No Posee Información"
        },  
        vencimientoint: {    // pidio doc en macro para excel y coloco aca tambien
                type: String,
                require: false,
                default: "No Posee Información"
        },   
        //hasta aca esta en el excel de Alejandro Garcia           
        lugaractuacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },               
        horaintimacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },        
        aclaracion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        numcodigoint: {
                type: String,
                require: false,
                default: "No Posee Información"
        },        
        filename: {
                type: String
        },
        path: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenamedos: {
                type: String
        },
        pathdos: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenametres: {
                type: String
        },
        pathtres: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenamecuatro: {
                type: String,
        },
        pathcuatro: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenamecinco: {
                type: String,
        },
        pathcinco: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenameseis: {
                type: String,
        },
        pathseis: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenamesiete: {
                type: String
        },
        pathsiete: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenameocho: {
                type: String
        },
        pathocho: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        // este user sirve para vincular las cuentas
        user: {
                type: String,
                require: false,
                default: "Administrador"
        },
        name: {
                type: String,
                require: false,
                default: "Administrador"
        },
        date: {
                type: Date,
                default: Date.now
        },

})

module.exports = mongoose.model("Intimacion", IntimacionSchema)