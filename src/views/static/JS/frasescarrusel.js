document.addEventListener("DOMContentLoaded", function () {
    const frases = document.querySelectorAll("#frase-slide p");
    let indice = 0;
  
    function mostrarFrase() {
      frases.forEach((frase, i) => {
        frase.style.opacity = i === indice ? "1" : "0";
      });
  
      indice = (indice + 1) % frases.length;
    }
  
    // Mostrar la primera inmediatamente
    mostrarFrase();
  
    // Cambiar cada 5 segundos (5000 ms)
    setInterval(mostrarFrase, 5000);
  });
  
