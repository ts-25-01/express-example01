// Wir importieren uns die Abhängigkeit express
// in python war das: import ... from ...
const express = require('express');
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// morgan als logging middleware importieren
const morgan = require('morgan');

const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Todo Express App",
            version: "1.0.0",
            description: "This is a first example of a Todo Express App with local storage"
        },
    //     servers: [
    //   {
    //     url: "http://localhost:3000",
    //   },
    // ],
    },
    apis: [__filename]
}

const specs = swaggerJsdoc(options);
// Wir instanziieren uns ein app-Objekt von express
const app = express();

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);


// Nutze Middleware, damit Express den Body von JSON-POST-Request korrekt lesen kann
app.use(express.json());

// Middleware für das Logging
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url} mit ${res.statusCode}`);
//     next();
// })

// morgan Middleware zum Loggen
app.use(morgan('dev'));

todos = [
            { "id": 1, "title": "waschen", "completed": true, "date": "02.07.2025" },
            { "id": 2, "title": "putzen", "completed": false, "date": "03.07.2025" }
        ];

// Erste Route auf Wurzel /
app.get('/', (_req, res) => {
    res.send('<h1>Das ist meine erste Route in Express</h1>');
});

// Route auf /about
app.get('/about', (_req, res) => {
    res.send('Das ist die Über uns Seite');
});


// GET-Route - Alle Todos abrufen
app.get('/todos', (_req, res) => {
    res.status(200).json(todos); 
});

// GET-Route - Einzelnes Todo abrufen
app.get('/todos/:id' , (req, res) => {
    // Konvertiere die übergebene ID als URL Parameter in einen Integer
    // und speichere das in eine Konstante id
    const id = parseInt(req.params.id);
    // Suche in dem todos-Array nach dem Objekt, das denselben Wert für die id hat
    // wie die übergebene id in den URL-Parametern
    const todo = todos.find(t => t.id === id);
    // console.log(todo);
    // Early-Return: Sobald das todo nicht gefunden werden konnte
    // Schmeiß einen Fehler mit Statuscode 404 zurück
    if (!todo){
        return res.status(404).json({error: "Todo nicht gefunden"});
    };
    // Falls todo gefunden werden konnte, gib Code 200 zurück, sowie das gefundene Objekt im JSON-Format
    res.status(200).json(todo);
})

// POST-Route - neues Todo erstellen
app.post('/todos', (req, res) => {
    // Hier wollen wir den Title, der im Body im JSON-Format verschickt wird, speichern in eine Konstante
    const { title } = req.body;
    // Early Return für Titel ist leer
    if (!title){
        return res.status(400).json({error: "Titel ist erforderlich"})
    }
    // NewTodo müssen wir konstruieren als neues Objekt
    // console.log(todos[todos.length - 1]);
    const newTodo = {
        id: todos[todos.length - 1].id + 1,
        title: title,
        completed: false,
        date: new Date().toISOString()
    }
    // console.log(newTodo);
    // Hier fügen wir das neue Todo dem Array hinzu
    todos.push(newTodo);
    res.status(201).json(newTodo);
})


// DELETE - Ein Todo entfernen
app.delete('/todos/:id', (req,res) => {
    // Hole dir die ID aus den URL Parametern und caste sie in einen Integer
    const id = parseInt(req.params.id);
    // Finde den Index von dem Element, wo die Bedingung wahr ist
    const todoIndex = todos.findIndex(t => t.id === id);
    // Falls nicht gefunden, schmeiße einen Fehler
    // Wir überprüfen auf -1, da findIndex -1 zurückgibt wenn nicht gefunden
    if (todoIndex === -1){
        return res.status(404).json({error: "Todo nicht gefunden"});
    };
    // Lösche aus dem todos-Array, das Element an dem Index todoIndex
    todos.splice(todoIndex, 1);
    res.status(200).json({ message: "Todo wurde gelöscht"});
    // Alternative: nur 204 als Statuscode ohne Message zurückgeben
    // res.status(204).send();

})

// PUT-Route - Todo aktualisieren
app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    if (!todo){
        return res.status(404).json({error: "Todo nicht gefunden"});
    };
    const { title, completed } = req.body;
    if (title !== undefined){
        todo.title = title;
    }
    if (completed !== undefined){
        todo.completed = completed;
    }

    res.status(200).json(todo);
})

// ... weitere Routen hier rein

// Server starten
app.listen(3000, () => {
    console.log("Server läuft auf http://localhost:3000");
})


/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: waschen
 *         completed:
 *           type: boolean
 *           example: true
 *         date:
 *           type: string
 *           format: date
 *           example: "02.07.2025"
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Startseite
 *     responses:
 *       200:
 *         description: Gibt die Startseite zurück
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */

/**
 * @swagger
 * /about:
 *   get:
 *     summary: Über uns Seite
 *     responses:
 *       200:
 *         description: Gibt die Über uns Seite zurück
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Gibt alle Todos zurück
 *     responses:
 *       200:
 *         description: Eine Liste aller Todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *   post:
 *     summary: Erstellt ein neues Todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "einkaufen"
 *     responses:
 *       201:
 *         description: Das erstellte Todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Titel ist erforderlich
 */

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Gibt ein einzelnes Todo anhand der ID zurück
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID des Todos
 *     responses:
 *       200:
 *         description: Gefundenes Todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo nicht gefunden
 *   put:
 *     summary: Aktualisiert ein Todo anhand der ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID des Todos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Aktualisiertes Todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo nicht gefunden
 *   delete:
 *     summary: Löscht ein Todo anhand der ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID des Todos
 *     responses:
 *       200:
 *         description: Todo wurde gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todo wurde gelöscht"
 *       404:
 *         description: Todo nicht gefunden
 */