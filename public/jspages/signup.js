document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let mobile = document.getElementById("mobile").value;
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    // Mobile validation
    if(mobile.length !== 10){
        alert("Enter valid 10 digit mobile number");
        return;
    }

    // Password match check
    if(password !== confirmPassword){
        alert("Passwords do not match");
        return;
    }

    // Save user data (localStorage demo)
    let userData = {
        mobile: mobile,
        name: name,
        email: email,
        password: password
    };

    localStorage.setItem("user", JSON.stringify(userData));

    alert("Signup Successful!");

    // redirect to login
    window.location.href = "login.html";
});
