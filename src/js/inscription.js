let formSignUp = document.getElementById("form")
formSignUp.addEventListener("submit", (e) => {
    e.preventDefault();
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let passwordConfirm = document.getElementById("passwordConfirm");
    let prenom = document.getElementById("prenom");
    let nom = document.getElementById("nom");
    try {
        if(length(password.value) == 0 || length(email.value) == 0 || length(passwordConfirm.value) == 0 || length(prenom.value) == 0 || length(nom.value) == 0){
            throw new Error('Erreur dans l\'inscription, l\'un des champs est vide')
        }
        if (password.value !== passwordConfirm.value) {
            throw new Error('Le mot de passe et la confirmation de mot de passe doivent être identiques')
        } else {
            if (length(password.value)) {
                throw new Error('Le mot de passe doit contenir au moins 8 caractères')
            }
        }
    } catch (error) {
        console.error(error);
    }

    console.log(email.value);
    console.log(password.value);
    console.log(passwordConfirm.value);
    console.log(prenom.value);
    console.log(nom.value);

})