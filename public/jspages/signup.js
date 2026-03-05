document.getElementById("signupForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    let mobile = document.getElementById("mobile").value.trim();
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    // Empty field check
    if (!mobile || !name || !email || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    // Mobile validation
    if (!/^[0-9]{10}$/.test(mobile)) {
        alert("Enter valid 10 digit mobile number");
        return;
    }

    // Email validation
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(email)) {
        alert("Enter valid email address");
        return;
    }

    // Password length
    if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }

    // Password match
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {

        const response = await fetch("http://localhost:5000/api/signup", {

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