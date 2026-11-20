(function () {
    "use strict";

    const avaliacaoSalva = sessionStorage.getItem("avaliacaoAtual");

    // Sem avaliação importada, quem avisa e redireciona é o identificacao.js
    if (!avaliacaoSalva) {
        return;
    }

    const avaliacao = JSON.parse(avaliacaoSalva);

    const titulo = document.getElementById("tituloProva");
    const contador = document.getElementById("contadorQuestoes");
    const enunciado = document.getElementById("enunciadoQuestao");
    const alternativasDiv = document.getElementById("alternativas");
    const btnAnterior = document.getElementById("btnAnterior");
    const btnProxima = document.getElementById("btnProxima");
    const btnFinalizar = document.getElementById("btnFinalizar");
    const mensagem = document.getElementById("mensagem");

    // Recupera as respostas salvas, mantendo apenas as que ainda são válidas
    function lerRespostasSalvas() {
        const recuperadas = {};

        try {
            const salvas = JSON.parse(
                sessionStorage.getItem("respostasAluno") || "{}"
            );

            avaliacao.questoes.forEach(questao => {
                const alternativaSalva = salvas[questao.id];

                const valida = questao.alternativas.some(
                    alternativa => alternativa.id === alternativaSalva
                );

                if (valida) {
                    recuperadas[questao.id] = alternativaSalva;
                }
            });
        } catch (erro) {
            // dado corrompido: começa sem respostas
        }

        return recuperadas;
    }

    // Recupera a última questão aberta, respeitando os limites da prova
    function lerQuestaoSalva() {
        const indice = Number(sessionStorage.getItem("questaoAtual"));

        if (
            Number.isInteger(indice) &&
            indice >= 0 &&
            indice < avaliacao.questoes.length
        ) {
            return indice;
        }

        return 0;
    }

    let questaoAtual = lerQuestaoSalva();
    const respostas = lerRespostasSalvas();

    titulo.textContent = avaliacao.titulo;

    function mostrarQuestao() {
        const questao = avaliacao.questoes[questaoAtual];

        sessionStorage.setItem("questaoAtual", String(questaoAtual));

        contador.textContent =
            `Questão ${questaoAtual + 1} de ${avaliacao.questoes.length}`;

        enunciado.textContent = questao.enunciado;
        alternativasDiv.innerHTML = "";

        questao.alternativas.forEach(alternativa => {
            const label = document.createElement("label");
            label.className = "alternativa";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "resposta";
            radio.value = alternativa.id;

            if (respostas[questao.id] === alternativa.id) {
                radio.checked = true;
            }

            radio.addEventListener("change", () => {
                respostas[questao.id] = alternativa.id;

                sessionStorage.setItem(
                    "respostasAluno",
                    JSON.stringify(respostas)
                );
            });

            label.appendChild(radio);
            label.appendChild(
                document.createTextNode(" " + alternativa.texto)
            );

            alternativasDiv.appendChild(label);
        });

        btnAnterior.disabled = questaoAtual === 0;

        btnProxima.textContent =
            questaoAtual === avaliacao.questoes.length - 1
                ? "Última questão"
                : "Próxima";

        btnFinalizar.hidden =
            questaoAtual !== avaliacao.questoes.length - 1;

        mensagem.textContent = "";
    }

    btnAnterior.addEventListener("click", () => {
        if (questaoAtual > 0) {
            questaoAtual--;
            mostrarQuestao();
        }
    });

    btnProxima.addEventListener("click", () => {
        if (questaoAtual < avaliacao.questoes.length - 1) {
            questaoAtual++;
            mostrarQuestao();
        } else {
            mensagem.textContent =
                "Você chegou à última questão da avaliação.";
        }
    });

    // Só mostra as questões depois da identificação
    // (ou da retomada de uma prova em andamento)
    document.addEventListener("alunoIdentificado", () => {
        mostrarQuestao();
    });
})();