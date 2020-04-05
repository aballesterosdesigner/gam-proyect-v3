const indexCtrl = {};

indexCtrl.renderIndex = (req, res) => {
    res.redirect('/signin');
};

module.exports = indexCtrl;
