/* filepath: c:\Users\trivi\Desktop\Programacion\Code\Milenzo\Milenzo_dev\Milenzo\src\static\js\addPet.js */
function cambiarFormulario(formulario) {
    document.getElementById("formOwner").classList.remove("active");
    document.getElementById("formPatient").classList.remove("active");
    document.getElementById(formulario).classList.add("active");

    document.getElementById("btnOwner_details").classList.remove("active");
    document.getElementById("btnPatient_details").classList.remove("active");
    document.getElementById(formulario === "formOwner" ? "btnOwner_details" : "btnPatient_details").classList.add("active");
}

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