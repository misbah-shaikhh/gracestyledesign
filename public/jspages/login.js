/* ---------------- TIMER VARIABLES (GLOBAL) ---------------- */

let countdown;
let timeLeft = 30;

/* ---------------- TIMER FUNCTION (GLOBAL) ---------------- */

function startTimer() {

    const timerDisplay = document.getElementById("timer");
    const resendBtn = document.getElementById("resendBtn");

    timeLeft = 30;
    timerDisplay.textContent = timeLeft;

    resendBtn.style.pointerEvents = "none";
    resendBtn.style.opacity = "0.5";

    clearInterval(countdown);

    countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            resendBtn.style.pointerEvents = "auto";
            resendBtn.style.opacity = "1";
        }
    }, 1000);
}


/* ---------------- SHOW OTP ---------------- */

async function showOTP() {

    const phoneInput = document.querySelector(".phone-input input").value;
    const termsChecked = document.getElementById("terms").checked;

    if (phoneInput.length !== 10) {
        alert("Please enter valid 10 digit mobile number");
        return;
    }

    if (!termsChecked) {
        alert("Please accept Terms & Conditions");
        return;
    }

    try {

          const response = await fetch("http://localhost:5000/api/check-user", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  phone: phoneInput
              })
          });

        const data = await response.json();

        /* USER DOES NOT EXIST */

        if (response.status === 404) {

            alert("Account not found. Redirecting to signup...");
            window.location.href = "signup.html";
            return;

        }

        /* USER EXISTS */

        if (response.status === 200) {

            document.getElementById("otpSection").style.display = "block";
            document.getElementById("userNumber").innerText = phoneInput;
            document.querySelector(".login-btn").style.display = "none";

            startTimer();

        }

    } catch (error) {

        console.error("Login Error:", error);
        alert("Server error. Please try again.");

    }

}


/* ---------------- DOM READY CODE ---------------- */

document.addEventListener("DOMContentLoaded", function () {

    /* -------- RESEND CLICK -------- */

    document.getElementById("resendBtn").addEventListener("click", function () {
        startTimer();
        console.log("OTP Resent (Simulation)");
    });


    /* -------- PASSWORD TOGGLE -------- */

    document.getElementById("passwordToggle").addEventListener("click", function () {

        const otpContainer = document.getElementById("otpContainer");

        document.getElementById("otpHeading").innerText = "Enter Password";
        document.getElementById("otpSubtitle").style.display = "none";
        document.getElementById("resendWrapper").style.display = "none";

        otpContainer.innerHTML = `
            <input type="password" 
                   id="passwordInput"
                   placeholder="Enter Password" 
                   style="width:100%; padding:10px; border-radius:6px; border:1px solid #b89c6a;">
        `;

        const verifyBtn = document.querySelector(".verify-btn");

        verifyBtn.textContent = "Login";

        verifyBtn.onclick = async function () {

            const phoneInput = document.querySelector(".phone-input input").value;
            const password = document.getElementById("passwordInput").value;

            try {

                const response = await fetch("http://localhost:5000/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        phone: phoneInput,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.status === 200) {

                    window.location.href = "index.html";

                } else {

                    alert(data.message);

                }

            } catch (error) {

                console.error("Login Error:", error);
                alert("Server error");

            }

        };
    });

});