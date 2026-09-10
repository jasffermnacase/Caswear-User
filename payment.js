// ==========================================================
// CASWEAR - PAYMENT.JS
// COMPLETE PAYMENT FILE
// FIXED PAYMENT REFERENCE + ORDER LINKING
// ==========================================================


// ==========================================================
// FIREBASE IMPORTS
// ==========================================================

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
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================================
// FIREBASE CONFIG
// ==========================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAqlEDKaGECuc8ycmzZVHD7gQeZcqnm7ek",

    authDomain:
        "caswear-c21e2.firebaseapp.com",

    projectId:
        "caswear-c21e2",

    storageBucket:
        "caswear-c21e2.firebasestorage.app",

    messagingSenderId:
        "842998215942",

    appId:
        "1:842998215942:web:fcd283e0cd118451951a87",

    measurementId:
        "G-317N3TECX6"

};


// ==========================================================
// INITIALIZE FIREBASE
// ==========================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


// ==========================================================
// CURRENT USER
// ==========================================================

let currentUser = null;

let authReady = false;


// ==========================================================
// FIXED PROCESSING FEE
// ==========================================================

const PROCESSING_FEE = 10;


// ==========================================================
// CHECK FIREBASE AUTH
// ==========================================================

onAuthStateChanged(
    auth,
    function(user) {

        currentUser = user;

        authReady = true;

        if (user) {

            console.log(
                "PAYMENT - USER LOGGED IN:",
                user.uid
            );

            console.log(
                "PAYMENT - USER EMAIL:",
                user.email
            );

        } else {

            console.log(
                "PAYMENT - NO FIREBASE USER"
            );

        }

    }
);


// ==========================================================
// PAGE LOAD
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadReservationAmount();

    }
);


// ==========================================================
// LOAD RESERVATION AMOUNT
// ==========================================================

function loadReservationAmount() {

    let reservationData = null;

    try {

        reservationData =
            JSON.parse(
                localStorage.getItem(
                    "reservationData"
                )
            );

    } catch (error) {

        console.error(
            "Could not parse reservationData:",
            error
        );

    }

    console.log(
        "PAYMENT - RESERVATION DATA:",
        reservationData
    );


    // ======================================================
    // IF RESERVATION DATA DOES NOT EXIST
    // ======================================================

    if (!reservationData) {

        setPaymentAmount(
            0,
            0,
            PROCESSING_FEE,
            PROCESSING_FEE
        );

        console.log(
            "No reservationData found."
        );

        return;

    }


    // ======================================================
    // GET SUBTOTAL
    // ======================================================

    const subtotal =
        Number(
            reservationData.subtotal
        ) || 0;


    // ======================================================
    // GET TRANSFER FEE
    // ======================================================

    const transferFee =
        Number(
            reservationData.transferFee
        ) || 0;


    // ======================================================
    // PROCESSING FEE
    // ======================================================

    const processingFee =
        PROCESSING_FEE;


    // ======================================================
    // COMPUTE TOTAL
    // ======================================================

    const total =
        subtotal +
        transferFee +
        processingFee;


    // ======================================================
    // DISPLAY AMOUNTS
    // ======================================================

    setPaymentAmount(
        subtotal,
        transferFee,
        processingFee,
        total
    );


    console.log(
        "SUBTOTAL:",
        subtotal
    );

    console.log(
        "TRANSFER FEE:",
        transferFee
    );

    console.log(
        "PROCESSING FEE:",
        processingFee
    );

    console.log(
        "TOTAL:",
        total
    );

}


// ==========================================================
// DISPLAY PAYMENT AMOUNT
// ==========================================================

function setPaymentAmount(
    subtotal,
    transferFee,
    processingFee,
    total
) {

    const itemsTotalElement =
        document.getElementById(
            "itemsTotal"
        );

    const subtotalElement =
        document.getElementById(
            "subtotal"
        );

    const transferFeeElement =
        document.getElementById(
            "transferFee"
        );

    const processingFeeElement =
        document.getElementById(
            "processingFee"
        );

    const totalElement =
        document.getElementById(
            "total"
        );


    // ======================================================
    // ITEMS TOTAL
    // ======================================================

    if (itemsTotalElement) {

        itemsTotalElement.textContent =
            "₱" +
            subtotal.toFixed(2);

    }


    // ======================================================
    // SUBTOTAL
    // ======================================================

    if (subtotalElement) {

        subtotalElement.textContent =
            "₱" +
            subtotal.toFixed(2);

    }


    // ======================================================
    // TRANSFER FEE
    // ======================================================

    if (transferFeeElement) {

        transferFeeElement.textContent =
            "₱" +
            transferFee.toFixed(2);

    }


    // ======================================================
    // PROCESSING FEE
    // ======================================================

    if (processingFeeElement) {

        processingFeeElement.textContent =
            "₱" +
            processingFee.toFixed(2);

    }


    // ======================================================
    // TOTAL
    // ======================================================

    if (totalElement) {

        totalElement.textContent =
            "₱" +
            total.toFixed(2);

    }

}


// ==========================================================
// GET FIRST VALID VALUE
// ==========================================================

function getFirstValidValue(values) {

    for (const value of values) {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return String(value).trim();

        }

    }

    return "";

}


// ==========================================================
// GET RESERVATION ORDER IDENTIFIER
// ==========================================================
// IMPORTANT:
// Priority:
// 1. reservationData.orderId
// 2. reservationData.orderID
// 3. reservationData.order_id
// 4. reservationData.firestoreOrderId
// 5. pendingOrderId
// 6. other identifiers
// ==========================================================

function getReservationOrderIdentifier(
    reservationData
) {

    if (!reservationData) {

        return "";

    }


    const pendingOrderId =
        localStorage.getItem(
            "pendingOrderId"
        ) || "";


    const possibleIds = [

        reservationData.orderId,

        reservationData.orderID,

        reservationData.order_id,

        reservationData.firestoreOrderId,

        reservationData.firestoreOrderID,

        pendingOrderId,

        reservationData.transactionOrderId,

        reservationData.checkoutOrderId,

        reservationData.reservationId,

        reservationData.reservationID,

        reservationData.id,

        reservationData.orderNumber,

        reservationData.orderNo,

        reservationData.reservationNumber,

        reservationData.reservationNo

    ];


    return getFirstValidValue(
        possibleIds
    );

}


// ==========================================================
// GET ORDER NUMBER
// ==========================================================

function getOrderNumber(
    reservationData
) {

    if (!reservationData) {

        return "";

    }


    return getFirstValidValue([

        reservationData.orderNumber,

        reservationData.orderNo,

        reservationData.reservationNumber,

        reservationData.reservationNo

    ]);

}


// ==========================================================
// GET RESERVATION ID
// ==========================================================

function getReservationId(
    reservationData
) {

    if (!reservationData) {

        return "";

    }


    return getFirstValidValue([

        reservationData.reservationId,

        reservationData.reservationID,

        reservationData.reservationNumber,

        reservationData.reservationNo

    ]);

}


// ==========================================================
// GET PAYMENT METHOD
// ==========================================================

function getPaymentMethod(
    reservationData
) {

    if (!reservationData) {

        return "Online Payment (Gcash)";

    }


    const method =
        getFirstValidValue([

            reservationData.paymentMethod,

            reservationData.payment,

            reservationData.paymentMethodName,

            reservationData.method,

            reservationData.payment_type,

            reservationData.paymentType,

            reservationData.payment_method

        ]);


    if (!method) {

        return "Online Payment (Gcash)";

    }


    return method;

}


// ==========================================================
// CHECK IF CASH PAYMENT
// ==========================================================

function isCashPayment(
    paymentMethod
) {

    const method =
        String(
            paymentMethod || ""
        )
        .trim()
        .toLowerCase();


    return (
        method === "cash" ||
        method === "cash payment" ||
        method === "cashpayment" ||
        method === "cod" ||
        method === "cash on delivery" ||
        method.includes("cash")
    );

}


// ==========================================================
// CONTINUE PAYMENT
// ==========================================================

async function continuePayment() {

    console.log(
        "========================================"
    );

    console.log(
        "CONTINUE PAYMENT CLICKED"
    );

    console.log(
        "========================================"
    );


    // ======================================================
    // GET REFERENCE INPUT
    // ======================================================

    const referenceInput =
        document.getElementById(
            "referenceNumber"
        );


    // ======================================================
    // CHECK REFERENCE INPUT
    // ======================================================

    if (!referenceInput) {

        alert(
            "Reference number input was not found."
        );

        console.error(
            "Missing #referenceNumber"
        );

        return;

    }


    // ======================================================
    // GET REFERENCE NUMBER
    // ======================================================

    const referenceNumber =
        String(
            referenceInput.value || ""
        ).trim();


    // ======================================================
    // REQUIRE REFERENCE NUMBER
    // ======================================================

    if (referenceNumber === "") {

        alert(
            "Reference number is required.\n\n" +
            "Please enter your payment reference number."
        );

        referenceInput.focus();

        return;

    }


    // ======================================================
    // GET RESERVATION DATA
    // ======================================================

    let reservationData = null;

    try {

        reservationData =
            JSON.parse(
                localStorage.getItem(
                    "reservationData"
                )
            );

    } catch (error) {

        console.error(
            "Reservation data parse error:",
            error
        );

    }


    // ======================================================
    // CHECK RESERVATION DATA
    // ======================================================

    if (!reservationData) {

        alert(
            "Reservation information was not found.\n\n" +
            "Please go back and create your reservation again."
        );

        return;

    }


    console.log(
        "========================================"
    );

    console.log(
        "RESERVATION DATA FOR PAYMENT:"
    );

    console.log(
        reservationData
    );

    console.log(
        "========================================"
    );


    // ======================================================
    // GET USER ID
    // ======================================================

    let userId =
        reservationData.userId;


    // ======================================================
    // FALLBACK TO LOCAL STORAGE
    // ======================================================

    if (!userId) {

        userId =
            localStorage.getItem(
                "pendingUserId"
            );

    }


    // ======================================================
    // FALLBACK TO FIREBASE AUTH
    // ======================================================

    if (
        !userId &&
        currentUser
    ) {

        userId =
            currentUser.uid;

    }


    // ======================================================
    // CHECK USER ID
    // ======================================================

    if (!userId) {

        alert(
            "User information was not found.\n\n" +
            "Please go back to the reservation page " +
            "and create the reservation again while logged in."
        );

        console.error(
            "NO USER ID FOUND"
        );

        return;

    }


    console.log(
        "PAYMENT USER ID:",
        userId
    );


    // ======================================================
    // GET EXACT ORDER ID
    // ======================================================

    const orderIdentifier =
        getReservationOrderIdentifier(
            reservationData
        );


    // ======================================================
    // GET ORDER NUMBER
    // ======================================================

    const orderNumber =
        getOrderNumber(
            reservationData
        );


    // ======================================================
    // GET RESERVATION ID
    // ======================================================

    const reservationId =
        getReservationId(
            reservationData
        );


    console.log(
        "PAYMENT EXACT ORDER IDENTIFIER:",
        orderIdentifier
    );

    console.log(
        "PAYMENT ORDER NUMBER:",
        orderNumber
    );

    console.log(
        "PAYMENT RESERVATION ID:",
        reservationId
    );


    // ======================================================
    // GET SUBTOTAL
    // ======================================================

    const subtotal =
        Number(
            reservationData.subtotal
        ) || 0;


    // ======================================================
    // GET TRANSFER FEE
    // ======================================================

    const transferFee =
        Number(
            reservationData.transferFee
        ) || 0;


    // ======================================================
    // PROCESSING FEE
    // ======================================================

    const processingFee =
        PROCESSING_FEE;


    // ======================================================
    // COMPUTE FINAL TOTAL
    // ======================================================

    const total =
        subtotal +
        transferFee +
        processingFee;


    // ======================================================
    // PAYMENT METHOD
    // ======================================================

    const paymentMethod =
        getPaymentMethod(
            reservationData
        );


    // ======================================================
    // CASH CHECK
    // ======================================================

    if (
        isCashPayment(
            paymentMethod
        )
    ) {

        console.warn(
            "This payment page is being used for a CASH payment."
        );

    }


    // ======================================================
    // PAYMENT DATA
    // ======================================================
    // The reference number is stored in MANY fields so the
    // admin dashboard can find it regardless of which alias
    // it checks.
    // ======================================================

    const paymentData = {

        // --------------------------------------------------
        // PAYMENT DOCUMENT
        // --------------------------------------------------

        userId:
            userId,


        // --------------------------------------------------
        // EXACT FIRESTORE ORDER ID
        // --------------------------------------------------

        orderId:
            orderIdentifier,

        orderID:
            orderIdentifier,

        order_id:
            orderIdentifier,

        firestoreOrderId:
            orderIdentifier,

        transactionOrderId:
            orderIdentifier,

        checkoutOrderId:
            orderIdentifier,


        // --------------------------------------------------
        // ORDER NUMBER
        // --------------------------------------------------

        orderNumber:
            orderNumber,

        orderNo:
            orderNumber,


        // --------------------------------------------------
        // RESERVATION IDENTIFIERS
        // --------------------------------------------------

        reservationId:
            reservationId,

        reservationID:
            reservationId,

        reservationNumber:
            reservationData.reservationNumber || "",

        reservationNo:
            reservationData.reservationNo || "",


        // --------------------------------------------------
        // PAYMENT REFERENCE
        // --------------------------------------------------
        // THIS IS THE IMPORTANT PART.
        // The exact number entered by the customer is saved.
        // --------------------------------------------------

        referenceNumber:
            referenceNumber,

        referenceNo:
            referenceNumber,

        reference:
            referenceNumber,

        paymentReference:
            referenceNumber,

        paymentReferenceNumber:
            referenceNumber,

        paymentRef:
            referenceNumber,

        paymentRefNumber:
            referenceNumber,

        gcashReference:
            referenceNumber,

        gcashReferenceNumber:
            referenceNumber,

        gcashRef:
            referenceNumber,

        gcashRefNumber:
            referenceNumber,

        paymongoReference:
            referenceNumber,

        paymongoReferenceNumber:
            referenceNumber,

        paymongoRef:
            referenceNumber,

        transactionReference:
            referenceNumber,

        transactionReferenceNumber:
            referenceNumber,

        externalReference:
            referenceNumber,

        externalReferenceNumber:
            referenceNumber,


        // --------------------------------------------------
        // AMOUNTS
        // --------------------------------------------------

        subtotal:
            subtotal,

        transferFee:
            transferFee,

        processingFee:
            processingFee,

        total:
            total,

        amount:
            total,

        totalAmount:
            total,

        amountPaid:
            total,

        amountDue:
            total,


        // --------------------------------------------------
        // PAYMENT METHOD
        // --------------------------------------------------

        paymentMethod:
            paymentMethod,

        paymentMethodName:
            paymentMethod,

        method:
            paymentMethod,

        payment:
            paymentMethod,

        payment_type:
            paymentMethod,

        paymentType:
            paymentMethod,

        payment_method:
            paymentMethod,


        // --------------------------------------------------
        // STATUS
        // --------------------------------------------------

        status:
            "Pending",

        paymentStatus:
            "Pending",


        // --------------------------------------------------
        // DATE
        // --------------------------------------------------

        createdAt:
            serverTimestamp()

    };


    // ======================================================
    // DEBUG PAYMENT DATA
    // ======================================================

    console.log(
        "========================================"
    );

    console.log(
        "PAYMENT DATA TO FIRESTORE:"
    );

    console.log(
        paymentData
    );

    console.log(
        "========================================"
    );

    console.log(
        "REFERENCE NUMBER:",
        referenceNumber
    );

    console.log(
        "ORDER ID:",
        orderIdentifier
    );

    console.log(
        "ORDER NUMBER:",
        orderNumber
    );

    console.log(
        "USER ID:",
        userId
    );

    console.log(
        "PAYMENT METHOD:",
        paymentMethod
    );

    console.log(
        "TOTAL:",
        total
    );

    console.log(
        "========================================"
    );


    // ======================================================
    // DISABLE BUTTON WHILE SAVING
    // ======================================================

    const continueButton =
        document.querySelector(
            "#continuePayment"
        ) ||
        document.querySelector(
            "#continueBtn"
        ) ||
        document.querySelector(
            ".continue-payment"
        );


    if (continueButton) {

        continueButton.disabled =
            true;

        continueButton.style.opacity =
            "0.6";

    }


    // ======================================================
    // SAVE PAYMENT TO FIRESTORE
    // ======================================================

    try {

        // --------------------------------------------------
        // CREATE PAYMENT DOCUMENT
        // --------------------------------------------------

        const paymentRef =
            await addDoc(

                collection(
                    db,
                    "payments"
                ),

                paymentData

            );


        console.log(
            "========================================"
        );

        console.log(
            "PAYMENT SAVED SUCCESSFULLY"
        );

        console.log(
            "PAYMENT DOCUMENT ID:",
            paymentRef.id
        );

        console.log(
            "REFERENCE SAVED:",
            referenceNumber
        );

        console.log(
            "ORDER ID SAVED:",
            orderIdentifier
        );

        console.log(
            "========================================"
        );


        // ==================================================
        // UPDATE ORIGINAL ORDER
        // ==================================================
        // This is the major fix.
        //
        // If orderIdentifier is the actual Firestore
        // document ID, the reference is also written directly
        // to:
        //
        // orders/{orderIdentifier}
        //
        // The admin dashboard can therefore read the reference
        // directly from the order.
        // ==================================================

        if (orderIdentifier) {

            try {

                const orderDocRef =
                    doc(
                        db,
                        "orders",
                        orderIdentifier
                    );


                const orderPaymentUpdate = {

                    // --------------------------------------
                    // REFERENCE
                    // --------------------------------------

                    referenceNumber:
                        referenceNumber,

                    referenceNo:
                        referenceNumber,

                    reference:
                        referenceNumber,

                    paymentReference:
                        referenceNumber,

                    paymentReferenceNumber:
                        referenceNumber,

                    paymentRef:
                        referenceNumber,

                    paymentRefNumber:
                        referenceNumber,

                    gcashReference:
                        referenceNumber,

                    gcashReferenceNumber:
                        referenceNumber,

                    gcashRef:
                        referenceNumber,

                    gcashRefNumber:
                        referenceNumber,

                    paymongoReference:
                        referenceNumber,

                    paymongoReferenceNumber:
                        referenceNumber,

                    paymongoRef:
                        referenceNumber,

                    transactionReference:
                        referenceNumber,

                    transactionReferenceNumber:
                        referenceNumber,


                    // --------------------------------------
                    // PAYMENT INFORMATION
                    // --------------------------------------

                    paymentStatus:
                        "Pending",

                    paymentMethod:
                        paymentMethod,

                    paymentMethodName:
                        paymentMethod,

                    paymentReferenceId:
                        paymentRef.id,


                    // --------------------------------------
                    // AMOUNTS
                    // --------------------------------------

                    paymentAmount:
                        total,

                    amountPaid:
                        total,


                    // --------------------------------------
                    // UPDATED DATE
                    // --------------------------------------

                    updatedAt:
                        serverTimestamp()

                };


                await updateDoc(
                    orderDocRef,
                    orderPaymentUpdate
                );


                console.log(
                    "ORDER UPDATED WITH PAYMENT REFERENCE"
                );

                console.log(
                    "ORDER DOCUMENT ID:",
                    orderIdentifier
                );

                console.log(
                    "REFERENCE:",
                    referenceNumber
                );

            }

            catch (orderUpdateError) {

                // ------------------------------------------------
                // IMPORTANT:
                // Payment has already been successfully saved.
                //
                // If Firestore rules prevent updating the order,
                // we DO NOT delete the successful payment.
                // The admin can still find it through the payments
                // collection using orderId.
                // ------------------------------------------------

                console.warn(
                    "PAYMENT SAVED, BUT ORDER UPDATE FAILED."
                );

                console.warn(
                    "This may be caused by Firestore rules."
                );

                console.warn(
                    "ORDER ID:",
                    orderIdentifier
                );

                console.warn(
                    "ORDER UPDATE ERROR:",
                    orderUpdateError
                );

            }

        }

        else {

            console.warn(
                "NO EXACT ORDER ID WAS FOUND."
            );

            console.warn(
                "Payment was still saved."
            );

            console.warn(
                "Make sure reservation.js saves orderId."
            );

        }


        // ==================================================
        // SAVE PAYMENT LOCALLY
        // ==================================================

        const savedPaymentData = {

            paymentId:
                paymentRef.id,


            // ----------------------------------------------
            // EXACT ORDER ID
            // ----------------------------------------------

            orderId:
                orderIdentifier,

            orderID:
                orderIdentifier,

            order_id:
                orderIdentifier,

            firestoreOrderId:
                orderIdentifier,


            // ----------------------------------------------
            // ORDER NUMBER
            // ----------------------------------------------

            orderNumber:
                orderNumber,

            orderNo:
                orderNumber,


            // ----------------------------------------------
            // RESERVATION IDENTIFIERS
            // ----------------------------------------------

            reservationId:
                reservationId,

            reservationID:
                reservationId,

            reservationNumber:
                reservationData.reservationNumber || "",

            reservationNo:
                reservationData.reservationNo || "",


            // ----------------------------------------------
            // USER
            // ----------------------------------------------

            userId:
                userId,


            // ----------------------------------------------
            // REFERENCES
            // ----------------------------------------------

            referenceNumber:
                referenceNumber,

            referenceNo:
                referenceNumber,

            reference:
                referenceNumber,

            paymentReference:
                referenceNumber,

            paymentReferenceNumber:
                referenceNumber,

            paymentRef:
                referenceNumber,

            paymentRefNumber:
                referenceNumber,

            gcashReference:
                referenceNumber,

            gcashReferenceNumber:
                referenceNumber,

            paymongoReference:
                referenceNumber,


            // ----------------------------------------------
            // AMOUNTS
            // ----------------------------------------------

            subtotal:
                subtotal,

            transferFee:
                transferFee,

            processingFee:
                processingFee,

            total:
                total,

            amount:
                total,

            totalAmount:
                total,

            amountPaid:
                total,

            amountDue:
                total,


            // ----------------------------------------------
            // PAYMENT METHOD
            // ----------------------------------------------

            paymentMethod:
                paymentMethod,

            paymentMethodName:
                paymentMethod,

            method:
                paymentMethod,

            payment:
                paymentMethod,


            // ----------------------------------------------
            // STATUS
            // ----------------------------------------------

            status:
                "Pending",

            paymentStatus:
                "Pending"

        };


        localStorage.setItem(

            "paymentData",

            JSON.stringify(
                savedPaymentData
            )

        );


        // ==================================================
        // UPDATE RESERVATION DATA
        // ==================================================

        reservationData.userId =
            userId;


        reservationData.processingFee =
            processingFee;


        reservationData.total =
            total;


        reservationData.referenceNumber =
            referenceNumber;


        reservationData.referenceNo =
            referenceNumber;


        reservationData.reference =
            referenceNumber;


        reservationData.paymentReference =
            referenceNumber;


        reservationData.paymentReferenceNumber =
            referenceNumber;


        reservationData.paymentRef =
            referenceNumber;


        reservationData.paymentRefNumber =
            referenceNumber;


        // --------------------------------------------------
        // SAVE EXACT ORDER ID
        // --------------------------------------------------

        if (orderIdentifier) {

            reservationData.orderId =
                orderIdentifier;

            reservationData.orderID =
                orderIdentifier;

            reservationData.order_id =
                orderIdentifier;

            reservationData.firestoreOrderId =
                orderIdentifier;

        }


        // --------------------------------------------------
        // SAVE ORDER NUMBER
        // --------------------------------------------------

        if (orderNumber) {

            reservationData.orderNumber =
                orderNumber;

            reservationData.orderNo =
                orderNumber;

        }


        // --------------------------------------------------
        // SAVE PAYMENT METHOD
        // --------------------------------------------------

        reservationData.paymentMethod =
            paymentMethod;

        reservationData.payment =
            paymentMethod;


        // --------------------------------------------------
        // SAVE RESERVATION DATA
        // --------------------------------------------------

        localStorage.setItem(

            "reservationData",

            JSON.stringify(
                reservationData
            )

        );


        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        alert(

            "Payment submitted successfully!\n\n" +

            "Reference No.: " +
            referenceNumber +

            "\n" +

            "Subtotal: ₱" +
            subtotal.toFixed(2) +

            "\n" +

            "Transfer Fee: ₱" +
            transferFee.toFixed(2) +

            "\n" +

            "Processing Fee: ₱" +
            processingFee.toFixed(2) +

            "\n" +

            "Total: ₱" +
            total.toFixed(2)

        );


        // ==================================================
        // GO TO ORDERS
        // ==================================================

        window.location.href =
            "orders.html";

    }


    catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "PAYMENT FIRESTORE ERROR"
        );

        console.error(
            "CODE:",
            error.code
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "================================="
        );


        alert(

            "Failed to save payment.\n\n" +

            "Error Code: " +
            (error.code || "unknown") +

            "\n\n" +

            "Message: " +
            (error.message || "Unknown error")

        );


        // --------------------------------------------------
        // RE-ENABLE BUTTON
        // --------------------------------------------------

        if (continueButton) {

            continueButton.disabled =
                false;

            continueButton.style.opacity =
                "1";

        }

    }

}


// ==========================================================
// MAKE FUNCTION AVAILABLE TO HTML
// ==========================================================

window.continuePayment =
    continuePayment;


// ==========================================================
// END PAYMENT.JS
// ==========================================================