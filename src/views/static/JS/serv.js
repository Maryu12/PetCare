// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    // Configurar los listeners para abrir modales
    const botones = document.querySelectorAll("[data-modal]");
    botones.forEach(boton => {
        const modalId = boton.getAttribute("data-modal");
        boton.addEventListener("click", () => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = "block";
                
                // Si es el modal de transporte, configurarlo específicamente
                if (modalId === "modal-transporte") {
                    configurarModalTransporte();
                }
            }
        });
    });

    // Configurar cierre de modales al hacer clic en X
    const cierres = document.querySelectorAll(".close");
    cierres.forEach(cerrar => {
        cerrar.addEventListener("click", () => {
            const modal = cerrar.closest(".modal");
            if (modal) {
                cerrarModal(modal.id);
            }
        });
    });

    // Cerrar modal haciendo clic fuera del contenido
    window.addEventListener("click", (event) => {
        if (event.target.classList.contains('modal')) {
            cerrarModal(event.target.id);
        }
    });
});

// Configurar el modal de transporte
function configurarModalTransporte() {
    console.log("Configurando modal de transporte");

    // Cargar las mascotas del usuario
    cargarMascotas();

    // Configurar fecha mínima (hoy)
    const today = new Date().toISOString().split('T')[0];
    const inputFecha = document.getElementById('transporte-fecha');
    if (inputFecha) inputFecha.min = today;

    // Resetear el formulario
    document.getElementById('transporte-tipo').value = '';
    document.getElementById('transporte-fecha').value = '';
    document.getElementById('transporte-hora').value = '';
    document.getElementById('transporte-comentarios').value = '';
}

// Función para cargar mascotas desde el servidor
async function cargarMascotas() {
    try {
        const response = await fetch("/getMyPets");
        if (response.ok) {
            const pets = await response.json();
            const petSelect = document.getElementById("transporte-mascota");

            // Limpiar el desplegable antes de llenarlo
            petSelect.innerHTML = '<option value="">-- Selecciona una mascota --</option>';

            // Agregar una opción por cada mascota
            pets.forEach(pet => {
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

// Cambiar tipo de transporte
function tipoTransporteChange() {
    const tipoTransporte = document.getElementById('transporte-tipo').value;
    const vueltaContainer = document.getElementById('transporte-vuelta-container');

    if (vueltaContainer) {
        vueltaContainer.style.display = tipoTransporte === 'ida-vuelta' ? 'block' : 'none';
    }
}

// Función para cerrar y limpiar un modal
function cerrarModal(id) {
    console.log("Cerrando modal:", id);
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        
        // Limpieza específica para cada modal
        if (id === 'modal-transporte') {
            // Para transporte, no limpiamos el selector de mascotas ya que lo cargamos dinámicamente
            document.getElementById('transporte-tipo').value = '';
            document.getElementById('transporte-fecha').value = '';
            document.getElementById('transporte-hora').value = '';
            document.getElementById('transporte-direccion-recogida').value = '';
            document.getElementById('transporte-comentarios').value = '';
            
            const vueltaContainer = document.getElementById('transporte-vuelta-container');
            if (vueltaContainer) vueltaContainer.style.display = 'none';
            
            const fechaVuelta = document.getElementById('transporte-fecha-vuelta');
            if (fechaVuelta) fechaVuelta.value = '';
            
            const horaVuelta = document.getElementById('transporte-hora-vuelta');
            if (horaVuelta) horaVuelta.value = '';
        } else {
            // Para otros modales, limpiar todos los campos
            const inputs = modal.querySelectorAll("input, textarea, select");
            inputs.forEach(input => {
                if (input.tagName === "SELECT") {
                    input.selectedIndex = 0;
                } else {
                    input.value = "";
                }
            });
        }
        
        // Ocultar mensaje de confirmación si existe
        const confirmacion = modal.querySelector(".modal-confirmacion");
        if (confirmacion) {
            confirmacion.style.display = "none";
            confirmacion.innerHTML = "";
        }
    }
}

// Enviar datos del formulario de transporte
function sendTransporteData() {
    const idPet = document.getElementById('transporte-mascota').value;
    const transporteTipo = document.getElementById('transporte-tipo').value;
    const fechaRecogida = document.getElementById('transporte-fecha').value;
    const horaRecogida = document.getElementById('transporte-hora').value;
    const comentarios = document.getElementById('transporte-comentarios').value;

    if (!idPet || !transporteTipo || !fechaRecogida || !horaRecogida) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    const data = {
        id_pet: idPet,
        tipo_transporte: transporteTipo,
        fecha_recogida: fechaRecogida,
        hora_recogida: horaRecogida,
        comentarios: comentarios
    };

    fetch('/api/transporte', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                alert('Solicitud de transporte enviada con éxito.');
                cerrarModal('modal-transporte');
            } else {
                alert('Hubo un error al enviar la solicitud.');
            }
        })
        .catch(error => console.error('Error al enviar los datos:', error));
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
