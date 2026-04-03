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

    // Contenedor principal: Ancho exacto de 800px y FONDO GRIS (#eef0f4)
    let htmlString = `<div style="width: 800px; margin: 0 auto; background-color: #eef0f4; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; color: #333; box-sizing: border-box;">`;

    for (let page = 0; page < totalPages; page++) {
      const startIndex = page * ITEMS_PER_PAGE;
      const pageItems = printList.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE,
      );

      // 1. HEADER (SOLO PÁGINA 1)
      if (page === 0) {
        htmlString += `
          <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid #f26522;">
            <h1 style="color: #1a1916; margin: 0; font-size: 26px;">Catálogo de Ofertas</h1>
            <p style="color: #e8304a; font-weight: bold; margin: 5px 0 0 0; font-size: 13px;">As melhores oportunidades do dia!</p>
          </div>
        `;
      } else {
        htmlString += `<div style="height: 30px;"></div>`;
      }

      // 2. FILAS DE PRODUCTOS
      for (let r = 0; r < pageItems.length; r += ITEMS_PER_ROW) {
        const rowItems = pageItems.slice(r, r + ITEMS_PER_ROW);

        // Fila centrada
        htmlString += `<div style="display: flex; justify-content: center; margin-bottom: 15px; width: 100%;">`;

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

          // CARDS BLANCAS (#ffffff): Más juntas (margin: 0 8px) y tamaño fijo (width: 235px) para que no se corten.
          htmlString += `
            <div style="width: 235px; margin: 0 8px; border: 1px solid #dcdcdc; border-radius: 10px; padding: 12px; text-align: center; background-color: #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.06); box-sizing: border-box;">
              
              <div style="height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; background-color: #ffffff; border-radius: 6px;">
                <img src="${thumb}" style="max-width: 100%; max-height: 100px; object-fit: contain;" crossorigin="anonymous">
              </div>
              
              <h4 style="font-size: 11px; color: #333; height: 30px; overflow: hidden; margin: 0 0 8px 0; line-height: 1.3;">
                ${p.title}
              </h4>
              
              <div style="margin-bottom: 12px; background-color: #fef1f3; padding: 5px; border-radius: 5px;">
                ${oldPrice}<br>
                <strong style="color: #e8304a; font-size: 16px;">Por: ${price}</strong>
              </div>
              
              <a href="${productUrl}" target="_blank" style="display: block; background-color: #f26522; color: white; text-decoration: none; padding: 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                🛒 Ir ao produto
              </a>
            </div>
          `;
        });

        // Rellenar espacios para alinear si faltan productos
        if (rowItems.length < ITEMS_PER_ROW) {
          for (let j = 0; j < ITEMS_PER_ROW - rowItems.length; j++) {
            htmlString += `<div style="width: 235px; margin: 0 8px; visibility: hidden;"></div>`;
          }
        }

        htmlString += `</div>`;
      }

      // 3. FOOTER NUMERADO
      htmlString += `
        <div style="text-align: center; margin-top: 15px; color: #777; font-size: 10px; border-top: 1px solid #dcdcdc; padding-top: 10px;">
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
      // MÁRGENES CERO: Así el fondo gris del contenedor HTML cubrirá la hoja de esquina a esquina
      margin: [0, 0, 0, 0],
      filename: `Catalogo_Ofertas.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
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
