const path = require('path');
const {randomNumber} = require('../helpers/libs');
const fs = require('fs-extra');
const md5 = require('md5');

const {Image, Comment} = require('../models/index');
const { json, redirect } = require('express/lib/response');

const sidebar = require('../helpers/sidebar');

const ctrl = {};

ctrl.index = async (req, res) => {
    let viewModel = {image: {}, comments: {}};

    const image2 = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image2){
        image2.views +=1;
        await image2.save(); //save function works in mongoose objects. when using lean(), mongoose object becomes json object
        const image = await Image.findOne({filename: {$regex: req.params.image_id}}).lean({virtuals:true});
        viewModel.image = image;
        const comments = await Comment.find({image_id: image._id}).lean();
        viewModel.comments = comments;
        viewModel = await sidebar(viewModel);
        res.render('image', viewModel);
    } else{
        res.redirect('/')
    }
};

ctrl.create = (req, res) => {

    const saveImage = async () => {
        const imgUrl = randomNumber();
        const images = await Image.find({filename : imgUrl});
    
        if(images.length > 0){
            saveImage();
        } else{
            console.log(imgUrl);
            const imageTempPath = req.file.path;
            const ext = path.extname(req.file.originalname).toLowerCase();
            const targetPath = path.resolve(`src/public/upload/${imgUrl}${ext}`);
        
            if(ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp'){
                await fs.rename(imageTempPath, targetPath) //rename function changes the path of a file ("moves" a file)
                const newImg = new Image({
                    title: req.body.title,
                    filename: imgUrl + ext,
                    description: req.body.description
                });
                const imageSaved = await newImg.save();
                //res.redirect('/images');
                res.redirect('/images/' + imgUrl);
            } else{
                await fs.unlink(imageTempPath);
                res.status(500).json({error: 'Only images are allowed'});
            }
        }
    };
    saveImage();
};




ctrl.like = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image){
        image.likes += 1;
        await image.save();
        res.json({likes : image.likes});

    }else{
        res.status(500).json({error: 'Internal Error'});
    }
};

ctrl.comment = async (req, res) => {

    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image){
        const newComment = new Comment(req.body);
        newComment.gravatar = md5(newComment.email);
        newComment.image_id = image._id;
        await newComment.save();
        res.redirect('/images/' + image.uniqueId);
    } else {
        res.redirect('/');
    }
  
};

ctrl.remove = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if (image) {
        await fs.unlink(path.resolve('./src/public/upload/' + image.filename));
        await Comment.deleteOne({image_id: image._id});
        await image.remove();
        res.json(true);
    }
};

module.exports = ctrl;