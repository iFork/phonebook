const mongoose = require('mongoose');


const argc = process.argv.length;
const usage = "Usage: node <this file> <password> [<name> <number>]"

// Terminate on argument count mismatch
if (!(argc === 3 || argc === 5)) {
    console.log(`Argument mismatch. ${usage}`);
    process.exit(1);
}

// mongodb connection string
const password = process.argv[2];
const user = 'fso';
const dbname = 'phonebook-app';
const uri = `mongodb+srv://${user}:${password}@cluster0.ubqcg.mongodb.net/`
            + `${dbname}?retryWrites=true&w=majority`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(res => {
        // console.log("Connect result", res);
        console.log("Connect succeeded");
    });

const personSchema = new mongoose.Schema({
    name: String,
    phone: String
});

// compile model (class / c-tor) on a schema
// > If you define a model with the name *Person*, mongoose will automatically
// name the associated collection as *people*.
const Person = mongoose.model('Person', personSchema);


const addPerson = (name, phone) => {
    const person = new Person({
        name,
        phone
    });
    person.save().then(result => {
        console.log("Added", result.name, result.phone, "to phonebook");
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
            people.forEach(person => console.log(person.name, person.phone));
            mongoose.connection.close().then(() => {
                console.log("Connection closed");
            });
        })
        .catch(err => console.log("Find rejected with ", err));
}

switch (argc) {
    case 3:
        //Fetch all
        getAll();
        break;
    case 5:
        //Add contact 
        const name = process.argv[3];
        const phone = process.argv[4];
        addPerson(name, phone);
        break;
    default:
        console.log(`Argument mismatch. ${usage}`);
        process.exit(1);
}

