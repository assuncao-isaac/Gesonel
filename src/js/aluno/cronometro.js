
let inicio = null;
let intervalo = null;
let tempoUtilizado = 0;

const cronometro = document.getElementById("cronometro");

function atualizarCronometro() {
    tempoUtilizado = Math.floor((Date.now() - inicio) / 1000);

    const horas = Math.floor(tempoUtilizado / 3600);
    const minutos = Math.floor((tempoUtilizado % 3600) / 60);
    const segundos = tempoUtilizado % 60;

    cronometro.textContent =
        `${String(horas).padStart(2, "0")}:` +
        `${String(minutos).padStart(2, "0")}:` +
        `${String(segundos).padStart(2, "0")}`;

    sessionStorage.setItem("tempoUtilizado", tempoUtilizado);
}

// O cronômetro começa quando o aluno inicia a avaliação
document.addEventListener("alunoIdentificado", () => {
    if (intervalo !== null) return;

    inicio = Date.now();

    atualizarCronometro();

    intervalo = setInterval(atualizarCronometro, 1000);
});
