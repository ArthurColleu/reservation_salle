let formSignUp = document.getElementById("form")
formSignUp.addEventListener("submit", async (e) => {
    e.preventDefault();
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let passwordConfirm = document.getElementById("passwordConfirm");
    let prenom = document.getElementById("prenom");
    let nom = document.getElementById("nom");
    let list_user = await UserAPI.getAll()

    try {
        if (password.value.length == 0 || email.value.length == 0 || passwordConfirm.value.length == 0 || prenom.value.length == 0 || nom.value.length == 0) {
            throw new Error('Erreur dans l\'inscription, l\'un des champs est vide')
        }
        list_user.forEach(element => {
            console.log(element["email_user"]);
            if (element["email_user"] == email.value) {
                throw new Error('L\'email est déjà utilisé')
            }
        });
        if (password.value !== passwordConfirm.value) {
            throw new Error('Le mot de passe et la confirmation de mot de passe doivent être identiques')
        } else {
            if (password.value.length < 8) {
                throw new Error('Le mot de passe doit contenir au moins 8 caractères')
            }
        }
        await UserAPI.addUser(password.value, email.value, prenom.value, nom.value)
    } catch (error) {
        console.error(error);
    }
})