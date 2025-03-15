const container = document.getElementById('container');
const signUpButton = document.getElementById('register');
const signInButton = document.getElementById('login');

signUpButton.addEventListener('click', () => {
    container.classList.add('active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('active');
});