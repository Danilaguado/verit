const PdfGenerator = {
  async generate(productsList) {
    const list =
      productsList && productsList.length > 0
        ? productsList
        : State.allProducts;

    if (!list || list.length === 0) {
      alert("⚠️ Não há produtos para gerar o catálogo.");
      return;
    }

    Utils.setStatus(
      "Gerando catálogo PDF (processando todos os produtos)...",
      "pdf",
    );

    const printList = list;

    const ITEMS_PER_ROW = 3;
    const ROWS_PER_PAGE = 3;
    const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_PER_PAGE;
    const totalPages = Math.ceil(printList.length / ITEMS_PER_PAGE);

    // Eliminamos el 'margin: 0 auto' que a veces causa conflictos de centrado en la librería
    let htmlString = `<div style="width: 800px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; color: #333; box-sizing: border-box;">`;

    for (let page = 0; page < totalPages; page++) {
      const startIndex = page * ITEMS_PER_PAGE;
      const pageItems = printList.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE,
      );

      // 1. HEADER (SOLO EN LA PRIMERA PÁGINA)
      if (page === 0) {
        htmlString += `
          <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid #f26522;">
            <h1 style="color: #1a1916; margin: 0; font-size: 24px;">Catálogo de Ofertas</h1>
            <p style="color: #e8304a; font-weight: bold; margin: 5px 0 0 0; font-size: 12px;">As melhores oportunidades do dia!</p>
          </div>
        `;
      } else {
        htmlString += `<div style="height: 20px;"></div>`;
      }

      // 2. FILAS DE PRODUCTOS
      for (let r = 0; r < pageItems.length; r += ITEMS_PER_ROW) {
        const rowItems = pageItems.slice(r, r + ITEMS_PER_ROW);

        htmlString += `<div style="display: flex; justify-content: space-between; margin-bottom: 15px; width: 100%;">`;

        rowItems.forEach((p) => {
          const price = p.price
            ? p.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            : "R$ 0,00";
          const oldPrice = p.original_price
            ? `<span style="text-decoration: line-through; color: #999; font-size: 11px;">De: R$ ${p.original_price.toFixed(2)}</span>`
            : '<span style="color:transparent; font-size: 11px;">-</span>';
          const thumb = p.thumbnail
            ? p.thumbnail.replace(/^http:\/\//i, "https://")
            : "";

          const productUrl = Platform.getUrl
            ? Platform.getUrl(p)
            : p.permalink || "#";

          // Tarjetas reducidas al 31% para garantizar que la última no se empuje fuera de la hoja
          htmlString += `
            <div style="width: 31%; border: 1px solid #eaeaea; border-radius: 8px; padding: 10px; text-align: center; background: #fafafa; box-sizing: border-box;">
              
              <div style="height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; background: #fff; border-radius: 6px;">
                <img src="${thumb}" style="max-width: 100%; max-height: 100px; object-fit: contain;" crossorigin="anonymous">
              </div>
              
              <h4 style="font-size: 11px; color: #333; height: 30px; overflow: hidden; margin: 0 0 8px 0; line-height: 1.3;">
                ${p.title}
              </h4>
              
              <div style="margin-bottom: 10px; background: #fff9f9; padding: 5px; border-radius: 5px;">
                ${oldPrice}<br>
                <strong style="color: #e8304a; font-size: 15px;">Por: ${price}</strong>
              </div>
              
              <a href="${productUrl}" target="_blank" style="display: block; background: #f26522; color: white; text-decoration: none; padding: 8px; border-radius: 5px; font-size: 10px; font-weight: bold; text-transform: uppercase;">
                🛒 Ir ao produto
              </a>
            </div>
          `;
        });

        if (rowItems.length < ITEMS_PER_ROW) {
          for (let j = 0; j < ITEMS_PER_ROW - rowItems.length; j++) {
            htmlString += `<div style="width: 31%;"></div>`;
          }
        }

        htmlString += `</div>`;
      }

      // 3. FOOTER NUMERADO
      htmlString += `
        <div style="text-align: center; margin-top: 15px; color: #999; font-size: 10px; border-top: 1px solid #eee; padding-top: 10px;">
          Página ${page + 1} de ${totalPages} - Catálogo gerado por Verit. Preços sujeitos a alteração.
        </div>
      `;

      // 4. SALTO DE PÁGINA
      if (page < totalPages - 1) {
        htmlString += `<div class="html2pdf__page-break"></div>`;
      }
    }

    htmlString += `</div>`;

    const opt = {
      // MÁRGENES: [Top, Right, Bottom, Left]
      // 5mm arriba/abajo y solo 2mm a los lados para exprimir la hoja A4 al máximo
      margin: [5, 2, 5, 2],
      filename: `Catalogo_Ofertas_Verit.pdf`,
      image: { type: "jpeg", quality: 0.9 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        // LA MAGIA CONTRA EL ESPACIO EN BLANCO: Forzamos el origen absoluto
        scrollY: 0,
        scrollX: 0,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(opt).from(htmlString).save();
      console.log("✅ PDF Generado com sucesso.");
    } catch (err) {
      console.error("❌ Erro ao gerar PDF:", err);
      alert(
        "Ocorreu um erro. A lista de produtos pode ser grande demais para a memória do seu navegador.",
      );
    } finally {
      Utils.setStatus("", "");
    }
  },
};
