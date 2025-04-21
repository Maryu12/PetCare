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
});