document.addEventListener("DOMContentLoaded", function () {
  // Obtener parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get("plan");
  const precio = urlParams.get("precio");

  // Colores por plan
  const planColors = {
    'premium': '#d4af37',
    'estandar': '#66A6A6',
    'basico': '#A2E0DC'
  };

  // Mostrar información del plan seleccionado
  if (plan) {
    const planKey = plan.toLowerCase();
    const planNames = {
      'premium': 'Premium',
      'estandar': 'Estándar',
      'basico': 'Básico'
    };

    // Nombre del plan
    if (document.getElementById("selected-plan-name")) {
      document.getElementById("selected-plan-name").textContent = planNames[planKey] || "";
    }

    // Formatear el precio solo si es un número válido
    let formattedPrice = "";
    if (precio && !isNaN(precio)) {
      formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(Number(precio));
    }

    // Mostrar el precio en todos los elementos .price-plan
    document.querySelectorAll(".price-plan").forEach(el => {
      el.textContent = formattedPrice ? `${formattedPrice}/mes` : "";
    });

    // Cambiar color del borde izquierdo del plan seleccionado
    const planSelected = document.querySelector('.plan-selected');
    if (planSelected && planColors[planKey]) {
      planSelected.style.borderLeft = `4px solid ${planColors[planKey]}`;
    }

    // Cambiar color del botón de suscripción
    const subscribeBtn = document.querySelector('.subscribe-button');
    if (subscribeBtn && planColors[planKey]) {
      subscribeBtn.style.backgroundColor = planColors[planKey];
      subscribeBtn.onmouseover = function() {
        this.style.backgroundColor = shadeColor(planColors[planKey], -10);
      };
      subscribeBtn.onmouseout = function() {
        this.style.backgroundColor = planColors[planKey];
      };
    }

    // Agregar campo oculto con el plan seleccionado si no existe
    if (!document.querySelector('input[name="plan"]')) {
      const hiddenPlanInput = document.createElement('input');
      hiddenPlanInput.type = 'hidden';
      hiddenPlanInput.name = 'plan';
      hiddenPlanInput.value = plan;
      document.getElementById("suscripcion-form").appendChild(hiddenPlanInput);
    }
  }
});

// Utilidad para oscurecer el color en hover
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  const RR = ((R.toString(16).length==1)?"0":"") + R.toString(16);
  const GG = ((G.toString(16).length==1)?"0":"") + G.toString(16);
  const BB = ((B.toString(16).length==1)?"0":"") + B.toString(16);

  return "#" + RR + GG + BB;
}