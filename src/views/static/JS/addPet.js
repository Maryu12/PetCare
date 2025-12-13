/* filepath: c:\Users\trivi\Desktop\Programacion\Code\Milenzo\Milenzo_dev\Milenzo\src\static\js\addPet.js */

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
