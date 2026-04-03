const SheetsSync = {
  // Recibe la lista de productos (puedes pasar State.products para sincronizar el JSON completo)
  async syncProducts(productsList) {
    if (!productsList || productsList.length === 0) {
      alert("⚠️ Não há produtos para sincronizar.");
      return;
    }

    try {
      Utils.setStatus("Sincronizando produtos com Google Sheets...", "sync");

      // Mapeamos los datos para enviar solo lo necesario y reducir el tamaño del payload
      const payload = productsList.map((p) => ({
        platform: p.platform || "Desconhecida",
        title: p.title,
        price: p.price,
      }));

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ products: payload }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Alerta de éxito con estilo
        alert(
          `✅ Sucesso! ${payload.length} produtos foram atualizados na sua planilha.`,
        );
      } else {
        throw new Error(result.error || "Erro desconhecido na API");
      }
    } catch (error) {
      console.error("Erro no Sync:", error);
      alert(
        "❌ Falha ao sincronizar com Google Sheets. Verifique o console para mais detalhes.",
      );
    } finally {
      Utils.setStatus("", ""); // Apaga el indicador de carga
    }
  },
};
