
(function () {
    "use strict";

    const botaoFinalizar = document.getElementById("btnFinalizar");

    // Dados da prova em andamento, apagados ao finalizar
    const CHAVES_DA_PROVA = [
        "avaliacaoAtual",
        "alunoAtual",
        "respostasAluno",
        "tempoUtilizado",
        "inicioAvaliacao",
        "questaoAtual",
        "nomeArquivoAvaliacao"
    ];

    function lerJson(chave, padrao) {
        try {
            const valor = JSON.parse(sessionStorage.getItem(chave));
            return valor === null || valor === undefined ? padrao : valor;
        } catch (erro) {
            return padrao;
        }
    }

    // Função responsável pelo download do JSON
    function baixarArquivo(conteudo, nomeArquivo) {
        const arquivo = new Blob(
            [conteudo],
            { type: "application/json" }
        );

        const endereco = URL.createObjectURL(arquivo);
        const link = document.createElement("a");

        link.href = endereco;
        link.download = nomeArquivo;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(endereco);
        }, 1000);
    }

    botaoFinalizar.addEventListener("click", () => {

        const avaliacao = lerJson("avaliacaoAtual", null);
        const aluno = lerJson("alunoAtual", null);

        if (!avaliacao || !aluno) {
            alert("Não foi possível finalizar: os dados da prova não foram encontrados.");
            window.location.href = "aluno.html";
            return;
        }

        botaoFinalizar.disabled = true;
        botaoFinalizar.textContent = "Finalizando...";

        // Encerra o cronômetro
        document.dispatchEvent(new Event("finalizarAvaliacao"));

        const respostasSalvas = lerJson("respostasAluno", {});

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

        const conteudo = JSON.stringify(arquivoRespostas, null, 4);

        const nomeArquivo =
            "respostas-" +
            aluno.nome + "-" +
            aluno.matricula + "-" +
            Date.now() +
            ".json";

        // Armazena uma cópia para novo download
        sessionStorage.setItem("respostasExportadas", conteudo);

        // Realiza o download
        baixarArquivo(conteudo, nomeArquivo);

        // Encerra a prova
        CHAVES_DA_PROVA.forEach(chave => {
            sessionStorage.removeItem(chave);
        });

        // Encaminha para a página de conclusão
        setTimeout(() => {
            window.location.href = "avaliacao-finalizada.html";
        }, 1000);

    });

})();
