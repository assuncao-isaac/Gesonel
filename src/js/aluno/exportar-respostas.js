
const botaoFinalizar = document.getElementById("btnFinalizar");

botaoFinalizar.addEventListener("click", () => {

    botaoFinalizar.disabled = true;
    botaoFinalizar.textContent = "Finalizando...";

    // Encerra o cronômetro
    document.dispatchEvent(new Event("finalizarAvaliacao"));

    const avaliacao = JSON.parse(
        sessionStorage.getItem("avaliacaoAtual")
    );

    const aluno = JSON.parse(
        sessionStorage.getItem("alunoAtual")
    );

    const respostasSalvas = JSON.parse(
        sessionStorage.getItem("respostasAluno") || "{}"
    );

    const tempoUtilizado = Number(
        sessionStorage.getItem("tempoUtilizado") || 0
    );

    const respostas = avaliacao.questoes.map(questao => ({
        questaoId: questao.id,
        alternativaSelecionada: respostasSalvas[questao.id] || null
    }));

    const arquivoRespostas = {
        tipo: "respostas",
        versao: 1,
        avaliacaoId: avaliacao.id,
        tentativaId: "ATT-" + Date.now(),
        aluno: {
            nome: aluno.nome,
            matricula: aluno.matricula
        },
        respostas: respostas,
        tempoUtilizado: tempoUtilizado,
        dataRealizacao: new Date().toISOString()
    };

    const arquivo = new Blob(
        [JSON.stringify(arquivoRespostas, null, 4)],
        { type: "application/json" }
    );

    const endereco = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = endereco;
    link.download = "respostas.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Libera o endereço e encaminha para a conclusão
    setTimeout(() => {
        URL.revokeObjectURL(endereco);

        window.location.href = "avaliacao-finalizada.html";
    }, 500);

});
