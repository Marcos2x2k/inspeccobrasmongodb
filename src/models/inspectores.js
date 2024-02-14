const mongoose = require('mongoose');
const { Schema } = mongoose;

const InspectoresSchema = new Schema ({
    numorden: {type: String, 
        require: true},
    name: {type: String, 
        require: true},
    dni:{type: String, 
        require: true
    },
    direccion:{type: String, 
        require: false
    },
    codigoinspector:{
        type: String, 
        require: false, 
        default:"NoPosee"
    },
    email: {type: String, 
        require: true,
        default:"No Declarado"
    },  
    date: {type: Date, 
        default: Date.now
    }
});

module.exports = mongoose.model("Inspectores", InspectoresSchema);