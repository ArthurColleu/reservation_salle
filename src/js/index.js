//Processus de rendu

const electronVersion = document.querySelector("#electron-version")
const nodeVersion = document.querySelector("#node-version")
const chromiumVersion = document.querySelector("#chromium-version")

async function lesVersions(){
    const test = await  versions.getVersions();
    electronVersion.textContent = test.electron
    nodeVersion.textContent = test.node
    chromiumVersion.textContent = test.chrome
}
lesVersions();