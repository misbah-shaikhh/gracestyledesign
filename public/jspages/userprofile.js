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

    addressHTML = createAddressForm();

  } else {

    addresses.forEach(addr => {
      addressHTML += createAddressForm(addr);
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

function createAddressForm(addr = {}) {

  return `

  <div class="address-block">

      <div class="form-group">
        <label>Name</label>
        <input type="text" value="${addr.name || ""}">
      </div>

      <div class="form-group">
        <label>Mobile</label>
        <input type="text" value="${addr.phone || ""}">
      </div>

      <div class="form-row split">
        <div>
          <label>Pincode</label>
          <input type="text" value="${addr.pincode || ""}">
        </div>

        <div>
          <label>State</label>
          <input type="text" value="${addr.state || ""}">
        </div>
      </div>

      <div class="form-group">
        <label>Address (House no., Building, Street, Area)</label>
        <input type="text" value="${addr.addressLine || ""}">
      </div>

      <div class="form-row split">
        <div>
          <label>Landmark</label>
          <input type="text" value="${addr.landmark || ""}">
        </div>

        <div>
          <label>City/District</label>
          <input type="text" value="${addr.city || ""}">
        </div>
      </div>

      <div style="margin-top:15px;">
        <label style="display:flex; align-items:center; gap:10px;">
          <input type="radio" name="defaultAddress"
            ${addr.isDefault ? "checked" : ""}>
          Default Address
        </label>
      </div>

      <button class="save-btn saveAddressBtn"
        data-id="${addr._id || ""}">
        ${addr._id ? "Update Address" : "Save Address"}
      </button>

      <hr style="margin:25px 0;">

  </div>

  `;
}

document.addEventListener("click", async function(e){

  if(!e.target.classList.contains("saveAddressBtn")) return;

  const token = localStorage.getItem("token");

  const block = e.target.closest(".address-block, .overlay-address-form");

  const inputs = block.querySelectorAll("input");

  const data = {
    name: inputs[0].value,
    phone: inputs[1].value,
    pincode: inputs[2].value,
    state: inputs[3].value,
    addressLine: inputs[4].value,
    landmark: inputs[5].value,
    city: inputs[6].value,
    isDefault: block.querySelector(".defaultAddress").checked
  };

  const phoneRegex = /^[0-9]{10}$/;

  if(!phoneRegex.test(data.phone)){
    alert("Phone number must be exactly 10 digits");
    return;
  }

  const allBlocks = document.querySelectorAll(".address-block");

let isDuplicate = false;

allBlocks.forEach(b => {

  if(b === block) return; // skip current form

  const inputs = b.querySelectorAll("input");

  const existing = {
    name: inputs[0].value,
    phone: inputs[1].value,
    pincode: inputs[2].value,
    state: inputs[3].value,
    addressLine: inputs[4].value,
    landmark: inputs[5].value,
    city: inputs[6].value
  };

  if(
    existing.name === data.name &&
    existing.phone === data.phone &&
    existing.pincode === data.pincode &&
    existing.state === data.state &&
    existing.addressLine === data.addressLine &&
    existing.landmark === data.landmark &&
    existing.city === data.city
  ){
    isDuplicate = true;
  }

});

if(isDuplicate){
  alert("This address already exists. Please enter a different address.");
  return;
}
  const id = e.target.dataset.id;

  const url = id
    ? `http://localhost:5000/api/addresses/${id}`
    : "http://localhost:5000/api/addresses";

  const method = id ? "PUT" : "POST";

  await fetch(url,{
    method:method,
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${token}`
    },
    body:JSON.stringify(data)
  });

  addressOverlay.style.display = "none";

  loadSavedAddress();

});

async function setDefaultAddress(id){

  const token = localStorage.getItem("token");

  await fetch(`http://localhost:5000/api/addresses/default/${id}`,{
    method:"PUT",
    headers:{
      Authorization:`Bearer ${token}`
    }
  });

  loadSavedAddress();
}

function addNewAddress(){

  const list = document.querySelector(".address-list");

  list.insertAdjacentHTML(
    "beforeend",
    createAddressCard()
  );

}

const addressOverlay = document.getElementById("addressOverlay");
const cancelOverlay = document.getElementById("cancelOverlay");

document.addEventListener("click", function(e) {

  // OPEN OVERLAY
  if (e.target.classList.contains("add-address")) {

    // clear old values
    const inputs = addressOverlay.querySelectorAll("input");
    inputs.forEach(i => i.value = "");

    addressOverlay.style.display = "flex";
  }

  // CLOSE OVERLAY
  if (e.target.id === "cancelOverlay") {

    addressOverlay.style.display = "none";

  }

});

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

      <!-- Order Card 1 -->
      <div class="order-card">
        <div class="order-top">
          <span>Successfully Delivered On 20th January 2026</span>
          <span class="review-link">REVIEW PRODUCT</span>
        </div>

        <div class="order-body">
          <img src="../images/product.jpg" class="order-img">

          <div class="order-details">
            <h3>Pink Ethnic Suit</h3>
            <p>Colour: 05-BIHU BLISS</p>
            <p>Size : M &nbsp;&nbsp; Quantity : 1</p>
            <small>Exchange/Return Window Closed On Tue, 4 Oct 2022</small>
          </div>
        </div>
      </div>

      <!-- Order Card 2 -->
      <div class="order-card">
        <div class="order-top">
          <span>Successfully Delivered On 20th January 2026</span>
          <span class="review-link">REVIEW PRODUCT</span>
        </div>

        <div class="order-body">
          <img src="../images/product.jpg" class="order-img">

          <div class="order-details">
            <h3>Pink Ethnic Suit</h3>
            <p>Colour: 05-BIHU BLISS</p>
            <p>Size : M &nbsp;&nbsp; Quantity : 1</p>

            <div class="order-actions">
              <button class="small-btn">Request Exchange</button>
              <button class="small-btn">Request Return</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
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
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("review-link")) {
    reviewOverlay.style.display = "flex";
  }
});

/* Close when clicking outside */
reviewOverlay.addEventListener("click", function(e) {
  if (!reviewBox.contains(e.target)) {
    reviewOverlay.style.display = "none";
  }
});

/* Star Click Logic */
stars.forEach(star => {
  star.addEventListener("click", function() {
    selectedRating = this.getAttribute("data-value");

    stars.forEach(s => s.classList.remove("active"));

    for (let i = 0; i < selectedRating; i++) {
      stars[i].classList.add("active");
    }
  });
});

/* Submit */
submitReview.addEventListener("click", function() {

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

