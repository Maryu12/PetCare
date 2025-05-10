function abrirModal(id) {
    document.getElementById(id).style.display = 'block';
  }

  function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
  }

  // Cierra el modal si se hace clic fuera de él
  window.onclick = function(event) {
    const modales = document.getElementsByClassName('modal');
    for (let i = 0; i < modales.length; i++) {
      if (event.target === modales[i]) {
        modales[i].style.display = 'none';
      }
    }
  };

  // Datos estáticos de vehículos disponibles
const vehiculosDisponibles = ["Vehículo 1", "Vehículo 2", "Vehículo 3", "Vehículo 4"];

// Función para cargar las solicitudes de transporte
async function cargarSolicitudesTransporte() {
    try {
        const response = await fetch("/api/getAppointments");
        if (response.ok) {
            const servicios = await response.json();
            console.log("Datos devueltos por el endpoint:", servicios); // Verifica los datos aquí
            const tablaVehiculos = document.getElementById("tabla-vehiculos");
            tablaVehiculos.innerHTML = ""; // Limpiar la tabla antes de llenarla

            // Filtrar servicios de transporte (id_service 1 o 5)
            const solicitudesTransporte = servicios;

            if (solicitudesTransporte.length === 0) {
                tablaVehiculos.innerHTML = `<tr><td colspan="7">No hay solicitudes de transporte.</td></tr>`;
                return;
            }

            solicitudesTransporte.forEach(servicio => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${servicio.id_appointment}</td>
                    <td>${servicio.pet_name}</td>
                    <td>${servicio.tipo_transporte}</td>
                    <td>${servicio.fecha_recogida}</td>
                    <td>${servicio.hora_recogida}</td>
                    <td>${servicio.comentarios}</td>
                    <td>
                        <select class="vehiculo-select">
                            <option value="">-- Seleccionar Vehículo --</option>
                            ${vehiculosDisponibles.map(vehiculo => `<option value="${vehiculo}">${vehiculo}</option>`).join("")}
                        </select>
                        <button class="asignar" onclick="asignarVehiculo(${servicio.id_appointment})">Asignar</button>
                    </td>
                `;
                tablaVehiculos.appendChild(row);
            });
        } else {
            console.error("Error al cargar las solicitudes de transporte.");
        }
    } catch (error) {
        console.error("Error al cargar las solicitudes de transporte:", error);
    }
}

// Función para asignar un vehículo
function asignarVehiculo(idAppointment) {
  const selectVehiculo = document.querySelector(`button[onclick="asignarVehiculo(${idAppointment})"]`)
      .previousElementSibling; // Encuentra el <select> que está antes del botón
  const vehiculoSeleccionado = selectVehiculo.value;

  if (!vehiculoSeleccionado) {
      alert("Por favor, selecciona un vehículo.");
      return;
  }

  alert(`Vehículo "${vehiculoSeleccionado}" asignado al servicio con ID ${idAppointment}.`);
}

// Llamar a la función para cargar las solicitudes de transporte al cargar la página
document.addEventListener("DOMContentLoaded", cargarSolicitudesTransporte);