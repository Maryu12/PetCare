document.addEventListener("DOMContentLoaded", async () => {
    const petSelect = document.getElementById("petSelect");
    const viewService = document.getElementById("viewService");
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
    viewService.addEventListener("click", async () => {
        const selectedPetId = petSelect.value;
        if (selectedPetId) {
            try {
                const response = await fetch(`/viewService/${selectedPetId}`, {
                    credentials: "include"
                });
                if (response.ok) {
                    const history = await response.json();

                    // Mostrar el historial
                    historyContainer.style.display = "block";
                    historyList.innerHTML = ""; // Limpiar la lista antes de llenarla

                    if (history.length === 0) {
                        const listItem = document.createElement("li");
                        listItem.textContent = "No hay historial de servicios para esta mascota.";
                        historyList.appendChild(listItem);
                        modifyHistoryForm.style.display = "block"; // Mostrar formulario para agregar historial
                    } else {
                        history.forEach(record => {
                            const listItem = document.createElement("li");
                            listItem.textContent = `Servicio a realizar: ${record.service_name}; En la fecha: ${record.fecha_rec}; Hora: ${record.date}; Veterinario a cargo: ${record.veterinarian}; Observaciones del paciente: ${record.description}`;
                            historyList.appendChild(listItem);
                        });
                        modifyHistoryForm.style.display = "block"; // Mostrar formulario para modificar historial
                    }
                } else {
                    console.error("No se pudo cargar el historial de servicios.");
                }
            } catch (error) {
                console.error("Error al cargar el historial de servicios:", error);
            }
        } else {
            alert("Por favor, selecciona una mascota.");
        }
    });

});