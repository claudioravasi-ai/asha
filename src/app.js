/* =========================================================================
   ARRANQUE
   -------------------------------------------------------------------------
   Decide en que modo abre la aplicacion:

     #turno   o  #c=TOKEN     -> portal del paciente, sin pedir cuenta
     cualquier otra cosa      -> consultorio, con cuenta

   El portal tiene que poder abrirse SIN sesion: el paciente no tiene cuenta
   ni la va a tener. Por eso se decide antes de mirar la autenticacion.
   ========================================================================= */
'use strict';

function esPortal() {
  const h = location.hash || '';
  return h === '#turno' || /^#c=[a-f0-9]{20,}/i.test(h);
}

function iniciarAplicacion() {
  document.body.className = '';
  /* Se mira #pila y no #app: la pantalla de entrada tambien monta un #app
     propio, asi que preguntar por #app dejaba el armazon de la entrada en su
     lugar y despues no habia donde dibujar las ventanas. */
  if (!$('#pila')) {
    document.body.innerHTML = window.ALGOS_BODY;
  }
  $('#marcaNombre').textContent = MARCA.nombre;
  $('#marcaFirma').textContent = MARCA.firma || '';
  $('#marcaBajada').textContent = MARCA.bajada;
  $('#volverInicio').onclick = () => volverA(0);
  pintarEstadoConexion();
  pintarUsuario();
  escucharDatos();
  ESTADO.listo = true;
  /* Los borrados diferidos vencidos se ejecutan al abrir, porque el plazo
     pudo cumplirse con la aplicacion cerrada. */
  vigilarBorrados();
  PILA.length = 0;
  ventanaInicio();
}

function arrancar() {
  cargarLocal();
  window.ALGOS_BODY = document.body.innerHTML;
  iniciarFirebase();

  if (esPortal()) { arrancarPortal(); return; }
  if (firebaseConfigurado() && fbAuth) vigilarSesion();
  else pantallaEntrada();

  /* Si el usuario pega un enlace del portal con la aplicación ya abierta,
     se recarga en modo portal en vez de quedarse en una pantalla que no
     corresponde. */
  window.addEventListener('hashchange', () => {
    if (esPortal()) location.reload();
  });
}

/* Registro del service worker: la aplicación tiene que abrir sin internet.
   En un consultorio la conexión se cae, y una historia clínica que no se
   puede abrir cuando el paciente está sentado enfrente no sirve. */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

document.addEventListener('DOMContentLoaded', arrancar);
