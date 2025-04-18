var canvas, ctx;
var primaCoord = null;

function afiseazaInformatii() {
    let info = document.getElementById("info");
    let url = window.location.href;
    let browser = navigator.userAgent;
    let os = navigator.platform;
    let data = new Date();

    info.innerHTML = `
        <p><b>URL:</b> ${url}</p>
        <p><b>Browser:</b> ${browser}</p>
        <p><b>Sistem:</b> ${os}</p>
        <p><b>Data și ora:</b> ${data.toLocaleString()}</p>
    `;

    setInterval(() => {
        let timpCurent = new Date();
        info.innerHTML = `
            <p><b>URL:</b> ${url}</p>
            <p><b>Browser:</b> ${browser}</p>
            <p><b>Sistem:</b> ${os}</p>
            <p><b>Data și ora:</b> ${timpCurent.toLocaleString()}</p>
        `;
    }, 1000);
}

function pregatesteCanvas() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("mousedown", selecteazaPunct);

    ctx.fillStyle = "#00ff00";
    ctx.fillRect(50, 50, 100, 80);

    ctx.strokeStyle = "#0000ff";
    ctx.strokeRect(200, 100, 120, 60);
    console.log('Canvas pregătit.');
}

function selecteazaPunct(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    if (primaCoord === null) {
        primaCoord = { x, y };
    } else {
        let culoareContur = document.getElementById("culoare-contur").value;
        let culoareUmplere = document.getElementById("culoare-umplere").value;

        ctx.fillStyle = culoareUmplere;
        ctx.strokeStyle = culoareContur;

        let latime = Math.abs(x - primaCoord.x);
        let inaltime = Math.abs(y - primaCoord.y);
        let startX = Math.min(primaCoord.x, x);
        let startY = Math.min(primaCoord.y, y);

        ctx.fillRect(startX, startY, latime, inaltime);
        ctx.strokeRect(startX, startY, latime, inaltime);

        primaCoord = null;
    }
}

function insereazaLinie() {
    let tabel = document.getElementById("tabel");
    let tbody = tabel.getElementsByTagName("tbody")[0];
    let pozitie = parseInt(document.getElementById("linie-coloana").value) - 1;
    let culoare = document.getElementById("culoare").value;

    let numarColoane = tabel.rows[0].cells.length;

    if (pozitie < 0 || pozitie > tbody.rows.length) {
        alert("Poziție invalidă pentru linie.");
        return;
    }

    let linieNoua = tbody.insertRow(pozitie);

    for (let i = 0; i < numarColoane; i++) {
        let celula = linieNoua.insertCell(i);
        celula.innerText = `Celulă ${pozitie + 1}-${i + 1}`;
        celula.style.backgroundColor = culoare;
    }
}

function insereazaColoana() {
    let tabel = document.getElementById("tabel");
    let pozitie = parseInt(document.getElementById("linie-coloana").value) - 1;
    let culoare = document.getElementById("culoare").value;

    let thead = tabel.getElementsByTagName("thead")[0];
    let tbody = tabel.getElementsByTagName("tbody")[0];

    let capRind = thead.rows[0];
    let nrColoane = capRind.cells.length;

    if (pozitie < 0 || pozitie > nrColoane) {
        alert(`Poziția coloanei trebuie să fie între 1 și ${nrColoane + 1}`);
        return;
    }

    let thNou = capRind.insertCell(pozitie);
    thNou.outerHTML = `<th>Coloană ${pozitie + 1}</th>`;

    for (let i = 0; i < tbody.rows.length; i++) {
        let rand = tbody.rows[i];
        let celulaNoua = rand.insertCell(pozitie);
        celulaNoua.innerText = `Celulă ${i + 1}-${pozitie + 1}`;
        celulaNoua.style.backgroundColor = culoare;
    }
}

function invat() {
    afiseazaInformatii();

    checkCanvas = setInterval(() => {
        if (document.getElementById("canvas")) {
            clearInterval(checkCanvas);
            pregatesteCanvas();
        }
    }, 50);
}

function verificaUtilizator() {
    const user = document.getElementById("utilizator").value;
    const pass = document.getElementById("parola").value;

    console.log("Utilizator: " + user);
    console.log("Parola: " + pass);

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        console.log("Response text: " + this.responseText);  
        
        try {
            const utilizatori = JSON.parse(this.responseText);
            console.log(utilizatori);  
            
            const ok = utilizatori.find(u => u.utilizator === user && u.parola === pass);
            document.getElementById("mesaj").textContent = ok ? "Autentificare reușită!" : "Utilizator sau parolă greșită.";
        } catch (error) {
            console.error("Eroare la parsarea JSON:", error);
            document.getElementById("mesaj").textContent = "Eroare la procesarea datelor.";
        }
    };
    xhr.open("GET", "resurse/utilizatori.json");
    xhr.send();
}

function inregistreazaUtilizator() {
    const utilizator = document.getElementById("nume_utilizator").value;
    const parola = document.getElementById("parola").value;
    const mesaj = document.getElementById("mesaj");

    if (!utilizator || !parola) {
        mesaj.textContent = "Introduceți utilizatorul și parola!";
        mesaj.style.color = "red";
        return;
    }

    fetch("/api/utilizatori", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ utilizator, parola })
    })
    .then(response => {
        if (response.status === 200) {
            mesaj.textContent = "Utilizator înregistrat cu succes!";
            mesaj.style.color = "green";
        } else if (response.status === 409) {
            mesaj.textContent = "Utilizatorul există deja!";
            mesaj.style.color = "orange";
        } else {
            mesaj.textContent = "Eroare la înregistrare.";
            mesaj.style.color = "red";
        }
    })
    .catch(error => {
        console.error("Eroare la fetch:", error);
        mesaj.textContent = "Eroare de rețea.";
        mesaj.style.color = "red";
    });
}
