// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check if admin is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');

    if (isLoggedIn === 'true') {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'flex';
        loadDashboardMetrics();
    } else {
        loginContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
    }
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        checkAuth();
    } else {
        alert('Invalid credentials! Please use admin/admin123');
    }
}

// Logout function
function handleLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    checkAuth();
}

console.log(JSON.parse(localStorage.getItem('products')));

// Initialize local storage with sample data if empty
function initializeLocalStorage() {
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('notifications')) {
        localStorage.setItem('notifications', JSON.stringify([]));
    }
}

// DOM Elements
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.sidebar nav a');

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        if (link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update active section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });

            // Update active link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');

            // Load section data
            loadSectionData(targetId);
        }
    });
});

// Load section data
function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardMetrics();
            loadNotifications();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

// Dashboard Functions
function loadDashboardMetrics() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    document.getElementById('total-products').textContent = products.length;
    document.getElementById('active-orders').textContent = orders.filter(
        order => ['pending', 'shipped'].includes(order.status)
    ).length;
    document.getElementById('registered-users').textContent = users.length;
}

function loadNotifications() {
    const notifications =
        JSON.parse(localStorage.getItem('notifications')) || [];
    const notificationsList = document.getElementById('notifications-list');

    notificationsList.innerHTML = '';
    notifications.slice(0, 5).forEach(notification => {
        const div = document.createElement('div');
        div.className = 'notification-item';
        div.innerHTML = `
            <i class="fas ${notification.icon}"></i>
            <span>${notification.message}</span>
            <small>${new Date(notification.timestamp).toLocaleString()}</small>
        `;
        notificationsList.appendChild(div);
    });
}

// Product Management Functions
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productsContainer = document.getElementById('products-container');

    productsContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="products-table-body"></tbody>
        </table>
    `;

    const tableBody = document.getElementById('products-table-body');
    products.forEach((product, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price}</td>
            <td>${product.stock}</td>
            <td>${product.category || 'N/A'}</td>
            <td>
                <button onclick="editProduct(${index})" class="btn btn-primary btn-sm">Edit</button>
                <button onclick="deleteProduct(${index})" class="btn btn-danger btn-sm">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function openAddProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function editProduct(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products[index];

    document.getElementById('product-id').value = index;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-image').value = product.imageUrl || '';

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function saveProduct() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productId = document.getElementById('product-id').value;

    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        category: document.getElementById('product-category').value,
        imageUrl: document.getElementById('product-image').value
    };

    if (productId === '') {
        products.push(productData);
        addNotification('New product added: ' + productData.name, 'fa-box');
    } else {
        products[parseInt(productId)] = productData;
        addNotification('Product updated: ' + productData.name, 'fa-box');
    }

    localStorage.setItem('products', JSON.stringify(products));
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    loadProducts();
    loadDashboardMetrics();
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const productName = products[index].name;
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        addNotification('Product deleted: ' + productName, 'fa-trash');
        loadProducts();
        loadDashboardMetrics();
    }
}

// Order Management Functions
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ordersContainer = document.getElementById('orders-container');

    ordersContainer.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Orders Management</h5>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary btn-sm" onclick="filterOrders('all')">All</button>
                    <button class="btn btn-outline-warning btn-sm" onclick="filterOrders('pending')">Pending</button>
                    <button class="btn btn-outline-info btn-sm" onclick="filterOrders('processing')">Processing</button>
                    <button class="btn btn-outline-primary btn-sm" onclick="filterOrders('shipped')">Shipped</button>
                    <button class="btn btn-outline-success btn-sm" onclick="filterOrders('delivered')">Delivered</button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="orders-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    const tableBody = document.getElementById('orders-table-body');
    orders.forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="fw-medium">${order.orderId}</span>
                <br>
                <small class="text-muted">${new Date(order.orderDate).toLocaleDateString()}</small>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <div class="fw-medium">${order.shipping.fullName}</div>
                        <div class="text-muted small">${order.shipping.address}</div>
                        <div class="text-muted small">${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="text-muted small">
                    <div><i class="fas fa-envelope me-1"></i>${order.shipping.email}</div>
                    <div><i class="fas fa-phone me-1"></i>${order.shipping.phone}</div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="badge bg-light text-dark">${order.items.length} items</span>
                    <button class="btn btn-link btn-sm" onclick="viewOrderItems(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="fw-medium">$${order.payment.total.toFixed(2)}</div>
                <small class="text-muted">
                    ${order.shipping.deliveryOption === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                </small>
            </td>
            <td>
                <span class="badge bg-${getStatusColor(order.status)}">
                    ${order.status.toUpperCase()}
                </span>
            </td>
            <td>
                <div class="text-muted small">
                    <div>Ordered: ${new Date(order.orderDate).toLocaleString()}</div>
                    ${order.lastUpdated ? `<div>Updated: ${new Date(order.lastUpdated).toLocaleString()}</div>` : ''}
                </div>
            </td>
            <td>
                <div class="btn-group">
                    <button onclick="viewOrderDetails(${index})" class="btn btn-info btn-sm" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="updateOrderStatus(${index})" class="btn btn-primary btn-sm" title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="printOrderInvoice(${index})" class="btn btn-secondary btn-sm" title="Print Invoice">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'processing': 'info',
        'shipped': 'primary',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}

function viewOrderDetails(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[index];
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Order Details - ${order.orderId}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="fw-bold">Customer Information</h6>
                            <p><strong>Name:</strong> ${order.shipping.fullName}</p>
                            <p><strong>Email:</strong> ${order.shipping.email}</p>
                            <p><strong>Phone:</strong> ${order.shipping.phone}</p>
                            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-bold">Shipping Address</h6>
                            <p>${order.shipping.address}</p>
                            <p>${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}</p>
                            <p><strong>Delivery Option:</strong> ${order.shipping.deliveryOption}</p>
                        </div>
                    </div>
                    
                    <h6 class="fw-bold mt-4">Order Items</h6>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td><img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover"></td>
                                        <td>${item.name}</td>
                                        <td>$${item.price.toFixed(2)}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${item.subtotal.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <h6 class="fw-bold">Order Status</h6>
                            <span class="badge bg-${getStatusColor(order.status)}">
                                ${order.status.toUpperCase()}
                            </span>
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-bold">Payment Summary</h6>
                            <p><strong>Subtotal:</strong> $${order.payment.subtotal.toFixed(2)}</p>
                            <p><strong>Shipping:</strong> $${order.payment.shipping.toFixed(2)}</p>
                            <p><strong>Total:</strong> $${order.payment.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function viewOrderItems(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[index];
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Order Items - ${order.orderId}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>
                                            <img src="${item.image}" alt="${item.name}" 
                                                class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
                                        </td>
                                        <td>${item.name}</td>
                                        <td>$${item.price.toFixed(2)}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${item.subtotal.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" class="text-end fw-bold">Subtotal:</td>
                                    <td>$${order.payment.subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-end fw-bold">Shipping:</td>
                                    <td>$${order.payment.shipping.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-end fw-bold">Total:</td>
                                    <td>$${order.payment.total.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function printOrderInvoice(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[index];
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${order.orderId}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { padding: 20px; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="row mb-4">
                    <div class="col">
                        <h2>INVOICE</h2>
                        <p class="mb-0">Order ID: ${order.orderId}</p>
                        <p>Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div class="col text-end">
                        <button onclick="window.print()" class="btn btn-primary no-print">Print Invoice</button>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-6">
                        <h6 class="fw-bold">Customer Information</h6>
                        <p><strong>Name:</strong> ${order.shipping.fullName}</p>
                        <p><strong>Email:</strong> ${order.shipping.email}</p>
                        <p><strong>Phone:</strong> ${order.shipping.phone}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                    </div>
                    <div class="col-md-6 text-end">
                        <h6 class="fw-bold">Shipping Method:</h6>
                        <p>${order.shipping.deliveryOption === 'express' ? 'Express Delivery' : 'Standard Delivery'}</p>
                    </div>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="text-end">Price</th>
                            <th class="text-end">Quantity</th>
                            <th class="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="text-end">$${item.price.toFixed(2)}</td>
                                <td class="text-end">${item.quantity}</td>
                                <td class="text-end">$${item.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end fw-bold">Subtotal:</td>
                            <td class="text-end">$${order.payment.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-end fw-bold">Shipping:</td>
                            <td class="text-end">$${order.payment.shipping.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-end fw-bold">Total:</td>
                            <td class="text-end fw-bold">$${order.payment.total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="row mt-4">
                    <div class="col">
                        <h6 class="fw-bold">Notes:</h6>
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function filterOrders(status) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const filteredOrders = status === 'all' ? orders : orders.filter(order => order.status === status);
    renderOrdersTable(filteredOrders);
}

function renderOrdersTable(orders) {
    const tableBody = document.getElementById('orders-table-body');
    tableBody.innerHTML = '';
    
    orders.forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="fw-medium">${order.orderId}</span>
                <br>
                <small class="text-muted">${new Date(order.orderDate).toLocaleDateString()}</small>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <div class="fw-medium">${order.shipping.fullName}</div>
                        <div class="text-muted small">${order.shipping.address}</div>
                        <div class="text-muted small">${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="text-muted small">
                    <div><i class="fas fa-envelope me-1"></i>${order.shipping.email}</div>
                    <div><i class="fas fa-phone me-1"></i>${order.shipping.phone}</div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="badge bg-light text-dark">${order.items.length} items</span>
                    <button class="btn btn-link btn-sm" onclick="viewOrderItems(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="fw-medium">$${order.payment.total.toFixed(2)}</div>
                <small class="text-muted">
                    ${order.shipping.deliveryOption === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                </small>
            </td>
            <td>
                <span class="badge bg-${getStatusColor(order.status)}">
                    ${order.status.toUpperCase()}
                </span>
            </td>
            <td>
                <div class="text-muted small">
                    <div>Ordered: ${new Date(order.orderDate).toLocaleString()}</div>
                    ${order.lastUpdated ? `<div>Updated: ${new Date(order.lastUpdated).toLocaleString()}</div>` : ''}
                </div>
            </td>
            <td>
                <div class="btn-group">
                    <button onclick="viewOrderDetails(${index})" class="btn btn-info btn-sm" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="updateOrderStatus(${index})" class="btn btn-primary btn-sm" title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="printOrderInvoice(${index})" class="btn btn-secondary btn-sm" title="Print Invoice">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function updateOrderStatus(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[index];
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Update Order Status - ${order.orderId}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Order Status</label>
                        <select class="form-select" id="orderStatus">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="saveOrderStatus(${index})">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function saveOrderStatus(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const newStatus = document.getElementById('orderStatus').value;
    
    orders[index].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Add notification
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift({
        message: `Order ${orders[index].orderId} status updated to ${newStatus}`,
        icon: 'fa-truck',
        timestamp: new Date().toISOString(),
        type: 'order'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
    modal.hide();
    loadOrders();
    loadNotifications();
}

// User Management Functions
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const usersContainer = document.getElementById('users-container');

    usersContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="users-table-body"></tbody>
        </table>
    `;

    const tableBody = document.getElementById('users-table-body');
    users.forEach((user, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${user.avatar}" alt="${user.name}" class="w-8 h-8 rounded-full">
            </td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>
                <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">
                    ${user.status || 'active'}
                </span>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button onclick="viewUserDetails(${index})" class="btn btn-info btn-sm">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="toggleUserStatus(${index})" class="btn ${user.status === 'active' ? 'btn-warning' : 'btn-success'} btn-sm">
                    <i class="fas ${user.status === 'active' ? 'fa-ban' : 'fa-check'}"></i>
                </button>
                <button onclick="deleteUser(${index})" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function viewUserDetails(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">User Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <img src="${user.avatar}" alt="${user.name}" class="w-20 h-20 rounded-full mx-auto">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Name:</label>
                        <p>${user.name}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Email:</label>
                        <p>${user.email}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Phone:</label>
                        <p>${user.phone || 'Not provided'}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Address:</label>
                        <p>${user.address || 'Not provided'}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Status:</label>
                        <p>${user.status || 'active'}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Joined:</label>
                        <p>${new Date(user.createdAt).toLocaleString()}</p>
                    </div>
                    ${user.updatedAt ? `
                        <div class="mb-3">
                            <label class="block text-sm font-medium text-gray-700">Last Updated:</label>
                            <p>${new Date(user.updatedAt).toLocaleString()}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function toggleUserStatus(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];
    
    user.status = user.status === 'active' ? 'suspended' : 'active';
    user.updatedAt = new Date().toISOString();
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Add notification
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift({
        message: `User ${user.name} ${user.status === 'active' ? 'activated' : 'suspended'}`,
        icon: user.status === 'active' ? 'fa-check-circle' : 'fa-ban',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    loadUsers();
    loadNotifications();
}

function deleteUser(index) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userName = users[index].name;
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        addNotification('User deleted: ' + userName, 'fa-user-times');
        loadUsers();
        loadDashboardMetrics();
    }
}

function viewUserOrders(userId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(order => order.userId === userId);
    // You can implement a modal to show user orders here
    alert('User orders: ' + JSON.stringify(userOrders, null, 2));
}

// User Management Section
function renderUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const authNotifications = notifications.filter(n => n.type === 'auth');

    return `
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">User Management</h2>
                <div class="text-sm text-gray-500">Total Users: ${users.length}</div>
            </div>

            <!-- User Activity -->
            <div class="mb-8">
                <h3 class="text-lg font-semibold mb-4">Recent User Activity</h3>
                <div class="space-y-4">
                    ${authNotifications.slice(0, 5).map(notification => `
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <i class="fas ${notification.icon} text-green-500 mr-3"></i>
                            <div class="flex-1">
                                <p class="text-sm font-medium">${notification.message}</p>
                                <p class="text-xs text-gray-500">${new Date(notification.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- User List -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${users.map(user => {
                            const orders = JSON.parse(localStorage.getItem('orders')) || [];
                            const userOrders = orders.filter(order => order.userId === user.id);
                            return `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <img class="h-10 w-10 rounded-full" src="${user.avatar}" alt="">
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">${user.name}</div>
                                                <div class="text-sm text-gray-500">${user.phone || 'No phone'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">${user.email}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">
                                            ${new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            ${new Date(user.createdAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            ${userOrders.length} orders
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onclick="viewUserDetails('${user.id}')" class="text-green-600 hover:text-green-900">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function viewUserDetails(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(order => order.userId === userId);

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-6">
                    <div class="flex items-center">
                        <img class="h-16 w-16 rounded-full" src="${user.avatar}" alt="">
                        <div class="ml-4">
                            <h2 class="text-2xl font-bold">${user.name}</h2>
                            <p class="text-gray-500">${user.email}</p>
                        </div>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- User Stats -->
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-gray-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-green-600">${userOrders.length}</div>
                        <div class="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-green-600">
                            ${userOrders.reduce((total, order) => total + order.payment.total, 0).toFixed(2)}
                        </div>
                        <div class="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-green-600">
                            ${new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div class="text-sm text-gray-600">Member Since</div>
                    </div>
                </div>

                <!-- Contact Information -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-4">Contact Information</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Phone</label>
                            <p class="mt-1">${user.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <p class="mt-1">${user.email}</p>
                        </div>
                    </div>
                </div>

                <!-- Addresses -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-4">Saved Addresses</h3>
                    <div class="space-y-4">
                        ${(user.addresses || []).map((address, index) => `
                            <div class="border rounded-lg p-4">
                                <h4 class="font-medium">${address.type || `Address ${index + 1}`}</h4>
                                <p class="text-sm text-gray-600 mt-1">${address.street}</p>
                                <p class="text-sm text-gray-600">${address.city}, ${address.state} ${address.postalCode}</p>
                            </div>
                        `).join('') || '<p class="text-gray-500">No saved addresses</p>'}
                    </div>
                </div>

                <!-- Order History -->
                <div>
                    <h3 class="text-lg font-semibold mb-4">Order History</h3>
                    ${userOrders.length > 0 ? `
                        <div class="space-y-4">
                            ${userOrders.map(order => `
                                <div class="border rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="font-medium">${order.orderId}</span>
                                        <span class="badge bg-${getOrderStatusColor(order.status)} text-white px-2 py-1 rounded-full text-sm">
                                            ${order.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        <p>Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
                                        <p>Items: ${order.items.length}</p>
                                        <p>Total: $${order.payment.total.toFixed(2)}</p>
                                    </div>
                                    <button onclick="viewOrderDetails('${order.orderId}')" 
                                        class="mt-2 text-green-600 hover:text-green-700 text-sm font-medium">
                                        View Details
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <p class="text-gray-500">No orders yet</p>
                    `}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Add users section to admin navigation
function renderAdminNav() {
    return `
        <div class="bg-white shadow-sm">
            <div class="container mx-auto px-4">
                <div class="flex space-x-8">
                    <button onclick="renderOrders()" class="px-3 py-4 text-sm font-medium text-gray-700 border-b-2 hover:text-gray-900 hover:border-gray-300">
                        Orders
                    </button>
                    <button onclick="renderUsers()" class="px-3 py-4 text-sm font-medium text-gray-700 border-b-2 hover:text-gray-900 hover:border-gray-300">
                        Users
                    </button>
                    <button onclick="renderProducts()" class="px-3 py-4 text-sm font-medium text-gray-700 border-b-2 hover:text-gray-900 hover:border-gray-300">
                        Products
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update main render function
function renderAdmin() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        ${renderAdminNav()}
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Stats Cards -->
                ${renderStatsCards()}
            </div>
            
            <!-- Notifications -->
            ${renderNotifications()}
            
            <!-- Content Sections -->
            <div class="mt-8">
                ${renderOrders()}
            </div>
        </div>
    `;
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Initialize login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Add logout functionality to the "Back to Store" button
    const logoutBtn = document.querySelector('a[href="../index.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
            window.location.href = '../index.html';
        });
    }
    
    // Check authentication status
    checkAuth();
    
    // Initialize dashboard if logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        initializeLocalStorage();
        renderAdmin();
    }
});

// Mobile menu toggle
function initializeMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside
        mainContent.addEventListener('click', () => {
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });

        // Close sidebar when clicking a link (mobile)
        const sidebarLinks = document.querySelectorAll('.sidebar nav a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }
}

// Utility Functions
function addNotification(message, icon) {
    const notifications =
        JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift({
        message,
        icon: icon || 'fa-info-circle',
        timestamp: new Date().toISOString()
    });

    // Keep only last 20 notifications
    if (notifications.length > 20) {
        notifications.pop();
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));
    loadNotifications();
}

// Add sample data for testing
function addSampleData() {
    const products = [
        {
            name: 'Sample Product 1',
            description: 'This is a sample product',
            price: 99.99,
            stock: 50,
            category: 'Electronics',
            imageUrl: 'https://via.placeholder.com/150'
        },
        {
            name: 'Sample Product 2',
            description: 'Another sample product',
            price: 149.99,
            stock: 30,
            category: 'Clothing',
            imageUrl: 'https://via.placeholder.com/150'
        }
    ];

    const orders = [
        {
            id: 1,
            customerName: 'John Doe',
            total: 99.99,
            status: 'pending',
            userId: 1
        },
        {
            id: 2,
            customerName: 'Jane Smith',
            total: 149.99,
            status: 'shipped',
            userId: 2
        }
    ];

    const users = [
        {
            name: 'John Doe',
            email: 'john@example.com',
            joinDate: new Date('2024-01-01').toISOString(),
            avatar: 'https://via.placeholder.com/150',
            phone: '1234567890',
            address: '123 Main St',
            status: 'active'
        },
        {
            name: 'Jane Smith',
            email: 'jane@example.com',
            joinDate: new Date('2024-01-15').toISOString(),
            avatar: 'https://via.placeholder.com/150',
            phone: '9876543210',
            address: '456 Elm St',
            status: 'active'
        }
    ];

    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify(orders));
    }
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Add event listener for real-time updates
window.addEventListener('storage', (e) => {
    if (e.key === 'users' || e.key === 'notifications') {
        loadUsers();
        loadNotifications();
        loadDashboardMetrics();
    }
    if (e.key === 'orders' || e.key === 'notifications') {
        loadOrders();
        loadNotifications();
        loadDashboardMetrics();
    }
});

// Stats Cards
function renderStatsCards() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((total, order) => total + order.payment.total, 0);
    
    // Get orders from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(order => new Date(order.orderDate) > thirtyDaysAgo);
    const recentRevenue = recentOrders.reduce((total, order) => total + order.payment.total, 0);

    // Calculate pending orders
    const pendingOrders = orders.filter(order => order.status === 'pending').length;

    return `
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-100 text-green-600">
                    <i class="fas fa-shopping-cart text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-500">Total Orders</p>
                    <p class="text-2xl font-semibold">${orders.length}</p>
                </div>
            </div>
            <div class="mt-4">
                <p class="text-sm text-gray-500">
                    <span class="text-green-600">
                        <i class="fas fa-arrow-up"></i> ${recentOrders.length}
                    </span>
                    new orders in last 30 days
                </p>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                    <i class="fas fa-dollar-sign text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-500">Total Revenue</p>
                    <p class="text-2xl font-semibold">$${totalRevenue.toFixed(2)}</p>
                </div>
            </div>
            <div class="mt-4">
                <p class="text-sm text-gray-500">
                    <span class="text-blue-600">
                        <i class="fas fa-arrow-up"></i> $${recentRevenue.toFixed(2)}
                    </span>
                    revenue in last 30 days
                </p>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <i class="fas fa-users text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-500">Total Users</p>
                    <p class="text-2xl font-semibold">${users.length}</p>
                </div>
            </div>
            <div class="mt-4">
                <p class="text-sm text-gray-500">
                    <span class="text-yellow-600">
                        <i class="fas fa-clock"></i> ${pendingOrders}
                    </span>
                    pending orders
                </p>
            </div>
        </div>
    `;
}

// Notifications
function renderNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    
    return `
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Recent Notifications</h2>
                <button onclick="clearNotifications()" 
                    class="text-sm text-gray-500 hover:text-gray-700">
                    Clear All
                </button>
            </div>
            
            ${notifications.length > 0 ? `
                <div class="space-y-4">
                    ${notifications.slice(0, 10).map(notification => `
                        <div class="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div class="p-2 rounded-full ${getNotificationColor(notification.type)}">
                                <i class="fas ${notification.icon} text-lg"></i>
                            </div>
                            <div class="ml-4 flex-1">
                                <p class="text-sm font-medium">${notification.message}</p>
                                <p class="text-xs text-gray-500">
                                    ${formatTimeAgo(new Date(notification.timestamp))}
                                </p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-bell-slash text-4xl mb-2"></i>
                    <p>No new notifications</p>
                </div>
            `}
        </div>
    `;
}

function clearNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        localStorage.setItem('notifications', JSON.stringify([]));
        renderAdmin();
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'order':
            return 'bg-green-100 text-green-600';
        case 'auth':
            return 'bg-blue-100 text-blue-600';
        case 'alert':
            return 'bg-red-100 text-red-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Add logout functionality to the "Back to Store" button
    const logoutBtn = document.querySelector('a[href="../index.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
            window.location.href = '../index.html';
        });
    }
    
    // Check authentication status
    checkAuth();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize dashboard if logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        initializeLocalStorage();
        renderAdmin();
    }
});
