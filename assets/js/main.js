let cart = [];

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    const customerGrid = document.getElementById('customerProducts');
    
    try {
        const response = await fetch('backend/api/products.php?action=getAll');
        const products = await response.json();
        
        const productHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">${product.icon}</div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <p style="color: #ffeaa7; font-size: 0.9rem;">
                        <i class="fas fa-store"></i> ${product.seller}
                    </p>
                    ${currentUser && currentUser.type === 'customer' ? 
                        `<button class="btn btn-primary" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
                        </button>` : ''
                    }
                </div>
            </div>
        `).join('');

        if (grid) grid.innerHTML = productHTML;
        if (customerGrid) customerGrid.innerHTML = productHTML;
    } catch (error) {
        console.error('Error memuat produk:', error);
    }
}

async function addProduct(event) {
    event.preventDefault();
    
    const product = {
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        seller: document.getElementById('productSeller').value,
        whatsapp: document.getElementById('productWhatsapp').value,
        icon: document.getElementById('productIcon').value
    };

    try {
        const response = await fetch('backend/api/products.php?action=add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        const result = await response.json();

        if (result.success) {
            alert('Produk berhasil ditambahkan!');
            hideAuth();
            loadProducts();
        } else {
            alert(result.message || 'Gagal menambahkan produk!');
        }
    } catch (error) {
        console.error('Error menambahkan produk:', error);
        alert('Terjadi kesalahan!');
    }
    return false;
}

function showMainContent() {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('customerDashboard').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showCustomerDashboard() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('customerDashboard').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    loadProducts();
}

function showAdminDashboard() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('customerDashboard').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadCustomersData();
    loadOrdersData();
    loadAdminStats();
}

function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(section).classList.add('active');
    event.target.classList.add('active');
}

async function loadCustomersData() {
    const customersList = document.getElementById('customersList');
    try {
        const response = await fetch('backend/api/customers.php?action=getAll');
        const customers = await response.json();
        
        customersList.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>0</td>
                <td>${customer.join_date}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error memuat data pelanggan:', error);
    }
}

async function loadOrdersData() {
    const ordersList = document.getElementById('ordersList');
    try {
        const response = await fetch('backend/api/orders.php?action=getAll');
        const orders = await response.json();
        
        ordersList.innerHTML = orders.map(order => `
            <tr>
                <td>#ORD${String(order.id).padStart(3, '0')}</td>
                <td>${order.customer_name}</td>
                <td>${formatCurrency(order.total)}</td>
                <td><span style="color: ${order.status === 'Completed' ? 'green' : order.status === 'Pending' ? 'orange' : 'red'};">${order.status}</span></td>
                <td>${order.order_date}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error memuat data pesanan:', error);
    }
}

async function loadAdminStats() {
    try {
        const response = await fetch('backend/api/orders.php?action=getStats');
        const stats = await response.json();
        
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('dailyOrders').textContent = stats.dailyOrders;
        document.getElementById('totalCustomers').textContent = stats.totalCustomers;
        document.getElementById('monthlyRevenue').textContent = formatCurrency(stats.monthlyRevenue);
    } catch (error) {
        console.error('Error memuat statistik:', error);
    }
}

async function addToCart(productId) {
    try {
        const response = await fetch('backend/api/cart.php?action=add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId: currentUser.id, productId })
        });
        const result = await response.json();

        if (result.success) {
            cart = result.cart;
            updateCartUI();
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Ditambahkan!';
            btn.style.background = '#00b894';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 1000);
        } else {
            alert(result.message || 'Gagal menambah ke keranjang!');
        }
    } catch (error) {
        console.error('Error menambah ke keranjang:', error);
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch('backend/api/cart.php?action=remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId: currentUser.id, productId })
        });
        const result = await response.json();
        
        if (result.success) {
            cart = result.cart;
            updateCartUI();
        }
    } catch (error) {
        console.error('Error menghapus dari keranjang:', error);
    }
}

async function updateQuantity(productId, change) {
    try {
        const response = await fetch('backend/api/cart.php?action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId: currentUser.id, productId, change })
        });
        const result = await response.json();
        
        if (result.success) {
            cart = result.cart;
            updateCartUI();
        }
    } catch (error) {
        console.error('Error memperbarui kuantitas:', error);
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    totalPrice.textContent = `Total: ${formatCurrency(totalAmount)}`;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; color: #666; padding: 40px 20px;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Keranjang kosong</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Mulai berbelanja sekarang!</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 5px; font-size: 1rem;">${item.name}</h4>
                    <p style="color: #666; margin-bottom: 3px; font-size: 0.9rem;">${formatCurrency(item.price)}</p>
                    <p style="font-size: 0.8rem; color: #888;">
                        <i class="fas fa-store"></i> ${item.seller}
                    </p>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 10px;">
                    <button onclick="updateQuantity(${item.id}, -1)" 
                        style="background: #e74c3c; color: white; border: none; border-radius: 50%; 
                        width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; 
                        justify-content: center; font-size: 0.9rem;">-</button>
                    <span style="font-weight: bold; min-width: 25px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" 
                        style="background: #27ae60; color: white; border: none; border-radius: 50%; 
                        width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; 
                        justify-content: center; font-size: 0.9rem;">+</button>
                    <button onclick="removeFromCart(${item.id})" 
                        style="background: #e74c3c; color: white; border: none; padding: 6px 10px; 
                        border-radius: 5px; cursor: pointer; font-size: 0.8rem; margin-left: 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('show');
    
    if (cartSidebar.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

async function checkout() {
    if (cart.length === 0) {
        alert('Keranjang belanja kosong!');
        return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const qrContainer = document.getElementById('qrContainer');
    const qrTotal = document.getElementById('qrTotal');
    
    qrTotal.textContent = formatCurrency(totalAmount);
    qrContainer.style.display = 'block';
    
    const qrCode = document.querySelector('.qr-code');
    qrCode.innerHTML = `
        <div style="font-size: 0.9rem; line-height: 1.3; color: #333;">
            <div style="font-weight: bold; margin-bottom: 8px;">QR Payment</div>
            <div style="font-size: 0.8rem; opacity: 0.7;">Scan untuk bayar</div>
            <div style="font-weight: bold; margin-top: 8px; color: #e17055;">
                ${formatCurrency(totalAmount)}
            </div>
        </div>
    `;

    if (window.innerWidth <= 768) {
        qrContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function confirmOrder() {
    if (cart.length === 0) return;

    try {
        const order = {
            customerId: currentUser.id,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        const response = await fetch('backend/api/orders.php?action=create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        const result = await response.json();

        if (result.success) {
            const sellerGroups = cart.reduce((groups, item) => {
                const seller = item.seller;
                if (!groups[seller]) {
                    groups[seller] = {
                        whatsapp: item.whatsapp,
                        items: []
                    };
                }
                groups[seller].items.push(item);
                return groups;
            }, {});

            Object.keys(sellerGroups).forEach(seller => {
                const group = sellerGroups[seller];
                const items = group.items.map(item => 
                    `${item.name} (${item.quantity}x) - ${formatCurrency(item.price * item.quantity)}`
                ).join('\n');
                
                const total = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                const message = `Halo ${seller}! 👋\n\nSaya ingin memesan:\n\n${items}\n\nTotal: ${formatCurrency(total)}\n\nNama: ${currentUser.name}\nNo. HP: ${currentUser.phone || 'Belum diisi'}\n\nTerima kasih! 🙏`;
                
                const whatsappUrl = `https://wa.me/${group.whatsapp}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            });

            cart = [];
            updateCartUI();
            toggleCart();
            alert('Pesanan berhasil dikirim ke WhatsApp penjual dan disimpan!');
        } else {
            alert(result.message || 'Gagal menyimpan pesanan!');
        }
    } catch (error) {
        console.error('Error menyimpan pesanan:', error);
        alert('Terjadi kesalahan!');
    }
}

function addTouchEvents() {
    document.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('btn') || e.target.classList.contains('cart-icon')) {
            e.target.style.transform = 'scale(0.95)';
        }
    });

    document.addEventListener('touchend', function(e) {
        if (e.target.classList.contains('btn') || e.target.classList.contains('cart-icon')) {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);
        }
    });

    let startX = 0;
    let currentX = 0;
    const cartSidebar = document.getElementById('cartSidebar');

    cartSidebar.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });

    cartSidebar.addEventListener('touchmove', function(e) {
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        
        if (diffX > 0 && diffX < 200) {
            cartSidebar.style.transform = `translateX(${diffX}px)`;
        }
    });

    cartSidebar.addEventListener('touchend', function(e) {
        const diffX = currentX - startX;
        
        if (diffX > 100) {
            toggleCart();
        }
        
        cartSidebar.style.transform = '';
        startX = 0;
        currentX = 0;
    });
}

function handleViewportChange() {
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 100);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateNavigation();
    updateCartUI();
    addTouchEvents();
    handleViewportChange();
    
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                input.style.fontSize = '16px';
            });
        });
    }
});