// Aca se refleja el ciclo que posee las inspecciones 
// que reciben los expedientes cargados en planilla de Alberto Chaparro

const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const CicloinspeccionSchema = new Schema({
    numexpediente: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    iniciadornomyapeexp: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    adremaexp: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    fechaentradainspeccionesexp: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    inspeccionexp: {
        type: String,
        require: false
    },
    intimacionexp: {
        type: String,
        require: false
    },
    infraccionexp: {
        type: String,
        require: false
    },
    informeexp: {
        type: String,
        require: false,
        default: "No Informó"
    },
    destinoyopaseexp: {
        type: String,
        require: false,
        default: "No Informó"
    },
    fechasalidaexp: {
        type: String,
        require: false,
        default: "No Informó"
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

module.exports = mongoose.model("cicloinspeccion", CicloinspeccionSchema);