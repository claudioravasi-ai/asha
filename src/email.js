/* =========================================================================
   CORREO
   -------------------------------------------------------------------------
   Dos envios, y nada mas que dos:

     1. Al PACIENTE, el enlace a su cuestionario.
     2. Al CONSULTORIO, el aviso de que un cuestionario llego completo.

   Si el envio no esta configurado, las dos funciones devuelven false sin
   romper nada y la aplicacion muestra el enlace en pantalla.
   ========================================================================= */
'use strict';

function envioConfigurado() {
  return !!(typeof ENVIO_URL === 'string' && ENVIO_URL && ENVIO_CLAVE);
}

function mandar(carga) {
  if (!envioConfigurado()) return Promise.resolve(false);
  /* Se usa 'text/plain' a proposito: evita el preflight CORS que Apps Script
     no responde. El cuerpo sigue siendo JSON y del otro lado se parsea igual. */
  return fetch(ENVIO_URL, {
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({...carga, clave:ENVIO_CLAVE})
  })
  .then(r => r.json())
  .then(r => !!(r && r.ok))
  .catch(e => { console.error('Envío de correo:', e); return false; });
}

function enviarEnlacePorMail(email, enlace, dni) {
  const asunto = MARCA.nombre + ' — su cuestionario previo a la consulta';
  const cuerpo =
'<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
'max-width:560px;margin:0 auto;color:#141821;line-height:1.55">' +
'<h2 style="margin:0 0 4px;letter-spacing:.06em">' + esc(MARCA.nombre) + '</h2>' +
'<p style="margin:0 0 22px;color:#828b9c;font-size:13px">' + esc(MARCA.bajada) + '</p>' +
'<p>Recibimos su solicitud para completar el cuestionario previo a la consulta.</p>' +
'<p style="margin:24px 0"><a href="' + enlace + '" ' +
'style="background:#2d6a72;color:#fff;padding:13px 24px;border-radius:9px;' +
'text-decoration:none;display:inline-block;font-weight:600">Completar mi cuestionario</a></p>' +
'<p style="font-size:13px;color:#4a5364">Si el botón no funciona, copie y pegue esta dirección ' +
'en su navegador:<br><span style="word-break:break-all;font-family:monospace;font-size:12px">' +
esc(enlace) + '</span></p>' +
'<p style="font-size:13px;color:#4a5364"><b>Guarde este correo.</b> Este enlace es personal y ' +
'es el único que le permite volver a entrar para seguir completándolo. Puede hacerlo en varias ' +
'veces: lo que escriba se guarda solo.</p>' +
'<hr style="border:0;border-top:1px solid #dde1e9;margin:26px 0">' +
'<p style="font-size:11.5px;color:#828b9c;line-height:1.5">' + esc(LEGAL_PIE) + '</p>' +
'<p style="font-size:11.5px;color:#828b9c">Si usted no solicitó este cuestionario, ignore ' +
'este correo: sin abrir el enlace no se registra ningún dato suyo.</p></div>';

  return mandar({para:email, asunto, html:cuerpo, tipo:'enlace-cuestionario', ref:dni});
}

/* Aviso al consultorio. Deliberadamente NO lleva datos clinicos: solo dice
   que hay algo nuevo para mirar. Un correo con la historia adentro es una
   historia clinica viajando por un canal que no controlamos. */
function avisarAlMedico(precarga) {
  if (!MARCA.email) return Promise.resolve(false);
  const d = precarga.datos || {};
  const quien = [d.apellido, d.nombre].filter(Boolean).join(', ') || ('DNI ' + precarga.dni);
  const urgente = (d.banderas || []).length > 0;

  const cuerpo =
'<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
'max-width:520px;color:#141821;line-height:1.55">' +
'<h3 style="margin:0 0 12px">Cuestionario completado</h3>' +
'<p><b>' + esc(quien) + '</b> completó y envió el cuestionario previo a la consulta.</p>' +
(precarga.turno ? '<p>Turno: <b>' + esc(fechaCorta(precarga.turno)) + '</b></p>' : '') +
(urgente ? '<p style="background:#fdecea;border-left:3px solid #d92b2b;padding:10px 13px;' +
'border-radius:7px"><b>Marcó síntomas de alarma en la sección de otros síntomas.</b> ' +
'Conviene revisarlo antes del turno.</p>' : '') +
'<p style="font-size:13px;color:#4a5364">Está disponible en la aplicación, en ' +
'<b>Pacientes precargados</b>. Por resguardo de los datos, el contenido del cuestionario ' +
'no viaja por correo.</p></div>';

  return mandar({para:MARCA.email, asunto:'[' + MARCA.nombre + '] Cuestionario de ' + quien,
                 html:cuerpo, tipo:'aviso-medico'});
}
