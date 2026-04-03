const PdfGenerator = {
  generate(productsList) {
    // 1. Crear contenedor principal
    const container = document.createElement("div");
    container.style.width = "794px"; // Ancho estándar A4 a 96dpi
    container.style.padding = "20px";
    container.style.fontFamily =
      "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    container.style.backgroundColor = "#ffffff";
    container.style.color = "#333";

    // 2. Construir el Header con el Logo de Verit
    let html = `
      <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; margin-bottom: 30px; border-bottom: 4px solid #f26522;">
        <img src="assets/logo.png" alt="Verit Logo" style="max-height: 80px; margin-bottom: 15px;" onerror="this.style.display='none'">
        <h1 style="margin: 0; font-size: 28px; color: #1a1a1a;">Catálogo de Ofertas</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">As melhores oportunidades selecionadas para você</p>
      </div>
      
      <div style="display: flex; flex-wrap: wrap; gap: 2%; justify-content: flex-start;">
    `;

    // 3. Construir las tarjetas de productos (Catálogo)
    productsList.forEach((p) => {
      const expires = p.expires_at
        ? new Date(p.expires_at).toLocaleDateString("pt-BR")
        : "Tempo limitado";
      // Asegurar URL segura para imágenes
      const thumb = p.thumbnail
        ? p.thumbnail.replace("http://", "https://")
        : "";

      html += `
        <div style="width: 31%; margin-bottom: 25px; border: 1px solid #eaeaea; border-radius: 12px; padding: 15px; box-sizing: border-box; text-align: center; page-break-inside: avoid; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          
          <div style="height: 160px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <img src="${thumb}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />
          </div>
          
          <h3 style="font-size: 13px; margin: 0 0 15px 0; color: #2c3e50; height: 38px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
            ${p.title}
          </h3>
          
          <div style="background-color: #fff9f9; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
            ${p.original_price ? `<div style="text-decoration: line-through; color: #95a5a6; font-size: 12px; margin-bottom: 2px;">De: R$ ${p.original_price.toFixed(2)}</div>` : ""}
            <div style="color: #e74c3c; font-weight: 800; font-size: 18px;">Por: R$ ${p.price.toFixed(2)}</div>
          </div>
          
          <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 15px;">
            ⏳ Oferta válida até: ${expires}
          </div>
          
          <a href="${p.url || "#"}" target="_blank" style="display: block; width: 100%; padding: 12px 0; background-color: #f26522; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
            🛒 Ir ao produto
          </a>
        </div>
      `;
    });

    html += `</div>`;

    // Pie de página
    html += `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; font-size: 11px; color: #999; page-break-inside: avoid;">
        Catálogo gerado automaticamente por Verit. Preços sujeitos a alteração.
      </div>
    `;

    container.innerHTML = html;

    // 4. Configuración para impresión A4 de alta calidad
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: "Catalogo_Verit_Ofertas.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    Utils.setStatus("Gerando catálogo PDF...", "pdf");

    html2pdf()
      .set(opt)
      .from(container)
      .save()
      .then(() => {
        Utils.setStatus("", ""); // Limpiar loader al terminar
      })
      .catch((err) => {
        console.error("Error al generar PDF:", err);
        alert("Houve um erro ao gerar o PDF.");
        Utils.setStatus("", "");
      });
  },
};
