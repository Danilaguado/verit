const PdfGenerator = {
  generate(productsList) {
    // 1. Crear un contenedor temporal oculto
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "sans-serif";
    container.style.backgroundColor = "#ffffff";

    let html = `
      <h1 style="text-align:center; color:#e8304a; margin-bottom: 20px;">🔥 Catálogo de Ofertas</h1>
      <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
    `;

    productsList.forEach((p) => {
      const expires = p.expires_at
        ? new Date(p.expires_at).toLocaleDateString("pt-BR")
        : "Indeterminado";
      const thumb = p.thumbnail
        ? p.thumbnail.replace("http://", "https://")
        : "";

      html += `
        <div style="width: 250px; border: 1px solid #e0ddd6; border-radius: 12px; padding: 15px; text-align: center; page-break-inside: avoid;">
          <img src="${thumb}" style="width: 150px; height: 150px; object-fit: contain; margin-bottom: 10px;" />
          <h3 style="font-size: 14px; margin: 0 0 10px 0; color: #1a1916; height: 40px; overflow: hidden;">${p.title}</h3>
          
          ${p.original_price ? `<p style="text-decoration: line-through; color: #7a776f; margin: 0; font-size: 12px;">De: R$ ${p.original_price.toFixed(2)}</p>` : ""}
          <p style="color: #e8304a; font-weight: bold; font-size: 18px; margin: 5px 0;">Por: R$ ${p.price.toFixed(2)}</p>
          <p style="font-size: 11px; color: #7a776f;">Válido até: ${expires}</p>
          
          <a href="${Platform.getUrl(p)}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 10px 15px; background: linear-gradient(135deg, #e8304a 0%, #f26522 100%); color: white; text-decoration: none; border-radius: 20px; font-weight: bold; font-size: 13px;">🛒 Ir ao produto</a>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    // 2. Opciones de html2pdf
    const opt = {
      margin: 10,
      filename: "ofertas-verit.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, // useCORS permite cargar imágenes externas
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // 3. Generar PDF
    Utils.setStatus("Gerando PDF...", "pdf");
    html2pdf()
      .set(opt)
      .from(container)
      .save()
      .then(() => {
        Utils.setStatus("", ""); // Limpiar status
      });
  },
};
