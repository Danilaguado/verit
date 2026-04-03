const PdfGenerator = {
  async generate(productsList) {
    console.log("--- 🕵️‍♂️ INICIANDO DEPURACIÓN DE PDF ---");
    console.log("Paso 1: Botón presionado. Argumento recibido:", productsList);

    // 1. Validar la lista de productos
    const list =
      productsList && productsList.length > 0
        ? productsList
        : State.allProducts;
    console.log(
      "Paso 2: Lista a renderizar elegida. Cantidad de productos:",
      list ? list.length : 0,
    );

    if (!list || list.length === 0) {
      console.error(
        "❌ ERROR: La lista de productos está vacía o es 'undefined'.",
      );
      alert("⚠️ Não há produtos para gerar o catálogo.");
      return;
    }

    Utils.setStatus("Gerando catálogo...", "pdf");

    // 2. Crear contenedor temporal
    const container = document.createElement("div");
    container.id = "pdf-debug-container";

    // IMPORTANTE: No lo escondemos con display:none o left:-9999px todavía,
    // lo ponemos en una capa de fondo para asegurar que el navegador sí le asigne "altura y anchura" reales.
    container.style.position = "absolute";
    container.style.top = "0";
    container.style.left = "0";
    container.style.zIndex = "-1000";
    container.style.width = "800px";
    container.style.background = "#ffffff";
    container.style.padding = "20px";

    document.body.appendChild(container);
    console.log("Paso 3: Contenedor HTML creado en el DOM.");

    // 3. Generar el HTML (Estructura simple para probar si renderiza algo)
    let html = `
      <div style="font-family: sans-serif;">
        <h1 style="color: #f26522; text-align: center;">Catálogo de Teste</h1>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
    `;

    list.slice(0, 10).forEach((p, index) => {
      // Limitamos a 10 productos solo para la prueba
      if (index === 0)
        console.log("Paso 4: Ejemplo de datos del primer producto:", p);

      const price = p.price ? `R$ ${p.price.toFixed(2)}` : "R$ 0,00";

      html += `
        <div style="width: 31%; border: 1px solid #ccc; padding: 10px; box-sizing: border-box;">
          <p style="font-size: 10px; color: gray;">ID: ${p.id || index}</p>
          <img src="${p.thumbnail}" style="max-width: 100%; height: 100px; object-fit: contain;" crossorigin="anonymous">
          <p style="font-size: 12px; height: 30px; overflow: hidden;">${p.title}</p>
          <strong style="color: red;">${price}</strong>
        </div>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    console.log("Paso 5: HTML inyectado. Longitud de caracteres:", html.length);
    console.log(
      "Paso 6: Elemento contenedor mide (Alto x Ancho):",
      container.offsetHeight,
      "x",
      container.offsetWidth,
    );

    // 4. Configurar la librería
    const opt = {
      margin: 10,
      filename: "Debug_Catalogo.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true, // 🔥 ESTO ES VITAL: Le dice a html2canvas que imprima errores de imagen en consola
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    console.log("Paso 7: Llamando a la promesa html2pdf()...");

    try {
      // 5. Ejecutar y medir tiempo
      const start = Date.now();
      await html2pdf().set(opt).from(container).save();
      const end = Date.now();

      console.log(
        `Paso 8: ✅ PDF Generado y guardado exitosamente en ${end - start}ms.`,
      );
    } catch (err) {
      console.error(
        "❌ PASO 8 ERROR CRÍTICO: La librería falló al crear el PDF.",
        err,
      );
    } finally {
      // Limpieza
      document.body.removeChild(container);
      console.log("Paso 9: Contenedor eliminado. Fin del proceso.");
      Utils.setStatus("", "");
    }
  },
};
