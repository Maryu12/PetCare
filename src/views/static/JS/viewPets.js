document.addEventListener("DOMContentLoaded", async () => {
    const petSelect = document.getElementById("petSelect");
    const viewHistory = document.getElementById("viewHistory");
    const historyContainer = document.getElementById("historyContainer");
    const historyList = document.getElementById("historyList");
    const modifyHistoryForm = document.getElementById("modifyHistoryForm");

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
            if (pets.length === 0) {
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

    // Mostrar el historial médico de la mascota seleccionada
    viewHistory.addEventListener("click", async () => {
        const selectedPetId = petSelect.value;
        if (selectedPetId) {
            try {
                const response = await fetch(`/viewHistory/${selectedPetId}`, {
                    credentials: "include"
                });
                if (response.ok) {
                    const history = await response.json();

                    // Mostrar el historial médico
                    historyContainer.style.display = "block";
                    historyList.innerHTML = ""; // Limpiar la lista antes de llenarla

                    if (history.length === 0) {
                        const listItem = document.createElement("li");
                        listItem.textContent = "No hay historial médico para esta mascota.";
                        historyList.appendChild(listItem);
                        modifyHistoryForm.style.display = "block"; // Mostrar formulario para agregar historial
                    } else {
                        history.forEach(record => {
                            const listItem = document.createElement("li");
                            listItem.textContent = `${record.date}: ${record.description}`;
                            historyList.appendChild(listItem);
                        });
                        modifyHistoryForm.style.display = "block"; // Mostrar formulario para modificar historial
                    }
                } else {
                    console.error("No se pudo cargar el historial médico.");
                }
            } catch (error) {
                console.error("Error al cargar el historial médico:", error);
            }
        } else {
            alert("Por favor, selecciona una mascota.");
        }
    });

    // Manejar la modificación del historial médico
    modifyHistoryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const selectedPetId = petSelect.value;
        const vaccines = document.getElementById("vaccines").value;
        const observations = document.getElementById("observations").value;
        const firstConsDate = document.getElementById("first_cons_date").value;

        try {
            const response = await fetch("/modifyPetHistory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    id_pet: selectedPetId,
                    vaccines: vaccines,
                    observations: observations,
                    first_cons_date: firstConsDate
                }),
                credentials: "include"
            });

            if (response.ok) {
                alert("Historial médico actualizado correctamente.");
            } else {
                console.error("Error al actualizar el historial médico.");
            }
        } catch (error) {
            console.error("Error al enviar los datos:", error);
        }
    });
});
function abrirModal(id) {
    document.getElementById(id).style.display = 'block';
  }

function cerrarModal(id) {
document.getElementById(id).style.display = 'none';
}

// Añadir al evento click del botón viewHistory
viewHistory.addEventListener("click", async () => {
    const selectedPetId = petSelect.value;
    if (selectedPetId) {
        try {
            const response = await fetch(`/viewHistory/${selectedPetId}`, {
                credentials: "include"
            });
            if (response.ok) {
                const history = await response.json();

                // Mostrar el historial médico
                historyContainer.style.display = "block";
                historyList.innerHTML = ""; // Limpiar la lista antes de llenarla

                // Mostrar información de la mascota seleccionada
                const petInfo = document.getElementById("petProfile");
                const selectedOption = petSelect.options[petSelect.selectedIndex];
                petInfo.innerHTML = `
                    <div class="pet-info">
                        <h4>${selectedOption.textContent}</h4>
                        <p>ID: ${selectedPetId}</p>
                    </div>
                `;

                if (history.length === 0) {
                    const listItem = document.createElement("li");
                    listItem.textContent = "No hay historial médico para esta mascota.";
                    historyList.appendChild(listItem);
                    modifyHistoryForm.style.display = "block"; // Mostrar formulario para agregar historial
                } else {
                    history.forEach(record => {
                        const listItem = document.createElement("li");
                        listItem.innerHTML = `
                            <strong>${record.date}</strong>: ${record.description}
                            ${record.vaccines ? `<br><em>Vacunas: ${record.vaccines}</em>` : ''}
                        `;
                        historyList.appendChild(listItem);
                    });
                    modifyHistoryForm.style.display = "block"; // Mostrar formulario para modificar historial
                    
                    // Prellenar el formulario con la información más reciente
                    if (history.length > 0) {
                        const latestRecord = history[0]; // Asumiendo que están ordenados por fecha
                        if (latestRecord.vaccines) document.getElementById("vaccines").value = latestRecord.vaccines;
                        if (latestRecord.observations) document.getElementById("observations").value = latestRecord.observations;
                    }
                }
            } else {
                console.error("No se pudo cargar el historial médico.");
            }
        } catch (error) {
            console.error("Error al cargar el historial médico:", error);
        }
    } else {
        alert("Por favor, selecciona una mascota.");
    }
});

// Modificar el evento submit del formulario para incluir los nuevos campos
modifyHistoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selectedPetId = petSelect.value;
    const vaccines = document.getElementById("vaccines").value;
    const vaccineDate = document.getElementById("vaccine_date").value;
    const observations = document.getElementById("observations").value;
    const consultReason = document.getElementById("consult_reason").value;
    const otherReason = document.getElementById("other_reason").value;
    const consultDate = document.getElementById("consult_date").value;

    // Determinar el motivo final
    let finalReason = consultReason;
    if (consultReason === 'otro') {
        finalReason = otherReason;
    }

    try {
        const response = await fetch("/modifyPetHistory", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                id_pet: selectedPetId,
                vaccines: vaccines,
                vaccine_date: vaccineDate,
                observations: observations,
                consult_reason: finalReason,
                consult_date: consultDate
            }),
            credentials: "include"
        });

        if (response.ok) {
            alert("Historial médico actualizado correctamente.");
            // Recargar el historial para mostrar los cambios
            document.getElementById("viewHistory").click();
        } else {
            console.error("Error al actualizar el historial médico.");
        }
    } catch (error) {
        console.error("Error al enviar los datos:", error);
    }
});

// Cierra el modal si se hace clic fuera de él
window.onclick = function(event) {
const modales = document.getElementsByClassName('modal');
    for (let i = 0; i < modales.length; i++) {
        if (event.target === modales[i]) {
        modales[i].style.display = 'none';
        }
    }
}; 