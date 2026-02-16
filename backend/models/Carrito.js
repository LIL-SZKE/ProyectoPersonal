/**
 * MODELO CARRITO
 * Define la tabla Carrito en la base de datos
 * Almacena los productos que el usuario ha agregado al carrito de compras  
 */

// importar datatypes de sequelize
const { DataTypes } = require('sequelize');

// importar instancia de sequelize
const { sequelize } = require('../config/database');
const { type } = require('os');

/**
 * Definir modelo de Carrito
 */
const Carrito = sequelize.define(
  'Carrito',
  {
    // campos de la tabla 
    // id identificador unico (PRIMARY KEY)
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    //UsuarioID ID del usuario dueño del carrito
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',// si se elimina el usuario se elimina su carrito
        validate: {
            notNull: {
                msg: 'Debe especificar un usuario'
            }
        }
    },

    //ProductoID ID del usuario dueño del carrito
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'productos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',//se elimina el producto del carrito 
        validate: {
            notNull: {
                msg: 'Debe especificar un producto'
            }
        }
    },

    // Cantiudad de este producto en el carrito
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,   
        defaultValue: 1,
        validate: {
            isInt: {
                msg: 'La cantidad debe ser un numero entero'
            },
            min: {
                args: [1],
                msg: 'La cantidad debe ser al menos 1'
            }
        }
    },

    /**
     * Precio unitario del producto en el momento de agregar al carrito
     * Se guarda para mantener el precio aunque el producto cambie de precio
     */

    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'El precio unitario debe ser un numero decimal valido'
            },
            min: {
                args: [0],
                msg: 'El precio unitario no puede ser negativo'
            }
        }
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
     * Hooks acciones automaticas
     */
    hooks: {

        /**
         * BeforeCreate - Se ejecuta antes de crear una subcategoria
         * Verifica que la categoria padre exista y esté activa
         */
        beforeCreate: async (itemCarrito) => {

            const Categoria = require('./categoria');

            // Buscar categoria padre
            const categoria = await Categoria.findByPk(itemCarrito.CategoriaId);

            if (!Producto) {
                throw new Error('El producto seleccionado no existe');
            }

            if (!Producto.activo) {
                throw new Error(`Stock insuficiente, solo hay ${Producto.stock} unidades disponibles`);
            }

            //Guardar el precio actual del producto 
            itemCarrito.precioUnitario = Producto.precio;
        },

        /**
         * BeforeUpdate - Se ejecuta antes de actualizar un carrito
         * Valida que haya stock duficiente si se aumenta la cantidad 
         */
        BeforeUpdate: async (itemCarrito) => {

            if (itemCarrito.changed('Cantidad') && !itemCarrito.activo) {
                const Producto = require('./Producto');
                const Producto = await Producto.findByPk(itemCarrito.ProductoId);

                if (!Producto) {
                    throw new Error('El producto seleccionado no existe');
                }

                if (itemCarrito.Cantidad) {
                    throw new Error(`Stock insuficiente, solo hay ${Producto.stock} unidades disponibles`);
                }

            }
        }
    }
});

//METODOS DE INSTANCIA

/**
 * Metodo para calcular eñ subtotal de este item
 * 
 * @return {number} subtotal = precioUnitario * cantidad
 */

Carrito.prototype.calcularSubtotal = function () {
    return parseFloat(this.precioUnitario) * this.cantidad;
};


// Exportar modelo Subcategoria
module.exports = Carrito;
