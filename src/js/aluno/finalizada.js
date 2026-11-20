(function () {
    "use strict";

    const area = document.getElementById("areaBaixarNovamente");
    const botao = document.getElementById("btnBaixarNovamente");

    const conteudo = sessionStorage.getItem("respostasExportadas");

    // Sem cópia disponível (ou página aberta direto), o bloco permanece oculto
    if (!area || !botao || !conteudo) {
        return;
    }

    area.hidden = false;

    botao.addEventListener("click", () => {
        const arquivo = new Blob([conteudo], { type: "application/json" });

        const endereco = URL.createObjectURL(arquivo);
        const link = document.createElement("a");

        link.href = endereco;
        link.download = "respostas.json";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(endereco), 1000);
    });
})();