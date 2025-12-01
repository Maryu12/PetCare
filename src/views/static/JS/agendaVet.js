document.addEventListener("DOMContentLoaded", async () => {
    // Elementos esperados en la página
    const historyList = document.getElementById("historyList");
    const historyContainer = document.querySelector(".history-records") || historyList?.parentElement;
    const modifyHistoryForm = document.getElementById("modifyHistoryForm"); // opcional

    try {
        const response = await fetch("/getAgendaVet", { credentials: "include" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const items = await response.json();

        // Debug: mostrar lo que llegó del backend
        console.debug("/getAgendaVet -> items:", items);

        if (!items || items.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.className = "empty-hint";
            emptyMsg.textContent = "Aún no tienes nada asignado.";
            if (historyList) {
                historyList.innerHTML = "";
                historyList.appendChild(emptyMsg);
            } else if (historyContainer) {
                historyContainer.innerHTML = "";
                historyContainer.appendChild(emptyMsg);
            }
            if (modifyHistoryForm) modifyHistoryForm.style.display = "block";
            return;
        }

        // Construir una tabla con los registros
        const table = document.createElement("table");
        table.className = "agenda-table";
        // asegurar que la tabla sea visible
        table.style.width = "100%";

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Mascota</th>
                <th>Servicio</th>
                <th>Veterinario</th>
                <th>Observaciones</th>
            </tr>`;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        items.forEach(it => {
            const tr = document.createElement("tr");
            const date = it.service_date ?? "";
            const time = it.service_time ?? "";
            const pet = it.pet_name ?? "";
            const service = it.service_type ?? it.service_description ?? "";
            const vet = it.veterinarian_name ?? "";
            const desc = it.description ?? "";
            const appointmentId = it.appointment_id ?? it.id_appointment ?? "";

            tr.innerHTML = `
                <td>${escapeHtml(date)}</td>
                <td>${escapeHtml(time)}</td>
                <td>${escapeHtml(pet)}</td>
                <td>${escapeHtml(service)}</td>
                <td>${escapeHtml(vet)}</td>
                <td>${escapeHtml(desc)}</td>
                <td class="actions-cell">
                    <button class="atender action-button" data-id="${escapeHtml(appointmentId)}">Atender</button>
                    <button class="cancelar action-button" data-id="${escapeHtml(appointmentId)}">Cancelar</button>
                </td>`;

            tbody.appendChild(tr);

            // Añadir listeners para los botones (siempre después de append para asegurar el elemento en DOM)
            const btnAtender = tr.querySelector("button.atender");
            const btnCancelar = tr.querySelector("button.cancelar");

            if (btnAtender) {
                btnAtender.addEventListener("click", async (e) => {
                    e.preventDefault();
                    const id = btnAtender.dataset.id;
                    if (!id) {
                        alert("ID de cita no disponible.");
                        return;
                    }
                    try {
                        const resp = await fetch(`/api/attendAppointment/${id}`, { method: "POST", credentials: "include" });
                        if (resp.ok) {
                            alert("Servicio marcado como atendido.");
                            // refrescar la página o la lista
                            location.reload();
                        } else {
                            const txt = await resp.text();
                            console.error("Atender fallo:", resp.status, txt);
                            alert("Error al marcar como atendido.");
                        }
                    } catch (err) {
                        console.error("Error en atender:", err);
                        alert("Error de red al intentar atender la cita.");
                    }
                });
            }

            if (btnCancelar) {
                btnCancelar.addEventListener("click", async (e) => {
                    e.preventDefault();
                    if (!confirm("¿Confirma cancelar este servicio?")) return;
                    const id = btnCancelar.dataset.id;
                    if (!id) {
                        alert("ID de cita no disponible.");
                        return;
                    }
                    try {
                        const resp = await fetch(`/api/cancelAppointment/${id}`, { method: "DELETE", credentials: "include" });
                        if (resp.ok) {
                            alert("Servicio cancelado con éxito.");
                            location.reload();
                        } else {
                            const txt = await resp.text();
                            console.error("Cancelar fallo:", resp.status, txt);
                            alert("Error al cancelar el servicio.");
                        }
                    } catch (err) {
                        console.error("Error en cancelar:", err);
                        alert("Error de red al intentar cancelar la cita.");
                    }
                });
            }
        });

        table.appendChild(tbody);

        if (historyList) {
            historyList.innerHTML = "";
            historyList.appendChild(table);
            console.debug("agenda: table appended to #historyList");
        } else if (historyContainer) {
            historyContainer.innerHTML = "";
            historyContainer.appendChild(table);
            console.debug("agenda: table appended to .history-records");
        }

        if (modifyHistoryForm) modifyHistoryForm.style.display = "block";

    } catch (error) {
        console.error("Error al cargar la agenda del veterinario:", error);
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/[&<>\"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'})[s]);
    }
});