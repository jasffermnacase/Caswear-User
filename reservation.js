
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
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
// CURRENT USER
// ==========================================================

let currentUser = null;


// ==========================================================
// CHECK LOGIN
// ==========================================================

onAuthStateChanged(auth, function(user) {

    currentUser = user;

    if (user) {

        console.log(
            "RESERVATION USER LOGGED IN:",
            user.uid
        );

        console.log(
            "EMAIL:",
            user.email
        );

    } else {

        console.log(
            "NO USER LOGGED IN"
        );

    }

});


// ==========================================================
// PAYMENT BUTTONS
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const paymentButtons =
            document.querySelectorAll(
                ".payment-btn"
            );


        paymentButtons.forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        // Remove active from all buttons
                        paymentButtons.forEach(
                            function(btn) {

                                btn.classList.remove(
                                    "active"
                                );

                            }
                        );


                        // Add active to selected button
                        this.classList.add(
                            "active"
                        );


                        console.log(
                            "Payment selected:",
                            this.dataset.payment
                        );

                    }
                );

            }
        );

    }
);


// ==========================================================
// CONFIRM RESERVATION BUTTON
// ==========================================================

const confirmButton =
    document.getElementById(
        "confirmReservation"
    );


if (confirmButton) {

    confirmButton.addEventListener(
        "click",
        async function() {

            // ==================================================
            // CHECK USER
            // ==================================================

            const user =
                auth.currentUser ||
                currentUser;


            if (!user) {

                alert(
                    "Please log in before making a reservation."
                );

                return;

            }


            console.log(
                "CONFIRMED USER:",
                user.uid
            );


            // ==================================================
            // GET FORM ELEMENTS
            // ==================================================

            const fullNameElement =
                document.getElementById(
                    "fullName"
                );

            const emailElement =
                document.getElementById(
                    "email"
                );

            const contactElement =
                document.getElementById(
                    "contact"
                );

            const programElement =
                document.getElementById(
                    "program"
                );

            const yearLevelElement =
                document.getElementById(
                    "yearLevel"
                );

            const sectionElement =
                document.getElementById(
                    "section"
                );

            const idNumberElement =
                document.getElementById(
                    "idNumber"
                );

            const claimingLocationElement =
                document.getElementById(
                    "claimingLocation"
                );

            const notesElement =
                document.getElementById(
                    "reservationNotes"
                );


            // ==================================================
            // CHECK REQUIRED ELEMENTS
            // ==================================================

            if (
                !fullNameElement ||
                !emailElement ||
                !contactElement ||
                !programElement ||
                !yearLevelElement ||
                !sectionElement ||
                !idNumberElement ||
                !claimingLocationElement
            ) {

                alert(
                    "Some reservation form fields are missing."
                );

                return;

            }


            // ==================================================
            // GET VALUES
            // ==================================================

            const fullName =
                fullNameElement.value.trim();

            const email =
                emailElement.value.trim();

            const contact =
                contactElement.value.trim();

            const program =
                programElement.value;

            const yearLevel =
                yearLevelElement.value;

            const section =
                sectionElement.value.trim();

            const idNumber =
                idNumberElement.value.trim();

            const claimingLocation =
                claimingLocationElement.value;

            const notes =
                notesElement
                    ? notesElement.value.trim()
                    : "";


            // ==================================================
            // GET CART SUBTOTAL
            // ==================================================

            const subtotal =
                Number(
                    localStorage.getItem(
                        "cartSubtotal"
                    )
                ) || 0;


            // ==================================================
            // CHECK CART
            // ==================================================

            if (subtotal <= 0) {

                alert(
                    "Your cart is empty or the subtotal was not found."
                );

                return;

            }


            // ==================================================
            // GET SELECTED PAYMENT
            // ==================================================

            const selectedPayment =
                document.querySelector(
                    ".payment-btn.active"
                );


            // ==================================================
            // VALIDATE FORM
            // ==================================================

            if (
                fullName === "" ||
                email === "" ||
                contact === "" ||
                program === "" ||
                yearLevel === "" ||
                section === "" ||
                idNumber === "" ||
                claimingLocation === ""
            ) {

                alert(
                    "Please fill in all required fields."
                );

                return;

            }


            // ==================================================
            // VALIDATE PAYMENT
            // ==================================================

            if (!selectedPayment) {

                alert(
                    "Please select a mode of payment."
                );

                return;

            }


            const payment =
                selectedPayment.dataset.payment;


            // ==================================================
            // NORMALIZE PAYMENT METHOD
            // ==================================================

            const normalizedPayment =
                String(payment)
                    .trim()
                    .toLowerCase();


            const isOnlinePayment =
                normalizedPayment.includes("online") ||
                normalizedPayment.includes("gcash") ||
                normalizedPayment.includes("paymongo");


            const isCashPayment =
                normalizedPayment === "cash" ||
                normalizedPayment.includes("cash");


            // ==================================================
            // CREATE ORDER NUMBER
            // ==================================================

            const orderNumber =
                "CASW-" +
                new Date().getFullYear() +
                "-" +
                Math.floor(
                    1000 +
                    Math.random() * 9000
                );


            // ==================================================
            // TRANSFER FEE
            // ==================================================

            let transferFee = 0;


            // ==================================================
            // ONLINE PAYMENT TRANSFER FEE
            // ==================================================

            if (isOnlinePayment) {

                transferFee = 0;

            }


            // ==================================================
            // COMPUTE TOTAL
            // ==================================================

            const total =
                subtotal +
                transferFee;


            console.log(
                "SUBTOTAL:",
                subtotal
            );

            console.log(
                "TRANSFER FEE:",
                transferFee
            );

            console.log(
                "TOTAL:",
                total
            );

            console.log(
                "PAYMENT METHOD:",
                payment
            );


            // ==================================================
            // CREATE INITIAL ORDER DATA
            // ==================================================
            //
            // IMPORTANT:
            // The actual Firestore document ID is generated
            // AFTER addDoc().
            //
            // We first create the order, then use orderRef.id
            // to update localStorage with the exact same ID.
            //
            // ==================================================

            const reservationData = {

                userId:
                    user.uid,

                orderNumber:
                    orderNumber,

                fullName:
                    fullName,

                email:
                    email,

                contact:
                    contact,

                program:
                    program,

                yearLevel:
                    yearLevel,

                section:
                    section,

                idNumber:
                    idNumber,

                claimingLocation:
                    claimingLocation,

                // Keep original payment field
                payment:
                    payment,

                // Also save payment method aliases
                paymentMethod:
                    payment,

                paymentMethodName:
                    payment,

                method:
                    payment,

                payment_type:
                    payment,

                paymentType:
                    payment,

                payment_method:
                    payment,

                subtotal:
                    subtotal,

                transferFee:
                    transferFee,

                total:
                    total,

                notes:
                    notes,

                status:
                    "Pending",

                // CASH SHOULD NEVER HAVE A REFERENCE NUMBER
                referenceNumber:
                    isCashPayment
                        ? ""
                        : "",

                paymentReference:
                    isCashPayment
                        ? ""
                        : "",

                createdAt:
                    serverTimestamp()

            };


            // ==================================================
            // DISABLE BUTTON WHILE SAVING
            // ==================================================

            confirmButton.disabled = true;

            const originalButtonText =
                confirmButton.innerText;

            confirmButton.innerText =
                "Saving Reservation...";


            // ==================================================
            // SAVE RESERVATION
            // ==================================================

            try {

                const orderRef =
                    await addDoc(
                        collection(
                            db,
                            "orders"
                        ),
                        reservationData
                    );


                // ==================================================
                // ACTUAL FIRESTORE ORDER ID
                // ==================================================

                const firestoreOrderId =
                    orderRef.id;


                console.log(
                    "=================================================="
                );

                console.log(
                    "RESERVATION SAVED"
                );

                console.log(
                    "FIRESTORE ORDER ID:",
                    firestoreOrderId
                );

                console.log(
                    "ORDER NUMBER:",
                    orderNumber
                );

                console.log(
                    "PAYMENT METHOD:",
                    payment
                );

                console.log(
                    "=================================================="
                );


                // ==================================================
                // CREATE LOCAL RESERVATION DATA
                // ==================================================
                //
                // IMPORTANT:
                // orderId = EXACT FIRESTORE orders DOCUMENT ID
                //
                // This is what payment.js will use.
                //
                // ==================================================

                const localReservationData = {

                    // ==============================================
                    // SAME FIRESTORE DOCUMENT ID
                    // ==============================================

                    orderId:
                        firestoreOrderId,

                    orderID:
                        firestoreOrderId,

                    order_id:
                        firestoreOrderId,

                    reservationId:
                        firestoreOrderId,

                    reservationID:
                        firestoreOrderId,

                    reservationNumber:
                        orderNumber,

                    reservationNo:
                        orderNumber,


                    // ==============================================
                    // USER
                    // ==============================================

                    userId:
                        user.uid,


                    // ==============================================
                    // ORDER NUMBER
                    // ==============================================

                    orderNumber:
                        orderNumber,

                    orderNo:
                        orderNumber,


                    // ==============================================
                    // CUSTOMER INFORMATION
                    // ==============================================

                    fullName:
                        fullName,

                    email:
                        email,

                    contact:
                        contact,

                    program:
                        program,

                    yearLevel:
                        yearLevel,

                    section:
                        section,

                    idNumber:
                        idNumber,

                    claimingLocation:
                        claimingLocation,


                    // ==============================================
                    // PAYMENT METHOD
                    // ==============================================

                    payment:
                        payment,

                    paymentMethod:
                        payment,

                    paymentMethodName:
                        payment,

                    method:
                        payment,

                    payment_type:
                        payment,

                    paymentType:
                        payment,

                    payment_method:
                        payment,


                    // ==============================================
                    // AMOUNTS
                    // ==============================================

                    subtotal:
                        subtotal,

                    transferFee:
                        transferFee,

                    total:
                        total,


                    // ==============================================
                    // OTHER
                    // ==============================================

                    notes:
                        notes,

                    status:
                        "Pending",


                    // ==============================================
                    // REFERENCE NUMBER
                    // ==============================================
                    //
                    // Online payment reference will be added by
                    // payment.js after the user pays.
                    //
                    // Cash remains empty.
                    //
                    // ==============================================

                    referenceNumber:
                        "",

                    paymentReference:
                        "",

                    paymentReferenceNumber:
                        ""

                };


                // ==================================================
                // SAVE COMPLETE RESERVATION DATA
                // ==================================================

                localStorage.setItem(
                    "reservationData",
                    JSON.stringify(
                        localReservationData
                    )
                );


                // ==================================================
                // SAVE USER ID
                // ==================================================

                localStorage.setItem(
                    "pendingUserId",
                    user.uid
                );


                // ==================================================
                // SAVE EXACT FIRESTORE ORDER ID
                // ==================================================

                localStorage.setItem(
                    "pendingOrderId",
                    firestoreOrderId
                );


                // ==================================================
                // SAVE ORDER NUMBER
                // ==================================================

                localStorage.setItem(
                    "pendingOrderNumber",
                    orderNumber
                );


                // ==================================================
                // SAVE PAYMENT METHOD
                // ==================================================

                localStorage.setItem(
                    "pendingPayment",
                    payment
                );


                // ==================================================
                // EXTRA DEBUG INFORMATION
                // ==================================================

                console.log(
                    "LOCAL reservationData:",
                    localReservationData
                );

                console.log(
                    "LOCAL orderId:",
                    localReservationData.orderId
                );

                console.log(
                    "LOCAL reservationId:",
                    localReservationData.reservationId
                );

                console.log(
                    "LOCAL orderNumber:",
                    localReservationData.orderNumber
                );


                // ==================================================
                // ONLINE PAYMENT
                // ==================================================

                if (isOnlinePayment) {

                    alert(
                        "Reservation saved!\n\n" +
                        "Proceeding to online payment."
                    );


                    window.location.href =
                        "payment.html";

                    return;

                }


                // ==================================================
                // CASH PAYMENT
                // ==================================================

                if (isCashPayment) {

                    alert(
                        "Reservation confirmed successfully!"
                    );


                    window.location.href =
                        "orders.html";

                    return;

                }


                // ==================================================
                // FALLBACK
                // ==================================================

                alert(
                    "Reservation confirmed successfully!"
                );


                window.location.href =
                    "orders.html";


            } catch (error) {

                console.error(
                    "Firebase Error:",
                    error
                );


                alert(
                    "Failed to save reservation.\n\n" +
                    (error.code || "Unknown error") +
                    "\n\n" +
                    error.message
                );


                // Re-enable button
                confirmButton.disabled = false;

                confirmButton.innerText =
                    originalButtonText;

            }

        }
    );

}