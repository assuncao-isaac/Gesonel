
const listaAvaliacoes = document.getElementById("listaAvaliacoes");

function carregarAvaliacoes() {
    const avaliacoes = JSON.parse(
        localStorage.getItem("avaliacoesProfessor") || "[]"
    );

    const gabaritos = JSON.parse(
        localStorage.getItem("gabaritosProfessor") || "[]"
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

        // Cartão individual
        const card = document.createElement("article");
        card.className = "card-avaliacao";

        // Informações da avaliação
        const cabecalho = document.createElement("div");
        cabecalho.className = "cabecalho-avaliacao";

        const titulo = document.createElement("h3");
        titulo.textContent = avaliacao.titulo;

        const informacoes = document.createElement("div");
        informacoes.className = "informacoes-avaliacao";

        const quantidade = document.createElement("p");
        quantidade.textContent =
            avaliacao.questoes.length + " questão(ões) cadastrada(s)";

        const gabaritoExistente = gabaritos.find(
            item => item.avaliacaoId === avaliacao.id
        );

        const gabaritoSalvo = Boolean(gabaritoExistente);

        const statusGabarito = document.createElement("p");
        statusGabarito.textContent = gabaritoSalvo
            ? "Gabarito definido"
            : "Gabarito ainda não definido";

        informacoes.appendChild(quantidade);
        informacoes.appendChild(statusGabarito);

        cabecalho.appendChild(titulo);
        cabecalho.appendChild(informacoes);

        // Área de ações da avaliação
        const acoes = document.createElement("div");
        acoes.className = "acoes-avaliacao";

        // Exportar prova
        const botaoExportar = document.createElement("button");
        botaoExportar.type = "button";
        botaoExportar.className = "botao-criar";
        botaoExportar.textContent = "Exportar prova";

        botaoExportar.addEventListener("click", function() {

            const arquivoProva = {
                tipo: "avaliacao",
                versao: 1,
                id: avaliacao.id,
                titulo: avaliacao.titulo,
                questoes: avaliacao.questoes
            };

            const blob = new Blob(
                [JSON.stringify(arquivoProva, null, 4)],
                { type: "application/json" }
            );

            const endereco = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = endereco;
            link.download = "prova.json";

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => {
                URL.revokeObjectURL(endereco);
            }, 1000);
        });

        // Editar avaliação
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

        // Definir ou editar gabarito
        const botaoGabarito = document.createElement("button");
        botaoGabarito.type = "button";
        botaoGabarito.className = "botao-criar";
        botaoGabarito.textContent = gabaritoSalvo
            ? "Editar gabarito"
            : "Definir gabarito";

        botaoGabarito.addEventListener("click", function() {

            sessionStorage.setItem(
                "avaliacaoParaGabarito",
                JSON.stringify(avaliacao)
            );

            window.location.href = "corrigir-avaliacao.html";
        });

        // Exportar gabarito
        const botaoExportarGabarito = document.createElement("button");
        botaoExportarGabarito.type = "button";
        botaoExportarGabarito.className = "botao-criar";
        botaoExportarGabarito.textContent = "Exportar gabarito";
        botaoExportarGabarito.disabled = !gabaritoSalvo;

        botaoExportarGabarito.addEventListener("click", function() {

            if (!gabaritoExistente) {
                alert("Esta avaliação ainda não possui gabarito.");
                return;
            }

            const blob = new Blob(
                [JSON.stringify(gabaritoExistente, null, 4)],
                { type: "application/json" }
            );

            const endereco = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = endereco;
            link.download = "gabarito.json";

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => {
                URL.revokeObjectURL(endereco);
            }, 1000);
        });

        // Importar gabarito
        const botaoImportarGabarito = document.createElement("button");
        botaoImportarGabarito.type = "button";
        botaoImportarGabarito.className = "botao-criar";
        botaoImportarGabarito.textContent = "Importar gabarito";

        botaoImportarGabarito.addEventListener("click", function() {

            const seletorArquivo = document.createElement("input");
            seletorArquivo.type = "file";
            seletorArquivo.accept = ".json,application/json";

            seletorArquivo.addEventListener("change", async function() {

                const arquivo = seletorArquivo.files[0];

                if (!arquivo) return;

                try {
                    const conteudo = await arquivo.text();
                    const dados = JSON.parse(conteudo);

                    // Validar estrutura do arquivo
                    if (
                        dados.tipo !== "gabarito" ||
                        dados.versao !== 1 ||
                        dados.avaliacaoId !== avaliacao.id ||
                        !Array.isArray(dados.respostas)
                    ) {
                        throw new Error("Arquivo incompatível com esta avaliação.");
                    }

                    // Validar quantidade de respostas
                    if (
                        dados.respostas.length !== avaliacao.questoes.length
                    ) {
                        throw new Error("O gabarito não possui todas as respostas.");
                    }

                    // Validar cada resposta
                    const questoesRespondidas = new Set();

                    for (const resposta of dados.respostas) {

                        const questao = avaliacao.questoes.find(
                            item => item.id === resposta.questaoId
                        );

                        if (
                            !questao ||
                            questoesRespondidas.has(resposta.questaoId)
                        ) {
                            throw new Error("Existem questões inválidas ou duplicadas.");
                        }

                        const alternativaValida = questao.alternativas.some(
                            alternativa =>
                                alternativa.id === resposta.alternativaCorreta
                        );

                        if (!alternativaValida) {
                            throw new Error("Existe uma alternativa inválida no gabarito.");
                        }

                        questoesRespondidas.add(resposta.questaoId);
                    }

                    // Atualizar ou cadastrar gabarito
                    const gabaritosAtualizados = JSON.parse(
                        localStorage.getItem("gabaritosProfessor") || "[]"
                    );

                    const indiceExistente = gabaritosAtualizados.findIndex(
                        item => item.avaliacaoId === avaliacao.id
                    );

                    if (indiceExistente !== -1) {
                        gabaritosAtualizados[indiceExistente] = dados;
                    } else {
                        gabaritosAtualizados.push(dados);
                    }

                    localStorage.setItem(
                        "gabaritosProfessor",
                        JSON.stringify(gabaritosAtualizados)
                    );

                    alert("Gabarito importado com sucesso!");

                    carregarAvaliacoes();

                } catch (erro) {
                    alert("Erro ao importar gabarito: " + erro.message);
                }
            });

            seletorArquivo.click();
        });

        // Excluir avaliação
        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "botao-voltar";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", function() {

            const confirmar = confirm(
                "Deseja realmente excluir esta avaliação e seu gabarito?"
            );

            if (confirmar) {

                const idExcluido = avaliacao.id;

                avaliacoes.splice(indice, 1);

                const gabaritosAtualizados = gabaritos.filter(
                    item => item.avaliacaoId !== idExcluido
                );

                localStorage.setItem(
                    "avaliacoesProfessor",
                    JSON.stringify(avaliacoes)
                );

                localStorage.setItem(
                    "gabaritosProfessor",
                    JSON.stringify(gabaritosAtualizados)
                );

                carregarAvaliacoes();
            }
        });

        // Organiza os botões
        acoes.appendChild(botaoExportar);
        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoGabarito);
        acoes.appendChild(botaoExportarGabarito);
        acoes.appendChild(botaoImportarGabarito);
        acoes.appendChild(botaoExcluir);

        // Monta o cartão
        card.appendChild(cabecalho);
        card.appendChild(acoes);

        listaAvaliacoes.appendChild(card);
    });
}

carregarAvaliacoes();
