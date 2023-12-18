const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const TicketSchema = new Schema({
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
    plataforma: {
        type: String,
        require: true
    },
    numticket: {
        type: String,
        require: true
    },
    iniciador: {
        type: String,
        require: false
    },
    ubicacion: {
        type: String,
        require: false
    },
    celular: {
        type: String,
        require: false,
        default: "No Informó"
    },
    email: {
        type: String,
        require: false,
        default: "No Informó"
    },
    adrema: {
        type: String,
        require: false,
        default: "No Informó"
    },
    directordeobra: {
        type: String,
        require: false,
        default: "No Informó"
    },
    destinodeobra: {
        type: String,
        require: false,
        default: "No Informó"
    },
    superficieterreno: {
        type: String,
        require: false,
        default: "No Informó"
    },
    superficieaconstruir: {
        type: String,
        require: false,
        default: "No Informó"
    },
    supsubptabja: {
        type: String,
        require: false,
        default: "No Informó"
    },
    supsubptaaltaymas: {
        type: String,
        require: false,
        default: "No Informó"
    },
    zona: {
        type: String,
        require: false,
        default: "No Informó"
    },
    observaciones: {
        type: String,
        require: false,
        default: "No Informó"
    },
    permisoobra: {
        type: String,
        require: false,
        default: "No Informó"
    },
    actainfraccion: {
        type: String,
        require: false,
        default: "No Informó"
    },
    fechaentradainspecciones: {
        type: String,
        require: false,
        default: "No Informó"
    },
    documentacion: {
        type: String,
        require: false,
        default: "No Informó"
    },
    inspeccionfecha: {
        type: String,
        require: false,
        default: "No Informó"
    },
    inspeccioninspector: {
        type: String,
        require: false,
        default: "No Informó"
    },
    intimaciones: {
        type: String,
        require: false,
        default: "No Informó"
    },
    infracciones: {
        type: String,
        require: false,
        default: "No Informó"
    },
    observaciones: {
        type: String,
        require: false,
        default: "No Informó"
    },
    pasea: {
        type: String,
        require: false,
        default: "No Informó"
    },
    fechapasea: {
        type: String,
        require: false,
        default: "No Informó"
    },
    user: {
        type: String,
        require: false
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

module.exports = mongoose.model("Ticket", TicketSchema);


