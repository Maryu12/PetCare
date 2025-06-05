document.addEventListener("DOMContentLoaded", () => {
    cargarMascotas();
    cargarConsultasAgendadas();

    document.getElementById("agendar-consulta").addEventListener("click", () => {
        agendarConsulta();
    });
});

// Cargar mascotas en el selector
async function cargarMascotas() {
    try {
        const response = await fetch("/getMyPets");
        if (response.ok) {
            const pets = await response.json();
            const petSelect = document.getElementById("consulta-mascota");
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

// Agendar consulta
async function agendarConsulta() {
    const idPet = document.getElementById("consulta-mascota").value;
    const fecha = document.getElementById("consulta-fecha").value;
    const hora = document.getElementById("consulta-hora").value;
    const comentarios = document.getElementById("consulta-comentarios").value;

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
        const response = await fetch("/api/consulta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Consulta agendada con éxito.");
            cargarBanosAgendados();
        } else {
            alert("Error al agendar la Consulta.");
        }
    } catch (error) {
        console.error("Error al agendar la consulta:", error);
    }
}

// Cargar consultas agendadas
async function cargarConsultasAgendadas() {
    try {
        const response = await fetch("/api/getConsultas");
        if (response.ok) {
            const consultas = await response.json();
            const tbody = document.getElementById("tabla-consultas").querySelector("tbody");
            tbody.innerHTML = "";
            consultas.forEach(consulta => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${consulta.pet_name}</td>
                    <td>${consulta.fecha}</td>
                    <td>${consulta.hora}</td>
                    <td>${consulta.comentarios}</td>
                    <td><button class="cancelar" onclick="cancelarConsulta(${consulta.id_appointment})">Cancelar</button></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error("Error al cargar las consultas agendadas.");
        }
    } catch (error) {
        console.error("Error al cargar los consultas agendadas:", error);
    }
}

// Cancelar consulta
async function cancelarConsulta(idAppointment) {
    try {
        const response = await fetch(`/api/cancelConsulta/${idAppointment}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Consulta cancelado con éxito.");
            cargarConsultasAgendadas();
        } else {
            alert("Error al cancelar la consulta.");
        }
    } catch (error) {
        console.error("Error al cancelar la consulta:", error);
    }
}
