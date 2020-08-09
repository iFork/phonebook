
const express = require('express');

const persons = [
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
        res.status(404).json({error: "Person not found"});
    }
})

const port = 3001;
app.listen(port, () => {
    console.log(`Server listening to port ${port}...`);
})



