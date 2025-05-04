window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Rediriger vers la page de connexion si aucun token n'est présent
        window.location.replace("../pages/connexion.html");
        return;
    }

    try {
        // Vérifier si le token est valide
        const user = await window.UserAPI.verifyToken(token);
        if (!user) {
            // Si le token est invalide ou expiré, rediriger vers la page de connexion
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.replace("../pages/connexion.html");
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        // En cas d'erreur, rediriger vers la page de connexion
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.replace("../pages/connexion.html");
    }
});