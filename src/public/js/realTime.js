const e = require("express");

const socket = io();

//escuchamos el evento desde el servidor para actualizar la vista
socket.on('updateProducts', (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; //limpiador de lista actual
    products.array.forEach(products => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${productList.title}</strong> - $${product.price}
            <button onclick="deleteProduct('${product.__id}')">Eliminar</button>
        `;
        productList.appendChild(li);
    });
});

//Funcion para enviar un nuevo producto desde un formulario
document.getElementById('productForm').addEventListener('submit', (e) =>{
    e.preventDefault();
    const newProduct = {
        title: document.getElementById('title').value,
        descripcion: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: document.getElementById('price').value,
        stock: document.getElementById('stock').value,
        category: document.getElementById('category').value
    };
    socket.emit('addProduct', newProduct);
    e.target.reset(); //limpiar formulario
});

//funcion para eliminar un producto
function deleteProduct(id){
    socket.io('deleteProduct', id);
}