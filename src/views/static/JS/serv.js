
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
