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

           const usersTableBody = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
           const searchInput = document.getElementById('searchInput');

           function fetchUsers() {
               db.collection('users').get().then((querySnapshot) => {
                   const users = [];
                   querySnapshot.forEach((doc) => {
                       users.push({
                           name: doc.data().name || 'No Name',
                           email: doc.data().email || 'No Email'
                       });
                   });
                   populateTable(users);
                   enableSearch(users);
               }).catch((error) => {
                   console.error("Error fetching users:", error);
               });
           }

           function populateTable(users) {
               usersTableBody.innerHTML = '';
               users.forEach(user => {
                   const row = usersTableBody.insertRow();
                   const nameCell = row.insertCell(0);
                   nameCell.textContent = user.name;
                   const emailCell = row.insertCell(1);
                   emailCell.textContent = user.email;
               });
           }

           function enableSearch(users) {
               searchInput.addEventListener('keyup', function() {
                   const filterValue = this.value.toLowerCase();
                   const filteredUsers = users.filter(user =>
                       user.name.toLowerCase().includes(filterValue) || user.email.toLowerCase().includes(filterValue)
                   );
                   populateTable(filteredUsers);
               });
           }

           fetchUsers();
       });