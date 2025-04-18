import socket
import os
import gzip
import threading
import json

serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
serversocket.bind(('', 5678))
serversocket.listen(5)

def proceseaza_cerere(clientsocket):
    try:
        cerere = b''
        linieDeStart = ''
        headers = {}

        while True:
            data = clientsocket.recv(1024)
            cerere += data
            if b'\r\n\r\n' in cerere:
                break

        cerere_text = cerere.decode('utf-8', errors='ignore')
        linii = cerere_text.split('\r\n')
        linieDeStart = linii[0]
        metoda, resursa, protocol = linieDeStart.split()

        for linie in linii[1:]:
            if linie == '':
                break
            if ': ' in linie:
                cheie, valoare = linie.split(': ', 1)
                headers[cheie.lower()] = valoare

        if metoda == 'POST' and resursa == '/api/utilizatori':
            lungime = int(headers.get('content-length', 0))
            continut = cerere.split(b'\r\n\r\n', 1)[1]

            while len(continut) < lungime:
                continut += clientsocket.recv(1024)

            try:
                utilizator_nou = json.loads(continut.decode('utf-8'))
                utilizator_nou_nume = utilizator_nou.get("utilizator", "")

                json_path = '../continut/resurse/utilizatori.json'
                if os.path.exists(json_path):
                    with open(json_path, 'r', encoding='utf-8') as f:
                        utilizatori = json.load(f)
                else:
                    utilizatori = []

                exista = any(u.get("utilizator") == utilizator_nou_nume for u in utilizatori)

                if exista:
                    raspuns = "HTTP/1.1 409 Conflict\r\nContent-Type: text/plain\r\n\r\nUtilizatorul deja există."
                    clientsocket.sendall(raspuns.encode('utf-8'))
                else:
                    utilizatori.append(utilizator_nou)
                    with open(json_path, 'w', encoding='utf-8') as f:
                        json.dump(utilizatori, f, indent=2)
                    raspuns = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nUtilizator adăugat cu succes."
                    clientsocket.sendall(raspuns.encode('utf-8'))

            except Exception as e:
                print(f"Eroare la procesare POST: {e}")
                raspuns = "HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nDate invalide."
                clientsocket.sendall(raspuns.encode('utf-8'))

        else:
            file_path = f"../continut{resursa}"
            if resursa == '/':
                file_path = "../continut/index.html"

            if os.path.exists(file_path):
                ext = os.path.splitext(file_path)[1].lower()
                content_type = {
                    '.html': 'text/html',
                    '.css': 'text/css',
                    '.js': 'application/javascript',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif',
                    '.ico': 'image/x-icon',
                    '.json': 'application/json',
                    '.xml': 'application/xml'
                }.get(ext, 'application/octet-stream')

                with open(file_path, 'rb') as file:
                    file_data = file.read()

                file_data_compressed = gzip.compress(file_data)

                header = "HTTP/1.1 200 OK\r\n"
                header += f"Content-Type: {content_type}\r\n"
                header += "Content-Encoding: gzip\r\n"
                header += f"Content-Length: {len(file_data_compressed)}\r\n"
                header += "\r\n"

                clientsocket.sendall(header.encode('utf-8') + file_data_compressed)
            else:
                header = "HTTP/1.1 404 Not Found\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n"
                raspuns = header + "<html><body><h1>404 - Resource not found</h1></body></html>"
                clientsocket.sendall(raspuns.encode('utf-8'))

    finally:
        clientsocket.close()
        print('S-a terminat comunicarea cu clientul.')

while True:
    print('#########################################################################')
    print('Serverul ascultă potențiali clienți.')
    (clientsocket, address) = serversocket.accept()
    print(f'S-a conectat un client de la {address}')
    thread = threading.Thread(target=proceseaza_cerere, args=(clientsocket,))
    thread.start()
    