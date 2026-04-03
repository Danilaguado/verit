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

    // Seleccionamos un máximo de 90 productos
    const printList = list.slice(0, 90);

    // 1. Usamos width: 100% para que se adapte perfectamente a la hoja A4
    let htmlString = `
      <div style="width: 100%; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; color: #333; box-sizing: border-box;">
        
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #f26522;">
          <h1 style="color: #1a1916; margin: 0; font-size: 26px;">Catálogo de Ofertas</h1>
          <p style="color: #e8304a; font-weight: bold; margin: 5px 0 0 0; font-size: 13px;">As melhores oportunidades do dia!</p>
        </div>

        <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
    `;

    // 2. Llenar los productos (Usamos 31.5% de ancho en vez de píxeles)
    printList.forEach((p) => {
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

      htmlString += `
        <div style="width: 31.5%; margin-bottom: 15px; border: 1px solid #eaeaea; border-radius: 8px; padding: 10px; text-align: center; background: #fafafa; page-break-inside: avoid; box-sizing: border-box;">
          
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
          
          <a href="${p.url || "#"}" target="_blank" style="display: block; background: #f26522; color: white; text-decoration: none; padding: 8px; border-radius: 5px; font-size: 10px; font-weight: bold; text-transform: uppercase;">
            🛒 Ir ao produto
          </a>
        </div>
      `;
    });

    htmlString += `
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 10px; border-top: 1px solid #eee; padding-top: 10px; page-break-inside: avoid;">
          Catálogo gerado por Verit. Preços sujeitos a alteração na plataforma de destino.
        </div>
      </div>
    `;

    // 3. Opciones de html2pdf actualizadas
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right (márgenes seguros)
      filename: `Catalogo_Ofertas_Verit.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        // Quitamos el windowWidth fijo para que fluya al 100% de la hoja A4
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // 4. Generar
    try {
      await html2pdf().set(opt).from(htmlString).save();
      console.log("✅ PDF Generado con éxito.");
    } catch (err) {
      console.error("❌ Error al generar PDF:", err);
      alert("Houve um erro ao gerar o PDF.");
    } finally {
      Utils.setStatus("", ""); // Apaga el loading
    }
  },
};
