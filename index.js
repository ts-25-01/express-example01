// Wir importieren uns die Abhängigkeit express
// in python war das: import ... from ...
const express = require('express');

// Wir instanziieren uns ein app-Objekt von express
const app = express();

todos = [
            { "id": 1, "title": "waschen", "completed": true, "date": "02.07.2025" },
            { "id": 2, "title": "putzen", "completed": false, "date": "03.07.2025" }
        ];

// Erste Route auf Wurzel /
app.get('/', (request, response) => {
    response.send('<h1>Das ist meine erste Route in Express</h1>');
});

// Route auf /about
app.get('/about', (request, response) => {
    response.send('Das ist die Über uns Seite');
});


// GET-Route - Alle Todos abrufen
app.get('/todos', (request, response) => {
    response.status(200).json(todos); 
});

// GET-Route - Einzelnes Todo abrufen
app.get('/todos/:id' , (request, response) => {
    const id = parseInt(request.params.id);
    const todo = todos.find(t => t.id === id);
    console.log(todo);
    if (!todo){
        return response.status(404).json({"error": "Todo nicht gefunden"});
    };
    response.status(200).json(todo);
})


// ... weitere Routen hier rein

// Server starten
app.listen(3000, () => {
    console.log("Server läuft auf http://localhost:3000");
})
