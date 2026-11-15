
const seletorAvaliacao = document.getElementById("avaliacaoSelecionada");
const formulario = document.getElementById("formImportarRespostas");
const campoArquivo = document.getElementById("arquivoRespostas");

// Carrega avaliações e gabaritos
const avaliacoes = JSON.parse(
    localStorage.getItem("avaliacoesProfessor") || "[]"
);

const gabaritos = JSON.parse(
    localStorage.getItem("gabaritosProfessor") || "[]"
);

// Preenche a seleção de avaliações
avaliacoes.forEach(avaliacao => {
    const opcao = document.createElement("option");

    opcao.value = avaliacao.id;
    opcao.textContent = avaliacao.titulo;

    seletorAvaliacao.appendChild(opcao);
});

// Importação e correção automática
formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const avaliacaoId = seletorAvaliacao.value;
    const arquivo = campoArquivo.files[0];

    if (!avaliacaoId || !arquivo) {
        alert("Selecione uma avaliação e um arquivo de respostas.");
        return;
    }

    const avaliacao = avaliacoes.find(
        item => item.id === avaliacaoId
    );

    if (!avaliacao || !Array.isArray(avaliacao.questoes) ||
        avaliacao.questoes.length === 0) {
        alert("Avaliação inválida ou sem questões cadastradas.");
        return;
    }

    const gabarito = gabaritos.find(
        item => item.avaliacaoId === avaliacaoId
    );

    if (!gabarito) {
        alert("Esta avaliação ainda não possui um gabarito cadastrado.");
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function() {
        try {
            const dados = JSON.parse(leitor.result);

            // Validação básica do arquivo
            if (
                dados.tipo !== "respostas" ||
                dados.versao !== 1 ||
                dados.avaliacaoId !== avaliacaoId ||
                !dados.aluno ||
                typeof dados.aluno.nome !== "string" ||
                dados.aluno.nome.trim() === "" ||
                typeof dados.aluno.matricula !== "string" ||
                dados.aluno.matricula.trim() === "" ||
                !Array.isArray(dados.respostas)
            ) {
                alert("O arquivo de respostas é inválido ou pertence a outra avaliação.");
                return;
            }

            if (dados.respostas.length !== avaliacao.questoes.length) {
                alert("A quantidade de respostas não corresponde à avaliação.");
                return;
            }

            // Confere se todas as questões e respostas são válidas
            const questoesRespondidas = new Set();

            for (const resposta of dados.respostas) {
                const questao = avaliacao.questoes.find(
                    item => item.id === resposta.questaoId
                );

                if (
                    !questao ||
                    questoesRespondidas.has(resposta.questaoId) ||
                    !(
                        resposta.alternativaSelecionada === null ||
                        (
                            typeof resposta.alternativaSelecionada === "string" &&
                            questao.alternativas.some(
                                alternativa =>
                                    alternativa.id === resposta.alternativaSelecionada
                            )
                        )
                    )
                ) {
                    alert("O arquivo contém respostas inválidas ou duplicadas.");
                    return;
                }

                questoesRespondidas.add(resposta.questaoId);
            }

            // Verifica se o gabarito está completo
            const gabaritoValido = avaliacao.questoes.every(questao =>
                gabarito.respostas.some(resposta =>
                    resposta.questaoId === questao.id &&
                    questao.alternativas.some(
                        alternativa =>
                            alternativa.id === resposta.alternativaCorreta
                    )
                )
            );

            if (!gabaritoValido) {
                alert("O gabarito está incompleto ou contém respostas inválidas.");
                return;
            }

            // Impede importar a mesma tentativa duas vezes
            const resultadosSalvos = JSON.parse(
                localStorage.getItem("resultadosProfessor") || "[]"
            );

            const tentativaDuplicada = resultadosSalvos.some(
                resultado => resultado.tentativaId === dados.tentativaId
            );

            if (
                typeof dados.tentativaId !== "string" ||
                dados.tentativaId.trim() === "" ||
                tentativaDuplicada
            ) {
                alert("Esta tentativa já foi importada ou possui um identificador inválido.");
                return;
            }

            // Executa a correção automática
            const correcao = corrigirAvaliacao(
                avaliacao,
                gabarito,
                dados
            );

            // Monta o resultado completo
            const resultadoFinal = {
                tentativaId: dados.tentativaId,
                avaliacaoId: avaliacao.id,
                tituloAvaliacao: avaliacao.titulo,

                aluno: {
                    nome: dados.aluno.nome,
                    matricula: dados.aluno.matricula
                },

                acertos: correcao.acertos,
                erros: correcao.erros,
                semResposta: correcao.semResposta,
                totalQuestoes: correcao.totalQuestoes,
                totalRespondidas: correcao.totalRespondidas,
                nota: correcao.nota,
                    questoes: correcao.questoes,

                tempoUtilizado: dados.tempoUtilizado || 0,
                dataRealizacao: dados.dataRealizacao || null,
                dataCorrecao: new Date().toISOString()
            };

            // Salva o resultado no navegador
            resultadosSalvos.push(resultadoFinal);

            localStorage.setItem(
                "resultadosProfessor",
                JSON.stringify(resultadosSalvos)
            );

            // Guarda o resultado atual para exibição na próxima página
            sessionStorage.setItem(
                "resultadoAtual",
                JSON.stringify(resultadoFinal)
            );

            alert(
            "Correção realizada com sucesso!\n\n" +
            "Aluno: " + dados.aluno.nome + "\n" +
            "Acertos: " + correcao.acertos + "\n" +
            "Erros: " + correcao.erros + "\n" +
            "Sem resposta: " + correcao.semResposta + "\n" +
            "Nota: " + correcao.nota.toFixed(2)
            );
            
            window.location.href = "resultados.html";

        } catch (erro) {
            console.error(erro);
            alert("Não foi possível processar o arquivo. Verifique se ele é um JSON válido.");
        }
    };

    leitor.onerror = function() {
        alert("Ocorreu um erro ao ler o arquivo.");
    };

    leitor.readAsText(arquivo);
});
