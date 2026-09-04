/* =========================================================================
   SINDROME, DIAGNOSTICO, PLAN, MEDICACION, EVOLUCION Y CONSENTIMIENTO
   -------------------------------------------------------------------------
   La mitad terapeutica de la historia clinica. Todo lo que sale del motor
   viene con su marca de sugerencia y con una superficie para aceptarlo, que
   lo copia al campo editable. Aceptar nunca es automatico: hace falta un
   toque, y ese toque es el acto medico.
   ========================================================================= */
'use strict';

/* ====================================================== SINDROME ======== */

function ventanaSindrome(idSindrome, idPac) {
  const s = SINDROMES.find(x => x.id === idSindrome);
  if (!s) return;
  abrir({id:'sx_' + idSindrome, titulo:s.nombre, sub:s.grupo, ancha:true,
    ctx:{idSindrome, idPac}, dibujar(c, ctx) {
      const p = ctx.idPac ? ESTADO.pacientes[ctx.idPac] : null;
      const a = p ? analizar(p) : null;
      const coincidencia = a ? a.diferencial.find(d => d.sindrome.id === ctx.idSindrome) : null;

      c.insertAdjacentHTML('beforeend',
        '<div class="fila" style="margin-bottom:12px">' +
        marca(s.icd.cod + ' · ' + s.icd.txt, 'acento') + ' ' +
        marca('mecanismo ' + s.mecanismo, s.mecanismo === 'neuropatico' ? 'violeta' :
              s.mecanismo === 'nociplastico' ? 'ambar' : 'lima') + '</div>' +
        '<p>' + esc(s.resumen) + '</p>');

      if (s.criterios) {
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta info"><b>Criterios diagnósticos</b><p>' + esc(s.criterios) + '</p></div>');
      }

      if (coincidencia) {
        c.insertAdjacentHTML('beforeend', cajaSugerencia(
          'Concordancia con este paciente: ' + coincidencia.concordancia + '%',
          '<div class="barra-pct" style="margin-bottom:11px"><i style="width:' +
          coincidencia.concordancia + '%;background:var(--acento)"></i></div>' +
          '<div style="font-size:12px;font-weight:700;color:var(--verde);margin-bottom:4px">A FAVOR</div>' +
          '<ul style="margin:0 0 12px;padding-left:18px;font-size:13.5px">' +
          coincidencia.aFavor.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
          (coincidencia.enContra.length
            ? '<div style="font-size:12px;font-weight:700;color:var(--tinta-3);margin-bottom:4px">' +
              'DATOS DE PESO QUE NO SE CUMPLEN</div>' +
              '<ul style="margin:0;padding-left:18px;font-size:13.5px;color:var(--tinta-2)">' +
              coincidencia.enContra.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>'
            : '')));
      }

      /* --- estudios --------------------------------------------------- */
      c.insertAdjacentHTML('beforeend', bloque('Plan de estudios',
        s.estudios.map(e =>
          '<div style="padding:8px 0;border-bottom:1px solid var(--linea)">' +
          '<b style="font-size:14px">' + esc(e.t) + '</b>' +
          '<div class="nota">Cuándo: ' + esc(e.cuando) + '</div>' +
          (e.nota ? '<div class="nota" style="margin-top:4px">' + esc(e.nota) + '</div>' : '') +
          '</div>').join('')));

      /* --- tratamiento ------------------------------------------------- */
      const plan = p ? sugerirPlan(s.id, p, a.contexto) : null;
      const t = s.tratamiento || {};

      let h = '<p style="font-weight:600;margin-bottom:10px">' + esc(t.objetivo || '') + '</p>';

      if ((t.noFarmacologico || []).length) {
        h += '<div style="font-size:12px;font-weight:700;letter-spacing:.05em;color:var(--tinta-3);' +
             'margin:12px 0 6px">NO FARMACOLÓGICO</div><ul style="margin:0;padding-left:18px;font-size:13.5px">' +
             t.noFarmacologico.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
      }

      for (const linea of [{k:'primeraLinea', t:'PRIMERA LÍNEA'},
                           {k:'segundaLinea', t:'SEGUNDA LÍNEA'},
                           {k:'tercera', t:'TERCERA LÍNEA'}]) {
        const items = plan ? plan[linea.k] : (t[linea.k] || []).map(x =>
          ({...x, nombre:(FARMACOS[x.farmaco] || {}).nombre || x.farmaco,
            inicio:(FARMACOS[x.farmaco] || {}).inicio, reparos:[]}));
        if (!items || !items.length) continue;
        h += '<div style="font-size:12px;font-weight:700;letter-spacing:.05em;color:var(--tinta-3);' +
             'margin:14px 0 6px">' + linea.t + '</div>';
        for (const f of items) {
          h += '<div style="padding:8px 0;border-bottom:1px solid var(--linea)">' +
               '<b style="font-size:14px">' + esc(f.nombre) + '</b>' +
               (f.inicio ? '<div class="nota">Inicio: ' + esc(f.inicio) + '</div>' : '') +
               (f.titulacion ? '<div class="nota">Titulación: ' + esc(f.titulacion) + '</div>' : '') +
               (f.nota ? '<div class="nota" style="margin-top:3px">' + esc(f.nota) + '</div>' : '') +
               (f.reparos && f.reparos.length
                 ? '<div class="nota" style="color:var(--naranja);margin-top:4px">⚠ ' +
                   esc(f.reparos.join(' · ')) + '</div>' : '') +
               '</div>';
        }
      }

      if ((t.evitar || []).length) {
        h += '<div style="font-size:12px;font-weight:700;letter-spacing:.05em;color:var(--rojo);' +
             'margin:14px 0 6px">EVITAR</div><ul style="margin:0;padding-left:18px;font-size:13.5px">' +
             t.evitar.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
      }
      if (s.irruptivo) {
        h += '<div class="alerta medio" style="margin-top:12px"><b>Dolor irruptivo</b><p>' +
             esc(s.irruptivo) + '</p></div>';
      }

      c.insertAdjacentHTML('beforeend', cajaSugerencia('Tratamiento sugerido', h,
        !!(plan && plan.primeraLinea.length)));

      /* --- procedimientos ---------------------------------------------- */
      if ((s.procedimientos || []).length) {
        c.insertAdjacentHTML('beforeend',
          '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
          'color:var(--tinta-3);margin:18px 0 8px">Procedimientos que corresponden</h3>');
        for (const idp of s.procedimientos) {
          const pr = PROCEDIMIENTOS[idp];
          if (!pr) continue;
          c.appendChild(superficie(pr.nombre, pr.exitoEsperado || pr.proposito,
                                   () => ventanaProcedimiento(idp, ctx.idPac), 'fina'));
        }
      }

      /* --- controles y referencias -------------------------------------- */
      if (s.controles) {
        c.insertAdjacentHTML('beforeend', bloque('Controles',
          dato('Frecuencia', esc(s.controles.frecuencia)) +
          dato('Escalas', (s.controles.escalas || []).map(x =>
            marca((ESCALAS[x] || {sigla:x}).sigla, 'neutro')).join(' ')) +
          dato('Qué mirar', esc(s.controles.que))));
      }
      if ((s.banderas || []).length) {
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta alto"><b>Banderas rojas propias de este cuadro</b><ul style="margin:6px 0 0;' +
          'padding-left:18px;font-size:13px">' + s.banderas.map(b => '<li>' + esc(b) + '</li>').join('') +
          '</ul></div>');
      }
      c.insertAdjacentHTML('beforeend',
        '<p class="nota" style="margin-top:14px;padding-top:10px;border-top:1px solid var(--linea)">' +
        '<b>Referencias:</b> ' + esc((s.referencias || []).join(' · ')) + '</p>');

      /* --- aceptar ------------------------------------------------------ */
      if (p) {
        c.insertAdjacentHTML('beforeend', '<div style="height:12px"></div>');
        c.appendChild(superficie('Adoptar como diagnóstico de este paciente',
          'Copia el síndrome, el código y el mecanismo a la historia clínica', () => {
            p.diagnostico = {...p.diagnostico,
              sindrome:s.nombre, sindromeId:s.id, mecanismo:s.mecanismo,
              icd:s.icd.cod + ' — ' + s.icd.txt,
              grado:a.fenotipo.predominante === 'neuropatico' ? a.fenotipo.neuropatico.grado
                  : a.fenotipo.predominante === 'nociplastico' ? a.fenotipo.nociplastico.grado : '',
              aceptadoDeMotor:true, fecha:hoy()};
            p.modificado = ahora();
            guardar('pacientes', p.id, p);
            avisar('Diagnóstico adoptado. Revisalo y completalo en la ventana de diagnóstico.', 'ok');
            volverA(PILA.findIndex(v => v.id === 'hc_' + p.id));
          }, 'acento'));
      }
    }});
}

/* ====================================================== PROCEDIMIENTO === */

function ventanaProcedimiento(idProc, idPac) {
  const pr = PROCEDIMIENTOS[idProc];
  if (!pr) return;
  abrir({id:'proc_' + idProc, titulo:pr.nombre, sub:pr.grupo + ' · ' + pr.proposito,
    ancha:true, ctx:{idProc, idPac}, dibujar(c, ctx) {
      const p = ctx.idPac ? ESTADO.pacientes[ctx.idPac] : null;

      c.insertAdjacentHTML('beforeend', bloque('Indicaciones',
        '<ul style="margin:0;padding-left:18px;font-size:13.5px">' +
        (pr.indicaciones || []).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>'));

      c.insertAdjacentHTML('beforeend', bloque('Cómo se hace',
        dato('Guía', esc(pr.guia)) + dato('Técnica', esc(pr.tecnica)) +
        dato('Evidencia', esc(pr.evidencia)) +
        dato('Resultado esperable', esc(pr.exitoEsperado)) +
        dato('Duración del efecto', esc(pr.duracion))));

      c.insertAdjacentHTML('beforeend',
        '<div class="alerta alto"><b>Contraindicaciones</b><p>' +
        esc((pr.contraindicaciones || []).join(' · ')) + '</p></div>' +
        '<div class="alerta medio"><b>Complicaciones</b><p>' +
        esc((pr.complicaciones || []).join(' · ')) + '</p></div>');

      /* Anticoagulación: lo primero que hay que resolver antes de pinchar. */
      const riesgo = pr.riesgoSangrado || 'bajo';
      const anticoagulado = p && (p.antecedentes.etiquetas || []).includes('anticoagulado');
      c.insertAdjacentHTML('beforeend',
        '<div class="bloque"><h3>Anticoagulación · procedimiento de riesgo ' + esc(riesgo) + '</h3>' +
        (anticoagulado
          ? '<div class="alerta alto" style="margin-bottom:10px"><b>Este paciente figura como ' +
            'anticoagulado o antiagregado</b><p>Resolver la suspensión antes de programar.</p></div>'
          : '') +
        Object.values(ANTICOAGULACION).map(a =>
          dato(esc(a.nombre), esc(a[riesgo] || a.bajo))).join('') +
        '<p class="nota" style="margin-top:10px">' + esc(NOTA_ANTICOAGULACION) + '</p></div>');

      c.insertAdjacentHTML('beforeend', bloque('Qué debe decir el consentimiento',
        '<ul style="margin:0;padding-left:18px;font-size:13.5px">' +
        (pr.consentimiento || []).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>'));

      if (pr.registro) {
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta info"><b>Qué registrar después</b><p>' + esc(pr.registro) + '</p></div>');
      }

      if (p) {
        c.appendChild(superficie('Emitir el consentimiento informado',
          'Genera el texto listo para imprimir y firmar', () => {
            emitirConsentimiento(p.id, idProc);
          }, 'acento'));
        c.appendChild(superficie('Agregar al plan de este paciente', null, () => {
          p.plan.procedimientos = p.plan.procedimientos || [];
          if (!p.plan.procedimientos.includes(idProc)) p.plan.procedimientos.push(idProc);
          p.modificado = ahora();
          guardar('pacientes', p.id, p);
          avisar('Procedimiento agregado al plan.', 'ok');
        }, 'suave'));
      }
    }});
}

/* ====================================================== DIAGNOSTICO ===== */

function ventanaDiagnostico(id) {
  abrir({id:'dx_' + id, titulo:'Diagnóstico', ancha:true, ctx:{id}, dibujar(c, ctx) {
    const p = ESTADO.pacientes[ctx.id];
    const a = analizar(p);
    const g = () => { p.modificado = ahora(); guardar('pacientes', p.id, p); };

    c.appendChild(cajaAnalisis(p, a));

    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:15px;margin:20px 0 10px">Diagnóstico del médico tratante</h3>');

    /* El sindrome se escribe con autocompletado y el codigo se completa solo.
       Buscar un codigo CIE-11 a mano en otra pestaña es la clase de friccion
       que hace que el campo termine vacio en todas las historias. */
    campoDiagnostico(c, p, g);

    const gg = document.createElement('div'); gg.className = 'dos'; c.appendChild(gg);
    campo(gg, 'Código ICD-11', p.diagnostico, 'icd', {alCambiar:() => {
      /* Si se escribe el codigo a mano, se completa la denominacion. */
      const t = textoICD((p.diagnostico.icd || '').split('—')[0].trim());
      if (t && !/—/.test(p.diagnostico.icd)) {
        p.diagnostico.icd = (p.diagnostico.icd || '').trim().toUpperCase() + ' — ' + t;
      }
      g(); refrescar();
    }, ayuda:'Se completa solo al elegir el diagnóstico. También podés escribir el código y ' +
             'la denominación se agrega sola.'});
    campo(gg, 'Grado de certeza', p.diagnostico, 'grado', {alCambiar:g,
      lista:['posible','probable','definido','sospechado por tamizaje']});

    const cm = document.createElement('div'); cm.className = 'campo';
    cm.innerHTML = '<label>Mecanismo predominante</label>'; c.appendChild(cm);
    opciones(cm, [{t:'Nociceptivo',v:'nociceptivo'},{t:'Neuropático',v:'neuropatico'},
                  {t:'Nociplástico',v:'nociplastico'},{t:'Mixto',v:'mixto'}],
             p.diagnostico.mecanismo, v => { p.diagnostico.mecanismo = v; g(); refrescar(); });

    campo(c, 'Fundamento y diagnósticos diferenciales considerados', p.diagnostico, 'texto',
      {area:true, filas:5, alCambiar:g});

    if (p.diagnostico.sindromeId) {
      c.insertAdjacentHTML('beforeend', '<div style="height:10px"></div>');
      c.appendChild(superficie('Ver la ficha completa del síndrome', null,
        () => ventanaSindrome(p.diagnostico.sindromeId, p.id), 'suave'));
    }
  }});
}

/* ====================================================== PLAN ============ */

function ventanaPlan(id) {
  abrir({id:'plan_' + id, titulo:'Plan terapéutico', ancha:true, ctx:{id}, dibujar(c, ctx) {
    const p = ESTADO.pacientes[ctx.id];
    const a = analizar(p);
    const g = () => { p.modificado = ahora(); guardar('pacientes', p.id, p); };
    p.plan = p.plan || {};

    const sugerido = p.diagnostico.sindromeId ? sugerirPlan(p.diagnostico.sindromeId, p, a.contexto) : null;

    if (sugerido) {
      let h = '<p style="font-weight:600;margin-bottom:10px">' + esc(sugerido.objetivo) + '</p>';
      const lineas = [{k:'primeraLinea', t:'Primera línea'}, {k:'segundaLinea', t:'Segunda línea'},
                      {k:'tercera', t:'Tercera línea'}];
      for (const l of lineas) {
        if (!sugerido[l.k].length) continue;
        h += '<div style="font-size:12px;font-weight:700;color:var(--tinta-3);margin:10px 0 5px;' +
             'letter-spacing:.05em;text-transform:uppercase">' + l.t + '</div>';
        h += sugerido[l.k].map(f =>
          '<div style="font-size:13.5px;padding:4px 0">• <b>' + esc(f.nombre) + '</b>' +
          (f.inicio ? ' — ' + esc(f.inicio) : '') +
          (f.reparos.length ? '<div class="nota" style="color:var(--naranja)">⚠ ' +
            esc(f.reparos.join(' · ')) + '</div>' : '') + '</div>').join('');
      }
      if (sugerido.evitar.length) {
        h += '<div style="font-size:12px;font-weight:700;color:var(--rojo);margin:12px 0 5px;' +
             'letter-spacing:.05em;text-transform:uppercase">Evitar</div>' +
             '<div style="font-size:13.5px">' + esc(sugerido.evitar.join(' · ')) + '</div>';
      }
      c.insertAdjacentHTML('beforeend', cajaSugerencia('Plan sugerido para ' +
        p.diagnostico.sindrome, h));

      c.appendChild(superficie('Volcar el plan sugerido a los campos de abajo',
        'Después lo editás como quieras: se copia, no se aplica', () => {
          p.plan.objetivo = p.plan.objetivo || sugerido.objetivo;
          p.plan.noFarmacologico = [...new Set([...(p.plan.noFarmacologico || []),
                                                ...sugerido.noFarmacologico])];
          p.plan.estudios = [...new Set([...(p.plan.estudios || []),
                                         ...sugerido.estudios.map(e => e.t)])];
          const texto = sugerido.primeraLinea.map(f => f.nombre + ' — ' + (f.inicio || '')).join('\n');
          p.plan.texto = (p.plan.texto ? p.plan.texto + '\n\n' : '') + texto;
          g(); refrescar();
          avisar('Plan volcado. Revisalo antes de indicárselo al paciente.', 'ok');
        }, 'suave'));
    } else {
      c.insertAdjacentHTML('beforeend',
        '<p class="nota">Para que la aplicación sugiera un plan, primero hay que adoptar un ' +
        'diagnóstico del diferencial.</p>');
    }

    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:15px;margin:20px 0 10px">Plan indicado</h3>');

    campo(c, 'Objetivo del tratamiento', p.plan, 'objetivo', {area:true, filas:2, alCambiar:g,
      ayuda:'Concreto y funcional. "Bajar el dolor" no es un objetivo; "caminar seis cuadras sin parar" sí.'});
    campo(c, 'Indicaciones', p.plan, 'texto', {area:true, filas:8, alCambiar:g,
      pista:'Fármacos, dosis, titulación, medidas no farmacológicas, pautas de alarma…'});

    listaTexto(c, 'Estudios solicitados', p.plan, 'estudios', g);
    listaTexto(c, 'Medidas no farmacológicas', p.plan, 'noFarmacologico', g);
    listaTexto(c, 'Derivaciones', p.plan, 'derivaciones', g);

    if ((p.plan.procedimientos || []).length) {
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:18px 0 8px">Procedimientos planificados</h3>');
      for (const idp of p.plan.procedimientos) {
        const pr = PROCEDIMIENTOS[idp];
        if (!pr) continue;
        c.appendChild(superficie(pr.nombre, 'Ver ficha, anticoagulación y consentimiento',
                                 () => ventanaProcedimiento(idp, p.id), 'fina'));
      }
    }

    campo(c, 'Próximo control', p, 'proximoControl', {tipo:'date', alCambiar:g,
      ayuda:sugerido && sugerido.controles.frecuencia
        ? 'Sugerido para este cuadro: ' + sugerido.controles.frecuencia : ''});
  }});
}

/* Lista simple de lineas de texto: estudios, derivaciones, medidas. */
function listaTexto(nodo, rotulo, obj, clave, alCambiar) {
  if (!Array.isArray(obj[clave])) obj[clave] = [];
  const cont = document.createElement('div');
  cont.className = 'campo';
  cont.innerHTML = '<label>' + esc(rotulo) + '</label>';
  nodo.appendChild(cont);
  const zona = document.createElement('div');
  cont.appendChild(zona);
  function pintar() {
    zona.innerHTML = '';
    obj[clave].forEach((t, i) => {
      const f = document.createElement('div');
      f.style.cssText = 'display:flex;gap:7px;align-items:center;margin-bottom:6px';
      f.innerHTML = '<input type="text" value="' + esc(t) + '" style="flex:1">';
      const inp = $('input', f);
      inp.onchange = () => { obj[clave][i] = inp.value; alCambiar(); };
      const x = document.createElement('div');
      x.className = 'op';
      x.textContent = '✕';
      x.onclick = () => { obj[clave].splice(i, 1); alCambiar(); pintar(); };
      f.appendChild(x);
      zona.appendChild(f);
    });
    zona.appendChild(superficie('+ Agregar', null, () => {
      obj[clave].push(''); alCambiar(); pintar();
    }, 'fina suave'));
  }
  pintar();
}

/* ====================================================== MEDICACION ====== */

function ventanaMedicacion(id) {
  abrir({id:'med_' + id, titulo:'Medicación', ancha:true, ctx:{id}, dibujar(c, ctx) {
    const p = ESTADO.pacientes[ctx.id];
    const a = analizar(p);
    const g = () => { p.modificado = ahora(); guardar('pacientes', p.id, p); };
    if (!Array.isArray(p.medicacion)) p.medicacion = [];

    const mme = a.seguridad.mme;
    c.insertAdjacentHTML('beforeend',
      '<div class="bloque" style="border-left:3px solid var(--' + mme.color + ')">' +
      '<h3>Carga opioide</h3>' +
      '<div style="font-size:26px;font-weight:700;letter-spacing:-.02em">' + mme.total +
      ' <span style="font-size:14px;color:var(--tinta-3)">MME/día</span></div>' +
      '<div style="margin:5px 0">' + marca(mme.nivel, mme.color) + '</div>' +
      (mme.aviso ? '<p class="nota">' + esc(mme.aviso) + '</p>' : '') +
      '<p class="nota" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--linea)">' +
      esc(mme.nota) + '</p></div>');

    for (const s of a.seguridad.avisos) {
      c.insertAdjacentHTML('beforeend',
        '<div class="alerta ' + s.nivel + '"><b>' + esc(s.titulo) + '</b><p>' + esc(s.texto) + '</p></div>');
    }

    const zona = document.createElement('div');
    c.appendChild(zona);
    pintar();

    function pintar() {
      zona.innerHTML = '';
      p.medicacion.forEach((m, i) => {
        const f = FARMACOS[m.farmaco];
        const caja = document.createElement('div');
        caja.className = 'bloque';
        caja.style.marginBottom = '9px';

        const cf = document.createElement('div');
        cf.className = 'campo';
        cf.innerHTML = '<label>Fármaco</label>';
        caja.appendChild(cf);
        const sel = document.createElement('select');
        sel.innerHTML = '<option value="">— fuera del vademécum —</option>' +
          Object.keys(FARMACOS).sort((x, y) => FARMACOS[x].nombre.localeCompare(FARMACOS[y].nombre))
            .map(k => '<option value="' + k + '"' + (m.farmaco === k ? ' selected' : '') + '>' +
                 esc(FARMACOS[k].nombre) + '</option>').join('');
        sel.onchange = () => { m.farmaco = sel.value; g(); refrescar(); };
        cf.appendChild(sel);

        if (!m.farmaco) campo(caja, 'Nombre', m, 'nombreLibre', {alCambiar:g});

        const gg = document.createElement('div'); gg.className = 'tres'; caja.appendChild(gg);
        campo(gg, 'Dosis', m, 'dosis', {alCambiar:() => { g(); refrescar(); }, pista:'75 mg'});
        campo(gg, 'Frecuencia', m, 'frecuencia', {alCambiar:() => { g(); refrescar(); }, pista:'cada 12 hs'});
        campo(gg, 'Desde', m, 'desde', {tipo:'date', alCambiar:g});

        if (f) {
          const ef = efectividadTratamiento(p, {farmaco:m.farmaco, inicio:m.desde, nrsInicio:m.nrsInicio});
          caja.insertAdjacentHTML('beforeend',
            '<div style="display:flex;gap:12px;align-items:center;margin-top:8px;' +
            'padding-top:10px;border-top:1px solid var(--linea)">' +
            anilloEfectividad(ef.porcentaje, 48) +
            '<div style="flex:1"><div style="font-size:13px;font-weight:600">' +
            (ef.banda ? esc(ef.banda.etiqueta) : 'Sin mediciones en la ventana de este fármaco') + '</div>' +
            (ef.dias != null ? '<div class="nota">' + ef.dias + ' días de tratamiento · ' +
              ef.mediciones + ' medición(es)</div>' : '') +
            (ef.advertencia ? '<div class="nota" style="color:var(--ambar)">' + esc(ef.advertencia) + '</div>' : '') +
            '</div></div>');
          caja.appendChild(superficie('Ver la ficha de ' + f.nombre, null,
            () => ventanaFarmaco(m.farmaco, p.id), 'fina suave'));
        }

        caja.appendChild(superficie('Quitar de la lista', null, () => {
          p.medicacion.splice(i, 1); g(); refrescar();
        }, 'fina peligro'));
        zona.appendChild(caja);
      });

      zona.appendChild(superficie('+ Agregar medicación', null, () => {
        p.medicacion.push({id:uid('med'), farmaco:'', nombreLibre:'', dosis:'', frecuencia:'',
                           desde:hoy(), nrsInicio:ultimoNRS(p)});
        g(); refrescar();
      }, 'suave'));
    }
  }});
}

function ventanaFarmaco(idFarmaco, idPac) {
  const f = FARMACOS[idFarmaco];
  if (!f) return;
  abrir({id:'far_' + idFarmaco, titulo:f.nombre, sub:f.grupo + ' · ' + f.clase,
    ancha:true, ctx:{idFarmaco, idPac}, dibujar(c, ctx) {
      c.insertAdjacentHTML('beforeend', bloque('Cómo se usa',
        (f.opciones ? dato('Opciones', esc(f.opciones)) : '') +
        dato('Presentaciones', esc((f.presentaciones || []).join(' · '))) +
        dato('Dosis de inicio', esc(f.inicio)) +
        (f.titulacion ? dato('Titulación', esc(f.titulacion)) : '') +
        dato('Dosis máxima', esc(f.maxima)) +
        (f.latencia ? dato('Latencia del efecto', esc(f.latencia)) : '')));

      c.insertAdjacentHTML('beforeend', bloque('Ajustes',
        dato('Función renal', esc(f.ajusteRenal)) +
        dato('Función hepática', esc(f.ajusteHepatico))));

      c.insertAdjacentHTML('beforeend',
        '<div class="alerta medio"><b>Efectos adversos</b><p>' + esc(f.adversos) + '</p></div>' +
        ((f.contraindicaciones || []).length
          ? '<div class="alerta alto"><b>Contraindicaciones</b><p>' +
            esc(f.contraindicaciones.join(' · ')) + '</p></div>' : '') +
        '<div class="alerta info"><b>Interacciones</b><p>' + esc(f.interacciones) + '</p></div>');

      c.insertAdjacentHTML('beforeend', bloque('Evidencia',
        dato('Línea de recomendación', esc(f.evidencia.linea)) +
        dato('Calidad', esc(f.evidencia.calidad)) +
        (f.evidencia.nota ? dato('Nota', esc(f.evidencia.nota)) : '') +
        (f.monitoreo ? dato('Monitoreo', esc(f.monitoreo)) : '')));

      if (f.nota) c.insertAdjacentHTML('beforeend',
        '<div class="bloque"><h3>En la práctica</h3><p style="font-size:13.5px">' + esc(f.nota) + '</p></div>');
    }});
}

/* ====================================================== EVOLUCIONES ===== */

function ventanaEvoluciones(id) {
  abrir({id:'evo_' + id, titulo:'Evoluciones y controles', ancha:true, ctx:{id}, dibujar(c, ctx) {
    const p = ESTADO.pacientes[ctx.id];
    if (!Array.isArray(p.evoluciones)) p.evoluciones = [];

    c.appendChild(superficie('+ Registrar un control de hoy',
      'Intensidad, escalas, cambios de tratamiento y efectos adversos',
      () => ventanaNuevaEvolucion(p.id), 'acento'));
    c.appendChild(superficie('Enviarle el resumen al paciente',
      'Una página con cómo viene, qué toma y cuándo consultar',
      () => ventanaResumenPaciente(p.id), 'suave'));

    const ef = efectividadPaciente(p);
    if (ef.serie.length) {
      c.insertAdjacentHTML('beforeend',
        '<div class="bloque"><h3>Evolución</h3>' + graficoEvolucion(ef.serie) +
        (Object.keys(ef.componentes).length
          ? '<div style="margin-top:12px">' + Object.values(ef.componentes).map(comp =>
              dato(esc(comp.etiqueta) + (comp.peso ? ' (' + Math.round(comp.peso * 100) + '%)' : ''),
                   '<b>' + (comp.valor > 0 ? '+' : '') + comp.valor + '%</b> ' +
                   '<span class="nota">' + esc(comp.detalle) + '</span>')).join('') + '</div>'
          : '') + '</div>');
    }

    if (!p.evoluciones.length) {
      c.insertAdjacentHTML('beforeend', vacio('Sin controles registrados',
        'Cada control deja asentada la intensidad, los cambios de medicación y las escalas, ' +
        'que es lo que exige la norma y lo que permite medir si el tratamiento sirve.'));
      return;
    }

    for (let i = p.evoluciones.length - 1; i >= 0; i--) {
      const e = p.evoluciones[i];
      const col = e.nrs != null ? colorDolor(e.nrs) : null;
      c.insertAdjacentHTML('beforeend',
        '<div class="bloque"><div style="display:flex;gap:10px;align-items:baseline">' +
        '<b style="flex:1">' + esc(fechaLarga(e.fecha)) + '</b>' +
        (e.nrs != null ? '<span class="marca-txt" style="background:' + col.color +
          ';color:' + (e.nrs >= 3 && e.nrs <= 6 ? '#3a2c00' : '#fff') + '">NRS ' + e.nrs + '</span>' : '') +
        '</div>' +
        (e.texto ? '<p style="margin-top:8px;font-size:13.5px;white-space:pre-wrap">' + esc(e.texto) + '</p>' : '') +
        (e.cambios ? '<p class="nota" style="margin-top:6px"><b>Cambios:</b> ' + esc(e.cambios) + '</p>' : '') +
        ((e.adversos || []).length
          ? '<p class="nota" style="margin-top:6px;color:var(--naranja)"><b>Efectos adversos:</b> ' +
            esc(e.adversos.map(x => x.t + (x.grave ? ' (grave)' : '')).join(' · ')) + '</p>' : '') +
        (e.escalas && Object.keys(e.escalas).length
          ? '<div style="margin-top:7px">' + Object.entries(e.escalas).map(([k, v]) =>
              marca((ESCALAS[k] || {sigla:k}).sigla + ' ' + (typeof v === 'object' ? v.total : v), 'neutro')
            ).join(' ') + '</div>' : '') +
        '</div>');
    }
  }});
}

function ventanaNuevaEvolucion(id) {
  abrir({id:'nevo_' + id, titulo:'Control', sub:fechaLarga(hoy()), ancha:true, ctx:{id},
    dibujar(c, ctx) {
      const p = ESTADO.pacientes[ctx.id];
      const e = {fecha:hoy(), nrs:ultimoNRS(p), texto:'', cambios:'', escalas:{}, adversos:[]};

      const cn = document.createElement('div'); cn.className = 'campo';
      cn.innerHTML = '<label>Intensidad promedio desde el último control</label>';
      c.appendChild(cn);
      escalaNRS(cn, e.nrs, v => { e.nrs = v; pintarComparacion(); });

      const comp = document.createElement('div');
      c.appendChild(comp);
      function pintarComparacion() {
        const basal = primerNRS(p);
        if (basal == null || e.nrs == null) { comp.innerHTML = ''; return; }
        const pct = mejoraPct(basal, e.nrs, false);
        const b = bandaEfectividad(pct);
        comp.innerHTML = '<div class="alerta" style="border-left-color:' + b.color + '">' +
          '<b>' + pct + '% respecto del basal (' + basal + ' → ' + e.nrs + ') — ' + esc(b.etiqueta) + '</b>' +
          '<p>' + esc(b.accion) + '</p></div>';
      }
      pintarComparacion();

      campo(c, 'Evolución', e, 'texto', {area:true, filas:6,
        pista:'Cómo llegó, qué mejoró, qué no, adherencia, situación funcional…'});
      campo(c, 'Cambios en el tratamiento', e, 'cambios', {area:true, filas:3,
        pista:'Qué se sube, qué se baja, qué se suspende y por qué'});

      /* Escalas rápidas de control. */
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:14px;margin:18px 0 8px">Escalas de este control</h3>' +
        '<p class="nota" style="margin-bottom:10px">El PGIC es el que más pesa en el cálculo de ' +
        'efectividad y tarda quince segundos.</p>');
      const zonaEsc = document.createElement('div');
      c.appendChild(zonaEsc);
      for (const idEsc of ['pgic', 'bpi', 'odi', 'ndi', 'csi', 'phq9']) {
        const esc_ = ESCALAS[idEsc];
        const cc = document.createElement('div');
        cc.className = 'campo';
        cc.innerHTML = '<label>' + esc(esc_.sigla) + ' — ' + esc(esc_.nombre) + '</label>';
        zonaEsc.appendChild(cc);
        if (idEsc === 'pgic') {
          opciones(cc, ESCALAS.pgic.items[0].op, e.escalas.pgic,
                   v => { e.escalas.pgic = v; });
        } else {
          const inp = document.createElement('input');
          inp.type = 'number';
          inp.placeholder = 'puntaje total (opcional)';
          inp.onchange = () => {
            if (inp.value === '') delete e.escalas[idEsc];
            else e.escalas[idEsc] = Number(inp.value);
          };
          cc.appendChild(inp);
        }
      }

      /* Efectos adversos. */
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:14px;margin:18px 0 8px">Efectos adversos</h3>');
      const zonaAdv = document.createElement('div');
      c.appendChild(zonaAdv);
      pintarAdversos();
      function pintarAdversos() {
        zonaAdv.innerHTML = '';
        e.adversos.forEach((ad, i) => {
          const f = document.createElement('div');
          f.style.cssText = 'display:flex;gap:7px;align-items:center;margin-bottom:6px';
          f.innerHTML = '<input type="text" value="' + esc(ad.t) + '" style="flex:1" ' +
            'placeholder="ej. somnolencia, náuseas, edema">';
          $('input', f).onchange = ev => { ad.t = ev.target.value; };
          const grave = document.createElement('div');
          grave.className = 'op' + (ad.grave ? ' on' : '');
          grave.textContent = 'Grave';
          grave.onclick = () => { ad.grave = !ad.grave; pintarAdversos(); };
          f.appendChild(grave);
          const x = document.createElement('div');
          x.className = 'op';
          x.textContent = '✕';
          x.onclick = () => { e.adversos.splice(i, 1); pintarAdversos(); };
          f.appendChild(x);
          zonaAdv.appendChild(f);
        });
        zonaAdv.appendChild(superficie('+ Agregar efecto adverso', null, () => {
          e.adversos.push({t:'', grave:false}); pintarAdversos();
        }, 'fina suave'));
      }

      campo(c, 'Próximo control', p, 'proximoControl', {tipo:'date'});

      c.insertAdjacentHTML('beforeend', '<div style="height:14px"></div>');
      c.appendChild(superficie('Guardar el control', null, () => {
        p.evoluciones = p.evoluciones || [];
        p.evoluciones.push(e);
        if (e.escalas) {
          /* Las escalas del control también actualizan el valor vigente. */
          for (const [k, v] of Object.entries(e.escalas)) {
            if (v == null) continue;
            p.escalas = p.escalas || {};
            p.escalas[k] = {items:(p.escalas[k] || {}).items || [],
                            total:typeof v === 'object' ? v.total : v, fecha:e.fecha};
          }
        }
        p.modificado = ahora();
        guardar('pacientes', p.id, p);
        avisar('Control registrado.', 'ok');
        volverA(PILA.findIndex(v => v.id === 'hc_' + p.id));
      }, 'acento'));
    }});
}

/* ====================================================== CONSENTIMIENTO == */

function ventanaConsentimientos(id) {
  abrir({id:'cons_' + id, titulo:'Consentimientos informados', ancha:true, ctx:{id},
    dibujar(c, ctx) {
      const p = ESTADO.pacientes[ctx.id];
      if (!Array.isArray(p.consentimientos)) p.consentimientos = [];

      c.insertAdjacentHTML('beforeend',
        '<p class="nota" style="margin-bottom:12px">Las Normas de Dolor exigen consentimiento ' +
        '<b>por escrito y firmado</b> por el paciente o su tutor, que detalle el procedimiento, ' +
        'el pronóstico y las posibles complicaciones, y que deje explícito que hay garantía de ' +
        '<b>medios</b> y no de <b>resultados</b>. Los textos que genera la aplicación incluyen ' +
        'esas cuatro cosas.</p>');

      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:14px 0 8px">Emitir uno nuevo</h3>');
      const grupos = {};
      for (const [k, pr] of Object.entries(PROCEDIMIENTOS)) {
        (grupos[pr.grupo] = grupos[pr.grupo] || []).push({k, pr});
      }
      for (const [gr, lista] of Object.entries(grupos)) {
        c.insertAdjacentHTML('beforeend', '<div class="nota" style="margin:10px 0 5px"><b>' +
          esc(gr) + '</b></div>');
        for (const {k, pr} of lista) {
          c.appendChild(superficie(pr.nombre, null, () => emitirConsentimiento(p.id, k), 'fina'));
        }
      }

      if (p.consentimientos.length) {
        c.insertAdjacentHTML('beforeend',
          '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
          'color:var(--tinta-3);margin:20px 0 8px">Emitidos</h3>');
        p.consentimientos.forEach((k, i) => {
          c.appendChild(superficie(k.procedimiento, fechaCorta(k.fecha) +
            (k.firmado ? ' · firmado' : ' · sin firmar'),
            () => emitirConsentimiento(p.id, k.idProc, i), 'fina suave'));
        });
      }
    }});
}

function emitirConsentimiento(idPac, idProc, indice) {
  const p = ESTADO.pacientes[idPac];
  const pr = PROCEDIMIENTOS[idProc];
  if (!p || !pr) return;

  abrir({id:'kons_' + idPac + '_' + idProc, titulo:'Consentimiento informado',
    sub:pr.nombre, ancha:true, ctx:{idPac, idProc, indice}, dibujar(c, ctx) {
      const texto = textoConsentimiento(p, pr);
      c.insertAdjacentHTML('beforeend',
        '<div class="bloque" style="background:var(--ventana);white-space:pre-wrap;' +
        'font-size:13.5px;line-height:1.65" id="textoConsentimiento">' + esc(texto) + '</div>');

      c.appendChild(superficie('Imprimir para firmar', null, () => {
        imprimirTexto('Consentimiento informado — ' + pr.nombre, texto);
      }, 'acento'));

      const yaEsta = (p.consentimientos || []).findIndex(k => k.idProc === idProc);
      c.appendChild(superficie(
        yaEsta >= 0 && p.consentimientos[yaEsta].firmado
          ? 'Marcar como NO firmado' : 'Marcar como firmado por el paciente',
        'Queda asentado en la historia con la fecha', () => {
          p.consentimientos = p.consentimientos || [];
          if (yaEsta >= 0) {
            p.consentimientos[yaEsta].firmado = !p.consentimientos[yaEsta].firmado;
            p.consentimientos[yaEsta].fecha = hoy();
          } else {
            p.consentimientos.push({idProc, procedimiento:pr.nombre, fecha:hoy(),
                                    firmado:true, texto});
          }
          p.modificado = ahora();
          guardar('pacientes', p.id, p);
          avisar('Consentimiento asentado.', 'ok');
          refrescar();
        }, 'suave'));
    }});
}

function textoConsentimiento(p, pr) {
  const L = [];
  L.push(MARCA.nombre.toUpperCase() + ' — ' + MARCA.consultorio);
  if (MARCA.titular !== 'Dr. —') L.push(MARCA.titular + ' · ' + MARCA.matricula);
  L.push('');
  L.push('CONSENTIMIENTO INFORMADO');
  L.push(pr.nombre.toUpperCase());
  L.push('');
  L.push('Paciente: ' + nombreCompleto(p) + '     Documento: ' + (p.dni || '____________'));
  L.push('Fecha: ' + fechaCorta(hoy()));
  L.push('');
  L.push('1. EN QUÉ CONSISTE EL PROCEDIMIENTO');
  L.push(pr.tecnica);
  L.push('Se realiza con guía por ' + (pr.guia || 'los reparos anatómicos correspondientes') + '.');
  L.push('');
  L.push('2. PARA QUÉ SE INDICA');
  L.push((pr.indicaciones || []).join('. ') + '.');
  L.push('');
  L.push('3. QUÉ SE PUEDE ESPERAR');
  L.push(pr.exitoEsperado + '. Duración estimada del efecto: ' + pr.duracion + '.');
  L.push('');
  L.push('4. RIESGOS Y COMPLICACIONES POSIBLES');
  L.push((pr.complicaciones || []).join('. ') + '.');
  L.push('Además de estos, todo procedimiento puede tener complicaciones poco frecuentes ' +
         'o excepcionales, incluidas las derivadas de reacciones a los fármacos empleados.');
  L.push('');
  L.push('5. SITUACIONES EN QUE NO DEBE REALIZARSE');
  L.push((pr.contraindicaciones || []).join('. ') + '.');
  L.push('');
  L.push('6. ALTERNATIVAS');
  L.push('Continuar únicamente con el tratamiento farmacológico y las medidas no ' +
         'farmacológicas indicadas, o no realizar tratamiento alguno. El médico tratante ' +
         'le explicó las ventajas y desventajas de cada opción.');
  L.push('');
  L.push('7. PUNTOS QUE SE LE EXPLICARON EN PARTICULAR');
  for (const x of (pr.consentimiento || [])) L.push('  · ' + x);
  L.push('');
  L.push('8. DECLARACIÓN');
  L.push('Declaro que se me explicó en lenguaje comprensible en qué consiste el procedimiento, ' +
         'para qué se indica, qué resultado puede esperarse, qué riesgos tiene y qué ' +
         'alternativas existen. Pude hacer todas las preguntas que quise y fueron respondidas.');
  L.push('');
  L.push('Comprendo y acepto expresamente que el equipo médico asume una OBLIGACIÓN DE MEDIOS ' +
         'y NO DE RESULTADOS: se compromete a poner a mi disposición todos los recursos ' +
         'profesionales y técnicos disponibles, pero no puede garantizar un resultado determinado.');
  L.push('');
  L.push('Sé que puedo revocar este consentimiento en cualquier momento y antes de la ' +
         'realización del procedimiento, sin que ello afecte la calidad de mi atención ' +
         '(Ley 26.529, art. 10).');
  L.push('');
  L.push('En consecuencia, PRESTO MI CONSENTIMIENTO para la realización del procedimiento descripto.');
  L.push('');
  L.push('');
  L.push('___________________________        ___________________________');
  L.push('Firma del paciente                 Firma y sello del médico');
  L.push('Aclaración:                        Aclaración:');
  L.push('Documento:                         Matrícula:');
  L.push('');
  L.push('Si el paciente no pudiera firmar por sí mismo:');
  L.push('___________________________');
  L.push('Firma del representante legal o tutor · Documento · Vínculo');
  L.push('');
  L.push('— — —');
  L.push(LEGAL_PIE);
  return L.join('\n');
}

function imprimirTexto(titulo, texto) {
  const v = window.open('', '_blank');
  if (!v) return avisar('El navegador bloqueó la ventana de impresión.', 'error');
  v.document.write('<!DOCTYPE html><html lang="es-AR"><head><meta charset="utf-8">' +
    '<title>' + esc(titulo) + '</title><style>' +
    'body{font-family:Georgia,"Times New Roman",serif;max-width:19cm;margin:1.5cm auto;' +
    'line-height:1.6;font-size:11.5pt;color:#111;white-space:pre-wrap}' +
    '@media print{body{margin:0}}</style></head><body>' + esc(texto) + '</body></html>');
  v.document.close();
  setTimeout(() => v.print(), 350);
}


/* =========================================================================
   CAMPO DE DIAGNOSTICO CON AUTOCOMPLETADO
   -------------------------------------------------------------------------
   Mientras se escribe, muestra debajo los sindromes del catalogo y los
   codigos de la CIE-11 que coinciden. Al elegir uno:

     · si es un SINDROME del catalogo, completa el nombre, el codigo, la
       denominacion y el mecanismo, y deja enganchado el plan terapeutico;
     · si es un CODIGO suelto, completa el codigo y la denominacion y deja
       el nombre tal como lo escribio el medico.

   El campo NUNCA bloquea la escritura libre: si el diagnostico no esta en
   ninguna de las dos listas, se escribe igual y no pasa nada.
   ========================================================================= */
function campoDiagnostico(nodo, p, alGuardar) {
  const caja = document.createElement('div');
  caja.className = 'campo';
  caja.style.position = 'relative';
  caja.innerHTML = '<label>Síndrome</label>' +
    '<input type="text" autocomplete="off" placeholder="Escribí y elegí de la lista" ' +
    'value="' + esc(p.diagnostico.sindrome || '') + '">' +
    '<div class="ayuda">Empezá a escribir: la aplicación busca en los ' + SINDROMES.length +
    ' síndromes del catálogo y en el capítulo MG30 de la CIE-11, y completa el código sola.</div>';
  nodo.appendChild(caja);

  const inp = $('input', caja);
  const lista = document.createElement('div');
  lista.className = 'sugerencias';
  caja.appendChild(lista);

  const cerrar = () => { lista.innerHTML = ''; lista.style.display = 'none'; };
  cerrar();

  function pintar() {
    const res = buscarDiagnostico(inp.value, 8);
    if (!res.length) return cerrar();
    lista.style.display = 'block';
    lista.innerHTML = res.map((r, i) =>
      '<div class="sug" data-i="' + i + '">' +
      '<b>' + esc(r.nombre) + '</b>' +
      '<small>' + esc(r.cod) + ' · ' + esc(r.txt) +
      (r.tipo === 'sindrome' ? ' · ' + esc(mecanismoLegible(r.mecanismo)) : '') +
      (r.tipo === 'sindrome' ? '' : ' · solo código') + '</small></div>').join('');

    for (const nodoSug of $$('.sug', lista)) {
      nodoSug.onmousedown = e => {          // mousedown y no click: el blur del
        e.preventDefault();                 // input llega antes que el click
        elegir(res[Number(nodoSug.dataset.i)]);
      };
    }
  }

  function elegir(r) {
    p.diagnostico.icd = r.cod + ' — ' + r.txt;
    if (r.tipo === 'sindrome') {
      p.diagnostico.sindrome = r.nombre;
      p.diagnostico.sindromeId = r.sindrome.id;
      p.diagnostico.mecanismo = r.sindrome.mecanismo;
      if (!p.diagnostico.fecha) p.diagnostico.fecha = hoy();
      avisar('Diagnóstico y código completados. El plan sugerido ya está disponible.', 'ok');
    } else {
      /* Un codigo suelto no define un sindrome: se conserva lo escrito. */
      if (inp.value.trim()) p.diagnostico.sindrome = inp.value.trim();
      p.diagnostico.sindromeId = '';
    }
    inp.value = p.diagnostico.sindrome;
    cerrar();
    alGuardar();
    refrescar();
  }

  inp.addEventListener('input', pintar);
  inp.addEventListener('focus', pintar);
  inp.addEventListener('blur', () => setTimeout(cerrar, 120));
  inp.addEventListener('change', () => {
    /* Escritura libre: se guarda tal cual, sin exigir que este en la lista. */
    p.diagnostico.sindrome = inp.value;
    alGuardar();
  });
  inp.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

  return inp;
}
