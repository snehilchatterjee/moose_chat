BASE_URL = "http://127.0.0.1:8000/api/v1";


// POST data at /api/v1/user/create_user
function create_user() {
    login_text=document.getElementById("login-text");
    login_text.innerHTML = "Register";
    Array.from(document.getElementsByClassName("name-container")).forEach(element => {
        element.style.display = "block";
    });
    document.getElementById("create-account-button").onclick = function() {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        var name = document.getElementById("name").value;

        fetch(BASE_URL + "/user/create_user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
                name: name,
            })
        }).then(response => response.json())
          .then(data => {
              if (data.uid) {
                  alert("User created successfully!");
              } else {
                  alert("Error creating user: " + data.message);
              }
          });
    };

}