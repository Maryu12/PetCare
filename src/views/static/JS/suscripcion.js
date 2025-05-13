
function redirigirASuscripcion(plan) {
    
    window.location.button = `/suscripcion?plan=${encodeURIComponent(plan)}`;
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    if (plan) {
        document.getElementById('plan').value = plan;
    }
}
  const params = new URLSearchParams(window.location.search);
  const planSeleccionado = params.get("plan");

  if (planSeleccionado) {
    document.getElementById("plan").value = planSeleccionado;
  }

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get("plan");
    if (plan) {
        document.getElementById("plan").value = plan;
    }
});