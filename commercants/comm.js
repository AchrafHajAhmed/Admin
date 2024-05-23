document.addEventListener('DOMContentLoaded', function() {
    var firebaseConfig = {
        apiKey: "AIzaSyDHVW7r7Yg0QVfzBAutfq5U_6GqPiVCjCc",
        authDomain: "hanout-a372e.firebaseapp.com",
        databaseURL: "https://hanout-a372e-default-rtdb.firebaseio.com",
        projectId: "hanout-a372e",
        storageBucket: "hanout-a372e.appspot.com",
        messagingSenderId: "933084221712",
        appId: "1:933084221712:web:af1a7f1847b022a16a5595"
    };


    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    var storage = firebase.storage();

    function fetchMerchants() {
        const merchantsTableBody = document.getElementById('merchantsTable').getElementsByTagName('tbody')[0];
        merchantsTableBody.innerHTML = '';

        db.collection('commercants').get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var row = merchantsTableBody.insertRow();
                row.insertCell(0).textContent = doc.data().name;
                row.insertCell(1).textContent = doc.data().email;
                row.insertCell(2).textContent = doc.data().phone;
                row.insertCell(3).textContent = doc.data().status ? "Actif" : "Inactif";

                var actionCell = row.insertCell(4);
                actionCell.innerHTML = `
                    <div class="dropdown">
                        <button class="dropbtn btn btn-secondary dropdown-toggle">
                            Modifier Status
                        </button>
                        <div class="dropdown-content">
                            <a href="#" onclick="toggleMerchantStatus('${doc.id}', true)">Activer</a>
                            <a href="#" onclick="toggleMerchantStatus('${doc.id}', false)">Désactiver</a>
                        </div>
                    </div>
                `;

                var imageCell = row.insertCell(5);
                var merchantId = doc.id;
                fetchImagesForMerchant(merchantId, imageCell);

                row.insertCell(6).textContent = doc.data().latitude || 'Non défini';
                row.insertCell(7).textContent = doc.data().longitude || 'Non défini';

                var editCell = row.insertCell(8);
                editCell.innerHTML = `
                    <button class="btn btn-primary" onclick="editLocation('${doc.id}', '${doc.data().latitude || ''}', '${doc.data().longitude || ''}')">Modifier</button>
                `;
            });
        }).catch((error) => {
            console.error("Erreur lors de la récupération des commerçants :", error);
        });
    }

    function fetchImagesForMerchant(merchantId, cell) {
        var idCardRef = storage.ref('id_cards/' + merchantId);
        var fiscalCardRef = storage.ref('fiscal_cards/' + merchantId);

        Promise.all([
            idCardRef.getDownloadURL(),
            fiscalCardRef.getDownloadURL()
        ]).then((urls) => {
            urls.forEach((url) => {
                var link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.textContent = 'Voir Image';
                link.style.display = 'block';
                cell.appendChild(link);
            });
        }).catch((error) => {
            console.error("Erreur lors de la récupération des images du commerçant :", error);
            var errorText = document.createElement('p');
            errorText.textContent = 'Aucune image disponible';
            cell.appendChild(errorText);
        });
    }

    function toggleMerchantStatus(merchantId, status) {
        db.collection('commercants').doc(merchantId).update({
            status: status
        }).then(() => {
            fetchMerchants();
        }).catch((error) => {
            console.error("Erreur lors de la mise à jour du statut :", error);
        });
    }

    window.editLocation = function(merchantId, currentLatitude, currentLongitude) {
        var newLatitude = prompt("Nouvelle Latitude:", currentLatitude);
        var newLongitude = prompt("Nouvelle Longitude:", currentLongitude);

        if (newLatitude !== null && newLongitude !== null) {
            db.collection('commercants').doc(merchantId).update({
                latitude: newLatitude,
                longitude: newLongitude
            }).then(() => {
                fetchMerchants();
            }).catch((error) => {
                console.error("Erreur lors de la mise à jour de la localisation :", error);
            });
        }
    }

    fetchMerchants();
});