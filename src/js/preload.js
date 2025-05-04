// Ce script sera exécuté avant le chargement de la page
// Accès aux API Node et Electron
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('UserAPI', {
    getAll: () => ipcRenderer.invoke('user:getAll'),
    addUser: (password, email, prenom, nom) => ipcRenderer.invoke('user:addUser', password, email, prenom, nom),
    login: (email, password) => ipcRenderer.invoke('user:login', email, password),
    verifyToken: (token) => ipcRenderer.invoke('user:verifyToken', token),
    logout: (userId) => ipcRenderer.invoke('user:logout', userId),
});

// Écouter l'événement "user:logout" envoyé par le processus principal
ipcRenderer.on('user:logout', async () => {
    try {
        const token = localStorage.getItem('authToken');
        if (token) {
            const user = await window.UserAPI.verifyToken(token);
            if (user) {
                await window.UserAPI.logout(user.id_user);
                localStorage.removeItem('authToken');
                window.location.replace("../pages/connexion.html");
            }
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
});

console.log("Preload chargé avec succès");