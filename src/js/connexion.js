document.getElementById('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const result = await window.UserAPI.login(email, password);

        if (result) {
            const { token, user } = result;

            // Stocker le token dans le localStorage
            localStorage.setItem('authToken', token);
            // Stocker l'utilisateur dans le localStorage
            localStorage.setItem('user', JSON.stringify(user));

            // Rediriger vers la page d'accueil
            window.location.replace("../pages/index.html");
        } else {
            document.getElementById('error-form').innerText = 'Échec de la connexion. Vérifiez vos identifiants.';
        }
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        document.getElementById('error-form').innerText = 'Une erreur est survenue.';
    }
});

async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, 'votre_secret_jwt');
        const [rows] = await pool.query('SELECT * FROM users WHERE id_user = ? AND token = ?', [decoded.id, token]);

        if (rows.length === 0) {
            throw new Error('Token invalide ou expiré');
        }

        return rows[0]; // Retourne l'utilisateur si le token est valide
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        throw error;
    }
}

async function logoutUser(userId) {
    try {
        await pool.query('UPDATE users SET token = NULL WHERE id = ?', [userId]);
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
        throw error;
    }
}