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

const filefilter = (req, file, cb) => {
    //Tipos mime permitidos para imagenes
    const allowedMimetypes = ['image/jpeg', 'image/png', 'image/gif'];



//verificar si el tipo de archivo esta en la lista permitida 
if (allowedMimetypes.includes(fileMimeTypes)) {
    cb(null, true); // archivo permitido 
    
} else {
    cb(new Error('Tipo de archivo no permitido'), false); // archivo no permitido
}};
/**
 * configurar multer con las opciones definidas
 */

const upload = multer ({
    storage: storage,
    filefilter: filefilter,
    limits: {
        //Limite de tamaño del archivo en bytes 
        //Por defecto 5MB (5 * 1024 * 1024 bytes)
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 
    }
});

/**
 * Funcion para eliminar el archivo del servidor
 * util cuando se actualiza o elimina el producto
 * 
 * @param {String} filename - nombre del archivo a eliminar
 * @returns {Boolean} - true si se elimino correctamente, false si hubo un error
 */

const deleteFile = (filename) => {
    try {
        //Construir la ruta completa del archivo
        const filePath = path.join(uploadPath, filename);
        //Verificar si el archivo existe antes de eliminarlo
        if (fs.existsSync(filePath)) {
            //Eliminar el archivo
            fs.unlinkSync(filePath);
            console.log(`Archivo eliminado: ${filename}`);
            return true;
    } else {
        console.log(`Archivo no encontrado: ${filename}`);
        return false;
    } 
}catch (error) {
        console.error(`Error al eliminar el archivo:`, error.message);
        return false;
}};

//exportar configuracion de multer y funcion de eliminacion
module.exports = {
    upload,
    deleteFile
};