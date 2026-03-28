/* ---------------------- */
/* PRODUCT MODAL ELEMENTS */
/* ---------------------- */

const addProductModal = document.getElementById("addProductModal");
const addProductForm = document.getElementById("addProductForm");
const addProductBtn = document.getElementById("addProductBtn"); // the button that opens modal
const closeModal = document.querySelector(".close-modal");
const cancelBtn = document.querySelector(".btn-cancel");
const addVariantBtn = document.getElementById("addVariantBtn");

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    // Remove active class from all items
    navItems.forEach(nav => nav.classList.remove('active'));
    // Add active class to clicked item
    item.classList.add('active');

    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));
    // Show selected page
    const pageId = item.getAttribute('data-page');
    document.getElementById(pageId).classList.add('active');
  });
});

// Chart
const canvas = document.getElementById('salesChart');
if (canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Draw simple line chart
  const data = [150, 200, 180, 220, 250, 230, 200];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const padding = 40;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const max = Math.max(...data);
  const stepX = chartWidth / (data.length - 1);

  // Draw axes
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // Draw line
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((value, index) => {
    const x = padding + index * stepX;
    const y = canvas.height - padding - (value / max) * chartHeight;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw points
  ctx.fillStyle = '#4CAF50';
  data.forEach((value, index) => {
    const x = padding + index * stepX;
    const y = canvas.height - padding - (value / max) * chartHeight;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw labels
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  days.forEach((day, index) => {
    const x = padding + index * stepX;
    ctx.fillText(day, x, canvas.height - padding + 20);
  });
}

// Tab switching
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', function () {
    const parent = this.parentElement;
    parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

// Inputs for discount calculation
const originalPriceInput = document.querySelector('[name="originalPrice"]');
const discountInput = document.querySelector('[name="discountPercentage"]');
const discountedInput = document.querySelector('[name="discountedPrice"]');

const tableBody = document.querySelector("#productsTable tbody");

// ----------------------
// OPEN PRODUCT MODAL
// ----------------------
addProductBtn?.addEventListener("click", () => {
  addProductModal.classList.add("active");
});

// ----------------------
// CLOSE MODAL
// ----------------------
const closeModalFunc = () => {
  addProductModal.classList.remove("active");
  addProductForm.reset();
  document.querySelector("#variantTable tbody").innerHTML = "";
};

closeModal?.addEventListener("click", closeModalFunc);
cancelBtn?.addEventListener("click", closeModalFunc);

// Close modal when clicking outside the form
addProductModal?.addEventListener("click", (e) => {
  if (e.target === addProductModal) closeModalFunc();
});

// ----------------------
// ADD VARIANT ROW
// ----------------------
addVariantBtn?.addEventListener("click", () => {
  const tableBody = document.querySelector("#variantTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
        <td><input type="text" class="variantColor" placeholder="Color"></td>
        <td>
            <select class="variantSize">
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
            </select>
        </td>
        <td><input type="number" class="variantStock" placeholder="Stock"></td>
        <td><button type="button" class="remove-variant-btn">X</button></td>
    `;
  tableBody.appendChild(row);
});

// ----------------------
// REMOVE VARIANT ROW
// ----------------------
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-variant-btn")) {
    e.target.closest("tr").remove();
  }
});

// ----------------------
// DISCOUNT CALCULATION
// ----------------------
function calculateDiscount() {
  const price = parseFloat(originalPriceInput.value) || 0;
  const discount = parseFloat(discountInput.value) || 0;
  discountedInput.value = discount > 0
    ? Math.round(price - (price * discount / 100))
    : price;
}

originalPriceInput?.addEventListener("input", calculateDiscount);
discountInput?.addEventListener("input", calculateDiscount);

// ----------------------
// FORM SUBMISSION (Add Product) WITH VALIDATION
// ----------------------
addProductForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(addProductForm);

  const variants = [];
  let totalVariantStock = 0;
  let invalidStock = false;

  // Loop through variant rows
  document.querySelectorAll("#variantTable tbody tr").forEach(row => {
    const color = row.querySelector(".variantColor").value.trim();
    const size = row.querySelector(".variantSize").value;
    const stockInput = row.querySelector(".variantStock");
    const stock = parseInt(stockInput.value);

    // Check if stock is numeric and >= 0
    if (isNaN(stock) || stock < 0) {
      invalidStock = true;
      stockInput.classList.add("input-error"); // optional styling
    } else {
      stockInput.classList.remove("input-error");
    }

    if (color && size && !isNaN(stock)) {
      variants.push({ color, size, stock });
      totalVariantStock += stock;
    }
  });

  if (invalidStock) {
    alert("Please enter valid numeric values for all variant stocks.");
    return;
  }

  const totalStock = parseInt(formData.get('totalStock')) || 0;

  if (totalVariantStock > totalStock) {
    alert(`Total of variant stocks (${totalVariantStock}) cannot exceed total stock (${totalStock}).`);
    return;
  }

  if (variants.length === 0) {
    alert("Please add at least one variant");
    return;
  }

  const originalPrice = parseFloat(formData.get('originalPrice'));
  const discountPercentage = parseFloat(formData.get('discountPercentage')) || 0;
  const discountedPrice = discountPercentage > 0
    ? Math.round(originalPrice - (originalPrice * discountPercentage / 100))
    : originalPrice;

let imageUrl = "";

const fileInput = addProductForm.querySelector('[name="image"]');

if (fileInput && fileInput.files.length > 0) {
  const uploadData = new FormData();
  uploadData.append("image", fileInput.files[0]);

  const uploadRes = await fetch("http://localhost:5000/api/upload", {
    method: "POST",
    body: uploadData
  });

  const uploadResult = await uploadRes.json();
  imageUrl = uploadResult.imageUrl;
}

  const productData = {
    name: formData.get('productName'),
    category: formData.get('category'),
    originalPrice,
    discountPercentage,
    discountedPrice,
    totalStock, // you can also use totalVariantStock if you want it auto-calculated
    images: imageUrl ? [imageUrl] : [],
    description: {
      material: formData.get('material'),
      neckType: formData.get('neckType'),
      sleeveType: formData.get('sleeveType'),
      countryOfOrigin: formData.get('countryOfOrigin')
    },
    variants
  };

  try {
    const res = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(productData)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Failed to save product");
      return;
    }

    addProductForm.reset();
    document.querySelector("#variantTable tbody").innerHTML = "";
    await loadProducts();
    closeModalFunc();
    alert("Product added successfully!");
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});
// ----------------------
// LOAD PRODUCTS
// ----------------------
async function loadProductsTable() {
  tableBody.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5000/api/products");
    const products = await res.json();

    products.forEach(product => {
      // Show all colors with stock
      const colorStock = (product.variants || [])
        .map(v => `${v.color} (${v.stock})`)
        .join(", ");

      const stockStatus = product.totalStock > 10 ? "Available" : "Low Stock";

      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category?.name || "N/A"}</td>
                <td>${colorStock}</td>
                <td>Rs.${product.discountedPrice.toLocaleString()}</td>
                <td>${stockStatus}</td>
            `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load products");
  }
}

// Call it once on page load
loadProductsTable();

// ----------------------
// FILTER FUNCTIONALITY
// ----------------------
const searchBox = document.querySelector(".search-box");
const filterCategory = document.getElementById("filterCategory");
const filterPrice = document.getElementById("filterPrice");

let allProducts = []; // store products for filtering

// Load products once and store in allProducts
async function loadProducts() {
  tableBody.innerHTML = "";
  try {
    const res = await fetch("http://localhost:5000/api/products");
    allProducts = await res.json();

    renderProducts(allProducts); // initial render
  } catch (err) {
    console.error(err);
    alert("Failed to load products");
  }
}

// Render products in table
function renderProducts(products) {
  tableBody.innerHTML = "";

  products.forEach(product => {
    const colorStock = (product.variants || [])
      .map(v => `${v.color} (${v.stock})`)
      .join(", ");

    const stockStatus = product.totalStock > 10 ? "Available" : "Low Stock";

    const row = document.createElement("tr");
    row.innerHTML = `
                <td>
      <img src="${product.images?.[0] || ''}" 
          style="width:40px;height:40px;object-fit:cover;border-radius:6px;">
      ${product.name}
    </td>
            <td>${product.category?.name || "N/A"}</td>
            <td>${colorStock}</td>
            <td>Rs.${product.discountedPrice.toLocaleString()}</td>
            <td>${stockStatus}</td>
        `;
    tableBody.appendChild(row);
  });
}

// Apply filters
function applyFilters() {
  let filtered = [...allProducts];

  // Filter by search term
  const searchTerm = searchBox.value.trim().toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
  }

  // Filter by category
  const category = filterCategory.value;
  if (category && category !== "All Categories") {
    filtered = filtered.filter(p => p.category?._id === category);
  }

  // Filter by price range
  const priceRange = filterPrice.value;
  if (priceRange && priceRange !== "Price Range") {
    filtered = filtered.filter(p => {
      const price = p.discountedPrice || p.originalPrice;
      if (priceRange === "Under 1000") return price < 1000;
      if (priceRange === "1000-2000") return price >= 1000 && price <= 2000;
      if (priceRange === "2000-5000") return price > 2000 && price <= 5000;
      return true;
    });
  }

  renderProducts(filtered);
}

// Event listeners
searchBox.addEventListener("input", applyFilters);
filterCategory.addEventListener("change", applyFilters);
filterPrice.addEventListener("change", applyFilters);

// Call once on page load
loadProducts();

// category modal 
const categoryModal = document.getElementById("categoryModal");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const closeCategoryModal = document.getElementById("closeCategoryModal");
const saveCategoryBtn = document.getElementById("saveCategoryBtn");
const categoryTableBody = document.getElementById("categoryTableBody");
const newCategoryInput = document.getElementById("newCategoryInput");

// OPEN MODAL
addCategoryBtn?.addEventListener("click", () => {
  categoryModal.classList.add("active");
  loadCategories();
  loadCategoryDropdown();
});

// CLOSE MODAL
closeCategoryModal?.addEventListener("click", () => {
  categoryModal.classList.remove("active");
  newCategoryInput.value = "";
});

// LOAD CATEGORIES
async function loadCategories() {
  try {
    const res = await fetch("http://localhost:5000/api/categories");
    const categories = await res.json();

    categoryTableBody.innerHTML = "";

    categories.forEach(cat => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${cat.name}</td>`;
      categoryTableBody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
  }
}

// ADD CATEGORY
saveCategoryBtn?.addEventListener("click", async () => {

  const name = newCategoryInput.value.trim();
  if (!name) return alert("Enter category name");
  const exists = Array.from(categoryTableBody.children)
    .some(row => row.innerText.toLowerCase() === name.toLowerCase());
  if (exists) {
    return alert("Category already exists");
  }
  try {

    const res = await fetch("http://localhost:5000/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message);
    }

    newCategoryInput.value = "";
    loadCategories();
    loadCategoryDropdown(); // update product form dropdown
    loadFilterCategories();
    alert("Category added successfully");

  } catch (err) {
    console.error(err);
    alert("Failed to load categories"); // ✅ ADD THIS
  }

});

// load categories
async function loadCategoryDropdown() {
  const dropdown = document.getElementById("categoryDropdown");

  try {
    const res = await fetch("http://localhost:5000/api/categories");
    const categories = await res.json();

    dropdown.innerHTML = `<option value="">Select Category</option>`;

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat._id;
      option.textContent = cat.name;
      dropdown.appendChild(option);
    });

  } catch (err) {
    console.error(err);
  }
}
async function loadFilterCategories() {
  const dropdown = document.getElementById("filterCategory");

  if (!dropdown) return; // safety

  try {
    const res = await fetch("http://localhost:5000/api/categories");
    const categories = await res.json();

    if (!Array.isArray(categories)) {
      console.error("Invalid categories:", categories);
      return;
    }

    dropdown.innerHTML = `<option>All Categories</option>`;

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat._id;
      option.textContent = cat.name;
      dropdown.appendChild(option);
    });

  } catch (err) {
    console.error("Error loading filter categories:", err);
  }
}
loadCategoryDropdown();
loadFilterCategories();

// Add Offer Modal
const addOfferBtn = document.getElementById('addOfferBtn');
const addOfferModal = document.getElementById('addOfferModal');
const closeOfferModal = document.getElementById('closeOfferModal');
const cancelOfferBtn = document.getElementById('cancelOfferBtn');
const addOfferForm = document.getElementById('addOfferForm');

// Open offer modal
if (addOfferBtn) {
  addOfferBtn.addEventListener('click', () => {
    addOfferModal.classList.add('active');
  });
}

// Close offer modal
if (closeOfferModal) {
  closeOfferModal.addEventListener('click', () => {
    addOfferModal.classList.remove('active');
    addOfferForm.reset();
  });
}

if (cancelOfferBtn) {
  cancelOfferBtn.addEventListener('click', () => {
    addOfferModal.classList.remove('active');
    addOfferForm.reset();
  });
}

// Close offer modal when clicking outside
if (addOfferModal) {
  addOfferModal.addEventListener('click', (e) => {
    if (e.target === addOfferModal) {
      addOfferModal.classList.remove('active');
      addOfferForm.reset();
    }
  });
}

// Handle offer form submission
if (addOfferForm) {
  addOfferForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(addOfferForm);
    const offerData = {
      name: formData.get('offerName'),
      couponCode: formData.get('couponCode').toUpperCase(),
      offerType: formData.get('offerType'),
      discountValue: formData.get('discountValue'),
      usageLimit: formData.get('usageLimit'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      minPurchase: formData.get('minPurchase'),
      maxDiscount: formData.get('maxDiscount'),
      applicableTo: Array.from(document.querySelectorAll('input[name="applicableTo"]:checked')).map(cb => cb.value),
      description: formData.get('offerDescription')
    };

    // Validate dates
    const start = new Date(offerData.startDate);
    const end = new Date(offerData.endDate);

    if (end < start) {
      alert('End date must be after start date');
      return;
    }

    // Format offer display text
    let offerText = '';
    if (offerData.offerType === 'percentage') {
      offerText = `${offerData.discountValue}% OFF`;
    } else if (offerData.offerType === 'fixed') {
      offerText = `Rs.${offerData.discountValue} OFF`;
    } else if (offerData.offerType === 'buy_one_get_one') {
      offerText = 'Buy 1 Get 1';
    } else if (offerData.offerType === 'free_shipping') {
      offerText = 'Free Shipping';
    }

    // Format dates for display
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Add offer to table
    const offersTable = document.getElementById('offersTableBody');
    const newRow = offersTable.insertRow(0);

    newRow.innerHTML = `
                    <td>${offerData.couponCode}</td>
                    <td>${offerText}</td>
                    <td>0/${offerData.usageLimit}</td>
                    <td>${formatDate(offerData.startDate)}</td>
                    <td>${formatDate(offerData.endDate)}</td>
                    <td>
                        <button class="btn" style="margin-right: 5px;">Edit</button>
                        <button class="btn">Delete</button>
                    </td>
                `;

    // Close modal and reset form
    addOfferModal.classList.remove('active');
    addOfferForm.reset();

    // Show success message
    alert(`Offer "${offerData.name}" added successfully!`);
  });
}

// Auto-uppercase coupon code as user types
const couponCodeInput = document.getElementById('couponCode');
if (couponCodeInput) {
  couponCodeInput.addEventListener('input', function () {
    this.value = this.value.toUpperCase();
  });
}



async function loadCustomers() {

  try {

    const response = await fetch("http://localhost:5000/api/admin/users");

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    // Update total customers
    document.getElementById("totalCustomers").innerText = data.total;

    const tableBody = document.getElementById("customerTableBody");
    tableBody.innerHTML = "";

    data.users.forEach(user => {

      const row = `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>-</td>
                </tr>
            `;

      tableBody.innerHTML += row;

    });

  }
  catch (error) {

    console.error("Error loading users:", error);

  }

}

loadCustomers();

// for new users in admin dashboard
async function loadDashboardStats() {

  try {

    const response = await fetch("http://localhost:5000/api/admin/dashboard-stats");

    const data = await response.json();

    document.getElementById("newCustomers").innerText = data.newCustomers;

  }
  catch (error) {

    console.error("Dashboard error:", error);

  }

}

loadDashboardStats();

// =============================================
// ORDERS - API
// =============================================
let allOrders = [];

async function loadOrders() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/orders');
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    allOrders = data.orders;
    renderOverview(allOrders);
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('noResult').style.display = 'block';
  }
}

function renderOverview(data) {
  const tbody = document.getElementById('overviewBody');
  const noResult = document.getElementById('noResult');
  tbody.innerHTML = '';

  if (!data || data.length === 0) {
    noResult.style.display = 'block';
    return;
  }
  noResult.style.display = 'none';

  data.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="id-badge">${order.orderId}</span></td>
      <td>${order.customerName}</td>
      <td><span class="method-badge">${order.transactionMethod}</span></td>
      <td><span class="amount-value">${order.totalAmount}</span></td>
      <td><button class="view-btn" onclick="openOrderModal('${order._id}')">View Details</button></td>
    `;
    tr.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-btn')) return;
      openOrderModal(order._id);
    });
    tbody.appendChild(tr);
  });
}

function openOrderModal(id) {
  const order = allOrders.find(o => o._id === id);
  if (!order) return;

  document.getElementById('modalMeta').innerHTML = `
    <div class="meta-item">
      <div class="meta-label">Customer Name</div>
      <div class="meta-value">${order.customerName}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Order ID</div>
      <div class="meta-value brown">${order.orderId}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Transaction Method</div>
      <div class="meta-value"><span class="method-badge">${order.transactionMethod}</span></div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Transaction ID</div>
      <div class="meta-value brown">${order.transactionId}</div>
    </div>
  `;

  const tbody = document.getElementById('modalBody');
  tbody.innerHTML = '';
  order.items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="product-cell">
          <img src="${item.image}" alt="${item.name}">
          <span class="product-name">${item.name}</span>
        </div>
      </td>
      <td><span class="id-badge">${item.productId}</span></td>
      <td><span class="variant-badge">${item.variantId}</span></td>
      <td><div class="price-cell"><span class="price-original">${item.originalPrice}</span></div></td>
      <td>
        <div class="price-cell">
          <span class="price-paid">${item.pricePaid}</span>
          <span class="price-saving">You saved ${item.saved}</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('orderModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrderModalDirect() {
  document.getElementById('orderModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function closeOrderModal(e) {
  if (e.target === document.getElementById('orderModalOverlay')) {
    closeOrderModalDirect();
  }
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeOrderModalDirect();
});

// Load orders when Orders nav is clicked
document.querySelectorAll('.nav-item').forEach(item => {
  if (item.getAttribute('data-page') === 'orders') {
    item.addEventListener('click', loadOrders);
  }
});

// =============================================
// PAYMENTS - API (linked from orders)
// =============================================
async function loadPayments() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/payments');
    if (!response.ok) throw new Error('Failed to fetch payments');
    const data = await response.json();

    // Calculate summary
    let totalRevenue = 0;
    let successful = 0;
    let failed = 0;

    data.payments.forEach(p => {
      const amount = parseInt(p.totalAmount.replace(/[^0-9]/g, '')) || 0;
      totalRevenue += amount;
      if (['Delivered', 'Shipped'].includes(p.status)) successful++;
      if (['Cancelled', 'Refund'].includes(p.status)) failed++;
    });

    document.getElementById('totalRevenue').innerText = `Rs. ${totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById('successfulPayments').innerText = successful;
    document.getElementById('failedPayments').innerText = failed;

    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = '';

    if (!data.payments || data.payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999; padding:20px;">No payments found.</td></tr>';
      return;
    }

    data.payments.forEach(payment => {
      const statusColors = {
        'Pending': { bg: '#fff8e6', color: '#b8860b' },
        'Shipped': { bg: '#e6f4ff', color: '#0066cc' },
        'Delivered': { bg: '#e6ffed', color: '#1a7a3c' },
        'Refund': { bg: '#fff0f0', color: '#cc0000' },
        'Cancelled': { bg: '#f5f5f5', color: '#666666' }
      };
      const style = statusColors[payment.status] || { bg: '#f5f5f5', color: '#333' };

      tbody.innerHTML += `
        <tr>
          <td><span class="id-badge">#${payment.transactionId}</span></td>
          <td>${payment.customerName}</td>
          <td><span class="method-badge">${payment.transactionMethod}</span></td>
          <td><strong>${payment.totalAmount}</strong></td>
          <td><span style="background:${style.bg}; color:${style.color}; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:600;">${payment.status}</span></td>
        </tr>
      `;
    });

  } catch (error) {
    console.error('Error loading payments:', error);
  }
}

// Load payments when Payments nav is clicked
document.querySelectorAll('.nav-item').forEach(item => {
  if (item.getAttribute('data-page') === 'payments') {
    item.addEventListener('click', loadPayments);
  }
});

// =============================================
// EXCHANGE & RETURN REQUESTS - API
// =============================================
async function loadExchangeReturns() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/exchange-returns');
    if (!response.ok) throw new Error('Failed to fetch requests');
    const data = await response.json();

    const tbody = document.getElementById('exchangeTableBody');
    tbody.innerHTML = '';

    if (!data.requests || data.requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#999; padding:20px;">No requests found.</td></tr>';
      return;
    }

    data.requests.forEach(req => {
      const typeBg = req.type === 'Exchange' ? '#e6f4ff' : '#fff0f0';
      const typeColor = req.type === 'Exchange' ? '#0066cc' : '#cc0000';

      const statusColors = {
        'Pending': { bg: '#fff8e6', color: '#b8860b' },
        'Approved': { bg: '#e6ffed', color: '#1a7a3c' },
        'Rejected': { bg: '#fff0f0', color: '#cc0000' }
      };
      const s = statusColors[req.status] || { bg: '#f5f5f5', color: '#333' };

      const actionBtns = req.status === 'Pending'
        ? `<button class="btn" style="margin-right:5px;" onclick="updateExchangeStatus('${req._id}', 'Approved')">Approve</button>
           <button class="btn" onclick="updateExchangeStatus('${req._id}', 'Rejected')">Reject</button>`
        : `<span style="color:#999; font-size:13px;">${req.status}</span>`;

      tbody.innerHTML += `
        <tr>
          <td>${req.requestId}</td>
          <td>#${req.orderId}</td>
          <td>${req.customerName}</td>
          <td>${req.product}</td>
          <td><span style="background:${typeBg}; color:${typeColor}; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:600;">${req.type}</span></td>
          <td><span style="background:${s.bg}; color:${s.color}; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:600;">${req.status}</span></td>
          <td>${actionBtns}</td>
        </tr>
      `;
    });

  } catch (error) {
    console.error('Error loading exchange/return requests:', error);
  }
}

async function updateExchangeStatus(id, status) {
  try {
    const response = await fetch(`http://localhost:5000/api/admin/exchange-returns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    loadExchangeReturns(); // refresh table
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

// Load on page start (dashboard shows it)
loadExchangeReturns();

// =============================================
// DASHBOARD - PAYMENT TRANSACTIONS OVERVIEW
// =============================================
async function loadDashboardPayments() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/payments');
    if (!response.ok) throw new Error('Failed to fetch payments');
    const data = await response.json();

    const tbody = document.getElementById('dashboardPaymentsBody');
    tbody.innerHTML = '';

    if (!data.payments || data.payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999; padding:15px;">No payments yet.</td></tr>';
      return;
    }

    // Show only latest 3
    const latest = data.payments.slice(0, 3);

    latest.forEach(payment => {
      const statusColors = {
        'Pending': { bg: '#fff8e6', color: '#b8860b' },
        'Shipped': { bg: '#e6f4ff', color: '#0066cc' },
        'Delivered': { bg: '#e6ffed', color: '#1a7a3c' },
        'Refund': { bg: '#fff0f0', color: '#cc0000' },
        'Cancelled': { bg: '#f5f5f5', color: '#666666' }
      };
      const s = statusColors[payment.status] || { bg: '#f5f5f5', color: '#333' };

      tbody.innerHTML += `
        <tr>
          <td><span class="id-badge">#${payment.transactionId}</span></td>
          <td>${payment.customerName}</td>
          <td>${payment.transactionMethod}</td>
          <td><strong>${payment.totalAmount}</strong></td>
          <td><span style="background:${s.bg}; color:${s.color}; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:600;">${payment.status}</span></td>
        </tr>
      `;
    });

  } catch (error) {
    console.error('Error loading dashboard payments:', error);
  }
}

loadDashboardPayments();