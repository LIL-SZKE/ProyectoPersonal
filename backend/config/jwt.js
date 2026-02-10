/**
 * CONFIGURACION DEL JWT
 * ESTE ARCHIVO CONTIENE FUNCIONES PARA GENERAR Y VERIFICAR TOKENS JWT
 * LOS JWT SE USAN PARA AUTENTICAR USUARIOS SIN NECESIDAD DE SESIONES 
 */

//Importar jsonwebtoken para manejar los tokens 
const jwt = require('jsonwebtoken');

//Importar dotenv para acceder a las variables de entorno
require('dotenv').config();

/**
 * GENERAR UN TOKEN JWT PARA UN USUARIO
 * 
 * @param {object} payload - Datos que se incluira en el token (id, email, rol)
 * @returns {String} - Token JWT generado
 * 
 */

const generarToken = (payload) => {
    try {
        //jwt.sing() crea y firma un token
        //Parametros:
        // 1. paylaod datos a incluir en token 
        // 2. secret: clave secreta para firmar (desde .env)
        // 3. options: opciones adicionales como tiempo de expiracion 
        const token = jwt.sing(payload, // datos de usuario
            process.env.JWT_SECRET, // Calve secreta desde .env 
            { expiresIN: process.env.JWT_EXPIRES_IN } // Tiempo de expiracion 


        );

        return token;
    } catch (error) {
        console.error('Error al generar token JWT:', error.message);
        throw new Error('Error al generar token de atutenticacion')

    }
};

/**
 * Verificar si un token es valido 
 * @param {String} token - Token JWT a verificar 
 * @returns {Object} - datos decodificados del token si es valido 
 * @throws {Error} - Si el token es valido o ha expirado 
 */

const verifyToken = (token) => {
    try {
        // jwt.verify verifica la firma del token y lo decodifica
        //parametros
        //1. token: El token JWT a verificar 
        //2. secret: la misma clave secreta usada para firmarlo 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded = jwt.verify(token, process.env.JWT_SECRET);

        return decoded;
    } catch (error){
        //diferentes tipos de errores
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token Expirado');
        } else if (error.name === 'Jsonwebtokenerror') {
            throw new Error('Token Invalido') 
        } else {
            throw new Error('Error al verificar token');
        }
    }
};


/**
 * Extraer el token del header autorizacion
 * El token viene en formato Bearertoken
 * 
 * @param {String} authHeader - >Header authorization de la peticion
 * 
 * @param {String|null} - token extraido o null si no existe 
 */

const extractToken = (authHeader) => {
    //Verifica que el header existe y empieza con "Bearder"
    if (authHeader && authHeader.startsWith('Bearer' )){
        //Extraer solo el token (quitar "Bearer")
        return authHeader.substring(7);
    }

    return null; // no se encuentra token valido

    //exportar la funciones para usarlas en otros archivos 
    module.exports = {
        generateToken,
        verifyToken,
        extractToken,
    };
}

