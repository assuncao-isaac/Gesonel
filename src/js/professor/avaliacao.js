
const formulario = document.getElementById("formCriarAvaliacao");

const tipoQuestao = document.getElementById("tipoQuestao");
const campoAlternativas = document.getElementById("campoAlternativas");
const quantidadeAlternativas = document.getElementById("quantidadeAlternativas");

// Mostra ou esconde a quantidade de alternativas
tipoQuestao.addEventListener("change", function() {

    if (tipoQuestao.value === "multipla-escolha") {
        campoAlternativas.style.display = "block";
        quantidadeAlternativas.required = true;

    } else {
        campoAlternativas.style.display = "none";
        quantidadeAlternativas.required = false;
        quantidadeAlternativas.value = "";
    }

});

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const titulo = document
        .getElementById("tituloAvaliacao")
        .value.trim();

    const quantidade = Number(
        document.getElementById("quantidadeQuestoes").value
    );

    const tipo = tipoQuestao.value;

    const numeroAlternativas =
        tipo === "multipla-escolha"
            ? Number(quantidadeAlternativas.value)
            : 2;

    if (titulo === "") {
        alert("Informe o título da avaliação.");
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 50) {
        alert("Informe uma quantidade entre 1 e 50 questões.");
        return;
    }

    if (!tipo) {
        alert("Selecione o formato das questões.");
        return;
    }

    if (
        tipo === "multipla-escolha" &&
        (!Number.isInteger(numeroAlternativas) ||
        numeroAlternativas < 2 ||
        numeroAlternativas > 5)
    ) {
        alert("Escolha entre 2 e 5 alternativas.");
        return;
    }

    const avaliacao = {
        tipo: "avaliacao",
        versao: 1,
        id: "AV-" + Date.now(),
        titulo: titulo,
        tipoQuestao: tipo,
        quantidadeAlternativas: numeroAlternativas,
        questoes: []
    };

    sessionStorage.setItem(
        "avaliacaoEmCriacao",
        JSON.stringify(avaliacao)
    );

    sessionStorage.setItem("quantidadeQuestoes", quantidade);

    sessionStorage.removeItem("modoEdicao");

    window.location.href = "cadastrar-questoes.html";
});
