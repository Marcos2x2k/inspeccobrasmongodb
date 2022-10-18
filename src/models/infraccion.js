const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const InfraccionSchema = new Schema({
        actainfnum: {
                type: String,
                require: true
        },
        fechainfraccion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        horainfraccion: {
                type: String,
                require: false
        },
        numexpedienteinf: {
                type: String,
                require: false,
                default: "No Posee, por favor Cargar Fecha"
        },
        adremainf: {
                type: String,
                require: false,
                default: "Visitante"
        },
        apellidonombrepropietarioinf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        domiciliopropietarioinf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        dnipropietarioinf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        cuilpropietarioinf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        lugardeconstitucioninf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        causasinf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        ordenanzanum: {    // pidio doc en macro para excel y coloco aca tambien
                type: String,
                require: false,
                default: "No Posee Información"
        },
        notificadoinf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        incisonum: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        observacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        apellidonombretestigoinf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        inspectorinf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        inspectorcod: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        detallegeneral: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        informeinspecnum: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        inforinspecobsevaciones: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        fotoinf: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        // este user sirve para vincular las cuentas
        user: {
                type: String,
                require: false,
                default: "0000"
        },
        name: {
                type: String,
                require: false
        }

})

module.exports = mongoose.model("Infraccion", InfraccionSchema)