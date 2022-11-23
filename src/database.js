const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/inspecobras', {
    mongoose.connect('mongodb://localhost/Inspecobrasctes', {
// mongoose.connect(process.env.MONGODB_URI, { 
    // useCreateIndex: true,
    useNewUrlParser: true,
    // useFindAndModify: false
    })
    .then(db => console.log('Base de Datos Conectada',db.connection.host))
    .catch(err => console.error(err));

    