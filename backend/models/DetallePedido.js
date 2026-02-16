/**
 * MODELO DETALLE PEDIDO
 * Define la tabla DetallePedido en la base de datos
 * Almacena los productos incluidos en cada pedido
 * relacion muchos a muchos entre Pedido y Productos
 */

// importar datatypes de sequelize
const { DataTypes } = require('sequelize');

// importar instancia de sequelize
const { sequelize } = require('../config/database');
const { type } = require('os');

/**
 * Definir modelo detalle pedido
 */
const DetallePedido = sequelize.define(
  'DetallePedido',
  {
    // campos de la tabla 
    // id identificador unico (PRIMARY KEY)
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    //pedidoID del pedido al que pertenece este detalle
    pedidoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pedidos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',// si se elimina el pedido eliminar detalles
        validate: {
            notNull: {
                msg: 'Debe especificar un pedido'
            }
        }
    },

    //ProductoID ID del producto incluido en el pedido
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'productos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',//No se puede eliminar productos con pedidos
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
     * Precio unitario del producto en el momento del pedido
     * Se guarda para mantener el historial aunque el producto cambie de precio
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

    /**
     * Subtotal total de este item (precioUnitario * cantidad)
     * se calcula automaticamente antes de guardar
     */

    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isDecimal: {
                msg: 'El subtotal debe ser un numero decimal valido'
            },
            min: {
                args: [0],
                msg: 'El subtotal no puede ser negativo'
            }
        }
    },  

    //Opciones de modelo

    tableName: 'detalle_pedidos', // nombre de la tabla en la base de datos
    timestamps: true, // agrega campos createdAt y updatedAt

    indexes: [
        {
            unique: true,
            fields: ['pedidoId'] // un pedido no puede tener el mismo producto mas de una vez en el detalle
        }
    ],

    hooks: {

        /**
         * BeforeCreate - Se ejecuta antes de crear un detalle pedido
         * Calcula el subtotal auntomaticamente 
         */
        beforeCreate: async (itemCarrito) => {
                       //Calcular subtotal precio * cantidad
            detalle.subtotal = parseFloat(detalle.precioUnitario) * detalle.cantidad;

            const Producto = require('./Producto');
        },

        /**
         * BeforeUpdate - Se ejecuta antes de actualizar un carrito
         * Valida que haya stock duficiente si se aumenta la cantidad 
         */
        BeforeUpdate: async (detalle) => {

            if (detalle.changed('precioUnitario') || detalle.changed('cantidad')) {
                detalle.subtotal = parseFloat(detalle.precioUnitario) * detalle.cantidad;

            }
        }
    }
});

//METODOS DE INSTANCIA

/**
 * Metodo para calcular el subtotal
 * 
 * @return {number} subtotal calculado
 */

DetallePedido.prototype.calcularSubtotal = function () {
    return parseFloat(this.precioUnitario) * this.cantidad;
};

/**
 * Metodo para crear detalles del pedido desde el carrito 
 * convierte los items del carrito en detalles de pedido
 * @param {number} pedidoId - ID del pedido
 * @return {Array} - Items del carrito 
 * @returns {Promise<Array>} - Detalles del pedido creados
 */

DetallePedido.crearDesdeCarrito = async function (pedidoId, itenmsCarrito) {
    const detalles = [];
    for (const item of itenmsCarrito) {
        const detalle = await this.create({
            pedidoId: pedidoId,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario
        });
        detalles.push(detalle);
    }
    return detalles;
};

/**
 * Metodo para calcular el total de un pedido desde detalles
 * @param {number} pedidoId - ID del pedido
 * @return {Promise<number>} - Total calculado
 */

DetallePedido.calcularTotalPedido = async function (pedidoId) {
    const detalles = await this.findAll({
        where: { pedidoId }
    });
    let total = 0;
    for (const detalle of detalles) {
        total += detalle.calcularSubtotal();
    }
    return total;
};

/**
 * Metodo para calcular el total del carrito de un usuario
 * @param {number} limite - numero de productos a retornar
 * @return {Promise<Array>} - Prodcutos mas vendidos
 */
DetallePedido.obtenerMasVendidos = async function (limite = 10) {
  const { sequelize } = require('../config/database');

  return await this.findAll({
    attributes: [
        'productoId',
        [sequelize.fn('SUM', sequelize.col('cantidad')), 'totalVendido']
    ],
    group: ['productoId'],
    order: [[sequelize.literal('totalVendido'), 'DESC']],
    limit: limite
  });
};

//Exportar modelo
module.exports = DetallePedido;
