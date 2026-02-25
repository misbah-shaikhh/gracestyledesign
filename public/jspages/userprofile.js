const profileContent = document.getElementById("profileContent");
const menuItems = document.querySelectorAll(".profile-sidebar li");

function loadEditProfile() {
  profileContent.innerHTML = `
    <div class="edit-box">
      <h2>Edit Profile</h2>

      <div class="form-row">
        <div>
          <label>Mobile Number</label>
          <input type="text" value="121046822154" disabled>
        </div>
      </div>

      <div class="form-row">
        <div>
          <label>Email</label>
          <input type="text" value="ajskdkgusdushh" disabled>
        </div>
      </div>

      <div class="form-group">
        <label>Full Name</label>
        <input type="text" placeholder="">
      </div>

      <div class="form-group">
        <label>Birthday</label>
        <input type="date">
      </div>

      <button class="save-btn">Save Details</button>
    </div>
  `;
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

function loadSavedAddress() {
  profileContent.innerHTML = `
    <div class="edit-box">
        <div class="address-header">
        <h2>Saved Address</h2>
        <span class="add-address">+ ADD NEW ADDRESS</span>
        </div>

      <div class="form-group">
        <label>Name</label>
        <input type="text" value="KIMO" disabled>
      </div>

      <div class="form-group">
        <label>Mobile</label>
        <input type="text" value="21628264922" disabled>
      </div>

      <div class="form-row split">
        <div>
          <label>Pincode</label>
          <input type="text" value="907273" disabled>
        </div>

        <div>
          <label>State</label>
          <input type="text" value="Maharashtra" disabled>
        </div>
      </div>

      <div class="form-group">
        <label>Address (House no., Building, Street, Area)</label>
        <input type="text" value="386, b, jdgfs" disabled>
      </div>

      <div class="form-row split">
        <div>
          <label>Landmark</label>
          <input type="text" value="Church" disabled>
        </div>

        <div>
          <label>City/District</label>
          <input type="text" value="Mumbai" disabled>
        </div>
      </div>

      <div style="margin-top:15px;">
        <label style="display:flex; align-items:center; gap:10px;">
          <input type="radio" name="defaultAddress" checked disabled>
          Default Address
        </label>
      </div>

      <button class="save-btn" id="editAddressBtn">Edit Details</button>
    </div>
  `;

  const editBtn = document.getElementById("editAddressBtn");
  const inputs = profileContent.querySelectorAll("input");

  let editing = false;

  editBtn.addEventListener("click", () => {
    editing = !editing;

    inputs.forEach(input => {
      if (input.type !== "radio") {
        input.disabled = !editing;
      } else {
        input.disabled = !editing;
      }
    });

    editBtn.textContent = editing ? "Save Details" : "Edit Details";
  });
}

const addressOverlay = document.getElementById("addressOverlay");
const cancelOverlay = document.getElementById("cancelOverlay");

document.addEventListener("click", function(e) {

  // Open overlay
  if (e.target.classList.contains("add-address")) {
    addressOverlay.style.display = "flex";
  }

  // Close overlay
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