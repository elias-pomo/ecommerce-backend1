const express = require('express');
const productModel = require('../dao/models/productModel');
const cartModel = require('../dao/models/cartModel');
const { model } = require('mongoose');

const router = express.Router();

// listado paginado
router.get('/products', async (req, res) =>{
    try {
        let {limit =10, page = 1, sort, query} = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true
        };
        const result = await productModel.paginate({}, options);
        console.log("Productos encontrados:", result.docs);
        res.render('products', {
            products: result.docs,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage, 
            page: result.page
        })
    } catch (error) {
        res.status(500).json({status: 'error', error: 'Error al obtener los productos'});
    }
});

// Detalles del porducto
router.get('/products/:pid', async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).lean();
        if(!product) return res.status(404).send('producto no encontrado');
        res.render('productDetail', { product });
    }catch (error){
        res.status(500).json({status: 'error', error: 'Error al cargar el carrito'});
    }
});

// Vista del carrito
router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid).lean();
        if(!cart){
            res.status(404).send('Carrito no encontrado');
        }
        res.render('cart', { cart });
    } catch (error) {
        res.status(500).send('Error al cargar el carrito');
    }
});

// vista con Websockets
router.get('/realtimeproducts', async(req, res) =>{
    try {
        const products = await productModel.find().lean();
        res.render('realTimeProducts', {products});
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});

module.exports = router;
