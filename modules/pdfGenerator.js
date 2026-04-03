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

    Utils.setStatus("Gerando catálogo PDF...", "pdf");

    const printList = list.slice(0, 90);

    // 1. Usamos un ancho fijo interno de 800px para que el motor jamás calcule una altura de 0.
    let htmlString = `
      <div style="width: 800px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; color: #333; box-sizing: border-box;">
        
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #f26522;">
          <h1 style="color: #1a1916; margin: 0; font-size: 26px;">Catálogo de Ofertas</h1>
          <p style="color: #e8304a; font-weight: bold; margin: 5px 0 0 0; font-size: 13px;">As melhores oportunidades do dia!</p>
        </div>
    `;

    // 2. TRUCO INFALIBLE: Agrupar los productos de 3 en 3 (Filas completas)
    for (let i = 0; i < printList.length; i += 3) {
      const rowItems = printList.slice(i, i + 3);

      // Cada fila es un bloque único que NO se puede romper (page-break-inside: avoid)
      htmlString += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; width: 100%; page-break-inside: avoid;">
      `;

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

        // El enlace a la plataforma con tu afiliado
        const productUrl = Platform.getUrl
          ? Platform.getUrl(p)
          : p.permalink || "#";

        htmlString += `
          <div style="width: 32%; border: 1px solid #eaeaea; border-radius: 8px; padding: 10px; text-align: center; background: #fafafa; box-sizing: border-box;">
            
            <div style="height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; background: #fff; border-radius: 6px;">
              <img src="${thumb}" style="max-width: 100%; max-height: 110px; object-fit: contain;" crossorigin="anonymous">
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

      // Si la última fila tiene menos de 3 productos, rellenamos con espacios vacíos para que no se deforme
      if (rowItems.length < 3) {
        for (let j = 0; j < 3 - rowItems.length; j++) {
          htmlString += `<div style="width: 32%;"></div>`;
        }
      }

      htmlString += `</div>`; // Cierra la fila
    }

    htmlString += `
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 10px; border-top: 1px solid #eee; padding-top: 10px;">
          Catálogo gerado por Verit. Preços sujeitos a alteração na plataforma de destino.
        </div>
      </div>
    `;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Catalogo_Ofertas_Verit.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },

      // Con las filas estructuradas, la librería CSS nativa funciona perfectamente
      pagebreak: { mode: ["css", "legacy"] },
    };

    try {
      await html2pdf().set(opt).from(htmlString).save();
      console.log("✅ PDF Generado con éxito.");
    } catch (err) {
      console.error("❌ Error al generar PDF:", err);
      alert("Houve um erro ao gerar o PDF.");
    } finally {
      Utils.setStatus("", "");
    }
  },
};
