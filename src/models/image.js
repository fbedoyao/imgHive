const mongoose = require('mongoose');
const { Schema } = mongoose;
const path = require('path');

const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

var schemaOptions = {
    toObject: {
      virtuals: true,
      getters: true
    }
    ,toJSON: {
      virtuals: true,
      getters: true
    }
  };

const ImageSchema = new Schema({
    title: { type: String },
    description: { type: String },
    filename: { type: String },
    views: { type: Number, default: 0},
    likes: { type: Number, default: 0},
    timestamp: { type: Date, default: Date.now }
}, schemaOptions);

ImageSchema.virtual('uniqueId')
    .get(function () {
        return this.filename.replace(path.extname(this.filename), '');
    });

ImageSchema.plugin(mongooseLeanVirtuals); //allows accessing to virtuals





module.exports = mongoose.model('Image', ImageSchema);