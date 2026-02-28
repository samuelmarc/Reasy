$(function () {
    let dbRelatorios = JSON.parse(localStorage.getItem('db_territorios')) || {};

    const hoje = new Date();
    $('#dataVisita').val(hoje.toISOString().split('T')[0]);

    function getIDAtual() {
        return $('#numTerritorio').val() || "rascunho";
    }

    function salvarBD() {
        localStorage.setItem('db_territorios', JSON.stringify(dbRelatorios));
    }

    function renderizarLista() {
        const idTerritorio = getIDAtual();
        const lista = $('#listaRegistros').empty();
        const visitas = dbRelatorios[idTerritorio] || [];

        visitas.forEach((item, index) => {
            lista.append(`
                <div class="card registro-item shadow-sm mb-2">
                    <div class="card-body d-flex justify-content-between align-items-center p-2 text-white">
                        <span><strong>${item.nome}</strong> - ${item.data}</span>
                        <button class="btn btn-sm btn-danger btn-remover" data-index="${index}">✕</button>
                    </div>
                </div>
            `);
        });
    }

    $('#numTerritorio').on('input', function () {
        renderizarLista();
    });

    $('#btnAdicionar').on("click", function () {
        const nome = $('#localNome').val();
        const dataRaw = $('#dataVisita').val();
        const idTerritorio = getIDAtual();

        if (nome === "" || dataRaw === "") return alert("Preencha todos os campos!");

        const [ano, mes, dia] = dataRaw.split('-');
        const dataFinal = `${dia}/${mes}/${ano}`;

        if (!dbRelatorios[idTerritorio]) dbRelatorios[idTerritorio] = [];

        dbRelatorios[idTerritorio].push({ nome, data: dataFinal });

        salvarBD();
        renderizarLista();
        $('#localNome').val('').trigger('focus');
    });

    $('#btnExportar').on("click", async function () {
        const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = docx;

        const idTerritorio = getIDAtual();
        const visitas = dbRelatorios[idTerritorio] || [];
        const quadra = $('#quadra').val() || "---";
        const publicadores = $('#publicadores').val() || "---";

        if (visitas.length === 0) return alert("Adicione visitas antes de exportar!");

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [new TextRun({ text: "RELATÓRIO DE TERRITÓRIO", bold: true, size: 32 })]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "TERRITÓRIO: ", bold: true, size: 24 }),
                            new TextRun({ text: idTerritorio, size: 24 })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "QUADRA: ", bold: true, size: 24 }),
                            new TextRun({ text: quadra, size: 24 })
                        ]
                    }),
                    new Paragraph({
                        spacing: { after: 400 },
                        children: [
                            new TextRun({ text: "PUBLICADORES: ", bold: true, size: 24 }),
                            new TextRun({ text: publicadores, size: 24 })
                        ]
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 75, type: WidthType.PERCENTAGE },
                                        shading: { fill: "E0E0E0" },
                                        verticalAlign: AlignmentType.CENTER,
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: "Local / Nome / Comércio", bold: true })],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { before: 100, after: 100 }
                                        })]
                                    }),
                                    new TableCell({
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                        shading: { fill: "E0E0E0" },
                                        verticalAlign: AlignmentType.CENTER,
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: "Data", bold: true })],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { before: 100, after: 100 }
                                        })]
                                    })
                                ]
                            }),
                            ...visitas.map(v => new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 75, type: WidthType.PERCENTAGE },
                                        verticalAlign: AlignmentType.CENTER,
                                        children: [new Paragraph({
                                            text: v.nome,
                                            alignment: AlignmentType.CENTER,
                                            spacing: { before: 120, after: 120, left: 120 }
                                        })]
                                    }),
                                    new TableCell({
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                        verticalAlign: AlignmentType.CENTER,
                                        children: [new Paragraph({
                                            text: v.data,
                                            alignment: AlignmentType.CENTER,
                                            spacing: { before: 120, after: 120 }
                                        })]
                                    })
                                ]
                            }))
                        ]
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        const file = new File([blob], `Territorio_${idTerritorio}.docx`, {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `Território ${idTerritorio}`,
                    text: `Segue o relatório do território ${idTerritorio} da quadra ${quadra}...`
                });
            } catch {
                baixarArquivo(blob, idTerritorio);
            }
        } else {
            baixarArquivo(blob, idTerritorio);
        }
    });

    function baixarArquivo(blob, num) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Territorio_${num}.docx`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    $(document).on('click', '.btn-remover', function () {
        const idTerritorio = getIDAtual();
        const index = $(this).data('index');
        dbRelatorios[idTerritorio].splice(index, 1);
        if (dbRelatorios[idTerritorio].length === 0) delete dbRelatorios[idTerritorio];
        salvarBD();
        renderizarLista();
    });

    $('#btnLimpar').on('click', function () {
        const idTerritorio = getIDAtual();
        if (dbRelatorios[idTerritorio] && confirm("Apagar este relatório?")) {
            delete dbRelatorios[idTerritorio];
            salvarBD();
            renderizarLista();
        }
    });

    renderizarLista();
});