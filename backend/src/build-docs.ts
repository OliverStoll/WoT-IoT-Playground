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
    apis: ['./app.ts', './routes/*.ts'], // Add all routes
};

// Generate Swagger specification
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Save file as JSON
const docsOutputPath: string = path.join(__dirname, 'api-docs.json');
fs.writeFileSync(docsOutputPath, JSON.stringify(swaggerSpec, null, 2));

console.log('Swagger documentation generated and saved');
