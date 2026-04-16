// TheBoys Fashion Store - Main JavaScript
import { theme, lazyLoadImages } from './utils.js';
import { cart, updateCartBadge } from './cart.js';
import { formatPrice, generateStars, storage } from './utils.js';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initMobileMenu();
  lazyLoadImages();
  updateCartBadge();
});

// Initialize theme
const initTheme = () => {
  theme.init();
  
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = theme.toggle();
      themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
    
    // Set initial icon
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  }
};

// Initialize navbar
const initNavbar = () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
  });
};

// Initialize mobile menu
const initMobileMenu = () => {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      toggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
};

// Load products from JSON
export async function loadProducts(){

  try {
    const response = await fetch("http://localhost:3000/api/products");

    const products = await response.json();

    console.log("Products from API:", products);

    return products;

  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }

}
export async function loadMenProducts() {

  const products = await loadProducts();

  const menProducts = products.filter(p => p.category === "men");

  return menProducts;

}
export async function showAllProducts(){

const products = await loadProducts();

const container = document.getElementById("products-grid");

if(!container) return;

container.innerHTML = products.map(p => `

<div class="product-card">

<img src="${p.image_url}" width="200">

<h3>${p.name}</h3>

<p>${p.brand}</p>

<p>₹${p.price}</p>

</div>

`).join("");

}

export async function showMenProducts(){

const products = await loadProducts();

const menProducts = products.filter(p => p.category === "men");

const container = document.getElementById("products-grid");

if(!container) return;

container.innerHTML = menProducts.map(p => `

<div class="product-card">

<img src="${p.image_url}" width="200">

<h3>${p.name}</h3>

<p>${p.brand}</p>

<p>₹${p.price}</p>

</div>

`).join("");

}
//update wishlistcount//
function updateWishlistBadge() {
  const badge = document.querySelector('.wishlist-badge');
  if (!badge) return;

  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (wishlist.length > 0) {
    badge.style.display = "inline-block";
    badge.textContent = wishlist.length;
  } else {
    badge.style.display = "none";
  }
}
// Render product cards
export const renderProductCards = (products, container) => {

  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="no-products">
        <h3>No products found</h3>
        <p>Try adjusting your filters</p>
      </div>
    `;
    return;
  }

  const wishlist = storage.get('wishlist') || [];

  container.innerHTML = products.map(product => {

    const isWishlisted = wishlist.some(item => item.id === product.id);

    return `
      <div class="product-card" data-product-id="${product.id}">

        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" 
                data-product-id="${product.id}">
          ${isWishlisted ? '♥' : '♡'}
        </button>

        <div class="product-image-wrapper">
          <img src="${product.image_url}" 
               alt="${product.name}" 
               loading="lazy">
        </div>

        <div class="product-info">

          <div class="product-brand">${product.brand}</div>

          <h3 class="product-name">${product.name}</h3>

          <div class="product-rating">
            ⭐⭐⭐⭐☆
          </div>
          <div class="product-price">
  <span class="price-current">₹${product.price}</span>
</div>

<div class="product-actions">

<button class="cart-btn" data-product-id="${product.id}">
Add to Cart
</button>

<button class="buy-btn" data-product-id="${product.id}">
Buy Now
</button>

</div>

        </div>

      </div>
    `;

  }).join("");

//

  // Wishlist click
  container.querySelectorAll('.wishlist-btn').forEach(btn => {

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const productId = parseInt(btn.dataset.productId);
    let wishlist = storage.get('wishlist') || [];

    const index = wishlist.findIndex(item => item.id === productId);

    if (index > -1) {
      // ❌ REMOVE from wishlist
      wishlist.splice(index, 1);

      btn.classList.remove('active');
      btn.textContent = '♡';

      // 🔥 If we are in wishlist page → remove card instantly
      const card = btn.closest('.product-card');
      if (card) card.remove();

    } else {
      // ❤️ ADD to wishlist
      const product = products.find(p => p.id === productId);
      wishlist.push(product);

      btn.classList.add('active');
      btn.textContent = '♥';
    }

    storage.set('wishlist', wishlist);

  });

});
  container.querySelectorAll('.cart-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const productId = parseInt(btn.dataset.productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Use default size, color, quantity
    const size = product.sizes ? product.sizes[0] : "M";
    const color = product.colors ? product.colors[0] : "Default";
    const qty = 1;

    cart.addItem(product, size, color, qty);
    updateCartBadge();

    Swal.fire({
      icon: "success",
      title: "Added to Cart",
      timer: 1200,
      showConfirmButton: false
    });
  });
});

// Buy Now
container.querySelectorAll('.buy-btn').forEach(btn => {

  btn.addEventListener('click', (e) => {

    e.stopPropagation();

    const productId = parseInt(btn.dataset.productId);

    // ✅ Get product object
    const product = products.find(p => p.id === productId);

    if (!product) {
      console.log("Product not found");
      return;
    }

    // ✅ Get user inputs
    const size = container.querySelector(`.size-select[data-product-id="${productId}"]`)?.value || "M";
    const color = container.querySelector(`.color-select[data-product-id="${productId}"]`)?.value || "Black";
    const qty = parseInt(container.querySelector(`.qty-input[data-product-id="${productId}"]`)?.value) || 1;

    // ✅ Save to localStorage
    localStorage.setItem("buyNowProduct", JSON.stringify({
      product,
      size,
      color,
      qty
    }));

    console.log("Saved BuyNow:", { product, size, color, qty });

    // ✅ Redirect ONCE
    window.location.href = "checkout.html";

  });

});
  // Product click → go to detail page
  container.querySelectorAll('.product-card').forEach(card => {

    card.addEventListener('click', () => {

      const productId = card.dataset.productId;

      window.location.href = `product-detail.html?id=${productId}`;

    });

  });

};

// Pagination
export const renderPagination = (currentPage, totalPages, container) => {
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // Previous button
  paginationHTML += `
    <button class="pagination-btn" data-page="${currentPage - 1}" 
            ${currentPage === 1 ? 'disabled' : ''}>
      ‹
    </button>
  `;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      paginationHTML += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                data-page="${i}">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
  }
  
  // Next button
  paginationHTML += `
    <button class="pagination-btn" data-page="${currentPage + 1}" 
            ${currentPage === totalPages ? 'disabled' : ''}>
      ›
    </button>
  `;
  
  container.innerHTML = paginationHTML;
  
  // Attach event listeners
  container.querySelectorAll('.pagination-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = parseInt(e.target.dataset.page);
      if (page >= 1 && page <= totalPages) {
        window.location.href = `${window.location.pathname}?page=${page}`;
      }
    });
  });
};

