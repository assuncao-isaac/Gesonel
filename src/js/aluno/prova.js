
const avaliacaoSalva = sessionStorage.getItem("avaliacaoAtual");

if (!avaliacaoSalva) {
    alert("Nenhuma avaliação foi importada.");
    window.location.href = "aluno.html";
} else {
    const avaliacao = JSON.parse(avaliacaoSalva);

    const titulo = document.getElementById("tituloProva");
    const contador = document.getElementById("contadorQuestoes");
    const enunciado = document.getElementById("enunciadoQuestao");
    const alternativasDiv = document.getElementById("alternativas");
    const btnAnterior = document.getElementById("btnAnterior");
    const btnProxima = document.getElementById("btnProxima");
    const mensagem = document.getElementById("mensagem");

    let questaoAtual = 0;
    const respostas = {};

    titulo.textContent = avaliacao.titulo;

    function mostrarQuestao() {
        const questao = avaliacao.questoes[questaoAtual];

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

                
        document.getElementById("btnFinalizar").hidden =
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
    document.addEventListener("alunoIdentificado", () => {
        mostrarQuestao();
    });
}
