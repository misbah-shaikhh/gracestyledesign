document.addEventListener("DOMContentLoaded", () => {
    const productGrid = document.getElementById("productGrid");
    const range = document.getElementById("priceRange");
    const priceValue = document.getElementById("priceValue");
    const sizeOptions = document.querySelectorAll(".size-options span");
    const clearFilterBtn = document.querySelector(".clear-filter");

    let maxPrice = Number(range?.value || 10000);
    let selectedSizes = [];

    // ----------------------
    // RANGE SLIDER
    // ----------------------
    function updateRange() {
        if (!range) return;

        const min = Number(range.min);
        const max = Number(range.max);
        const value = Number(range.value);
        const percent = ((value - min) / (max - min)) * 100;

        range.style.background = `linear-gradient(
      to right,
      #6b2f1a 0%,
      #6b2f1a ${percent}%,
      #fff ${percent}%,
      #fff 100%
    )`;

        if (priceValue) priceValue.innerText = value.toLocaleString();
        maxPrice = Number(value);
        fetchAndRenderProducts();
    }

    if (range) {
        range.addEventListener("input", updateRange);
        updateRange(); // initial setup
    }

    // ----------------------
    // SIZE FILTER
    // ----------------------
    sizeOptions.forEach(span => {
        span.addEventListener("click", () => {
            span.classList.toggle("selected");

            // Update selectedSizes array from the data-size attribute (normalize to lowercase)
            selectedSizes = Array.from(document.querySelectorAll(".size-options span.selected"))
                .map(el => el.dataset.size.trim().toLowerCase());

            // Fetch & render products after size selection changes
            fetchAndRenderProducts();
        });
    });

    // ----------------------
    // CLEAR FILTER
    // ----------------------
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener("click", () => {
            // reset price slider
            if (range) {
                range.value = range.max;
                maxPrice = Number(range.max);
                updateRange(); // updates slider background and price
            }

            // clear size selection
            sizeOptions.forEach(span => span.classList.remove("selected"));
            selectedSizes = [];

            fetchAndRenderProducts();
        });
    }

    // ----------------------
    // FETCH & RENDER PRODUCTS
    // ----------------------
    async function fetchAndRenderProducts() {
        if (!productGrid) return;

        try {
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("Failed to fetch products");

            let products = await res.json();

            // --- FILTER BY PRICE ---
            products = products.filter(p => {
                const price = p.discountedPrice ?? p.originalPrice;
                return price <= maxPrice;
            });

            // --- FILTER BY SIZE ---
            if (selectedSizes.length > 0) {
                products = products.filter(p =>
                    p.variants?.some(v =>
                        selectedSizes.includes(String(v.size).trim().toLowerCase())
                    )
                );
            }

            // --- SORT BY NEWEST FIRST ---
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // --- RENDER ---
            productGrid.innerHTML = "";
            if (products.length === 0) {
                productGrid.innerHTML = "<p style='padding:20px;'>No products found.</p>";
                return;
            }

            products.forEach(p => {
                const card = document.createElement("div");
                card.classList.add("product-card");
                card.dataset.id = p._id; // use the real MongoDB _id
                card.addEventListener("click", () => {
                    const id = card.dataset.id; // this is _id now
                    window.location.href = `../htmlpages/prodview.html?id=${id}`;
                }); const colors = p.variants?.map(v => v.color).slice(0, 2) || [];

                card.innerHTML = `
          <div class="product-img">
            <img src="${p.images?.[0] || '../images/product.jpg'}" alt="${p.name}">
          </div>
          <div class="product-info">
            <h3>${p.name}</h3>
            <p class="price">
              ₹${(p.discountedPrice ?? 0).toLocaleString()}
              ${p.discountedPrice ? `<span>₹${p.originalPrice?.toLocaleString() || 0}</span>` : ""}
            </p>
            <div class="info-row">
              <div class="colors">
                <span class="c1" style="background-color: ${colors[0] || 'transparent'}"></span>
                <span class="c2" style="background-color: ${colors[1] || 'transparent'}"></span>
              </div>
              <div class="rating-heart">
                <span class="rating">⭐ ${p.rating || 4.5}</span>
                <i class="fa-regular fa-heart heart wishlist-btn"></i>
              </div>
            </div>
          </div>
        `;

                productGrid.appendChild(card);
            });
            // ✅ Sync hearts after all product cards are rendered
            syncWishlistHearts();

        } catch (err) {
            console.error("Error fetching products:", err);
            productGrid.innerHTML = "<p style='padding:20px;'>Failed to load products.</p>";
        }
    }

    // Initial fetch
    fetchAndRenderProducts();
});