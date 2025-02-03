async function sendToDownloadPage(blob, filename, message = null) {
    try {
        CLEAR();
        await INSERT("blob",blob);
        await INSERT("filename",filename);
        if(message) await INSERT("message",message);
        window.location.href = "download.html";
    } catch (error) {
        console.error("Error storing PDF data:", error);
        alert("Fehler beim Speichern der Datei! Bitte erneut versuchen.");
    }
}

function createChild(parent,type,html,classes,onclick){
    var e = document.createElement(type);
    console.log(onclick);
    e.className = classes;
    e.innerHTML = html;
    if(onclick) e.onclick = onclick;
    console.log(e);
    parent.appendChild(e);
    return e;
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0)
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

document.addEventListener("DOMContentLoaded", function () {
    const iframe = document.createElement("iframe");
    iframe.src = "topnav.html";
    iframe.frameBorder = "0";
    iframe.style.width = "100%";
    iframe.style.height = "48px";
    document.body.prepend(iframe);
    document.documentElement.style.userSelect = 'none'; // Standard
    document.documentElement.style.MozUserSelect = 'none'; // Firefox
    document.documentElement.style.KhtmlUserSelect = 'none'; // Konqueror (older browsers)
    document.documentElement.style.WebkitUserSelect = 'none'; // Safari/Chrome
    document.documentElement.style.OUserSelect = 'none'; // Opera
});

async function INSERT(name,value) {
    try {
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open("pdfStorage", 2);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("pdfs")) {
                    db.createObjectStore("pdfs");
                    console.log("✅ Created 'pdfs' store in IndexedDB");
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("IndexedDB failed to open.");
        });

        if(!db.objectStoreNames.contains("pdfs")) {
            throw "Object store 'pdfs' does not exist after upgrade.";
        }

        // Store PDF Blob in IndexedDB
        const transaction = db.transaction("pdfs", "readwrite");
        transaction.objectStore("pdfs").put(value,name);
    } catch (error) {
        console.error("IndexedDB error.", error);
    }
}

async function SELECT(key) {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open("pdfStorage", 2);
        req.onsuccess = ({ target }) => {
            const db = target.result;
            if (!db.objectStoreNames.contains("pdfs")) return reject(`Object store '${"pdfs"}' not found.`);
            const getReq = db.transaction("pdfs", "readonly").objectStore("pdfs").get(key);
            getReq.onsuccess = () => getReq.result ? resolve(getReq.result) : reject(`Key '${key}' not found in 'pdfs'.`);
            getReq.onerror = () => reject(`Error retrieving '${key}' from 'pdfs'.`);
        };
        req.onerror = () => reject("IndexedDB failed to open.");
    });
}

async function CLEAR() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open("pdfStorage", 2);
        req.onsuccess = ({ target }) => {
            const db = target.result;
            if (!db.objectStoreNames.contains("pdfs")) return reject(`Object store '${"pdfs"}' not found.`);
            
            const transaction = db.transaction("pdfs", "readwrite");
            const store = transaction.objectStore("pdfs");
            const IndexedDBReq = store.clear();
            
            IndexedDBReq.onsuccess = () => resolve(`✅ Cleared all data from '${"pdfs"}'.`);
            IndexedDBReq.onerror = () => reject(`Failed to IndexedDB '${"pdfs"}'.`);
        };
        req.onerror = () => reject("IndexedDB failed to open.");
    });
}