document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/getVetProfile");
    if (response.ok) {
        const profile = await response.json();
        document.getElementById("name_vet").value = profile.name_vet || "";
        document.getElementById("last_name").value = profile.last_name || "";
        document.getElementById("telefono").value = profile.telefono || "";
        document.getElementById("email").value = profile.email || "";
        document.getElementById("state").value = profile.state || "No";
        document.getElementById("description").value = profile.description || "";
    }
});

function abrirModal(id) {
    document.getElementById(id).style.display = 'block';
  }

function cerrarModal(id) {
document.getElementById(id).style.display = 'none';
}

// Cierra el modal si se hace clic fuera de él
window.onclick = function(event) {
const modales = document.getElementsByClassName('modal');
    for (let i = 0; i < modales.length; i++) {
        if (event.target === modales[i]) {
        modales[i].style.display = 'none';
        }
    }
};