const container = document.getElementById('container');
const signUpButton = document.getElementById('register');
const signInButton = document.getElementById('login');

signUpButton.addEventListener('click', () => {
    container.classList.add('active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('active');
});

// Mostrar/ocultar formularios basado en errores
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const showRegister = urlParams.get('show_register');
    
    if (showRegister || document.querySelector('.alert.error')) {
        document.getElementById('container').classList.add('active');
    }
});