const profileContent = document.getElementById("profileContent");
const menuItems = document.querySelectorAll(".profile-sidebar li");

async function loadEditProfile() {

  const token = localStorage.getItem("token");

  try {

    const response = await fetch("https://gsd-backend-i5gj.onrender.com/api/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const user = await response.json();
    const welcomeUser = document.getElementById("welcomeUser");
    if (welcomeUser) {
      welcomeUser.innerText = `Welcome ${user.name}!`;
    }

    profileContent.innerHTML = `
      <div class="edit-box">

        <h2>Edit Profile</h2>

        <div class="form-row">
          <div>
            <label>Mobile Number</label>
            <input type="text" value="${user.phone}" disabled>
          </div>
        </div>

        <div class="form-row">
          <div>
            <label>Email</label>
            <input type="text" value="${user.email}" disabled>
          </div>
        </div>

        <div class="form-group">
          <label>Full Name</label>
          <input type="text" value="${user.name}" disabled>
        </div>

        <div class="form-group">
          <label>Birthday</label>
          <input type="date" id="birthdayInput"
            value="${user.birthdate ? user.birthdate.split('T')[0] : ''}">
        </div>

        <button class="save-btn" onclick="saveProfile()">Save Details</button>

      </div>
    `;

  } catch (error) {

    console.error("Profile Load Error:", error);

  }

}

// Load default page
loadEditProfile();

// Sidebar click switching
menuItems.forEach(item => {
  item.addEventListener("click", () => {

    document.querySelector(".active").classList.remove("active");
    item.classList.add("active");

    const page = item.getAttribute("data-page");

    if (page === "editProfile") {
      loadEditProfile();
    }
    else if (page === "savedAddress") {
      loadSavedAddress();
    }
    else if (page === "myOrders") {
      loadOrders();
    }
    else {
      profileContent.innerHTML = `<h2>${page} page coming soon...</h2>`;
    }

  });
});
// global string validation
function isValidName(str) {
  return /^[A-Za-z\s]+$/.test(str);
}

// Allow only numbers in mobile & pincode
document.querySelector(".phoneInput")?.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
});

document.querySelector(".pincodeInput")?.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
});

// Allow only letters in name
document.querySelector(".nameInput")?.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
});

async function loadSavedAddress() {

  const token = localStorage.getItem("token");

  const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/addresses", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const addresses = await res.json();

  let addressHTML = "";

  // If no addresses → show empty editable form
  if (addresses.length === 0) {

    addressHTML = `
    <div class="no-address">
      <p>No addresses added yet.</p>
      <button class="add-address">+ Add New Address</button>
    </div>
  `;

  } else {

    addresses.forEach(addr => {
      addressHTML += createAddressCard(addr);
    });

  }

  profileContent.innerHTML = `
  
  <div class="edit-box">

      <div class="address-header">
        <h2>Saved Address</h2>
        <span class="add-address">+ ADD NEW ADDRESS</span>
      </div>

      ${addressHTML}

  </div>
  
  `;

}

function createAddressCard(addr = {}) {
  return `
  <div class="address-card">

    <div class="address-top">
      <h4>${addr.name || ""}</h4>
      ${addr.isDefault ? `<span class="default-badge">DEFAULT</span>` : ""}
    </div>

    <p>${addr.addressLine || ""}</p>
    <p>${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}</p>
    <p>📞 ${addr.phone || ""}</p>

    <div class="address-actions">
      <button class="editAddressBtn" data-id="${addr._id}">Edit</button>
      ${!addr.isDefault
      ? `<button class="setDefaultBtn" data-id="${addr._id}">Set Default</button>`
      : ""
    }
    </div>

  </div>
  `;
}

document.addEventListener("click", async function (e) {

  if (!e.target.classList.contains("saveAddressBtn")) return;

  const token = localStorage.getItem("token");

  const block = e.target.closest(".address-block, .overlay-address-form");

  const inputs = block.querySelectorAll("input");

  const data = {
    name: inputs[0].value.trim(),
    phone: inputs[1].value.trim(),
    pincode: inputs[2].value.trim(),
    state: inputs[3].value.trim(),
    addressLine: inputs[4].value.trim(),
    landmark: inputs[5].value.trim(),
    city: inputs[6].value.trim(),
    isDefault: block.querySelector(".defaultAddress")?.checked || false
  };

  // ================= VALIDATIONS =================

  // 1. All fields required
  if (!data.name || !data.phone || !data.pincode || !data.state ||
    !data.addressLine || !data.city) {
    alert("All fields are required");
    return;
  }

  // 2. Name → only letters
  if (!isValidName(data.name)) {
    alert("Name must contain only alphabets");
    return;
  }

  // 3. Mobile → Indian only (starts 6-9, 10 digits)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(data.phone)) {
    alert("Enter valid Indian mobile number");
    return;
  }

  // 4. Pincode → Maharashtra only (starts with 4)
  const pincodeRegex = /^4\d{5}$/;
  if (!pincodeRegex.test(data.pincode)) {
    alert("Enter valid Maharashtra pincode");
    return;
  }

  // 5. Force state = Maharashtra
  data.state = "Maharashtra";

  const allCards = document.querySelectorAll(".address-card");

  let isDuplicate = false;

  allCards.forEach(card => {

    const id = card.querySelector(".editAddressBtn")?.dataset.id;

    // skip same address when editing
    if (id === e.target.dataset.id) return;

    const text = card.innerText.toLowerCase();

    const combinedNew = `
    ${data.name}
    ${data.phone}
    ${data.addressLine}
    ${data.city}
    ${data.state}
    ${data.pincode}
  `.toLowerCase();

    if (text.includes(data.phone) &&
      text.includes(data.addressLine.toLowerCase()) &&
      text.includes(data.city.toLowerCase())) {
      isDuplicate = true;
    }

  });

  if (isDuplicate) {
    alert("This address already exists. Please enter a different address.");
    return;
  }
  const id = e.target.dataset.id;

  const url = id
    ? `https://gsd-backend-i5gj.onrender.com/api/addresses/${id}`
    : "https://gsd-backend-i5gj.onrender.com/api/addresses";

  const method = id ? "PUT" : "POST";

  await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  addressOverlay.style.display = "none";
  // ✅ reset after save (IMPORTANT)
  const saveBtn = addressOverlay.querySelector(".saveAddressBtn");
  saveBtn.dataset.id = "";
  loadSavedAddress();

});

async function setDefaultAddress(id) {

  const token = localStorage.getItem("token");

  await fetch(`https://gsd-backend-i5gj.onrender.com/api/addresses/default/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadSavedAddress();
}

function addNewAddress() {

  const list = document.querySelector(".address-list");

  list.insertAdjacentHTML(
    "beforeend",
    createAddressCard()
  );

}

const addressOverlay = document.getElementById("addressOverlay");
const cancelOverlay = document.getElementById("cancelOverlay");

document.addEventListener("click", function (e) {

  // OPEN OVERLAY
  if (e.target.classList.contains("add-address")) {

    // clear old values
    const inputs = addressOverlay.querySelectorAll("input");
    inputs.forEach(i => i.value = "");
    addressOverlay.querySelector(".stateInput").value = "Maharashtra";
    addressOverlay.querySelector(".stateInput").readOnly = true;
    // ✅ RESET ID (CRITICAL FIX)
    const saveBtn = addressOverlay.querySelector(".saveAddressBtn");
    saveBtn.dataset.id = "";
    addressOverlay.style.display = "flex";
  }

  // CLOSE OVERLAY
  if (e.target.id === "cancelOverlay") {

    addressOverlay.style.display = "none";

  }

});

document.addEventListener("click", (e) => {

  if (!e.target.classList.contains("editAddressBtn")) return;

  const id = e.target.dataset.id;

  // find address from current list
  const allCards = document.querySelectorAll(".address-card");

  const selected = Array.from(allCards).find(card =>
    card.querySelector(".editAddressBtn").dataset.id === id
  );

  // fetch full data again (clean way)
  fetch(`https://gsd-backend-i5gj.onrender.com/api/addresses`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(addresses => {

      const addr = addresses.find(a => a._id === id);
      if (!addr) return;

      // fill modal inputs
      addressOverlay.querySelector(".nameInput").value = addr.name || "";
      addressOverlay.querySelector(".phoneInput").value = addr.phone || "";
      addressOverlay.querySelector(".pincodeInput").value = addr.pincode || "";
      const stateInput = addressOverlay.querySelector(".stateInput");
      // Force Maharashtra always
      stateInput.value = "Maharashtra";
      stateInput.readOnly = true;
      addressOverlay.querySelector(".addressInput").value = addr.addressLine || "";
      addressOverlay.querySelector(".landmarkInput").value = addr.landmark || "";
      addressOverlay.querySelector(".cityInput").value = addr.city || "";
      addressOverlay.querySelector(".defaultAddress").checked = addr.isDefault || false;

      // attach ID to save button
      const saveBtn = addressOverlay.querySelector(".saveAddressBtn");
      saveBtn.dataset.id = addr._id;

      // open modal
      addressOverlay.style.display = "flex";

    });

});
document.addEventListener("click", (e) => {

  if (!e.target.classList.contains("setDefaultBtn")) return;

  const id = e.target.dataset.id;

  setDefaultAddress(id);

});
// orders section 
let userOrders = [];
let userRequests = [];

async function fetchUserOrders() {
  const userId = localStorage.getItem("userId");

  // 🔥 ORDERS
  const ordersRes = await fetch(
    `https://gsd-backend-i5gj.onrender.com/api/orders?userId=${userId}`
  );
  const ordersData = await ordersRes.json();

  // 🔥 REQUESTS (NEW)
  const reqRes = await fetch(
    `https://gsd-backend-i5gj.onrender.com/api/requests?userId=${userId}`
  );
  const reqData = await reqRes.json();

  userOrders = ordersData.orders || [];
  userRequests = reqData || []; // depends on your API response

  console.log("Orders:", userOrders);
  console.log("Requests:", userRequests);

  renderRequests(); // 🔥 FIRST SHOW REQUESTS
  renderOrders();   // 🔥 THEN ORDERS
}
function loadOrders() {
  profileContent.innerHTML = `
    <div class="edit-box">
      <div class="address-header order-header">
        <h2>My Orders</h2>

        <div class="filter-wrapper">
          <span class="order-filter" id="orderFilterBtn">FILTER</span>
          <div class="filter-dropdown" id="filterDropdown">
            <div data-filter="recent">Most Recent</div>
            <div data-filter="returnable">Available for Return/Exchange</div>
            <div data-filter="review">Yet To Be Reviewed</div>
          </div>
        </div>
      </div>
      <div id="requestsContainer"></div>  <!-- NEW -->
      <div id="ordersContainer"></div>
    </div>
  `;
  // ✅ WAIT until DOM updates
  requestAnimationFrame(() => {
    fetchUserOrders();
  });
}

function renderOrders() {
  const container = document.getElementById("ordersContainer");
  if (!container) {
    console.error("❌ ordersContainer not found");
    return;
  }

  if (!userOrders || userOrders.length === 0) {
    container.innerHTML = "<p>No orders found</p>";
    return;
  }
  container.innerHTML = "";

  userOrders.forEach(order => {

    order.items.forEach(item => {
      const existingRequest = userRequests.find(
        r =>
          r.orderId === order._id &&
          r.productId._id === item.productId._id
      );

      const card = document.createElement("div");
      card.className = "order-card";

      card.innerHTML = `
  <div class="order-top">
    <span>
      ${getStatusText(order.status)}
    </span>
    <span class="review-link">REVIEW PRODUCT</span>
  </div>

  <div class="order-body">
    <img src="${item.productId?.images?.[0] || '../images/product.jpg'
        }" class="order-img">

    <div class="order-details">
      <h3>${item.productId?.name}</h3>

      <p>Colour: ${item.color || "N/A"}</p>
      <p>Size: ${item.size || "N/A"} &nbsp;&nbsp; Quantity: ${item.quantity}</p>

      <small>Order ID: ${order.orderId}</small>

${order.status === "Delivered" && !existingRequest
          ? `
    <div class="order-actions">
      <button class="small-btn exchange-btn"
        data-order='${JSON.stringify(order)}'
        data-item='${JSON.stringify(item)}'>
        Request Exchange
      </button>

      <button class="small-btn return-btn"
        data-order='${JSON.stringify(order)}'
        data-item='${JSON.stringify(item)}'>
        Request Return
      </button>
    </div>

    <p class="return-note">
      Exchange/Return available till 
      ${getReturnLastDate(order.orderDate)}
    </p>
  `
          : existingRequest
            ? `<p class="request-badge">
       ${existingRequest.type} Requested (${existingRequest.status})
     </p>`
            : ""
        }

    </div>
  </div>
`;

      container.appendChild(card);
    });

  });
}
function renderRequests() {
  const container = document.getElementById("requestsContainer");
  if (!container) return;

  if (!userRequests || userRequests.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
  <div class="requests-section">
    <div class="requests-header">
      <h3>Your Requests</h3>
      <span class="requests-sub">Track returns & exchanges</span>
    </div>
    <div id="requestsList"></div>
  </div>
`;

  userRequests.forEach(req => {
    const card = document.createElement("div");
    card.className = `order-card request-card ${req.type.toLowerCase()}-card`;

    card.innerHTML = `
      <div class="order-top">
        <span>${req.type} Request</span>
        <span class="status ${req.status.toLowerCase()}">
          ${req.status}
        </span>
      </div>

      <div class="order-body">
        <img src="${req.productId?.images?.[0]}" class="order-img">

        <div class="order-details">
          <h3>${req.productId?.name}</h3>

          ${req.type === "Exchange"
        ? `<p>New: ${req.newSize} / ${req.newColor}</p>`
        : `<p>Reason: ${req.reason}</p>
                 <p>Refund: ₹${req.productId?.discountedPrice}</p>`
      }

          <small>
            Requested on ${new Date(req.createdAt).toLocaleDateString("en-IN")}
          </small>

          <div class="request-info">
            ${req.type === "Return"
        ? `
                <p>• Pickup in 10–12 days</p>
                <p>• Refund after inspection</p>
                `
        : `
                <p>• New product will be delivered in 10-12 days</p>
                `
      }

            <p>• Keep product, tags & invoice intact</p>
          </div>
        </div>
      </div>
    `;
    document.getElementById("requestsList").appendChild(card);
  });
}
function getReturnLastDate(orderDate) {
  const date = new Date(orderDate);
  date.setDate(date.getDate() + 7);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function getStatusText(status) {
  switch (status) {
    case "Pending": return "Order Placed";
    case "Confirmed": return "Order Confirmed";
    case "Shipped": return "Shipped";
    case "Delivered": return "Successfully Delivered";
    case "Cancelled": return "Cancelled";
    default: return status;
  }
}

const exchangeOverlay = document.getElementById("exchangeOverlay");
const returnOverlay = document.getElementById("returnOverlay");

document.addEventListener("click", function (e) {

  // 🔥 EXCHANGE
  if (e.target.classList.contains("exchange-btn")) {
    const order = JSON.parse(e.target.dataset.order);
    const item = JSON.parse(e.target.dataset.item);

    openExchangeOverlay(order, item);
  }

  // 🔥 RETURN
  if (e.target.classList.contains("return-btn")) {
    const order = JSON.parse(e.target.dataset.order);
    const item = JSON.parse(e.target.dataset.item);

    openReturnOverlay(order, item);
  }

});

async function openExchangeOverlay(order, item) {

  exchangeOverlay.style.display = "flex";

  // 🎯 UI product preview
  document.getElementById("exchangeProduct").innerHTML = `
    <div class="product-preview">
      <img src="${item.productId?.images?.[0]}">
      <div class="product-info">
        <h4>${item.productId?.name}</h4>
        <p>${item.size} / ${item.color}</p>
        <p>Qty: ${item.quantity}</p>
      </div>
    </div>
  `;

  // 🔥 FETCH FULL PRODUCT (IMPORTANT)
  const res = await fetch(
    `https://gsd-backend-i5gj.onrender.com/api/products/${item.productId._id}`
  );
  const product = await res.json();

  const variants = product.variants || [];

  const sizeContainer = document.getElementById("sizeOptions");
  const colorContainer = document.getElementById("colorOptions");

  sizeContainer.innerHTML = "";
  colorContainer.innerHTML = "";

  const sizes = [...new Set(variants.map(v => v.size))];
  const colors = [...new Set(variants.map(v => v.color))];

  let selectedSize = item.size;
  let selectedColor = item.color;

  // 🔥 SIZE OPTIONS
  sizes.forEach(size => {
    const hasStock = variants.some(v => v.size === size && v.stock > 0);

    const div = document.createElement("div");
    div.className = `variant-option ${size === selectedSize ? "active" : ""} ${!hasStock ? "disabled" : ""}`;
    div.innerText = size;

    div.onclick = () => {
      if (!hasStock) return;

      selectedSize = size;

      document.querySelectorAll("#sizeOptions .variant-option")
        .forEach(el => el.classList.remove("active"));

      div.classList.add("active");
    };

    sizeContainer.appendChild(div);
  });

  // 🔥 COLOR OPTIONS
  colors.forEach(color => {
    const hasStock = variants.some(v => v.color === color && v.stock > 0);

    const div = document.createElement("div");
    div.className = `variant-option ${color === selectedColor ? "active" : ""} ${!hasStock ? "disabled" : ""}`;
    div.innerText = color;

    div.onclick = () => {
      if (!hasStock) return;

      selectedColor = color;

      document.querySelectorAll("#colorOptions .variant-option")
        .forEach(el => el.classList.remove("active"));

      div.classList.add("active");
    };

    colorContainer.appendChild(div);
  });

  // 🔥 SUBMIT
  document.getElementById("submitExchange").onclick = async () => {
    const btn = document.getElementById("submitExchange");
    btn.disabled = true;
    btn.innerText = "Processing...";
    try {
      const res = await fetch(
        "https://gsd-backend-i5gj.onrender.com/api/requests/exchange",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            orderId: order._id,
            productId: item.productId._id,
            newSize: selectedSize,
            newColor: selectedColor
          })
        }
      );

      const data = await res.json();

      alert("Exchange request sent");
      exchangeOverlay.style.display = "none";

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };
}

function openReturnOverlay(order, item) {

  returnOverlay.style.display = "flex";

  document.getElementById("returnProduct").innerHTML = `
    <div class="product-preview">
      <img src="${item.productId?.images?.[0]}">
      <div class="product-info">
        <h4>${item.productId?.name}</h4>
        <p>${item.size} / ${item.color}</p>
      </div>
    </div>
  `;

  document.getElementById("returnDeadline").innerText =
    "Return available till " + getReturnLastDate(order.orderDate);

  document.getElementById("submitReturn").onclick = async () => {
    const btn = document.getElementById("submitReturn");
    btn.disabled = true;
    try {
      const reason = document.getElementById("returnReason").value;

      if (!reason.trim()) {
        alert("Please enter return reason");
        return;
      }

      const res = await fetch(
        "https://gsd-backend-i5gj.onrender.com/api/requests/return",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            orderId: order._id,
            productId: item.productId._id,
            reason,
            refundAmount: item.productId.price
          })
        }
      );

      const data = await res.json();

      alert("Return request sent");
      returnOverlay.style.display = "none";

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };
}

[exchangeOverlay, returnOverlay].forEach(overlay => {
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      overlay.style.display = "none";
    }
  });
});

document.addEventListener("click", function (e) {

  /* OPEN / CLOSE FILTER DROPDOWN */
  if (e.target.id === "orderFilterBtn") {
    e.stopPropagation();

    const dropdown = document.getElementById("filterDropdown");
    if (!dropdown) return;

    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
    return;
  }

  /* SELECT FILTER OPTION */
  if (e.target.closest("#filterDropdown div")) {
    const selected = e.target.dataset.filter;
    console.log("Selected filter:", selected);

    document.getElementById("filterDropdown").style.display = "none";
    return;
  }

  /* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */
  const dropdown = document.getElementById("filterDropdown");
  if (dropdown) dropdown.style.display = "none";
});

const reviewOverlay = document.getElementById("reviewOverlay");
const reviewBox = document.getElementById("reviewBox");
const stars = document.querySelectorAll(".star");
const submitReview = document.getElementById("submitReview");

let selectedRating = 0;

/* Open Overlay */
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("review-link")) {
    reviewOverlay.style.display = "flex";
  }
});

/* Close when clicking outside */
reviewOverlay.addEventListener("click", function (e) {
  if (!reviewBox.contains(e.target)) {
    reviewOverlay.style.display = "none";
  }
});

/* Star Click Logic */
stars.forEach(star => {
  star.addEventListener("click", function () {
    selectedRating = this.getAttribute("data-value");

    stars.forEach(s => s.classList.remove("active"));

    for (let i = 0; i < selectedRating; i++) {
      stars[i].classList.add("active");
    }
  });
});

/* Submit */
submitReview.addEventListener("click", function () {

  const consent = document.getElementById("reviewConsent").checked;

  if (!consent) {
    alert("Please accept Terms & Privacy Policy.");
    return;
  }

  console.log("Rating:", selectedRating);
  console.log("Review:", document.getElementById("reviewText").value);

  reviewOverlay.style.display = "none";
});

function loadSectionFromURL() {
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");

  if (!section) {
    loadEditProfile(); // default
    return;
  }

  if (section === "orders") loadOrders();
  else if (section === "savedAddress") loadSavedAddress();
  else if (section === "editProfile") loadEditProfile();
}

loadSectionFromURL();

// birthday

async function saveProfile() {

  const token = localStorage.getItem("token");
  const birthdate = document.getElementById("birthdayInput").value;

  try {

    const response = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        birthdate: birthdate
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Profile updated successfully");
      loadEditProfile(); // reload updated data
    } else {
      alert(data.message || "Update failed");
    }

  } catch (error) {
    console.error("Update error:", error);
  }

}

