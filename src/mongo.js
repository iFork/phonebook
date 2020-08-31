// use dotenv also here, as this can be run on its own
require('dotenv').config();

const Person = require('./models/person');
// need mangoose also here, to be able to close connection 
// and terminate this CL utility (as this is run not as a server).
const mongoose = require('mongoose');

const argc = process.argv.length;
// const usage = "Usage: node <this file> <password> [<name> <number>]"
const usage = "Usage: node <this file> [<name> <number>]"

const argcBaseCase = 2;
const argcAddPerson = 4;
// Terminate on argument count mismatch
if (!(argc === argcBaseCase || argc === argcAddPerson)) {
    console.log(argc);
    console.log(`Argument mismatch. ${usage}`);
    process.exit(1);
}


const addPerson = (name, number) => {
    const person = new Person({
        name,
        number
    });
    person.save().then(result => {
        console.log("Added", result.name, result.number, "to phonebook");
        mongoose.connection.close()
            .then(() => console.log("Connection closed"));
    })
}

const getAll = () => {
    console.log("Phonebook contacts:");
    // NOTE: when connection.close() is on its own, outside (after)
    // the .then(..) promise handler, it is executed without waiting the 
    // return of query.
    // > In that case *mongoose.connection.close()* command will get
    // > executed immediately after the *Person.find* operation is started. This
    // > means that the database connection will be closed immediately, and the
    // > execution will never get to the point where *Person.find* operation
    // > finishes and the *callback* function gets called. 
    // In that case we get 'MongoError: Topology is closed, please connect'). 
    // Only after rejecting query, connection success handler is reached, 
    // then connection.close() is reached (from the commands buffer).
    // Flow: connection is opened, query has started, then connection closed,
    // (so query does not return), then connect() and connection.close() fulfillment
    // callbacks are reached and print the messages.
    Person.find({})
        .then(people => {
            people.forEach(person => console.log(person.name, person.number));
            mongoose.connection.close().then(() => {
                console.log("Connection closed");
            });
        })
        .catch(err => console.log("Find rejected with ", err));
}

switch (argc) {
    case argcBaseCase:
        //Fetch all
        getAll();
        break;
    case argcAddPerson:
        //Add contact 
        const name = process.argv[2];
        const number = process.argv[3];
        addPerson(name, number);
        break;
    default:
        console.log(`Argument mismatch. ${usage}`);
        process.exit(1);
}

