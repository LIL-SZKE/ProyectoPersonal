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
const { table, time } = require('console');

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


    //Opciones de modelo

    tableName: 'carritos', // nombre de la tabla en la base de datos
    timestamps: true, // agrega campos createdAt y updatedAt

    indexes: [
        {
            unique: true,
            fields: ['usuarioId'] // un usuario no puede tener el mismo producto mas de una vez en el carrito
        }
    ],

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

/**
 * Metodo para actualizar la cantidad
 * @param {number} nuevaCantidad - Nueva cantidad 
 * @return {Promise} - Item actualizado
 */

Carrito.prototype.actualizarCantidad = async function (nuevaCantidad) {
  const Producto = require('./Producto');
  const producto = await Producto.findByPk(this.productoId);

  if (!producto.hayStock(nuevaCantidad)) {
    throw new Error(`Stock insuficiente, solo hay ${producto.stock} unidades disponibles`);
  }

  this.cantidad = nuevaCantidad;
  return await this.save();
};

/**
 * Metodo para obtener el carrito completo de un usuario
 * Incluye informacion de los productos 
 * @param {number} usuarioId - ID del usuario
 * @return {Promise<Array>} - Items del carrito con producto
 */

Carrito.obtenerCarritoUsuario = async function (usuarioId) {
  const Producto = require('./Producto');

  return await this.findAll({
    where: { usuarioId },
    include: [{
       model: Producto,
        as: 'producto', 
      }],
      order: [['createdAt', 'DESC']]
  });
};

/**
 * Metodo para calcular el total del carrito de un usuario
 * @param {number} usuarioId - ID del usuario
 * @return {Promise<number>} - Total del carrito  
 */
Carrito.calcularTotalCarrito = async function (usuarioId) {
  const itemsCarrito = await this.findAll(
    {
      where: { usuarioId }
    }
  );

  let total = 0;
  for (const item of itemsCarrito) {
    total += item.calcularSubtotal();
  }
  return total;
};

/**
 * Metodo para vaciar el carrito de un usuario
 * Util despues de realizar un pedido 
 * @param {number} usuarioId - ID del usuario
 * @return {Promise} - Carrito vaciado
 */
Carrito.vaciarCarrito = async function (usuarioId) {
  return await this.destroy({
    where: { usuarioId }
  });
};

//Exportar modelo
module.exports = Carrito;
