/*
 * ระบบตะกร้าสินค้า (Shopping Cart System)
 *
 * การแบ่งโค้ดเป็นส่วน ๆ เปรียบเสมือนองค์กรที่มีแผนกต่าง ๆ ทำงานร่วมกัน:
 * 1. Data Management: จัดการข้อมูลตะกร้าสินค้าใน localStorage
 * 2. UI Rendering: แสดงผลรายการสินค้าและตะกร้าบนหน้าเว็บ
 * 3. Cart Operations: การเพิ่ม, ลด, ลบสินค้าในตะกร้า
 * 4. Order Operations: การสั่งซื้อสินค้าและยืนยันการสั่งซื้อ
  */

// ----------------------
// Data Management Section
// ----------------------

// ดึงข้อมูลตะกร้าสินค้าจาก localStorage หรือคืนค่าเป็นอาร์เรย์ว่างหากไม่มีข้อมูล
function getCart() {
    const cart = localStorage.getItem('cart');
    if (cart) {
        return JSON.parse(cart);
    } else {
        return [];
    }
}

// อัพเดตข้อมูลตะกร้าสินค้าใน localStorage
function updateCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ประกาศตัวแปร global สำหรับเก็บข้อมูลสำคัญ
const iconCartSpan = document.querySelector('.nav-right a span'); // Element แสดงจำนวนสินค้าบนไอคอนตะกร้า
let cartItems = getCart(); // โหลดข้อมูลตะกร้าสินค้าเมื่อเริ่มต้น
let productData;         // ตัวแปรเก็บข้อมูลสินค้าจาก API
const totalCartItem = parseInt(iconCartSpan.innerText); // จำนวนสินค้าบนไอคอน (อาจใช้งานในภายหลัง)

// ----------------------
// UI Rendering Section
// ----------------------

// ฟังก์ชันสำหรับแสดงรายการสินค้าบนหน้าเว็บ
// Parameter:
//   listProducts: อาร์เรย์ของสินค้าที่จะนำมาแสดง
//   searchResults: Element ที่ใช้แสดงผลรายการสินค้า
function displayProduct(listProducts, searchResults) {
    // เคลียร์เนื้อหาเก่าใน Element การแสดงผล
    searchResults.innerHTML = "";

    // วนลูปแสดงสินค้าทุกตัวใน listProducts
    listProducts.forEach(function(product) {
        // สร้าง Element div สำหรับแต่ละสินค้า
        const productElement = document.createElement("div");
        productElement.className = "row";
        // สร้าง HTML สำหรับแสดงรายละเอียดสินค้า
        productElement.innerHTML = "<div class=\"row-img\"><img src=\"img/" + product.imgPath + ".jpg\" onclick=\"addToCart(" + product.id + ")\"></div>" +
                                   "<h3>" + product.name + "</h3>" +
                                   "<p>คลัง " + product.quantity + "</p>" +
                                   "<div class=\"row-in\">" +
                                       "<div class=\"row-left\">" +
                                           "<a href=\"#add\" onclick=\"addToCart(" + product.id + ")\">" +
                                               "Add to cart " +
                                               "<i class=\"ri-shopping-cart-2-fill\"></i>" +
                                           "</a>" +
                                       "</div>" +
                                       "<div class=\"row-rigth\">" +
                                           "<h6>฿" + product.price + "</h6>" +
                                       "</div>" +
                                   "</div>";
        // เพิ่ม Element สินค้าเข้าไปใน Element การแสดงผล
        searchResults.appendChild(productElement);
    });
}

// ฟังก์ชันสำหรับแสดงรายการสินค้าในตะกร้า
// Parameter:
//   cartItemsList: อาร์เรย์ของสินค้าที่อยู่ในตะกร้า
//   cartItemsContainer: Element ที่ใช้แสดงผลตะกร้า
function displayCart(cartItemsList, cartItemsContainer) {
    // เคลียร์เนื้อหาเก่าใน Container ของตะกร้า
    cartItemsContainer.innerHTML = "";

    // วนลูปแสดงสินค้าทุกตัวในตะกร้า
    cartItemsList.forEach(function(item) {
        // สร้าง Element div สำหรับสินค้าในตะกร้า
        const cartItemElement = document.createElement("div");
        cartItemElement.className = "cartItem";
        // สร้าง HTML สำหรับแสดงรายละเอียดสินค้าในตะกร้า
        cartItemElement.innerHTML = "<div class=\"cart-container\">" +
                                        "<div class=\"cart-img\"><img src=\"img/" + item.imgPath + ".jpg\"></div>" +
                                        "<p>" + item.name + " - $" + item.price.toFixed(2) + " x " +
                                        "<button class=\"cart-btn\" onclick=\"decreaseQuantity(" + item.id + ")\">-</button>" +
                                        "<span id=\"quantity-" + item.id + "\">" + item.productQuantity + "</span>" +
                                        "<button class=\"cart-btn\" onclick=\"increaseQuantity(" + item.id + ")\">+</button>" +
                                        "<button class=\"delete-btn\" onclick=\"deleteProduct(" + item.id + ")\">Delete</button>" +
                                        "</p>" +
                                     "</div>";
        // เพิ่มสินค้าเข้าไปใน Container ของตะกร้า
        cartItemsContainer.appendChild(cartItemElement);
    });
}

// ฟังก์ชันสำหรับแสดงสรุปคำสั่งซื้อ (Order Summary)
function displayOrderSummary() {
    // โหลดข้อมูลตะกร้าจาก localStorage
    cartItems = getCart();
    // หา Element ที่จะใช้แสดงสรุปคำสั่งซื้อ
    const orderDetailsContainer = document.getElementById("orderDetails");
    // เคลียร์เนื้อหาเก่า
    orderDetailsContainer.innerHTML = "";

    // สร้าง Header สำหรับรายงานคำสั่งซื้อ
    const reportHeader = document.createElement("div");
    reportHeader.innerHTML = "<p>Product Name</p><p>Unit Price</p><p>Quantity</p><p>Total Price</p>";
    reportHeader.classList.add("report-header");
    orderDetailsContainer.appendChild(reportHeader);

    // ตัวแปรสำหรับเก็บยอดรวมคำสั่งซื้อ
    let totalAmount = 0;

    // วนลูปแสดงรายละเอียดสินค้าทั้งหมดในตะกร้า
    cartItems.forEach(function(item) {
        const orderItemElement = document.createElement("div");
        orderItemElement.className = "order-item";
        orderItemElement.innerHTML = "<p>" + item.name + "</p>" +
                                     "<p>$" + item.price.toFixed(2) + "</p>" +
                                     "<p>" + item.productQuantity + "</p>" +
                                     "<p>$" + (item.price * item.productQuantity).toFixed(2) + "</p>";
        orderDetailsContainer.appendChild(orderItemElement);

        // คำนวณยอดรวมโดยใช้ property productQuantity
        totalAmount += item.price * item.productQuantity;
    });

    // อัพเดตยอดรวมและจำนวนสินค้า
    updateTotalAmount();
    updateTotalQuantity();
}

// ----------------------
// Cart Operations Section
// ----------------------

// ฟังก์ชันสำหรับลบสินค้าจากตะกร้าโดยระบุ productId
function deleteProduct(productId) {
    // โหลดข้อมูลตะกร้าจาก localStorage
    cartItems = getCart();
    // กรองรายการสินค้า โดยเอาสินค้าที่มี id ไม่ตรงกับ productId ที่ต้องการลบออก
    cartItems = cartItems.filter(function(item) {
        return item.id !== productId;
    });
    // อัพเดตข้อมูลตะกร้าใน localStorage
    updateCart(cartItems);
    // โหลดหน้าตะกร้าใหม่เพื่อรีเฟรชข้อมูล
    onloadCartPage();
}

// ฟังก์ชันสำหรับเพิ่มจำนวนสินค้าขึ้นในตะกร้า
function increaseQuantity(productId) {
    // โหลดข้อมูลตะกร้าจาก localStorage
    cartItems = getCart();
    // หา index ของสินค้าที่มี id ตรงกับ productId
    const index = cartItems.findIndex(function(item) {
        return item.id === productId;
    });

    if (index !== -1) {
        // เพิ่มจำนวนสินค้า ทีละ 1
        cartItems[index].productQuantity = cartItems[index].productQuantity + 1;
        updateCart(cartItems);
        onloadCartPage();
    }
}

// ฟังก์ชันสำหรับลดจำนวนสินค้าลงในตะกร้า (โดยไม่ต่ำกว่า 1)
function decreaseQuantity(productId) {
    cartItems = getCart();
    const index = cartItems.findIndex(function(item) {
        return item.id === productId;
    });

    if (index !== -1 && cartItems[index].productQuantity > 1) {
        // ลดจำนวนสินค้า ทีละ 1
        cartItems[index].productQuantity = cartItems[index].productQuantity - 1;
        updateCart(cartItems);
        onloadCartPage();
    }
}

// ฟังก์ชันสำหรับคำนวณและอัพเดตยอดรวมของคำสั่งซื้อ
function updateTotalAmount() {
    const totalAmountElement = document.getElementById("totalAmount");
    // คำนวณยอดรวมโดยการรวมราคาสินค้าคูณด้วยจำนวนสินค้าแต่ละรายการ
    const totalAmount = cartItems.reduce(function(total, item) {
        return total + (item.price * item.productQuantity);
    }, 0);
    totalAmountElement.textContent = totalAmount.toFixed(2);
}

// ฟังก์ชันสำหรับคำนวณและอัพเดตจำนวนสินค้าทั้งหมดในตะกร้า
function updateTotalQuantity() {
    const totalQuantityElement = document.getElementById("totalQuantity");
    // คำนวณผลรวมจำนวนสินค้าจากแต่ละรายการในตะกร้า
    const totalQuantity = cartItems.reduce(function(total, item) {
        return total + item.productQuantity;
    }, 0);

    // เพิ่มคลาสสำหรับ animation เมื่อมีการเปลี่ยนแปลงจำนวนสินค้า
    totalQuantityElement.classList.add("quantity-change");
    totalQuantityElement.textContent = totalQuantity.toFixed(0);

    // ลบคลาส animation หลังจากครบเวลา 300 มิลลิวินาที
    setTimeout(function() {
        totalQuantityElement.classList.remove("quantity-change");
    }, 300);
}

// ฟังก์ชันสำหรับเพิ่มสินค้าลงในตะกร้า
function addToCart(productId) {
    // โหลดข้อมูลตะกร้าจาก localStorage
    cartItems = getCart();
    // ตรวจสอบว่าสินค้ามีอยู่แล้วในตะกร้าหรือไม่
    const existingItem = cartItems.find(function(item) {
        return item.id === productId;
    });

    if (existingItem) {
        // ถ้ามีอยู่แล้ว ให้เพิ่มจำนวนสินค้า
        existingItem.productQuantity = existingItem.productQuantity + 1;
    } else {
        // ถ้ายังไม่มีในตะกร้า ค้นหาข้อมูลสินค้าจาก productData
        const product = productData.find(function(p) {
            return p.id === productId;
        });
        // สร้างอ็อบเจ็กต์ใหม่โดยใช้ let/const (ไม่ใช้ object spread)
        const newProduct = {
            id: product.id,
            name: product.name,
            imgPath: product.imgPath,
            price: product.price,
            quantity: product.quantity,    // จำนวนสินค้าคงคลัง
            productQuantity: 1             // จำนวนสินค้าในตะกร้า
        };
        cartItems.push(newProduct);
    }
    // อัพเดตข้อมูลตะกร้าใน localStorage
    updateCart(cartItems);
    // อัพเดตจำนวนสินค้าบนไอคอนตะกร้า
    updateTotalQuantity();
}

// ----------------------
// Order Operations Section
// ----------------------

// ฟังก์ชันสำหรับโหลดหน้า Index (แสดงรายการสินค้าและช่องค้นหา)
async function onloadIndex() {
    cartItems = getCart();
    // ดึงค่าจากช่องค้นหาแล้วแปลงเป็นตัวพิมพ์เล็ก
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    // หา Element ที่ใช้แสดงผลการค้นหา
    const searchResults = document.getElementById("searchResults");
    // เรียกฟังก์ชันค้นหาสินค้า
    await search(searchInput, searchResults);
    // อัพเดตจำนวนสินค้าบนไอคอนตะกร้า
    updateTotalQuantity();
}

// ฟังก์ชันสำหรับโหลดหน้า Cart
function onloadCartPage() {
    // หา Element ที่ใช้แสดงรายการสินค้าในตะกร้า
    const cartItemsContainer = document.getElementById("ProductCart");
    cartItems = getCart();
    // แสดงรายการสินค้าที่อยู่ในตะกร้า
    displayCart(cartItems, cartItemsContainer);
    // อัพเดตจำนวนและยอดรวมสินค้า
    updateTotalQuantity();
    updateTotalAmount();
}

// ฟังก์ชันสำหรับค้นหาสินค้าจาก API
async function search(searchInput, searchResults) {
    console.log("search");
    try {
        const response = await fetch("http://localhost:8080/api/products/search?name=" + searchInput);
        const data = await response.json();
        console.log(data.data);
        const responseCode = data.responseCode;
        if (responseCode === "0000") {
            // แสดงรายการสินค้าที่ค้นพบ
            displayProduct(data.data, searchResults);
            // เก็บข้อมูลสินค้าจาก API ไว้ในตัวแปร productData
            productData = data.data;
        }
    } catch (error) {
        console.error("Error: " + error);
    }
}

// ฟังก์ชันสำหรับนำทางไปยังหน้า Checkout
function checkout() {
    window.location.href = "checkout.html";
}

// ฟังก์ชันสำหรับยืนยันการสั่งซื้อ
async function confirmOrder() {
    // เรียกฟังก์ชันสั่งซื้อสินค้า (orderProducts)
    await orderProducts();
    // ล้างข้อมูลตะกร้าสินค้า
    cartItems = [];
    updateCart(cartItems);
    // นำทางกลับไปยังหน้า index
    window.location.href = "index.html";
}

// ฟังก์ชันสำหรับสั่งซื้อสินค้า (ส่งข้อมูลคำสั่งซื้อไปยัง API)
async function orderProducts() {
    let orderProductsArray = [];
    cartItems = getCart();

    // วนลูปสร้างรายการคำสั่งซื้อสำหรับแต่ละสินค้า
    cartItems.forEach(function(item) {
        const orderItem = {
            productId: item.id,
            quantity: item.productQuantity
        };
        orderProductsArray.push(orderItem);
    });

    // สร้างอ็อบเจ็กต์สำหรับส่งคำสั่งซื้อ (request body)
    const requestBody = {
        customerId: 1,
        address: "598/99",
        shippingMethod: "EMS",
        orderProducts: orderProductsArray
    };

    console.log(JSON.stringify(requestBody));

    // กำหนด options สำหรับ fetch API ในการส่งคำสั่งซื้อ
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    };

    try {
        const response = await fetch("http://localhost:8080/api/orders", options);
        const data = await response.json();
        const responseCode = data.responseCode;
        const responseMessage = data.responseMessage;

        if (responseCode === "0000") {
            alert("Thank you for your purchase! \n" + responseMessage);
        } else {
            alert(responseMessage);
        }
    } catch (error) {
        console.error(error);
    }
}

/*
 * สรุปภาพรวมการทำงาน:
 *
 * - Data Management: ใช้ฟังก์ชัน getCart() และ updateCart() ในการดึงและอัพเดตข้อมูลตะกร้าสินค้าใน localStorage
 * - UI Rendering: ฟังก์ชัน displayProduct(), displayCart() และ displayOrderSummary() จัดการแสดงผลสินค้าและคำสั่งซื้อบนหน้าเว็บ
 * - Cart Operations: ฟังก์ชัน addToCart(), increaseQuantity(), decreaseQuantity() และ deleteProduct() จัดการเพิ่ม ลด หรือ ลบสินค้าในตะกร้า
 * - Order Operations: ฟังก์ชัน onloadIndex(), onloadCartPage(), search(), checkout(), confirmOrder() และ orderProducts() จัดการกระบวนการสั่งซื้อสินค้า
 *
 * ด้วยการใช้ let และ const ทำให้การจัดการตัวแปรมี scope ที่ชัดเจนและปลอดภัยมากขึ้น
 */
