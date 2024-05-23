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

    function updateCardCount(cardId, count) {
        var cardElement = document.getElementById(cardId);
        if (cardElement) {
            cardElement.textContent = count;
        } else {
            console.error("Element with ID", cardId, "not found.");
        }
    }

    function fetchCounts() {
        db.collection('users').onSnapshot(snapshot => {
            updateCardCount('usersCount', snapshot.size);
        });

        db.collection('commercants').onSnapshot(snapshot => {
            updateCardCount('commercantsCount', snapshot.size);
        });

        db.collection('produit').onSnapshot(snapshot => {
            updateCardCount('produitCount', snapshot.size);
        });

        db.collection('orders').onSnapshot(snapshot => {
            updateCardCount('ordersCount', snapshot.size);
        });
    }

    fetchCounts();

    function generateMockTrafficData() {
        var trafficData = [];
        var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (var i = 0; i < days.length; i++) {
            trafficData.push({
                date: days[i],
                value: Math.floor(Math.random() * 100)
            });
        }
        return trafficData;
    }

    function fetchTrafficData() {
        var trafficData = generateMockTrafficData();
        updateTrafficChart(trafficData);
    }

    function updateTrafficChart(trafficData) {
        var ctx = document.getElementById('trafficChart');
        if (ctx) {
            var trafficChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: trafficData.map(data => data.date),
                    datasets: [{
                        label: 'Traffic',
                        data: trafficData.map(data => data.value),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                fontColor: 'rgba(0, 0, 0, 0.5)'
                            },
                            gridLines: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                fontColor: 'rgba(0, 0, 0, 0.5)'
                            },
                            gridLines: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }]
                    },
                    legend: {
                        labels: {
                            fontColor: 'rgba(0, 0, 0, 0.8)'
                        }
                    }
                }
            });
        } else {
            console.error("Element with ID 'trafficChart' not found.");
        }
    }

    fetchTrafficData();

    var logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            logout();
        });
    } else {
        console.error("Element with ID 'logoutButton' not found.");
    }

    function logout() {
        firebase.auth().signOut().then(function() {
            console.log("User logged out successfully.");
        }).catch(function(error) {
            console.error("Error logging out:", error);
        });
    }

    const loadMainCategories = () => {
        const categoriesRef = db.collection('categories');
        const categoriesDropdown = document.getElementById('category');

        categoriesRef.get().then((snapshot) => {
            snapshot.forEach((doc) => {
                const option = document.createElement('option');
                option.value = doc.id;
                option.innerText = doc.data().name;
                categoriesDropdown.appendChild(option);
            });
            if (categoriesDropdown.options.length > 0) {
                loadSubCategories(categoriesDropdown.options[0].value);
            }
        }).catch((error) => {
            console.error("Erreur lors de la récupération des catégories :", error);
        });
    };

    const loadSubCategories = (categoryId) => {
        const sousCategoriesDropdown = document.getElementById('sous-category');
        sousCategoriesDropdown.innerHTML = '';

        const sousCategoriesRef = db.collection('sous-categories').where('id', '==', categoryId);

        sousCategoriesRef.get().then((snapshot) => {
            if (snapshot.empty) {
                console.log('Aucune sous-catégorie trouvée pour la catégorie ID:', categoryId);
            } else {
                snapshot.forEach((doc) => {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.innerText = doc.data().name;
                    sousCategoriesDropdown.appendChild(option);
                });
            }
        }).catch((error) => {
            console.error("Erreur lors de la récupération des sous-catégories :", error);
        });
    };

    document.getElementById('category').addEventListener('change', (event) => {
        loadSubCategories(event.target.value);
    });

    window.addEventListener('load', loadMainCategories);

    const productForm = document.getElementById('product-form');
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = productForm['name'].value;
        const description = productForm['description'].value;
        const price = parseFloat(productForm['price'].value).toFixed(3);
        const category = productForm['category'].value;
        const sousCategory = productForm['sous-category'].value;
        const image = productForm['image'].files[0];

        const storageRef = firebase.storage().ref('product_images/' + image.name);
        const uploadTask = storageRef.put(image);

        uploadTask.on('state_changed',
            (snapshot) => {
            },
            (error) => {
                console.error('Erreur lors du téléchargement de l\'image:', error);
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    db.collection('produit').add({
                        name: name,
                        description: description,
                        price: price,
                        category: category,
                        sous_category: sousCategory,
                        imageUrl: downloadURL
                    }).then((docRef) => {
                        console.log('Produit ajouté avec succès avec l\'ID:', docRef.id);
                        productForm.reset();
                        document.getElementById('success-message').innerHTML = '<div class="alert alert-success" role="alert">Produit ajouté avec succès!</div>';
                    }).catch((error) => {
                        console.error('Erreur lors de l\'ajout du produit:', error);
                    });
                });
            }
        );
    });

});

