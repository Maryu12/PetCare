document.addEventListener("DOMContentLoaded", () => {
    cargarMascotas();
    cargarGuarderiasAgendadas();

    document.getElementById("agendar-guarderia").addEventListener("click", () => {
        agendarGuarderia();
    }); 
});

// Cargar mascotas en el selector
async function cargarMascotas() {
    try {
        const response = await fetch("/getMyPets");
        if (response.ok) {
            const pets = await response.json();
            const petSelect = document.getElementById("guarderia-mascota");
            petSelect.innerHTML = '<option value="">-- Selecciona una mascota --</option>';
            pets.forEach(pet => {
                const option = document.createElement("option");
                option.value = pet.id_pet;
                option.textContent = `${pet.pet_name} - ${pet.species}`;
                petSelect.appendChild(option);
            });
        } else {
            console.error("Error al cargar las mascotas.");
        }
    } catch (error) {
        console.error("Error al cargar las mascotas:", error);
    }
}

// Agendar guardería
async function agendarGuarderia() {
    const idPet = document.getElementById("guarderia-mascota").value;
    const fecha = document.getElementById("guarderia-fecha").value;
    const hora = document.getElementById("guarderia-hora").value;
    const comentarios = document.getElementById("guarderia-comentarios").value;

    if (!idPet || !fecha || !hora) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }

    const data = {
        id_pet: idPet,
        fecha: fecha,
        hora: hora,
        comentarios: comentarios
    };

    try {
        const response = await fetch("/api/guarderia", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Guarderia agendado con éxito.");
            cargarBanosAgendados();
        } else {
            alert("Error al agendar la Guarderia.");
        }
    } catch (error) {
        console.error("Error al agendar la Guarderia:", error);
    }
}

// Cargar guarderias agendados
async function cargarGuarderiasAgendadas() {
    try {
        const response = await fetch("/api/getGuarderias");
        if (response.ok) {
            const guarderias = await response.json();
            const tbody = document.getElementById("tabla-guarderias").querySelector("tbody");
            tbody.innerHTML = "";
            guarderias.forEach(guarderia => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${guarderia.pet_name}</td>
                    <td>${guarderia.fecha}</td>
                    <td>${guarderia.hora}</td>
                    <td>${guarderia.comentarios}</td>
                    <td><button class="cancelar" onclick="cancelarGuarderia(${guarderia.id_appointment})">Cancelar</button></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error("Error al cargar las guarderias agendadas.");
        }
    } catch (error) {
        console.error("Error al cargar las guarderias agendadas:", error);
    }
}

// Cancelar guardería
async function cancelarGuarderia(idAppointment) {
    try {
        const response = await fetch(`/api/cancelGuarderia/${idAppointment}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Guarderia cancelado con éxito.");
            cargarBanosAgendados();
        } else {
            alert("Error al cancelar la guarderia.");
        }
    } catch (error) {
        console.error("Error al cancelar la guarderia:", error);
    }
}
