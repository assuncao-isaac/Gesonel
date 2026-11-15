
const formulario = document.getElementById("formAcessoProfessor");

const campoSenha = document.getElementById("senhaProfessor");

const mensagemErro = document.getElementById("mensagemErro");

// Senha temporária do professor
const senhaCorreta = "Prof2026@Avalia";

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const senhaDigitada = campoSenha.value;

    if (senhaDigitada === senhaCorreta) {

        // Libera o acesso nesta sessão do navegador
        sessionStorage.setItem("acessoProfessor", "autorizado");

        window.location.href = "professor.html";

    } else {

        mensagemErro.textContent = "Senha incorreta. Tente novamente.";

        campoSenha.value = "";
        campoSenha.focus();
    }
});
