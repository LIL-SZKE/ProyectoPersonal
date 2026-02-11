/**
 * define model categoria
 * 
 */

// importar datatypes de sequelize
const { DataTypes } = require('sequelize');

// importar instancia de sequelize
const { sequelize } = require('../config/database');

/**
 * Definir modelo de categoria 
 */
const Categoria = sequelize.define(
  'Categoria',
  {
    // campos de la tabla 
    // id identificador unico (PRIMARY KEY)
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Ya existe una categoria con este nombre'
      },
      validate: {
        notEmpty: {
          msg: 'El nombre de la categoria no puede estar vacio'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },

    /**
     * Descripcion de la categoria 
     */
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    /**
     * activo estado de la categoria
     * si es false la categoria y todas sus subcategorias y productos se ocultaran
     */
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  },
  {
    // opciones de modelo 
    tableName: 'categorias',
    timestamps: true,

    /**
     * Hooks acciones automaticas
     */
    hooks: {
      /**
       * afterUpdate: se ejecuta despues de actualizar una categoria
       * si se desactiva una categoria, se desactivan todas sus subcategorias y productos
       */
      afterUpdate: async (categoria, options) => {
        // verificar si el campo activo cambio a false
        if (categoria.changed('activo') && !categoria.activo) {
          console.log(`Desactivando categoria ${categoria.nombre}`);

          try {
            // importar modelos (aqui para evitar dependencias circulares)
            const Subcategoria = require('./Subcategoria');
            const Producto = require('./producto');

            // paso 1 desactivar subcategorias de esta categoria
            const subcategorias = await Subcategoria.findAll({
              where: { categoriaId: categoria.id },
              transaction: options.transaction
            });

            for (const subcategoria of subcategorias) {
              await subcategoria.update(
                { activo: false },
                { transaction: options.transaction }
              );
              console.log(`Subcategoria ${subcategoria.nombre} desactivada`);
            }

            // paso 2 desactivar productos de esta categoria
            const productos = await Producto.findAll({
              where: { categoriaId: categoria.id },
              transaction: options.transaction
            });

            for (const producto of productos) {
              await producto.update(
                { activo: false },
                { transaction: options.transaction }
              );
              console.log(`Producto descativado: ${producto.nombre}`);
            }

            console.log(`categoria y elementos relacionados desactivados correctamente`);

          } catch (error) {
            console.error(`Error al desactivar categoria y elementos relacionados:`, error.message);
          }
        }
        //si se activa una categoria, no se activan automaticamente las subcategorias y productos 

      }
    }
  }
);

//METODOS DE INSTANCIA
/**
 * metodo para obtener subcategorias de esta categoria
 * 
 * @returns {Promise<number>} - numero de subcategorias
 */
categoria.prototype.getSubcategorias = async function() {
  const Subcategoria = require('./Subcategoria');
  return await Subcategoria.findAll({ where: { categoriaId: this.id } });
};

/**
 * metodo para obtener productos de esta categoria
 */

//METODOS DE INSTANCIA
/**
 * metodo para obtener subcategorias de esta categoria
 * 
 * @returns {Promise<number>} - numero de subcategorias
 */
categoria.prototype.contarProductos = async function() {
  const Producto = require('./Producto');
  return await Producto.findAll({ where: { categoriaId: this.id } });
};

//exportar modelo de categoria
module.exports = Categoria;