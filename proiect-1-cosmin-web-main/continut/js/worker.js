onmessage = function(e) {
    const produs = e.data;
    console.log(`Produsul adăugat: #${produs.id} - ${produs.nume} (${produs.cantitate})`);
    postMessage(produs);
};
