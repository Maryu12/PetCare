console.log("about.js cargado");
function abrirModal(id) {
  console.log("about.js cargado");
    document.getElementById(id).style.display = 'block';
  }

  function cerrarModal(id) {
    console.log("about.js cargado");
    document.getElementById(id).style.display = 'none';
  }

  // Cierra el modal si se hace clic fuera de él
  window.onclick = function(event) {
    console.log("about.js cargado");
    const modales = document.getElementsByClassName('modal');
    for (let i = 0; i < modales.length; i++) {
      if (event.target === modales[i]) {
        modales[i].style.display = 'none';
      }
    }
  };

  async function cargarMascotas() {
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
}

async function cargarVeterinarios() {
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
}

window.addEventListener("DOMContentLoaded", () => {
    cargarMascotas();
    cargarVeterinarios();
});