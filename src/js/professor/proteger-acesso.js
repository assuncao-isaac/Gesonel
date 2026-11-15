
function verificarAcessoProfessor() {
    const acessoAutorizado =
        sessionStorage.getItem("acessoProfessor");

    if (acessoAutorizado !== "autorizado") {
        window.location.replace("acesso-professor.html");
        return false;
    }

    return true;
}

// Verifica ao carregar
if (!verificarAcessoProfessor()) {
    // Interrompe a execução deste script
} else {
    // Verifica quando a página retorna pelo histórico
    window.addEventListener("pageshow", function() {
        verificarAcessoProfessor();
    });
}
