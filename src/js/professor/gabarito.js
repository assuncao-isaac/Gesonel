
const avaliacaoSalva = sessionStorage.getItem("avaliacaoParaGabarito");

const titulo = document.getElementById("tituloAvaliacao");
const progresso = document.getElementById("progressoGabarito");
const listaGabarito = document.getElementById("listaGabarito");
const formulario = document.getElementById("formGabarito");

if (!avaliacaoSalva) {
    alert("Nenhuma avaliação foi selecionada.");
    window.location.href = "professor.html";

} else {
    const avaliacao = JSON.parse(avaliacaoSalva);

    // Busca os gabaritos já salvos
    const gabaritosSalvos = JSON.parse(
        localStorage.getItem("gabaritosProfessor") || "[]"
    );

    // Procura um gabarito anterior desta avaliação
    const gabaritoExistente = gabaritosSalvos.find(
        item => item.avaliacaoId === avaliacao.id
    );

    titulo.textContent = avaliacao.titulo;

    progresso.textContent =
        "Selecione uma alternativa correta para cada questão.";

    // Cria as questões na tela
    avaliacao.questoes.forEach((questao, indice) => {

        const bloco = document.createElement("div");
        bloco.className = "questao-professor";

        const tituloQuestao = document.createElement("h3");
        tituloQuestao.textContent = "Questão " + (indice + 1);

        const enunciado = document.createElement("p");
        enunciado.textContent = questao.enunciado;

        bloco.appendChild(tituloQuestao);
        bloco.appendChild(enunciado);

        questao.alternativas.forEach(alternativa => {

            const linha = document.createElement("div");
            linha.className = "alternativa-professor";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "questao-" + questao.id;
            radio.value = alternativa.id;
            radio.required = true;

            // Recupera a resposta correta anteriormente salva
            if (gabaritoExistente) {
                const respostaSalva = gabaritoExistente.respostas.find(
                    item => item.questaoId === questao.id
                );

                if (
                    respostaSalva &&
                    respostaSalva.alternativaCorreta === alternativa.id
                ) {
                    radio.checked = true;
                }
            }

            const label = document.createElement("label");
            label.textContent =
                alternativa.id + ") " + alternativa.texto;

            linha.appendChild(radio);
            linha.appendChild(label);

            bloco.appendChild(linha);
        });

        listaGabarito.appendChild(bloco);
    });

    // Salva o gabarito
    formulario.addEventListener("submit", function(event) {
        event.preventDefault();

        const respostas = [];

        avaliacao.questoes.forEach(questao => {

            const selecionada = formulario.querySelector(
                'input[name="questao-' + questao.id + '"]:checked'
            );

            if (!selecionada) {
                alert("Selecione a resposta correta de todas as questões.");
                return;
            }

            respostas.push({
                questaoId: questao.id,
                alternativaCorreta: selecionada.value
            });
        });

        if (respostas.length !== avaliacao.questoes.length) {
            return;
        }

        const novoGabarito = {
            tipo: "gabarito",
            versao: 1,
            avaliacaoId: avaliacao.id,
            respostas: respostas
        };

        // Atualiza o gabarito existente ou cadastra um novo
        const indiceExistente = gabaritosSalvos.findIndex(
            item => item.avaliacaoId === avaliacao.id
        );

        if (indiceExistente !== -1) {
            gabaritosSalvos[indiceExistente] = novoGabarito;
        } else {
            gabaritosSalvos.push(novoGabarito);
        }

        localStorage.setItem(
            "gabaritosProfessor",
            JSON.stringify(gabaritosSalvos)
        );

        alert("Gabarito salvo com sucesso!");

        window.location.href = "professor.html";
    });
}
