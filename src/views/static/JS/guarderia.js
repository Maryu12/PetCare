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

//Funcion para llenar el select de "seleccionar mascota"
document.addEventListener("DOMContentLoaded", async () => {
  // Mascotas
  try {
    const response = await fetch("/getMyPets");
    if (response.ok) {
      const pets = await response.json();
      const petSelect = document.getElementById("petSelect");
      petSelect.innerHTML = '<option value="">Elegir una mascota</option>';
      pets.forEach((pet) => {
        const option = document.createElement("option");
        option.value = pet.id_pet;
        option.textContent = `${pet.pet_name} - ${pet.species}`;
        petSelect.appendChild(option);
      });
    } else {
      console.warn("No se pudo obtener la lista de mascotas.");
    }
  } catch (error) {
    console.error("Error al cargar la lista de mascotas:", error);
  }
});

// Funciones para modales (mismas que en otras páginas)
function abrirModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function cerrarModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

window.onclick = function (event) {
  const modales = document.querySelectorAll(".modal");
  modales.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};
