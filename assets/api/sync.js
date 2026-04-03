const { google } = require("googleapis");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const products = req.body.products;
    const today = new Date().toISOString().split("T")[0]; // Fecha actual YYYY-MM-DD

    // 1. Autenticación
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

    // 2. Verificar si la hoja "Products" existe
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
    let sheetExists = sheetMeta.data.sheets.find(
      (s) => s.properties.title === "Products",
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "Products" } } }],
        },
      });
      // Inicializar cabeceras
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Products!A1:B1",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Entity", "Product"]] },
      });
    }

    // 3. Obtener datos actuales
    const currentData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Products!A:ZZ",
    });

    let rows = currentData.data.values || [["Entity", "Product"]];
    let headers = rows[0];

    // 4. Asegurar que la columna de hoy exista
    let dateColIndex = headers.indexOf(today);
    if (dateColIndex === -1) {
      headers.push(today);
      dateColIndex = headers.length - 1;
    }

    // 5. Mapear y actualizar productos
    const productMap = new Map();
    rows.slice(1).forEach((row, index) => {
      productMap.set(row[1], index + 1); // Llave: Nombre del producto, Valor: Índice de fila
    });

    products.forEach((p) => {
      const rowIndex = productMap.get(p.title);
      if (rowIndex !== undefined) {
        // El producto ya existe, actualizar su precio en la columna de hoy
        rows[rowIndex][dateColIndex] = p.price;
      } else {
        // Nuevo producto
        const newRow = new Array(headers.length).fill("");
        newRow[0] = p.platform;
        newRow[1] = p.title;
        newRow[dateColIndex] = p.price;
        rows.push(newRow);
      }
    });

    // 6. Guardar cambios en el Sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Products!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Google Sheets actualizado correctamente.",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
