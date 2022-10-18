const express = require('express')
const router = express.Router()


router.get('/', (req, res) => {
    res.render('index'); //index.hbs
});

router.get ('/about', (req, res) =>{
    res.render('about') //about.hbs
})

module.exports = router;
