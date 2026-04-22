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

    // 🔹 Active nav highlight
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    // 🔹 Hide all pages
    pages.forEach(page => page.classList.remove('active'));

    // 🔹 Get target page
    const pageId = item.getAttribute('data-page');
    const targetPage = document.getElementById(pageId);

    // 🔥 SAFE CHECK (prevents crash)
    if (targetPage) {
      targetPage.classList.add('active');

      // 🚀 Page-specific logic
      if (pageId === "requests") {
        loadRequests(); // auto fetch requests
      }

      if (pageId === "orders") {
        loadOrders?.(); // optional if exists
      }

      if (pageId === "products") {
        loadProducts?.();
      }

      if (pageId == "reviews") {
        loadReviews?.();
      }

    } else {
      console.error("❌ Page not found:", pageId);
    }

  });
});

// Tab switching
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', function () {
    const parent = this.parentElement;
    parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

async function loadDashboardStats() {
  try {
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/admin/dashboard-stats");
    const data = await res.json();

    document.getElementById("totalSales").innerText =
      "₹" + (data.totalSales || 0).toLocaleString();

    document.getElementById("newOrders").innerText =
      data.newOrders || 0;

    document.getElementById("newCustomers").innerText =
      data.newCustomers || 0;

    document.getElementById("lowStockAlerts").innerText =
      data.lowStockAlerts || 0;

    // ✅ call here (inside try)
    loadRefunds();

  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

// global text only validation 
document.addEventListener("input", (e) => {

  if (
    e.target.matches('[name="productName"], [name="material"], [name="neckType"], [name="sleeveType"], #newCategoryInput, .variantColor')
  ) {
    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
  }

});

function isValidString(str) {
  return /^[A-Za-z\s]+$/.test(str);
}

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
                <option>XXL</option>
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

    if (!isValidString(color)) {
      invalidStock = true;
      alert("Color must contain only letters");
      return;
    }

    if (!isValidString(size)) {
      invalidStock = true;
      alert("Size must contain only letters");
      return;
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

  let imageUrls = [];

  const fileInput = addProductForm.querySelector('[name="image"]');

  if (fileInput && fileInput.files.length > 0) {

    if (fileInput.files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    const uploadData = new FormData();

    Array.from(fileInput.files).forEach(file => {
      uploadData.append("image", file);
    });

    const uploadRes = await fetch("https://gsd-backend-i5gj.onrender.com/api/upload", {
      method: "POST",
      body: uploadData
    });

    const uploadResult = await uploadRes.json();
    imageUrls = uploadResult.imageUrls || [];
  }
  const productName = formData.get('productName').trim();
  const material = formData.get('material')?.trim() || "";
  const neckType = formData.get('neckType')?.trim() || "";
  const sleeveType = formData.get('sleeveType')?.trim() || "";

  // ✅ Product name validation
  if (!isValidString(productName)) {
    return alert("Product name must contain only letters");
  }

  // ✅ Optional fields validation
  if (material && !isValidString(material)) {
    return alert("Material must contain only letters");
  }

  if (neckType && !isValidString(neckType)) {
    return alert("Neck type must contain only letters");
  }

  if (sleeveType && !isValidString(sleeveType)) {
    return alert("Sleeve type must contain only letters");
  }
  const productData = {
    name: formData.get('productName'),
    category: formData.get('category'),
    originalPrice,
    discountPercentage,
    discountedPrice,
    totalStock, // you can also use totalVariantStock if you want it auto-calculated
    images: imageUrls,
    description: {
      material: formData.get('material'),
      neckType: formData.get('neckType'),
      sleeveType: formData.get('sleeveType'),
      countryOfOrigin: formData.get('countryOfOrigin')
    },
    variants
  };

  try {
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/products", {
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
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/products");
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
                 <td>
                <button class="btn btn-secondary edit-btn" data-id="${product._id}">Edit</button>
                </td>
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
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/products");
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
                <td>
                <button class="btn btn-secondary edit-btn" data-id="${product._id}">Edit</button>
                </td>
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
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/categories");
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
  if (!isValidString(name)) {
    return alert("Category must contain only letters");
  }
  const exists = Array.from(categoryTableBody.children)
    .some(row => row.innerText.toLowerCase() === name.toLowerCase());
  if (exists) {
    return alert("Category already exists");
  }
  try {

    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/categories", {
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
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/categories");
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
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/categories");
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

// ----------------------
// EDIT PRODUCT MODAL
// ----------------------

let currentProductId = null;

// ✅ LOAD CATEGORIES FOR EDIT MODAL
async function loadEditCategories(selectedId = null) {
  const dropdown = document.getElementById("editCategory");

  try {
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/categories");
    const categories = await res.json();

    dropdown.innerHTML = `<option value="">Select Category</option>`;

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat._id;
      option.textContent = cat.name;

      if (selectedId && selectedId === cat._id) {
        option.selected = true;
      }

      dropdown.appendChild(option);
    });

  } catch (err) {
    console.error("Edit category load error:", err);
  }
}


// OPEN MODAL
document.addEventListener("click", async (e) => {

  // ✅ EDIT BUTTON
  const btn = e.target.closest(".edit-btn");
  if (btn) {
    try {
      const id = btn.dataset.id;
      currentProductId = id;

      const res = await fetch(`https://gsd-backend-i5gj.onrender.com/api/products/${id}`);
      const product = await res.json();

      // Prefill
      document.getElementById("editName").value = product.name;
      document.getElementById("editPrice").value = product.discountedPrice;

      await loadEditCategories(product.category?._id || product.category);

      // VARIANTS
      const container = document.getElementById("variantsContainer");
      container.innerHTML = "";

      (product.variants || []).forEach(v => {
        const div = document.createElement("div");

        div.style.display = "flex";
        div.style.gap = "10px";
        div.style.marginBottom = "8px";

        div.innerHTML = `
    <input type="text" value="${v.color || ""}" placeholder="Color">

    <input type="text" value="${v.size || "M"}" placeholder="Size">

    <input type="number" value="${v.stock || 0}" placeholder="Stock">

    <button type="button" onclick="this.parentElement.remove()">❌</button>
  `;

        container.appendChild(div);
      });

      document.getElementById("editProductModal").style.display = "flex";

    } catch (err) {
      console.error("Edit modal error:", err);
    }
  }

  // ✅ ADD VARIANT (FIXED)
  if (e.target.id === "addVariantBtn") {
    const div = document.createElement("div");

    div.style.display = "flex";
    div.style.gap = "10px";
    div.style.marginBottom = "8px";

    div.innerHTML = `
    <input type="text" placeholder="Color">
    <input type="text" placeholder="Size">
    <input type="number" placeholder="Stock">
    <button type="button" onclick="this.parentElement.remove()">❌</button>
  `;

    document.getElementById("variantsContainer").appendChild(div);
  }

});


// CLOSE MODAL
function closeEditModal() {
  document.getElementById("editProductModal").style.display = "none";
}


// ----------------------
// UPDATE PRODUCT
// ----------------------
document.addEventListener("DOMContentLoaded", () => {

  const updateBtn = document.getElementById("updateProductBtn");

  if (updateBtn) {
    updateBtn.addEventListener("click", async () => {

      const variantDivs = document.querySelectorAll("#variantsContainer div");

      const variants = Array.from(variantDivs)
        .map(div => {
          const inputs = div.querySelectorAll("input");

          return {
            color: inputs[0].value.trim(),
            size: inputs[1].value.trim(),
            stock: Number(inputs[2].value)
          };
        })
        .filter(v => v.color && v.size && v.stock >= 0);

      // ✅ CALCULATE TOTAL STOCK
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

      const updatedProduct = {
        name: document.getElementById("editName").value,
        category: document.getElementById("editCategory").value,
        discountedPrice: Number(document.getElementById("editPrice").value),
        variants,
        totalStock // ✅ IMPORTANT
      };

      console.log("SENDING:", updatedProduct);

      try {
        const res = await fetch(`https://gsd-backend-i5gj.onrender.com/api/products/${currentProductId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProduct),
        });

        const data = await res.json();
        console.log("UPDATE RESPONSE:", data);

        closeEditModal();

        // ✅ REFRESH TABLE ONLY
        if (typeof loadProducts === "function") {
          loadProducts();
        }

      } catch (err) {
        console.error("Update failed:", err);
      }
    });
  }

});

// customers
let allCustomers = [];
let filteredCustomers = [];

async function loadCustomers() {
  try {

    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/admin/users");
    const data = await res.json();

    allCustomers = data.users;
    filteredCustomers = [...allCustomers]; // 🔥 important
    renderCustomers(filteredCustomers);
    // 🔥 analytics
    document.getElementById("totalCustomers").innerText = data.total;
    document.getElementById("activeCustomers").innerText = data.active;
    document.getElementById("inactiveCustomers").innerText = data.inactive;

    renderCustomers(allCustomers);

  } catch (err) {
    console.error(err);
  }
}

function renderCustomers(data) {
  const tbody = document.getElementById("customerTableBody");
  tbody.innerHTML = "";

  data.forEach(user => {
    const row = `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.orderCount}</td>
        <td>₹${user.totalSpent}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

document.getElementById("customerSearch").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  filteredCustomers = allCustomers.filter(user =>
    user.name.toLowerCase().includes(value) ||
    user.email.toLowerCase().includes(value)
  );

  renderCustomers(filteredCustomers);
});

document.getElementById("customerSort").addEventListener("change", (e) => {
  let sorted = [...filteredCustomers]; // 🔥 FIX

  switch (e.target.value) {
    case "ordersHigh":
      sorted.sort((a, b) => b.orderCount - a.orderCount);
      break;

    case "ordersLow":
      sorted.sort((a, b) => a.orderCount - b.orderCount);
      break;

    case "spentHigh":
      sorted.sort((a, b) => b.totalSpent - a.totalSpent);
      break;

    case "spentLow":
      sorted.sort((a, b) => a.totalSpent - b.totalSpent);
      break;
  }

  renderCustomers(sorted);
});

loadCustomers();


// =============================================
// ORDERS - API
// =============================================
let allOrders = [];
let currentOrderId = null;

async function loadOrders() {
  try {
    const response = await fetch('https://gsd-backend-i5gj.onrender.com/api/admin/orders');
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    allOrders = data.orders;
    applyFilters(); // 🔥 instead of direct render
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
      <td><span class="method-badge">${order.paymentMethod}</span></td>
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

function applyFilters() {

  let filtered = [...allOrders];

  const status = document.getElementById("statusFilter").value;
  const type = document.getElementById("typeFilter").value;
  const amount = document.getElementById("amountFilter").value;

  // 🔥 STATUS FILTER
  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }

  // 🔥 TYPE FILTER
  if (type) {
    filtered = filtered.filter(o => o.orderType === type);
  }

  // 🔥 AMOUNT SORT
  if (amount === "low") {
    filtered.sort((a, b) => a.totalAmount - b.totalAmount);
  }

  if (amount === "high") {
    filtered.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  renderOverview(filtered);
}

function openOrderModal(id) {
  const order = allOrders.find(o => o._id === id);
  if (!order) return;
  currentOrderId = id; // 🔥 ADD THIS

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
      <div class="meta-label">Payment Method</div>
      <div class="meta-value">
        <span class="method-badge">${order.paymentMethod}</span>
      </div>
    </div>

    <div class="meta-item">
      <div class="meta-label">Status</div>
      <div class="meta-value">
        <select id="orderStatusSelect" class="status-dropdown">
        <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
        <option value="Confirmed" ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
        <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
        <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
        <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </div>
    </div>
  `;

  // ✅ 🔥 ADD ADDRESS CODE RIGHT HERE
  const address = order.addressId;

  document.getElementById('modalAddress').innerHTML = `
    <div class="address-box">
      <p class="address-title">Delivery Address</p>

      <p><b>${address?.name || ""}</b></p>
      <p>${address?.phone || ""}</p>

      <p>
        ${address?.addressLine || ""}
        ${address?.landmark ? ", " + address.landmark : ""}
      </p>

      <p>
        ${address?.city || ""},
        ${address?.state || ""} - ${address?.pincode || ""}
      </p>
    </div>
  `;

  const tbody = document.getElementById('modalBody');
  tbody.innerHTML = '';
  order.items.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
    <td>
      <div class="product-cell">
        <img src="${(item.productId?.images && item.productId.images.length > 0)
        ? item.productId.images[0]
        : '../images/product.jpg'
      }">
        <span class="product-name">${item.name}</span>
      </div>
    </td>

    <td>
      <span class="id-badge">${item.productId?.productId || item.productId?._id}</span>
    </td>

    <td>
      <span class="variant-badge">
        ${item.size} / ${item.color}
      </span>
    </td>

    <td>
      <div class="price-cell">
        ₹${item.price}
      </div>
    </td>

    <td>
      <div class="price-cell">
        Qty: ${item.quantity} <br>
        Total: ₹${item.price * item.quantity}
      </div>
    </td>
  `;

    tbody.appendChild(tr);
  });

  document.getElementById('orderModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById("updateStatusBtn").onclick = updateOrderStatus;
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

async function updateOrderStatus() {
  const newStatus = document
    .getElementById("orderStatusSelect")
    .value
    .trim();
  console.log("Selected status:", newStatus);
  console.log("Order ID:", currentOrderId);

  try {
    const res = await fetch(
      `https://gsd-backend-i5gj.onrender.com/api/admin/orders/${currentOrderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Status updated ✅");

      const order = allOrders.find(o => o._id === currentOrderId);
      if (order) order.status = newStatus;

      closeOrderModalDirect();
      loadOrders();
    } else {
      alert(data.message || "Update failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}
// =============================================
// PAYMENTS - API (linked from orders)
// =============================================
function showTopMessage(message) {

  const msg = document.createElement("div");
  msg.className = "top-message";
  msg.innerText = message;

  document.body.appendChild(msg);

  setTimeout(() => msg.classList.add("show"), 10);

  setTimeout(() => {
    msg.classList.remove("show");
    setTimeout(() => msg.remove(), 300);
  }, 2500);
}

async function loadPayments() {
  try {

    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/admin/payments");
    const data = await res.json();

    const paymentsList = data.payments || [];

    const tbody = document.getElementById("paymentsTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (paymentsList.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>No payments found</td></tr>";
      return;
    }

    paymentsList.forEach(p => {

      const row = document.createElement("tr");

      row.innerHTML = `
      <td>${p.transactionId || "N/A"}</td>
      <td>${p.userId?.name || "N/A"}</td>
      <td>${p.paymentMethod || "COD"}</td>
      <td>₹${p.totalAmount?.toLocaleString() || 0}</td>
      <td>
        <select class="payment-status" data-id="${p._id}">
          <option value="Pending" ${p.paymentStatus === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Received" ${p.paymentStatus === "Received" ? "selected" : ""}>Received</option>
          <option value="Failed" ${p.paymentStatus === "Failed" ? "selected" : ""}>Failed</option>
        </select>
      </td>
          <td>
          <button class="invoice-btn" data-id="${p._id}" data-txn="${p.transactionId}"> Generate </button>
          <button class="send-invoice-btn" data-id="${p._id}"> Send </button>
        </td>
    `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Payments load error:", err);
  }
}

document.addEventListener("change", async (e) => {

  if (!e.target.classList.contains("payment-status")) return;

  const paymentId = e.target.dataset.id;
  const newStatus = e.target.value;

  try {

    const res = await fetch(`https://gsd-backend-i5gj.onrender.com/api/admin/payments/${paymentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();

    if (res.ok) {
      showTopMessage("Payment status updated");
      loadPaymentStats(); // 🔥 refresh stats
    } else {
      showTopMessage(data.message || "Update failed");
    }

  } catch (err) {
    console.error(err);
  }

});

async function loadPaymentStats() {
  try {

    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/admin/payments/stats");
    const data = await res.json();

    document.getElementById("totalRevenue").innerText =
      "₹" + (data.totalRevenue || 0).toLocaleString();

    document.getElementById("successfulPayments").innerText =
      data.successfulPayments || 0;

    document.getElementById("failedPayments").innerText =
      data.failedPayments || 0;

  } catch (err) {
    console.error("Stats error:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPayments();
  loadPaymentStats();
});

// ==============================
// GENERATE INVOICE
// ==============================
document.addEventListener("click", (e) => {

  if (e.target.classList.contains("invoice-btn")) {

    const paymentId = e.target.dataset.id;
    const transactionId = e.target.dataset.txn;

    window.open(
      `https://gsd-backend-i5gj.onrender.com/api/admin/payments/${paymentId}/invoice?token=${transactionId}`,
      "_blank"
    );
  }

});

// ==============================
// SEND INVOICE
// ==============================
document.addEventListener("click", async (e) => {

  if (!e.target.classList.contains("send-invoice-btn")) return;

  const id = e.target.dataset.id;

  try {

    const res = await fetch(
      `https://gsd-backend-i5gj.onrender.com/api/admin/payments/${id}/send-invoice`,
      { method: "POST" }
    );

    const data = await res.json();

    if (res.ok) {
      showTopMessage("Invoice sent to customer 📩");
    } else {
      showTopMessage(data.message || "Failed to send invoice");
    }

  } catch (err) {
    console.error(err);
  }

});

// =============================================
// EXCHANGE & RETURN REQUESTS - API
// =============================================
let allRequests = [];
let filteredRequests = [];

async function loadRequests() {
  const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/requests");
  const data = await res.json();

  allRequests = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  filteredRequests = [...allRequests];

  renderRequests(filteredRequests); // ✅ now works
}

function renderRequests(data) {
  const tbody = document.getElementById("requestsTableBody");
  tbody.innerHTML = "";

  data.forEach(req => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="product-cell">
          <img src="${req.productId?.images?.[0]}">
          <div>
            <strong>${req.productId?.name}</strong>
          </div>
        </div>
      </td>

      <td>
        ${req.userId?.name || "User"}<br>
        <small>${req.userId?.email || ""}</small>
      </td>

      <td>
        <span class="badge ${req.type.toLowerCase()}">
          ${req.type}
        </span>
      </td>

      <td>
        ${req.type === "Exchange"
        ? `New: ${req.newSize} / ${req.newColor}`
        : `Reason: ${req.reason}`
      }
      </td>

      <td>
        ${req.type === "Return"
        ? "₹" + (req.refundAmount ?? 0)
        : "₹0"}
      </td>

      <td>
        <span class="status ${req.status.toLowerCase()}">
          ${req.status}
        </span>
      </td>

      <td>
        ${req.status === "Pending"
        ? `
            <button class="action-btn approve" onclick="updateRequest('${req._id}','Approved')">Approve</button>
            <button class="action-btn reject" onclick="updateRequest('${req._id}','Rejected')">Reject</button>
          `
        : req.type === "Return" && req.status === "Approved"
          ? `<small style="color:#777;">Refund Pending</small>`
          : "-"
      }
      </td>
    `;

    tbody.appendChild(row);
  });
}

function applyRequestFilters() {
  const type = document.getElementById("requestTypeFilter").value;
  const status = document.getElementById("requestStatusFilter").value;

  filteredRequests = allRequests.filter(req => {
    const matchType = type ? req.type === type : true;
    const matchStatus = status ? req.status === status : true;
    return matchType && matchStatus;
  });

  renderRequests(filteredRequests);
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("requestTypeFilter")
    .addEventListener("change", applyRequestFilters);

  document.getElementById("requestStatusFilter")
    .addEventListener("change", applyRequestFilters);

  loadRequests(); // 🔥 important
});

async function updateRequest(id, status) {
  await fetch(
    `https://gsd-backend-i5gj.onrender.com/api/requests/${id}/status`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }
  );

  await loadRequests();
  applyRequestFilters(); // 🔥 keep filters active
}
// =============================================
// DASHBOARD - Bestsellers OVERVIEW
// =============================================

async function loadBestsellers() {
  try {
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/admin/bestsellers");
    const data = await res.json();

    const list = document.getElementById("bestsellersList");
    list.innerHTML = "";

    data.bestsellers.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} (${item.count} sold)`;
      list.appendChild(li);
    });

  } catch (err) {
    console.error("Bestsellers error:", err);
  }
}

loadBestsellers();

window.addEventListener("DOMContentLoaded", () => {
  loadDashboardStats();
});

// dashboard refund table 
async function loadRefunds() {
  try {
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/refunds/pending");
    const data = await res.json();

    console.log("Refund API:", data); // 🔥 DEBUG

    const refunds = data; // ✅ FIX

    const tbody = document.getElementById("refundTableBody");
    tbody.innerHTML = "";

    if (!refunds || refunds.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No pending refunds</td></tr>`;
      return;
    }

    refunds.forEach(refund => {

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${refund._id.slice(-6)}</td>

        <td>${refund.orderId?.orderId || "-"}</td>

        <td>
          ${refund.userId?.name}<br>
          <small>${refund.userId?.email}</small>
        </td>

        <td>${refund.productId?.name}</td>

        <td>₹${refund.amount}</td>

        <td>
          <span class="status pending">${refund.status}</span>
        </td>

        <td>
          <button class="action-btn approve"
            onclick="updateRefund('${refund._id}')">
            Mark Refunded
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Refund load error:", err);
  }
}
async function updateRefund(id) {
  await fetch(
    `https://gsd-backend-i5gj.onrender.com/api/refunds/${id}/status`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Processed" })
    }
  );

  loadRefunds(); // refresh table
}

// Reviewsss 
async function loadReviews() {
  try {
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/reviews/admin");
    const data = await res.json();

    console.log("Reviews API:", data); // 🔍 debug

    if (!Array.isArray(data)) {
      console.error("❌ Expected array, got:", data);
      return;
    }

    const tbody = document.getElementById("reviewsTableBody");
    tbody.innerHTML = "";

    data.forEach(r => {
      const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${r.productId?.name}</td>
        <td>${r.userId?.name}</td>
        <td>${stars}</td>
        <td>${r.reviewText}</td>
        <td>${r.orderId}</td>
        <td>${r.status}</td>
        <td>
  ${r.status === "pending" ? `
    <button 
      class="action-btn approve-btn" 
      data-id="${r._id}" 
      data-action="approved"
    >
      Approve
    </button>

    <button 
      class="action-btn reject-btn" 
      data-id="${r._id}" 
      data-action="rejected"
    >
      Reject
    </button>
  ` : `
    <span class="status-badge ${r.status}">
      ${r.status}
    </span>
  `}
</td>
      `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("click", async (e) => {

  const btn = e.target.closest(".action-btn");
  if (!btn) return;

  const reviewId = btn.dataset.id;
  const status = btn.dataset.action;

  if (!reviewId) {
    console.error("❌ Missing reviewId");
    return;
  }

  try {
    const res = await fetch(
      `https://gsd-backend-i5gj.onrender.com/api/reviews/${reviewId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    loadReviews();

  } catch (err) {
    console.error(err);
  }

});

document.addEventListener("change", (e) => {
  if (
    e.target.id === "statusFilter" ||
    e.target.id === "typeFilter" ||
    e.target.id === "amountFilter"
  ) {
    applyFilters();
  }
});