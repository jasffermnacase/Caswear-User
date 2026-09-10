// ==========================================================
// CASWEAR SETTINGS.JS
// ==========================================================


// ==========================================================
// FIREBASE IMPORTS
// ==========================================================

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// FIREBASE CONFIG
// ==========================================================
// USE THE SAME CONFIG FROM YOUR LOGIN.JS
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

const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);


// ==========================================================
// FIREBASE AUTH
// ==========================================================

const auth = getAuth(app);


// ==========================================================
// CURRENT USER
// ==========================================================

let currentUser = null;


// ==========================================================
// PAGE LOAD
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("CASWear Settings JS loaded.");

    loadSettings();

    setupNotificationSettings();

    setupCartSettings();

    setupChangePassword();

    setupPasswordForm();

    setupProfileDropdown();

    setupNotificationDropdown();

});


// ==========================================================
// FIREBASE AUTH STATE
// ==========================================================

onAuthStateChanged(auth, function (user) {

    if (user) {

        currentUser = user;

        console.log(
            "CASWear Settings - Logged in:",
            user.email
        );

        // Optional user email display
        const userEmail =
            document.getElementById("userEmail");

        if (userEmail) {

            userEmail.textContent =
                user.email;

        }

    } else {

        currentUser = null;

        console.log(
            "CASWear Settings - No user logged in."
        );

    }

});


// ==========================================================
// LOAD SETTINGS
// ==========================================================

function loadSettings() {

    const orderNotifications =
        localStorage.getItem(
            "orderNotifications"
        );

    const paymentNotifications =
        localStorage.getItem(
            "paymentNotifications"
        );

    const keepCart =
        localStorage.getItem(
            "keepCart"
        );


    const orderCheckbox =
        document.getElementById(
            "orderNotifications"
        );

    const paymentCheckbox =
        document.getElementById(
            "paymentNotifications"
        );

    const cartCheckbox =
        document.getElementById(
            "keepCart"
        );


    // ======================================================
    // ORDER NOTIFICATIONS
    // ======================================================

    if (
        orderNotifications !== null &&
        orderCheckbox
    ) {

        orderCheckbox.checked =
            orderNotifications === "true";

    }


    // ======================================================
    // PAYMENT NOTIFICATIONS
    // ======================================================

    if (
        paymentNotifications !== null &&
        paymentCheckbox
    ) {

        paymentCheckbox.checked =
            paymentNotifications === "true";

    }


    // ======================================================
    // KEEP CART
    // ======================================================

    if (
        keepCart !== null &&
        cartCheckbox
    ) {

        cartCheckbox.checked =
            keepCart === "true";

    }

}


// ==========================================================
// NOTIFICATION SETTINGS
// ==========================================================

function setupNotificationSettings() {

    const orderNotifications =
        document.getElementById(
            "orderNotifications"
        );

    const paymentNotifications =
        document.getElementById(
            "paymentNotifications"
        );


    // ======================================================
    // ORDER NOTIFICATIONS
    // ======================================================

    if (orderNotifications) {

        orderNotifications.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "orderNotifications",
                    this.checked
                );

            }
        );

    }


    // ======================================================
    // PAYMENT NOTIFICATIONS
    // ======================================================

    if (paymentNotifications) {

        paymentNotifications.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "paymentNotifications",
                    this.checked
                );

            }
        );

    }

}


// ==========================================================
// CART SETTINGS
// ==========================================================

function setupCartSettings() {

    const keepCart =
        document.getElementById(
            "keepCart"
        );


    if (!keepCart) return;


    keepCart.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "keepCart",
                this.checked
            );

        }
    );

}


// ==========================================================
// CHANGE PASSWORD BUTTON
// ==========================================================

function setupChangePassword() {

    const button =
        document.getElementById(
            "changePasswordBtn"
        );

    const form =
        document.getElementById(
            "passwordForm"
        );


    if (!button || !form) {

        console.log(
            "Change password button or form not found."
        );

        return;

    }


    button.addEventListener(
        "click",
        function () {

            form.classList.toggle("show");

        }
    );

}


// ==========================================================
// PASSWORD FORM
// ==========================================================

function setupPasswordForm() {

    const saveButton =
        document.getElementById(
            "savePasswordBtn"
        );

    const cancelButton =
        document.getElementById(
            "cancelPasswordBtn"
        );


    // ======================================================
    // SAVE PASSWORD
    // ======================================================

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            changePassword
        );

    }


    // ======================================================
    // CANCEL
    // ======================================================

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                const form =
                    document.getElementById(
                        "passwordForm"
                    );


                if (form) {

                    form.classList.remove(
                        "show"
                    );

                }


                clearPasswordFields();

            }
        );

    }

}


// ==========================================================
// CHANGE PASSWORD
// ==========================================================

async function changePassword() {

    console.log(
        "Change password function started."
    );


    // ======================================================
    // GET INPUTS
    // ======================================================

    const currentPasswordInput =
        document.getElementById(
            "currentPassword"
        );

    const newPasswordInput =
        document.getElementById(
            "newPassword"
        );

    const confirmPasswordInput =
        document.getElementById(
            "confirmPassword"
        );


    const currentPassword =
        currentPasswordInput
            ? currentPasswordInput.value
            : "";


    const newPassword =
        newPasswordInput
            ? newPasswordInput.value
            : "";


    const confirmPassword =
        confirmPasswordInput
            ? confirmPasswordInput.value
            : "";


    // ======================================================
    // GET CURRENT FIREBASE USER
    // ======================================================

    const user =
        auth.currentUser || currentUser;


    console.log(
        "Firebase current user:",
        user
    );


    // ======================================================
    // CHECK LOGIN
    // ======================================================

    if (!user) {

        showPasswordMessage(
            "You are not logged in. Please log in again.",
            "error"
        );

        console.error(
            "auth.currentUser is NULL."
        );

        return;

    }


    // ======================================================
    // CHECK EMAIL
    // ======================================================

    if (!user.email) {

        showPasswordMessage(
            "Your account does not have an email address.",
            "error"
        );

        return;

    }


    // ======================================================
    // CHECK CURRENT PASSWORD
    // ======================================================

    if (!currentPassword.trim()) {

        showPasswordMessage(
            "Please enter your current password.",
            "error"
        );

        return;

    }


    // ======================================================
    // CHECK NEW PASSWORD
    // ======================================================

    if (!newPassword.trim()) {

        showPasswordMessage(
            "Please enter a new password.",
            "error"
        );

        return;

    }


    // ======================================================
    // PASSWORD LENGTH
    // ======================================================

    if (newPassword.length < 6) {

        showPasswordMessage(
            "New password must be at least 6 characters.",
            "error"
        );

        return;

    }


    // ======================================================
    // CONFIRM PASSWORD
    // ======================================================

    if (newPassword !== confirmPassword) {

        showPasswordMessage(
            "New passwords do not match.",
            "error"
        );

        return;

    }


    // ======================================================
    // SAME PASSWORD
    // ======================================================

    if (currentPassword === newPassword) {

        showPasswordMessage(
            "New password must be different from your current password.",
            "error"
        );

        return;

    }


    // ======================================================
    // SAVE BUTTON
    // ======================================================

    const saveButton =
        document.getElementById(
            "savePasswordBtn"
        );


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

    }


    try {

        // ==================================================
        // CREATE EMAIL/PASSWORD CREDENTIAL
        // ==================================================

        const credential =
            EmailAuthProvider.credential(
                user.email,
                currentPassword
            );


        console.log(
            "Re-authenticating user..."
        );


        // ==================================================
        // RE-AUTHENTICATE
        // ==================================================

        await reauthenticateWithCredential(
            user,
            credential
        );


        console.log(
            "Re-authentication successful."
        );


        // ==================================================
        // UPDATE PASSWORD
        // ==================================================

        await updatePassword(
            user,
            newPassword
        );


        console.log(
            "Password successfully changed."
        );


        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        showPasswordMessage(
            "Password successfully updated!",
            "success"
        );


        clearPasswordFields();


        // ==================================================
        // HIDE FORM
        // ==================================================

        setTimeout(
            function () {

                const form =
                    document.getElementById(
                        "passwordForm"
                    );


                if (form) {

                    form.classList.remove(
                        "show"
                    );

                }

            },
            2000
        );


    } catch (error) {

        console.error(
            "Password change error:",
            error
        );


        let errorMessage =
            "Unable to change password.";


        // ==================================================
        // WRONG CURRENT PASSWORD
        // ==================================================

        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            errorMessage =
                "Your current password is incorrect.";

        }


        else if (
            error.code ===
            "auth/wrong-password"
        ) {

            errorMessage =
                "Your current password is incorrect.";

        }


        // ==================================================
        // WEAK PASSWORD
        // ==================================================

        else if (
            error.code ===
            "auth/weak-password"
        ) {

            errorMessage =
                "The new password is too weak.";

        }


        // ==================================================
        // RECENT LOGIN
        // ==================================================

        else if (
            error.code ===
            "auth/requires-recent-login"
        ) {

            errorMessage =
                "For security, please log out and log in again, then change your password.";

        }


        // ==================================================
        // TOO MANY REQUESTS
        // ==================================================

        else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            errorMessage =
                "Too many attempts. Please try again later.";

        }


        // ==================================================
        // USER NOT FOUND
        // ==================================================

        else if (
            error.code ===
            "auth/user-not-found"
        ) {

            errorMessage =
                "User account was not found.";

        }


        // ==================================================
        // NETWORK ERROR
        // ==================================================

        else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            errorMessage =
                "Network error. Please check your internet connection.";

        }


        // ==================================================
        // OPERATION NOT ALLOWED
        // ==================================================

        else if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            errorMessage =
                "Email/password authentication is not enabled in Firebase.";

        }


        // ==================================================
        // SHOW ERROR
        // ==================================================

        showPasswordMessage(
            errorMessage,
            "error"
        );

    }


    // ======================================================
    // ENABLE BUTTON
    // ======================================================

    if (saveButton) {

        saveButton.disabled = false;

        saveButton.innerHTML =
            '<i class="fa-solid fa-check"></i> Update Password';

    }

}


// ==========================================================
// SHOW PASSWORD MESSAGE
// ==========================================================

function showPasswordMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "passwordMessage"
        );


    if (!message) return;


    message.textContent = text;

    message.className =
        "password-message " + type;

}


// ==========================================================
// CLEAR PASSWORD FIELDS
// ==========================================================

function clearPasswordFields() {

    const current =
        document.getElementById(
            "currentPassword"
        );

    const newPassword =
        document.getElementById(
            "newPassword"
        );

    const confirm =
        document.getElementById(
            "confirmPassword"
        );


    if (current) {

        current.value = "";

    }


    if (newPassword) {

        newPassword.value = "";

    }


    if (confirm) {

        confirm.value = "";

    }

}


// ==========================================================
// PROFILE DROPDOWN
// ==========================================================

function setupProfileDropdown() {

    window.toggleProfile =
        function () {

            const dropdown =
                document.getElementById(
                    "profileDropdown"
                );


            if (!dropdown) return;


            dropdown.style.display =
                dropdown.style.display === "block"
                    ? "none"
                    : "block";

        };

}


// ==========================================================
// NOTIFICATION DROPDOWN
// ==========================================================

function setupNotificationDropdown() {

    window.toggleNotif =
        function () {

            const dropdown =
                document.getElementById(
                    "notifDropdown"
                );


            if (!dropdown) return;


            dropdown.style.display =
                dropdown.style.display === "block"
                    ? "none"
                    : "block";

        };

}


// ==========================================================
// LOGOUT
// ==========================================================

window.logout = async function () {

    try {

        await signOut(auth);

        currentUser = null;

        window.location.href =
            "login.html";

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

};