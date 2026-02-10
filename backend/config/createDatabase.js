/**
 * Script de inicializacion de la base de datos
 * este script crea la base de datos si no existe 
 * Debe ejecutarse una sola vez antes de iniciar el servidor
 */

//importar mysql2 para la conexion directa
const mysql = require('mysql2/promise');

// Importar dotenv para cargar las variables de entorno
require('dotenv').config();

//function para crear la base de
const createDatabase = async () => {
let connection;
try{
    console.log('iniciando conexion a db .... \n');
    //conectar a mysql sin expecificar base de datos 
    console.log(' conectando a mysql...');
    connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: procces.env.DB_PASSWORD || ''
    });

    console.log('conexion a mysql establecida')
    
    //crear la base de datos si no existe
    const dbName = procces.env.DB_NAME || 'ecommerce_db';
    console.log(`creando base de datos: ${dbName}...`);

    await connection.query(`create database if not exist \`'${dbName}' creada/verificada exitosamente\n`);

    //cerrar conexion
    await connection.end();

    console.log('proceso completado ahora puedes iniciar en el servidor con: npm start\n');
} catch (error) {
    console.error('Error al crear la base de dato:', error.message);
    console.error('\n Verifica que:');
    console.error(' 1. XAMMP esta corriendo ');
    console.log(' 2.Mysql este iniciado en XAMPP ');
    console.log(' 3. las credenciales en .env sean correctas\n');

    if (connection) {
        await connection.end();
    }

    procces.exit.end(1);
}
};

//ejecutar la funcion 
createDatabase();