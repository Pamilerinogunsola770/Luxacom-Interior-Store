// Luxacom Interior Store - JavaScript

const ADMIN_PASSWORD = 'admin123'; // Admin password - change this to your desired password
const API_URL = 'http://localhost:3000/api'; // Backend API URL

class InteriorStore {
    constructor() {
        this.products = [];
        this.blogPosts = [];
        this.whatsappNumber = '09057539937';
        this.isAdminLoggedIn = false;
        this.init();
    }

    async init() {
        await this.loadProducts();
        await this.loadBlogs();
        this.renderProducts();
        this.renderBlog();
        this.setupEventListeners();
        this.setupAdminListeners();
        this.loadFromLocalStorage();
    }

    async loadProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            this.products = products;
            this.products.forEach(p => p.quantity = 0);
        } catch (error) {
            console.error('Error loading products:', error);
            // Try to use fallback data from data.json
            alert('Error loading products from server. Please make sure the server is running.');
            this.products = [];
        }
    }

    async loadBlogs() {
        try {
            const response = await fetch(`${API_URL}/blogs`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blogs = await response.json();
            this.blogPosts = blogs;
        } catch (error) {
            console.error('Error loading blogs:', error);
            alert('Error loading blogs from server. Please make sure the server is running.');
            this.blogPosts = [];
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';

        if (!this.products || this.products.length === 0) {
            productsGrid.innerHTML = '<p style="text-align: center; color: #999;">No products available.</p>';
            return;
        }

        this.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Handle image paths correctly - add leading slash for absolute path
            let imageSrc = product.image;
            if (!imageSrc.startsWith('/') && !imageSrc.startsWith('http')) {
                // Add leading slash to make it an absolute path from server root
                imageSrc = '/' + imageSrc;
            }
            
            productCard.innerHTML = `
                <div class="product-image"><img src="${imageSrc}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" onerror="this.src='/uploads/${product.image}'; this.onerror=null;"></div>
                <div class="product-content">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">₦${this.formatPrice(product.price)}</div>
                    <div class="product-footer">
                        <div class="quantity-control">
                            <button class="qty-btn qty-decrease" data-id="${product.id}">−</button>
                            <input type="number" class="qty-input" value="${product.quantity}" min="0" data-id="${product.id}" readonly>
                            <button class="qty-btn qty-increase" data-id="${product.id}">+</button>
                        </div>
                        <button class="btn-add-to-order" data-id="${product.id}">Add to Order</button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });

        // Attach event listeners
        document.querySelectorAll('.qty-increase').forEach(btn => {
            btn.addEventListener('click', (e) => this.increaseQuantity(e.target.dataset.id));
        });

        document.querySelectorAll('.qty-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => this.decreaseQuantity(e.target.dataset.id));
        });

        document.querySelectorAll('.btn-add-to-order').forEach(btn => {
            btn.addEventListener('click', (e) => this.addToOrder(e.target.dataset.id));
        });
    }

    renderBlog() {
        const blogGrid = document.getElementById('blogGrid');
        blogGrid.innerHTML = '';

        if (!this.blogPosts || this.blogPosts.length === 0) {
            blogGrid.innerHTML = '<p style="text-align: center; color: #999;">No blog posts available.</p>';
            return;
        }

        this.blogPosts.forEach(post => {
            const blogCard = document.createElement('div');
            blogCard.className = 'blog-card';
            
            // Handle image paths correctly - add leading slash for absolute path
            let imageSrc = post.image;
            if (!imageSrc.startsWith('/') && !imageSrc.startsWith('http')) {
                // Add leading slash to make it an absolute path from server root
                imageSrc = '/' + imageSrc;
            }
            
            blogCard.innerHTML = `
                <div class="blog-image"><img src="${imageSrc}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" onerror="this.src='/uploads/${post.image}'; this.onerror=null;"></div>
                <div class="blog-content">
                    <div class="blog-date">${post.date}</div>
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                </div>
            `;
            blogGrid.appendChild(blogCard);
        });
    }

    setupEventListeners() {
        document.getElementById('sendOrderBtn').addEventListener('click', () => this.sendOrderWhatsApp());
        document.getElementById('clearOrderBtn').addEventListener('click', () => this.clearOrder());
    }

    setupAdminListeners() {
        // Login modal
        const loginBtn = document.getElementById('adminLoginBtn');
        const loginModal = document.getElementById('adminLoginModal');
        const adminPanel = document.getElementById('adminPanel');
        
        loginBtn.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
        });

        // Close login modal
        loginModal.querySelector('.close').addEventListener('click', () => {
            loginModal.classList.add('hidden');
        });

        // Admin login submit
        document.getElementById('adminLoginSubmitBtn').addEventListener('click', () => {
            this.handleAdminLogin();
        });

        // Enter key for password
        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAdminLogin();
            }
        });

        // Close admin panel
        adminPanel.querySelector('.close').addEventListener('click', () => {
            this.logoutAdmin();
        });

        // Admin logout
        document.getElementById('adminLogoutBtn').addEventListener('click', () => {
            this.logoutAdmin();
        });

        // Admin tabs
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAdminTab(e.target.dataset.tab);
            });
        });

        // Add product
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.addNewProduct();
        });

        // Add blog
        document.getElementById('addBlogBtn').addEventListener('click', () => {
            this.addNewBlog();
        });

        // Click outside modal to close
        window.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                loginModal.classList.add('hidden');
            }
            if (event.target === adminPanel) {
                this.logoutAdmin();
            }
        });
    }

    handleAdminLogin() {
        const passwordInput = document.getElementById('adminPassword');
        const password = passwordInput.value.trim();

        if (!password) {
            alert('Please enter a password!');
            return;
        }

        if (password === ADMIN_PASSWORD) {
            this.isAdminLoggedIn = true;
            document.getElementById('adminLoginModal').classList.add('hidden');
            document.getElementById('adminPanel').classList.remove('hidden');
            passwordInput.value = '';
            this.renderProductsList();
            this.renderBlogsList();
            alert('✅ Admin login successful!');
        } else {
            alert('❌ Invalid password! Please try again.');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    logoutAdmin() {
        this.isAdminLoggedIn = false;
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('adminPassword').value = '';
    }

    switchAdminTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.add('hidden');
            tab.classList.remove('active');
        });

        // Remove active class from all buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const tabElement = document.getElementById(tabName + '-tab');
        if (tabElement) {
            tabElement.classList.remove('hidden');
            tabElement.classList.add('active');
        }

        // Add active class to clicked button
        event.target.classList.add('active');
    }

    async addNewProduct() {
        const name = document.getElementById('productName').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        const priceInput = document.getElementById('productPrice').value.trim();
        const imageFile = document.getElementById('productImage').files[0];

        // Validation
        if (!name) {
            alert('Please enter product name!');
            return;
        }
        if (!description) {
            alert('Please enter product description!');
            return;
        }
        if (!priceInput) {
            alert('Please enter product price!');
            return;
        }
        
        const price = parseInt(priceInput);
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price (positive number)!');
            return;
        }
        
        if (!imageFile) {
            alert('Please select an image!');
            return;
        }

        // Check file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB!');
            return;
        }

        try {
            // Convert image to Base64
            const base64Image = await this.fileToBase64(imageFile);
            const fileName = imageFile.name;

            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price,
                    image: base64Image,
                    fileName: fileName,
                    password: ADMIN_PASSWORD
                })
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to add product');
            }

            // Reload products from server
            await this.loadProducts();
            this.renderProducts();
            this.renderProductsList();
            this.saveToLocalStorage();

            // Clear form
            document.getElementById('productName').value = '';
            document.getElementById('productDescription').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productImage').value = '';

            alert('✅ Product added successfully!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert('❌ Error: ' + error.message);
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async addNewBlog() {
        const title = document.getElementById('blogTitle').value.trim();
        const excerpt = document.getElementById('blogExcerpt').value.trim();
        let date = document.getElementById('blogDate').value;
        const imageFile = document.getElementById('blogImage').files[0];

        // Validation
        if (!title) {
            alert('Please enter blog title!');
            return;
        }
        if (!excerpt) {
            alert('Please enter blog excerpt!');
            return;
        }
        if (!imageFile) {
            alert('Please select an image!');
            return;
        }

        // Check file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB!');
            return;
        }

        if (!date) {
            const today = new Date();
            date = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } else {
            const dateObj = new Date(date);
            date = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        try {
            // Convert image to Base64
            const base64Image = await this.fileToBase64(imageFile);
            const fileName = imageFile.name;

            const response = await fetch(`${API_URL}/blogs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    excerpt,
                    date,
                    image: base64Image,
                    fileName: fileName,
                    password: ADMIN_PASSWORD
                })
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to add blog');
            }

            // Reload blogs from server
            await this.loadBlogs();
            this.renderBlog();
            this.renderBlogsList();
            this.saveToLocalStorage();

            // Clear form
            document.getElementById('blogTitle').value = '';
            document.getElementById('blogExcerpt').value = '';
            document.getElementById('blogDate').value = '';
            document.getElementById('blogImage').value = '';

            alert('✅ Blog post added successfully!');
        } catch (error) {
            console.error('Error adding blog:', error);
            alert('❌ Error: ' + error.message);
        }
    }

    renderProductsList() {
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';

        if (!this.products || this.products.length === 0) {
            productsList.innerHTML = '<p style="text-align: center; color: #999;">No products to delete.</p>';
            return;
        }

        this.products.forEach(product => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'list-item';
            itemDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${product.name}</div>
                    <div class="item-details">Price: ₦${this.formatPrice(product.price)}</div>
                </div>
                <button class="btn-delete" onclick="store.deleteProduct(${product.id})">Delete</button>
            `;
            productsList.appendChild(itemDiv);
        });
    }

    async deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`${API_URL}/products/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: ADMIN_PASSWORD })
                });

                const responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.error || 'Failed to delete product');
                }

                // Reload products from server
                await this.loadProducts();
                this.renderProducts();
                this.renderProductsList();
                this.saveToLocalStorage();
                alert('✅ Product deleted successfully!');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('❌ Error: ' + error.message);
            }
        }
    }

    renderBlogsList() {
        const blogsList = document.getElementById('blogsList');
        blogsList.innerHTML = '';

        if (!this.blogPosts || this.blogPosts.length === 0) {
            blogsList.innerHTML = '<p style="text-align: center; color: #999;">No blog posts to delete.</p>';
            return;
        }

        this.blogPosts.forEach(post => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'list-item';
            itemDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${post.title}</div>
                    <div class="item-details">Date: ${post.date}</div>
                </div>
                <button class="btn-delete" onclick="store.deleteBlog(${post.id})">Delete</button>
            `;
            blogsList.appendChild(itemDiv);
        });
    }

    async deleteBlog(blogId) {
        if (confirm('Are you sure you want to delete this blog post?')) {
            try {
                const response = await fetch(`${API_URL}/blogs/${blogId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: ADMIN_PASSWORD })
                });

                const responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.error || 'Failed to delete blog');
                }

                // Reload blogs from server
                await this.loadBlogs();
                this.renderBlog();
                this.renderBlogsList();
                this.saveToLocalStorage();
                alert('✅ Blog post deleted successfully!');
            } catch (error) {
                console.error('Error deleting blog:', error);
                alert('❌ Error: ' + error.message);
            }
        }
    }

    increaseQuantity(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        if (product) {
            product.quantity++;
            this.updateQuantityDisplay(productId);
        }
    }

    decreaseQuantity(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        if (product && product.quantity > 0) {
            product.quantity--;
            this.updateQuantityDisplay(productId);
        }
    }

    updateQuantityDisplay(productId) {
        const input = document.querySelector(`.qty-input[data-id="${productId}"]`);
        const product = this.products.find(p => p.id === parseInt(productId));
        if (input) {
            input.value = product.quantity;
        }
    }

    addToOrder(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        if (product && product.quantity > 0) {
            this.updateOrderSummary();
            this.saveToLocalStorage();
        }
    }

    updateOrderSummary() {
        const orderItems = document.getElementById('orderItems');
        const orderedProducts = this.products.filter(p => p.quantity > 0);

        if (orderedProducts.length === 0) {
            orderItems.innerHTML = '<p class="empty-order">No items selected</p>';
            this.updateTotals();
            return;
        }

        orderItems.innerHTML = '';
        orderedProducts.forEach(product => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-item';
            const itemTotal = product.price * product.quantity;
            itemDiv.innerHTML = `
                <div class="item-details">
                    <div class="item-name">${product.name}</div>
                    <div class="item-qty">Qty: ${product.quantity}</div>
                </div>
                <div class="item-price">₦${this.formatPrice(itemTotal)}</div>
                <button class="remove-item" data-id="${product.id}">✕</button>
            `;
            orderItems.appendChild(itemDiv);
        });

        // Attach remove listeners
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => this.removeFromOrder(e.target.dataset.id));
        });

        this.updateTotals();
    }

    removeFromOrder(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        if (product) {
            product.quantity = 0;
            this.updateQuantityDisplay(productId);
            this.updateOrderSummary();
            this.saveToLocalStorage();
        }
    }

    updateTotals() {
        const subtotal = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const tax = subtotal * 0;
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `₦${this.formatPrice(subtotal)}`;
        document.getElementById('tax').textContent = `₦${this.formatPrice(tax)}`;
        document.getElementById('total').textContent = `₦${this.formatPrice(total)}`;
    }

    formatPrice(price) {
        return price.toLocaleString('en-NG');
    }

    sendOrderWhatsApp() {
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const address = document.getElementById('customerAddress').value.trim();

        // Validation
        if (!name) {
            alert('❌ Please enter your name!');
            return;
        }
        if (!phone) {
            alert('❌ Please enter your phone number!');
            return;
        }
        if (!address) {
            alert('❌ Please enter your delivery address!');
            return;
        }

        const orderedProducts = this.products.filter(p => p.quantity > 0);
        if (orderedProducts.length === 0) {
            alert('❌ Please add items to your order!');
            return;
        }

        // Validate WhatsApp number
        if (!this.whatsappNumber || this.whatsappNumber.length < 10) {
            alert('❌ WhatsApp number not configured! Please contact the store.');
            return;
        }

        // Calculate totals
        const subtotal = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const tax = subtotal * 0;
        const total = subtotal + tax;

        // Format message
        let message = `*NEW ORDER FROM LUXACOM*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `*Customer Details:*\n`;
        message += `Name: ${name}\n`;
        message += `Phone: ${phone}\n`;
        message += `Address: ${address}\n\n`;
        message += `*Order Items:*\n`;

        orderedProducts.forEach(product => {
            const itemTotal = product.price * product.quantity;
            message += `• ${product.name}\n`;
            message += `  Qty: ${product.quantity} × ₦${this.formatPrice(product.price)} = ₦${this.formatPrice(itemTotal)}\n`;
        });

        message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        message += `*Order Summary:*\n`;
        message += `Subtotal: ₦${this.formatPrice(subtotal)}\n`;
        message += `Tax (10%): ₦${this.formatPrice(tax)}\n`;
        message += `*Total: ₦${this.formatPrice(total)}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `\n⏰ Order Date: ${new Date().toLocaleString()}`;

        try {
            // Encode message for URL
            const encodedMessage = encodeURIComponent(message);

            // WhatsApp API URL (format: https://wa.me/PHONENUMBER?text=MESSAGE)
            const whatsappURL = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

            // Open WhatsApp
            window.open(whatsappURL, '_blank');

            // Clear form after sending
            this.clearOrder();
            alert('✅ Opening WhatsApp... Order details sent!');
        } catch (error) {
            console.error('Error sending order:', error);
            alert('❌ Error sending order. Please try again.');
        }
    }

    clearOrder() {
        // Reset all quantities
        this.products.forEach(p => p.quantity = 0);
        
        // Reset form fields
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerAddress').value = '';

        // Update display
        this.renderProducts();
        this.updateOrderSummary();
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        const orderData = {
            products: this.products.map(p => ({ id: p.id, quantity: p.quantity })),
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            customerAddress: document.getElementById('customerAddress').value
        };
        localStorage.setItem('luxacomOrder', JSON.stringify(orderData));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('luxacomOrder');
        if (saved) {
            const orderData = JSON.parse(saved);
            
            // Restore quantities
            orderData.products.forEach(savedItem => {
                const product = this.products.find(p => p.id === savedItem.id);
                if (product) {
                    product.quantity = savedItem.quantity;
                }
            });

            // Restore form data
            if (orderData.customerName) {
                document.getElementById('customerName').value = orderData.customerName;
            }
            if (orderData.customerPhone) {
                document.getElementById('customerPhone').value = orderData.customerPhone;
            }
            if (orderData.customerAddress) {
                document.getElementById('customerAddress').value = orderData.customerAddress;
            }

            // Update displays
            this.renderProducts();
            this.updateOrderSummary();
        }
    }
}

// Initialize store when DOM is loaded
let store; // Global variable to access store from HTML
document.addEventListener('DOMContentLoaded', () => {
    store = new InteriorStore();
});
