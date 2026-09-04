/**
 * ASHA — envío de correo
 * ---------------------------------------------------------------------------
 * Este programa vive en Google Apps Script y es lo único que puede mandar
 * mails: un navegador no puede hacerlo por sí solo.
 *
 * CÓMO INSTALARLO (una sola vez)
 *   1. Entrar a script.google.com con la cuenta de Google del consultorio.
 *   2. Proyecto nuevo. Borrar lo que haya y pegar TODO este archivo.
 *   3. Cambiar CLAVE_COMPARTIDA por una frase larga y propia.
 *   4. Implementar → Nueva implementación → Aplicación web
 *        Ejecutar como:      Yo
 *        Quién tiene acceso: Cualquier persona
 *   5. Copiar la URL que termina en /exec.
 *   6. Pegar esa URL y la misma frase en src/email-config.js de la app.
 *   7. Reconstruir con  python3 build.py
 *
 * SEGURIDAD
 * La clave compartida viaja dentro del index.html, que es público. No es un
 * secreto fuerte: es una traba. Las defensas reales son el tope diario y el
 * registro de todo lo que se envía, que están más abajo. Ante un uso raro:
 * cambiar la frase acá y en la app, reimplementar, reconstruir.
 */

var CLAVE_COMPARTIDA = 'asha-pevere-ushuaia-2026-k7m3';

/**
 * DE QUE CASILLA SALEN LOS CORREOS
 * De la cuenta de Google con la que se crea ESTE proyecto de Apps Script, y de
 * ninguna otra. No se elige acá: se elige al entrar a script.google.com.
 * Si el proyecto se crea con mmpevere1@gmail.com, el paciente recibe el correo
 * desde mmpevere1@gmail.com.
 *
 * Lo unico configurable es el NOMBRE que el paciente ve como remitente, que es
 * lo de abajo. En la bandeja del paciente va a figurar asi:
 *
 *     ASHA — Dra. Marcela Pevere  <mmpevere1@gmail.com>
 */
var NOMBRE_REMITENTE = 'ASHA — Dra. Marcela Pevere';

/**
 * A donde van las respuestas si el paciente contesta el correo.
 * Dejarlo vacio para que vayan a la misma casilla que lo envio.
 */
var RESPONDER_A = '';

/**
 * Tope diario de envios, como defensa por si alguien encuentra la clave en el
 * codigo publico y la usa. Gmail gratuito permite unos 100 por dia; una cuenta
 * de Google Workspace, 1500. Sesenta alcanza de sobra para un consultorio y
 * deja margen para que el tope de Google no se agote con esto.
 */
var TOPE_DIARIO = 60;

function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);

    if (datos.clave !== CLAVE_COMPARTIDA) {
      registrar('RECHAZADO', datos.para || '?', 'clave incorrecta');
      return responder({ok: false, error: 'no autorizado'});
    }
    if (!datos.para || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.para)) {
      return responder({ok: false, error: 'destinatario inválido'});
    }
    if (contarHoy() >= TOPE_DIARIO) {
      registrar('TOPE', datos.para, 'se alcanzó el tope diario');
      return responder({ok: false, error: 'tope diario alcanzado'});
    }

    var envio = {
      to: datos.para,
      subject: datos.asunto || 'Unidad de Dolor',
      htmlBody: datos.html || '',
      name: NOMBRE_REMITENTE
    };
    if (RESPONDER_A) envio.replyTo = RESPONDER_A;
    MailApp.sendEmail(envio);

    registrar('ENVIADO', datos.para, datos.tipo || '');
    return responder({ok: true});

  } catch (err) {
    registrar('ERROR', '?', String(err));
    return responder({ok: false, error: String(err)});
  }
}

function doGet() {
  return responder({ok: true, estado: 'activo', enviadosHoy: contarHoy(), tope: TOPE_DIARIO});
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Registro de todo lo que pasa por acá, en una hoja de cálculo del Drive de
 * la misma cuenta. Es la única forma de darse cuenta si alguien encontró la
 * clave en el código y la está usando.
 */
function hojaRegistro() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('HOJA_REGISTRO');
  if (id) {
    try { return SpreadsheetApp.openById(id).getSheets()[0]; } catch (e) {}
  }
  var ss = SpreadsheetApp.create('ASHA — registro de correos enviados');
  ss.getSheets()[0].appendRow(['Fecha', 'Resultado', 'Destinatario', 'Detalle']);
  props.setProperty('HOJA_REGISTRO', ss.getId());
  return ss.getSheets()[0];
}

function registrar(resultado, para, detalle) {
  try {
    hojaRegistro().appendRow([new Date(), resultado, para, detalle || '']);
  } catch (e) { /* si el registro falla, el envío no debe fallar por eso */ }
}

function contarHoy() {
  try {
    var hoja = hojaRegistro();
    var filas = hoja.getDataRange().getValues();
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var n = 0;
    for (var i = 1; i < filas.length; i++) {
      var f = new Date(filas[i][0]);
      if (f >= hoy && filas[i][1] === 'ENVIADO') n++;
    }
    return n;
  } catch (e) { return 0; }
}

/**
 * PRUEBA. Ejecutar esta funcion desde el editor (boton "Ejecutar") y revisar
 * la casilla. El correo llega a la misma cuenta que ejecuta el script, asi que
 * ademas sirve para confirmar DE QUE DIRECCION van a salir los correos al
 * paciente: la que figure como remitente es esa.
 */
function probar() {
  var casilla = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail({
    to: casilla,
    subject: 'ASHA — prueba de envío',
    htmlBody: '<p>Si recibiste esto, el envío de correo está funcionando.</p>' +
              '<p>Los correos a los pacientes van a salir desde <b>' + casilla + '</b>, ' +
              'con el nombre visible «' + NOMBRE_REMITENTE + '».</p>' +
              '<p>Cuota restante hoy: ' + MailApp.getRemainingDailyQuota() + ' correos.</p>',
    name: NOMBRE_REMITENTE
  });
  Logger.log('Enviado a ' + casilla + '. Cuota restante: ' +
             MailApp.getRemainingDailyQuota());
}
