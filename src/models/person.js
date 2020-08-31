
const mongoose = require('mongoose');

// use dotenv to get env variables
const uri = process.env.MONGODB_URI;
console.log("connecting to", uri);
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(res => {
        // console.log("Connect result", res);
        console.log("Connect succeeded");
    });

const personSchema = new mongoose.Schema({
    name: String,
    number: String
});

//modify toJSON method to fit frontend needs and conventions
// id instead of _id, no __v property
personSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret, options) => {
        delete ret._id;
        return ret;
    }
})

// compile model (class / c-tor) on a schema
// > If you define a model with the name *Person*, mongoose will automatically
// name the associated collection as *people*.
module.exports = mongoose.model('Person', personSchema);

