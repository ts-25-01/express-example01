// Wir importieren uns die Abhängigkeit express
// in python war das: import ... from ...
const express = require('express');
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// morgan als logging middleware importieren
const morgan = require('morgan');
const { createConnectionToDB } = require('./db.js');
const cors = require('cors');

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

// Middleware für Cors-Einrichtung
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
// app.use(cors({
//     "origin": "*",
//     "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
// }
// ))

// todos = [
//             { "id": 1, "title": "waschen", "completed": true, "date": "02.07.2025" },
//             { "id": 2, "title": "putzen", "completed": false, "date": "03.07.2025" }
//         ];

// Erste Route auf Wurzel /
app.get('/', (_req, res) => {
    res.send('<h1>Das ist meine erste Route in Express</h1>');
});

// Route auf /about
app.get('/about', (_req, res) => {
    res.send('Das ist die Über uns Seite');
});


// GET-Route - Alle Todos abrufen
app.get('/todos', async (_req, res) => {
    try {
        const connection = await createConnectionToDB();
        const [rows] = await connection.execute('SELECT * FROM todos;');
        await connection.end();
        res.status(200).json(rows);
    } catch (error) {
        console.error("Fehler beim Laden der Todos", error);
        res.status(500).json({ error: 'Fehler beim Laden der Todos' });
    }
});

// GET-Route - Einzelnes Todo abrufen
app.get('/todos/:id', async (req, res) => {
    try {
        // Konvertiere die übergebene ID als URL Parameter in einen Integer
        // und speichere das in eine Konstante id
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            console.error("Bitte übergib eine Zahl als id");
            return res.status(400).json({ error: "Ungültige ID" });
        };
        // Verbindung zur Datenbank herstellen
        const connection = await createConnectionToDB();
        // Frage die todos-Tabelle ab, filtere dabei nach der id
        const [rows] = await connection.execute('SELECT * FROM todos WHERE id = ?', [id]);
        // Beende die Verbindung
        await connection.end();
        // Early-Return: Sobald das todo nicht gefunden werden konnte, d.h. wenn die rows nur 0 lang sind
        // Schmeiß einen Fehler mit Statuscode 404 zurück
        // console.log(rows);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Todo nicht gefunden" });
        };
        // Schicke dir das gefundene Objekt zurück
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Fehler beim Laden der Todos", error);
        res.status(500).json({ error: 'Fehler beim Laden der Todos' });
    }
})

// POST-Route - neues Todo erstellen
app.post('/todos', async (req, res) => {
    try {
        // Hier wollen wir den Title, der im Body im JSON-Format verschickt wird, speichern in eine Konstante
        const { title } = req.body;
        // const extractedtitle = req.body.title;
        // Early Return für Titel ist leer
        if (!title) {
            return res.status(400).json({ error: "Titel ist erforderlich" })
        }
        const connection = await createConnectionToDB();
        const [result] = await connection.execute(
            'INSERT INTO todos (title) VALUES (?)',
            [title]);
        const [newTodo] = await connection.execute('SELECT * FROM todos WHERE id = ?', [result.insertId]);
        await connection.end();
        res.status(201).json(newTodo[0]);
    } catch (error) {
        console.error('Fehler beim Erstellen des Todos: ', error);
        res.status(500).json({ error: 'Fehler beim Erstellen des Todos' });
    }
})


// DELETE - Ein Todo entfernen
app.delete('/todos/:id', async (req, res) => {
    try {
        // Hole dir die ID aus den URL Parametern und caste sie in einen Integer
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            console.error("Bitte übergib eine Zahl als id");
            return res.status(400).json({ error: "Ungültige ID. Bitte gib eine gültie ID ein" });
        };
        const connection = await createConnectionToDB();
        const [rows] = await connection.execute('SELECT * FROM todos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Todo nicht gefunden" });
        };
        await connection.execute('DELETE FROM todos WHERE id = ?', [id]);
        await connection.end();
        res.status(200).json({ message: 'Todo wurde gelöscht' });
    } catch (error) {
        console.error('Fehler beim Löschen des Todos: ', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Todos' });
    }
})

// PUT-Route - Todo aktualisieren
app.put('/todos/:id', async (req, res) => {
    try {
        // Parse übergebene ID in Integer
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            console.error("Bitte übergib eine Zahl als id");
            return res.status(400).json({ error: "Ungültige ID" });
        };
        // Suche dir die übergebenen Felder aus dem mitgeschickten Body raus
        const { title, completed } = req.body;
        // Überprüfe, ob title oder completed überhaupt übergeben werden..
        if (title === undefined && completed === undefined) {
            return res.status(400).json({ error: "Kein Feld zum Aktualisieren gefunden" });
        }
        // Verbinde dich mit der Datenbank
        const connection = await createConnectionToDB();
        // Suche todo mit der übergebenen ID
        const [rows] = await connection.execute('SELECT * FROM todos WHERE id = ?', [id]);
        // Falls id nicht vorhanden
        if (rows.length === 0) {
            return res.status(404).json({ error: "Todo nicht gefunden" });
        };
        // UPDATE-Query, das wir dynamisch setzen wollen, je nachdem was mitgeschickt wird
        let updateQuery = 'UPDATE todos SET ';
        let updateValues = [];

        // Falls Titel aktualisiert werden soll:
        if (title !== undefined) {
            updateQuery += 'title = ?,';
            updateValues.push(title);
        }

        // Falls completed aktualisiert werden soll:
        if (completed !== undefined) {
            updateQuery += 'completed = ?,';
            updateValues.push(completed);
        }

        // Ergänze unser SQL-Query, um den Filter für die id
        // UPDATE todos SET title = ?, completed = ?,
        updateQuery = updateQuery.slice(0, -1);
        // UPDATE todos SET title = ?, completed = ?
        updateQuery += ' WHERE id = ?';
        updateValues.push(id);
        console.log(updateQuery);
        console.log(updateValues);
        await connection.execute(updateQuery, updateValues);
        // UPDATE todos SET title = ? WHERE id = ?, [title, id]
        // Hole dir aktualisiertes Objekt aus der Datenbank
        const [updatedTodo] = await connection.execute('SELECT * FROM todos WHERE id = ?', [id]);
        await connection.end();
        res.status(200).json(updatedTodo[0]);

    } catch (error) {
        console.error("Fehler beim Aktualisieren der Todos", error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren der Todos' });
    }
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