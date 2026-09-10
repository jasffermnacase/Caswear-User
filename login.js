import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================================
// FIREBASE CONFIG
// ==========================================================

const firebaseConfig = {

    apiKey: "AIzaSyAqlEDKaGECuc8ycmzZVHD7gQeZcqnm7ek",

    authDomain: "caswear-c21e2.firebaseapp.com",

    projectId: "caswear-c21e2",

    storageBucket: "caswear-c21e2.firebasestorage.app",

    messagingSenderId: "842998215942",

    appId: "1:842998215942:web:fcd283e0cd118451951a87",

    measurementId: "G-317N3TECX6"

};


// ==========================================================
// INITIALIZE FIREBASE
// ==========================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ==========================================================
// PAGE LOAD
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("CASWear Customer Login JS loaded.");

        setupLogin();

        setupForgotPassword();

    }
);


// ==========================================================
// LOGIN SETUP
// ==========================================================

function setupLogin() {

    const loginButton =
        document.getElementById("login-btn");


    if (!loginButton) {

        console.error(
            "Login button #login-btn was not found."
        );

        return;

    }


    loginButton.addEventListener(
        "click",
        loginUser
    );

}


// ==========================================================
// LOGIN USER
// ==========================================================

async function loginUser() {

    const emailInput =
        document.getElementById("login-email");

    const passwordInput =
        document.getElementById("login-password");


    if (!emailInput || !passwordInput) {

        console.error(
            "Email or password input was not found."
        );

        return;

    }


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    // ======================================================
    // CHECK EMAIL
    // ======================================================

    if (!email) {

        showLoginMessage(
            "Please enter your email.",
            "error"
        );

        emailInput.focus();

        return;

    }


    // ======================================================
    // CHECK PASSWORD
    // ======================================================

    if (!password) {

        showLoginMessage(
            "Please enter your password.",
            "error"
        );

        passwordInput.focus();

        return;

    }


    const loginButton =
        document.getElementById("login-btn");


    // ======================================================
    // DISABLE LOGIN BUTTON
    // ======================================================

    if (loginButton) {

        loginButton.disabled = true;

    }


    try {

        // ==================================================
        // FIREBASE AUTHENTICATION
        // ==================================================

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        console.log(
            "Firebase Authentication successful."
        );

        console.log(
            "Email:",
            user.email
        );

        console.log(
            "UID:",
            user.uid
        );


        // ==================================================
        // GET USER DOCUMENT FROM FIRESTORE
        // ==================================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(userRef);


        // ==================================================
        // CHECK IF USER DOCUMENT EXISTS
        // ==================================================

        if (!userSnapshot.exists()) {

            console.error(
                "User document does not exist."
            );


            await signOut(auth);


            showLoginMessage(
                "Your account information could not be found.",
                "error"
            );


            if (loginButton) {

                loginButton.disabled = false;

            }


            return;

        }


        // ==================================================
        // GET USER DATA
        // ==================================================

        const userData =
            userSnapshot.data();


        const role =
            String(
                userData.role || ""
            )
            .trim()
            .toLowerCase();


        console.log(
            "User role:",
            role
        );


        // ==================================================
        // BLOCK ADMIN ACCOUNTS
        // ==================================================

        if (role === "admin") {

            console.warn(
                "Admin account attempted to access customer login."
            );


            // ----------------------------------------------
            // SIGN ADMIN OUT
            // ----------------------------------------------

            await signOut(auth);


            // ----------------------------------------------
            // SHOW MESSAGE
            // ----------------------------------------------

            showLoginMessage(
                "Admin accounts cannot log in from the customer page.",
                "error"
            );


            if (loginButton) {

                loginButton.disabled = false;

            }


            return;

        }


        // ==================================================
        // ALLOW CUSTOMER ACCOUNT
        // ==================================================

        if (role === "customer") {

            console.log(
                "Customer account verified."
            );


            showLoginMessage(
                "Login successful! Redirecting...",
                "success"
            );


            // ----------------------------------------------
            // REDIRECT CUSTOMER TO HOME
            // ----------------------------------------------

            setTimeout(
                function () {

                    window.location.href =
                        "home.html";

                },
                800
            );


            return;

        }


        // ==================================================
        // BLOCK UNKNOWN / MISSING ROLE
        // ==================================================

        console.warn(
            "Account has an invalid or missing role:",
            role
        );


        // ----------------------------------------------
        // SIGN USER OUT
        // ----------------------------------------------

        await signOut(auth);


        // ----------------------------------------------
        // SHOW ERROR
        // ----------------------------------------------

        showLoginMessage(
            "This account is not authorized to access the customer page.",
            "error"
        );


        if (loginButton) {

            loginButton.disabled = false;

        }


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        let message =
            "Unable to log in.";


        // ==================================================
        // INVALID CREDENTIAL
        // ==================================================

        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "Incorrect email or password.";

        }


        // ==================================================
        // WRONG PASSWORD
        // ==================================================

        else if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "Incorrect password.";

        }


        // ==================================================
        // USER NOT FOUND
        // ==================================================

        else if (
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "No account was found with this email.";

        }


        // ==================================================
        // INVALID EMAIL
        // ==================================================

        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Please enter a valid email address.";

        }


        // ==================================================
        // USER DISABLED
        // ==================================================

        else if (
            error.code ===
            "auth/user-disabled"
        ) {

            message =
                "This account has been disabled.";

        }


        // ==================================================
        // TOO MANY REQUESTS
        // ==================================================

        else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            message =
                "Too many login attempts. Please try again later.";

        }


        // ==================================================
        // NETWORK ERROR
        // ==================================================

        else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            message =
                "Network error. Please check your internet connection.";

        }


        // ==================================================
        // OPERATION NOT ALLOWED
        // ==================================================

        else if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            message =
                "Email/password authentication is not enabled in Firebase.";

        }


        // ==================================================
        // FIRESTORE PERMISSION ERROR
        // ==================================================

        else if (
            error.code ===
            "permission-denied" ||
            error.code ===
            "firestore/permission-denied"
        ) {

            message =
                "Unable to verify your account role. Please contact support.";

        }


        // ==================================================
        // FIRESTORE UNAVAILABLE
        // ==================================================

        else if (
            error.code ===
            "unavailable"
        ) {

            message =
                "The service is temporarily unavailable. Please try again.";

        }


        // ==================================================
        // SHOW ERROR
        // ==================================================

        showLoginMessage(
            message,
            "error"
        );


        // ==================================================
        // ENABLE LOGIN BUTTON AGAIN
        // ==================================================

        if (loginButton) {

            loginButton.disabled = false;

        }

    }

}


// ==========================================================
// FORGOT PASSWORD SETUP
// ==========================================================

function setupForgotPassword() {

    const forgotPassword =
        document.getElementById(
            "forgot-password-btn"
        );


    if (!forgotPassword) {

        console.error(
            "Forgot password button #forgot-password-btn was not found."
        );

        return;

    }


    forgotPassword.addEventListener(
        "click",
        resetPassword
    );

}


// ==========================================================
// RESET PASSWORD
// ==========================================================

async function resetPassword() {

    const emailInput =
        document.getElementById(
            "login-email"
        );


    if (!emailInput) {

        return;

    }


    const email =
        emailInput.value.trim();


    // ======================================================
    // CHECK EMAIL
    // ======================================================

    if (!email) {

        showLoginMessage(
            "Please enter your email first.",
            "error"
        );

        emailInput.focus();

        return;

    }


    const forgotPassword =
        document.getElementById(
            "forgot-password-btn"
        );


    // ======================================================
    // DISABLE FORGOT PASSWORD BUTTON
    // ======================================================

    if (forgotPassword) {

        forgotPassword.disabled = true;

        forgotPassword.textContent =
            "Sending...";

    }


    try {

        // ==================================================
        // SEND PASSWORD RESET EMAIL
        // ==================================================

        await sendPasswordResetEmail(
            auth,
            email
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        showLoginMessage(
            "Password reset email sent! Please check your inbox and spam folder.",
            "success"
        );


        console.log(
            "Password reset email sent to:",
            email
        );


    } catch (error) {

        console.error(
            "Password reset error:",
            error
        );


        let message =
            "Unable to send password reset email.";


        // ==================================================
        // INVALID EMAIL
        // ==================================================

        if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Please enter a valid email address.";

        }


        // ==================================================
        // USER NOT FOUND
        // ==================================================

        else if (
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "No account was found with this email.";

        }


        // ==================================================
        // TOO MANY REQUESTS
        // ==================================================

        else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            message =
                "Too many requests. Please try again later.";

        }


        // ==================================================
        // OPERATION NOT ALLOWED
        // ==================================================

        else if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            message =
                "Email/password authentication is not enabled in Firebase.";

        }


        // ==================================================
        // NETWORK ERROR
        // ==================================================

        else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            message =
                "Network error. Please check your internet connection.";

        }


        // ==================================================
        // SHOW ERROR
        // ==================================================

        showLoginMessage(
            message,
            "error"
        );

    }


    // ======================================================
    // ENABLE FORGOT PASSWORD BUTTON
    // ======================================================

    if (forgotPassword) {

        forgotPassword.disabled = false;

        forgotPassword.textContent =
            "Forgot Password?";

    }

}


// ==========================================================
// LOGIN MESSAGE
// ==========================================================

function showLoginMessage(
    text,
    type
) {

    const element =
        document.getElementById(
            "loginMessage"
        );


    if (!element) {

        console.error(
            "Element #loginMessage was not found."
        );

        return;

    }


    element.textContent =
        text;


    element.className =
        "login-message " + type;

}
