/* =========================================================================
   ENTRADA, BASE DE PACIENTES Y BANDEJA DE PRECARGADOS
   -------------------------------------------------------------------------
   La pantalla de entrada es un mosaico de ventanas grandes. No hay menu
   porque no hace falta: lo que se puede hacer esta a la vista y se toca.
   ========================================================================= */
'use strict';

/* ====================================================== INICIO ========== */

function ventanaInicio() {
  abrir({
    id:'inicio', titulo:MARCA.nombre, sub:MARCA.bajada, ancha:true,
    dibujar(c) {
      const pacientes = pacientesReales();
      const precargas = Object.values(ESTADO.precargas);
      const nuevos = precargas.filter(p => p.estado === 'enviado');
      const activos = pacientes.filter(p => p.proximoControl && p.proximoControl >= hoy());
      const agudos = pacientes.filter(p => p.ambito === 'agudo' && p.altaAgudo !== true);

      /* Lo primero es lo que no puede esperar: banderas rojas sin resolver. */
      const conBandera = pacientes.filter(p => {
        const b = (p.antecedentes && p.antecedentes.banderas) || [];
        return b.some(x => ['esfinteres','deficit_progresivo','silla_montar'].includes(x)) &&
               !p.banderaRevisada;
      });
      const porBorrar = pacientes.filter(x => segundosParaBorrar(x) != null);
      if (porBorrar.length) {
        const av = document.createElement('div');
        av.className = 'alerta urgente';
        av.innerHTML = '<b>' + porBorrar.length + ' historia' +
          (porBorrar.length === 1 ? '' : 's') + ' con borrado programado</b>' +
          '<p>' + porBorrar.map(x => esc(nombreCompleto(x)) + ' — se borra en ' +
            relojBorrado(segundosParaBorrar(x))).join(' · ') +
          '. Entrá a la historia para cancelarlo.</p>';
        c.appendChild(av);
      }

      if (conBandera.length && puede('clinica')) {
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta urgente"><b>' + conBandera.length + ' paciente' +
          (conBandera.length === 1 ? '' : 's') + ' con bandera roja sin revisar</b>' +
          '<p>' + esc(conBandera.map(nombreCompleto).join(' · ')) + '</p></div>');
      }

      const m = document.createElement('div');
      m.className = 'mosaico';
      c.appendChild(m);

      teja(m, nuevos.length, 'Precargados',
        nuevos.length ? 'Cuestionarios enviados por pacientes, listos para tomar en consulta'
                      : 'Sin cuestionarios nuevos',
        ventanaPrecargados, nuevos.length ? 'destaca' : '');

      teja(m, pacientes.length, 'Pacientes',
        'Base completa de historias clínicas de dolor', ventanaPacientes);

      teja(m, activos.length, 'En seguimiento',
        'Con control programado a futuro', () => ventanaPacientes('seguimiento'));

      if (puede('clinica')) {
        teja(m, agudos.length, 'Dolor agudo',
          'Interconsultas y postoperatorios en curso', ventanaAgudo);
      }

      /* Lo clinico solo para quien tiene acceso clinico. Sin esto los roles
         serian decorativos: la ficha del rol de secretaria promete que no ve
         diagnostico ni medicacion, y esa promesa hay que cumplirla en el
         codigo, no en el texto. */
      if (puede('clinica')) {
        teja(m, '', 'Estadísticas',
          'Efectividad, diagnósticos y carga opioide del consultorio', ventanaEstadisticas);

        teja(m, '', 'Biblioteca',
          'Síndromes, vademécum, procedimientos y escalas', ventanaBiblioteca);
      }

      c.insertAdjacentHTML('beforeend', '<div style="height:14px"></div>');
      c.appendChild(superficie('+ Paciente nuevo',
        'Abrir una historia clínica de dolor desde cero', () => {
          const p = pacienteNuevo();
          guardar('pacientes', p.id, p);
          ventanaHistoria(p.id);
        }, 'suave'));

      c.appendChild(superficie('Portal del paciente',
        'La dirección y el código QR que se le pasan a quien saca turno',
        ventanaPortalEnlace, 'fina'));

      c.appendChild(superficie('Ajustes y copia de seguridad', null, ventanaAjustes, 'fina'));

      /* La version, siempre a la vista y al pie. Cuando alguien dice que no le
         aparece algo, lo primero que hay que saber es que version esta usando:
         casi siempre es una vieja que quedo en el cache del navegador. */
      const v = versionLegible();
      c.insertAdjacentHTML('beforeend',
        '<p class="nota" style="text-align:center;margin-top:20px;padding-top:14px;' +
        'border-top:1px solid var(--linea);font-size:11.5px">' +
        esc(MARCA.nombre) + (MARCA.firma ? ' · ' + esc(MARCA.firma) : '') + '<br>' +
        esc(v.texto) + '</p>');
    }
  });
}

function teja(cont, numero, titulo, detalle, alTocar, clase) {
  const t = document.createElement('div');
  t.className = 'teja' + (clase ? ' ' + clase : '');
  t.innerHTML = (numero !== '' ? '<div class="n">' + numero + '</div>' : '<div></div>') +
    '<div><b>' + esc(titulo) + '</b><small>' + esc(detalle) + '</small></div>';
  t.onclick = alTocar;
  cont.appendChild(t);
}

/* =========================================================================
   LA PUERTA DE ENTRADA DEL PACIENTE
   -------------------------------------------------------------------------
   Es el paso que mas cuesta de toda la aplicacion. El programa puede estar
   impecable: si el paciente no se entera de que el cuestionario existe, no
   lo completa nadie y las consultas siguen arrancando de cero.

   Por eso esta ventana da las tres formas de que se entere, y no una sola:

     · EL CODIGO QR, para el mostrador. Se apunta la camara y se abre. Es la
       que mejor funciona con quien no escribe comodo en el telefono, que en
       una unidad de dolor es mucha gente.
     · EL CARTEL IMPRESO, que es el QR grande y con instrucciones, listo para
       pegar o para dejar sobre el escritorio.
     · EL CORREO, para cuando el turno se saca por telefono y no hay
       mostrador donde mirar nada.

   El QR se genera aca y ahora a partir de la direccion real en la que esta
   corriendo la aplicacion. No es una imagen guardada: el dia que la
   aplicacion se mude de direccion, el QR se muda con ella sin que nadie
   tenga que acordarse de cambiarlo.
   ========================================================================= */

function urlDelPortal() {
  return location.origin + location.pathname + '#turno';
}

function ventanaPortalEnlace() {
  const url = urlDelPortal();
  abrir({id:'enlace', titulo:'Portal del paciente',
    sub:'Dirección, código QR y envío por correo', ctx:{email:'', mensaje:''},
    dibujar(cc, ctx) {

      cc.insertAdjacentHTML('beforeend',
        '<p>Esta es la puerta de entrada del paciente. Ahí deja su documento y su correo, ' +
        'y le llega a su casilla el enlace personal al cuestionario.</p>');

      /* --- el QR, que es lo que la gente usa de verdad ----------------- */
      const caja = document.createElement('div');
      caja.className = 'qr-caja';
      caja.innerHTML =
        '<div class="qr-lamina">' + qrSVG(url, {nivel:QR_Q}) + '</div>' +
        '<div class="qr-texto">' +
          '<b>Apunte la cámara del teléfono</b>' +
          '<p class="nota">No hace falta ninguna aplicación: la cámara sola lo reconoce ' +
          'y ofrece abrir la página.</p>' +
          '<p class="mono qr-url">' + esc(url) + '</p>' +
        '</div>';
      cc.appendChild(caja);

      cc.appendChild(superficie('Copiar la dirección', null, () => {
        navigator.clipboard.writeText(url)
          .then(() => avisar('Dirección copiada.', 'ok'))
          .catch(() => avisar('No se pudo copiar. Seleccionala a mano.', 'error'));
      }, 'fina suave'));

      cc.appendChild(superficie('Descargar el código QR',
        'Una imagen PNG, para pegarla en un cartel hecho aparte', () => {
          qrPNG(url, {modulo:16, nivel:QR_Q}, datos => {
            if (!datos) return avisar('No se pudo generar el código.', 'error');
            const a = document.createElement('a');
            a.href = datos;
            a.download = normalizar(MARCA.nombre).replace(/[^a-z0-9]+/g, '-') +
                         '-portal-qr.png';
            a.click();
            avisar('Código QR descargado.', 'ok');
          });
        }, 'fina suave'));

      cc.appendChild(superficie('Imprimir el cartel para el mostrador',
        'Una hoja lista para pegar, con el código grande y las instrucciones',
        () => imprimirCartelPortal(url), 'fina suave'));

      /* --- mandarlo por correo ---------------------------------------- */
      cc.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:22px 0 8px">Enviarlo por correo</h3>');

      if (!envioConfigurado()) {
        cc.insertAdjacentHTML('beforeend',
          '<div class="alerta medio"><b>El envío de correo no está configurado</b>' +
          '<p>Se puede copiar la dirección o imprimir el cartel igual. Para activar el ' +
          'envío automático, ver el paso 6 de PUBLICAR.md.</p></div>');
      } else {
        cc.insertAdjacentHTML('beforeend',
          '<p class="nota" style="margin-bottom:10px">Para cuando el turno se saca por ' +
          'teléfono. Este correo <b>no lleva ningún dato clínico ni personal</b>: es la ' +
          'misma dirección pública que está pegada en el mostrador, con el código QR ' +
          'adentro. Se puede mandar sin ningún reparo.</p>');

        campo(cc, 'Correo a quien enviarlo', ctx, 'email',
              {tipo:'email', pista:'nombre@correo.com'});
        campo(cc, 'Mensaje (opcional)', ctx, 'mensaje',
              {area:true, filas:3,
               ayuda:'Si se deja vacío va el texto de siempre. Sirve para agregar la fecha ' +
                     'del turno o el nombre de la persona que atendió el teléfono.'});

        cc.appendChild(superficie('Enviar la dirección por correo', null, () => {
          const email = String(ctx.email || '').trim().toLowerCase();
          if (!emailValido(email)) return avisar('El correo no parece válido.', 'error');
          avisar('Enviando…', 'aviso', 20000);
          enviarDireccionDelPortal(email, url, String(ctx.mensaje || '').trim())
            .then(ok => {
              cerrarAviso('Enviando…');
              if (ok) {
                avisar('Enviado a ' + email + '.', 'ok');
                ctx.email = '';
                refrescarVentanaActiva();
              } else {
                avisar('No se pudo enviar. Revisá la dirección y probá de nuevo.', 'error');
              }
            })
            .catch(() => {
              cerrarAviso('Enviando…');
              avisar('No se pudo enviar. Revisá la conexión.', 'error');
            });
        }, 'acento'));
      }

      cc.insertAdjacentHTML('beforeend',
        '<p class="nota" style="margin-top:20px;padding-top:14px;' +
        'border-top:1px solid var(--linea)">El código apunta a la dirección donde está ' +
        'publicada esta aplicación en este momento. Si algún día se muda de servidor, ' +
        'el código se actualiza solo: hay que volver a imprimir el cartel, nada más.</p>');
    }});
}

/* El cartel del mostrador. Se abre en una ventana aparte y se manda a
   imprimir: en una hoja A4 entra el codigo lo bastante grande como para
   leerlo desde el otro lado del escritorio. */
function imprimirCartelPortal(url) {
  const v = window.open('', '_blank');
  if (!v) return avisar('El navegador bloqueó la ventana de impresión.', 'error');
  const qr = qrSVG(url, {nivel:QR_Q, estilo:'width:100%;height:auto;display:block'});
  v.document.write('<!DOCTYPE html><html lang="es-AR"><head><meta charset="utf-8">' +
    '<title>' + esc(MARCA.nombre) + ' — cartel del portal</title><style>' +
    '@page{size:A4;margin:1.4cm}' +
    'body{margin:0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
    'color:#141821;text-align:center;line-height:1.5}' +
    '.marca{font-size:26px;font-weight:700;letter-spacing:.10em;margin:0}' +
    '.firma{color:#2d6a72;font-size:14px;margin:2px 0 0}' +
    '.bajada{color:#828b9c;font-size:12.5px;margin:2px 0 0}' +
    '.titulo{font-size:30px;font-weight:700;letter-spacing:-.02em;margin:26px 0 6px;' +
    'line-height:1.2}' +
    '.sub{font-size:15px;color:#4a5364;margin:0 auto 22px;max-width:15cm}' +
    '.qr{width:10.5cm;margin:0 auto;padding:14px;border:2px solid #141821;border-radius:18px}' +
    '.pasos{display:table;margin:24px auto 0;text-align:left;font-size:14px;' +
    'color:#2b3240;max-width:14cm}' +
    '.paso{display:table-row}' +
    '.paso b{display:table-cell;color:#2d6a72;font-size:19px;padding:0 12px 12px 0;' +
    'vertical-align:top;white-space:nowrap}' +
    '.paso span{display:table-cell;padding-bottom:12px;vertical-align:top}' +
    '.url{margin-top:20px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;' +
    'color:#4a5364;word-break:break-all}' +
    '.pie{margin-top:20px;padding-top:12px;border-top:1px solid #dde1e9;font-size:11.5px;' +
    'color:#828b9c}' +
    '</style></head><body>' +
    '<p class="marca">' + esc(MARCA.nombre) + '</p>' +
    (MARCA.firma ? '<p class="firma">' + esc(MARCA.firma) + '</p>' : '') +
    '<p class="bajada">' + esc(MARCA.bajada) + '</p>' +
    '<p class="titulo">Complete su cuestionario<br>antes de la consulta</p>' +
    '<p class="sub">Cuanto más completo llegue, más aprovechamos el tiempo del turno. ' +
    'Lleva entre 10 y 15 minutos y se puede hacer en varias veces.</p>' +
    '<div class="qr">' + qr + '</div>' +
    '<div class="pasos">' +
    '<div class="paso"><b>1</b><span>Abra la cámara del teléfono y apúntela al código. ' +
    'No hace falta instalar nada.</span></div>' +
    '<div class="paso"><b>2</b><span>Toque el aviso que aparece en la pantalla.</span></div>' +
    '<div class="paso"><b>3</b><span>Deje su documento y su correo. Le llega un enlace ' +
    'personal para completarlo con calma en su casa.</span></div>' +
    '</div>' +
    '<p class="url">' + esc(url) + '</p>' +
    '<p class="pie">' + esc(MARCA.titular) + ' · ' + esc(MARCA.matricula) + ' · ' +
    esc(MARCA.ciudad) + '</p>' +
    '</body></html>');
  v.document.close();
  setTimeout(() => v.print(), 400);
}

/* ====================================================== PACIENTES ======= */

function ventanaPacientes(filtro) {
  abrir({
    id:'pacientes', titulo:'Pacientes',
    sub:Object.keys(ESTADO.pacientes).length + ' historias clínicas',
    ctx:{busqueda:'', filtro:filtro || ''},
    dibujar(c, ctx) {
      const buscador = document.createElement('div');
      buscador.className = 'campo';
      buscador.innerHTML = '<input type="text" placeholder="Buscar por apellido, documento o diagnóstico" ' +
        'value="' + esc(ctx.busqueda) + '">';
      c.appendChild(buscador);
      const inp = $('input', buscador);
      inp.oninput = () => { ctx.busqueda = inp.value; pintarLista(); };

      const lista = document.createElement('div');
      c.appendChild(lista);

      function pintarLista() {
        let ps = buscarPacientes(ctx.busqueda);
        if (ctx.filtro === 'seguimiento') ps = ps.filter(p => p.proximoControl && p.proximoControl >= hoy());
        lista.innerHTML = '';
        if (!ps.length) {
          lista.innerHTML = vacio(ctx.busqueda ? 'Sin resultados' : 'Todavía no hay pacientes',
            ctx.busqueda ? 'Probá con otro apellido o con el número de documento.'
                         : 'Los pacientes entran desde el portal o se cargan a mano desde la pantalla de inicio.');
          return;
        }
        for (const p of ps) lista.appendChild(filaPaciente(p));
      }
      pintarLista();
    }
  });
}

function filaPaciente(p) {
  const n = document.createElement('div');
  n.className = 'pac';
  const clinica = puede('clinica');
  const ef = clinica ? efectividadPaciente(p) : {porcentaje:null};
  const dx = clinica ? ((p.diagnostico && p.diagnostico.sindrome) || 'Sin diagnóstico cargado')
                     : (p.dni ? 'DNI ' + p.dni : '');
  const nrs = clinica ? ultimoNRS(p) : null;
  const ultima = (p.evoluciones || []).length
    ? p.evoluciones[p.evoluciones.length - 1].fecha : p.creado;

  const faltan = segundosParaBorrar(p);
  n.innerHTML =
    '<div class="ini"' + (faltan != null
      ? ' style="background:rgba(217,43,43,.14);color:var(--rojo)"' : '') + '>' +
    esc(iniciales(p)) + '</div>' +
    '<div class="med"><b>' + esc(nombreCompleto(p)) + '</b>' +
    '<small>' + (faltan != null
      ? '<span style="color:var(--rojo);font-weight:600">Se borra en ' +
        relojBorrado(faltan) + '</span> · '
      : '') +
    esc(dx) + (nrs != null ? ' · NRS ' + nrs : '') +
    ' · ' + esc(desdeHace(ultima)) + '</small></div>' +
    anilloEfectividad(ef.porcentaje, 46);
  n.onclick = () => ventanaHistoria(p.id);
  return n;
}

/* ====================================================== PRECARGADOS ===== */

function ventanaPrecargados() {
  abrir({
    id:'precargados', titulo:'Pacientes precargados',
    sub:'Cuestionarios que los pacientes completaron desde su casa',
    dibujar(c) {
      const todas = Object.values(ESTADO.precargas)
        .sort((a, b) => (b.enviado || b.modificado || '').localeCompare(a.enviado || a.modificado || ''));
      const enviadas = todas.filter(p => p.estado === 'enviado');
      const borradores = todas.filter(p => p.estado === 'borrador');

      if (!todas.length) {
        c.innerHTML = vacio('Todavía no llegó ningún cuestionario',
          'Cuando un paciente entre al portal con su documento y su correo, complete el ' +
          'cuestionario y lo envíe, va a aparecer acá.');
        return;
      }

      if (enviadas.length) {
        c.insertAdjacentHTML('beforeend',
          '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
          'color:var(--tinta-3);margin-bottom:9px">Listos para la consulta · ' + enviadas.length + '</h3>');
        for (const p of enviadas) c.appendChild(filaPrecarga(p));
      }

      if (borradores.length) {
        c.insertAdjacentHTML('beforeend',
          '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
          'color:var(--tinta-3);margin:22px 0 9px">Empezados y sin enviar · ' + borradores.length + '</h3>' +
          '<p class="nota" style="margin-bottom:9px">Todavía los está completando el paciente. ' +
          'Se pueden mirar, pero conviene esperar a que los envíe.</p>');
        for (const p of borradores) c.appendChild(filaPrecarga(p));
      }
    }
  });
}

function filaPrecarga(p) {
  const d = p.datos || {};
  const quien = [d.apellido, d.nombre].filter(Boolean).join(', ') || ('DNI ' + p.dni);
  const alarma = (d.banderas || []).length;
  const n = document.createElement('div');
  n.className = 'pac';
  n.innerHTML =
    '<div class="ini" ' + (alarma ? 'style="background:rgba(217,43,43,.14);color:var(--rojo)"' : '') + '>' +
    (alarma ? '!' : esc((d.apellido || '?')[0].toUpperCase())) + '</div>' +
    '<div class="med"><b>' + esc(quien) + '</b><small>' +
    (p.turno ? 'Turno ' + esc(fechaCorta(p.turno)) + ' · ' : '') +
    (d.nrsPromedio != null ? 'NRS ' + d.nrsPromedio + ' · ' : '') +
    (d.mapa || []).length + ' puntos · ' + esc(desdeHace(p.enviado || p.modificado)) +
    '</small></div>' +
    (alarma ? marca(alarma + ' alarma' + (alarma === 1 ? '' : 's'), 'rojo') : '');
  n.onclick = () => ventanaVerPrecarga(p.token);
  return n;
}

function ventanaVerPrecarga(token) {
  const p = ESTADO.precargas[token];
  if (!p) return avisar('Ese cuestionario ya no está disponible.', 'error');
  const d = p.datos || {};

  abrir({
    id:'precarga_' + token,
    titulo:[d.apellido, d.nombre].filter(Boolean).join(', ') || ('DNI ' + p.dni),
    sub:'Cuestionario ' + (p.estado === 'enviado' ? 'enviado ' + desdeHace(p.enviado) : 'en borrador'),
    ancha:true,
    dibujar(c) {
      if (!puede('clinica')) {
        /* Vista de secretaría: identidad y turno, para agendar y recibir. */
        c.insertAdjacentHTML('beforeend', bloque('Quién es',
          dato('Documento', esc(d.dni || p.dni)) +
          dato('Nacimiento', d.fechaNac ? fechaCorta(d.fechaNac) : '—') +
          dato('Contacto', esc([d.telefono, d.email || p.email].filter(Boolean).join(' · '))) +
          dato('Cobertura', esc(d.obraSocial)) +
          dato('Derivado por', esc(d.derivante)) +
          dato('Turno', p.turno ? fechaLarga(p.turno) : 'sin turno cargado') +
          dato('Estado', p.estado === 'enviado' ? marca('completo, listo para la consulta', 'verde')
                                                : marca('todavía lo está completando', 'ambar'))));
        c.insertAdjacentHTML('beforeend',
          '<p class="nota">El contenido clínico del cuestionario lo ve la médica. ' +
          'Tu rol es Secretaría.</p>');
        return;
      }

      /* Lo primero, siempre: lo que el paciente marcó como síntoma de alarma. */
      if ((d.banderas || []).length) {
        const nombres = d.banderas.map(b =>
          (BANDERAS_PACIENTE.find(x => x.v === b) || {t:b}).t);
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta urgente"><b>El paciente marcó síntomas de alarma</b><p>' +
          esc(nombres.join(' · ')) + '</p></div>');
      }

      c.appendChild(superficie('Tomar en consulta',
        'Crea la historia clínica con todo esto ya cargado y la abre', () => {
          incorporarPrecarga(token);
        }, 'acento'));

      const yaExiste = pacientesReales().find(x => dniLimpio(x.dni) === dniLimpio(p.dni));
      if (yaExiste) {
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta medio"><b>Ya hay un paciente con ese documento</b>' +
          '<p>' + esc(nombreCompleto(yaExiste)) + '. Si tomás este cuestionario en consulta, ' +
          'se va a volcar sobre esa historia como una evolución nueva y no se va a duplicar el paciente.</p></div>');
      }

      c.insertAdjacentHTML('beforeend', bloque('Quién es',
        dato('Documento', esc(d.dni || p.dni)) +
        dato('Nacimiento', d.fechaNac ? fechaCorta(d.fechaNac) + ' (' + edadDe(d.fechaNac) + ' años)' : '—') +
        dato('Contacto', esc([d.telefono, d.email || p.email].filter(Boolean).join(' · '))) +
        dato('Cobertura', esc(d.obraSocial)) +
        dato('Ocupación', esc(d.ocupacion)) +
        dato('Derivado por', esc(d.derivante))));

      c.insertAdjacentHTML('beforeend', bloque('El dolor',
        dato('Desde', d.inicio ? fechaCorta(d.inicio) + ' (' + (mesesDesde(d.inicio) || 0) + ' meses)' : '—') +
        dato('Cómo empezó', esc(d.mecanismo)) +
        dato('En sus palabras', esc(d.descripcion)) +
        dato('Características', (d.descriptores || []).map(v =>
          marca((DESCRIPTORES.find(x => x.v === v) || {t:v}).t, 'neutro')).join(' ') || '—') +
        dato('Intensidad', 'ahora <b>' + (d.nrsAhora ?? '—') + '</b> · promedio <b>' +
          (d.nrsPromedio ?? '—') + '</b> · peor <b>' + (d.nrsPeor ?? '—') +
          '</b> · mejor <b>' + (d.nrsMejor ?? '—') + '</b>') +
        dato('Patrón', esc(d.patron)) +
        dato('Peor momento', esc(d.peorMomento)) +
        dato('Irradiación', esc(d.irradiacion)) +
        dato('Lo alivia', esc(d.alivia)) +
        dato('Lo empeora', esc(d.empeora))));

      const cm = document.createElement('div');
      cm.className = 'bloque';
      cm.innerHTML = '<h3>Mapa del dolor</h3>';
      c.appendChild(cm);
      dibujarMapa(cm, d.mapa || [], null, true);
      cm.insertAdjacentHTML('beforeend', '<div style="margin-top:12px">' + resumenMapa(d.mapa || []) + '</div>');

      const dn4Resp = (d.dn4 || []).filter(x => x === 1).length;
      c.insertAdjacentHTML('beforeend', bloque('DN4 — parte del paciente',
        dato('Respuestas positivas', '<b>' + dn4Resp + ' / 7</b> ' +
          (dn4Resp >= 3 ? marca('sugiere componente neuropático', 'violeta')
                        : marca('por debajo del umbral', 'verde')) +
          '<div class="nota">El puntaje definitivo se completa con las tres maniobras del ' +
          'examen físico durante la consulta.</div>')));

      if ((d.tratamientos || []).length) {
        c.insertAdjacentHTML('beforeend', bloque('Tratamientos previos',
          d.tratamientos.map(t => dato(esc(t.que || '—'),
            esc([t.cuando, t.resultado, t.obs].filter(Boolean).join(' · ')))).join('')));
      }
      if ((d.medicacion || []).length) {
        c.insertAdjacentHTML('beforeend', bloque('Medicación que declara',
          d.medicacion.map(m => dato(esc(m.nombre || '—'),
            esc([m.dosis, m.frecuencia, m.desde].filter(Boolean).join(' · ')))).join('')));
      }

      c.insertAdjacentHTML('beforeend', bloque('Impacto en la vida diaria',
        dato('Sueño', esc(d.sueño)) + dato('Trabajo', esc(d.trabajo)) +
        dato('Ánimo', esc(d.animo)) + dato('Dejó de hacer', esc(d.dejoDeHacer)) +
        dato('Qué quiere recuperar', '<b>' + esc(d.objetivos) + '</b>')));

      const phq4 = (d.phq4 || []).reduce((s, v) => s + (v || 0), 0);
      if ((d.phq4 || []).some(v => v != null)) {
        c.insertAdjacentHTML('beforeend', bloque('Tamizaje de ánimo (PHQ-4)',
          dato('Puntaje', '<b>' + phq4 + ' / 12</b> ' +
            (phq4 >= 6 ? marca('positivo: ampliar con PHQ-9 y GAD-7', 'ambar')
                       : marca('negativo', 'verde')))));
      }

      if (d.comentarios) {
        c.insertAdjacentHTML('beforeend', bloque('Lo que quiso decirle',
          '<p>' + esc(d.comentarios) + '</p>'));
      }

      c.appendChild(superficie('Descartar este cuestionario', null, () => {
        confirmar('Descartar el cuestionario',
          'Se va a borrar el cuestionario de ' + ((d.apellido || '') + ' ' + (d.nombre || '')).trim() +
          '. Esta acción no se puede deshacer.',
          () => { borrar('precargas', token); volverA(PILA.length - 2); avisar('Cuestionario descartado.'); },
          'Sí, descartar');
      }, 'fina peligro'));
    }
  });
}

/* -------------------------------------------------------------------------
   Volcar el cuestionario del paciente en una historia clinica.
   Si ya existe un paciente con ese documento, se completa el que hay en vez
   de duplicarlo: nada peor que dos historias de la misma persona.
   ------------------------------------------------------------------------- */
function incorporarPrecarga(token) {
  const pre = ESTADO.precargas[token];
  if (!pre) return;
  const d = pre.datos || {};

  let p = pacientesReales().find(x => dniLimpio(x.dni) === dniLimpio(pre.dni));
  const esNuevo = !p;
  if (esNuevo) p = pacienteNuevo();

  p.origen = 'portal';
  p.apellido = d.apellido || p.apellido;
  p.nombre = d.nombre || p.nombre;
  p.dni = d.dni || pre.dni || p.dni;
  p.fechaNac = d.fechaNac || p.fechaNac;
  p.sexo = d.sexo || p.sexo;
  p.email = d.email || pre.email || p.email;
  p.telefono = d.telefono || p.telefono;
  p.obraSocial = d.obraSocial || p.obraSocial;
  p.ocupacion = d.ocupacion || p.ocupacion;
  p.derivante = d.derivante || p.derivante;

  p.antecedentes = {...p.antecedentes,
    enfermedades:d.enfermedades || '', cirugias:d.cirugias || '',
    alergias:d.alergias || '', familiares:d.familiares || '', habitos:d.habitos || '',
    banderas:[...new Set([...(p.antecedentes.banderas || []), ...(d.banderas || [])])],
    etiquetas:p.antecedentes.etiquetas || []};

  p.dolor = {...p.dolor,
    inicio:d.inicio || '', mecanismo:d.mecanismo || '', descripcion:d.descripcion || '',
    descriptores:d.descriptores || [],
    nrsAhora:d.nrsAhora, nrsPromedio:d.nrsPromedio, nrsPeor:d.nrsPeor, nrsMejor:d.nrsMejor,
    patron:d.patron || '', peorMomento:d.peorMomento || '', irradiacion:d.irradiacion || '',
    alivia:d.alivia || '', empeora:d.empeora || '',
    mapa:d.mapa || [], meses:mesesDesde(d.inicio),
    fechaHistoria:hoy()};

  p.impacto = {sueño:d.sueño || '', trabajo:d.trabajo || '', animo:d.animo || '',
               dejoDeHacer:d.dejoDeHacer || '',
               objetivos:d.objetivos ? [d.objetivos] : []};

  p.tratamientosPrevios = (d.tratamientos || []).map(t => ({
    que:t.que || '', cuando:t.cuando || '', resultado:t.resultado || '', obs:t.obs || ''}));
  p.medicacion = (d.medicacion || []).map(m => ({
    id:uid('med'), farmaco:reconocerFarmaco(m.nombre), nombreLibre:m.nombre || '',
    dosis:m.dosis || '', frecuencia:m.frecuencia || '', desde:m.desde || ''}));

  /* El DN4 entra con las 7 respuestas del paciente; las tres del examen
     quedan en null hasta que el médico las complete en la consulta. */
  p.escalas = p.escalas || {};
  if ((d.dn4 || []).some(x => x != null)) {
    p.escalas.dn4 = {items:[...(d.dn4 || []), null, null, null], fecha:hoy(),
                     total:(d.dn4 || []).reduce((s, v) => s + (v || 0), 0), parcial:true};
  }

  p.modificado = ahora();
  p.precargaToken = token;

  pre.estado = 'tomado';
  pre.tomadoPor = (ESTADO.usuario && ESTADO.usuario.email) || '';
  pre.tomado = ahora();

  guardar('pacientes', p.id, p);
  guardar('precargas', token, pre);

  avisar(esNuevo ? 'Historia clínica creada con los datos del cuestionario.'
                 : 'Los datos se volcaron sobre la historia existente.', 'ok');
  volverA(0);
  ventanaHistoria(p.id);
}

/* Intenta reconocer el nombre que escribio el paciente y engancharlo con el
   vademecum. Si no lo reconoce, devuelve cadena vacia y el nombre libre
   queda igual guardado: es preferible no adivinar mal. */
function reconocerFarmaco(nombre) {
  const n = normalizar(nombre);
  if (!n) return '';
  const alias = {
    pregabalina:'pregabalina', lyrica:'pregabalina',
    gabapentina:'gabapentina', neurontin:'gabapentina',
    amitriptilina:'amitriptilina', nortriptilina:'nortriptilina',
    duloxetina:'duloxetina', venlafaxina:'venlafaxina',
    carbamazepina:'carbamazepina', oxcarbazepina:'oxcarbazepina',
    lamotrigina:'lamotrigina', tramadol:'tramadol', codeina:'codeina',
    morfina:'morfina', oxicodona:'oxicodona', metadona:'metadona',
    fentanilo:'fentanilo_td', buprenorfina:'buprenorfina_td', tapentadol:'tapentadol',
    paracetamol:'paracetamol', acetaminofeno:'paracetamol',
    dipirona:'dipirona', metamizol:'dipirona', novalgina:'dipirona',
    ibuprofeno:'aine', diclofenac:'aine', naproxeno:'aine', meloxicam:'aine',
    celecoxib:'aine', ketorolac:'aine',
    ciclobenzaprina:'ciclobenzaprina', baclofeno:'baclofeno',
    lidocaina:'lidocaina_parche', capsaicina:'capsaicina_baja',
    dexametasona:'dexametasona', meprednisona:'corticoide_oral',
    prednisona:'corticoide_oral', betametasona:'corticoide_oral'
  };
  for (const [clave, id] of Object.entries(alias)) if (n.includes(clave)) return id;
  return '';
}
