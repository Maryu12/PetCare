document.addEventListener("DOMContentLoaded", ()=> {
    CargarMascotas();
    CargarVeterinarios();

    document.getElementById("btn-agendar").addEventListener("click", () => {
        AgendarCita();
    });
});

async function CargarMascotas(){
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
}

async function CargarVeterinarios() {
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
}

async function AgendarCita() {
    const id_pet = document.getElementById("petSelect").value;
    const id_veterinarian = document.getElementById("vetSelect").value;
    const fecha_cita = document.getElementById("fecha-cita").value;
    const hora_cita = document.getElementById("hora-cita").value;
    const comentarios = document.getElementById("comentarios").value;

    if (!id_pet || !id_veterinarian || !fecha_cita || !hora_cita) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }

    try {
        const response = await fetch("/api/control", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_pet,
                id_veterinarian,
                fecha_cita,
                hora_cita,
                comentarios
            })
        });

        if (response.ok) {
            alert("Cita agendada exitosamente.");
            // Aquí podrías recargar la lista de citas o redirigir a otra página
        } else {
            console.error("Error al agendar la cita:", response.statusText);
            alert("No se pudo agendar la cita. Inténtalo de nuevo más tarde.");
        }
    } catch (error) {
        console.error("Error al enviar la solicitud:", error);
        alert("Ocurrió un error al agendar la cita. Por favor, inténtalo de nuevo.");
    }
}

// Modales

function abrirModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function cerrarModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

window.onclick = function (event) {
  const modales = document.querySelectorAll(".modal");
  modales.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};