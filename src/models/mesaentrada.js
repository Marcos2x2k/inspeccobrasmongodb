const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const MesaentradaSchema = new Schema({
    borrado:{
        type: String,
        required: true,
        default:"No",
    },
    fechaborrado:{
        type: String,
        required: true,
        default:"No",
    },
    sector: {
        type: String,
        require: false
    },
    numturno: {
        type: String,
        require: false
    },
    fechaingreso: {
        type: String,
        require: false
    },
    horaingreso:{
        type: String,
        require: false
    },
    numexpediente: {
        type: String,
        require: false,
        default: "No Informó"
    },
    nomyape: {
        type: String,
        require: false,
        default: "No Informó"
    },
    dni: {
        type: String,
        require: false,
        default: "No Informó"
    },
    contacto: {
        type: String,
        require: false,
        default: "No Informó"
    },
    dateturno: {
        type: Date,
        default: Date.now
    },
    observaciones: {
        type: String,
        require: false,
        default: "No Posee"
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
    date: {
        type: Date, 
        default: Date.now
    },
});

module.exports = mongoose.model("Mesaentrada", MesaentradaSchema);


