const SheetsSync = {
  async syncProducts(productsList) {
    try {
      Utils.setStatus("Sincronizando con Google Sheets...", "sync");
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productsList }),
      });

      const result = await response.json();
      if (result.success) {
        alert("✅ Productos sincronizados con Google Sheets exitosamente.");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error al sincronizar:", error);
      alert("❌ Error al sincronizar con Google Sheets.");
    }
  },
};
