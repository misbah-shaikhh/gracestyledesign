const profileContent = document.getElementById("profileContent");
const menuItems = document.querySelectorAll(".profile-sidebar li");

async function loadEditProfile() {

  const token = localStorage.getItem("token");

  try {

    const response = await fetch("http://localhost:5000/api/profile", {
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

  const res = await fetch("http://localhost:5000/api/addresses", {
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
    ? `http://localhost:5000/api/addresses/${id}`
    : "http://localhost:5000/api/addresses";

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

  await fetch(`http://localhost:5000/api/addresses/default/${id}`, {
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
  fetch(`http://localhost:5000/api/addresses`, {
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

async function fetchUserOrders() {
  const res = await fetch("http://localhost:5000/api/orders");
  const data = await res.json();
  userOrders = data.orders;
  renderOrders();
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

      <div id="ordersContainer"></div>
    </div>
  `;

  renderOrders();
}

function renderOrders() {
  const container = document.getElementById("ordersContainer");
  container.innerHTML = "";

  userOrders.forEach(order => {

    order.items.forEach(item => {

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
          <img src="${
            item.productId?.images?.[0] || '../images/product.jpg'
          }" class="order-img">

          <div class="order-details">
            <h3>${item.productId?.name}</h3>

            <p>Colour: ${item.color || "N/A"}</p>
            <p>Size: ${item.size || "N/A"} &nbsp;&nbsp; Quantity: ${item.quantity}</p>

            <small>Order ID: ${order.orderId}</small>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

  });
}

function getStatusText(status) {
  switch(status) {
    case "Pending": return "Order Placed";
    case "Confirmed": return "Order Confirmed";
    case "Shipped": return "Shipped";
    case "Delivered": return "Successfully Delivered";
    case "Cancelled": return "Cancelled";
    default: return status;
  }
}

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

