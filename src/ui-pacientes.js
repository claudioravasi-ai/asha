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
      const pacientes = Object.values(ESTADO.pacientes);
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

      if (conBandera.length) {
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

      teja(m, agudos.length, 'Dolor agudo',
        'Interconsultas y postoperatorios en curso', ventanaAgudo);

      teja(m, '', 'Estadísticas',
        'Efectividad, diagnósticos y carga opioide del consultorio', ventanaEstadisticas);

      teja(m, '', 'Biblioteca',
        'Síndromes, vademécum, procedimientos y escalas', ventanaBiblioteca);

      c.insertAdjacentHTML('beforeend', '<div style="height:14px"></div>');
      c.appendChild(superficie('+ Paciente nuevo',
        'Abrir una historia clínica de dolor desde cero', () => {
          const p = pacienteNuevo();
          guardar('pacientes', p.id, p);
          ventanaHistoria(p.id);
        }, 'suave'));

      c.appendChild(superficie('Enlace del portal del paciente',
        'La dirección que se le pasa a quien saca turno', () => {
          const url = location.origin + location.pathname + '#turno';
          abrir({id:'enlace', titulo:'Portal del paciente', dibujar(cc) {
            cc.insertAdjacentHTML('beforeend',
              '<p>Esta es la dirección que se le da a la persona cuando saca el turno. ' +
              'Ahí deja su documento y su correo, y le llega el enlace a su cuestionario.</p>' +
              '<div class="bloque"><h3>Dirección del portal</h3>' +
              '<p class="mono" style="word-break:break-all">' + esc(url) + '</p></div>' +
              '<p class="nota">Conviene imprimirla en el ticket del turno o dejar un código QR ' +
              'en el mostrador. Es el paso que más cuesta: la aplicación puede estar impecable, ' +
              'pero si el paciente no se entera de que existe, nadie la usa.</p>');
            cc.appendChild(superficie('Copiar la dirección', null, () => {
              navigator.clipboard.writeText(url)
                .then(() => avisar('Dirección copiada.', 'ok'))
                .catch(() => avisar('No se pudo copiar. Seleccionala a mano.', 'error'));
            }, 'suave'));
          }});
        }, 'fina'));

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
  const ef = efectividadPaciente(p);
  const dx = (p.diagnostico && p.diagnostico.sindrome) || 'Sin diagnóstico cargado';
  const nrs = ultimoNRS(p);
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

      const yaExiste = Object.values(ESTADO.pacientes).find(x => dniLimpio(x.dni) === dniLimpio(p.dni));
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

  let p = Object.values(ESTADO.pacientes).find(x => dniLimpio(x.dni) === dniLimpio(pre.dni));
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
