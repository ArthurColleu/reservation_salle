document.getElementById('deconnexion').addEventListener('click', async (event) => {
    event.preventDefault();

    // Récupérer l'utilisateur du localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        try {
            // Appeler l'API de déconnexion
            await window.UserAPI.logout(user.id_user);

            // Supprimer les données de session
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');

            // Rediriger vers la page de connexion
            window.location.replace("../pages/connexion.html");
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    } else {
        console.error('Aucun utilisateur connecté.');
    }
});

document.getElementById('ResterConnecter').addEventListener('click', () => {
    // Rediriger vers la page d'accueil
    window.location.replace("../pages/index.html");
});