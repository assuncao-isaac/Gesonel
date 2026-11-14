
const arquivoInput = document.getElementById("arquivoAvaliacao");
const botaoImportar = document.getElementById("btnImportar");
const mensagem = document.getElementById("mensagem");

botaoImportar.addEventListener("click", async () => {
    const arquivo = arquivoInput.files[0];

    // Verifica se o aluno selecionou um arquivo
    if (!arquivo) {
        mensagem.textContent = "Selecione um arquivo JSON primeiro.";
        return;
    }

    try {
        // Lê o conteúdo do arquivo
        const conteudo = await arquivo.text();

        // Converte o texto para objeto JavaScript
        const avaliacao = JSON.parse(conteudo);

        // Verifica se o arquivo possui os dados básicos de uma avaliação
        if (
            avaliacao.tipo !== "avaliacao" ||
            !avaliacao.id ||
            !avaliacao.titulo ||
            !Array.isArray(avaliacao.questoes) ||
            avaliacao.questoes.length === 0
        ) {
            throw new Error("O arquivo não possui uma avaliação válida.");
        }

        // Verifica se as questões estão preenchidas corretamente
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

        // Guarda a avaliação para as próximas etapas
        sessionStorage.setItem(
            "avaliacaoAtual",
            JSON.stringify(avaliacao)
        );
        window.location.href = "realizar-avaliacao.html";

        // Mostra as informações da avaliação
        mensagem.textContent =
            "Avaliação importada com sucesso! " +
            "Título: " + avaliacao.titulo +
            " | Quantidade de questões: " + avaliacao.questoes.length;

    } catch (erro) {
        mensagem.textContent = "Erro ao importar: " + erro.message;
    }
});
