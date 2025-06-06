document.addEventListener("DOMContentLoaded", async () => {
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