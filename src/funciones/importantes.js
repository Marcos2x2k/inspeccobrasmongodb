



function ShowName() {
    var writtenName = document.getElementById('input_name').value;
    document.getElementById('input_name').value = formatToString(writtenName);
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

function ponerminuscula() {
    return
    let ex = document.getElementById("email");
    ex.value = ex.value.toLowerCase();
    //let y = document.getElementById("adrema");
    //y.value = y.value.toLowerCase();
}


module.exports = {ponerminuscula, mostrarContrasena, formatToString, ShowName};
//export {ponerminuscula, mostrarContrasena, formatToString, ShowName}