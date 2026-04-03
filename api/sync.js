const { google } = require("googleapis");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const products = req.body.products;
    const today = new Date().toLocaleDateString("pt-BR"); // Formato DD/MM/YYYY para el Excel

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

    // 1. Obtener datos actuales
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Products!A:ZZ",
    });

    let rows = response.data.values || [["Entity", "Product"]];
    let headers = rows[0];

    // 2. Gestionar la columna de la fecha
    let dateColIndex = headers.indexOf(today);
    if (dateColIndex === -1) {
      headers.push(today);
      dateColIndex = headers.length - 1;
    }

    // 3. Crear un mapa de productos existentes (Key: Plataforma + Titulo)
    const productMap = new Map();
    for (let i = 1; i < rows.length; i++) {
      const key = `${rows[i][0]}_${rows[i][1]}`;
      productMap.set(key, i);
    }

    // 4. Procesar nuevos productos
    products.forEach((p) => {
      const key = `${p.platform}_${p.title}`;
      const rowIndex = productMap.get(key);

      if (rowIndex !== undefined) {
        // El producto ya existe. Solo agregamos el precio si la celda de hoy está vacía
        // o si queremos actualizar el precio de la oferta actual.
        if (
          !rows[rowIndex][dateColIndex] ||
          rows[rowIndex][dateColIndex] == ""
        ) {
          rows[rowIndex][dateColIndex] = p.price;
        }
      } else {
        // Es un producto totalmente nuevo en la hoja
        const newRow = new Array(headers.length).fill("");
        newRow[0] = p.platform;
        newRow[1] = p.title;
        newRow[dateColIndex] = p.price;
        rows.push(newRow);
      }
    });

    // 5. Actualizar la hoja
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Products!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
