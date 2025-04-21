document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("petsModal");
    const btn = document.getElementById("viewPetsBtn");
    const span = document.getElementsByClassName("close")[0];
    const petsList = document.getElementById("petsList");

    // Abrir el modal al hacer clic en el botón
    btn.onclick = async function () {
        modal.style.display = "flex"; // Cambiar a "flex" para centrar el modal

        // Llamar al backend para obtener las mascotas
        const response = await fetch("/myPetsData");
        const pets = await response.json();

        // Limpiar la lista de mascotas
        petsList.innerHTML = "";

        // Agregar las mascotas al modal
        pets.forEach(pet => {
            const li = document.createElement("li");
            li.textContent = `${pet.pet_name} - ${pet.species} - ${pet.edad} años`;
            petsList.appendChild(li);
        });
    };

    // Cerrar el modal al hacer clic en la "x"
    span.onclick = function () {
        modal.style.display = "none";
    };

    // Cerrar el modal al hacer clic fuera del contenido
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    const historyModal = document.getElementById("historyModal");
    const viewHistoryBtn = document.getElementById("viewHistoryBtn");
    const petSelect = document.getElementById("petSelect");
    const viewHistory = document.getElementById("viewHistory");

    // Abrir el modal al hacer clic en el botón
    viewHistoryBtn.addEventListener("click", async () => {
        historyModal.style.display = "block";

        // Llamar al backend para obtener las mascotas
        try {
            const response = await fetch("/getMyPets");
            if (response.ok) {
                const pets = await response.json();
                petSelect.innerHTML = ""; // Limpiar opciones previas

                // Agregar opciones al desplegable
                pets.forEach(pet => {
                    const option = document.createElement("option");
                    option.value = pet.id_pet;
                    option.textContent = `${pet.pet_name} - ${pet.species}`;
                    petSelect.appendChild(option);
                });
            } else {
                console.error("No se pudieron cargar las mascotas.");
            }
        } catch (error) {
            console.error("Error al cargar las mascotas:", error);
        }
    });

    // Cerrar el modal
    window.closeModal = function (modalId) {
        document.getElementById(modalId).style.display = "none";
    };

    // Ver historial de la mascota seleccionada
    viewHistory.addEventListener("click", () => {
        const selectedPetId = petSelect.value;
        if (selectedPetId) {
            window.location.href = `/viewHistory/${selectedPetId}`;
        } else {
            alert("Por favor, selecciona una mascota.");
        }
    });
});