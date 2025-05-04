window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.replace("../pages/connexion.html");
        return;
    }

    try {
        const user = await window.UserAPI.verifyToken(token);
        if (!user) {
            localStorage.removeItem('authToken');
            window.location.replace("../pages/connexion.html");
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        localStorage.removeItem('authToken');
        window.location.replace("../pages/connexion.html");
    }
});