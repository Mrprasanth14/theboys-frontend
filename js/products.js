//  <script type="module" src="js/main.js"></script>
//   <script type="module">
//     import { loadProducts, renderProductCards, renderPagination } from './js/main.js';
//     import { ProductFilters, initFilters } from './js/filters.js';
//     import { getURLParams } from './js/utils.js';
    
    
//     let filterManager;
//     let currentPage = 1;
//     const itemsPerPage = 12;
    
//     async function initProductsPage() {
//       const products = await loadProducts();
//       filterManager = new ProductFilters(products);
      
//       // Check URL params
//       const params = getURLParams();
//       if (params.category) {
//         filterManager.setFilter('category', params.category);
//         document.querySelector(`[data-filter="category"][data-value="${params.category}"]`)?.classList.add('active');
//       }
//       if (params.page) {
//         currentPage = parseInt(params.page);
//       }
      
//       // Populate filter options
//       populateFilterOptions(products);
      
//       // Initialize filters
//       initFilters(filterManager, () => {
//         currentPage = 1;
//         renderProducts();
//       });
      
//       // Reset filters button
//       document.getElementById('reset-filters').addEventListener('click', () => {
//         filterManager.resetFilters();
//         document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
//         renderProducts();
//       });
      
//       renderProducts();
//     }
    
//     function populateFilterOptions(products) {

//   // Sizes (if exist)
//   const sizes = [...new Set(products.flatMap(p => p.sizes || []))].sort();
//   const sizeContainer = document.getElementById('size-filters');

//   if(sizes.length > 0){
//     sizeContainer.innerHTML = sizes.map(size => 
//       `<button class="filter-chip" data-filter="size" data-value="${size}">${size}</button>`
//     ).join('');
//   } else {
//     sizeContainer.innerHTML = "";
//   }

//   // Colors (if exist)
//   const colors = [...new Set(products.flatMap(p => p.colors || []))].sort();
//   const colorContainer = document.getElementById('color-filters');

//   if(colors.length > 0){
//     colorContainer.innerHTML = colors.map(color => 
//       `<button class="filter-chip" data-filter="color" data-value="${color}">${color}</button>`
//     ).join('');
//   } else {
//     colorContainer.innerHTML = "";
//   }

//   // Brands
//   const brands = [...new Set(products.map(p => p.brand))].sort();
//   const brandContainer = document.getElementById('brand-filters');

//   brandContainer.innerHTML = brands.map(brand => 
//     `<button class="filter-chip" data-filter="brand" data-value="${brand}">${brand}</button>`
//   ).join('');
// }
    
//     function renderProducts() {
//       const filtered = filterManager.filteredProducts;
//       const totalPages = Math.ceil(filtered.length / itemsPerPage);
//       const start = (currentPage - 1) * itemsPerPage;
//       const end = start + itemsPerPage;
//       const pageProducts = filtered.slice(start, end);
      
//       renderProductCards(pageProducts, document.getElementById('products-grid'));
//       renderPagination(currentPage, totalPages, document.getElementById('pagination'));
      
//       document.getElementById('products-count').textContent = 
//         `Showing ${start + 1}-${Math.min(end, filtered.length)} of ${filtered.length} products`;
//     }
    
//     initProductsPage();