document.addEventListener("DOMContentLoaded", async () => {
    const petSelect = document.getElementById("petSelect");
    const viewService = document.getElementById("viewService");
    const historyContainer = document.getElementById("historyContainer");
    const historyList = document.getElementById("historyList");
    const modifyHistoryForm = document.getElementById("modifyHistoryForm");

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/[&<>\"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'})[s]);
    }

    // Llamar al backend para obtener las mascotas
    try {
        const response = await fetch("/getMyPets", {
            credentials: "include"
        });
        if (response.ok) {
            const pets = await response.json();

            // Limpiar el desplegable antes de llenarlo
            petSelect.innerHTML = "";

            // Agregar opciones al desplegable
            if (!pets || pets.length === 0) {
                const option = document.createElement("option");
                option.textContent = "No tienes mascotas registradas";
                option.disabled = true;
                petSelect.appendChild(option);
            } else {
                pets.forEach(pet => {
                    const option = document.createElement("option");
                    option.value = pet.id_pet;
                    option.textContent = `${pet.pet_name} - ${pet.species}`;
                    petSelect.appendChild(option);
                });
            }
        } else {
            console.error("No se pudieron cargar las mascotas.");
        }
    } catch (error) {
        console.error("Error al cargar las mascotas:", error);
    }

    // Mostrar el historial de servicios de la mascota seleccionada
    viewService.addEventListener("click", async () => {
        const selectedPetId = petSelect.value;
        if (!selectedPetId) {
            alert("Por favor, selecciona una mascota.");
            return;
        }

        try {
            const response = await fetch(`/viewService/${selectedPetId}`, {
                credentials: "include"
            });
            if (!response.ok) {
                console.error("No se pudo cargar el historial de servicios.");
                return;
            }

            const history = await response.json();

            // Mostrar el historial
            historyContainer.style.display = "block";
            historyList.innerHTML = ""; // Limpiar antes de insertar

            if (!history || history.length === 0) {
                const emptyMsg = document.createElement("p");
                emptyMsg.className = "empty-hint";
                emptyMsg.textContent = "No hay historial de servicios para esta mascota.";
                historyList.appendChild(emptyMsg);
                if (modifyHistoryForm) modifyHistoryForm.style.display = "block";
                return;
            }

            // Construir una tabla con los registros
            const table = document.createElement("table");
            table.className = "agenda-table";
            table.style.width = "100%";

            const thead = document.createElement("thead");
            thead.innerHTML = `
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Servicio</th>
                    <th>Veterinario</th>
                    <th>Observaciones</th>
                    <th>Estado</th>
                </tr>`;
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            history.forEach(record => {
                const tr = document.createElement("tr");
                const appointmentId = record.id_appointment;
                const status = record.status || "";
                
                // Aplicar color de fondo si ya está atendido
                if (status === "attended") {
                    tr.style.backgroundColor = "#d4edda"; // Verde claro
                }
                
                // Determinar qué mostrar en la columna de estado
                let actionsHTML = '';
                if (status === "attended") {
                    actionsHTML = '<span class="status-label completed" style="color: #28a745; font-weight: bold;">✓ Terminado</span>';
                } else {
                    // Solo mostrar el botón si NO es Cliente
                    if (window.userRole !== "Cliente") {
                        actionsHTML = `<button class="atender action-button" data-id="${appointmentId}">Realizado</button>`;
                    } else {
                        actionsHTML = '<span style="color: #6c757d;">Pendiente</span>';
                    }
                }
                
                tr.innerHTML = `
                    <td>${escapeHtml(record.fecha_rec)}</td>
                    <td>${escapeHtml(record.date)}</td>
                    <td>${escapeHtml(record.service_name)}</td>
                    <td>${escapeHtml(record.veterinarian)}</td>
                    <td>${escapeHtml(record.description)}</td>
                    
                    <td class="actions-cell">${actionsHTML}</td>`;
                tbody.appendChild(tr);
                
                // Agregar listener al botón solo si no está atendido Y no es Cliente
                if (status !== "attended" && window.userRole !== "Cliente") {
                    const btnAtender = tr.querySelector("button.atender");
                    if (btnAtender) {
                        btnAtender.addEventListener("click", async (e) => {
                            e.preventDefault();
                            const id = btnAtender.dataset.id;
                            
                            if (!id) {
                                alert("ID de cita no disponible.");
                                return;
                            }
                            
                            try {
                                // Llamar al backend para marcar como atendido
                                const resp = await fetch(`/api/completeAppointment/${id}`, {
                                    method: "PUT",
                                    credentials: "include"
                                });
                                
                                if (resp.ok) {
                                    // Cambiar color de fondo a verde
                                    tr.style.backgroundColor = "#d4edda";
                                    // Reemplazar botón por mensaje
                                    const actionsCell = tr.querySelector(".actions-cell");
                                    if (actionsCell) {
                                        actionsCell.innerHTML = '<span class="status-label completed" style="color: #28a745; font-weight: bold;">✓ Terminado</span>';
                                    }
                                } else {
                                    const txt = await resp.text();
                                    console.error("Error al marcar como atendido:", resp.status, txt);
                                    alert("Error al marcar el servicio como atendido.");
                                }
                            } catch (err) {
                                console.error("Error en la petición:", err);
                                alert("Error de red al intentar marcar como atendido.");
                            }
                        });
                    }
                }
            });

            table.appendChild(tbody);
            historyList.appendChild(table);
            if (modifyHistoryForm) modifyHistoryForm.style.display = "block";

        } catch (error) {
            console.error("Error al cargar el historial de servicios:", error);
        }
    });

});