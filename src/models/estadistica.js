const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const EstadisticaSchema = new Schema({
        estadisticanum: {
                type: String,
                require: true
        },
        fechaestadistica: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        horaestadistica: {
                type: String,
                require: false
        }, 
        // este user sirve para vincular las cuentas
        user: {
                type: String,
                require: false,
                default: "0000"
        },
        name: {
                type: String,
                require: false,
                default: "0000"
        }

})

module.exports = mongoose.model("Estadistica", EstadisticaSchema)