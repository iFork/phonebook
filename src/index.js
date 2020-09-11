/* eslint-disable no-console */
require('dotenv').config();
// for checking mongoose error types
const mongoose = require('mongoose');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// mongoose models
const Person = require('./models/person');

const app = express();

// enable cross-origin resource sharing
app.use(cors());

// Logging
// app.use(morgan('tiny'));
morgan.token('reqBody', (req, _res) => JSON.stringify(req.body));
// this works due to express.json() middleware initilaizing req.body property
// (see below) with object parsed from request body, effective for POST requests.
// Note that :req.body or :req['body'] are not existing format tokens for morgan.
const format = ':method :url :status :res[content-length] - :response-time ms :reqBody';
app.use(morgan(format));

// serve static pages of frontend
app.use(express.static('build'));

app.get('/info', (_req, res, next) => {
    const count = Person.countDocuments({}).exec();
    count.then((returned) => {
        const msg = `<p>Phonebook contains info for ${returned} people.</p>
        <p>${new Date()}</p>`;
        res.send(msg);
    })
        .catch((err) => next(err));
});

app.get('/api/persons', (_req, res, next) => {
    Person.find({})
        .then((persons) => {
            res.json(persons);
        })
        .catch((err) => next(err));
});

app.get('/api/persons/:id', (req, res, next) => {
    const { id } = req.params;
    Person.findById(id)
        .orFail()
        .then((person) => {
            res.json(person);
        })
        .catch((err) => next(err));
});

app.delete('/api/persons/:id', (req, res, next) => {
    const { id } = req.params;
    // Person.findOneAndRemove({_id: id})
    Person.findByIdAndRemove(id)
    // Note: bug reported, issue #9381
    // orFail() does not work with findByIdAndRemove
        // .orFail()
        .then((deletedPerson) => {
            // since orFail() does not work
            if (deletedPerson) {
                console.log('deleted:', deletedPerson);
                return res.status(204).end();
            }
            return res.status(404).end();
        })
        .catch((err) => next(err));
});

app.use(express.json());
app.post('/api/persons', (req, res, next) => {
    const { body } = req;
    // following checks are moved to validator
    // if(!body.name) {
    //     return res.status(400).json({error: "Name missing"});
    // }
    // if(!body.number) {
    //     return res.status(400).json({error: "Number missing"});
    // }
    // if(persons.find(p => p.name === body.name)) {
    //     console.log(body.name, "exists");
    //     return res.status(400).json({error: "Name must be unique"});
    // }
    const person = new Person({
        name: body.name,
        number: body.number,
    });
    person.save()
        .then((savedPerson) => res.json(savedPerson))
        .catch((err) => next(err));
});

app.put('/api/persons/:id', (req, res, next) => {
    const { id } = req.params;
    const { body } = req;
    const opts = {
        new: true, // return updated doc, by default old is returned
        runValidators: true, // validators, by default, run only after save()
    };
    Person.findByIdAndUpdate(id, { $set: { number: body.number } }, opts)
        .orFail()
        .then((updatedPerson) => {
            res.json(updatedPerson);
        })
        .catch((err) => next(err));
});

const errorHandler = (err, _req, res, next) => {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(404).json({ error: 'Document Not Found' });
    }
    if (err instanceof mongoose.Error.CastError) { // or err.name === 'CastError'
        return res.status(400).json({ error: 'Cast Error, Malformatted id' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
        // return res.status(400).json({error: err});
    }
    return next(err);
};
app.use(errorHandler);

// get Heroku port or our preferred port for localhost
// const port = process.env.PORT || 3001;
// now using dotenv
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server listening to port ${port}...`);
});
