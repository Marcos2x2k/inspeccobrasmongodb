const mongoose = require('mongoose');
const { Schema } = mongoose;

const InspectoresSchema = new Schema ({
    numorden: {
        type: String, 
        require: true},
    name: {
        type: String, 
        require: true},
    dni:{
        type: String, 
        require: true
    },
    direccion:{
        type: String, 
        require: false
    },
    codigoinspector:{
        type: String, 
        require: false, 
        default:"NoPosee"
    },
    funcion:{
        type: String, 
        require: false, 
        default:"NoPosee"
    },
    celular: {
        type: String, 
        require: true,
        default:"No Declarado"
    },  
    email: {
        type: String, 
        require: true,
        default:"No Declarado"
    },  
    user: {
        type: String,
        require: false,
        default: "Administrador"
    },
    nameuser: {
        type: String,
        require: false,
        default: "Administrador"
    },
    date: {
        type: Date, 
        default: Date.now
    }
});

module.exports = mongoose.model("Inspectores", InspectoresSchema);