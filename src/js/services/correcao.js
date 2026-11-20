
function corrigirAvaliacao(avaliacao, gabarito, respostasAluno) {

    let acertos = 0;
    let erros = 0;
    let semResposta = 0;

    const resultadoQuestoes = avaliacao.questoes.map(questao => {

        const respostaAluno = respostasAluno.respostas.find(
            resposta => resposta.questaoId === questao.id
        );

        const respostaCorreta = gabarito.respostas.find(
            resposta => resposta.questaoId === questao.id
        );

        const alternativaSelecionada =
            respostaAluno ? respostaAluno.alternativaSelecionada : null;

        const alternativaCorreta =
            respostaCorreta.alternativaCorreta;

        // Questões em branco não entram na pontuação
        if (alternativaSelecionada === null) {
            semResposta++;

            return {
                questaoId: questao.id,
                enunciado: questao.enunciado,
                alternativaSelecionada: null,
                alternativaCorreta: alternativaCorreta,
                acertou: false,
                semResposta: true
            };
        }

        const acertou =
            alternativaSelecionada === alternativaCorreta;

        if (acertou) {
            acertos++;
        } else {
            erros++;
        }

        return {
            questaoId: questao.id,
            enunciado: questao.enunciado,
            alternativaSelecionada: alternativaSelecionada,
            alternativaCorreta: alternativaCorreta,
            acertou: acertou,
            semResposta: false
        };
    });

    const totalQuestoes = avaliacao.questoes.length;
    const totalRespondidas = acertos + erros;

    const nota = totalRespondidas > 0
        ? Number(((acertos / totalQuestoes) * 10).toFixed(2))
        : 0;

    return {
        acertos: acertos,
        erros: erros,
        semResposta: semResposta,
        totalQuestoes: totalQuestoes,
        totalRespondidas: totalRespondidas,
        nota: nota,
        questoes: resultadoQuestoes
    };
}
