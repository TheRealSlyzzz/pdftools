export async function insert(name,value) {
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

export async function select(key) {
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

export async function clear() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open("pdfStorage", 2);
        req.onsuccess = ({ target }) => {
            const db = target.result;
            if (!db.objectStoreNames.contains("pdfs")) return reject(`Object store '${"pdfs"}' not found.`);
            
            const transaction = db.transaction("pdfs", "readwrite");
            const store = transaction.objectStore("pdfs");
            const clearReq = store.clear();
            
            clearReq.onsuccess = () => resolve(`✅ Cleared all data from '${"pdfs"}'.`);
            clearReq.onerror = () => reject(`Failed to clear '${"pdfs"}'.`);
        };
        req.onerror = () => reject("IndexedDB failed to open.");
    });
}