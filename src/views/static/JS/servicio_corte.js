document.addEventListener("DOMContentLoaded", () => {
    cargarMascotas();
    cargarCortesAgendados();

    document.getElementById("agendar-corte").addEventListener("click", () => {
        agendarCorte();
    });
}); 

// Cargar mascotas en el selector
async function cargarMascotas() {
    try {
        const response = await fetch("/getMyPets");
        if (response.ok) {
            const pets = await response.json();
            const petSelect = document.getElementById("corte-mascota");
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

// Agendar corte
async function agendarCorte() {
    const idPet = document.getElementById("corte-mascota").value;
    const fecha = document.getElementById("corte-fecha").value;
    const hora = document.getElementById("corte-hora").value;
    const comentarios = document.getElementById("corte-comentarios").value;

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
        const response = await fetch("/api/corte", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Corte agendado con éxito.");
            cargarBanosAgendados();
        } else {
            alert("Error al agendar el Corte.");
        }
    } catch (error) {
        console.error("Error al agendar el Corte:", error);
    }
}

// Cargar cortes agendados
async function cargarCortessAgendados() {
    try {
        const response = await fetch("/api/getCortes");
        if (response.ok) {
            const cortes = await response.json();
            const tbody = document.getElementById("tabla-cortes").querySelector("tbody");
            tbody.innerHTML = "";
            cortes.forEach(corte => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${corte.pet_name}</td>
                    <td>${corte.fecha}</td>
                    <td>${corte.hora}</td>
                    <td>${corte.comentarios}</td>
                    <td><button class="cancelar" onclick="cancelarCorte(${corte.id_appointment})">Cancelar</button></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error("Error al cargar los cortes agendados.");
        }
    } catch (error) {
        console.error("Error al cargar los cortes agendados:", error);
    }
}

// Cancelar Corte
async function cancelarCorte(idAppointment) {
    try {
        const response = await fetch(`/api/cancelCorte/${idAppointment}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Corte cancelado con éxito.");
            cargarBanosAgendados();
        } else {
            alert("Error al cancelar el Corte.");
        }
    } catch (error) {
        console.error("Error al cancelar el Corte:", error);
    }
}
