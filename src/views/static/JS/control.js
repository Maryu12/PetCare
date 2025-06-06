document.addEventListener("DOMContentLoaded", async () => {
    // Mascotas
    try {
        const response = await fetch("/getMyPets");
        if (response.ok) {
            const pets = await response.json();
            const petSelect = document.getElementById("petSelect");
            petSelect.innerHTML = '<option value="">Elegir una mascota</option>';
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

    // Veterinarios
    try {
        const response = await fetch("/getVeterinarians");
        if (response.ok) {
            const vets = await response.json();
            const vetSelect = document.getElementById("vetSelect");
            vetSelect.innerHTML = '<option value="">Elegir un veterinario</option>';
            vets.forEach(vet => {
                const option = document.createElement("option");
                option.value = vet.id_veterinarian;
                option.textContent = `${vet.name_vet} ${vet.last_name} - ${vet.description}`;
                vetSelect.appendChild(option);
            });
        } else {
            console.warn("No se pudo obtener la lista de veterinarios.");
        }
    } catch (error) {
        console.error("Error al cargar la lista de veterinarios:", error);
    }
});