const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const MultasSchema = new Schema({
    fecha: {
        type: String,
        require: false
    },
    acta: {
        type: String,
        require: false
    },
    numacta: {
        type: String,
        require: false
    },
    adrema: {
        type: String,
        require: false,
        default: "No Informó"
    },
    expediente: {
        type: String,
        require: false,
        default: "No Informó"
    },
    propietario: {
        type: String,
        require: false
    },
    ubicacion:{
        type: String,
        require: false
    },
    inciso: {
        type: String,
        require: false,
        default: "No Informó"
    },
    formulamulta: {
        type: String,
        require: false,
        default: "No Posee"
    },   
    tcactual: {
        type: String,
        require: false,
        default: "No Informó"
    },
    montototal: {
        type: String,
        require: false,
        default: "No Informó"
    },
    observaciones: {
        type: String,
        require: false,
        default: "No Posee"
    },    
    impreso: {
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

module.exports = mongoose.model("Multas", MultasSchema);