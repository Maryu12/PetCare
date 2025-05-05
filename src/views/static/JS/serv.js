document.addEventListener("DOMContentLoaded", function () {
    const botones = document.querySelectorAll("[data-modal]");
    const modales = document.querySelectorAll(".modal");
    const cierres = document.querySelectorAll(".close");

    // Mostrar modal al hacer clic en el botón
    botones.forEach(boton => {
        const modalId = boton.getAttribute("data-modal");
        boton.addEventListener("click", () => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = "block";

                // Si es el modal de transporte, configura sus datos
                if (modalId === "modal-transporte") {
                    cargarMascotas();

                    const today = new Date().toISOString().split("T")[0];
                    document.getElementById('transporte-fecha').min = today;
                    document.getElementById('transporte-fecha-vuelta').min = today;

                    // Resetear el formulario
                    document.getElementById('transporte-tipo').value = '';
                    document.getElementById('transporte-fecha').value = '';
                    document.getElementById('transporte-hora').value = '';
                    document.getElementById('transporte-direccion-recogida').value = '';
                    document.getElementById('transporte-direccion-entrega').value = '';
                    document.getElementById('transporte-fecha-vuelta').value = '';
                    document.getElementById('transporte-hora-vuelta').value = '';
                    document.getElementById('transporte-comentarios').value = '';
                    document.getElementById('transporte-vuelta-container').style.display = 'none';
                }
            }
        });
    });

    // Cerrar modal al hacer clic en X
    cierres.forEach(cerrar => {
        cerrar.addEventListener("click", () => {
            const modal = cerrar.closest(".modal");
            if (modal) cerrarModal(modal.id);
        });
    });

    // Cerrar modal haciendo clic fuera del contenido
    window.addEventListener("click", (event) => {
        modales.forEach(modal => {
            if (event.target === modal) {
                cerrarModal(modal.id);
            }
        });
    });
});

// Función para cerrar y limpiar un modal
function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';

        // Limpieza general de inputs, textareas y selects
        const inputs = modal.querySelectorAll("input, textarea, select");
        inputs.forEach(input => {
            if (input.tagName === "SELECT") {
                input.selectedIndex = 0;
            } else {
                input.value = "";
            }
        });

        // Ocultar mensaje de confirmación
        const confirmacion = modal.querySelector(".modal-confirmacion");
        if (confirmacion) {
            confirmacion.style.display = "none";
            confirmacion.innerHTML = "";
        }

        // Limpieza específica para modales
        if (id === 'modal-veterinarios') {
            document.getElementById("veterinarios-preferido").value = "";
            document.getElementById("veterinarios-notas").value = "";
            const conf = document.getElementById("veterinarios-confirmacion");
            conf.style.display = "none";
            conf.innerHTML = "";
        }

        if (id === 'modal-consulta') {
            document.getElementById("opcion-consulta").value = "";
            document.getElementById("comentarios-consulta").value = "";
            const conf = document.getElementById("consulta-confirmacion");
            conf.style.display = "none";
            conf.innerHTML = "";
        }
    }
}

// Mostrar información del veterinario
function mostrarDetalleVeterinario(veterinarioId) {
    const detalleVet = document.getElementById("detalle-vet");

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

    const veterinario = veterinariosInfo[veterinarioId];

    if (veterinario) {
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

// Mensaje de confirmación al enviar servicio
function mostrarMensajeExito(modalId, detalles) {
    const confirmacion = document.querySelector(`#${modalId} .modal-confirmacion`);
    confirmacion.innerHTML = `
        <p>¡Agendamiento exitoso! Servicio enviado correctamente.</p>
        <p><strong>Detalles del servicio:</strong></p>
        ${detalles}
    `;
    confirmacion.style.display = "block";
}

// Limpiar campos manualmente (por ID de modal)
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

// Manejar botón de enviar
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

// Cargar mascotas desde el servidor
async function cargarMascotas() {
    try {
        console.log("Cargando mascotas...");
        const response = await fetch('/getMyPets', { credentials: 'include' });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const mascotas = await response.json();
        console.log("Mascotas recibidas:", mascotas);

        const selectMascota = document.getElementById('transporte-mascota');

        //while (selectMascota.options.length > 1) {
          //  selectMascota.remove(1);
        //}

        mascotas.forEach(mascota => {
            const option = document.createElement('option');
            option.value = mascota.id_pet;
            option.textContent = `${mascota.pet_name} (${mascota.species})`;
            selectMascota.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar las mascotas:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const transporteBtn = document.querySelector('[data-modal="modal-transporte"]');
    transporteBtn.addEventListener('click', cargarMascotas);
});

// Cambiar tipo de transporte
function tipoTransporteChange() {
    const tipoTransporte = document.getElementById('transporte-tipo').value;
    const vueltaContainer = document.getElementById('transporte-vuelta-container');

    vueltaContainer.style.display = tipoTransporte === 'ida-vuelta' ? 'block' : 'none';
}

// Enviar datos del formulario de transporte
async function sendTransporteData() {
    const mascota = document.getElementById('transporte-mascota').value;
    const fechaRecogida = document.getElementById('transporte-fecha').value;
    const horaRecogida = document.getElementById('transporte-hora').value;
    const comentarios = document.getElementById('transporte-comentarios').value;

    if (!mascota || !fechaRecogida || !horaRecogida) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }

    try {
        const response = await fetch('/api/transporte', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_pet: mascota,
                fecha_recogida: fechaRecogida,
                hora_recogida: horaRecogida,
                comentarios: comentarios
            }),
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Solicitud de transporte registrada correctamente. ID de la cita: ${data.appointment_id}`);
            cerrarModal('modal-transporte');
        } else {
            alert('Error al registrar la solicitud de transporte');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar la solicitud');
    }
}
