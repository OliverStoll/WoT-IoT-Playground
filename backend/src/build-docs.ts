import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

// Swagger options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API-Dokumentation',
            version: '1.0.0',
        },
    },
    apis: ['./app.ts', './routes/*.ts'], // Passe den Pfad zu deiner app.ts-Datei an
};

// Swagger-Spezifikation generieren
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Speichere die Swagger-Dokumentation als JSON-Datei
const docsOutputPath: string = path.join(__dirname, 'api-docs.json');
fs.writeFileSync(docsOutputPath, JSON.stringify(swaggerSpec, null, 2));

console.log('Swagger-Dokumentation generiert und gespeichert.');
