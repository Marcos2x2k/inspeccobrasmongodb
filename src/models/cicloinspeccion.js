// Aca se refleja el ciclo que posee las inspecciones 
// que reciben los expedientes cargados en planilla de Alberto Chaparro

const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const CicloinspeccionSchema = new Schema({
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
    estado: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
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
    date: {
        type: Date,
        default: Date.now
    },
});

// FECHA ENTR INSP	INSPECCION	INTIMACION	INFRACCION	INFORME	DESTINO/PASE	FECHA SALIDA


module.exports = mongoose.model("cicloinspeccion", CicloinspeccionSchema);