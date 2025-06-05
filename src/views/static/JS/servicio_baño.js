document.addEventListener("DOMContentLoaded", () => {
    cargarMascotas();
    cargarBanosAgendados();

    document.getElementById("agendar-bano").addEventListener("click", () => {
        agendarBano();
    });
});

// Cargar mascotas en el selector
async function cargarMascotas() {
    try {
        const response = await fetch("/getMyPets");
        if (response.ok) {
            const pets = await response.json();
            const petSelect = document.getElementById("bano-mascota");
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

// Agendar baño
async function agendarBano() {
    const idPet = document.getElementById("bano-mascota").value;
    const fecha = document.getElementById("bano-fecha").value;
    const hora = document.getElementById("bano-hora").value;
    const comentarios = document.getElementById("bano-comentarios").value;

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
        const response = await fetch("/api/bano", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Baño agendado con éxito.");
            cargarBanosAgendados();
        } else {
            alert("Error al agendar el baño.");
        }
    } catch (error) {
        console.error("Error al agendar el baño:", error);
    }
}

// Cargar baños agendados
async function cargarBanosAgendados() {
    try {
        const response = await fetch("/api/getBanos");
        if (response.ok) {
            const banos = await response.json();
            const tbody = document.getElementById("tabla-banos").querySelector("tbody");
            tbody.innerHTML = "";
            banos.forEach(bano => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${bano.pet_name}</td>
                    <td>${bano.fecha}</td>
                    <td>${bano.hora}</td>
                    <td>${bano.comentarios}</td>
                    <td><button class="cancelar" onclick="cancelarBano(${bano.id_appointment})">Cancelar</button></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error("Error al cargar los baños agendados.");
        }
    } catch (error) {
        console.error("Error al cargar los baños agendados:", error);
    }
}

// Cancelar baño
async function cancelarBano(idAppointment) {
    try {
        const response = await fetch(`/api/cancelBano/${idAppointment}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Baño cancelado con éxito.");
            cargarBanosAgendados();
        } else {
            alert("Error al cancelar el baño.");
        }
    } catch (error) {
        console.error("Error al cancelar el baño:", error);
    }
}
