const ctrl = {};

const { Image } = require('../models');

const sidebar = require('../helpers/sidebar');




ctrl.index = async (req, res) => {
    //virtuals: true allows us to access virtuals
    const images = await Image.find().sort({timestamp: -1}).lean({virtuals: true}); //.lean() returns a json object instead of mongoose one
    let viewModel = {images: []};
    viewModel.images = images;
    viewModel = await sidebar(viewModel);
    console.log(viewModel);
    res.render('index', viewModel);
};

module.exports = ctrl; 