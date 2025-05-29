console.log("login.js chargé !");


const loginForm = (() => { 
  const loginButton = document.getElementById ("loginButton");
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  console.log(passwordInput);
  const errorMessage = document.getElementById("error-message");


  loginButton.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("🧠 Formulaire soumis");
    const email = emailInput.value;
    const password = passwordInput.value;
    console.log(email, password);
    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Identifiants incorrects");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } catch (error) {
      const errorMessage = document.getElementById("error-message");
      if (errorMessage) {
        errorMessage.textContent = "Email ou mot de passe incorrect.";
      }
      console.error("Erreur de connexion :", error);
    }
  });
  
  
});
loginForm();
