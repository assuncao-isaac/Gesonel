
const avaliacaoSalva = sessionStorage.getItem("avaliacaoEmCriacao");

const tituloAvaliacao = document.getElementById("tituloDaAvaliacao");
const progresso = document.getElementById("progressoQuestoes");
const listaQuestoes = document.getElementById("listaQuestoes");
const formulario = document.getElementById("formQuestoes");

if (!avaliacaoSalva) {
    alert("Nenhuma avaliação foi encontrada. Comece novamente.");
    window.location.href = "criar-avaliacao.html";

} else {
    const avaliacao = JSON.parse(avaliacaoSalva);

    const quantidade = Number(
        sessionStorage.getItem("quantidadeQuestoes")
    );

    const modoEdicao = sessionStorage.getItem("modoEdicao") === "true";

    const ehVerdadeiroFalso =
        avaliacao.tipoQuestao === "verdadeiro-falso";

    const numeroAlternativas = ehVerdadeiroFalso
        ? 2
        : Number(avaliacao.quantidadeAlternativas);

    const letras = ["A", "B", "C", "D", "E"];

    tituloAvaliacao.textContent = avaliacao.titulo;
    progresso.textContent = "Total de questões: " + quantidade;

    for (let i = 1; i <= quantidade; i++) {

        const questaoSalva = avaliacao.questoes[i - 1];

        const questao = document.createElement("div");
        questao.className = "questao-professor";

        let alternativasHTML = "";

        for (let j = 0; j < numeroAlternativas; j++) {

            let textoPadrao = "";

            if (ehVerdadeiroFalso) {
                textoPadrao = j === 0 ? "Verdadeiro" : "Falso";
            }

            alternativasHTML += `
                <div class="alternativa-professor">
                    <label>Alternativa ${letras[j]}</label>
                    <input
                        type="text"
                        class="alternativa"
                        placeholder="${textoPadrao || "Digite a alternativa..."}"
                        value="${textoPadrao}"
                        required
                        ${ehVerdadeiroFalso ? "readonly" : ""}
                    >
                </div>
            `;
        }

        questao.innerHTML = `
            <h3>Questão ${i}</h3>

            <div class="campo-formulario">
                <label>Enunciado da questão</label>
                <textarea
                    class="enunciado"
                    placeholder="Digite o enunciado da questão..."
                    required
                ></textarea>
            </div>

            ${alternativasHTML}
        `;

        listaQuestoes.appendChild(questao);

        if (questaoSalva) {
            questao.querySelector(".enunciado").value =
                questaoSalva.enunciado;

            const campos = questao.querySelectorAll(".alternativa");

            questaoSalva.alternativas.forEach((alternativa, index) => {
                if (campos[index]) {
                    campos[index].value = alternativa.texto;
                }
            });
        }
    }

    formulario.addEventListener("submit", function(event) {
        event.preventDefault();

        const blocos = document.querySelectorAll(".questao-professor");
        const questoes = [];

        blocos.forEach((bloco, indice) => {

            const enunciado = bloco
                .querySelector(".enunciado")
                .value.trim();

            const campos = bloco.querySelectorAll(".alternativa");

            const alternativas = [];

            campos.forEach((campo, index) => {
                alternativas.push({
                    id: letras[index],
                    texto: campo.value.trim()
                });
            });

            questoes.push({
                id: "Q" + (indice + 1),
                enunciado: enunciado,
                alternativas: alternativas
            });
        });

        avaliacao.questoes = questoes;

        sessionStorage.setItem(
            "avaliacaoEmCriacao",
            JSON.stringify(avaliacao)
        );

        const avaliacoesSalvas = JSON.parse(
            localStorage.getItem("avaliacoesProfessor") || "[]"
        );

        const indiceExistente = avaliacoesSalvas.findIndex(
            item => item.id === avaliacao.id
        );

        if (indiceExistente !== -1) {
            avaliacoesSalvas[indiceExistente] = avaliacao;
        } else {
            avaliacoesSalvas.push(avaliacao);
        }

        localStorage.setItem(
            "avaliacoesProfessor",
            JSON.stringify(avaliacoesSalvas)
        );

        sessionStorage.removeItem("modoEdicao");

        alert(
            modoEdicao
                ? "Avaliação atualizada com sucesso!"
                : "Questões cadastradas com sucesso!"
        );

        window.location.href = "professor.html";
    });
}
