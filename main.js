//Processus Principal

const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron")
const path = require('path');
const mysql = require('mysql2/promise');
const { title } = require("process");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Pour générer des tokens JWT

const { log } = require("console");
require("dotenv").config()
//Fenetre  principale
let window;

let isUserLoggedIn = false; // Variable pour suivre l'état de connexion

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
            submenu: isUserLoggedIn
                ? [
                    {
                        label: 'Déconnexion',
                        click: () => {
                            const userId = localStorage.getItem('userId'); // Récupérer l'ID de l'utilisateur                
                            // Supprimer le token du localStorage
                            localStorage.removeItem('authToken');
                            // Déconnexion de l'utilisateur
                            window.webContents.send('user:logout', userId);
                            isUserLoggedIn = false; // Mettre à jour l'état de connexion
                            createMenu(); // Recréer le menu
                        }
                    }
                ]
                : [
                    {
                        label: 'Inscription',
                        click: () => window.loadFile('src/pages/inscription.html')
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Connexion',
                        click: () => window.loadFile('src/pages/connexion.html')
                    }
                ]
        }
    ];

    // Créer le menu à partir du modèle
    const menu = Menu.buildFromTemplate(template);
    // Définir le menu comme étant le menu de l'application
    Menu.setApplicationMenu(menu);
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
        console.error('erreur lors de la récupération des utilisateurs:', error)
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
        console.log(passwordHashed, email, prenom, nom);

        const [resultat] = await pool.query('INSERT INTO users (password_user, email_user, prenom_user, nom_user, date_create) VALUES (?,?,?,?, NOW())', [passwordHashed, email, prenom, nom])
        return;
    } catch (error) {
        console.error('erreur lors de la création d\'utilisateurs')
        throw error; // retourner une promesse non résolue
    }
}

ipcMain.handle('user:addUser', async (event, password, email, prenom, nom) => {
    //console.log(password, email, prenom, nom)
    try {
        await addUser(password, email, prenom, nom);
        return true
    } catch (error) {
        console.log(error);
        dialog.showErrorBox("Erreur technique", "Impossible de créer un utilisateur ")
        return []; // Retourne une promesse avec un tableau vide
    }
})

// Fonction pour vérifier les identifiants de l'utilisateur
async function login(email, password) {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email_user = ?', [email]);

        if (rows.length === 0) {
            throw new Error('Utilisateur non trouvé');
        }

        const user = rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password_user);
        if (!isPasswordValid) {
            throw new Error('Mot de passe incorrect');
        }

        // Générer un token JWT
        const token = jwt.sign({ id: user.id_user, email: user.email_user }, 'votre_secret_jwt', { expiresIn: '1h' });

        // Stocker le token dans la base de données
        await pool.query('UPDATE users SET token = ? WHERE id_user = ?', [token, user.id_user]);

        return { token, user };
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        throw error;
    }
}

// Fonction pour déconnecter l'utilisateur
async function logout(userId) {
    try {
        await pool.query('UPDATE users SET token = NULL WHERE id_user = ?', [userId]);
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
        throw error;
    }
}

// Fonction pour vérifier le token JWT
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

// Gestion de l'événement "user:login"
ipcMain.handle('user:login', async (event, email, password) => {
    try {
        const result = await login(email, password);
        if (result) {
            isUserLoggedIn = true; // Mettre à jour l'état de connexion
            createMenu(); // Recréer le menu
        }
        return result;
    } catch (error) {
        dialog.showErrorBox("Erreur de connexion", error.message);
        return null;
    }
});

ipcMain.handle('user:verifyToken', async (event, token) => {
    try {
        return await verifyToken(token);
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        return null;
    }
});

ipcMain.handle('user:logout', async (event, userId) => {
    try {
        await logout(userId); // Supprime le token de la base de données
        isUserLoggedIn = false; // Met à jour l'état de connexion
        createMenu(); // Recrée le menu
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
});