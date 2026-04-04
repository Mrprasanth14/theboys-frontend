// TheBoys Fashion Store - Product Detail Page

import { formatPrice, generateStars, storage, showNotification } from './utils.js';
import { cart } from './cart.js';

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentImageIndex = 0;

// Load product details
export const loadProductDetail = async (productId) => {
  try {
    const response = await fetch('/data/products.json');
    const products = await response.json();
    const product = products.find(p => p.id === parseInt(productId));
    
    if (!product) {
      showNotification('Product not found', 'error');
      window.location.href = 'products.html';
      return;
    }
    
    currentProduct = product;
    selectedColor = product.colors[0];
    renderProductDetail(product);
    addToRecentlyViewed(product);
    
    // Store current product globally for review submission
    window.currentProduct = product;
  } catch (error) {
    console.error('Error loading product:', error);
    showNotification('Error loading product', 'error');
  }
};

// Render product detail page
const renderProductDetail = (product) => {
  const container = document.getElementById('product-detail-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="product-detail">
      <div class="product-gallery">
        <div class="gallery-main">
          <img id="main-product-image" src="${product.images[0]}" alt="${product.name}" loading="eager">
          <button class="zoom-btn" aria-label="Zoom image">🔍</button>
        </div>
        <div class="gallery-thumbnails">
          ${product.images.map((img, index) => `
            <img src="${img}" alt="${product.name} view ${index + 1}" 
                 class="thumbnail ${index === 0 ? 'active' : ''}" 
                 data-index="${index}" loading="lazy">
          `).join('')}
        </div>
      </div>
      
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <h1 class="product-title">${product.name}</h1>
        
        <div class="product-rating">
          ${generateStars(product.rating)}
          <span>${product.rating}</span>
          <span class="review-count">(${product.reviews} reviews)</span>
        </div>
        
        <div class="product-pricing">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `
            <span class="price-original">${formatPrice(product.originalPrice)}</span>
            <span class="price-discount">${product.discount}% OFF</span>
          ` : ''}
        </div>
        
        <div class="product-description">
          <p>${product.description}</p>
        </div>
        
        <div class="product-variants">
          <div class="variant-group">
            <label>Size:</label>
            <div class="variant-options">
              ${product.sizes.map(size => `
                <button class="variant-btn size-btn ${size === selectedSize ? 'active' : ''}" 
                        data-size="${size}">${size}</button>
              `).join('')}
            </div>
          </div>
          
          <div class="variant-group">
            <label>Color:</label>
            <div class="variant-options">
              ${product.colors.map(color => `
                <button class="variant-btn color-btn ${color === selectedColor ? 'active' : ''}" 
                        data-color="${color}"
                        style="background-color: ${getColorHex(color)};">
                  ${color}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="product-actions">
          <button class="btn btn-primary add-to-cart-btn" style="flex: 1;">
            Add to Cart
          </button>
          <button class="wishlist-btn-detail" data-product-id="${product.id}">
            <span>♡</span>
          </button>
        </div>
        
        <div class="product-features">
          <div class="feature-item">
            <span>✓</span> Free Shipping on orders above ₹5000
          </div>
          <div class="feature-item">
            <span>✓</span> Easy Returns & Exchanges
          </div>
          <div class="feature-item">
            <span>✓</span> Authentic Products Guaranteed
          </div>
        </div>
      </div>
    </div>
    
    <div class="product-reviews-section">
      <h2>Customer Reviews</h2>
      <div class="reviews-list" id="reviews-list">
        ${generateSampleReviews(product.rating, product.reviews)}
      </div>
      
      <div class="review-form-section" style="margin-top: var(--spacing-xl); padding-top: var(--spacing-xl); border-top: 1px solid var(--border-color);">
        <h3 style="margin-bottom: var(--spacing-md);">Write a Review</h3>
        <form id="review-form" style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--border-radius);">
          <div class="form-group" style="margin-bottom: var(--spacing-md);">
            <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 500;">Your Name</label>
            <input type="text" id="reviewer-name" class="form-input" placeholder="Enter your name" required>
          </div>
          <div class="form-group" style="margin-bottom: var(--spacing-md);">
            <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 500;">Rating</label>
            <div class="rating-input" style="display: flex; gap: var(--spacing-xs);">
              ${[1,2,3,4,5].map(i => `<span class="star-input" data-rating="${i}" style="font-size: 2rem; cursor: pointer; color: var(--text-light);">★</span>`).join('')}
            </div>
            <input type="hidden" id="review-rating" value="5" required>
          </div>
          <div class="form-group" style="margin-bottom: var(--spacing-md);">
            <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 500;">Your Review</label>
            <textarea id="review-comment" class="form-input" rows="4" placeholder="Share your experience..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Submit Review</button>
        </form>
      </div>
    </div>
    
    <div class="product-recommendations" style="margin-top: var(--spacing-2xl); padding-top: var(--spacing-xl); border-top: 1px solid var(--border-color);">
      <h2 style="margin-bottom: var(--spacing-lg);">Customers Also Bought</h2>
      <div class="products-grid" id="recommendations-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--spacing-md);">
        <!-- Recommendations will be loaded here -->
      </div>
    </div>
  `;
  
  attachProductDetailEvents();
  loadAndRenderRecommendations(product.id, product.category);
  attachReviewFormEvents(product.id);
};

// Load and render recommendations
const loadAndRenderRecommendations = async (productId, category) => {
  const recommendations = await loadRecommendations(productId, category);
  const container = document.getElementById('recommendations-grid');
  
  if (!container || recommendations.length === 0) return;
  
  const { renderProductCards } = await import('./main.js');
  renderProductCards(recommendations, container);
};

// Attach review form events
const attachReviewFormEvents = (productId) => {
  const reviewForm = document.getElementById('review-form');
  const starInputs = document.querySelectorAll('.star-input');
  const ratingInput = document.getElementById('review-rating');
  
  // Star rating selection
  starInputs.forEach((star, index) => {
    star.addEventListener('click', () => {
      const rating = index + 1;
      ratingInput.value = rating;
      starInputs.forEach((s, i) => {
        s.style.color = i < rating ? 'var(--accent)' : 'var(--text-light)';
      });
    });
    
    star.addEventListener('mouseenter', () => {
      const rating = index + 1;
      starInputs.forEach((s, i) => {
        s.style.color = i < rating ? 'var(--accent)' : 'var(--text-light)';
      });
    });
  });
  
  // Reset stars on mouse leave
  document.querySelector('.rating-input')?.addEventListener('mouseleave', () => {
    const currentRating = parseInt(ratingInput.value);
    starInputs.forEach((s, i) => {
      s.style.color = i < currentRating ? 'var(--accent)' : 'var(--text-light)';
    });
  });
  
  // Submit review
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reviewer-name').value;
      const rating = parseInt(ratingInput.value);
      const comment = document.getElementById('review-comment').value;
      
      submitReview(productId, rating, comment, name);
      showNotification('Thank you for your review!', 'success');
      
      // Reload reviews
      const reviewsList = document.getElementById('reviews-list');
      if (reviewsList) {
        reviewsList.innerHTML = generateSampleReviews(window.currentProduct?.rating || 4.5, (window.currentProduct?.reviews || 0) + 1);
      }
      
      // Reset form
      reviewForm.reset();
      ratingInput.value = 5;
      starInputs.forEach(s => s.style.color = 'var(--text-light)');
    });
  }
};

// Attach event listeners
const attachProductDetailEvents = () => {
  // Thumbnail click
  document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      currentImageIndex = index;
      updateMainImage(currentProduct.images[index]);
      
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  
  // Size selection
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedSize = e.target.dataset.size;
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  
  // Color selection
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedColor = e.target.dataset.color;
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  
  // Add to cart
 // Add to cart
const addToCartBtn = document.querySelector(".add-to-cart-btn");

addToCartBtn.addEventListener("click", () => {

  const selectedSize = document.querySelector(".size-btn.active")?.dataset.size;
  const selectedColor = document.querySelector(".color-btn.active")?.dataset.color;

  if (!selectedSize || !selectedColor) {
    showNotification("Please select size and color", "error");
    return;
  }

  cart.addItem(currentProduct, selectedSize, selectedColor, 1);

  showNotification("Product added to cart", "success");

});
  // Wishlist toggle
  const wishlistBtn = document.querySelector('.wishlist-btn-detail');
  if (wishlistBtn) {
    const isWishlisted = isInWishlist(currentProduct.id);
    if (isWishlisted) {
      wishlistBtn.classList.add('active');
      wishlistBtn.querySelector('span').textContent = '♥';
    }
    
    wishlistBtn.addEventListener('click', () => {
      toggleWishlist(currentProduct.id);
      const isActive = wishlistBtn.classList.contains('active');
      wishlistBtn.classList.toggle('active');
      wishlistBtn.querySelector('span').textContent = isActive ? '♡' : '♥';
      showNotification(isActive ? 'Removed from wishlist' : 'Added to wishlist', 'success');
    });
  }
  
    // Image zoom with lens effect
    const zoomBtn = document.querySelector('.zoom-btn');
    const mainImage = document.getElementById('main-product-image');
    const galleryMain = document.querySelector('.gallery-main');
    
    if (zoomBtn && mainImage && galleryMain) {
      zoomBtn.addEventListener('click', () => {
        openImageModal(currentProduct.images[currentImageIndex]);
      });
      
      // Lens zoom effect
      if (window.innerWidth > 768) {
        initLensZoom(mainImage, galleryMain);
      }
    }
};

// Update main image
const updateMainImage = (src) => {
  const mainImage = document.getElementById('main-product-image');
  if (mainImage) {
    mainImage.src = src;
  }
};

// Get color hex code
const getColorHex = (colorName) => {
  const colorMap = {
    'White': '#ffffff',
    'Black': '#000000',
    'Navy Blue': '#001f3f',
    'Navy': '#001f3f',
    'Blue': '#0066cc',
    'Light Blue': '#87ceeb',
    'Red': '#ff0000',
    'Pink': '#ffc0cb',
    'Green': '#008000',
    'Yellow': '#ffff00',
    'Gray': '#808080',
    'Beige': '#f5f5dc',
    'Brown': '#8b4513',
    'Khaki': '#c3b091',
    'Olive': '#808000',
    'Coral': '#ff7f50',
    'Mint': '#98ff98',
    'Lavender': '#e6e6fa',
    'Purple': '#800080',
    'Gold': '#ffd700',
    'Silver': '#c0c0c0',
    'Rose Gold': '#e8b4b8',
    'Tortoise': '#8b4513',
    'Multicolor': 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)'
  };
  return colorMap[colorName] || '#cccccc';
};

// Open image modal
const openImageModal = (imageSrc) => {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 90vw; max-height: 90vh;">
      <button class="modal-close">×</button>
      <img src="${imageSrc}" alt="Product image" style="width: 100%; height: auto;">
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

// Wishlist functions
const isInWishlist = (productId) => {
  const wishlist = storage.get('wishlist') || [];
  return wishlist.includes(productId);
};

const toggleWishlist = (productId) => {
  let wishlist = storage.get('wishlist') || [];
  const index = wishlist.indexOf(productId);
  
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
  }
  
  storage.set('wishlist', wishlist);
};

// Add to recently viewed
const addToRecentlyViewed = (product) => {
  let recent = storage.get('recentlyViewed') || [];
  recent = recent.filter(id => id !== product.id);
  recent.unshift(product.id);
  recent = recent.slice(0, 10); // Keep only last 10
  storage.set('recentlyViewed', recent);
};

// Lens zoom effect
const initLensZoom = (img, container) => {
  const lens = document.createElement('div');
  lens.className = 'zoom-lens';
  container.appendChild(lens);
  
  const zoomResult = document.createElement('div');
  zoomResult.className = 'zoom-result';
  const zoomImg = document.createElement('img');
  zoomImg.src = img.src;
  zoomResult.appendChild(zoomImg);
  container.appendChild(zoomResult);
  
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lensSize = 150;
    const lensX = x - lensSize / 2;
    const lensY = y - lensSize / 2;
    
    const maxX = rect.width - lensSize;
    const maxY = rect.height - lensSize;
    
    const finalX = Math.max(0, Math.min(lensX, maxX));
    const finalY = Math.max(0, Math.min(lensY, maxY));
    
    lens.style.display = 'block';
    lens.style.width = lensSize + 'px';
    lens.style.height = lensSize + 'px';
    lens.style.left = finalX + 'px';
    lens.style.top = finalY + 'px';
    
    const zoomX = -(finalX / rect.width) * (zoomImg.width - rect.width);
    const zoomY = -(finalY / rect.height) * (zoomImg.height - rect.height);
    
    zoomImg.style.transform = `translate(${zoomX}px, ${zoomY}px)`;
  });
  
  container.addEventListener('mouseleave', () => {
    lens.style.display = 'none';
  });
};

// Load product recommendations
export const loadRecommendations = async (currentProductId, category) => {
  try {
    const response = await fetch('/data/products.json');
    const products = await response.json();
    const recommendations = products
      .filter(p => p.id !== currentProductId && p.category === category)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    return recommendations;
  } catch (error) {
    console.error('Error loading recommendations:', error);
    return [];
  }
};

// Generate sample reviews
const generateSampleReviews = (rating, totalReviews) => {
  const savedReviews = storage.get(`reviews_${currentProduct?.id}`) || [];
  const sampleReviews = [
    { name: 'Sarah M.', rating: 5, comment: 'Absolutely love this product! Quality is exceptional and fits perfectly.', date: '2024-01-15' },
    { name: 'John D.', rating: 4, comment: 'Great product, fast shipping. Highly recommend!', date: '2024-01-10' },
    { name: 'Emma L.', rating: 5, comment: 'Exceeded my expectations. Will definitely buy again.', date: '2024-01-08' },
    { name: 'Michael K.', rating: 4, comment: 'Good quality and value for money. Satisfied with the purchase.', date: '2024-01-05' }
  ];
  
  const allReviews = [...savedReviews, ...sampleReviews].slice(0, Math.max(4, totalReviews));
  
  return allReviews.map(review => `
    <div class="review-item">
      <div class="review-header">
        <div>
          <strong>${review.name}</strong>
          <span style="font-size: 0.875rem; color: var(--text-secondary); margin-left: var(--spacing-xs);">${review.date || ''}</span>
        </div>
        <div class="review-rating">${generateStars(review.rating)}</div>
      </div>
      <p class="review-comment">${review.comment}</p>
    </div>
  `).join('');
};

// Submit review
export const submitReview = (productId, rating, comment, name) => {
  const reviews = storage.get(`reviews_${productId}`) || [];
  const newReview = {
    name: name || 'Anonymous',
    rating,
    comment,
    date: new Date().toISOString().split('T')[0]
  };
  reviews.unshift(newReview);
  storage.set(`reviews_${productId}`, reviews);
  return newReview;
};

