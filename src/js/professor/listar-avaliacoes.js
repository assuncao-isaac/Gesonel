
const listaAvaliacoes = document.getElementById("listaAvaliacoes");

function carregarAvaliacoes() {
    const avaliacoes = JSON.parse(
        localStorage.getItem("avaliacoesProfessor") || "[]"
    );

    listaAvaliacoes.innerHTML = "";

    if (avaliacoes.length === 0) {
        listaAvaliacoes.innerHTML = `
            <div class="estado-vazio">
                <h3>Nenhuma avaliação cadastrada</h3>
                <p>Quando você criar uma avaliação, ela aparecerá nesta área.</p>
            </div>
        `;
        return;
    }

    avaliacoes.forEach((avaliacao, indice) => {
        const card = document.createElement("div");
        card.className = "questao-professor";

        const titulo = document.createElement("h3");
        titulo.textContent = avaliacao.titulo;

        const quantidade = document.createElement("p");
        quantidade.textContent =
            avaliacao.questoes.length + " questão(ões) cadastrada(s)";

        const acoes = document.createElement("div");
        acoes.className = "acoes-formulario";

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "botao-criar";
        botaoEditar.textContent = "Editar";

        botaoEditar.addEventListener("click", function() {
            sessionStorage.setItem(
                "avaliacaoEmCriacao",
                JSON.stringify(avaliacao)
            );

            sessionStorage.setItem(
                "quantidadeQuestoes",
                avaliacao.questoes.length
            );

            sessionStorage.setItem("modoEdicao", "true");

            window.location.href = "cadastrar-questoes.html";
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "botao-voltar";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", function() {
            const confirmar = confirm(
                "Deseja realmente excluir esta avaliação?"
            );

            if (confirmar) {
                avaliacoes.splice(indice, 1);

                localStorage.setItem(
                    "avaliacoesProfessor",
                    JSON.stringify(avaliacoes)
                );

                carregarAvaliacoes();
            }
        });

        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);

        card.appendChild(titulo);
        card.appendChild(quantidade);
        card.appendChild(acoes);

        listaAvaliacoes.appendChild(card);
    });
}

carregarAvaliacoes();
