document.getElementById("signupForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    let mobile = document.getElementById("mobile").value.trim();
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    /* =====================
       EMPTY CHECK
    ===================== */
    if (!mobile || !name || !email || !password || !confirmPassword) {
        return alert("Please fill all fields");
    }

    /* =====================
       NAME VALIDATION
       Only alphabets + spaces
    ===================== */
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(name)) {
        return alert("Name should contain only letters");
    }

    /* =====================
       MOBILE VALIDATION (INDIA)
       - Starts with 6-9
       - Total 10 digits
    ===================== */
    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(mobile)) {
        return alert("Enter valid Indian mobile number");
    }

    /* =====================
       EMAIL VALIDATION
       More reliable regex
    ===================== */
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email)) {
        return alert("Enter valid email address");
    }

    /* =====================
       PASSWORD RULES
       (You can relax if needed)
    ===================== */
    if (password.length < 6) {
        return alert("Password must be at least 6 characters");
    }

    // OPTIONAL: Strong password (recommended)
    /*
    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!strongPassword.test(password)) {
        return alert("Password must contain letters and numbers");
    }
    */

    /* =====================
       PASSWORD MATCH
    ===================== */
    if (password !== confirmPassword) {
        return alert("Passwords do not match");
    }

    /* =====================
       API CALL
    ===================== */
    try {

        const response = await fetch("https://gsd-backend-i5gj.onrender.com/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                phone: mobile
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup Successful!");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Signup failed");
        }

    } catch (error) {
        console.error("Signup Error:", error);
        alert("Cannot connect to server. Make sure backend is running.");
    }

});

/* =====================
   MOBILE INPUT RESTRICTION
===================== */

const mobileInput = document.getElementById("mobile");

if (mobileInput) {
    mobileInput.addEventListener("input", function () {

        // Allow only digits
        this.value = this.value.replace(/\D/g, '');

        // Limit to 10 digits
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }

    });
}