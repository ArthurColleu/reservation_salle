// Ce script sera exécuté avant le chargement de la page
// Accès aux API Node et Electron
const {contextBridge,ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('versions', {
    // fonction qui récupére les versions via IPC
    getVersions:()=> ipcRenderer.invoke('get-versions')
})

contextBridge.exposeInMainWorld('todosAPI', {
    // fonction qui récupére la liste des tâches via IPC
    getAll:()=> ipcRenderer.invoke('todos:getAll'),
    addOne : (titre)=> ipcRenderer.invoke('todos:add',titre),
    deleteOne : (id) => ipcRenderer.invoke('todos:del',id)
})

console.log("Preload chargé avec succès")