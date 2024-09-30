// افتح قاعدة البيانات أو أنشئها إذا لم تكن موجودة
let db;
let request = indexedDB.open('ordersDB', 1);

request.onerror = function(event) {
    console.error('حدث خطأ أثناء فتح قاعدة البيانات:', event.target.errorCode);
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    let objectStore = db.createObjectStore('orders', { keyPath: 'orderNumber' });
    objectStore.createIndex('customerName', 'customerName', { unique: false });
    objectStore.createIndex('customerPhone', 'customerPhone', { unique: false });
};

request.onsuccess = function(event) {
    db = event.target.result;
    renderOrders();
};

document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let newOrder = {
        customerName: document.getElementById('customerName').value,
        orderNumber: parseInt(document.getElementById('orderNumber').value),
        orderPrice: parseFloat(document.getElementById('orderPrice').value),
        discountedPrice: parseFloat(document.getElementById('discountedPrice').value),
        orderType: document.getElementById('orderType').value,
        shippingCompany: document.getElementById('shippingCompany').value,
        orderAddress: document.getElementById('orderAddress').value,
        customerPhone: document.getElementById('customerPhone').value,
        orderDate: document.getElementById('orderDate').value
    };

    let transaction = db.transaction(['orders'], 'readwrite');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.add(newOrder);

    request.onsuccess = function(event) {
        console.log('تم إضافة الطلب بنجاح!');
        document.getElementById('orderForm').reset();
        renderOrders();
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء إضافة الطلب:', event.target.errorCode);
    };
});

function renderOrders() {
    let transaction = db.transaction(['orders'], 'readonly');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.getAll();

    request.onsuccess = function(event) {
        let orders = event.target.result;
        let orderList = document.getElementById('orderList');
        orderList.innerHTML = '';

        orders.forEach(function(order) {
            let listItem = document.createElement('li');

            listItem.innerHTML = `
                <div><strong>اسم العميل:</strong> ${order.customerName}</div>
                <div><strong>رقم الطلب:</strong> ${order.orderNumber}</div>
                <div><strong>سعر الطلب:</strong> ${order.orderPrice}</div>
                <div><strong>سعر بعد الخصم:</strong> ${order.discountedPrice}</div>
                <div><strong>نوع الطلب:</strong> ${order.orderType}</div>
                <div><strong>شركة الشحن:</strong> ${order.shippingCompany}</div>
                <div><strong>عنوان الطلب:</strong> ${order.orderAddress}</div>
                <div><strong>هاتف العميل:</strong> ${order.customerPhone}</div>
                <div><strong>تاريخ الطلب:</strong> ${order.orderDate}</div>
            `;

            let editButton = document.createElement('button');
            editButton.textContent = 'تعديل';
            editButton.addEventListener('click', function() {
                openEditModal(order);
            });
            listItem.appendChild(editButton);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'حذف';
            deleteButton.addEventListener('click', function() {
                deleteOrder(order.orderNumber);
            });
            listItem.appendChild(deleteButton);

            orderList.appendChild(listItem);
        });
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء جلب الطلبات:', event.target.errorCode);
    };
}

function deleteOrder(orderNumber) {
    let transaction = db.transaction(['orders'], 'readwrite');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.delete(orderNumber);

    request.onsuccess = function(event) {
        console.log('تم حذف الطلب بنجاح!');
        renderOrders();
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء حذف الطلب:', event.target.errorCode);
    };
}

document.getElementById('searchInput').addEventListener('input', function(event) {
    let query = event.target.value.toLowerCase();
    let transaction = db.transaction(['orders'], 'readonly');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.getAll();

    request.onsuccess = function(event) {
        let orders = event.target.result;
        let searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';

        orders.forEach(function(order) {
            if (
                order.customerName.toLowerCase().includes(query) ||
                order.orderNumber.toString().includes(query) ||
                order.customerPhone.includes(query)
            ) {
                let listItem = document.createElement('li');
                listItem.innerHTML = `اسم العميل: ${order.customerName}, رقم الطلب: ${order.orderNumber}, هاتف العميل: ${order.customerPhone}`;
                listItem.addEventListener('click', function() {
                    openViewModal(order);
                });
                searchResults.appendChild(listItem);
            }
        });
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء البحث عن الطلبات:', event.target.errorCode);
    };
});

function openViewModal(order) {
    let modal = document.getElementById('viewModal');
    let orderDetails = document.getElementById('orderDetails');
    modal.style.display = 'block';

    orderDetails.innerHTML = `
        <div><strong>اسم العميل:</strong> ${order.customerName}</div>
        <div><strong>رقم الطلب:</strong> ${order.orderNumber}</div>
        <div><strong>سعر الطلب:</strong> ${order.orderPrice}</div>
        <div><strong>سعر بعد الخصم:</strong> ${order.discountedPrice}</div>
        <div><strong>نوع الطلب:</strong> ${order.orderType}</div>
        <div><strong>شركة الشحن:</strong> ${order.shippingCompany}</div>
        <div><strong>عنوان الطلب:</strong> ${order.orderAddress}</div>
        <div><strong>هاتف العميل:</strong> ${order.customerPhone}</div>
        <div><strong>تاريخ الطلب:</strong> ${order.orderDate}</div>
    `;

    document.getElementsByClassName('close')[1].onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

function openEditModal(order) {
    let modal = document.getElementById('editModal');
    let form = document.getElementById('editForm');
    modal.style.display = 'block';

    form.editCustomerName.value = order.customerName;
    form.editOrderNumber.value = order.orderNumber;
    form.editOrderPrice.value = order.orderPrice;
    form.editDiscountedPrice.value = order.discountedPrice;
    form.editOrderType.value = order.orderType;
    form.editShippingCompany.value = order.shippingCompany;
    form.editOrderAddress.value = order.orderAddress;
    form.editCustomerPhone.value = order.customerPhone;
    form.editOrderDate.value = order.orderDate;

    document.getElementById('saveChangesBtn').addEventListener('click', function() {
        let updatedOrder = {
            customerName: form.editCustomerName.value,
            orderNumber: parseInt(form.editOrderNumber.value),
            orderPrice: parseFloat(form.editOrderPrice.value),
            discountedPrice: parseFloat(form.editDiscountedPrice.value),
            orderType: form.editOrderType.value,
            shippingCompany: form.editShippingCompany.value,
            orderAddress: form.editOrderAddress.value,
            customerPhone: form.editCustomerPhone.value,
            orderDate: form.editOrderDate.value
        };

        updateOrder(updatedOrder);
        modal.style.display = 'none';
    });

    document.getElementsByClassName('close')[0].onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

function updateOrder(order) {
    let transaction = db.transaction(['orders'], 'readwrite');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.put(order);

    request.onsuccess = function(event) {
        console.log('تم تحديث الطلب بنجاح!');
        renderOrders();
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء تحديث الطلب:', event.target.errorCode);
    };
}
