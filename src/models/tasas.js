const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const TasasSchema = new Schema({
    borrado:{
        type: String,
        required: true,
        default:"No",
    },
    userborrado:{
        type: String,
        required: true,
        default:"Sin Datos",
    },
    fechaborrado:{
        type: String,
        required: true,
        default:"Sin Datos",
    },
    tasaconstruccion: {
        type: String,
        require: false,
        default: "52000"
    },
    tipotasa: {
        type: String,
        require: false,
        default: "T.C."
    },
    fechaactual: {
        type: String,
        require: false,
        default: "T.C."
    },
    observaciones: {
        type: String,
        require: false,
        default: "No Posee"
    },
    eliminado: {
        type: String,
        require: false,
        default: "No"
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

module.exports = mongoose.model("Tasas", TasasSchema);