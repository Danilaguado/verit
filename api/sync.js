const { google } = require("googleapis");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const products = req.body.products;
    const today = new Date().toLocaleDateString("pt-BR"); // Formato DD/MM/YYYY

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(
          /\\n/g,
          "\n",
        ),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // 1. VERIFICAR Y CREAR LA HOJA "Products" SI NO EXISTE
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = sheetMeta.data.sheets.find(
      (s) => s.properties.title === "Products",
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "Products" } } }],
        },
      });
      // Inicializar cabeceras básicas
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Products!A1:B1",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Entity", "Product"]] },
      });
    }

    // 2. Obtener datos actuales
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Products!A:ZZ",
    });

    let rows = response.data.values || [["Entity", "Product"]];
    let headers = rows[0];

    // 3. Gestionar la columna de la fecha
    let dateColIndex = headers.indexOf(today);
    if (dateColIndex === -1) {
      headers.push(today);
      dateColIndex = headers.length - 1;
    }

    // 4. Crear mapa de productos existentes (Llave: Plataforma + Titulo)
    const productMap = new Map();
    for (let i = 1; i < rows.length; i++) {
      const key = `${rows[i][0]}_${rows[i][1]}`;
      productMap.set(key, i);
    }

    // 5. Procesar productos
    products.forEach((p) => {
      const key = `${p.platform}_${p.title}`;
      const rowIndex = productMap.get(key);

      if (rowIndex !== undefined) {
        // Rellenar espacios vacíos en el array si la fila es más corta que las columnas actuales
        while (rows[rowIndex].length <= dateColIndex) {
          rows[rowIndex].push("");
        }

        // Si no hay precio en la columna de HOY, lo agregamos (evita sobrescribir inútilmente)
        if (
          !rows[rowIndex][dateColIndex] ||
          rows[rowIndex][dateColIndex] === ""
        ) {
          rows[rowIndex][dateColIndex] = p.price;
        }
      } else {
        // Producto totalmente nuevo
        const newRow = new Array(headers.length).fill("");
        newRow[0] = p.platform;
        newRow[1] = p.title;
        newRow[dateColIndex] = p.price;
        rows.push(newRow);
      }
    });

    // 6. Guardar cambios en el Excel
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Products!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error en API:", error);
    res.status(500).json({ error: error.message });
  }
}
