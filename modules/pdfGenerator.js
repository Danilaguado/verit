const PdfGenerator = {
  async generate(productsList) {
    // Si no hay productos filtrados, usamos todos los de los archivos JS
    const list =
      productsList && productsList.length > 0
        ? productsList
        : State.allProducts;

    if (!list || list.length === 0) {
      alert("⚠️ Não há produtos para gerar o catálogo.");
      return;
    }

    Utils.setStatus("Gerando catálogo profissional...", "pdf");

    // Crear contenedor temporal en el cuerpo del documento para que html2canvas lo vea
    const container = document.createElement("div");
    container.id = "pdf-template";
    container.style.position = "absolute";
    container.style.left = "-9999px"; // Escondido pero presente en el DOM
    document.body.appendChild(container);

    let html = `
      <div style="padding: 30px; font-family: Arial, sans-serif; background: #fff;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 5px solid #f26522; padding-bottom: 20px; margin-bottom: 30px;">
          <img src="assets/logo.png" style="height: 60px;">
          <div style="text-align: right;">
            <h1 style="margin: 0; color: #1a1916; font-size: 24px;">Catálogo de Ofertas</h1>
            <p style="margin: 5px 0 0 0; color: #f26522; font-weight: bold;">Verit - Sinta a Verdade</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
    `;

    list.forEach((p) => {
      const price = p.price
        ? p.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "R$ 0,00";
      const oldPrice = p.original_price
        ? `<span style="text-decoration: line-through; color: #999; font-size: 12px;">De: R$ ${p.original_price.toFixed(2)}</span>`
        : "";

      html += `
        <div style="border: 1px solid #eee; border-radius: 10px; padding: 15px; text-align: center; page-break-inside: avoid; background: #fafafa;">
          <div style="height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <img src="${p.thumbnail}" style="max-height: 100%; max-width: 100%; object-fit: contain;" crossorigin="anonymous">
          </div>
          <h4 style="font-size: 12px; height: 35px; overflow: hidden; margin: 10px 0; color: #333;">${p.title}</h4>
          <div style="margin-bottom: 10px;">
            ${oldPrice}<br>
            <strong style="color: #e8304a; font-size: 16px;">Por: ${price}</strong>
          </div>
          <a href="${p.url}" target="_blank" style="display: block; background: #f26522; color: white; text-decoration: none; padding: 8px; border-radius: 5px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
            Ir ao produto
          </a>
        </div>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    const opt = {
      margin: 10,
      filename: `Catalogo_Verit_${new Date().getTime()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      // Esperar un momento para que las imágenes se rendericen en el contenedor
      setTimeout(async () => {
        await html2pdf().set(opt).from(container).save();
        document.body.removeChild(container); // Limpiar
        Utils.setStatus("", "");
      }, 1000);
    } catch (err) {
      console.error(err);
      Utils.setStatus("Erro ao gerar PDF", "error");
    }
  },
};
