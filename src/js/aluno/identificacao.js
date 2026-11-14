
const avaliacaoSalva = sessionStorage.getItem("avaliacaoAtual");

const areaIdentificacao = document.getElementById("areaIdentificacao");
const tituloAvaliacao = document.getElementById("tituloAvaliacao");
const formulario = document.getElementById("formIdentificacao");
const nomeInput = document.getElementById("nomeAluno");
const matriculaInput = document.getElementById("matriculaAluno");
const mensagem = document.getElementById("mensagemIdentificacao");

if (!avaliacaoSalva) {
    alert("Nenhuma avaliação foi importada.");
    window.location.href = "aluno.html";
} else {
    const avaliacao = JSON.parse(avaliacaoSalva);

    tituloAvaliacao.textContent = avaliacao.titulo;

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nome = nomeInput.value.trim();
        const matricula = matriculaInput.value.trim();

        if (!nome || !matricula) {
            mensagem.textContent = "Preencha seu nome e sua matrícula.";
            return;
        }

        const aluno = {
            nome: nome,
            matricula: matricula
        };

        sessionStorage.setItem("alunoAtual", JSON.stringify(aluno));

        areaIdentificacao.hidden = true;
        document.getElementById("areaProva").hidden = false;

        // Avisa ao arquivo prova.js que o aluno foi identificado
        document.dispatchEvent(new Event("alunoIdentificado"));
    });
}
