document.addEventListener("DOMContentLoaded", async () => {
    const petSelect = document.getElementById("petSelect");
    const historyContainer = document.getElementById("historyContainer");
    const historyList = document.getElementById("historyList");
    const modifyHistoryForm = document.getElementById("modifyHistoryForm");

    // Helper para leer query params
    const params = new URLSearchParams(window.location.search);
    let qPetId = params.get('id_pet');
    let qAppointmentId = params.get('appointment_id');
    const qAppDate = params.get('appointment_date');
    const qAppTime = params.get('appointment_time');
    const qAppService = params.get('appointment_service');
    const qAppDesc = params.get('appointment_description');
    const qPetName = params.get('pet_name');

    // Debug: ver qué parámetros llegaron
    console.log('URL params:', { qPetId, qAppointmentId, qAppDate, qAppTime });

    // Muestra la sección de historial
    function showHistorySection() {
        if (historyContainer) historyContainer.style.display = 'block';
    }

    // Rellenar datos recibidos por query string
    function prefillFromQuery() {
        if (!qPetId) return;
        showHistorySection();

        // Si existe un campo de perfil de mascota, muéstralo
        const petProfile = document.getElementById('petProfile');
        if (petProfile && qPetName) {
            petProfile.textContent = qPetName;
        }

        // Prefill appointment details into the form fields
        if (qAppDesc) {
            const obs = document.getElementById('observations');
            if (obs) obs.value = decodeURIComponent(qAppDesc);
        }
        if (qAppDate) {
            const consultDate = document.getElementById('consult_date');
            if (consultDate) consultDate.value = qAppDate;
        }
        if (qAppService) {
            const consultReason = document.getElementById('consult_reason');
            const otherReason = document.getElementById('other_reason');
            if (consultReason) {
                const svc = qAppService.toLowerCase();
                // Map some common service keywords to select options
                if (svc.includes('vacun')) {
                    consultReason.value = 'vacunacion';
                } else if (svc.includes('rutina') || svc.includes('control')) {
                    consultReason.value = 'rutina';
                } else if (svc.includes('enfer') || svc.includes('sick')) {
                    consultReason.value = 'enfermedad';
                } else if (svc.includes('lesion') || svc.includes('herida')) {
                    consultReason.value = 'lesion';
                } else if (svc.includes('cirug')) {
                    consultReason.value = 'cirugia';
                } else {
                    consultReason.value = 'otro';
                    if (otherReason) otherReason.value = decodeURIComponent(qAppService);
                    const otherGroup = document.getElementById('otherReasonGroup');
                    if (otherGroup) otherGroup.style.display = 'block';
                }
            }
        }
    }

    // Cargar historial médico desde el backend y mostrarlo
    async function loadMedicalHistory(petId) {
        try {
            const resp = await fetch(`/viewHistory/${petId}`, { credentials: 'include' });
            if (!resp.ok) return;
            const data = await resp.json();
            if (!Array.isArray(data) || data.length === 0) return;

            // Llenar lista de registros
            if (historyList) historyList.innerHTML = '';
            data.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = `${rec.date ?? ''} — ${rec.description ?? ''} — ${rec.vaccines ?? ''}`;
                if (historyList) historyList.appendChild(li);
            });

            // Rellenar campos del formulario con el último registro si existen
            const latest = data[0];
            const obsField = document.getElementById('observations');
            const firstConsField = document.getElementById('first_cons_date');
            const vaccineField = document.getElementById('vaccines');
            if (latest && obsField) obsField.value = latest.description ?? '';
            if (latest && firstConsField) firstConsField.value = latest.date ?? '';
            if (latest && vaccineField) vaccineField.value = latest.vaccines ?? '';
        } catch (err) {
            console.error('Error cargando historial médico:', err);
        }
    }

    // Prefill and load
    prefillFromQuery();
    // If an appointment id is provided, fetch full appointment details (preferred over query params)
    if (qAppointmentId) {
        // Mostrar el contenedor inmediatamente
        showHistorySection();
        try {
            const resp = await fetch(`/getAppointment/${qAppointmentId}`, { credentials: 'include' });
            if (resp.ok) {
                const ap = await resp.json();
                // Ensure we have pet id for later preselection
                if (ap.id_pet && !qPetId) qPetId = String(ap.id_pet);

                // Prefill form fields from appointment
                if (ap.comentario) {
                    const obs = document.getElementById('observations');
                    if (obs) obs.value = ap.comentario;
                }
                // prefer fecha_rec as date for consult_date, fallback to date_hour_status
                if (ap.fecha_rec) {
                    const consultDate = document.getElementById('consult_date');
                    if (consultDate) consultDate.value = ap.fecha_rec;
                } else if (ap.date_hour_status) {
                    const consultDate = document.getElementById('consult_date');
                    if (consultDate) consultDate.value = ap.date_hour_status;
                }
                if (ap.service_type || ap.service_description) {
                    const svc = (ap.service_type || ap.service_description || '').toLowerCase();
                    const consultReason = document.getElementById('consult_reason');
                    const otherReason = document.getElementById('other_reason');
                    if (consultReason) {
                        if (svc.includes('vacun')) {
                            consultReason.value = 'vacunacion';
                        } else if (svc.includes('rutina') || svc.includes('control')) {
                            consultReason.value = 'rutina';
                        } else if (svc.includes('enfer') || svc.includes('sick')) {
                            consultReason.value = 'enfermedad';
                        } else if (svc.includes('lesion') || svc.includes('herida')) {
                            consultReason.value = 'lesion';
                        } else if (svc.includes('cirug')) {
                            consultReason.value = 'cirugia';
                        } else {
                            consultReason.value = 'otro';
                            if (otherReason) otherReason.value = ap.service_description || ap.service_type || '';
                            const otherGroup = document.getElementById('otherReasonGroup');
                            if (otherGroup) otherGroup.style.display = 'block';
                        }
                    }
                }
                // show pet name in profile if present
                if (ap.pet_name) {
                    const petProfile = document.getElementById('petProfile');
                    if (petProfile) petProfile.textContent = ap.pet_name;
                }
                // NO limpiar la URL todavía - necesitamos appointment_id al guardar
                // La URL se puede limpiar después de guardar si es necesario
                /*
                try {
                    const newPath = window.location.pathname + (qPetId ? (`?id_pet=${encodeURIComponent(qPetId)}`) : '');
                    window.history.replaceState({}, document.title, newPath);
                } catch (e) {
                    console.warn('No se pudo limpiar la URL:', e);
                }
                */
            }
        } catch (err) {
            console.error('Error cargando cita:', err);
        }
    }

    if (qPetId) await loadMedicalHistory(qPetId);

    // Si existe un select de mascotas (por si el usuario puede elegir), poblarlo y preseleccionar
    if (petSelect) {
        try {
            const resp = await fetch('/getMyPets', { credentials: 'include' });
            if (resp.ok) {
                const pets = await resp.json();
                petSelect.innerHTML = '';
                
                // Agregar opción por defecto
                const defaultOpt = document.createElement('option');
                defaultOpt.value = '';
                defaultOpt.textContent = 'Selecciona una mascota';
                petSelect.appendChild(defaultOpt);
                
                pets.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id_pet;
                    opt.textContent = `${p.pet_name} - ${p.species}`;
                    if (qPetId && String(p.id_pet) === String(qPetId)) opt.selected = true;
                    petSelect.appendChild(opt);
                });
                
                // Si no hay parámetros pero sí hay mascotas disponibles, mostrar el formulario
                if (!qPetId && !qAppointmentId && pets.length > 0) {
                    showHistorySection();
                }
                
                // Listener para cargar historial cuando se selecciona una mascota
                petSelect.addEventListener('change', async (e) => {
                    const selectedPetId = e.target.value;
                    if (selectedPetId) {
                        await loadMedicalHistory(selectedPetId);
                        qPetId = selectedPetId; // Actualizar la variable global
                    }
                });
            }
        } catch (err) {
            console.error('Error cargando mascotas:', err);
        }
    }

    // Manejar submit del formulario (un único manejador)
    if (modifyHistoryForm) {
        modifyHistoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedPetId = (petSelect && petSelect.value) ? petSelect.value : qPetId;
            const vaccines = document.getElementById('vaccines')?.value ?? '';
            const observations = document.getElementById('observations')?.value ?? '';
            const firstConsDate = document.getElementById('consult_date')?.value ?? '';

            // Preparar el body con los parámetros requeridos
            const bodyParams = {
                id_pet: selectedPetId,
                vaccines: vaccines,
                observations: observations,
                first_cons_date: firstConsDate
            };

            // Agregar appointment_id si está disponible
            if (qAppointmentId) {
                bodyParams.appointment_id = qAppointmentId;
                console.log(`Enviando appointment_id: ${qAppointmentId}`);
            } else {
                console.log('No hay appointment_id disponible');
            }

            try {
                const response = await fetch('/modifyPetHistory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(bodyParams),
                    credentials: 'include'
                });

                if (response.ok) {
                    // Mostrar mensaje de éxito mejorado
                    showSuccessMessage('✓ Historial médico actualizado correctamente');
                    
                    // Redirigir a agendaVet después de 2 segundos
                    setTimeout(() => {
                        window.location.href = '/agendaVet';
                    }, 2000);
                } else {
                    console.error('Error al actualizar el historial médico.');
                    showErrorMessage('Error al actualizar el historial médico.');
                }
            } catch (err) {
                console.error('Error al enviar los datos:', err);
                showErrorMessage('Error de red al intentar actualizar el historial.');
            }
        });
    }
});

function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

function cerrarModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// Función para mostrar mensaje de éxito mejorado
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message success';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 16px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Función para mostrar mensaje de error mejorado
function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message error';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #dc3545;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 16px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación al documento si no existen
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
if (!document.querySelector('style[data-toast-styles]')) {
    style.setAttribute('data-toast-styles', 'true');
    document.head.appendChild(style);
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