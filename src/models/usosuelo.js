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
    fechaingreso: {
        type: String,
        require: false
    },
    horaingreso: {
        type: String,
        require: false
    },
    numexpediente: {
        type: String,
        require: false,
        default: "No Informó"
    },
    adrema: {
        type: String,
        require: false,
        default: "No Posee Información"
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
    filename: {
        type: String
    },
    path: {
        type: String,
        // default: "/img/Imagen-no-disponible.png"
    },
    filenamedos: {
        type: String
    },
    pathdos: {
        type: String,
        // default: "/img/Imagen-no-disponible.png"
    },
    filenametres: {
        type: String
    },
    pathtres: {
        type: String,
        // default: "/img/Imagen-no-disponible.png"
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