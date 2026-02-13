/**
 * MODELO PRODUCTO
 * 
 * Define la tabla Subcategoria en la base de datos
 * Almacena las subcategorias de los productos
 */

// Importar DataTypes de sequelize
const { DataTypes } = require('sequelize');

// Importar instancia de sequelize
const { sequelize } = require('../config/database');

/**
 * Definir el modelo de Producto
 */
const Producto = sequelize.define('Producto', {

    // Campos de la tabla
    // Id Identificador unico (PRIMARY KEY)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre del producto no puede estar vacio'
            },
            len: {
                args: [2, 200],
                msg: 'El nombre debe tener entre 3 y 200 caracteres'
            }
        }
    },

    /**
     * Descripcion detallada del Producto
     */
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    //Precio del producto
    precio: {
        type: DataTypes.DECIMAL(10, 2),// hasta 99,999,999.99
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'El precio debe ser un numero decimal valido'
            },
            min: {
                args: [0],
                msg: 'El precio no puede ser negativo'
            }
        }
    },

     //Stock del producto cantidad disponible en inventario
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isInt: {
                msg: 'El stock debe ser un numero entero valido'
            },
            min: {
                args: [0],
                msg: 'El stock no puede ser negativo'
            }
        }
    },

    /**
     * Imagen nombre del archivo de la imagen 
     * Se guarda solo el nombre ejemplo: producto123.jpg
     * La ruta seria uploads/producto123.jpg
     */

    imagen: {
        type: DataTypes.STRING(255),
        allowNull: true,// la imagen puede ser opcional 
            validate: { 
                is: {
                    args: /\.(jpg|jpeg|png|gif)$/i,
                    msg: 'El archivo de imagen debe ser un formato valido (jpg, jpeg, png, gif)'    
                }
            }
    },
    
     /**
     * CategoriaId - ID de la categoria a la que pertenece (FOREIGN KEY)
     * Esta es la relacion con la tabla categoria
     */
    SubcategoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'subcategorias',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        validate: {
            notNull: {
                msg: 'Debe seleccionar una subcategoria'
            }
        }
    },

    /**
     * CategoriaId - ID de la categoria a la que pertenece (FOREIGN KEY)
     * Esta es la relacion con la tabla categoria
     */
    CategoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categorias',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        validate: {
            notNull: {
                msg: 'Debe seleccionar una categoria'
            }
        }
    },

    /**
     * Activo estado de la subcategoria
     * si es false la subcategoria y todos sus productos se ocultan
     */
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }

}, {

    // Opciones del modelo
    tableName: 'Productos',
    timestamps: true,

    /**
     * Indices compuestos para optimizar busquedas
     */
    indexes: [
        {
            // Indice para buscar Productos por subcategoria
            fields: ['SubcategoriaId']
        },
        {
            // Indice para buscar Productos por Categoria
            fields: ['CategoriaId']
        },
        {
        //Indice para buscar prodictos activos
        fields: ['activo']
        },
        {
            // Indice para buscar productos por nombre
            fields: ['nombre']
        },
    ],

    /**
     * Hooks acciones automaticas
     */
    hooks: {

        /**
         * BeforeCreate - Se ejecuta antes de crear un producto
         * Valida que la categoria y la subcategoria existan y esten activas
         */
        beforeCreate: async (producto, options) => {

            const Categoria = require('../Categoria');
            const Categoria = require('../Subcategoria');

            // Buscar categoria padre
            const categoria = await Categoria.findByPk(subcategoria.CategoriaId);

            if (!categoria) {
                throw new Error('La categoria seleccionada no existe');
            }

            if (!categoria.activo) {
                throw new Error('No se puede crear una subcategoria en una categoria inactiva');
            }

            // Buscar Subcategoria padre
            const Subcategoria = await Subcategoria.findByPk(producto.SubcategoriaId);

            if (!subcategoria) {
                throw new Error('La subcategoria seleccionada no existe');
            }

            if (!subcategoria.activo) {
                throw new Error('No se puede crear un producto en una subcategoria inactiva');
            }

            //validar que la subcategoria pertenezca a una categoria
            if (subcategoria.CategoriaId !== producto.CategoriaId) {
                throw new Error('La subcategoria seleccionada no pertenece a la categoria seleccionada');

        }
    },

    /**
     * beforeDestroy - Se ejecuta antes de eliminar un producto
     * Elimina la imagen del servidor si existe
     */

        beforeDestroy: async (producto, options) => {
            if (producto.imagen) {
                const { unlink } = require('../config/multer');
                // intenta eliminar la imagen del servidor 
                const eliminado = await deleteImage(producto.imagen);
                if (eliminado) {
                    console.log(`Imagen eliminada del servidor: ${producto.imagen}`);
                }
            }
        },
        
       }
    }
);


/**
 * Metodo para obtener la url completa de la imagen
 * 
 * @returns {string|null} - url de la imagen
 */
Producto.prototype.obtenerImagenUrl = function () {
    if (this.imagen) {
        return null;
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${this.imagen}`;
};

/**
 * metodo para verificar si hay stock disponible
 * @param {number} cantidad - cantiodad deseada
 * @return {boolean} - true si hay stock suficiente, false si no
 */
Producto.prototype.hayStock = function(cantidad = 3) {
    return this.stock >= cantidad;
};

/**
 * Metodo para reducir el stock
 * util para despeus de una venta 
 * @param {number} cantidad - cantidad a reducir
 * @return {Promise<void>} prducto actualizado 
 */

Producto.prototype.reducirStock = async function(cantidad) {
    if (this.hayStock(cantidad)) {
        throw new Error('Stock insufuciente');
    }
    this.stock -= cantidad;
    return await this.save();
};

// Exportar modelo Subcategoria
module.exports = Subcategoria;
