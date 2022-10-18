const mongoose = require("mongoose");

const { Schema } = mongoose; // aca defino esquema de base de datos

const NoteSchema = new Schema({
        numinspeccion: {
                type: String,
                require: true
        },
        expediente: {
                type: String,
                require: false
        },
        oficio: {
                type: String,
                require: false
        },
        acta: {
                type: String,
                require: false
        },
        adrema: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        date: {
                type: String,
                require: false,
                default: "No Posee, por favor Cargar Fecha"
        },
        inspuser: {
                type: String,
                require: false,
                default: "Visitante"
        },
        informeinspnum: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        // numexp: {
        //         type: String,
        //         require: false,
        //         default: "No Posee Información"
        // },
        fechaentradinspec: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        // inspecfecha: {
        //         type: String,
        //         require: false,
        //         default: "No Posee Información"
        // },
        inspector: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        fotoinspeccion: {    // pidio doc en macro para excel y coloco aca tambien
                type: String,
                require: false,
                default: "https://muchosnegociosrentables.com/wp-content/uploads/2020/11/negocios-exitosos-de-construccion-8-ideas.jpg"
        },
        intimacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        infraccion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        observacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        paseanumdestino: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        pasea: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        fechapasea: {
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

module.exports = mongoose.model("Note", NoteSchema)