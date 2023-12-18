const express = require('express');
const router = express.Router();



function ShowName(name) {
    var writtenName = document.getElementById({name}).value;
    document.getElementById({name}).value = formatToString(writtenName);
}

function formatToString(writtenName) {
    var tmp = writtenName.split(" ");
    var fullName;
    tmp.forEach(element => {
        if (fullName) {
            fullName = fullName + " " + element.charAt(0).toUpperCase() + element.slice(1).toLocaleLowerCase();
        } else {
            fullName = element.charAt(0).toUpperCase() + element.slice(1).toLocaleLowerCase();
        }
    })
    return fullName;
}

function mostrarContrasena() {
    var tipo = document.getElementById('txtpassword');
    var eye = document.getElementById('eyepassword');
    if (tipo.type == "password") {
        tipo.type = "text";
        eye.class = "btn btn-secondary"
    } else {
        tipo.type = "password";
        eye.class = "btn btn-primary"
    }
}

function ponerminuscula(letraminuscula) {
    return
    let ex = document.getElementById({letraminuscula});
    ex.value = ex.value.toLowerCase();
}


// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;
// module.exports = {ponerminuscula, mostrarContrasena, formatToString, ShowName};
//export {ponerminuscula, mostrarContrasena, formatToString, ShowName}