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
console.log("Preload chargé avec succès");