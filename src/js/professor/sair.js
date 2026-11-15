
const botaoSair = document.getElementById("btnSairProfessor");

if (botaoSair) {
    botaoSair.addEventListener("click", function() {
        sessionStorage.removeItem("acessoProfessor");

        window.location.replace("../../index.html");
    });
}
