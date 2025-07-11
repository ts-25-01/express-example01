// Wir importieren uns die Abhängigkeit express
// in python war das: import ... from ...
const express = require('express');

// Wir instanziieren uns ein app-Objekt von express
const app = express();

todos = [
            { "title": "waschen", "completed": true, "date": "02.07.2025" },
            { "title": "putzen", "completed": false, "date": "03.07.2025" }
        ];

// Erste Route auf Wurzel /
app.get('/', (request, response) => {
    response.send('<h1>Das ist meine erste Route in Express</h1>');
});

// Route auf /about
app.get('/about', (request, response) => {
    response.send('Das ist die Über uns Seite');
});


// Route auf /about
app.get('/todos', (request, response) => {
    response.json(todos); 
});


// ... weitere Routen hier rein

// Server starten
app.listen(3000, () => {
    console.log("Server läuft auf http://localhost:3000");
})
