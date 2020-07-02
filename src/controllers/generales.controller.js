const ctrl = {};
ctrl.goToAndLog = (req,res,type,txt,ruta)=>{
    req.flash(type,txt);
    res.redirect(ruta);
}

module.exports = ctrl;