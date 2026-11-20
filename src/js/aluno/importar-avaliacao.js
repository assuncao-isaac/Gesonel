(function () {
    "use strict";

    const arquivoInput = document.getElementById("arquivoAvaliacao");
    const botaoImportar = document.getElementById("btnImportar");
    const mensagem = document.getElementById("mensagem");

    function mostrarMensagem(texto, tipo) {
        mensagem.textContent = texto;
        mensagem.className = tipo ? "mensagem-" + tipo : "";
    }

    function textoQuestoes(quantidade) {
        return quantidade + (quantidade === 1 ? " questão" : " questões");
    }

    // Valida a estrutura básica de uma avaliação
    function validarAvaliacao(avaliacao) {
        if (
            !avaliacao ||
            avaliacao.tipo !== "avaliacao" ||
            !avaliacao.id ||
            !avaliacao.titulo ||
            !Array.isArray(avaliacao.questoes) ||
            avaliacao.questoes.length === 0
        ) {
            throw new Error("O arquivo não possui uma avaliação válida.");
        }

        const questoesValidas = avaliacao.questoes.every(questao =>
            questao.id &&
            questao.enunciado &&
            Array.isArray(questao.alternativas) &&
            questao.alternativas.length >= 2 &&
            questao.alternativas.every(alternativa =>
                alternativa.id && alternativa.texto
            )
        );

        if (!questoesValidas) {
            throw new Error("Existem questões ou alternativas inválidas.");
        }
    }

    // Lê o arquivo e devolve a avaliação já validada
    async function lerAvaliacao(arquivo) {
        // Remove o BOM, se o editor tiver gravado um
        const conteudo = (await arquivo.text()).replace(/^\uFEFF/, "");

        let avaliacao;

        try {
            avaliacao = JSON.parse(conteudo);
        } catch (erroJson) {
            throw new Error("o arquivo selecionado não é um JSON válido.");
        }

        validarAvaliacao(avaliacao);

        return avaliacao;
    }

    // Ao escolher um arquivo, já mostra uma prévia da avaliação
    arquivoInput.addEventListener("change", async () => {
        const arquivo = arquivoInput.files[0];

        if (!arquivo) {
            mostrarMensagem("", "");
            return;
        }

        mostrarMensagem("Lendo o arquivo...", "");

        try {
            const avaliacao = await lerAvaliacao(arquivo);

            // Ignora a resposta se o aluno já escolheu outro arquivo
            if (arquivoInput.files[0] !== arquivo) return;

            mostrarMensagem(
                "Arquivo: " + arquivo.name +
                " | Avaliação: " + avaliacao.titulo +
                " | " + textoQuestoes(avaliacao.questoes.length),
                "sucesso"
            );
        } catch (erro) {
            if (arquivoInput.files[0] !== arquivo) return;

            mostrarMensagem("Erro ao importar: " + erro.message, "erro");
        }
    });

    botaoImportar.addEventListener("click", async () => {
        const arquivo = arquivoInput.files[0];

        if (!arquivo) {
            mostrarMensagem("Selecione um arquivo JSON primeiro.", "erro");
            return;
        }

        // Evita cliques repetidos durante o processamento
        botaoImportar.disabled = true;

        try {
            const avaliacao = await lerAvaliacao(arquivo);

            // Nova avaliação: descarta dados de tentativas anteriores
            // para que respostas antigas não sejam misturadas com a nova prova
            [
                "alunoAtual",
                "respostasAluno",
                "tempoUtilizado",
                "inicioAvaliacao",
                "questaoAtual",
                "respostasExportadas"
            ].forEach(chave => sessionStorage.removeItem(chave));

            sessionStorage.setItem(
                "avaliacaoAtual",
                JSON.stringify(avaliacao)
            );

            // Nome do arquivo, exibido na tela de identificação
            sessionStorage.setItem("nomeArquivoAvaliacao", arquivo.name);

            mostrarMensagem(
                "Avaliação importada com sucesso! " +
                "Título: " + avaliacao.titulo +
                " | Quantidade de questões: " + avaliacao.questoes.length,
                "sucesso"
            );

            // Pequena pausa para o aluno ler a confirmação
            setTimeout(() => {
                window.location.href = "realizar-avaliacao.html";
            }, 800);

        } catch (erro) {
            botaoImportar.disabled = false;
            mostrarMensagem("Erro ao importar: " + erro.message, "erro");
        }
    });
})();