//Processus Principal

const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron")
const path = require('path');
const mysql = require('mysql2/promise');
const { title } = require("process");
const { Bycrypt } = require("bcryptjs")
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
        width: 1050,
        height: 840,
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
                    label: 'Accueil',
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
            label: "Utilisateur",
            submenu: [
                {
                    label: 'Inscription',
                    click: () => window.loadFile('src/pages/inscription.html')
                },
                {
                    type: 'separator'
                },
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

async function getAllUsers() {
    try {
        const resultat = await pool.query('SELECT * FROM users')
        return resultat[0] // Retourne une promesse avec le résultat
    } catch (error) {
        console.error('erreur lors de la récupération des tâches')
        throw error; // retourner une promesse non résolue
    }
}
// Écouter sur le canal "todos:getAll"
ipcMain.handle('user:getAll', async () => {
    //Récupérer la liste des tâches dans le base de données avec la librairie mysql
    try {
        return await getAllUsers() // Retourne une promesse avec le résultat
    } catch (error) {
        dialog.showErrorBox("Erreur technique", "Impossible de récupérer la liste des tâches.")
        return []; // Retourne une promesse avec un tableau vide
    }
})
async function addUser(password, email, prenom, nom) {
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(password, salt)
        const [resultat] = await pool.query('INSERT INTO users (password_user, email_user, prenom_user, nom_user, date_create) VALUES (?,?,?,?, NOW())', [passwordHashed, email, prenom, nom])
        return;
    } catch (error) {
        console.error('erreur lors de la création d\'utilisateurs')
        throw error; // retourner une promesse non résolue
    }
}

ipcMain.handle('user:addUser', async (event, password, email, prenom, nom) => {
    console.log(password, email, prenom, nom)
    try {
        await addUser(password, email, prenom, nom);
        return true
    } catch {
        dialog.showErrorBox("Erreur technique", "Impossible de créer un utilisateur")
        return []; // Retourne une promesse avec un tableau vide
    }
})