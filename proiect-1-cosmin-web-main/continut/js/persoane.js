function incarcaPersoane() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/resurse/persoane.xml");
    xhr.onload = function () {
        if (this.status === 200) {
            let xmlDoc = this.responseXML;
            let persoane = xmlDoc.getElementsByTagName("persoana");

            let tabel = `<table border="1" class="tabel-persoane">
                            <tr>
                                <th>ID</th><th>Nume</th><th>Prenume</th><th>Vârstă</th><th>Adresa</th>
                                <th>Telefon</th><th>Email</th><th>Ocupatie</th><th>Studii</th><th>Limbi</th>
                            </tr>`;

            for (let i = 0; i < persoane.length; i++) {
                let p = persoane[i];

                let id = p.getAttribute("id");
                let nume = p.getElementsByTagName("nume")[0].textContent;
                let prenume = p.getElementsByTagName("prenume")[0].textContent;
                let varsta = p.getElementsByTagName("varsta")[0].textContent;
                
                let strada = p.getElementsByTagName("strada")[0].textContent;
                let numar = p.getElementsByTagName("numar")[0].textContent;
                let localitate = p.getElementsByTagName("localitate")[0].textContent;
                let judet = p.getElementsByTagName("judet")[0].textContent;
                let tara = p.getElementsByTagName("tara")[0].textContent;
                let adresa = `${strada} ${numar}, ${localitate}, ${judet}, ${tara}`;
                
                let telefon = p.getElementsByTagName("telefon")[0].textContent;
                let email = p.getElementsByTagName("email")[0].textContent;
                let ocupatie = p.getElementsByTagName("ocupatie")[0].textContent;

                let nivel = p.getElementsByTagName("nivel")[0].textContent;
                let universitate = p.getElementsByTagName("universitate")[0].textContent;
                let specializare = p.getElementsByTagName("specializare")[0].textContent;
                let studii = `${nivel} la ${universitate}, Specializarea: ${specializare}`;

                let limbi = "";
                let limbiArray = p.getElementsByTagName("limb");
                for (let j = 0; j < limbiArray.length; j++) {
                    limbi += limbiArray[j].textContent + (j < limbiArray.length - 1 ? ", " : "");
                }

                tabel += `<tr>
                            <td>${id}</td>
                            <td>${nume}</td>
                            <td>${prenume}</td>
                            <td>${varsta}</td>
                            <td>${adresa}</td>
                            <td>${telefon}</td>
                            <td>${email}</td>
                            <td>${ocupatie}</td>
                            <td>${studii}</td>
                            <td>${limbi}</td>
                          </tr>`;
            }

            tabel += `</table>`;

            document.getElementById("continut").innerHTML = tabel;
        } else {
            document.getElementById("continut").innerHTML = "Eroare la încărcarea fișierului XML.";
        }
    };
    xhr.send();
}
