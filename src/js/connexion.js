document.getElementById('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const result = await window.UserAPI.login(email, password);
        if (result) {
            const { token, user } = result;
            //console.log('Connexion réussie !', user);

            // Stocker le token dans le localStorage
            localStorage.setItem('authToken', token);

            // Rediriger vers une autre page ou afficher un message de succès
            //window.location.replace("../pages/index.html")

            alert('Connexion réussie !');
        } else {
            document.getElementById('error-form').innerText = 'Échec de la connexion. Vérifiez vos identifiants.';
        }
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        document.getElementById('error-form').innerText = 'Une erreur est survenue.';
    }
});