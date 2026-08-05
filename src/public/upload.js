const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config(); // Para leer tus variables de entorno

// 1. Configuramos Cloudinary con tus datos
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Le decimos a Multer que guarde los archivos en Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecommerce_products', // La carpeta que se creará en Cloudinary
        allowedFormats: ['jpg', 'png', 'jpeg', 'webp'], // Formatos permitidos
    },
});

// 3. Exportamos el middleware
const upload = multer({ storage: storage });

module.exports = upload;