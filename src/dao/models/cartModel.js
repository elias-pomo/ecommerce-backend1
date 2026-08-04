const mongoose = require('mongoose');

const cartCollection = 'carts';

const cartSchema = new mongoose.Schema({

products: {
    type: [
        {
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products', // referencia exacta al nombre de la colección de productos
            required: true
        },
        quality: {
            type: Number,
            required: true,
            default: 1
        }
        }
    ],
    default: []
}
});

//middleware para que cada vez que hagamos un findone o find, nos traiga los productos con toda su información
cartSchema.pre('findOne', function() {
    this.populate('products.products'); // 'products.products' hace referencia al campo 'products' dentro del array 'products'
});

const cartModel = mongoose.model(cartCollection, cartSchema);

module.exports = cartModel;