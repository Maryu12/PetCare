document.addEventListener("DOMContentLoaded", function () {
    const botones = document.querySelectorAll(".elemento");
    const modales = document.querySelectorAll(".modal");
    const cierres = document.querySelectorAll(".close");

    // Mostrar modal clic en botón
    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const modalId = boton.getAttribute("data-modal");
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = "block";
        });
    });

    // Cerrar modal
    cierres.forEach(cerrar => {
        cerrar.addEventListener("click", () => {
            cerrar.closest(".modal").style.display = "none";
        });
    });

    // Cerrar modal clic fuera del contenido
    window.addEventListener("click", (event) => {
        modales.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });
});

function abrirModal(id) {
    document.getElementById(id).style.display = 'block';
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';

        // Limpia los campos del formulario dentro del modal
        const inputs = modal.querySelectorAll("input, textarea, select");
        inputs.forEach(input => {
            if (input.tagName === "SELECT") {
                input.selectedIndex = 0; // Reinicia los selects
            } else {
                input.value = ""; // Limpia los inputs y textareas
            }
        });

        // Oculta el mensaje de confirmación si existe
        const confirmacion = modal.querySelector(".modal-confirmacion");
        if (confirmacion) {
            confirmacion.style.display = "none";
            confirmacion.innerHTML = ""; // Limpia el contenido del mensaje
        }
    }
}

  // Cierra el modal si se hace clic fuera de él
window.onclick = function(event) {
const modales = document.getElementsByClassName('modal');
for (let i = 0; i < modales.length; i++) {
    if (event.target === modales[i]) {
    modales[i].style.display = 'none';

    // Limpia los campos del formulario si el modal es "modal-veterinarios"
    if (modales[i].id === 'modal-veterinarios') {
        document.getElementById("veterinarios-preferido").value = "";
        document.getElementById("veterinarios-notas").value = "";
        const confirmacion = document.getElementById("veterinarios-confirmacion");
        confirmacion.style.display = "none";
        confirmacion.innerHTML = ""; // Limpia el contenido del mensaje
    }
    
    if (id === 'modal-consulta') {
        document.getElementById("opcion-consulta").value = "";
        document.getElementById("comentarios-consulta").value = "";
        const confirmacion = document.getElementById("consulta-confirmacion");
        confirmacion.style.display = "none";
        confirmacion.innerHTML = ""; // Limpia el contenido del mensaje
    }
    }
}
};

// Codigo para la bd (no tocar perras)ni puta mierda
//Falta implementar la obtencion de datos y el get para el main para obtener los datos desde la base de datos
/*document.addEventListener("DOMContentLoaded", function () {
  const selectVet = document.getElementById("veterinarios-preferido");

  selectVet.addEventListener("change", function () {
    const seleccion = selectVet.value;

    if (seleccion !== "") {
      document.getElementById("modal-detalle-veterinario").style.display = "block";
    }
  });
});*/

function mostrarDetalleVeterinario(veterinarioId) {
    const detalleVet = document.getElementById("detalle-vet");

    // Información de ejemplo para los veterinarios
    const veterinariosInfo = {
        "1": {
            nombre: "Dr. Juan Pérez",
            especialidad: "Especialista en pequeños animales",
            experiencia: "10 años de experiencia en medicina veterinaria",
            contacto: "juan.perez@milenzopet.com | +57 305 1234567"
        },
        "2": {
            nombre: "Dra. María López",
            especialidad: "Cirugía y emergencias",
            experiencia: "8 años de experiencia en cirugía veterinaria",
            contacto: "maria.lopez@milenzopet.com | +57 305 7654321"
        },
        "3": {
            nombre: "Dr. Carlos Gómez",
            especialidad: "Dermatología y cuidado de la piel",
            experiencia: "5 años de experiencia en dermatología veterinaria",
            contacto: "carlos.gomez@milenzopet.com | +57 305 9876543"
        }
    };

    // Obtén los datos del veterinario seleccionado
    const veterinario = veterinariosInfo[veterinarioId];

    if (veterinario) {
        // Llena el modal con la información del veterinario
        detalleVet.innerHTML = `
            <p><strong>Nombre:</strong> ${veterinario.nombre}</p>
            <p><strong>Especialidad:</strong> ${veterinario.especialidad}</p>
            <p><strong>Experiencia:</strong> ${veterinario.experiencia}</p>
            <p><strong>Contacto:</strong> ${veterinario.contacto}</p>
        `;
        document.getElementById("modal-detalle-veterinario").style.display = "block";
    } else {
        detalleVet.innerHTML = "<p>No se encontró información para este veterinario.</p>";
    }
}
 
function mostrarMensajeExito(modalId, detalles) {
    const confirmacion = document.querySelector(`#${modalId} .modal-confirmacion`);
    confirmacion.innerHTML = `
        <p>¡Agendamiento exitoso! Servicio enviado correctamente.</p>
        <p><strong>Detalles del servicio:</strong></p>
        ${detalles}
    `;
    confirmacion.style.display = "block";
}

function limpiarCampos(modalId) {
    const modal = document.getElementById(modalId);
    const inputs = modal.querySelectorAll("input, textarea, select");
    inputs.forEach(input => {
        if (input.tagName === "SELECT") {
            input.selectedIndex = 0;
        } else {
            input.value = "";
        }
    });
}

function manejarBotonEnviar(modalId) {
    const modal = document.getElementById(modalId);
    const detalles = Array.from(modal.querySelectorAll("input, textarea, select"))
        .filter(input => input.value)
        .map(input => `<p><strong>${input.previousElementSibling?.textContent || input.name}: </strong> ${input.value}</p>`)
        .join("");

    if (detalles) {
        mostrarMensajeExito(modalId, detalles);
        limpiarCampos(modalId);
    } else {
        alert("Por favor, completa todos los campos antes de enviar.");
    }
}

