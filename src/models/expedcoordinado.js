const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const ExpedcoordinadoSchemaSchema = new Schema({
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
        default: "Pendiente"
    },
    numexpediente: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    codigoinspector: {
        type: String,
        require: false,
        default: "No Posee Información"
    },      
    inspector: {
        type: String,
        require: false,
        default: "No Posee Información"
    },  
    iniciadornomyape: {
        type: String,
        require: false,
        default: "No Posee Información"
    },      
    domicilio: {
        type: String,
        require: false,
        default: "No Informó"
    },
    adremaexp: {
        type: String,
        require: false,
        default: "No Posee Información"
    },   
    fechainspeccion: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    horainspeccion: {
        type: String,
        require: false
    },   
    motivoinspeccion: {
        type: String,
        require: false
    },    
    resultadoinspeccion: {
        type: String,
        require: false,
        default: "No Realizado"
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


module.exports = mongoose.model("Expedcoordinado", ExpedcoordinadoSchemaSchema);