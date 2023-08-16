const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const ExpedticketentrainspSchema = new Schema({
    idexpediente:{
        type: String,
        required: false,
    },
    numexpediente:{
        type: String,
        required: false,
    },
    numadrema:{
        type: String,
        required: false,
    },
    fechaentradainspeccion: {
        type: String,
        require: false
    },
    fechaeinspectorinspeccion:{
        type: String,
        require: false
    },
    numintimacion: {
        type: String,
        require: false,
        default: "x" // x es No sino pone el num de intimacion
    },
    numinfraccion: {
        type: String,
        require: false,
        default: "x" // x es No sino pone el num de infraccion
    },
    observaciones: {
        type: String,
        require: false,
        default: "Sin Informacion"
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

module.exports = mongoose.model("Expedticketentrainsp", ExpedticketentrainspSchema);