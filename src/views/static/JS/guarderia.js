// Función para mostrar/ocultar el campo de detalle de alergia
function toggleAlergiaInput() {
  const alergiaSelect = document.getElementById("alergias");
  const alergiaDetalle = document.getElementById("alergia-detalle");
  const detalleInput = document.getElementById("detalle-alergia");

  if (alergiaSelect.value === "si") {
    alergiaDetalle.style.display = "block";
    detalleInput.required = true;
  } else {
    alergiaDetalle.style.display = "none";
    detalleInput.required = false;
    detalleInput.value = "";
  }
}

// Funciones para modales (mismas que en otras páginas)
function abrirModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function cerrarModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function (event) {
  const modales = document.querySelectorAll(".modal");
  modales.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};
