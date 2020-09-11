/* eslint-disable no-console */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// configure per deprecation warning
mongoose.set('useFindAndModify', false);
// following is needed for mongoose-unique-validator
mongoose.set('useCreateIndex', true);

// use dotenv to get env variables
const uri = process.env.MONGODB_URI;
console.log('connecting to', uri);
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((_res) => {
        // console.log("Connect result", res);
        console.log('Connect succeeded');
    });

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        unique: true,
    },
    number: {
        type: String,
        minlength: 8,
        required: true,
    },
});

// plug uniqueValidator
personSchema.plugin(uniqueValidator);

// modify toJSON method to fit frontend needs and conventions
// id instead of _id, no __v property
personSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret, _options) => {
        // eslint-disable-next-line no-underscore-dangle
        delete ret._id;
        return ret;
    },
});

// compile model (class / c-tor) on a schema
// > If you define a model with the name *Person*, mongoose will automatically
// name the associated collection as *people*.
module.exports = mongoose.model('Person', personSchema);
