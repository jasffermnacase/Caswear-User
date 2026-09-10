import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot
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


console.log("=================================");
console.log("CASWEAR HOME.JS LOADED");
console.log("Firebase initialized successfully");
console.log("=================================");


// ==========================================================
// LANDING PAGE
// ==========================================================

const startBtn =
    document.getElementById("start-btn");

if (startBtn) {

    startBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "login.html";

        }
    );

}


// ==========================================================
// SIGN UP
// ==========================================================

const signupBtn =
    document.getElementById("signup-btn");

if (signupBtn) {

    signupBtn.addEventListener(
        "click",
        async function () {

            try {

                const fullname =
                    document
                        .getElementById("fullname")
                        .value
                        .trim();

                const email =
                    document
                        .getElementById("email")
                        .value
                        .trim();

                const contact =
                    document
                        .getElementById("contact")
                        .value
                        .trim();

                const address =
                    document
                        .getElementById("address")
                        .value
                        .trim();

                const password =
                    document
                        .getElementById("password")
                        .value;


                // ==================================================
                // VALIDATION
                // ==================================================

                if (
                    fullname === "" ||
                    email === "" ||
                    contact === "" ||
                    address === "" ||
                    password === ""
                ) {

                    alert(
                        "Please fill in all fields."
                
                    );

                    return;

                }


                if (password.length < 6) {

                    alert(
                        "Password must be at least 6 characters."
                    );

                    return;

                }


                // ==================================================
                // CREATE FIREBASE ACCOUNT
                // ==================================================

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user =
                    userCredential.user;


                console.log(
                    "New account UID:",
                    user.uid
                );


                // ==================================================
                // SAVE USER INFORMATION
                // ==================================================

                await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {

                        fullname:
                            fullname,

                        email:
                            email,

                        contact:
                            contact,

                        address:
                            address,

                        program:
                            "",
                        role: 
                        "customer"

                    }
                );


                // ==================================================
                // SAVE NAME
                // ==================================================

                localStorage.setItem(
                    "fullname",
                    fullname
                );


                alert(
                    "Account created successfully!"
                );


                // ==================================================
                // SIGN OUT NEW ACCOUNT
                // ==================================================

                await signOut(auth);


                window.location.replace(
                    "login.html"
                );


            } catch (error) {

                console.error(
                    "SIGNUP ERROR:",
                    error
                );

                alert(
                    "Error: " +
                    error.message
                );

            }

        }
    );

}


// ==========================================================
// LOGIN
// ==========================================================

const loginBtn =
    document.getElementById("login-btn");

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        async function () {

            try {

                const email =
                    document
                        .getElementById("login-email")
                        .value
                        .trim();

                const password =
                    document
                        .getElementById("login-password")
                        .value;


                if (!email || !password) {

                    alert(
                        "Please enter your email and password."
                    );

                    return;

                }


                // ==================================================
                // LOGIN
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
                    "Login successful:",
                    user.uid
                );


                // ==================================================
                // GET CURRENT USER DATA
                // ==================================================

                const userDoc =
                    await getDoc(
                        doc(
                            db,
                            "users",
                            user.uid
                        )
                    );


                if (userDoc.exists()) {

                    const userData =
                        userDoc.data();


                    // Save ONLY the current user's name
                    localStorage.setItem(
                        "fullname",
                        userData.fullname || ""
                    );

                } else {

                    localStorage.removeItem(
                        "fullname"
                    );

                }


                alert(
                    "Login successful!"
                );


                window.location.replace(
                    "home.html"
                );


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );

                alert(
                    "Login failed: " +
                    error.message
                );

            }

        }
    );

}


// ==========================================================
// PROFILE DROPDOWN
// ==========================================================

function toggleProfile() {

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );

    const notifDropdown =
        document.getElementById(
            "notifDropdown"
        );


    if (!profileDropdown) {

        return;

    }


    if (
        profileDropdown.style.display ===
        "block"
    ) {

        profileDropdown.style.display =
            "none";

    } else {

        profileDropdown.style.display =
            "block";


        if (notifDropdown) {

            notifDropdown.style.display =
                "none";

        }

    }

}


// ==========================================================
// NOTIFICATION DROPDOWN
// ==========================================================

function toggleNotif() {

    const notifDropdown =
        document.getElementById(
            "notifDropdown"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    if (!notifDropdown) {

        return;

    }


    if (
        notifDropdown.style.display ===
        "block"
    ) {

        notifDropdown.style.display =
            "none";

    } else {

        notifDropdown.style.display =
            "block";


        if (profileDropdown) {

            profileDropdown.style.display =
                "none";

        }

    }

}


// ==========================================================
// CLOSE DROPDOWNS
// ==========================================================

window.addEventListener(
    "click",
    function (event) {

        const profileDropdown =
            document.getElementById(
                "profileDropdown"
            );

        const notifDropdown =
            document.getElementById(
                "notifDropdown"
            );


        if (
            !event.target.closest(".profile") &&
            !event.target.closest(".notification")
        ) {

            if (profileDropdown) {

                profileDropdown.style.display =
                    "none";

            }

            if (notifDropdown) {

                notifDropdown.style.display =
                    "none";

            }

        }

    }
);


// ==========================================================
// DISPLAY USER NAME
// ==========================================================
// This now gets the current Firebase user's data.
// ==========================================================

async function displayUserName() {

    const userName =
        document.getElementById(
            "userName"
        );


    if (!userName) {

        return;

    }


    const user =
        auth.currentUser;


    if (!user) {

        userName.textContent =
            "Hi, CASmate!";

        return;

    }


    try {

        const userDoc =
            await getDoc(
                doc(
                    db,
                    "users",
                    user.uid
                )
            );


        if (userDoc.exists()) {

            const userData =
                userDoc.data();

            const fullname =
                userData.fullname || "";


            if (fullname) {

                userName.textContent =
                    "Hi, " +
                    fullname.toUpperCase() +
                    "!";


                // Update localStorage with CURRENT account
                localStorage.setItem(
                    "fullname",
                    fullname
                );

            } else {

                userName.textContent =
                    "Hi, CASmate!";

            }

        } else {

            userName.textContent =
                "Hi, CASmate!";

        }

    } catch (error) {

        console.error(
            "DISPLAY NAME ERROR:",
            error
        );

        userName.textContent =
            "Hi, CASmate!";

    }

}


// ==========================================================
// LOAD PROFILE INFORMATION
// ==========================================================

async function loadProfileInformation(user) {

    if (!user) {

        console.log(
            "No logged-in user."
        );

        return;

    }


    try {

        console.log(
            "Loading profile information for UID:",
            user.uid
        );


        // ==================================================
        // GET CURRENT USER DOCUMENT
        // ==================================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userDoc =
            await getDoc(
                userRef
            );


        if (!userDoc.exists()) {

            console.log(
                "User profile does not exist."
            );

            return;

        }


        const userData =
            userDoc.data();


        console.log(
            "CURRENT USER PROFILE:",
            userData
        );


        // ==================================================
        // GET HTML ELEMENTS
        // ==================================================

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );

        const profilePhone =
            document.getElementById(
                "profilePhone"
            );

        const profileAddress =
            document.getElementById(
                "profileAddress"
            );

        const profileProgram =
            document.getElementById(
                "profileProgram"
            );

        const profileUid =
            document.getElementById(
                "profileUid"
            );


        // ==================================================
        // FULL NAME
        // ==================================================

        if (profileName) {

            profileName.textContent =
                (
                    userData.fullname ||
                    "No name available"
                ).toUpperCase();

        }


        // ==================================================
        // EMAIL
        // ==================================================

        if (profileEmail) {

            profileEmail.textContent =
                userData.email ||
                user.email ||
                "No email available";

        }


        // ==================================================
        // CONTACT
        // ==================================================

        if (profilePhone) {

            profilePhone.textContent =
                userData.contact ||
                "No contact number";

        }


        // ==================================================
        // ADDRESS
        // ==================================================

        if (profileAddress) {

            profileAddress.value =
                userData.address ||
                "";

        }


        // ==================================================
        // PROGRAM
        // ==================================================

        if (profileProgram) {

            profileProgram.value =
                userData.program ||
                "";

        }


        // ==================================================
        // ACCOUNT UID
        // ==================================================

        if (profileUid) {

            profileUid.value =
                user.uid;

        }


        // ==================================================
        // SAVE CURRENT USER NAME
        // ==================================================

        localStorage.setItem(
            "fullname",
            userData.fullname || ""
        );


    } catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );

    }

}


// ==========================================================
// PROFILE PICTURE
// ==========================================================
// IMPORTANT:
// Picture is now saved using the Firebase UID.
// Account A and Account B have separate pictures.
// ==========================================================

function loadProfilePicture(user) {

    if (!user) {

        return;

    }


    const profilePicture =
        document.getElementById(
            "profilePicture"
        );

    const navProfilePicture =
        document.getElementById(
            "navProfilePicture"
        );


    // Account-specific storage key
    const pictureKey =
        "profilePicture_" +
        user.uid;


    const savedPicture =
        localStorage.getItem(
            pictureKey
        );


    if (savedPicture) {

        if (profilePicture) {

            profilePicture.src =
                savedPicture;

        }


        if (navProfilePicture) {

            navProfilePicture.src =
                savedPicture;

        }

    }

}


// ==========================================================
// PROFILE PICTURE UPLOAD
// ==========================================================

function setupProfilePicture() {

    const editUpload =
        document.getElementById(
            "editUpload"
        );

    const profileUpload =
        document.getElementById(
            "profileUpload"
        );

    const profilePicture =
        document.getElementById(
            "profilePicture"
        );

    const navProfilePicture =
        document.getElementById(
            "navProfilePicture"
        );


    if (
        !editUpload ||
        !profileUpload
    ) {

        return;

    }


    editUpload.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            profileUpload.click();

        }
    );


    profileUpload.addEventListener(
        "change",
        function () {

            const file =
                profileUpload.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );

                return;

            }


            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "Please log in first."
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const imageData =
                        event.target.result;


                    if (profilePicture) {

                        profilePicture.src =
                            imageData;

                    }


                    if (navProfilePicture) {

                        navProfilePicture.src =
                            imageData;

                    }


                    // IMPORTANT:
                    // Save picture using current UID
                    const pictureKey =
                        "profilePicture_" +
                        user.uid;


                    localStorage.setItem(
                        pictureKey,
                        imageData
                    );


                    alert(
                        "Profile picture updated!"
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ==========================================================
// EDIT PROFILE
// ==========================================================

function setupEditProfile() {

    const editButton =
        document.getElementById(
            "editProfileBtn"
        );

    const saveButton =
        document.getElementById(
            "saveProfileBtn"
        );

    const cancelButton =
        document.getElementById(
            "cancelProfileBtn"
        );

    const addressInput =
        document.getElementById(
            "profileAddress"
        );

    const programInput =
        document.getElementById(
            "profileProgram"
        );


    if (
        !editButton ||
        !saveButton
    ) {

        return;

    }


    // ==================================================
    // EDIT
    // ==================================================

    editButton.addEventListener(
        "click",
        function () {

            if (addressInput) {

                addressInput.readOnly =
                    false;

            }


            if (programInput) {

                programInput.readOnly =
                    false;

            }


            editButton.style.display =
                "none";


            saveButton.style.display =
                "inline-block";


            if (cancelButton) {

                cancelButton.style.display =
                    "inline-block";

            }

        }
    );


    // ==================================================
    // CANCEL
    // ==================================================

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            async function () {

                const user =
                    auth.currentUser;


                if (user) {

                    await loadProfileInformation(
                        user
                    );

                }


                if (addressInput) {

                    addressInput.readOnly =
                        true;

                }


                if (programInput) {

                    programInput.readOnly =
                        true;

                }


                editButton.style.display =
                    "inline-block";


                saveButton.style.display =
                    "none";


                cancelButton.style.display =
                    "none";

            }
        );

    }


    // ==================================================
    // SAVE
    // ==================================================

    saveButton.addEventListener(
        "click",
        async function () {

            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "Please log in first."
                );

                return;

            }


            try {

                const newAddress =
                    addressInput
                        ? addressInput.value.trim()
                        : "";


                const newProgram =
                    programInput
                        ? programInput.value.trim()
                        : "";


                await updateDoc(

                    doc(
                        db,
                        "users",
                        user.uid
                    ),

                    {

                        address:
                            newAddress,

                        program:
                            newProgram

                    }

                );


                alert(
                    "Profile updated successfully!"
                );


                if (addressInput) {

                    addressInput.readOnly =
                        true;

                }


                if (programInput) {

                    programInput.readOnly =
                        true;

                }


                editButton.style.display =
                    "inline-block";


                saveButton.style.display =
                    "none";


                if (cancelButton) {

                    cancelButton.style.display =
                        "none";

                }


                await loadProfileInformation(
                    user
                );


            } catch (error) {

                console.error(
                    "UPDATE PROFILE ERROR:",
                    error
                );


                alert(
                    "Unable to update profile.\n\n" +
                    error.message
                );

            }

        }
    );

}


// ==========================================================
// LOAD NOTIFICATIONS
// ==========================================================

function loadNotifications(user) {

    const notifList =
        document.getElementById(
            "notifList"
        );

    const notifCount =
        document.getElementById(
            "notifCount"
        );


    if (
        !notifList ||
        !notifCount
    ) {

        return;

    }


    const notificationsQuery =
        query(

            collection(
                db,
                "notifications"
            ),

            where(
                "userId",
                "==",
                user.uid
            )

        );


    onSnapshot(

        notificationsQuery,

        function (snapshot) {

            let notifications = [];


            snapshot.forEach(
                function (notificationDoc) {

                    notifications.push({

                        id:
                            notificationDoc.id,

                        ...notificationDoc.data()

                    });

                }
            );


            // ==================================================
            // SORT NEWEST FIRST
            // ==================================================

            notifications.sort(
                function (a, b) {

                    let timeA = 0;
                    let timeB = 0;


                    try {

                        if (a.createdAt) {

                            timeA =
                                a.createdAt.toMillis();

                        }

                    } catch (error) {

                        timeA = 0;

                    }


                    try {

                        if (b.createdAt) {

                            timeB =
                                b.createdAt.toMillis();

                        }

                    } catch (error) {

                        timeB = 0;

                    }


                    return timeB - timeA;

                }
            );


            // ==================================================
            // UNREAD COUNT
            // ==================================================

            let unreadCount = 0;


            notifications.forEach(
                function (notification) {

                    if (
                        notification.read === false
                    ) {

                        unreadCount++;

                    }

                }
            );


            notifCount.textContent =
                unreadCount;


            // ==================================================
            // NO NOTIFICATIONS
            // ==================================================

            if (
                notifications.length === 0
            ) {

                notifList.innerHTML = `

                    <div class="no-notif">

                        <i class="fa-regular fa-bell-slash"></i>

                        <p>
                            No notifications.
                        </p>

                    </div>

                `;

                return;

            }


            // ==================================================
            // CLEAR
            // ==================================================

            notifList.innerHTML =
                "";


            // ==================================================
            // DELETE ALL HEADER
            // ==================================================

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "notif-header";


            header.innerHTML = `

                <button
                    type="button"
                    id="deleteAllNotifBtn"
                    class="delete-all-notif-btn">

                    <i class="fa-solid fa-trash"></i>

                    Delete All

                </button>

            `;


            notifList.appendChild(
                header
            );


            // ==================================================
            // DISPLAY NOTIFICATIONS
            // ==================================================

            notifications.forEach(
                function (notification) {

                    const notifItem =
                        document.createElement(
                            "div"
                        );


                    notifItem.className =
                        "notif-item";


                    if (
                        notification.read === false
                    ) {

                        notifItem.classList.add(
                            "unread"
                        );

                    }


                    let notificationDate =
                        "Just now";


                    if (
                        notification.createdAt
                    ) {

                        try {

                            notificationDate =
                                notification.createdAt
                                    .toDate()
                                    .toLocaleString(
                                        "en-US",
                                        {

                                            month:
                                                "short",

                                            day:
                                                "numeric",

                                            year:
                                                "numeric",

                                            hour:
                                                "numeric",

                                            minute:
                                                "2-digit"

                                        }
                                    );

                        } catch (error) {

                            console.error(
                                "Date error:",
                                error
                            );

                        }

                    }


                    notifItem.innerHTML = `

                        <div class="notif-content">

                            <div class="notif-message">

                                ${
                                    notification.message ||
                                    "New notification"
                                }

                            </div>

                            <small class="notif-date">

                                ${notificationDate}

                            </small>

                        </div>


                        <button
                            type="button"
                            class="delete-notif-btn"
                            data-id="${notification.id}"
                            title="Delete notification">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    `;


                    notifList.appendChild(
                        notifItem
                    );

                }
            );

        },

        function (error) {

            console.error(
                "NOTIFICATION ERROR:",
                error
            );

        }

    );

}


// ==========================================================
// DELETE ONE NOTIFICATION
// ==========================================================

async function deleteNotification(
    notificationId
) {

    if (!notificationId) {

        return;

    }


    const confirmation =
        confirm(
            "Are you sure you want to delete this notification?"
        );


    if (!confirmation) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "notifications",
                notificationId
            )
        );


    } catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        alert(
            "Unable to delete notification.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// DELETE ALL NOTIFICATIONS
// ==========================================================

async function deleteAllNotifications() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Please log in first."
        );

        return;

    }


    const confirmation =
        confirm(
            "Are you sure you want to delete ALL notifications?"
        );


    if (!confirmation) {

        return;

    }


    try {

        const notificationsQuery =
            query(

                collection(
                    db,
                    "notifications"
                ),

                where(
                    "userId",
                    "==",
                    user.uid
                )

            );


        const snapshot =
            await getDocs(
                notificationsQuery
            );


        const deletePromises = [];


        snapshot.forEach(
            function (notificationDoc) {

                deletePromises.push(

                    deleteDoc(
                        doc(
                            db,
                            "notifications",
                            notificationDoc.id
                        )
                    )

                );

            }
        );


        await Promise.all(
            deletePromises
        );


        alert(
            "All notifications have been deleted."
        );


    } catch (error) {

        console.error(
            "DELETE ALL ERROR:",
            error
        );


        alert(
            "Unable to delete all notifications.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// NOTIFICATION EVENTS
// ==========================================================

function setupNotificationEvents() {

    const notifList =
        document.getElementById(
            "notifList"
        );


    if (!notifList) {

        return;

    }


    notifList.addEventListener(
        "click",
        function (event) {


            // DELETE ONE

            const deleteButton =
                event.target.closest(
                    ".delete-notif-btn"
                );


            if (deleteButton) {

                deleteNotification(
                    deleteButton.dataset.id
                );

                return;

            }


            // DELETE ALL

            const deleteAllButton =
                event.target.closest(
                    "#deleteAllNotifBtn"
                );


            if (deleteAllButton) {

                deleteAllNotifications();

                return;

            }

        }
    );

}


// ==========================================================
// MARK NOTIFICATION AS READ
// ==========================================================

async function markNotificationAsRead(
    notificationId
) {

    if (!notificationId) {

        return;

    }


    try {

        await updateDoc(

            doc(
                db,
                "notifications",
                notificationId
            ),

            {
                read: true
            }

        );

    } catch (error) {

        console.error(
            "MARK READ ERROR:",
            error
        );

    }

}


// ==========================================================
// ORDER SUCCESS
// ==========================================================

function orderSuccess() {

    console.log(
        "Order success."
    );

}


// ==========================================================
// LOGOUT
// ==========================================================

async function logout() {

    try {

        await signOut(
            auth
        );


        // Remove current user's temporary name
        localStorage.removeItem(
            "fullname"
        );


        // DO NOT DELETE CART HERE.
        // Your current cart system uses "cart".
        // This keeps your existing cart working.


        window.location.replace(
            "login.html"
        );


    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );


        alert(
            "Unable to log out.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// AUTH STATE
// ==========================================================

onAuthStateChanged(

    auth,

    async function (user) {

        console.log(
            "AUTH STATE CHANGED"
        );


        if (user) {

            console.log(
                "Logged-in user:",
                user.email
            );

            console.log(
                "CURRENT UID:",
                user.uid
            );


            // ==================================================
            // LOAD CURRENT USER PROFILE
            // ==================================================

            await loadProfileInformation(
                user
            );


            // ==================================================
            // DISPLAY CURRENT USER NAME
            // ==================================================

            await displayUserName();


            // ==================================================
            // LOAD CURRENT USER PROFILE PICTURE
            // ==================================================

            loadProfilePicture(
                user
            );


            // ==================================================
            // LOAD CURRENT USER NOTIFICATIONS
            // ==================================================

            loadNotifications(
                user
            );


        } else {

            console.log(
                "No user logged in."
            );


            // Clear old name immediately
            localStorage.removeItem(
                "fullname"
            );


            const currentPage =
                window.location.pathname
                    .split("/")
                    .pop();


            if (
                currentPage === "home.html" ||
                currentPage === "profile.html" ||
                currentPage === ""
            ) {

                window.location.replace(
                    "login.html"
                );

            }

        }

    }

);


// ==========================================================
// ADD TO CART
// ==========================================================
// KEEPING "cart" SO YOUR EXISTING cart.html WORKS
// ==========================================================

function addToCart(event) {

    if (!event) {

        console.error(
            "addToCart requires an event."
        );

        return;

    }


    const button =
        event.currentTarget;


    if (!button) {

        console.error(
            "Could not find clicked cart button."
        );

        return;

    }


    const productId =
        button.dataset.id;


    const productName =
        button.dataset.name;


    const productPrice =
        Number(
            button.dataset.price
        );


    const productImage =
        button.dataset.image;


    console.log(
        "ADD TO CART:",
        {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage
        }
    );


    // ==================================================
    // CHECK LOGIN
    // ==================================================

    if (!auth.currentUser) {

        alert(
            "Please log in first."
        );

        return;

    }


    // ==================================================
    // SIZE
    // ==================================================

    const sizeElement =
        document.getElementById(
            "size"
        );


    let size = "";


    if (sizeElement) {

        size =
            sizeElement.value;


        if (size === "") {

            alert(
                "Please select a size."
            );

            return;

        }

    }


    // ==================================================
    // QUANTITY
    // ==================================================

    const quantityElement =
        document.getElementById(
            "quantity"
        );


    let quantity = 1;


    if (quantityElement) {

        quantity =
            Number(
                quantityElement.value
            );

    }


    if (
        isNaN(quantity) ||
        quantity <= 0
    ) {

        alert(
            "Please enter a valid quantity."
        );

        return;

    }


    // ==================================================
    // GET EXISTING CART
    // ==================================================

    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "cart"
                )
            ) || [];

    } catch (error) {

        console.error(
            "CART READ ERROR:",
            error
        );

        cart = [];

    }


    // ==================================================
    // CREATE PRODUCT
    // ==================================================

    const product = {

        id:
            productId,

        name:
            productName,

        price:
            productPrice,

        size:
            size,

        quantity:
            quantity,

        image:
            productImage

    };


    // ==================================================
    // CHECK EXISTING PRODUCT
    // ==================================================

    const existingProduct =
        cart.find(
            function (item) {

                return (
                    String(item.id) ===
                        String(productId) &&
                    String(item.size || "") ===
                        String(size || "")
                );

            }
        );


    if (existingProduct) {

        existingProduct.quantity =
            Number(existingProduct.quantity || 0) +
            quantity;


    } else {

        cart.push(
            product
        );

    }


    // ==================================================
    // SAVE CART
    // ==================================================

    try {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "CART SAVE ERROR:",
            error
        );

        alert(
            "Unable to save item to cart."
        );

        return;

    }


    console.log(
        "CART SAVED:",
        cart
    );


    alert(
        productName +
        " added to cart!"
    );


    // ==================================================
    // GO TO CART
    // ==================================================

    window.location.href =
        "cart.html";

}


// ==========================================================
// PREVENT CACHED HOME PAGE
// ==========================================================

window.addEventListener(
    "pageshow",
    function (event) {

        if (event.persisted) {

            if (!auth.currentUser) {

                window.location.replace(
                    "login.html"
                );

            }

        }

    }
);


// ==========================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ==========================================================

window.toggleProfile =
    toggleProfile;

window.toggleNotif =
    toggleNotif;

window.orderSuccess =
    orderSuccess;

window.addToCart =
    addToCart;

window.deleteNotification =
    deleteNotification;

window.deleteAllNotifications =
    deleteAllNotifications;

window.markNotificationAsRead =
    markNotificationAsRead;

window.logout =
    logout;


// ==========================================================
// PROFILE EVENT SETUP
// ==========================================================

setupProfilePicture();

setupEditProfile();


// ==========================================================
// NOTIFICATION EVENT SETUP
// ==========================================================

setupNotificationEvents();


// ==========================================================
// END
// ==========================================================

console.log(
    "CASWear home.js finished loading."
);