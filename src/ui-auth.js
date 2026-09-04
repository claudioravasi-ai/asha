/* =========================================================================
   ENTRADA CON CUENTA
   -------------------------------------------------------------------------
   Se usa Firebase Authentication con correo y contraseña. NO hay claves
   numericas compartidas: una clave de cuatro digitos que sabe todo el
   consultorio no identifica a nadie, y en una historia clinica hace falta
   saber quien escribio que.

   Las cuentas se crean DESDE LA APLICACION, pero solo con un codigo de
   invitacion que emite el titular (ver ui-equipo.js). No hay registro
   abierto: tener una cuenta de Firebase no alcanza para entrar, hace falta
   figurar en /dolor/equipo, y eso lo exigen las reglas de la base.
   ========================================================================= */
'use strict';

function pantallaEntrada() {
  document.body.innerHTML =
    '<div id="app"><div class="lienzo" style="align-items:center;justify-content:center">' +
    '<section class="ventana" style="max-width:420px;flex:0 1 420px">' +
    '<div class="cuerpo" id="entrada"></div></section></div></div>' +
    '<div id="avisos"></div>';
  const c = $('#entrada');

  c.insertAdjacentHTML('beforeend',
    '<div style="text-align:center;padding:14px 0 22px">' +
    '<div style="font-size:26px;font-weight:700;letter-spacing:.09em">' + esc(MARCA.nombre) + '</div>' +
    (MARCA.firma ? '<div style="font-size:13px;color:var(--acento);margin-top:2px">' +
      esc(MARCA.firma) + '</div>' : '') +
    '<div class="nota" style="margin-top:3px">' + esc(MARCA.bajada) + '</div></div>');

  if (!firebaseConfigurado()) {
    c.insertAdjacentHTML('beforeend',
      '<div class="alerta medio"><b>Firebase todavía no está configurado</b>' +
      '<p>La aplicación va a funcionar solo en este dispositivo: sin sincronización y sin ' +
      'portal del paciente. Para activarlos hay que completar <span class="mono">' +
      'src/firebase-config.js</span> y pegar las reglas de <span class="mono">' +
      'reglas-firebase.txt</span>.</p></div>');
    c.appendChild(superficie('Entrar en modo local', 'Los datos quedan solo en esta computadora',
      () => { ESTADO.usuario = {email:'local', rol:'medico'}; iniciarAplicacion(); }, 'acento'));
    return;
  }

  const d = {email:'', clave:''};
  campo(c, 'Correo', d, 'email', {tipo:'email'});
  campo(c, 'Contraseña', d, 'clave', {tipo:'password'});

  c.appendChild(superficie('Entrar', null, () => {
    if (!emailValido(d.email) || !d.clave) return avisar('Completá el correo y la contraseña.', 'error');
    fbAuth.signInWithEmailAndPassword(d.email.trim(), d.clave)
      .then(() => avisar('Bienvenido.', 'ok'))
      .catch(e => {
        const m = {
          'auth/user-not-found':'No hay ninguna cuenta con ese correo.',
          'auth/wrong-password':'La contraseña no es correcta.',
          'auth/invalid-credential':'El correo o la contraseña no son correctos.',
          'auth/too-many-requests':'Demasiados intentos. Esperá unos minutos.',
          'auth/network-request-failed':'Sin conexión a internet.'
        }[e.code] || e.message;
        avisar(m, 'error');
      });
  }, 'acento'));

  c.insertAdjacentHTML('beforeend',
    '<p class="nota" style="margin-top:16px">¿Todavía no tenés cuenta? Se crea desde acá, ' +
    'con el <b>código de invitación</b> que te da el titular del consultorio. Si sos el ' +
    'titular y es la primera vez, no hace falta código.</p>');

  /* La pregunta de la primera vez ("¿y yo cómo entro?") tiene que estar
     contestada acá y no solamente en un archivo aparte: es justo el momento
     en que nadie va a ir a buscar el manual. */
  c.appendChild(superficie('Crear mi cuenta',
    'Con el código de invitación que te dio el titular', pantallaRegistro, 'suave'));

  c.appendChild(superficie('¿Es la primera vez? Cómo funciona',
    'Quién puede crear cuentas y por qué', pantallaPrimeraCuenta, 'fina'));

  c.appendChild(superficie('Olvidé mi contraseña', null, () => {
    if (!emailValido(d.email)) return avisar('Escribí primero tu correo arriba.', 'error');
    fbAuth.sendPasswordResetEmail(d.email.trim())
      .then(() => avisar('Te mandamos un correo para restablecerla.', 'ok'))
      .catch(() => avisar('No se pudo enviar el correo.', 'error'));
  }, 'fina'));
}

function vigilarSesion() {
  if (!fbAuth) { pantallaEntrada(); return; }
  fbAuth.onAuthStateChanged(u => {
    if (!u) { ESTADO.usuario = null; pantallaEntrada(); return; }

    ESTADO.usuario = {uid:u.uid, email:u.email, rol:null};

    /* Estar logueado NO alcanza: hay que figurar en el equipo. Se consulta el
       propio registro, que es lo unico que las reglas dejan leer a alguien
       que todavia no es miembro. */
    fbDb.ref('dolor/equipo/' + u.uid).once('value')
      .then(s => {
        const m = s.val();
        if (!m) { pantallaSinAcceso(); return; }
        ESTADO.usuario.rol = m.rol;
        ESTADO.usuario.nombre = m.nombre;
        iniciarAplicacion();
      })
      .catch(() => {
        /* Si ni siquiera se puede leer el propio registro, o las reglas no
           estan publicadas o no hay conexion. Se dice cual de las dos. */
        if (ESTADO.conectado === false) {
          avisar('Sin conexión. Reintentando…', 'aviso');
          setTimeout(() => vigilarSesion(), 3000);
        } else {
          pantallaSinAcceso();
        }
      });
  });
}


/* -------------------------------------------------------------------------
   Instructivo de la primera cuenta.
   ------------------------------------------------------------------------- */
function pantallaPrimeraCuenta() {
  /* Solo tiene sentido sobre la pantalla de entrada; si se llama desde otro
     lado, se la vuelve a montar en vez de reventar contra un nodo que no existe. */
  if (!$('#entrada')) pantallaEntrada();
  const c = $('#entrada');
  if (!c) return;
  c.innerHTML =
    '<div style="text-align:center;padding:10px 0 18px">' +
    '<div style="font-size:20px;font-weight:700;letter-spacing:.07em">' + esc(MARCA.nombre) + '</div>' +
    '<div class="nota">Cómo crear la primera cuenta</div></div>';

  c.insertAdjacentHTML('beforeend',
    '<p>Las cuentas se crean <b>desde acá</b>, pero no cualquiera puede crearse una: ' +
    'hace falta un <b>código de invitación</b> que genera el titular del consultorio.</p>' +

    '<div class="bloque"><h3>Si sos el titular y es la primera vez</h3>' +
    '<ol style="margin:0;padding-left:20px;font-size:13.5px;line-height:1.7">' +
    '<li>Tocá <b>«Crear mi cuenta»</b> en la pantalla anterior.</li>' +
    '<li>Como todavía no hay ninguna cuenta, no te va a pedir código.</li>' +
    '<li>Poné tu nombre, tu correo y una contraseña.</li>' +
    '<li>Quedás como <b>titular</b>, con acceso completo.</li>' +
    '</ol>' +
    '<p class="nota" style="margin-top:9px">Hacelo <b>apenas publiques la aplicación</b>. ' +
    'Hasta que exista la primera cuenta, esa pantalla está abierta para cualquiera que ' +
    'conozca la dirección. En cuanto hay un miembro, se cierra sola.</p></div>' +

    '<div class="bloque"><h3>Para dar de alta a alguien más</h3>' +
    '<ol style="margin:0;padding-left:20px;font-size:13.5px;line-height:1.7">' +
    '<li>El titular entra a <b>Ajustes → Equipo → «Invitar a alguien»</b>.</li>' +
    '<li>Pone el nombre, el correo y el rol: médico o secretaría.</li>' +
    '<li>La aplicación genera un <b>código</b> de una sola vez.</li>' +
    '<li>Se lo pasa por el medio que quiera.</li>' +
    '<li>Esa persona toca <b>«Crear mi cuenta»</b> y usa el código.</li>' +
    '</ol></div>' +

    '<div class="alerta info"><b>Por qué no alcanza con tener una cuenta</b>' +
    '<p>Cualquiera que conozca la dirección de la aplicación puede registrarse en ' +
    'Firebase: la clave del proyecto viaja dentro del programa y eso es así por diseño. ' +
    'Por eso las reglas de la base <b>no</b> preguntan si estás logueado, sino si figurás ' +
    'en el equipo. Una cuenta que no fue invitada no puede leer ni escribir nada.</p></div>' +

    '<div class="alerta alto"><b>Antes de cargar un paciente real</b>' +
    '<p>Tienen que estar publicadas las reglas de seguridad ' +
    '(<span class="mono">reglas-firebase.txt</span>). Sin ellas nada de lo de arriba se ' +
    'cumple. Está en el paso 3 de PUBLICAR.md.</p></div>');

  c.appendChild(superficie('◀ Volver a la pantalla de entrada', null, pantallaEntrada, 'suave'));
}
