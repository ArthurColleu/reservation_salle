//Processus Principal

const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron")
const path = require('path');
const mysql = require('mysql2/promise');
const { title} = require("process");
require("dotenv").config()
//Fenetre  principale
let window;

//Configuration de l'accès à la base de données
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10, //Le nombre maximale de connexion simultané
    waitForConnections: true,
    queueLimit: 0,
}

//Pool de connexion
const pool = mysql.createPool(dbConfig)

//Tester la connexion
async function testConnexion() {
    try {
        //Demander une connexion au pool
        const connexion = await pool.getConnection()
        console.log('connexion avec la base de données établie')
        connexion.release() // rend la connexion disponible

    } catch (error) {
        console.error('erreur de connexion')
    }
}
testConnexion()

//Créer la fenêtre principale
function createWindow() {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false, //Acces aux API Node depuis le processus
            contextIsolation: true,
            sandbox: true,
            preload: path.join(__dirname, 'src/js/preload.js')
        }
    })
    window.webContents.openDevTools()
    //Création du menu
    createMenu()
    window.loadFile('src/pages/index.html')

}

// Fonctions permettant decréer un menu personnalisé
function createMenu() {
    //Créer un tableau qui va représenter le menu -> modèle
    const template = [
        {
            label: "App",
            submenu: [
                {
                    label: 'Versions',
                    click: () => window.loadFile('src/pages/index.html')
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quitter',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: "Tâches",
            submenu: [
                {
                    label: "Lister",
                    click: () => window.loadFile('src/pages/list-taches.html')
                },
                {
                    type: 'separator'
                },
                {
                    label: "Ajouter",
                    click: () => window.loadFile('src/pages/ajout-taches.html')
                }
            ]
        }
    ]
    //Créer le menu à partir du modèle
    const menu = Menu.buildFromTemplate(template)
    //définir le menu comme étant le menu de mon application
    Menu.setApplicationMenu(menu)
}
//Attendre l'initialisation de l'application au démarrage

app.whenReady().then(() => {
    console.log("application initialisée")
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// Écouter sur le canal "get-versions"
ipcMain.handle('get-versions', () => {
    // renvoyer un objet contenant les versions des outils
    return {
        electron: process.versions.electron,
        node: process.versions.node,
        chrome: process.versions.chrome,
    }
})

