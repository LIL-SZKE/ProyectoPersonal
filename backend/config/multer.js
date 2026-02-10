/**
 * Configuracion de subida de archivos 
 * 
 * multer es un middleware para ,anejar la subida de archivos 
 * este archivo configura como y donde se guardan la imagenes subidas  
 */

// importar multer para manejo de archivos 
const multer = require('multer ');

//importar path para trabajar con rutas de archivos 
const path = require(' path ');

//Importar fs para verificar /crear directorios 
const fs = require('fs')
// importar dotenv para varuiables de entorno 
require('dotenv').config();

//obtener la ruta donde se guardan los archivos 
const uploadPath = process.env.UPLOAD_PATH || './uploads';

//verificar si la carpeta uploads existe, si no crearla 
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {recursive: true });
    console.log(`carpeta ${uploadPath} creada`);

}

/**
 * Configuracion de almacenamiento de multer 
 * Define donde y como se guardan los archivos 
 */

const storage = multer.diskStorage({
    /**
     * Destination: define la carpeta destino donde se guarda el archivo 
     * 
     * @param {Object} req - Objeto de peticion HTTP
     * @param {Object} file - archivo que esta subiendo 
     * @param {Function} cb - Callback que se llama con (error, destination)
     */
    destination: function (req, file, cb) {
        // cb(null, ruta) -> sin error, ruta = carpeta destino
        cb(null, uploadPath);
    },

    /**
     * filename: define el nombre con el que se guarda el archivo
     * formato: timeslap-nombreoriginal.ext
     * 
     * @param {Object} req - Objeto de peticion HTTP
     * @param {Object} file - archivo que se esta subiendo
     * @param {Function} cb - caliback que se llama con (error, filename)
     */

    filename: function (req, file, cb) {
        //generar nombre unico usando timestamp + nombre original
        //date.now() genera un timestamp unico
        //path.extname() extrae la extencion del archivo (.jpg, .png, etc)
        const uniqueName = Date.now() + '-' + file. originalname;
        cb(null, uniqueName);
    }
});

/**
 * Filtro para validar el tipo de archivo 
 * solo permite imagenes (.jpg, .jpeg, .png, gif)
 * 
* @param {Object} req - Objeto de peticion HTTP
* @param {Object} file - archivo que se esta subiendo
* @param {Function} cb - caliback que se llama con (error, filename)
 */