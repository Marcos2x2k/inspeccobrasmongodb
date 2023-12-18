const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const ExpedticketSchema = new Schema({
    estado: {
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
    domicilio: {
        type: String,
        require: false
    },
    numadrema: {
        type: String,
        require: false,
        default: "No Informó"
    },
    fiduciariopropsocio: {
        type: String,
        require: false,
        default: "No Informó"
    },
    direcfiduciariopropsocio: {
        type: String,
        require: false,
        default: "No Informó"
    },
    correofiduciariopropsocio: {
        type: String,
        require: false,
        default: "No Informó"
    },
    directorobraoperitovisor: {
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
    superficiesubsueloplantabaja: {
        type: String,
        require: false,
        default: "No Informó"
    },
    superficieprimerpisoymaspisos: {
        type: String,
        require: false,
        default: "No Informó"
    },
    observaciones: {
        type: String,
        require: false,
        default: "No Informó"
    },
    permisobraoactainfrac: {
        type: String,
        require: false,
        default: "No Informó"
    },
    eliminado: {
        type: String,
        require: false,
        default: "No"
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

module.exports = mongoose.model("Expedticket", ExpedticketSchema);
