const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/inspecobras', {
    // mongoose.connect(process.env.MONGODB_URI, { 
    // useCreateIndex: true,
    useNewUrlParser: true,
    // useFindAndModify: false
})
    .then(db => console.log('Base de Datos Conectada'))
    .catch(err => console.error(err));

    