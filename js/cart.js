// TheBoys Fashion Store - Cart Management

import { storage, formatPrice, showNotification } from './utils.js';

class Cart {
  constructor() {
    this.items = this.loadCart();
    this.listeners = [];
  }
  
  loadCart() {
    return storage.get('cart') || [];
  }
  
  saveCart() {
    storage.set('cart', this.items);
    this.notifyListeners();
  }
  
  addItem(product, size, color, quantity = 1) {
    const existingItemIndex = this.items.findIndex(
      item => item.id === product.id && item.size === size && item.color === color
    );
    
    if (existingItemIndex > -1) {
      this.items[existingItemIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image_url,
        size,
        color,
        quantity
      });
    }
    
    this.saveCart();
    showNotification(`${product.name} added to cart`, 'success');
    return this.items;
  }
  
  removeItem(itemId, size, color) {
    this.items = this.items.filter(
      item => !(item.id === itemId && item.size === size && item.color === color)
    );
    this.saveCart();
    showNotification('Item removed from cart', 'success');
    return this.items;
  }
  
  updateQuantity(itemId, size, color, quantity) {
    const item = this.items.find(
      item => item.id === itemId && item.size === size && item.color === color
    );
    
    if (item) {
      if (quantity <= 0) {
        return this.removeItem(itemId, size, color);
      }
      item.quantity = quantity;
      this.saveCart();
    }
    
    return this.items;
  }
  
  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
  
  clear() {
    this.items = [];
    this.saveCart();
  }
  
  subscribe(callback) {
    this.listeners.push(callback);
  }
  
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.items));
  }
}

// Create singleton instance
export const cart = new Cart();

// Update cart badge in navbar
export const updateCartBadge = () => {
  const badges = document.querySelectorAll('.cart-badge');
  const count = cart.getItemCount();
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
};

// Initialize cart badge
cart.subscribe(() => {
  updateCartBadge();
});

// Update badge on load
if (typeof document !== 'undefined') {
  updateCartBadge();
}

// Render cart items
export const renderCartItems = (container) => {
  if (!container) return;
  
  const items = cart.items;
  
  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Add some items to get started!</p>
        <a href="products.html" class="btn btn-primary">Continue Shopping</a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-brand">${item.brand}</p>
        <div class="cart-item-variants">
          <span>Size: ${item.size}</span>
          <span>Color: ${item.color}</span>
        </div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-controls">
          <button class="qty-btn" data-action="decrease">-</button>
          <input type="number" class="qty-input" value="${item.quantity}" min="1" readonly>
          <button class="qty-btn" data-action="increase">+</button>
        </div>
        <button class="remove-item-btn" aria-label="Remove item">×</button>
      </div>
    </div>
  `).join('');
  
  // Attach event listeners
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cartItem = e.target.closest('.cart-item');
      const itemId = parseInt(cartItem.dataset.id);
      const size = cartItem.dataset.size;
      const color = cartItem.dataset.color;
      const action = e.target.dataset.action;
      const qtyInput = cartItem.querySelector('.qty-input');
      let quantity = parseInt(qtyInput.value);
      
      if (action === 'increase') {
        quantity += 1;
      } else if (action === 'decrease') {
        quantity -= 1;
      }
      
      cart.updateQuantity(itemId, size, color, quantity);
      renderCartItems(container);
      updateCartSummary();
    });
  });
  
  container.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cartItem = e.target.closest('.cart-item');
      const itemId = parseInt(cartItem.dataset.id);
      const size = cartItem.dataset.size;
      const color = cartItem.dataset.color;
      
      cart.removeItem(itemId, size, color);
      renderCartItems(container);
      updateCartSummary();
    });
  });
};

// Update cart summary
export const updateCartSummary = () => {
  const subtotalEl = document.getElementById('cart-subtotal');
  const taxEl = document.getElementById('cart-tax');
  const shippingEl = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');
  
  if (!subtotalEl) return;
  
  const subtotal = cart.getTotal();
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 5000 ? 0 : 99;
  const total = subtotal + tax + shipping;
  
  subtotalEl.textContent = formatPrice(subtotal);
  taxEl.textContent = formatPrice(tax);
  shippingEl.textContent = formatPrice(shipping);
  totalEl.textContent = formatPrice(total);
};

// Apply coupon (client-side validation)
export const applyCoupon = (code) => {
  const coupons = {
    'WELCOME10': 10,
    'SAVE20': 20,
    'PREMIUM30': 30,
    'FASHION50': 50
  };
  
  const discount = coupons[code.toUpperCase()];
  if (discount) {
    return { success: true, discount };
  }
  return { success: false, message: 'Invalid coupon code' };
};

