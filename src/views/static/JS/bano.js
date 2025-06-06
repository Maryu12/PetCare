const precios = {
  normal: 25000,
  medicado: 40000,
  antipulgas: 30000,
  sensible: 42000,
  puntas: 8000,
  completo: 20000,
  unas: 8000,
  oidos: 5000,
};

function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const checkbox = event.target;

  if (checkbox.checked) {
    section.style.display = "block";
  } else {
    section.style.display = "none";

    const inputs = section.querySelectorAll(
      'input[type="radio"], input[type="checkbox"]'
    );
    inputs.forEach((input) => (input.checked = false));
  }
  calcularTotal();
}

function calcularTotal() {
  let total = 0;

  const banoSeleccionado = document.querySelector(
    'input[name="tipo-bano"]:checked'
  );
  if (banoSeleccionado) {
    total += precios[banoSeleccionado.value];
  }

  const cortesSeleccionados = document.querySelectorAll(
    'input[name="servicios-corte"]:checked'
  );
  cortesSeleccionados.forEach((corte) => {
    total += precios[corte.value];
  });

  document.getElementById("total-precio").textContent =
    "$" + total.toLocaleString();
}

document.addEventListener("DOMContentLoaded", function () {
  const radioButtons = document.querySelectorAll('input[name="tipo-bano"]');
  const checkboxes = document.querySelectorAll('input[name="servicios-corte"]');

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", calcularTotal);
  });

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", calcularTotal);
  });
});

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

document
  .querySelector(".formulario-spa")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Opciones seleccionadas
    let servicios = [];
    const bano = document.querySelector('input[name="tipo-bano"]:checked');
    if (bano) servicios.push("Baño: " + bano.labels[0].innerText.trim());
    document
      .querySelectorAll('input[name="servicios-corte"]:checked')
      .forEach((corte) => {
        servicios.push("Corte: " + corte.labels[0].innerText.trim());
      });

    // Mensaje de notificación
    let mensaje = `¡Cita de Spa reservada!\nMascota: ${nombreMascota}\nRaza: ${raza}\nEdad: ${edad}\nAgresivo: ${agresivo}\nAlergias: ${alergias}\nServicios: ${servicios.join(
      ", "
    )}\nFecha: ${fechaCita}\nHora: ${horaCita}\nComentarios: ${comentarios}`;

    mostrarToast(mensaje.replace(/\n/g, "<br>"));
  });

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}
