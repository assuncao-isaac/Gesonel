
const tituloAvaliacao = document.getElementById("tituloAvaliacao");
const totalAlunos = document.getElementById("totalAlunos");
const listaResultados = document.getElementById("listaResultadosAlunos");
const seletorHistorico = document.getElementById("seletorHistorico");

const detalhesAluno = document.getElementById("detalhesAluno");
const informacoesResultado = document.getElementById("informacoesResultado");
const resumoResultado = document.getElementById("resumoResultado");
const listaQuestoes = document.getElementById("listaResultadoQuestoes");

// Recupera os dados salvos
const resultadosSalvos = JSON.parse(
    localStorage.getItem("resultadosProfessor") || "[]"
);

const avaliacoes = JSON.parse(
    localStorage.getItem("avaliacoesProfessor") || "[]"
);

// Recupera o resultado recém-importado, se existir
const resultadoAtual = JSON.parse(
    sessionStorage.getItem("resultadoAtual") || "null"
);

// Identifica avaliações que possuem resultados
const idsAvaliacoes = [
    ...new Set(resultadosSalvos.map(resultado => resultado.avaliacaoId))
];

// Preenche o seletor com as avaliações corrigidas
idsAvaliacoes.forEach(id => {

    const avaliacao = avaliacoes.find(item => item.id === id);

    if (!avaliacao) return;

    const opcao = document.createElement("option");

    opcao.value = avaliacao.id;
    opcao.textContent = avaliacao.titulo;

    seletorHistorico.appendChild(opcao);
});

// Quando o professor escolhe uma avaliação
seletorHistorico.addEventListener("change", function() {

    if (!seletorHistorico.value) {
        listaResultados.innerHTML = "";
        tituloAvaliacao.textContent = "Avaliação";
        totalAlunos.textContent = "";
        detalhesAluno.style.display = "none";
        return;
    }

    carregarResultados(seletorHistorico.value);
});

// Carrega os resultados de uma avaliação específica
function carregarResultados(avaliacaoId) {

    const avaliacao = avaliacoes.find(
        item => item.id === avaliacaoId
    );

    if (!avaliacao) return;

    const resultadosDaAvaliacao = resultadosSalvos.filter(
        resultado => resultado.avaliacaoId === avaliacaoId
    );

    tituloAvaliacao.textContent = avaliacao.titulo;

    totalAlunos.textContent =
        "Total de alunos avaliados: " + resultadosDaAvaliacao.length;

    listaResultados.innerHTML = "";
    detalhesAluno.style.display = "none";

    resultadosDaAvaliacao.forEach(resultado => {

        const linha = document.createElement("tr");

       const segundos = Number(resultado.tempoUtilizado) || 0;
       const minutos = Math.floor(segundos / 60);
       const segundosRestantes = segundos % 60;

       const tempoFormatado =
        String(minutos).padStart(2, "0") + ":" +
        String(segundosRestantes).padStart(2, "0");

       const dados = [
        resultado.aluno.nome,
        resultado.aluno.matricula,
        resultado.acertos,
        resultado.erros,
        resultado.semResposta ?? 0,
        Number(resultado.nota).toFixed(2),
        tempoFormatado
    ];
        
        dados.forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaDetalhes = document.createElement("td");
        const botaoDetalhes = document.createElement("button");

        botaoDetalhes.type = "button";
        botaoDetalhes.textContent = "Consultar";
        botaoDetalhes.className = "botao-detalhes";

        botaoDetalhes.addEventListener("click", function() {
            mostrarDetalhes(resultado, avaliacao);
        });

        celulaDetalhes.appendChild(botaoDetalhes);
        linha.appendChild(celulaDetalhes);

        listaResultados.appendChild(linha);
    });
}

// Exibe a correção individual
function mostrarDetalhes(resultado, avaliacao) {

    detalhesAluno.style.display = "block";

    informacoesResultado.innerHTML = "";
    resumoResultado.innerHTML = "";
    listaQuestoes.innerHTML = "";

    const nome = document.createElement("h3");
    nome.textContent = resultado.aluno.nome;

    const matricula = document.createElement("p");
    matricula.textContent =
        "Matrícula: " + resultado.aluno.matricula;

    informacoesResultado.appendChild(nome);
    informacoesResultado.appendChild(matricula);

    const resumo = document.createElement("p");

    resumo.textContent =
        "Nota: " + Number(resultado.nota).toFixed(2) +
        " | Acertos: " + resultado.acertos +
        " | Erros: " + resultado.erros +
        " | Em branco: " + (resultado.semResposta ?? 0);

    resumoResultado.appendChild(resumo);

    resultado.questoes.forEach((questaoResultado, indice) => {

        const questaoOriginal = avaliacao.questoes.find(
            item => item.id === questaoResultado.questaoId
        );

        if (!questaoOriginal) return;

        const bloco = document.createElement("div");
        bloco.className = "questao-professor";

        const titulo = document.createElement("h3");
        titulo.textContent = "Questão " + (indice + 1);

        const enunciado = document.createElement("p");
        enunciado.textContent = questaoResultado.enunciado;

        const situacao = document.createElement("p");

        if (questaoResultado.semResposta) {
            situacao.textContent = "Situação: Não respondida";
        } else if (questaoResultado.acertou) {
            situacao.textContent = "Situação: Resposta correta";
        } else {
            situacao.textContent = "Situação: Resposta incorreta";
        }

        const alternativaAluno = questaoOriginal.alternativas.find(
            alternativa =>
                alternativa.id === questaoResultado.alternativaSelecionada
        );

        const alternativaCorreta = questaoOriginal.alternativas.find(
            alternativa =>
                alternativa.id === questaoResultado.alternativaCorreta
        );

        const respostaAluno = document.createElement("p");

        respostaAluno.textContent = questaoResultado.semResposta
            ? "Resposta do aluno: Não respondeu"
            : "Resposta do aluno: " +
              (alternativaAluno
                  ? alternativaAluno.id + ") " + alternativaAluno.texto
                  : "Alternativa não localizada");

        const respostaCorreta = document.createElement("p");

        respostaCorreta.textContent =
            "Gabarito: " +
            (alternativaCorreta
                ? alternativaCorreta.id + ") " + alternativaCorreta.texto
                : "Alternativa não localizada");

        bloco.appendChild(titulo);
        bloco.appendChild(enunciado);
        bloco.appendChild(situacao);
        bloco.appendChild(respostaAluno);
        bloco.appendChild(respostaCorreta);

        listaQuestoes.appendChild(bloco);
    });

    detalhesAluno.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Se a página foi aberta após uma correção,
// já seleciona a avaliação correspondente.
if (resultadoAtual) {

    seletorHistorico.value = resultadoAtual.avaliacaoId;

    if (seletorHistorico.value) {
        carregarResultados(resultadoAtual.avaliacaoId);
        mostrarDetalhes(
            resultadoAtual,
            avaliacoes.find(
                item => item.id === resultadoAtual.avaliacaoId
            )
        );
    }

} else if (idsAvaliacoes.length === 0) {

    totalAlunos.textContent =
        "Ainda não existem avaliações corrigidas.";

}
