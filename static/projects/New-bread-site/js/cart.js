// Enhanced Cart functionality using LocalStorage
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('bakery_cart')) || [];
        this.init();
    }

    init() {
        // Bind UI Events
        document.addEventListener('DOMContentLoaded', () => {
            this.cartIcon = document.getElementById('cart-icon');
            this.cartOverlay = document.getElementById('cart-overlay');
            this.cartSidebar = document.getElementById('cart-sidebar');
            this.closeCartBtn = document.getElementById('close-cart');
            this.cartItemsContainer = document.getElementById('cart-items');
            this.cartCountElements = document.querySelectorAll('.cart-count');
            this.cartTotalElement = document.getElementById('cart-total-price');

            if (this.cartIcon) {
                this.cartIcon.addEventListener('click', () => this.toggleCart());
            }
            if (this.closeCartBtn) {
                this.closeCartBtn.addEventListener('click', () => this.toggleCart());
            }
            if (this.cartOverlay) {
                this.cartOverlay.addEventListener('click', () => this.toggleCart());
            }
            
            this.render();
        });
    }

    saveCart() {
        localStorage.setItem('bakery_cart', JSON.stringify(this.items));
        this.render();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        
        // Open cart briefly to show addition
        if (this.cartSidebar && !this.cartSidebar.classList.contains('active')) {
             this.toggleCart();
             setTimeout(() => {
                 if (this.cartSidebar.classList.contains('active')) {
                     this.toggleCart();
                 }
             }, 2000);
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
        }
    }

    getCartTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getCartCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    toggleCart() {
        if (this.cartSidebar && this.cartOverlay) {
            this.cartSidebar.classList.toggle('active');
            this.cartOverlay.classList.toggle('active');
            // Prevent body scroll when cart is open
            document.body.style.overflow = this.cartSidebar.classList.contains('active') ? 'hidden' : '';
        }
    }

    render() {
        if (!this.cartItemsContainer) return;

        // Update counts
        const count = this.getCartCount();
        this.cartCountElements.forEach(el => el.textContent = count);

        // Update Total
        if (this.cartTotalElement) {
            this.cartTotalElement.textContent = `$${this.getCartTotal().toFixed(2)}`;
        }

        // Render Items
        if (this.items.length === 0) {
            this.cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is currently empty.</div>';
            return;
        }

        this.cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn minus" onclick="CartControl.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn plus" onclick="CartControl.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button class="remove-btn" onclick="CartControl.removeItem('${item.id}')">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Global instance
const CartControl = new ShoppingCart();
