const Router = require('express');
const productModel = require('../dao/models/productModel');
const upload = require('../public/upload'); 

const router = Router();

// 1_  get api/products: listar productos con paginación, filtrado y ordenamiento
router.get('/', async (req, res) => {
    try {
        let { limit = 12, page = 1, sort, query} = req.query;
        limit = parseInt(limit);
        page = parseInt(page);

        //Filtrado
        let filter = {};
        if (query) {
            //filtramos por disponibilidad (status)
            if (query.toLowerCase() === 'true' || query.toLowerCase() === 'false') {
                filter.status = query.toLowerCase() === 'true';
            }else {
                //filtramos por categoría
                filter.category = query;
            }
        }

        let sortOption = {};
        if (sort) {
            if (sort === 'asc') sortOption.price = 1;
            else if (sort === 'desc') sortOption.price = -1;
        }

        const options = {
            limit,
            page,
            sort: sortOption,
            lean: true // para que devuelva objetos planos en lugar de documentos de Mongoose
        };

        const result = await productModel.paginate(filter, options);

        // constructor de los enlaces prev y next
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        const buildLink = (pageNumber) => {
            if (!pageNumber) return null;
            return `${baseUrl}?limit=${limit}&page=${pageNumber}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`;
        };

        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: buildLink(result.prevPage),
            nextLink: buildLink(result.nextPage)
        });

    } catch (error) {
        res.status(500).json({ status: 'error', error: 'error interno del servidor'});
    }
});

// upload.single('image') significa que esperas un campo llamado "image" en el formulario
router.post('/', upload.single('image'), async (req, res) => {
    try {
        // req.body tiene los datos de texto (title, price, etc.)
        const { title, description, code, price, stock, category } = req.body;
        
        // req.file tiene la información de la imagen que ya se subió a Cloudinary
        // req.file.path contiene la URL pública y lista para usar
        const imageUrl = req.file ? req.file.path : ''; 

        const newProduct = new productModel({
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails: [imageUrl] // ¡Guardamos la URL en tu base de datos!
        });

        await newProduct.save();
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        console.log("Error al crear producto:", error);
        res.status(500).json({ status: 'error', error: 'Error al crear el producto' });
    }
});

// 2_ get api/products/:pid: obtener un producto por su id
router.get('/:pid', async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ status: 'error', error: 'producto no encontrado'});
        }
        res.json({ status: 'success', payload: product });

    } catch (error){
        res.status(500).json({ status: 'error', error: 'error interno del servidor'});
    }
    });

// 3_ post api/products para crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ status: 'error', error: 'faltan campos obligatorios'});
        }

        const newProduct = await productModel.create(req.body);
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'error interno del servidor'});
    }
});

// 4_ put api/products/:pid para actualizar un producto por su id
router.put('/:pid', upload.single('image'), async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedData = req.body;

        // Prevencion de actualización de campos no permitidos
        delete updatedData._id; // No permitir actualizar el _id
        const nuevaImagen = updatedData.thumbnail_url;
        delete updatedData.thumbnail_url;
        let updateQuery = { ...updatedData };
        if (nuevaImagen) {
            updateQuery.$push = { thumbnails: nuevaImagen };
        }
        const updatedProduct = await productModel.findByIdAndUpdate(pid, updatedData, { new: true });
        
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', error: 'producto no encontrado'});
        }
        res.json({status: 'success', payload: updatedProduct});
    } catch (error){
        res.status(500).json({status: 'error', erorr: 'error interno del servidor'});
    }
});

// 5_ delete api/products/:pid para eliminar un producto por su id
router.delete('/:pid', async (req, res) => {
    try {
        const deletedProduct = await productModel.findByIdAndDelete(req.params.pid.trim());
        if(!deletedProduct){
            return res.status(404).json({ status: 'error', error: 'producto no encontrado'});
        }
        res.json({status: 'success', payLoad: deletedProduct});
    }catch (error) {
        console.log("Error en DELETE:", error);
        res.status(500).json({status:'error', error: 'error interno del servidor'});
    }
});

module.exports = router;