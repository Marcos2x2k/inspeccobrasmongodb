const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const ExpedinspeccionSchema = new Schema({
    idexpediente:{
        type: String,
        required: true,
    },
    numexpediente:{
        type: String,
        required: true,
    },
    numadrema:{
        type: String,
        required: true,
    },
    fechaentradainspeccion: {
        type: Date,
        require: false
    },
    fechaeinspectorinspeccion:{
        type: String,
        require: false
    },
    intimacion: {
        type: String,
        require: false,
        default: "x" // x es No sino pone el num de intimacion
    },
    infraccion: {
        type: String,
        require: false,
        default: "x" // x es No sino pone el num de infraccion
    },
    informe: {
        type: String,
        require: false,
        default: "No Informó"
    },
    destinopase: {
        type: String,
        require: false,
        default: "No Informó"
    },
    fechasalida: {
        type: String,
        require: false
    },    
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
    date: {type: Date, 
        default: Date.now},
});

module.exports = mongoose.model("Expedinspeccion", ExpedinspeccionSchema);