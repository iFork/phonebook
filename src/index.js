
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
//mongoose models
const Person = require('./models/person');

const app = express();

//enable cross-origin resource sharing 
app.use(cors());

// Logging
// app.use(morgan('tiny'));
morgan.token('reqBody', (req,res) => JSON.stringify(req.body));
    // this works due to express.json() middleware initilaizing req.body property 
    // (see below) with object parsed from request body, effective for POST requests.
    // Note that :req.body or :req['body'] are not existing format tokens for morgan.
const format = ':method :url :status :res[content-length] - :response-time ms :reqBody';
app.use(morgan(format));

//serve static pages of frontend
app.use(express.static('build'));

// app.get('/', (req,res) => {
//     res.send("<h1>Hello world</h1>");
// });

app.get('/info', (req,res) => {
    const msg = 
    `<p>Phonebook contains info for ${persons.length} people.</p>
    <p>${new Date()}</p>` ;
    res.send(msg);
});

app.get('/api/persons', (req,res) => {
    Person.find({})
        .then(persons => {
            res.json(persons);
        })
        .catch(err => {
            console.log("error in find all:", err.message);
            res.status(500).end();
        });
});

app.get('/api/persons/:id', (req,res) => {
    // const id = Number(req.params.id);
    const id = req.params.id;
    // const person = persons.find(p => p.id === id);
    Person.findById(id)
        .then(person => {
            if (person) res.json(person);
            else {
                console.log("id not found");
                res.status(404).end();
            }
        })
        .catch(err => {
            console.log("error in foundById:", err.message);
            res.status(404).end();
        });
});

app.delete('/api/persons/:id', (req,res) => {
    const id = Number(req.params.id);
    persons = persons.filter(p => p.id !== id);
    res.status(204).end();
});

const generateId = () => {
    const upperBound = 500;
    const lowerBound = 1;
    return Math.floor(lowerBound + (Math.random() * (upperBound - lowerBound)));
};

app.use(express.json());
app.post('/api/persons', (req,res) => {
    const body = req.body;
    if(!body.name) {
        return res.status(400).json({error: "Name missing"});
    }
    if(!body.number) {
        return res.status(400).json({error: "Number missing"});
    }
    if(persons.find(p => p.name === body.name)) {
        console.log(body.name, "exists");
        return res.status(400).json({error: "Name must be unique"});
    }
    const person = {
      name:   body.name,
      number: body.number,
      id:     generateId()
    };
    persons.push(person);
    res.json(person);
});

//get Heroku port or our preferred port for localhost
// const port = process.env.PORT || 3001;
// now using dotenv
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server listening to port ${port}...`);
})



