document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Realizar una solicitud al backend para obtener la lista de mascotas
        const response = await fetch("/getMyPets");
        if (response.ok) {
            const pets = await response.json();
            const petSelect = document.getElementById("petSelect");

            // Limpiar el desplegable antes de llenarlo
            petSelect.innerHTML = "";

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
});