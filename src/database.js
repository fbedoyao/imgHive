const mongoose = require("mongoose");

const { database } = require('./keys'); //restructuring in js

mongoose.connect(database.URI, {
    useNewUrlParser: true
})
    .then(db => console.log('DB is connected'))
    .catch(err => console.error(err))