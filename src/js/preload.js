// Ce script sera exécuté avant le chargement de la page
// Accès aux API Node et Electron
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    // fonction qui récupére les versions via IPC
    getVersions: () => ipcRenderer.invoke('get-versions')
})

contextBridge.exposeInMainWorld('UserAPI', {
    // fonction qui récupére la liste des tâches via IPC
    getAll: () => ipcRenderer.invoke('user:getAll'),
    addUser: (password, email, prenom, nom) => ipcRenderer.invoke('user:addUser', password, email, prenom, nom),
    //deleteOne : (id) => ipcRenderer.invoke('todos:del',id)
})

console.log("Preload chargé avec succès")