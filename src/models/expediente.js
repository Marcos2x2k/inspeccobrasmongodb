const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const { Schema } = mongoose; // aca defino esquema de base de datos

ExpedienteSchema = new Schema({
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
  iniciadornomyape: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  domicilio: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  adremaexp: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  fiduciariopropsocio: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  direcfiduciariopropsocio: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  correofiduciariopropsocio: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  directorobraoperitovisor: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  destinodeobra: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  // zona:{ 
  //   type: String,
  //   allowNull: true
  // },
  superficieterreno: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  superficieaconstruir: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  superficiesubsueloplantabaja: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  superficieprimerpisoymaspisos: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  observaciones: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  permisobraoactainfrac: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  fotoexpediente: {
    type: String,
    require: false,
    default: "https://colonbuenosaires.com.ar/elfaro/wp-content/uploads/2017/09/expe.jpg"
  },
  fechainicioentrada: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  user: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  name: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  dateexp: {
    type: Date,
    default: Date.now
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
  // este user sirve para vincular las cuentas
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
date: {type: Date, 
    default: Date.now},
})

ExpedienteSchema.plugin(paginate);

module.exports = mongoose.model("Expediente", ExpedienteSchema)