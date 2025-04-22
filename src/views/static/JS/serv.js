document.addEventListener("DOMContentLoaded", function () {
    const botones = document.querySelectorAll(".elemento");
    const modales = document.querySelectorAll(".modal");
    const cierres = document.querySelectorAll(".close");

    // Mostrar modal clic en botón
    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const modalId = boton.getAttribute("data-modal");
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = "block";
        });
    });

    // Cerrar modal
    cierres.forEach(cerrar => {
        cerrar.addEventListener("click", () => {
            cerrar.closest(".modal").style.display = "none";
        });
    });

    // Cerrar modal clic fuera del contenido
    window.addEventListener("click", (event) => {
        modales.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });
});

function abrirModal(id) {
    document.getElementById(id).style.display = 'block';
}

function cerrarModal(id) {
const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';

        // Limpia los campos del formulario si el modal es "modal-veterinarios"
        if (id === 'modal-veterinarios') {
            document.getElementById("veterinarios-preferido").value = "";
            document.getElementById("veterinarios-notas").value = "";
            const confirmacion = document.getElementById("veterinarios-confirmacion");
            confirmacion.style.display = "none";
            confirmacion.innerHTML = ""; // Limpia el contenido del mensaje
        }
    }
}

  // Cierra el modal si se hace clic fuera de él
window.onclick = function(event) {
const modales = document.getElementsByClassName('modal');
for (let i = 0; i < modales.length; i++) {
    if (event.target === modales[i]) {
    modales[i].style.display = 'none';

    // Limpia los campos del formulario si el modal es "modal-veterinarios"
    if (modales[i].id === 'modal-veterinarios') {
        document.getElementById("veterinarios-preferido").value = "";
        document.getElementById("veterinarios-notas").value = "";
        const confirmacion = document.getElementById("veterinarios-confirmacion");
        confirmacion.style.display = "none";
        confirmacion.innerHTML = ""; // Limpia el contenido del mensaje
    }
    }
}
};

function sendVeterinariosData() {
    const veterinario = document.getElementById("veterinarios-preferido").value;
    const notas = document.getElementById("veterinarios-notas").value;

    if (!veterinario || !notas) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return;
    }

    const confirmacion = document.getElementById("veterinarios-confirmacion");
    confirmacion.innerHTML = `
        <p>¡Se logró reservar el servicio correctamente!</p>
        <p><strong>Veterinario:</strong> ${veterinario}</p>
        <p><strong>Descripción:</strong> ${notas}</p>
    `;
    confirmacion.style.display = "block";

    // Opcional: Limpiar los campos después de enviar
    document.getElementById("veterinarios-preferido").value = "";
    document.getElementById("veterinarios-notas").value = "";
}

