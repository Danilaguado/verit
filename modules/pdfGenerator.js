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

    // Seleccionamos un máximo de 90 productos para no saturar la memoria del PDF
    const printList = list.slice(0, 90);

    // 1. Construimos todo como un String (Texto) en lugar de elementos del DOM
    let htmlString = `
      <div style="width: 800px; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #f26522;">
          <h1 style="color: #1a1916; margin: 0; font-size: 32px;">Catálogo de Ofertas</h1>
          <p style="color: #e8304a; font-weight: bold; margin: 5px 0 0 0;">As melhores oportunidades do dia!</p>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: flex-start;">
    `;

    // 2. Llenar los productos
    printList.forEach((p) => {
      const price = p.price
        ? p.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "R$ 0,00";
      const oldPrice = p.original_price
        ? `<span style="text-decoration: line-through; color: #999; font-size: 12px;">De: R$ ${p.original_price.toFixed(2)}</span>`
        : '<span style="color:transparent; font-size: 12px;">-</span>';

      // Sanitizar la URL de la imagen
      const thumb = p.thumbnail
        ? p.thumbnail.replace(/^http:\/\//i, "https://")
        : "";

      htmlString += `
        <div style="width: 240px; border: 1px solid #eaeaea; border-radius: 8px; padding: 15px; text-align: center; background: #fafafa; page-break-inside: avoid; box-sizing: border-box;">
          
          <div style="height: 140px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; background: #fff; border-radius: 6px;">
            <img src="${thumb}" style="max-width: 100%; max-height: 130px; object-fit: contain;" crossorigin="anonymous">
          </div>
          
          <h4 style="font-size: 13px; color: #333; height: 38px; overflow: hidden; margin: 0 0 10px 0; line-height: 1.2;">
            ${p.title}
          </h4>
          
          <div style="margin-bottom: 12px; background: #fff9f9; padding: 5px; border-radius: 5px;">
            ${oldPrice}<br>
            <strong style="color: #e8304a; font-size: 18px;">Por: ${price}</strong>
          </div>
          
          <a href="${p.url || "#"}" target="_blank" style="display: block; background: #f26522; color: white; text-decoration: none; padding: 10px; border-radius: 5px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
            🛒 Ir ao produto
          </a>
        </div>
      `;
    });

    htmlString += `
        </div>
        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px;">
          Catálogo gerado por Verit. Preços sujeitos a alteração na plataforma de destino.
        </div>
      </div>
    `;

    // 3. Opciones de html2pdf
    const opt = {
      margin: [10, 5, 10, 5],
      filename: `Catalogo_Ofertas_${new Date().getTime()}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true, // Permite cargar imágenes externas
        windowWidth: 850, // Fuerza a que la librería entienda el ancho que queremos
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // 4. Generar enviando el String directamente (.from(htmlString))
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
