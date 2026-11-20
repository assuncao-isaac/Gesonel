
(function () {
    "use strict";

    const area = document.getElementById("areaBaixarNovamente");
    const botao = document.getElementById("btnBaixarNovamente");

    const conteudo = sessionStorage.getItem("respostasExportadas");

    // Sem cópia disponível, mantém o bloco oculto
    if (!area || !botao || !conteudo) {
        return;
    }

    area.hidden = false;

    // Função responsável pelo download
    function baixarArquivo(conteudo, nomeArquivo) {
        const arquivo = new Blob(
            [conteudo],
            { type: "application/json" }
        );

        const endereco = URL.createObjectURL(arquivo);
        const link = document.createElement("a");

        link.href = endereco;
        link.download = nomeArquivo;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(endereco);
        }, 1000);
    }

    botao.addEventListener("click", () => {
        baixarArquivo(conteudo, "respostas.json");
    });

})();
