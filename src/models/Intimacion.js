const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const IntimacionSchema = new Schema({
        boletaintnum: {
                type: String,
                require: true
        },
        numexpedienteint: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        adremaint: {
                type: String,
                require: false
        },
        señorseñora: {
                type: String,
                require: false,
                default: "No Posee, por favor Cargar Fecha"
        },
        domiciliopart: {
                type: String,
                require: false,
                default: "Visitante"
        },
        lugaractuacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        otorgaplazode: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        paracumplimientoa: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        fechaintimacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        horaintimacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        vencimientoint: {    // pidio doc en macro para excel y coloco aca tambien
                type: String,
                require: false,
                default: "No Posee Información"
        },
        notificadoint: {
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
        inspectorint: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        fotoint: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        // este user sirve para vincular las cuentas
        user: {
                type: String,
                require: false
        },
        name: {
                type: String,
                require: false
        }

})

module.exports = mongoose.model("Intimacion", IntimacionSchema)