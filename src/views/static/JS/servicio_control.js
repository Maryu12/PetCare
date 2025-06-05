document.addEventListener("DOMContentLoaded", () => {
    cargarMascotas();
    cargarControlesAgendados();

    document.getElementById("agendar-control").addEventListener("click", () => {
        agendarControl();
    });
}); 

// Cargar mascotas en el selector
async function cargarMascotas() {
    try {
        const response = await fetch("/getMyPets");
        if (response.ok) {
            const pets = await response.json();
            const petSelect = document.getElementById("control-mascota");
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

// Agendar control
async function agendarBano() {
    const idPet = document.getElementById("control-mascota").value;
    const fecha = document.getElementById("control-fecha").value;
    const hora = document.getElementById("control-hora").value;
    const comentarios = document.getElementById("control-comentarios").value;

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
        const response = await fetch("/api/control", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Control agendado con éxito.");
            cargarBanosAgendados();
        } else {
            alert("Error al agendar el Control.");
        }
    } catch (error) {
        console.error("Error al agendar el Control:", error);
    }
}

// Cargar controles agendados
async function cargarControlesAgendados() {
    try {
        const response = await fetch("/api/getControles");
        if (response.ok) {
            const controles = await response.json();
            const tbody = document.getElementById("tabla-controles").querySelector("tbody");
            tbody.innerHTML = "";
            controles.forEach(control => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${control.pet_name}</td>
                    <td>${control.fecha}</td>
                    <td>${control.hora}</td>
                    <td>${control.comentarios}</td>
                    <td><button class="cancelar" onclick="cancelarControl(${control.id_appointment})">Cancelar</button></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error("Error al cargar los controles agendados.");
        }
    } catch (error) {
        console.error("Error al cargar los controles agendados:", error);
    }
}

// Cancelar control
async function cancelarControl(idAppointment) {
    try {
        const response = await fetch(`/api/cancelControl/${idAppointment}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Control cancelado con éxito.");
            cargarBanosAgendados();
        } else {
            alert("Error al cancelar el Control.");
        }
    } catch (error) {
        console.error("Error al cancelar el Control:", error);
    }
}
