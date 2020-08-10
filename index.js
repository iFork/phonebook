
const express = require('express');
const morgan = require('morgan');

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Marko",
      "number": "060-123-890",
      "id": 4
    }
];

const app = express();

// Logging
app.use(morgan('tiny'));

app.get('/', (req,res) => {
    res.send("<h1>Hello world</h1>");
});

app.get('/info', (req,res) => {
    const msg = 
    `<p>Phonebook contains info for ${persons.length} people.</p>
    <p>${new Date()}</p>` ;
    res.send(msg);
});

app.get('/api/persons', (req,res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req,res) => {
    const id = Number(req.params.id);
    const person = persons.find(p => p.id === id);
    if (person) {
        res.json(person);
    }
    else {
        res.status(404).end();
    }
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

const port = 3001;
app.listen(port, () => {
    console.log(`Server listening to port ${port}...`);
})



