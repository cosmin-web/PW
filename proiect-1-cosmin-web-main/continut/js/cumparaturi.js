class Produs {
    constructor(id, nume, cantitate) {
        this.id = id;
        this.nume = nume;
        this.cantitate = cantitate;
    }
}

class StorageBase {
    constructor() {
        if (this.constructor === StorageBase) {
            throw new Error("Nu se poate instanția o clasă abstractă");
        }
    }

    addProduct(produs) {
        throw new Error("Metoda 'addProduct()' trebuie implementată.");
    }

    getProducts() {
        throw new Error("Metoda 'getProducts()' trebuie implementată.");
    }

    clearProducts() {
        throw new Error("Metoda 'clearProducts()' trebuie implementată.");
    }
}

class LocalStorageManager extends StorageBase {
    constructor() {
        super();
        this.key = "cumparaturi";
    }

    addProduct(produs) {
        return new Promise((resolve, reject) => {
            let produse = JSON.parse(localStorage.getItem(this.key)) || [];
            produse.push(produs);
            localStorage.setItem(this.key, JSON.stringify(produse));
            resolve();
        });
    }

    getProducts() {
        return new Promise((resolve, reject) => {
            const produse = JSON.parse(localStorage.getItem(this.key)) || [];
            resolve(produse);
        });
    }

    clearProducts() {
        return new Promise((resolve, reject) => {
            localStorage.removeItem(this.key);
            resolve();
        });
    }
}

class IndexedDBManager extends StorageBase {
    constructor() {
        super();
        this.dbName = "cumparaturiDB";
        this.storeName = "produse";
    }

    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Nu s-a reușit deschiderea IndexedDB");
        });
    }

    addProduct(produs) {
        return new Promise((resolve, reject) => {
            this.openDB().then(db => {
                const transaction = db.transaction([this.storeName], "readwrite");
                const store = transaction.objectStore(this.storeName);
                store.add(produs);
                resolve();
            }).catch(error => reject(error));
        });
    }

    getProducts() {
        return new Promise((resolve, reject) => {
            this.openDB().then(db => {
                const transaction = db.transaction([this.storeName], "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject("Nu s-au putut obține produsele");
            }).catch(error => reject(error));
        });
    }

    clearProducts() {
        return new Promise((resolve, reject) => {
            this.openDB().then(db => {
                const transaction = db.transaction([this.storeName], "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject("Nu s-au putut șterge produsele");
            }).catch(error => reject(error));
        });
    }
}

const adaugaProdus = () => {
    const nume = document.getElementById("nume").value;
    const cantitate = document.getElementById("cantitate").value;

    const produs = new Produs(Date.now(), nume, cantitate);  

    const storageMethod = document.getElementById("storage").value;
    let storage;

    if (storageMethod === "localStorage") {
        storage = new LocalStorageManager();
    } else if (storageMethod === "indexedDB") {
        storage = new IndexedDBManager();
    }

    if (storage) {
        storage.addProduct(produs).then(() => {
            afiseazaLista(storage);
        }).catch(error => {
            console.error("Eroare la adăugarea produsului:", error);
        });
    }
};

const afiseazaLista = (storage) => {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    storage.getProducts().then(produse => {
        produse.forEach((p, index) => {
            const item = document.createElement("li");
            item.textContent = `${index + 1}. ${p.nume} (${p.cantitate})`;
            lista.appendChild(item);
        });
    }).catch(error => {
        console.error("Eroare la obținerea produselor:", error);
    });
};

const golesteLista = () => {
    const storageMethod = document.getElementById("storage").value;
    let storage;

    if (storageMethod === "localStorage") {
        storage = new LocalStorageManager();
    } else if (storageMethod === "indexedDB") {
        storage = new IndexedDBManager();
    }

    if (storage) {
        storage.clearProducts().then(() => {
            afiseazaLista(storage);
        }).catch(error => {
            console.error("Eroare la golirea listei:", error);
        });
    }
};

const actualizeazaLista = () => {
    const storageMethod = document.getElementById("storage").value;
    let storage;

    if (storageMethod === "localStorage") {
        storage = new LocalStorageManager();
    } else if (storageMethod === "indexedDB") {
        storage = new IndexedDBManager();
    }

    if (storage) {
        afiseazaLista(storage);
    }
};

window.onload = () => {
    actualizeazaLista();  
};
