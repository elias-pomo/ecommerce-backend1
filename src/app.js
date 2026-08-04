const express = require('express');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const path = require('path');
const productsRouter = require('./routes/productsRouter');
const cartsRouter = require('./routes/cartsRouter');
const viewsRouter = require('./routes/viewsRouter');
const productModel = require('./dao/models/productModel');

const app = express();
const PORT = process.env.PORT || 8080;

//MIdlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

//configuracion de handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

//rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

//inicizalizacion del servidor http
const httpServer = app.listen(PORT, () =>{
    console.log(`Servidor escuchando en el puerto ${PORT}`);

});

//inicizalizacion de los websockets
const io = new Server(httpServer);
io.on('connection', async (socket) =>{
    console.log('Nuevo cliente conectado: ', socket.id);
    
    //cuando cliente se conecta le enviamos la lista oficial de los productos
    const products = await productModel.find().lean();
    socket.emit('updateProducts', products);

    //escuchamos cuando el cliente quiera agregar un producto
    socket.on('addProduct', async(productData) =>{
        try {
            await productModel.create(productData);
            const updateProducts = await productModel.find().lean();
            io.emit('updateProducts', updateProducts);
        } catch (error) {
            console.error('Error al crear producto por socket:',error);
        }
    });

    //escuchamos cuando el cliente quiere eliminar un producto
    socket.on('deleteProduct', async(productId) =>{
        try {
            await productModel.findByIdAndDelete(productId);
            const updateProducts = await productModel.find().lean();
            io.emit('updateProducts', updateProducts);
        } catch (error) {
            console.error('Error al eliminar producto por socket:', error);
        }
    });
});

//conexion a MongoDB
const connectMongoDB = async () => {
    try{
        
        await mongoose.connect('mongodb://eliaspomo68_db_user:y0RAQxzLpkk5b8CB@ac-ltmc23h-shard-00-00.zsnq1sg.mongodb.net:27017,ac-ltmc23h-shard-00-01.zsnq1sg.mongodb.net:27017,ac-ltmc23h-shard-00-02.zsnq1sg.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-sdxa0q-shard-0&authSource=admin&appName=ecommerce', {
            family: 4
        }); 
        console.log('Conectado a MongoDB');
    }catch (error){
        console.error('Error al conectar a MongoDB: ', error);
        process.exit(1);
    }
};

connectMongoDB();

