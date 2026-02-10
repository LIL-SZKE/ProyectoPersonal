//** Configuración de la base de datos */

//importar Sequelize
const { Sequelize } = require('sequelize');

//importar dotenv para cargar variables de entorno
require('dotenv').config();

//crear instacias de secualize
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER,
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',

        //configuraciones de pool de conexiones
        //mantiene las conexiones abiertas para mejorar el rendimiento
        pool: {
            max: 5,
            min: 0,
            acquire: 30000, 
            idle: 10000 
        },

        //configuración de logging
        //perimite ver las consultas de mysql por consola
        logging: process.env.NODE_ENV === 'development' ? console.log : false,

        //Zone horaria
        timezone: '-05:00',//Zona horaria de Colombia

        //opcines adiconales
        define: {
            //agrega campos createdAt y updatedAt
            timestamps: true, 

            //underscored: true usa snake_case para los nombres de las columnas
            underscored: false, 

            //frazetableName: true usa el nombre del modelo tal cual para la tabla
            freezeTableName: true
        }
    }
);

/* Funcion para probar la conexión a la base de datos 
esta funcion se llamara al inciar el servidor   
*/

const testConnection = async () => {
    try {
        //Implementar auntenticar con la base de datos
        await sequelize.authenticate();
        console.log('Conexión a MySQL establecida correctamente');
        return true;

    } catch (error) {
        console.error('Error al conectar a MySQL:', error.message);
        console.error('Verifica que XAMPP esté corriendo y que las credenciales en .env sean correctas');
        return false;
    }
}

const syncDatabase = async (force = false, alter = false) => {
try{
    await sequelize.sync ({force, alter});
    if(force){
        console.log('DB Sincronizada');
    } else if (alter) {
        console.log('db sincronizada');
    } else {
        console.log('db sincronizadas');
    }

    return true;
} catch (error) {
    console.error('x error al sincronizar la db:', error.message)
}
};

//exportar la instanciade sequelize y las funciones 
module.exports = {
    sequelize,
    testConnection,
    syncDatabase
}