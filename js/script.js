let iconCartSpan = document.querySelector('.nav-right a span'); //จำนวนสินค้าในตะกร้า
let cartItems = [];
let productData;
let totalCartItem = parseInt(iconCartSpan.innerText);
//แสดง list product arg1 = list of product , arg2 = Element ที่ต้องการแสดง
function displayProduct(ListProducts, searchResults) {
    console.log("dsd");
    searchResults.innerHTML = '';
    ListProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = "row"
        productElement.innerHTML = `<div class="row-img"><img src="img/${product.imgPath}.jpg" onclick="addToCart(${product.id})"></div>
                                    <h3>${product.name}</h3>
                                    <p>คลัง ${product.quantity}</p>
                                    <div class="row-in">
                                    <div class="row-left">
                                        <a href="#add" onclick="addToCart(${product.id})">
                                            Add to cart
                                            <i class="ri-shopping-cart-2-fill"></i></a>
                                    </div>
                                    <div class="row-rigth">
                                        <h6>฿${product.price}</h6>
                                    </div>
                                </div>
                            </div>`;
        searchResults.appendChild(productElement);
    });
}
//แสดง list product ใน ตะกร้าสินค้า
function displayCart(cartItems, cartItemsContainer) {
    cartItemsContainer.innerHTML = '';

    cartItems.forEach(item => {
        console.log("item " + item);
        const cartItemElement = document.createElement('div');
        cartItemElement.className = "cartItem";
        cartItemElement.innerHTML = `<div class="cart-container">
                                        <div class="cart-img"><img src="img/${item.imgPath}.jpg"> </div>
                                        <p>${item.name} - $${item.price.toFixed(2)} x 
                                        <button class="cart-btn" onclick="decreaseQuantity(${item.id})">-</button>
                                        <span id="quantity-${item.id}">${item.productQuantity}</span>
                                        <button class="cart-btn" onclick="increaseQuantity(${item.id})">+</button>
                                        <button class="delete-btn" onclick="deleteProduct(${item.id})">Delete</button></p>
                                    </div>`;
        cartItemsContainer.appendChild(cartItemElement);

    });
}
function displayOrderSummary() {
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const orderDetailsContainer = document.getElementById('orderDetails');
    let totalAmount = 0;
    // Header of the report-like structure
    const reportHeader = document.createElement('div');
    reportHeader.innerHTML = `<p>Product Name</p><p>Unit Price</p><p>Quantity</p><p>Total Price</p>`;
    reportHeader.classList.add('report-header');
    orderDetailsContainer.appendChild(reportHeader);

    // Order details in the report
    cartItems.forEach(item => {
        const orderItemElement = document.createElement('div');
        orderItemElement.className = 'order-item';
        orderItemElement.innerHTML = `<p>${item.name}</p><p>$${item.price.toFixed(2)}</p><p>${item.productQuantity}</p><p>$${(item.price * item.productQuantity).toFixed(2)}</p>`;
        orderDetailsContainer.appendChild(orderItemElement);

        totalAmount += item.price * item.quantity;
    });

    // update total amount/quantity here
    updateTotalAmount();
    updateTotalQuantity();
}
function deleteProduct(productId){
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    cartItems = cartItems.filter(item => item.id !== productId);
    localStorage.setItem('cart',JSON.stringify(cartItems));

    onloadCartPage();
}
function increaseQuantity(productId){
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cartItems.findIndex(item => item.id === productId);

    if(index !== -1){
        cartItems[index].productQuantity +=1;
        localStorage.setItem('cart',JSON.stringify(cartItems));
        onloadCartPage();
    }
}
function decreaseQuantity(productId){
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cartItems.findIndex(item => item.id === productId);

    if(index !== -1 && cartItems[index].productQuantity > 1){
        cartItems[index].productQuantity -=1;
        localStorage.setItem('cart',JSON.stringify(cartItems));
        onloadCartPage();
    }
}
function updateTotalAmount(){
    const totalAmountElement = document.getElementById('totalAmount');
    const totalAmount = cartItems.reduce((total , item) => total + (item.price * item.productQuantity),0);
    totalAmountElement.textContent = totalAmount.toFixed(2);
}
//document.getElementById('addToCart').addEventListener('click',function (item){})
//ตัวอย่าง เพิ่ม Event Listener สำหรับปุ่ม ค้นหา

//add to cart function 
function addToCart(productId) {
    // todo
    //check existingItem
    const existingItem = cartItems.find(item => item.id === productId);

    //ถ้ามีอยู่แล้วให้ + product quantity 
    if(existingItem){
        existingItem.productQuantity += 1;
    }
    //ถ้าไม่มีให้ new object แล้วเพิ่มลงใน cartItems
    else{
        const product = productData.find(p => p.id === productId);
        cartItems.push({...product,productQuantity : 1});
    }
    // Save cart items to storage
    localStorage.setItem('cart',JSON.stringify(cartItems));
    //calculate total quantity
    console.log("Cart : " + cartItems);
    updateTotalQuantity();

}
function updateTotalQuantity(){
    const totalQuantityElement = document.getElementById('totalQuantity');
    const totalQuantity = cartItems.reduce((total , item) => total + item.productQuantity , 0);
    console.log(totalQuantity);
    totalQuantityElement.textContent = totalQuantity.toFixed(0);
}



async function onloadIndex() {
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    console.log("onloadIndex");
    await search(searchInput,searchResults);
    updateTotalQuantity();


}

function onloadCartPage(){
    const cartItemsContainer = document.getElementById('ProductCart');
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    displayCart(cartItems , cartItemsContainer);

    updateTotalQuantity();
    updateTotalAmount();
}
async function search(searchInput, searchResults) {
    console.log("search");
    await fetch('http://localhost:8080/api/products/search?name=' + searchInput)
        .then(response => response.json())
        .then(data => {
            console.log(data.data);
            const responseCode = data.responseCode;
            if (responseCode === "0000") {
                displayProduct(data.data, searchResults);
                productData = data.data;
            }
        })
        .catch(error => { console.error("Error : " + error) }
        );
}
function checkout(){
    window.location.href ="checkout.html";
}
async function confirm(){
    // call api
    await orderProducts();
    //clear 
    cartItems = [];
    localStorage.setItem('cart',JSON.stringify(cartItems));
    //index.html
    window.location.href ="index.html";
}

async function orderProducts(){
    let orderProducts = [];
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    cartItems.forEach(item => {
        order = {
            productId : item.id,
            quantity : item.productQuantity
        };
        orderProducts.push(order);
    })
    const requestBody = {
        customerId : 1 ,
        address: "598/99",
        shippingMethod : "EMS",
        orderProducts : orderProducts
    };
    console.log(JSON.stringify(requestBody));
    const options ={
        method : "POST",
        headers :{
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(requestBody)
    };

    await fetch("http://localhost:8080/api/orders",options)
        .then(response => response.json())
        .then(data =>{
            const responseCode = data.responseCode;
            const responseMessage = data.responseMessage;

            if(responseCode === "0000"){
                alert('Thank you for your purchase! \n' + responseMessage)
            }else{
                alert(responseMessage);
            }
        }).catch(error =>{
            console.error(error);
        });
}