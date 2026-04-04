// TheBoys Fashion Store - Filter & Sort Management

import { debounce } from './utils.js';

export class ProductFilters {
  constructor(products) {
    this.allProducts = products;
    this.filteredProducts = [...products];
    this.filters = {
      category: null,
      size: [],
      color: [],
      brand: [],
      priceRange: [0, 50000],
      discount: null,
      search: ''
    };
    this.sortBy = 'popularity';
  }
  
  applyFilters() {
    let filtered = [...this.allProducts];
    
    // Category filter
    if (this.filters.category) {
      filtered = filtered.filter(p => p.category === this.filters.category);
    }
    
    // Size filter
    if (this.filters.size.length > 0) {
      filtered = filtered.filter(p => 
        this.filters.size.some(size => p.sizes.includes(size))
      );
    }
    
    // Color filter
    if (this.filters.color.length > 0) {
      filtered = filtered.filter(p => 
        this.filters.color.some(color => p.colors.includes(color))
      );
    }
    
    // Brand filter
    if (this.filters.brand.length > 0) {
      filtered = filtered.filter(p => 
        this.filters.brand.includes(p.brand)
      );
    }
    
    // Price range filter
    filtered = filtered.filter(p => 
      p.price >= this.filters.priceRange[0] && 
      p.price <= this.filters.priceRange[1]
    );
    
    // Discount filter
    if (this.filters.discount !== null) {
      filtered = filtered.filter(p => 
        p.discount >= this.filters.discount
      );
    }
    
    // Search filter
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    this.filteredProducts = filtered;
    this.sortProducts();
    return this.filteredProducts;
  }
  
  sortProducts() {
    switch (this.sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => b.id - a.id);
        break;
      case 'popularity':
      default:
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
    }
  }
  
  setFilter(key, value) {
    if (Array.isArray(this.filters[key])) {
      const index = this.filters[key].indexOf(value);
      if (index > -1) {
        this.filters[key].splice(index, 1);
      } else {
        this.filters[key].push(value);
      }
    } else {
      this.filters[key] = value;
    }
    return this.applyFilters();
  }
  
  setSort(sortBy) {
    this.sortBy = sortBy;
    this.sortProducts();
    return this.filteredProducts;
  }
  
  getUniqueValues(key) {
    const values = new Set();
    this.allProducts.forEach(product => {
      if (Array.isArray(product[key])) {
        product[key].forEach(val => values.add(val));
      } else {
        values.add(product[key]);
      }
    });
    return Array.from(values).sort();
  }
  
  resetFilters() {
    this.filters = {
      category: null,
      size: [],
      color: [],
      brand: [],
      priceRange: [0, 50000],
      discount: null,
      search: ''
    };
    this.sortBy = 'popularity';
    return this.applyFilters();
  }
}

// Initialize filters UI
export const initFilters = (filterManager, onFilterChange) => {
  // Category filter
  document.querySelectorAll('[data-filter="category"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.value;
      filterManager.setFilter('category', category);
      onFilterChange();
      
      // Update active state
      document.querySelectorAll('[data-filter="category"]').forEach(b => {
        b.classList.remove('active');
      });
      e.target.classList.add('active');
    });
  });
  
  // Size filter
  document.querySelectorAll('[data-filter="size"]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const size = e.target.dataset.value;
      filterManager.setFilter('size', size);
      onFilterChange();
      e.target.classList.toggle('active');
    });
  });
  
  // Color filter
  document.querySelectorAll('[data-filter="color"]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const color = e.target.dataset.value;
      filterManager.setFilter('color', color);
      onFilterChange();
      e.target.classList.toggle('active');
    });
  });
  
  // Brand filter
  document.querySelectorAll('[data-filter="brand"]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const brand = e.target.dataset.value;
      filterManager.setFilter('brand', brand);
      onFilterChange();
      e.target.classList.toggle('active');
    });
  });
  
  // Price range filter
  const priceRangeInput = document.getElementById('price-range');
  if (priceRangeInput) {
    priceRangeInput.addEventListener('input', debounce((e) => {
      const value = parseInt(e.target.value);
      filterManager.filters.priceRange[1] = value;
      filterManager.applyFilters();
      onFilterChange();
      
      const priceDisplay = document.getElementById('price-display');
      if (priceDisplay) {
        priceDisplay.textContent = `Up to ₹${value.toLocaleString()}`;
      }
    }, 300));
  }
  
  // Discount filter
  document.querySelectorAll('[data-filter="discount"]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const discount = parseInt(e.target.dataset.value);
      filterManager.filters.discount = discount;
      filterManager.applyFilters();
      onFilterChange();
      
      document.querySelectorAll('[data-filter="discount"]').forEach(b => {
        b.classList.remove('active');
      });
      e.target.classList.add('active');
    });
  });
  
  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      filterManager.setSort(e.target.value);
      onFilterChange();
    });
  }
  
  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filterManager.filters.search = e.target.value;
      filterManager.applyFilters();
      onFilterChange();
    }, 300));
  }
};



