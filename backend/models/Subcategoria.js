/**
 * MODELO SUBCATEGORIA
 * 
 * Define la tabla Subcategoria en la base de datos
 * Almacena las subcategorias de los productos
 */

// Importar DataTypes de sequelize
const { DataTypes } = require('sequelize');

// Importar instancia de sequelize
const { sequelize } = require('../config/database');

/**
 * Definir el modelo de Subcategoria
 */
const Subcategoria = sequelize.define('Subcategoria', {

    // Campos de la tabla
    // Id Identificador unico (PRIMARY KEY)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre de la subcategoria no puede estar vacio'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    },

    /**
     * Descripcion de la subcategoria
     */
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    tableName: 'subcategorias',
    timestamps: true,

    /**
     * Indices compuestos para optimizar busquedas
     */
    indexes: [
        {
            // Indice para buscar subcategorias por categoria
            fields: ['CategoriaId']
        },
        {
            // Indice compuesto: Nombre unico por categoria
            unique: true,
            fields: ['nombre', 'CategoriaId'],
            name: 'nombre_categoria_unique',
        }
    ],

    /**
     * Hooks acciones automaticas
     */
    hooks: {

        /**
         * BeforeCreate - Se ejecuta antes de crear una subcategoria
         * Verifica que la categoria padre exista y esté activa
         */
        beforeCreate: async (subcategoria, options) => {

            const Categoria = require('./categoria');

            // Buscar categoria padre
            const categoria = await Categoria.findByPk(subcategoria.CategoriaId);

            if (!categoria) {
                throw new Error('La categoria seleccionada no existe');
            }

            if (!categoria.activo) {
                throw new Error('No se puede crear una subcategoria en una categoria inactiva');
            }
        },

        /**
         * AfterUpdate - Se ejecuta despues de actualizar una subcategoria
         * Si se desactiva una subcategoria se desactivan todos sus productos
         */
        afterUpdate: async (subcategoria, options) => {

            // Verificar si el campo activo cambio
            if (subcategoria.changed('activo') && !subcategoria.activo) {

                console.log(`Desactivando subcategoria: ${subcategoria.nombre}`);

                // Importar modelo (para evitar dependencias circulares)
                const Producto = require('./producto');

                try {

                    // Paso 1: desactivar los productos de esta subcategoria
                    const productos = await Producto.findAll({
                        where: { SubcategoriaId: subcategoria.id },
                        transaction: options.transaction
                    });

                    for (const producto of productos) {
                        await producto.update(
                            { activo: false },
                            { transaction: options.transaction }
                        );

                        console.log(`Producto desactivado: ${producto.nombre}`);
                    }

                } catch (error) {
                    console.error('Error al desactivar productos relacionados:', error.message);
                    throw error;
                }
            }

            // Si se activa una subcategoria no se activan automaticamente los productos
        }
    }
});


/**
 * Metodo para obtener la categoria padre
 * @returns {Promise<Categoria>} - categoria padre de esta subcategoria
 */
Subcategoria.prototype.getCategoria = async function () {
    const Categoria = require('./categoria');
    return await Categoria.findByPk(this.CategoriaId);
};


// Exportar modelo Subcategoria
module.exports = Subcategoria;
