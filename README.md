## Project Setup
1. Klone dir dieses Repository
2. Navigiere lokal in das Repository/Verzeichnis
3. Wenn du in dem richtigen Verzeichnis/Ordner bist, dann führe folgenden Befehl aus
```bash
npm install
```
4. Jetzt sind alle projektspezifischen Abhäüngigkeiten auch bei dir installiert
5. Das kannst du kontrollieren, indem du guckst, ob in dem geklonten Verzeichnis ein Ordner mit dem Namen `node_modules` entstanden ist. 
6. Jetzt kannst du die API starten mit dem Befehl
```bash
node index.js
```
7. Achtung: Wenn du ein ständiges Nachladen haben willst bei Veränderungen, installiere dir zunächst nodemon mit `npm i -g nodemon` und führe die index.js mit dem folgenden Befehl aus:
```bash
nodemon index.js
```
## Database Setup
1. Öffne mysql in deiner Git Bash, indem du `mysql -u root -p` eingibst
2. Überprüfe, welche Datenbanken bei dir lokal liegen mit `SHOW DATABASES;`
3. Wir legen uns eine neue Datenbank an mit dem folgenden Befehl:
```sql
CREATE DATABASE todo_app;
```
Mit `SHOW DATABASES;` können wir das ganze überprüfen
4. Wir legen uns einen User mit den passenden Berechtigungen für die neue Datenbank an
```sql
CREATE USER 'todo_user'@'localhost' IDENTIFIED BY 'todo123!';
GRANT ALL PRIVILEGES ON todo_app.* TO 'todo_user'@'localhost';
FLUSH PRIVILEGES;
```
5. Wir erstellen die Tabelle mit dem folgenden Befehl
```sql
USE todo_app;
CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
Überprüfen kannst du das mit
```sql
USE todo_app;
SHOW TABLES;
```
6. Wir fügen Testdaten hinzu mit
```sql
INSERT INTO todos (title, completed, date) VALUES 
('waschen', true, '2025-07-15'),
('putzen', false, '2025-07-16');
```

Überprüfe das mit `SELECT * FROM todos;`