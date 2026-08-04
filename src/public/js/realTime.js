const socket = io();

//escuchamos el evento desde el servidor para actualizar la vista
socket.on('updateProducts', (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpiador de lista actual
    
    products.forEach(product => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center p-3 shadow-sm mb-2 rounded';
        
        // ESTRUCTURA VISUAL DE CADA PRODUCTO EN LA LISTA
        li.innerHTML = `
            <div>
                <h5 class="mb-1 fw-bold text-dark">${product.title}</h5>
                <small class="text-muted">
                    <strong>Cód:</strong> ${product.code} | 
                    <strong>Stock:</strong> ${product.stock} | 
                    <strong>Cat:</strong> ${product.category}
                </small>
            </div>
            <div class="d-flex align-items-center">
                <span class="badge bg-success fs-6 me-3 px-3 py-2">$${product.price}</span>
                <button class="btn btn-outline-danger btn-sm fw-bold" onclick="deleteProduct('${product._id}')">
                    Eliminar 🗑️
                </button>
            </div>
        `;
        
        productList.appendChild(li);
    });
});

//Funcion para enviar un nuevo producto desde un formulario
document.getElementById('productForm').addEventListener('submit', (e) =>{
    e.preventDefault();
    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        category: document.getElementById('category').value
    };
    socket.emit('addProduct', newProduct);
    e.target.reset(); //limpiar formulario
});

//funcion para eliminar un producto
function deleteProduct(id){
    socket.emit('deleteProduct', id);
}