// Ich muss erstmal meine Bibliothek mysql2 importieren
const mysql2 = require('mysql2/promise');

// Einrichtung der DB-Verbindung
const dbConfig = {
    host: 'localhost',
    user: 'todo_user',
    password: 'todo123!',
    database: 'todo_app'
}

// Funktion zum Testen der Verbindung
async function createConnectionToDB(){
    try {
        const connection = await mysql2.createConnection(dbConfig);
        console.log('Datenbankverbindung erfolgreich!');
        return connection;
    } catch (error) {
        console.error('Datenverbindung fehlgeschlagen', error.message);
    }
}

// Rufe die Verbindungsfunktion auf
async function testConnection(){
    try {
        const connection = await createConnectionToDB();
        const [rows] = await connection.execute('SELECT * FROM todos;');
        console.log('Todos aus der DB', rows);
        await connection.end();
    } catch (error) {
        console.error('Fehler', error.message);
    }
}

// testConnection();

module.exports = { createConnectionToDB };