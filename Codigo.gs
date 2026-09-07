const HEADERS = [
  "Timestamp", "Nombre",
  "P1 – ¿Qué es un Servlet? (abierta)",
  "P2 – Función pom.xml (opción)",
  "P3 – Formulario HTML blancos (completar)",
  "P4 – <c:if> muestra mensaje (V/F)",
  "P5 – doPost captura nombre (completar)",
  "P6 – setAttribute guardar dato (completar)",
  "P7 – getRequestDispatcher forward (completar)",
  "P8 – request.setSession() nueva sesión (V/F)",
  "P9 – Explicar código carrito (abierta)",
  "P10 – request.___() usuario (opción)",
  "P11 – clic en enlace usa GET (V/F)",
  "Autocorrección (X/9)"
];
const QUESTION_IDS = ["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10","q11"];

const CORRECT_ANSWERS = {
  q2:  "b",
  q3:  ["CalculoServlet","post","text","nombre","number","sueldo","number","dias","submit"],
  q4:  "true",
  q5:  ["getParameter"],
  q6:  ["setAttribute","nombre","nombre"],
  q7:  ["getRequestDispatcher","forward"],
  q8:  "false",
  q10: "d",
  q11: "true"
};

function gradeAnswers(data) {
  var results = {};
  var correct = 0;
  var total = Object.keys(CORRECT_ANSWERS).length;
  var qids = Object.keys(CORRECT_ANSWERS);
  for (var i = 0; i < qids.length; i++) {
    var qid = qids[i];
    var correctAns = CORRECT_ANSWERS[qid];
    var studentRaw = (data[qid] || "").trim();
    if (Array.isArray(correctAns)) {
      var studentBlanks = studentRaw.split(" | ").map(function(s){ return s.trim().toLowerCase(); });
      var allOk = correctAns.every(function(ans, idx){ return (studentBlanks[idx] || "") === ans.toLowerCase(); });
      results[qid] = allOk ? "correcta" : "incorrecta";
      if (allOk) correct++;
    } else {
      var ok = studentRaw.toLowerCase() === correctAns.toLowerCase();
      results[qid] = ok ? "correcta" : "incorrecta";
      if (ok) correct++;
    }
  }
  return { correct: correct, total: total, results: results };
}

function doGet(e) {
  if (e && e.parameter && e.parameter.data) {
    try {
      var data      = JSON.parse(e.parameter.data);
      var sheet     = getOrCreateSheet();
      ensureHeaders(sheet);
      var timestamp = data.timestamp || new Date().toISOString();
      var nombre    = (data.nombre || "").trim() || "(sin nombre)";
      var grade     = gradeAnswers(data);
      var detalle   = Object.keys(grade.results).map(function(q){
        return q + ":" + (grade.results[q] === "correcta" ? "✓" : "✗");
      }).join("  ");
      var resumen = grade.correct + "/" + grade.total + "  →  " + detalle;
      var row = [timestamp, nombre];
      QUESTION_IDS.forEach(function(id){ row.push(data[id] || ""); });
      row.push(resumen);
      sheet.appendRow(row);
      var result = { ok: true, correct: grade.correct, total: grade.total, results: grade.results };
      var cb = (e.parameter.callback || "").replace(/[^a-zA-Z0-9_]/g, "");
      if (cb) {
        return ContentService.createTextOutput(cb + "(" + JSON.stringify(result) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      var errResult = { ok: false, error: err.message };
      var cb2 = e.parameter.callback ? e.parameter.callback.replace(/[^a-zA-Z0-9_]/g, "") : "";
      if (cb2) {
        return ContentService.createTextOutput(cb2 + "(" + JSON.stringify(errResult) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(JSON.stringify(errResult)).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput("✓ Script activo — Quiz JSP").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var raw = "{}";
    if (e && e.postData && e.postData.contents) {
      raw = e.postData.contents;
    } else if (e && e.parameter) {
      raw = JSON.stringify(e.parameter);
    }
    var data  = JSON.parse(raw);
    var sheet = getOrCreateSheet();
    ensureHeaders(sheet);
    var timestamp = data.timestamp || new Date().toISOString();
    var nombre    = (data.nombre || "").trim() || "(sin nombre)";
    var grade     = gradeAnswers(data);
    var detalle   = Object.keys(grade.results).map(function(q){
      return q + ":" + (grade.results[q] === "correcta" ? "✓" : "✗");
    }).join("  ");
    var resumen = grade.correct + "/" + grade.total + "  →  " + detalle;
    var row = [timestamp, nombre];
    QUESTION_IDS.forEach(function(id){ row.push(data[id] || ""); });
    row.push(resumen);
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function testDoPost() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        nombre: "Prueba Manual",
        q1: "Un Servlet es un componente Java.",
        q2: "b",
        q3: "CalculoServlet | post | text | nombre | number | sueldo | number | dias | submit",
        q4: "true",
        q5: "getParameter",
        q6: "setAttribute | nombre | nombre",
        q7: "getRequestDispatcher | forward",
        q8: "false",
        q9: "Verifica si el carrito existe en sesión.",
        q10: "d",
        q11: "true",
        timestamp: new Date().toISOString()
      })
    }
  };
  var result = doPost(fakeEvent);
  console.log("Resultado: " + result.getContent());
}

function getOrCreateSheet() {
  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Respuestas";
  return ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var r = sheet.getRange(1, 1, 1, HEADERS.length);
    r.setFontWeight("bold");
    r.setBackground("#1d1f2b");
    r.setFontColor("#ffb454");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
}
