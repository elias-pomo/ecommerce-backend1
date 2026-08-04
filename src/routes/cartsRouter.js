const {Router} = require('express');
const cartModel = require('../dao/models/cartModel');

const router = Router();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartModel.create({ products: [] });
        res.status(201).json({status: 'success', payload : newCart});
    }catch (error){
        res.status(500).json({status: 'error', error: 'Error al crear el carrito'});
    }
});

// Obtener un carrito por su ID
router.get('/:cid', async (req, res) => {
    try {
        const Cart = await cartModel.findById(req.params.cid);
        if(!Cart){
            res.status(404).json({status: 'error', error: 'Carrito no encontrado'});
        }
        res.status(200).json({status: 'success', payload: Cart});
    }catch (error){
        res.status(500).json({status: 'error', error: 'Error al obtener el carrito'});
    }
});

// Agregar un producto a un carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        }
        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        if (productIndex  !== -1) {
            // Si el producto ya existe en el carrito, incrementa la cantidad
            cart.products[productIndex].quantity += 1;
        }else {
            // Si el producto no existe en el carrito, agrégalo con cantidad 1
            cart.products.push({ product: pid, quantity: 1 });
        }
        await cart.save();
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error){
        res.status(500).json({status: 'error', error: 'Error al agregar el producto al carrito'});
    }
});

// eliminar un producto en especifico de un carrito
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartModel.findByIdAndUpdate(
            cid,
            {$pull: { products: { product: pid }}},
            {new: true}
        );
        if(!cart){
            res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        }
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Error al eliminar el producto del carrito' });
    }
}) ;

// actualizar el carrito completo con un arreglo de productos
router.put('/:cid', async (req, res) => {
    try {
        const {cid} = req.params;
        const {products} = req.body;
        const cart = await cartModel.findByIdAndUpdate(
            cid,
            {products},
            {new: true}
        );
        if(!cart){
            res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });  
        }
        res.json({status: 'success', payload: cart});   
    }catch (error) {
        res.status(500).json({status: 'error', error: 'Error al actualizar el carrito'});
    }

});

// actualizar la cantidad de un producto en especifico de un carrito
router.put('/:cid/product/:pid', async (req, res) => {
    try{
        const {cid, pid} = req.params;
        const {quantity} = req.body;
        
        if(quantity === undefined || quantity < 0){
            return res.status(400).json({status: 'error', error: 'Cantidad inválida'});
        }
        const cart = await cartModel.findById(cid);
        if(!cart){
            return res.status(404).json({status: 'error', error: 'Carrito no encontrado'});
        }
        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        if(productIndex !== -1){
            cart.products[productIndex].quantity = quantity;
            await cart.save();
            res.json({status: 'success', payload: cart});
        }else{
            res.status(404).json({status: 'error', error: 'Producto no encontrado en el carrito'});
        }
    }catch (error){
        res.status(500).json({status: 'error', error: 'Error al actualizar la cantidad del producto en el carrito'});
    }
});

// eliminar todos los productos de un carrito
router.delete('/:cid', async (req, res) =>{
    try {
        const {cid} = req.params;
        const cart = await cartModel.findByIdAndUpdate(
            cid,
            {products: []},
            {new: true}
        );
        if(!cart){
            res.status(404).json({status: 'error', error: 'Carrito no encontrado'});
        }
        res.json({status: 'success', payload: cart});
    }catch (error){
        res.status(500).json({status: 'error', error: 'Error al eliminar todos los productos del carrito'});
    }
});

module.exports = router;