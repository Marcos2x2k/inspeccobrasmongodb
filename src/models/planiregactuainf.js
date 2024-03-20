const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const PlaniredactuaSchema = new Schema({
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
    fechainiciotramite: {        
        type: Date,
        //default: "Sin Datos",
    },
    propietario: {
        type: String,
        default: "Sin Datos",
    },
    cuitdni: {
        type: String,
        default: "Sin Datos",
    },
    direccion: {
        type: String,
        default: "Sin Datos",
    },
    lugartipo:{
    type: String,
    default: "No Especificado",
},
    adrema: {
    type: String,
    default: "Sin Datos",
},
    inspector: {
    type: String,
    default: "Sin Datos",
},
    zona: {
    type: String,
    default: "Sin Datos",
},
    descripcion: {
    type: String,
    default: "Sin Datos",
},
    intimacion: {
    type: String,
    default: "Sin Datos",
},
    numerointimacion: {
    type: String,
    default: "Sin Datos",
},
    tipoacta: {
    type: String,
    default: "Sin Datos",
},
    observacion: {
    type: String,
    default: "Sin Datos",
},
    expediente: {
    type: String,
    default: "Sin Datos",
},
    numfaja: {
    type: String,
    default: "Sin Datos",
},
    actareiterada: {
    type: String,
    default: "Sin Datos",
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
    filenamecuatro: {
    type: String,
},
    pathcuatro: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
},
    filenamecinco: {
    type: String,
},
    pathcinco: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
},
    filenameseis: {
    type: String,
},
    pathseis: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
},
    filenamesiete: {
    type: String
},
    pathsiete: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
},
    filenameocho: {
    type: String
},
    pathocho: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
},
    eliminado: {
    type: String,
    require: false,
    default: "No"
},
    // este user sirve para vincular las cuentas
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

})

module.exports = mongoose.model("Planiredactua", PlaniredactuaSchema)