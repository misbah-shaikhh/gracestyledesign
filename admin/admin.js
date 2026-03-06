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
            tab.addEventListener('click', function() {
                const parent = this.parentElement;
                parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });

        

        // Add Product Modal
        const addProductBtn = document.getElementById('addProductBtn');
        const addProductModal = document.getElementById('addProductModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const addProductForm = document.getElementById('addProductForm');

        // Open modal
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                addProductModal.classList.add('active');
            });
        }

        // Close modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                addProductModal.classList.remove('active');
                addProductForm.reset();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                addProductModal.classList.remove('active');
                addProductForm.reset();
            });
        }

        // Close modal when clicking outside
        if (addProductModal) {
            addProductModal.addEventListener('click', (e) => {
                if (e.target === addProductModal) {
                    addProductModal.classList.remove('active');
                    addProductForm.reset();
                }
            });
        }

        // Handle form submission
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(addProductForm);
                const productData = {
                    name: formData.get('productName'),
                    category: formData.get('category'),
                    price: formData.get('price'),
                    stock: formData.get('stock'),
                    sizes: Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map(cb => cb.value),
                    colors: Array.from(document.querySelectorAll('input[name="colors"]:checked')).map(cb => cb.value),
                    description: formData.get('description'),
                    offer: formData.get('offerApplicable'),
                    discountPrice: formData.get('discountPrice')
                };

                // Validate sizes and colors
                if (productData.sizes.length === 0) {
                    alert('Please select at least one size');
                    return;
                }

                if (productData.colors.length === 0) {
                    alert('Please select at least one color');
                    return;
                }

                // Add product to table
                const productsTable = document.querySelector('#products tbody');
                const newRow = productsTable.insertRow(0);
                
                newRow.innerHTML = `
                    <td>${productData.name}</td>
                    <td>${productData.category}</td>
                    <td>${productData.sizes.join(', ')}</td>
                    <td>Rs.${parseFloat(productData.price).toLocaleString()}</td>
                    <td>${parseInt(productData.stock) > 10 ? 'Available' : 'Low Stock'}</td>
                    <td><button class="btn">Edit</button></td>
                `;

                // Close modal and reset form
                addProductModal.classList.remove('active');
                addProductForm.reset();
                
                // Show success message
                alert('Product added successfully!');
            });
        }

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
            couponCodeInput.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
            });
        }


        
async function loadCustomers(){

    try{

        const response = await fetch("http://localhost:5000/api/admin/users");

        if(!response.ok){
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
    catch(error){

        console.error("Error loading users:", error);

    }

}

loadCustomers();

// for new users in admin dashboard
async function loadDashboardStats(){

    try{

        const response = await fetch("http://localhost:5000/api/admin/dashboard-stats");

        const data = await response.json();

        document.getElementById("newCustomers").innerText = data.newCustomers;

    }
    catch(error){

        console.error("Dashboard error:", error);

    }

}

loadDashboardStats();