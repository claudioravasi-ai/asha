/* =========================================================================
   EQUIPO: ALTAS, INVITACIONES Y ROLES
   -------------------------------------------------------------------------
   POR QUE NO HAY REGISTRO ABIERTO, Y POR QUE TAMPOCO HACE FALTA IR A LA
   CONSOLA DE FIREBASE

   Firebase permite que cualquiera que tenga la direccion de la aplicacion se
   cree una cuenta, porque la clave del proyecto viaja dentro del index.html
   y eso es asi por diseño. Si las reglas de la base dijeran "dejo entrar a
   cualquiera que este logueado", cualquier persona podria registrarse sola y
   leer todas las historias clinicas.

   La solucion no es prohibir el registro: es separar DOS cosas que suelen
   confundirse.

     · Tener una CUENTA en Firebase  →  cualquiera puede sacarse una.
     · Pertenecer al EQUIPO          →  solo por invitacion del titular.

   Las reglas de la base exigen lo segundo. Una cuenta que no figura en
   /dolor/equipo no puede leer ni escribir absolutamente nada, aunque haya
   logrado registrarse.

   Con eso, las altas se pueden hacer comodamente desde la aplicacion:
   el titular invita, la persona se registra con el codigo, y listo. Nadie
   tiene que entrar a la consola de Firebase mas que una vez, para la primera
   cuenta.

   LA PRIMERA CUENTA
   Cuando /dolor/equipo esta vacio, la aplicacion deja crear la primera cuenta
   directamente, y quien la crea queda como TITULAR. Es la unica ventana
   abierta que existe y se cierra sola en cuanto hay un miembro. Por eso el
   instructivo insiste en crear esa cuenta apenas se publica la aplicacion y
   no dias despues.
   ========================================================================= */
'use strict';

const ROLES = {
  titular: {
    nombre:'Titular',
    detalle:'Acceso completo. Es la única que puede invitar y dar de baja.',
    puede:['clinica','agenda','equipo','ajustes']
  },
  medico: {
    nombre:'Médico',
    detalle:'Acceso clínico completo: historias, motor, medicación, procedimientos.',
    puede:['clinica','agenda','ajustes']
  },
  secretaria: {
    nombre:'Secretaría',
    detalle:'Agenda, datos de filiación y bandeja de precargados. NO ve el contenido ' +
            'clínico de las historias: ni diagnóstico, ni medicación, ni evoluciones.',
    puede:['agenda']
  }
};

/* ¿Puede el usuario actual hacer esto? En modo local no hay equipo y se
   asume acceso completo: es una sola computadora sin sincronizar. */
function puede(accion) {
  if (!firebaseConfigurado()) return true;
  const yo = miembroActual();
  if (!yo) return false;
  return (ROLES[yo.rol] || ROLES.secretaria).puede.includes(accion);
}

function miembroActual() {
  if (!ESTADO.usuario || !ESTADO.usuario.uid) return null;
  return (ESTADO.equipo || {})[ESTADO.usuario.uid] || null;
}

function esTitular() {
  const yo = miembroActual();
  return !!yo && yo.rol === 'titular';
}

/* Codigo de invitacion legible: seis grupos de cuatro no se dictan por
   telefono sin equivocarse. Cuatro grupos de cuatro, en mayusculas y sin
   caracteres que se confundan (0/O, 1/I/L). */
function codigoInvitacion() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const a = new Uint8Array(16);
  (window.crypto || window.msCrypto).getRandomValues(a);
  const s = [...a].map(b => abc[b % abc.length]).join('');
  return s.match(/.{1,4}/g).join('-');
}

/* =========================================================================
   VENTANA DE EQUIPO
   ========================================================================= */

function ventanaEquipo() {
  abrir({id:'equipo', titulo:'Equipo', sub:'Quién puede entrar y con qué alcance',
    ancha:true, dibujar(c) {
      if (!firebaseConfigurado()) {
        c.innerHTML = vacio('La aplicación está en modo local',
          'Sin Firebase configurado no hay cuentas ni equipo: la aplicación funciona en ' +
          'esta computadora y nada más. El instructivo está en PUBLICAR.md, pasos 2 a 4.');
        return;
      }

      const equipo = Object.entries(ESTADO.equipo || {});
      const invitaciones = Object.entries(ESTADO.invitaciones || {})
        .filter(([, i]) => i && !i.usada);

      /* ---- invitar ---------------------------------------------------- */
      if (esTitular()) {
        c.appendChild(superficie('+ Invitar a alguien',
          'Genera un código para que se registre desde la aplicación',
          () => ventanaInvitar(), 'acento'));
      } else {
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta info"><b>Solo el titular puede invitar</b>' +
          '<p>Pedile a quien tiene el rol de titular que genere el código.</p></div>');
      }

      /* ---- invitaciones pendientes ------------------------------------ */
      if (invitaciones.length) {
        c.insertAdjacentHTML('beforeend',
          '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
          'color:var(--tinta-3);margin:20px 0 8px">Invitaciones sin usar · ' +
          invitaciones.length + '</h3>');
        for (const [cod, i] of invitaciones) {
          const caja = document.createElement('div');
          caja.className = 'bloque';
          caja.style.marginBottom = '8px';
          caja.innerHTML =
            '<div style="display:flex;gap:9px;align-items:baseline">' +
            '<b style="flex:1">' + esc(i.nombre || i.email) + '</b>' +
            marca(ROLES[i.rol] ? ROLES[i.rol].nombre : i.rol, 'acento') + '</div>' +
            '<div class="nota" style="margin-top:3px">' + esc(i.email) + ' · creada ' +
            esc(desdeHace(i.creado)) + '</div>' +
            '<div class="mono" style="font-size:17px;letter-spacing:.09em;margin:9px 0;' +
            'font-weight:600">' + esc(cod) + '</div>';
          caja.appendChild(superficie('Copiar el código', null, () => {
            navigator.clipboard.writeText(cod)
              .then(() => avisar('Código copiado.', 'ok'))
              .catch(() => avisar('No se pudo copiar. Anotalo a mano.', 'error'));
          }, 'fina suave'));
          if (esTitular()) {
            caja.appendChild(superficie('Anular la invitación', null, () => {
              borrar('invitaciones', cod);
              avisar('Invitación anulada.');
              refrescar();
            }, 'fina peligro'));
          }
          c.appendChild(caja);
        }
      }

      /* ---- miembros ---------------------------------------------------- */
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:20px 0 8px">Miembros · ' + equipo.length + '</h3>');

      for (const [uid, m] of equipo) {
        const soyYo = ESTADO.usuario && ESTADO.usuario.uid === uid;
        const caja = document.createElement('div');
        caja.className = 'bloque';
        caja.style.marginBottom = '8px';
        caja.innerHTML =
          '<div style="display:flex;gap:9px;align-items:baseline">' +
          '<b style="flex:1">' + esc(m.nombre || m.email) +
          (soyYo ? ' <span class="nota">— sos vos</span>' : '') + '</b>' +
          marca(ROLES[m.rol] ? ROLES[m.rol].nombre : m.rol,
                m.rol === 'titular' ? 'acento' : 'neutro') + '</div>' +
          '<div class="nota" style="margin-top:3px">' + esc(m.email) +
          ' · desde ' + esc(fechaCorta(m.alta)) + '</div>' +
          '<div class="nota" style="margin-top:5px">' +
          esc((ROLES[m.rol] || {}).detalle || '') + '</div>';

        if (esTitular() && !soyYo) {
          const cambiar = document.createElement('div');
          cambiar.style.marginTop = '9px';
          caja.appendChild(cambiar);
          opciones(cambiar, Object.entries(ROLES).map(([v, r]) => ({t:r.nombre, v})), m.rol,
            v => {
              if (!v) return;
              m.rol = v;
              guardar('equipo', uid, m);
              avisar('Rol actualizado.', 'ok');
              refrescar();
            });
          caja.appendChild(superficie('Quitar del equipo',
            'Deja de tener acceso de inmediato', () => {
              confirmar('Quitar a ' + (m.nombre || m.email),
                'Va a perder el acceso a la aplicación en el momento. Su cuenta de correo ' +
                'sigue existiendo, pero deja de pertenecer al equipo y las reglas de la base ' +
                'no le permiten leer ni escribir nada.',
                () => { borrar('equipo', uid); avisar('Miembro quitado.'); refrescar(); },
                'Sí, quitar');
            }, 'fina peligro'));
        }
        c.appendChild(caja);
      }

      c.insertAdjacentHTML('beforeend',
        '<div class="alerta info" style="margin-top:18px"><b>Cómo funciona el acceso</b>' +
        '<p>Tener una cuenta de correo en Firebase <b>no alcanza</b> para entrar: las reglas ' +
        'de la base exigen figurar en esta lista. Una cuenta que no está acá no puede leer ' +
        'ni escribir nada, aunque haya logrado registrarse por su cuenta.</p></div>');
    }});
}

function ventanaInvitar() {
  abrir({id:'invitar', titulo:'Invitar a alguien', dibujar(c) {
    const d = {nombre:'', email:'', rol:'medico'};

    campo(c, 'Nombre y apellido', d, 'nombre', {pista:'para saber quién es en la lista'});
    campo(c, 'Correo', d, 'email', {tipo:'email',
      ayuda:'Tiene que ser el mismo con el que se va a registrar: las reglas de la base ' +
            'lo verifican.'});

    const cr = document.createElement('div');
    cr.className = 'campo';
    cr.innerHTML = '<label>Rol</label>';
    c.appendChild(cr);
    const detalle = document.createElement('div');
    detalle.className = 'ayuda';
    opciones(cr, Object.entries(ROLES).map(([v, r]) => ({t:r.nombre, v})), d.rol, v => {
      d.rol = v || 'medico';
      detalle.textContent = (ROLES[d.rol] || {}).detalle || '';
    });
    detalle.textContent = ROLES[d.rol].detalle;
    cr.appendChild(detalle);

    c.appendChild(superficie('Generar el código', null, () => {
      if (!emailValido(d.email)) return avisar('El correo no parece válido.', 'error');
      if (!d.nombre.trim()) return avisar('Poné el nombre, para reconocerlo en la lista.', 'error');
      const cod = codigoInvitacion();
      guardar('invitaciones', cod, {
        codigo:cod, nombre:d.nombre.trim(), email:d.email.trim().toLowerCase(),
        rol:d.rol, creado:ahora(), por:(ESTADO.usuario || {}).email || '', usada:false
      }).then(() => {
        avisar('Invitación creada.', 'ok');
        volverA(PILA.length - 2);
      });
    }, 'acento'));

    c.insertAdjacentHTML('beforeend',
      '<p class="nota" style="margin-top:14px">Después le pasás el código por el medio que ' +
      'quieras. La persona entra a la aplicación, toca <b>«Crear mi cuenta»</b>, pone su ' +
      'correo, una contraseña y ese código. El código sirve <b>una sola vez</b> y solo para ' +
      'el correo que pusiste.</p>');
  }});
}

/* =========================================================================
   REGISTRO DESDE LA APLICACION
   ========================================================================= */

/* -------------------------------------------------------------------------
   Marca publica de instalacion.

   Quien todavia no tiene cuenta NO puede leer /dolor/equipo: las reglas se lo
   impiden, y esta bien que asi sea. Pero entonces la pantalla de registro no
   tiene forma de saber si el consultorio ya tiene titular, y creia siempre
   que estaba vacio: le ofrecia a cualquiera el alta de titular, aunque la
   base despues se lo rechazara.

   Por eso hay un unico dato PUBLICO en toda la base: un si o un no que dice
   "este consultorio ya esta instalado". No revela nada —ni quien es, ni
   cuantos son, ni ningun correo— y es lo que permite que la pantalla diga la
   verdad antes de pedir nada.
   ------------------------------------------------------------------------- */
function consultarInstalado() {
  /* En modo local no hay equipo ni nube: se comporta como recien instalado. */
  if (!fbDb) return Promise.resolve(false);
  return fbDb.ref('dolor/publico/instalado').once('value')
    .then(s => s.val() === true)
    .catch(() => true);   /* ante la duda, se exige codigo */
}

/* La marca de instalado se escribe al crear la primera cuenta. Pero los
   consultorios que ya tenian titular ANTES de que existiera esa marca se
   quedaron sin ella, y entonces la pantalla de registro seguia ofreciendo el
   alta de titular a cualquiera. Se repara sola: cuando entra un titular y la
   marca no esta, se pone. Una vez, en silencio, y no vuelve a pasar. */
function marcarInstalado(miembro) {
  if (!fbDb || !miembro || miembro.rol !== 'titular') return;
  fbDb.ref('dolor/publico/instalado').once('value')
    .then(s => { if (s.val() !== true) return fbDb.ref('dolor/publico/instalado').set(true); })
    .catch(() => {});
}

/* La pantalla de registro pide SIEMPRE el codigo de invitacion, y solo ofrece
   el alta de titular cuando alguien la pide expresamente.

   Antes era al reves: consultaba la marca de instalado y, si no estaba,
   ofrecia el alta de titular. El problema es que "la marca no esta" no
   significa "no hay titular": significa que no se pudo leer, o que se
   escribio con una version anterior, o que las reglas la bloquean. Frente a
   la duda, la pantalla se comportaba de la manera mas permisiva, que es
   justo la que no corresponde.

   Ahora la duda se resuelve al reves y quien manda es la base: si alguien
   fuerza el alta de titular con un titular ya existente, las reglas la
   rechazan y se le dice por que. */
function pantallaRegistro() {
  const c = $('#entrada');
  if (!c) return;
  dibujarRegistro(c, true);
}

function dibujarRegistro(c, instalado) {
  c.innerHTML =
    '<div style="text-align:center;padding:10px 0 18px">' +
    '<div style="font-size:20px;font-weight:700;letter-spacing:.07em">' + esc(MARCA.nombre) + '</div>' +
    '<div class="nota">Crear mi cuenta</div></div>';

  /* La salida va ARRIBA: en la pantalla anterior estaba al final de un texto
     largo y quien entraba por error no encontraba como volver. */
  c.appendChild(superficie('◀ Volver', null, pantallaEntrada, 'fina'));

  const d = {email:'', clave:'', clave2:'', codigo:'', nombre:''};
  const equipoVacio = !instalado;   // true solo si se pidio el alta de titular

  if (equipoVacio) {
    c.insertAdjacentHTML('beforeend',
      '<div class="alerta medio"><b>Alta de titular</b>' +
      '<p>Esto solo funciona si el consultorio <b>todavía no tiene ninguna cuenta</b>. ' +
      'Si ya hay un titular, la base va a rechazar el alta y hay que pedirle un código ' +
      'de invitación.</p></div>');
    c.appendChild(superficie('Tengo un código de invitación', null,
      () => dibujarRegistro(c, true), 'fina'));
  } else {
    campo(c, 'Código de invitación', d, 'codigo',
      {pista:'XXXX-XXXX-XXXX-XXXX',
       ayuda:'Con el código de invitación que te dio el titular. Se escribe con guiones, ' +
             'como te lo pasaron.'});
  }

  campo(c, 'Nombre y apellido', d, 'nombre');
  campo(c, 'Correo', d, 'email', {tipo:'email'});
  campo(c, 'Contraseña', d, 'clave', {tipo:'password',
    ayuda:'Al menos 8 caracteres. No la reutilices de otro servicio.'});
  campo(c, 'Repetir la contraseña', d, 'clave2', {tipo:'password'});

  c.appendChild(superficie('Crear mi cuenta', null, () => {
    if (!d.nombre.trim())          return avisar('Poné tu nombre y apellido.', 'error');
    if (!emailValido(d.email))     return avisar('El correo no parece válido.', 'error');
    if ((d.clave || '').length < 8) return avisar('La contraseña necesita al menos 8 caracteres.', 'error');
    if (d.clave !== d.clave2)      return avisar('Las dos contraseñas no coinciden.', 'error');

    const email = d.email.trim().toLowerCase();
    const cod = (d.codigo || '').trim().toUpperCase();

    const seguir = invitacion => {
      if (!equipoVacio) {
        if (!invitacion)
          return avisar('Ese código de invitación no existe.', 'error');
        if (invitacion.usada)
          return avisar('Ese código ya fue usado. Pedí uno nuevo.', 'error');
        if (String(invitacion.email).toLowerCase() !== email)
          return avisar('El código fue emitido para otro correo (' +
                        invitacion.email + '). Registrate con ese.', 'error');
      }

      /* Se marca que hay un alta en curso para que la vigilancia de sesion no
         mire el equipo antes de que el registro exista. Ver ui-auth.js. */
      window.REGISTRANDO = true;

      fbAuth.createUserWithEmailAndPassword(email, d.clave)
        .then(cred => {
          const uid = cred.user.uid;
          const miembro = {
            uid, email, nombre:d.nombre.trim(),
            rol: equipoVacio ? 'titular' : invitacion.rol,
            alta: ahora(),
            codigo: equipoVacio ? '' : cod
          };
          return fbDb.ref('dolor/equipo/' + uid).set(miembro)
            .then(() => {
              if (!equipoVacio) {
                return fbDb.ref('dolor/invitaciones/' + cod)
                  .update({usada:true, usadaEn:ahora(), usadaPor:uid});
              }
              /* Primera cuenta: se cierra la puerta para el que venga despues. */
              return fbDb.ref('dolor/publico/instalado').set(true);
            })
            .then(() => {
              avisar(equipoVacio
                ? 'Cuenta de titular creada. Ya podés invitar al resto desde Ajustes → Equipo.'
                : 'Cuenta creada. Bienvenido.', 'ok', 8000);
              /* Recien ahora el registro existe: se libera la vigilancia y se
                 la vuelve a disparar para que entre con el rol ya cargado. */
              window.REGISTRANDO = false;
              vigilarSesion();
            });
        })
        .catch(e => {
          window.REGISTRANDO = false;
          const m = {
            'auth/email-already-in-use':'Ya existe una cuenta con ese correo. Probá entrar, ' +
              'o usá «Olvidé mi contraseña».',
            'auth/weak-password':'La contraseña es demasiado débil.',
            'auth/invalid-email':'El correo no es válido.',
            'auth/operation-not-allowed':'El registro por correo no está habilitado en ' +
              'Firebase. Hay que activarlo en Authentication → Sign-in method.',
            'auth/network-request-failed':'Sin conexión a internet.',
            'PERMISSION_DENIED': equipoVacio
              ? 'La base rechazó el alta de titular: este consultorio YA tiene una cuenta. ' +
                'Pedile al titular un código de invitación.'
              : 'La base rechazó el alta. Puede ser que el código ya se haya usado, que ' +
                'sea para otro correo, o que las reglas de reglas-firebase.txt no estén ' +
                'publicadas.'
          }[e.code] || e.message;
          avisar(m, 'error', 9000);
          /* Si la cuenta de Firebase llego a crearse pero el alta en el equipo
             fallo, queda una cuenta que existe y no sirve para nada. Se cierra
             la sesion para que el proximo intento arranque limpio y no quede
             la persona en la pantalla de "no pertenecés". */
          if (fbAuth.currentUser) fbAuth.signOut().catch(() => {});
        });
    };

    if (equipoVacio) return seguir(null);
    fbDb.ref('dolor/invitaciones/' + cod).once('value')
      .then(s => seguir(s.val()))
      .catch(() => avisar('No se pudo verificar el código. ¿Hay internet?', 'error'));
  }, 'acento'));

  /* La salida esta arriba y no se repite: dos superficies que hacen lo mismo
     en la misma pantalla obligan a leer las dos para descubrir que no habia
     que elegir nada. */
  if (!equipoVacio) {
    c.insertAdjacentHTML('beforeend',
      '<p class="nota" style="margin-top:16px;padding-top:12px;' +
      'border-top:1px solid var(--linea)">¿Sos el titular y el consultorio todavía no ' +
      'tiene ninguna cuenta? Esa primera cuenta se crea sin código.</p>');
    c.appendChild(superficie('Crear la cuenta de titular',
      'Solo la primera vez, cuando no hay ninguna otra cuenta',
      () => dibujarRegistro(c, false), 'fina'));
  }
}

/* Pantalla que ve alguien que tiene cuenta pero no pertenece al equipo.
   Sin esto, veria una aplicacion vacia y creeria que se perdieron los datos. */
function pantallaSinAcceso() {
  document.body.innerHTML =
    '<div id="app"><div class="lienzo" style="align-items:center;justify-content:center">' +
    '<section class="ventana" style="max-width:460px;flex:0 1 460px">' +
    '<div class="cuerpo" id="entrada"></div></section></div></div><div id="avisos"></div>';
  const c = $('#entrada');
  c.innerHTML =
    '<div style="text-align:center;padding:10px 0 18px">' +
    '<div style="font-size:20px;font-weight:700;letter-spacing:.07em">' + esc(MARCA.nombre) + '</div>' +
    '</div>' +
    '<div class="alerta alto"><b>Tu cuenta no pertenece a este consultorio</b>' +
    '<p>Entraste con <b>' + esc((ESTADO.usuario || {}).email || '') + '</b>, pero esa cuenta ' +
    'no figura en el equipo, así que no puede ver ninguna historia clínica.</p>' +
    '<p>Si tenés que trabajar acá, pedile al titular que te genere un código de invitación ' +
    'y creá la cuenta con ese código.</p></div>';
  c.appendChild(superficie('Cerrar sesión y volver', null, () => {
    if (fbAuth) fbAuth.signOut().then(() => location.reload());
    else location.reload();
  }, 'suave'));
}


/* =========================================================================
   LA CUENTA, ARRIBA A LA DERECHA
   -------------------------------------------------------------------------
   Un cuadradito con las iniciales que abre un panel chico con quien sos, tu
   rol y la salida. Salir tiene que estar SIEMPRE a un toque de distancia y
   a la vista: enterrado en Ajustes, en una computadora compartida, nadie lo
   usa y las sesiones quedan abiertas.
   ========================================================================= */

function pintarUsuario() {
  const n = $('#usuario');
  if (!n) return;

  const m = miembroActual();
  const nombre = m ? (m.nombre || m.email)
    : (ESTADO.usuario && ESTADO.usuario.email) || '';

  if (!nombre) { n.textContent = ''; n.onclick = null; return; }

  /* Iniciales: dos letras del nombre, o dos del correo si no hay nombre. */
  const ini = nombre.includes('@')
    ? nombre.slice(0, 2).toUpperCase()
    : nombre.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  n.textContent = ini;
  n.title = nombre;
  n.onclick = e => { e.stopPropagation(); abrirPanelCuenta(); };
}

function abrirPanelCuenta() {
  const viejo = $('.panel-cuenta');
  if (viejo) { viejo.remove(); return; }

  const m = miembroActual();
  const email = (ESTADO.usuario && ESTADO.usuario.email) || '';
  const nombre = m ? (m.nombre || email) : email;
  const rol = m ? (ROLES[m.rol] || {}).nombre : (firebaseConfigurado() ? '' : 'Modo local');

  const panel = document.createElement('div');
  panel.className = 'panel-cuenta';
  panel.innerHTML =
    '<div class="quien"><b>' + esc(nombre) + '</b>' +
    (rol ? '<small>' + esc(rol) + '</small>' : '') +
    (email && email !== nombre ? '<small>' + esc(email) + '</small>' : '') +
    '</div>';

  const item = (texto, clase, alTocar) => {
    const d = document.createElement('div');
    d.className = 'item' + (clase ? ' ' + clase : '');
    d.textContent = texto;
    d.onclick = () => { panel.remove(); alTocar(); };
    panel.appendChild(d);
  };

  if (firebaseConfigurado() && esTitular()) item('Equipo', '', ventanaEquipo);
  item('Ajustes', '', ventanaAjustes);
  item('Copia de seguridad', '', exportarRespaldo);

  if (fbAuth && ESTADO.usuario && ESTADO.usuario.uid) {
    item('Salir', 'salir', () => {
      confirmar('Salir de ' + MARCA.nombre,
        'Se cierra la sesión en este dispositivo. Lo que esté guardado en la nube queda ' +
        'intacto y lo volvés a ver al entrar de nuevo.',
        () => {
          fbAuth.signOut()
            .then(() => location.reload())
            .catch(() => avisar('No se pudo cerrar la sesión.', 'error'));
        }, 'Sí, salir');
    });
  } else {
    item('Salir', 'salir', () => {
      confirmar('Salir de ' + MARCA.nombre,
        'Estás en modo local: los datos viven solo en este dispositivo y NO se borran al ' +
        'salir. Se vuelve a la pantalla de entrada.',
        () => location.reload(), 'Sí, salir');
    });
  }

  document.body.appendChild(panel);

  /* Se cierra al tocar en cualquier otro lado. */
  setTimeout(() => {
    const cerrar = e => {
      if (!panel.contains(e.target)) {
        panel.remove();
        document.removeEventListener('click', cerrar);
      }
    };
    document.addEventListener('click', cerrar);
  }, 0);
}
