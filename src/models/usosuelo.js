const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const UsosueloSchema = new Schema({
    borrado: {
        type: String,
        required: true,
        default: "No",
    },
    userborrado: {
        type: String,
        required: true,
        default: "Sin Datos",
    },
    fechaborrado: {
        type: String,
        required: true,
        default: "Sin Datos",
    },
    fechainicio: {
        type: String,
        require: false
    },
    expediente: {
        type: String,
        require: false,
        default: "No Informó"
    },
    iniciador: {
        type: String,
        require: false,
        default: "No Informó"
    },
    dni: {
        type: String,
        require: false,
        default: "No Informó"
    },
    extracto: {
        type: String,
        require: false,
        default: "No Posee"
    },
    motivo: {
        type: String,
        require: false,
        default: "No Posee"
    },
    adrema: {
        type: String,
        require: false,
        default: "No Posee Información"
    }, 
    direccion: {
        type: String,
        require: false,
        default: "No Posee"
    },
    contacto: {
        type: String,
        require: false,
        default: "No Informó"
    },
    profesional: {
        type: String,
        require: false,
        default: "No Informó"
    },
    correo: {
        type: String,
        require: false,
        default: "No Informó"
    },  
    fechaingresodus: {
        type: String,
        require: false
    },
    fechaegresodus: {
        type: String,
        require: false
    },
    observaciones: {
        type: String,
        require: false,
        default: "No Posee"
    },     
    filename: {
        type: String
    },
    path: {
        type: String,
        default: "/img/Imagen-no-disponible.png"
    },
    filenamedos: {
        type: String
    },
    pathdos: {
        type: String,
        default: "/img/Imagen-no-disponible.png"
    },
    filenametres: {
        type: String
    },
    pathtres: {
        type: String,
        default: "/img/Imagen-no-disponible.png"
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

module.exports = mongoose.model("Usosuelo", UsosueloSchema);