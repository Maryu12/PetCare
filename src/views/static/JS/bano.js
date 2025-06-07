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

// Funcion para agendar la cita de spa
document.addEventListener("DOMContentLoaded", () => {
  cargarMascotas();
  
  document.getElementById("btn-reservar").addEventListener("click", () => {
    agendarSpa();
  });  
});

// Cargar mascotas en el selector
async function cargarMascotas() {
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
}

// Agendar cita de spa
async function agendarSpa() {
  const id_pet = document.getElementById("petSelect").value;
  const temperamento = document.getElementById("temperamento").value;
  const alergias = document.getElementById("alergias").value;
  const fecha_cita = document.getElementById("fecha-cita").value;
  const hora_cita = document.getElementById("hora-cita").value;
  const comentarios = document.getElementById("comentarios").value;

  // Determinar tipo de baño y servicios de corte seleccionados
  const tipo_bano = document.querySelector('input[name="tipo-bano"]:checked');
  const servicios_corte = Array.from(document.querySelectorAll('input[name="servicios-corte"]:checked')).map(
    (el) => el.value
  );

  // Validación básica
  if (!id_pet || (!tipo_bano && servicios_corte.length === 0) || !fecha_cita || !hora_cita) {
    mostrarToast("Por favor completa todos los campos obligatorios.");
    return;
  }

  // Obtener nombre de la mascota para el mensaje
  const petSelect = document.getElementById("petSelect");
  const nombreMascota = petSelect.options[petSelect.selectedIndex]?.text || "";

  // Enviar cada servicio seleccionado como cita independiente
  let solicitudes = [];

  if (tipo_bano) {
    solicitudes.push({
      id_pet,
      "tipo-bano": "bano-" + tipo_bano.value,
      fecha_cita: fecha_cita,
      hora_cita: hora_cita,
      comentarios,
      temperamento,
      alergias
    });
  }

  servicios_corte.forEach((corte) => {
    solicitudes.push({
      id_pet,
      "servicios-corte": "corte-" + corte,
      fecha_cita: fecha_cita,
      hora_cita: hora_cita,
      comentarios,
      temperamento,
      alergias
    });
  });

  let exito = true;
  for (const data of solicitudes) {
    try {
      const response = await fetch("/api/banoCorte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        alert(`¡Cita de Spa agendada exitosamente para ${data["tipo-bano"] || data["servicios-corte"]}!`);
      } else {  
        mostrarToast(result.detail || "Error al agendar el servicio.");
      }
    } catch (error) {
      exito = false;
      console.error("Error de conexión al agendar el servicio.", error);
    }
  }

  if (exito) {
    mostrarToast(
      `¡Cita de Spa reservada exitosamente!<br>Mascota: ${nombreMascota}<br>Fecha: ${fecha_cita}<br>Hora: ${hora_cita}`
    );
    document.querySelector(".formulario-spa").reset();
    document.getElementById("total-precio").textContent = "$0";
  }
}

/*document
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
    let mensaje = `¡Cita de Spa reservada!\nMascota: ${nombreMascota}\nRaza: ${raza}\nEdad: ${edad}\nAgresivo: ${alergico}\nAlergias: ${alergias}\nServicios: ${servicios.join(
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
}*/
