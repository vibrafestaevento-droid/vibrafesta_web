function doPost(e) {
  Logger.log('--- NUEVA RESERVA (JSON/FETCH) ---');

  try {
    // 1. Obtener datos. 
    // Si viene por fetch(JSON), los datos están en e.postData.contents
    // Si viene por Form tradicional, están en e.parameter
    let data = {};
    
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // Si falla el parse, quizás no es JSON válido
        Logger.log('Error parseando JSON: ' + jsonErr);
        data = e.parameter; // Fallback
      }
    } else {
      data = e.parameter;
    }

    Logger.log(JSON.stringify(data));

    const ss = SpreadsheetApp.openById('1lksuFoxJ6fqmitTzY-WaCyLn-ls41R_tPzoeBBrxo7E');
    const sheet = ss.getSheetByName('Respuestas');

    const nombre    = data.nombre    || '';
    const telefono  = data.telefono  || '';
    const correo    = data.correo    || '';
    const instagram = data.instagram || '';
    const plan      = data.plan      || '';

    // Manejo de clases (puede venir como array en JSON o como param múltiple en form)
    let clasesArr = [];
    if (Array.isArray(data.clasesArray)) {
      clasesArr = data.clasesArray;
    } else if (data.clases) {
      // Si viene del form tradicional (checkboxes con mismo name="clases")
      // En JSON puro esto no pasa igual que en e.parameters, 
      // pero si usas el código anterior, esto lo cubre.
      // Para el fetch actual del usuario, usa 'clasesArray'.
      clasesArr = Array.isArray(data.clases) ? data.clases : [data.clases];
    }
    
    const clasesTexto = clasesArr.join(', ');

    const CLASS_MAP = [
      'Sábado 11:00 · Fullbody · Wanda Monsalve',
      'Sábado 11:00 · Yoga · Mari Méndez',
      'Sábado 16:00 · Pilates · Lisbeida Rangel',
      'Sábado 17:00 · Stretching · Lisbeida Rangel',
      'Sábado 18:00 · Yoga · Mari Méndez',
      'Domingo 11:00 · Fullbody · Wanda Monsalve',
      'Domingo 11:00 · Yoga · Mari Méndez',
      'Domingo 16:00 · Pilates · Lisbeida Rangel',
      'Domingo 17:00 · Stretching · Lisbeida Rangel',
      'Domingo 18:00 · Yoga · Mari Méndez',
    ];

    const clasesFlags = CLASS_MAP.map(label =>
      clasesArr.includes(label) ? 1 : ''
    );

    // --- MANEJO DE ARCHIVO (BASE64) ---
    let fileUrl = '';
    
    if (data.fileData && data.fileName) {
      try {
        const folder = DriveApp.getFolderById('1DmFDNqrbLbMqol_wo9E0WJGSX0RYBztJ');
        
        const safeName = (nombre || 'sin_nombre').replace(/[^\w\s-]/g, '_');
        const timestamp = Utilities.formatDate(
          new Date(),
          Session.getScriptTimeZone(),
          'yyyyMMdd_HHmmss'
        );
        
        const finalName = timestamp + '_' + safeName + '_' + data.fileName;
        
        // Decodificar Base64
        const decodedBytes = Utilities.base64Decode(data.fileData);
        const mimeType = data.fileType || 'application/octet-stream';
        const blob = Utilities.newBlob(decodedBytes, mimeType, finalName);
        
        const file = folder.createFile(blob);
        fileUrl = file.getUrl();
        Logger.log('Archivo creado OK: ' + fileUrl);
        
      } catch (errFile) {
        Logger.log('Error guardando archivo Base64: ' + errFile);
        fileUrl = 'Error: ' + errFile.toString();
      }
    } else {
      Logger.log('No se recibieron datos de archivo (fileData/fileName)');
    }

    const row = [
      new Date(),
      nombre,
      telefono,
      correo,
      instagram,
      plan,
      clasesTexto,
      ...clasesFlags,
      fileUrl
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, fileUrl }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error en doPost: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  // Necesario para CORS si se hiciera fetch desde otro dominio, 
  // aunque con 'no-cors' no se usa realmente, es buena práctica tenerlo.
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .append('ok');
}
