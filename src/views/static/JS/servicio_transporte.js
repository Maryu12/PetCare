document.addEventListener("DOMContentLoaded", () => {
    cargarMascotas();
    cargarServiciosAgendados();

    document.getElementById("agendar-transporte").addEventListener("click", () => {
        agendarTransporte();
    });
});

// Cargar mascotas en el selector
async function cargarMascotas() {
    try {
        const response = await fetch("/getMyPets");
        if (response.ok) {
            const pets = await response.json();
            const petSelect = document.getElementById("transporte-mascota");
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

// Agendar transporte
async function agendarTransporte() {
    const idPet = document.getElementById("transporte-mascota").value;
    const tipoTransporte = document.getElementById("transporte-tipo").value;
    const fechaRecogida = document.getElementById("transporte-fecha").value;
    const horaRecogida = document.getElementById("transporte-hora").value;
    const comentarios = document.getElementById("transporte-comentarios").value;

    if (!idPet || !tipoTransporte || !fechaRecogida || !horaRecogida) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }

    const data = {
        id_pet: idPet,
        tipo_transporte: tipoTransporte,
        fecha_recogida: fechaRecogida,
        hora_recogida: horaRecogida,
        comentarios: comentarios
    };

    try {
        const response = await fetch("/api/transporte", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Transporte agendado con éxito.");
            cargarServiciosAgendados();
        } else {
            alert("Error al agendar el transporte.");
        }
    } catch (error) {
        console.error("Error al agendar el transporte:", error);
    }
}

// Cargar servicios agendados
async function cargarServiciosAgendados() {
    try {
        const response = await fetch("/api/getAppointments");
        if (response.ok) {
            const servicios = await response.json();
            const tbody = document.getElementById("tabla-servicios").querySelector("tbody");
            tbody.innerHTML = ""; // Limpiar la tabla antes de llenarla

            servicios.forEach(servicio => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${servicio.pet_name}</td>
                    <td>${servicio.tipo_transporte}</td>
                    <td>${servicio.fecha_recogida}</td>
                    <td>${servicio.hora_recogida}</td>
                    <td>${servicio.comentarios}</td>
                    <td><button class="cancelar" onclick="cancelarServicio(${servicio.id_appointment})">Cancelar</button></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error("Error al cargar los servicios agendados.");
        }
    } catch (error) {
        console.error("Error al cargar los servicios agendados:", error);
    }
}

// Cancelar servicio
async function cancelarServicio(idAppointment) {
    try {
        const response = await fetch(`/api/cancelAppointment/${idAppointment}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Servicio cancelado con éxito.");
            cargarServiciosAgendados();
        } else {
            alert("Error al cancelar el servicio.");
        }
    } catch (error) {
        console.error("Error al cancelar el servicio:", error);
    }
}