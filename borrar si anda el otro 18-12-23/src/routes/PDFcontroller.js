module.exports = {
    
factura (req, res) {
    res.render('view/pdfs/factura', { layouts: "pdf"})
}
}