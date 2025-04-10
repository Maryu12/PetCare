/* filepath: c:\Users\trivi\Desktop\Programacion\Code\Milenzo\Milenzo_dev\Milenzo\src\static\js\addPet.js */
function cambiarFormulario(formulario) {
    document.getElementById("formOwner").classList.remove("active");
    document.getElementById("formPatient").classList.remove("active");
    document.getElementById(formulario).classList.add("active");

    document.getElementById("btnOwner_details").classList.remove("active");
    document.getElementById("btnPatient_details").classList.remove("active");
    document.getElementById(formulario === "formOwner" ? "btnOwner_details" : "btnPatient_details").classList.add("active");
}