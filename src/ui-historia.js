/* =========================================================================
   HISTORIA CLINICA DE DOLOR
   -------------------------------------------------------------------------
   La ventana central de la aplicacion. Arriba, lo que la aplicacion leyo de
   los datos cargados; abajo, las superficies que abren cada seccion.

   El orden no es caprichoso. Primero lo que puede matar (banderas rojas),
   despues lo que puede dañar (seguridad farmacologica), despues el
   razonamiento, y recien al final los formularios. Un tablero clinico que
   pone los formularios arriba y las alertas abajo esta mal hecho.

   Las secciones siguen lo que exigen las Normas de Dolor argentinas para
   una historia clinica de dolor de nivel 2 y 3: medicion cualitativa y de
   intensidad, repercusion psicologica, mapa dermatomal, efecto de los
   tratamientos previos, plan de estudios, propuesta terapeutica, resultado
   del plan analgesico y evolucion con medicamentos, dosis y escalas.
   ========================================================================= */
'use strict';

/* Catalogo de signos del examen fisico. Son los que las reglas del motor
   consultan, agrupados como se exploran. */
const EXAMEN_SIGNOS = [
  {g:'Neurológico', items:[
    {v:'hipoestesia',        t:'Hipoestesia en el territorio doloroso'},
    {v:'hipoalgesia',        t:'Hipoalgesia al pinchazo'},
    {v:'alodinia',           t:'Alodinia al roce'},
    {v:'hiperalgesia',       t:'Hiperalgesia'},
    {v:'debilidad',          t:'Debilidad segmentaria'},
    {v:'rot_disminuido',     t:'Reflejo osteotendinoso disminuido o abolido'},
    {v:'emg_confirmatorio',  t:'Electromiograma que confirma la lesión'},
    {v:'imagen_confirmatoria', t:'Imagen que confirma la lesión del sistema somatosensorial'}
  ]},
  {g:'Maniobras de columna', items:[
    {v:'lasegue',            t:'Lasègue positivo'},
    {v:'slump',              t:'Slump test positivo'},
    {v:'spurling',           t:'Spurling positivo'},
    {v:'palpacion_facetaria',t:'Dolor a la palpación de columnas articulares'},
    {v:'sacroiliacas_positivas', t:'Tres o más maniobras sacroilíacas positivas'},
    {v:'movilidad_cervical_limitada', t:'Movilidad cervical restringida'},
    {v:'palpacion_occipital',t:'Dolor a la presión del nervio occipital'}
  ]},
  {g:'Musculoesquelético', items:[
    {v:'punto_gatillo',      t:'Punto gatillo que reproduce el dolor'},
    {v:'banda_tensa',        t:'Banda tensa palpable'},
    {v:'rigidez_articular',  t:'Limitación del rango articular'},
    {v:'rango_pasivo_limitado', t:'Rango PASIVO limitado en todas las direcciones'},
    {v:'crepitacion',        t:'Crepitación articular'},
    {v:'tinel_positivo',     t:'Tinel positivo'},
    {v:'phalen',             t:'Phalen positivo'},
    {v:'dolor_cicatriz',     t:'Dolor sobre la cicatriz'}
  ]},
  {g:'Autonómico y trófico', items:[
    {v:'cambio_color',       t:'Cambio de color de la piel'},
    {v:'cambio_temperatura', t:'Asimetría de temperatura'},
    {v:'edema',              t:'Edema'},
    {v:'sudoracion',         t:'Cambios en la sudoración'},
    {v:'cambios_troficos',   t:'Cambios tróficos en piel, uñas o vello'},
    {v:'temblor',            t:'Temblor o distonía'}
  ]},
  {g:'Generales', items:[
    {v:'hipersensibilidad_estimulos', t:'Hipersensibilidad a luz, ruido u olores'},
    {v:'sueño_no_reparador', t:'Sueño no reparador'},
    {v:'fatiga',             t:'Fatiga'},
    {v:'sintomas_cognitivos',t:'Síntomas cognitivos referidos'}
  ]}
];

const ETIQUETAS_ANTECEDENTES = [
  {v:'diabetes',t:'Diabetes'},        {v:'cancer',t:'Cáncer'},
  {v:'quimioterapia',t:'Quimioterapia'},{v:'herpes',t:'Herpes zóster'},
  {v:'cirugia',t:'Cirugía previa'},   {v:'cirugia_columna',t:'Cirugía de columna'},
  {v:'cirugia_torax',t:'Cirugía torácica'}, {v:'cirugia_mama',t:'Cirugía mamaria'},
  {v:'amputacion',t:'Amputación'},    {v:'trauma',t:'Trauma'},
  {v:'latigazo',t:'Latigazo cervical'},{v:'fractura',t:'Fractura'},
  {v:'artritis',t:'Artritis / espondiloartritis'}, {v:'osteoporosis',t:'Osteoporosis'},
  {v:'hipotiroidismo',t:'Hipotiroidismo'}, {v:'depresion',t:'Depresión'},
  {v:'fibromialgia',t:'Fibromialgia'},{v:'acv',t:'ACV'},
  {v:'lesion_medular',t:'Lesión medular'}, {v:'esclerosis',t:'Esclerosis múltiple'},
  {v:'obesidad',t:'Obesidad'},        {v:'embarazo',t:'Embarazo / puerperio'},
  {v:'renal',t:'Insuficiencia renal'},{v:'hepatica',t:'Hepatopatía'},
  {v:'cardiopatia',t:'Cardiopatía'},  {v:'epilepsia',t:'Epilepsia'},
  {v:'glaucoma',t:'Glaucoma'},        {v:'prostatismo',t:'Prostatismo'},
  {v:'anticoagulado',t:'Anticoagulado / antiagregado'}
];

/* ====================================================== VENTANA PRINCIPAL */

function ventanaHistoria(id) {
  abrir({
    id:'hc_' + id, titulo:'Historia clínica', ancha:true, ctx:{id},
    dibujar(c, ctx) {
      const p = ESTADO.pacientes[ctx.id];
      if (!p) { c.innerHTML = vacio('Paciente no encontrado', 'Puede haber sido borrado desde otro dispositivo.'); return; }

      /* Sin acceso clinico, la historia se reduce a la ficha administrativa:
         quien es, como ubicarlo y cuando vuelve. Ni diagnostico, ni medicacion,
         ni evoluciones, ni el motor. */
      if (!puede('clinica')) {
        c.insertAdjacentHTML('beforeend',
          '<div class="bloque"><h2 style="font-size:19px">' + esc(nombreCompleto(p)) + '</h2>' +
          '<div class="nota">' + esc([p.dni ? 'DNI ' + p.dni : '',
            edadDe(p.fechaNac) ? edadDe(p.fechaNac) + ' años' : ''].filter(Boolean).join(' · ')) +
          '</div></div>' +
          bloque('Ficha administrativa',
            dato('Documento', esc(p.dni)) +
            dato('Nacimiento', p.fechaNac ? fechaCorta(p.fechaNac) : '—') +
            dato('Teléfono', esc(p.telefono)) +
            dato('Correo', esc(p.email)) +
            dato('Obra social', esc(p.obraSocial)) +
            dato('Nº de afiliado', esc(p.afiliado)) +
            dato('Derivado por', esc(p.derivante)) +
            dato('Próximo control', p.proximoControl ? fechaCorta(p.proximoControl) : '—')));
        c.appendChild(superficie('Editar los datos de contacto y cobertura', null,
          () => ventanaFiliacion(p.id), 'suave'));
        c.insertAdjacentHTML('beforeend',
          '<p class="nota" style="margin-top:14px">El contenido clínico de esta historia ' +
          '—diagnóstico, medicación, evoluciones— lo ve únicamente el personal médico. ' +
          'Tu rol es Secretaría.</p>');
        return;
      }

      const a = analizar(p);
      const ef = efectividadPaciente(p);

      /* Si hay un borrado programado, es lo primero que se ve: por encima
         incluso de las banderas rojas, porque es lo unico que se puede
         perder de forma irreversible en los proximos minutos. */
      const faltan = segundosParaBorrar(p);
      if (faltan != null) {
        const aviso = document.createElement('div');
        aviso.className = 'alerta urgente';
        aviso.innerHTML =
          '<b>Esta historia se va a borrar en <span id="relojBorrado">' +
          relojBorrado(faltan) + '</span></b>' +
          '<p>El borrado quedó programado ' + esc(desdeHace(p.borradoProgramado.desde)) +
          (p.borradoProgramado.por ? ' por ' + esc(p.borradoProgramado.por) : '') +
          '. Hasta que el reloj llegue a cero la historia está intacta y se puede recuperar. ' +
          'Después de eso no queda copia, salvo que haya un respaldo exportado.</p>';
        c.appendChild(aviso);
        aviso.appendChild(superficie('Cancelar el borrado',
          'La historia queda como estaba', () => {
            cancelarBorrado(p.id);
            avisar('Borrado cancelado. La historia está a salvo.', 'ok');
            refrescar();
          }, 'acento'));

        /* El reloj corre a la vista mientras la ventana este abierta. */
        const tic = setInterval(() => {
          const nodo = $('#relojBorrado');
          if (!nodo) { clearInterval(tic); return; }
          const q = segundosParaBorrar(ESTADO.pacientes[ctx.id]);
          if (q == null) { clearInterval(tic); refrescar(); return; }
          if (q <= 0) { clearInterval(tic); revisarBorradosPendientes(); volverA(0); return; }
          nodo.textContent = relojBorrado(q);
        }, 1000);
      }

      /* ---- identidad y efectividad ---------------------------------- */
      const cab = document.createElement('div');
      cab.className = 'bloque cab-paciente';
      cab.innerHTML =
        '<div style="flex:1;min-width:0">' +
        '<h2 style="font-size:19px">' + esc(nombreCompleto(p)) + '</h2>' +
        '<div class="nota">' +
        esc([p.dni ? 'DNI ' + p.dni : '', edadDe(p.fechaNac) ? edadDe(p.fechaNac) + ' años' : '',
             p.sexo === 'F' ? 'femenino' : p.sexo === 'M' ? 'masculino' : '',
             p.obraSocial].filter(Boolean).join(' · ')) + '</div>' +
        (p.diagnostico && p.diagnostico.sindrome
          ? '<div style="margin-top:6px">' + marca(p.diagnostico.sindrome, 'acento') +
            (p.diagnostico.icd ? ' <span class="nota">' + esc(p.diagnostico.icd) + '</span>' : '') + '</div>'
          : '<div style="margin-top:6px">' + marca('sin diagnóstico cargado', 'neutro') + '</div>') +
        '</div>' +
        '<div class="cab-anillo">' + anilloEfectividad(ef.porcentaje, 64) +
        '<div class="nota" style="font-size:10.5px;margin-top:2px">efectividad</div></div>';
      c.appendChild(cab);

      if (ef.porcentaje != null) {
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta" style="border-left-color:' + ef.banda.color + '">' +
          '<b>' + esc(ef.banda.etiqueta) + ' — ' + ef.porcentaje + '%</b>' +
          '<p>' + esc(ef.banda.accion) + '</p>' +
          '<p class="nota">' + esc(ef.resumen) + '</p></div>');
      }

      if (ef.serie.length) {
        c.insertAdjacentHTML('beforeend',
          '<div class="bloque"><h3>Evolución de la intensidad</h3>' +
          graficoEvolucion(ef.serie) + '</div>');
      }

      /* ---- lo que no puede esperar ---------------------------------- */
      if (a.banderas.length) {
        c.insertAdjacentHTML('beforeend',
          '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
          'color:var(--rojo);margin:16px 0 8px">Banderas rojas</h3>');
        for (const b of a.banderas) {
          c.insertAdjacentHTML('beforeend',
            '<div class="alerta ' + b.nivel + '"><b>' + esc(b.txt) +
            (b.deducida ? ' <span class="nota">— ' + esc(b.deducida) + '</span>' : '') + '</b>' +
            '<p>' + esc(b.accion) + '</p></div>');
        }
      }

      if (a.seguridad.avisos.length) {
        c.insertAdjacentHTML('beforeend',
          '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
          'color:var(--tinta-3);margin:16px 0 8px">Control de seguridad farmacológica</h3>');
        for (const s of a.seguridad.avisos) {
          c.insertAdjacentHTML('beforeend',
            '<div class="alerta ' + s.nivel + '"><b>' + esc(s.titulo) + '</b>' +
            '<p>' + esc(s.texto) + '</p>' +
            (s.nota ? '<p class="nota">' + esc(s.nota) + '</p>' : '') + '</div>');
        }
      }

      /* ---- lo que la aplicacion piensa ------------------------------- */
      c.appendChild(cajaAnalisis(p, a));

      /* ---- las secciones --------------------------------------------- */
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:20px 0 9px">Historia clínica</h3>');

      const g = document.createElement('div');
      g.className = 'rejilla';
      c.appendChild(g);

      const nEsc = Object.keys(p.escalas || {}).length;
      const nMed = (p.medicacion || []).length;
      const nEvo = (p.evoluciones || []).length;

      g.appendChild(superficie('Filiación y antecedentes',
        resumenCorto(p.antecedentes.enfermedades) || 'Sin antecedentes cargados',
        () => ventanaFiliacion(p.id)));
      g.appendChild(superficie('Historia del dolor y mapa',
        (p.dolor.mapa || []).length + ' puntos marcados' +
        (p.dolor.nrsPromedio != null ? ' · NRS ' + p.dolor.nrsPromedio : ''),
        () => ventanaDolor(p.id)));
      g.appendChild(superficie('Examen físico',
        (p.examen.signos || []).length ? (p.examen.signos || []).length + ' signos consignados'
                                       : 'Sin examen cargado',
        () => ventanaExamen(p.id)));
      g.appendChild(superficie('Escalas',
        nEsc ? nEsc + ' completada' + (nEsc === 1 ? '' : 's') : 'Ninguna completada',
        () => ventanaEscalas(p.id)));
      g.appendChild(superficie('Diagnóstico',
        (p.diagnostico && p.diagnostico.sindrome) || 'Sin definir',
        () => ventanaDiagnostico(p.id)));
      g.appendChild(superficie('Plan terapéutico',
        (p.plan && p.plan.objetivo) ? resumenCorto(p.plan.objetivo) : 'Sin plan cargado',
        () => ventanaPlan(p.id)));
      g.appendChild(superficie('Medicación',
        nMed ? nMed + ' fármaco' + (nMed === 1 ? '' : 's') +
               (a.seguridad.mme.total ? ' · ' + a.seguridad.mme.total + ' MME/día' : '')
             : 'Sin medicación cargada',
        () => ventanaMedicacion(p.id)));
      g.appendChild(superficie('Evoluciones y controles',
        nEvo ? nEvo + ' control' + (nEvo === 1 ? '' : 'es') +
               (p.proximoControl ? ' · próximo ' + fechaCorta(p.proximoControl) : '')
             : 'Sin controles registrados',
        () => ventanaEvoluciones(p.id)));
      g.appendChild(superficie('Consentimientos informados',
        (p.consentimientos || []).length ? (p.consentimientos || []).length + ' emitido(s)'
                                         : 'Ninguno emitido',
        () => ventanaConsentimientos(p.id)));
      g.appendChild(superficie('Resumen para el paciente',
        (p.resumenesEnviados || []).length
          ? 'Último enviado ' + desdeHace(p.resumenesEnviados[p.resumenesEnviados.length-1].fecha)
          : 'Una página en lenguaje llano, para enviarle por correo',
        () => ventanaResumenPaciente(p.id)));
      g.appendChild(superficie('Imprimir la historia',
        'Resumen completo para el papel o el PDF',
        () => imprimirHistoria(p.id)));

      c.insertAdjacentHTML('beforeend', '<div style="height:16px"></div>');
      if (faltan == null) {
        c.appendChild(superficie('Borrar este paciente', null, () => {
          /* Dos preguntas y no una. La primera se responde con la mano; la
             segunda obliga a leer que se borra y a quien. */
          confirmar('¿Está segura de borrar este paciente?',
            'Se trata de la historia clínica completa de ' + nombreCompleto(p) + ': ' +
            (p.evoluciones || []).length + ' control(es), ' +
            Object.keys(p.escalas || {}).length + ' escala(s) y todo el plan terapéutico.',
            () => {
              confirmar('Confirmar el borrado de ' + nombreCompleto(p),
                'La historia NO se borra ahora. Queda programada para borrarse en ' +
                MINUTOS_PARA_BORRAR + ' minutos, con un reloj a la vista y la posibilidad de ' +
                'cancelar en cualquier momento. Pasado ese plazo no se puede recuperar.',
                () => {
                  programarBorrado(p.id);
                  avisar('Borrado programado. Tenés ' + MINUTOS_PARA_BORRAR +
                         ' minutos para arrepentirte.', 'aviso', 8000);
                  refrescar();
                }, 'Programar el borrado');
            }, 'Sí, estoy segura');
        }, 'fina peligro'));
      }
    }
  });
}

function resumenCorto(t, largo) {
  const s = String(t || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const n = largo || 62;
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

/* ====================================================== ANALISIS ======== */

function cajaAnalisis(p, a) {
  const n = document.createElement('div');

  let h = '';

  /* FICHA EN BLANCO: se dice que falta cargar, y nada más.

     Antes, un paciente recién abierto ya mostraba un mecanismo predominante y
     un diagnóstico diferencial encabezado por cualquier síndrome. Eso no era
     una lectura prematura: era una lectura de la nada, y lo peor que puede
     hacer una aplicación de apoyo diagnóstico es anclar al médico en un
     diagnóstico que ella misma inventó antes de que existiera un solo dato. */
  if (a.completitud.vacio) {
    n.innerHTML = cajaSugerencia('Lectura automática',
      '<div class="alerta info" style="margin:0"><b>Todavía no hay nada para analizar</b>' +
      '<p>Esta ficha está en blanco. La aplicación no opina hasta que haya con qué: ' +
      'ni mecanismo, ni diferencial, ni plan.</p></div>' +
      '<p class="nota" style="margin-top:10px">Los datos que destraban la lectura, ' +
      'en orden de peso:</p>' +
      '<ol class="pasos-lectura">' +
      '<li><b>El mapa corporal.</b> Dónde duele y con cuánta intensidad. Es el que más ' +
      'aporta: define la distribución y el territorio.</li>' +
      '<li><b>Los descriptores y la intensidad.</b> Cómo es ese dolor y cuánto pesa.</li>' +
      '<li><b>La fecha de inicio.</b> Separa el dolor agudo del crónico.</li>' +
      '<li><b>El DN4 y el examen físico.</b> Son los que permiten graduar un dolor ' +
      'neuropático, no solo sospecharlo.</li></ol>' +
      '<p class="nota">Con dos de estos cinco ya aparece una lectura orientativa; ' +
      'con todos, una lectura que vale la pena discutir.</p>');
    return n;
  }

  /* Cuánto se puede confiar en lo que sigue. */
  if (!a.completitud.suficiente) {
    h += '<div class="alerta medio" style="margin-bottom:10px"><b>Faltan datos para analizar bien</b>' +
      '<p>Sin ' + esc(a.completitud.faltan.join(', ')) + ', el análisis de abajo es apenas orientativo.</p></div>';
  }

  /* Fenotipo. */
  const f = a.fenotipo;
  const colorMec = {neuropatico:'violeta', nociplastico:'ambar', nociceptivo:'lima', indeterminado:'neutro'};
  h += '<div style="margin-bottom:12px">' +
       '<div style="font-size:15px;font-weight:600;margin-bottom:6px">' + esc(f.texto) + '</div>';
  const detalles = [];
  if (f.neuropatico.porque.length)  detalles.push({t:'A favor de neuropático', l:f.neuropatico.porque});
  if (f.nociplastico.porque.length) detalles.push({t:'A favor de nociplástico', l:f.nociplastico.porque});
  if (f.nociceptivo.porque.length)  detalles.push({t:'A favor de nociceptivo', l:f.nociceptivo.porque});
  for (const d of detalles) {
    h += '<div class="nota" style="margin-bottom:5px"><b>' + esc(d.t) + ':</b> ' +
         esc(d.l.join(' · ')) + '</div>';
  }
  h += '</div>';

  /* Diferencial. */
  if (a.diferencial.length) {
    h += '<div style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;' +
         'color:var(--acento-tinta);margin:14px 0 8px">Diagnóstico diferencial</div>';
    for (const d of a.diferencial) {
      const col = d.concordancia >= 70 ? 'var(--verde)' : d.concordancia >= 50 ? 'var(--ambar)' : 'var(--tinta-3)';
      h += '<div class="dif" data-sid="' + esc(d.sindrome.id) + '" ' +
           'style="cursor:pointer;padding:9px 0;border-bottom:1px solid var(--linea)">' +
           '<div style="display:flex;gap:9px;align-items:baseline">' +
           '<b style="flex:1;font-size:14px">' + esc(d.sindrome.nombre) + '</b>' +
           '<span style="font-weight:700;color:' + col + '">' + d.concordancia + '%</span></div>' +
           '<div class="barra-pct"><i style="width:' + d.concordancia + '%;background:' + col + '"></i></div>' +
           '<div class="nota" style="margin-top:5px">' + esc(d.aFavor.slice(0, 3).join(' · ')) +
           (d.aFavor.length > 3 ? ' · y ' + (d.aFavor.length - 3) + ' más' : '') + '</div></div>';
    }
    h += '<p class="nota" style="margin-top:9px">Tocá cualquiera para ver el detalle completo, ' +
         'lo que juega en contra y el plan sugerido.</p>';
  } else {
    h += '<p class="nota">Con los datos actuales ningún síndrome del catálogo alcanza el umbral ' +
         'mínimo de concordancia. Completar el mapa corporal, los descriptores y el examen físico ' +
         'suele ser lo que destraba esto.</p>';
  }

  n.innerHTML = cajaSugerencia('Lectura automática', h);
  for (const d of $$('.dif', n)) {
    d.onclick = () => ventanaSindrome(d.dataset.sid, p.id);
  }
  return n;
}

/* ====================================================== FILIACION ======= */

function ventanaFiliacion(id) {
  abrir({id:'fil_' + id, titulo:'Filiación y antecedentes', ctx:{id}, dibujar(c, ctx) {
    const p = ESTADO.pacientes[ctx.id];
    const g = () => { p.modificado = ahora(); guardar('pacientes', p.id, p); };

    const g1 = document.createElement('div'); g1.className = 'dos'; c.appendChild(g1);
    campo(g1, 'Apellido', p, 'apellido', {alCambiar:g});
    campo(g1, 'Nombre', p, 'nombre', {alCambiar:g});
    const g2 = document.createElement('div'); g2.className = 'dos'; c.appendChild(g2);
    campo(g2, 'Documento', p, 'dni', {alCambiar:g});
    campo(g2, 'Fecha de nacimiento', p, 'fechaNac', {tipo:'date', alCambiar:g});
    const g3 = document.createElement('div'); g3.className = 'dos'; c.appendChild(g3);
    campo(g3, 'Teléfono', p, 'telefono', {tipo:'tel', alCambiar:g});
    campo(g3, 'Correo', p, 'email', {tipo:'email', alCambiar:g});
    const g4 = document.createElement('div'); g4.className = 'dos'; c.appendChild(g4);
    campo(g4, 'Obra social o prepaga', p, 'obraSocial', {alCambiar:g});
    campo(g4, 'Nº de afiliado', p, 'afiliado', {alCambiar:g});
    const g5 = document.createElement('div'); g5.className = 'dos'; c.appendChild(g5);
    campo(g5, 'Ocupación', p, 'ocupacion', {alCambiar:g});
    campo(g5, 'Derivado por', p, 'derivante', {alCambiar:g});

    const cs = document.createElement('div'); cs.className = 'campo';
    cs.innerHTML = '<label>Sexo</label>'; c.appendChild(cs);
    opciones(cs, [{t:'Femenino',v:'F'},{t:'Masculino',v:'M'},{t:'Otro',v:'X'}], p.sexo,
             v => { p.sexo = v; g(); refrescar(); });

    if (!puede('clinica')) {
      c.insertAdjacentHTML('beforeend',
        '<p class="nota" style="margin-top:16px">Los antecedentes médicos y el resto de la ' +
        'historia los completa el personal médico.</p>');
      return;
    }

    c.insertAdjacentHTML('beforeend', '<hr style="border:0;border-top:1px solid var(--linea);margin:20px 0">');

    const an = p.antecedentes;
    campo(c, 'Enfermedades diagnosticadas', an, 'enfermedades', {area:true, filas:3, alCambiar:g});
    campo(c, 'Cirugías previas', an, 'cirugias', {area:true, filas:3, alCambiar:g});
    campo(c, 'Alergias', an, 'alergias', {area:true, filas:2, alCambiar:g,
      ayuda:'La aplicación compara este texto con cada fármaco que sugiere.'});
    campo(c, 'Antecedentes familiares', an, 'familiares', {area:true, filas:2, alCambiar:g});
    campo(c, 'Hábitos', an, 'habitos', {area:true, filas:2, alCambiar:g});
    campo(c, 'Otra medicación (no analgésica)', an, 'medicacionNoDolor',
      {area:true, filas:2, alCambiar:g,
       ayuda:'Anotá acá todo lo demás: es lo que la aplicación revisa para las interacciones.'});
    campo(c, 'Filtrado glomerular (ml/min), si se conoce', an, 'filtrado',
      {tipo:'number', alCambiar:g,
       ayuda:'Con este dato la aplicación puede avisar de los ajustes de dosis por función renal.'});

    if (!puede('clinica')) return;   // lo de abajo es clínico

    const ce = document.createElement('div'); ce.className = 'campo';
    ce.innerHTML = '<label>Antecedentes que el motor tiene en cuenta</label>' +
      '<div class="ayuda" style="margin-bottom:7px">Marcar lo que corresponda hace que el ' +
      'análisis automático y el control de interacciones funcionen bien.</div>';
    c.appendChild(ce);
    opciones(ce, ETIQUETAS_ANTECEDENTES, an.etiquetas || [],
             v => { an.etiquetas = v; g(); }, true);

    const cb = document.createElement('div'); cb.className = 'campo';
    cb.innerHTML = '<label>Banderas rojas</label>';
    c.appendChild(cb);
    opciones(cb, BANDERAS.map(b => ({t:b.txt, v:b.id})), an.banderas || [],
             v => { an.banderas = v; g(); refrescar(); }, true);
  }});
}

/* ====================================================== DOLOR =========== */

function ventanaDolor(id) {
  abrir({id:'dol_' + id, titulo:'Historia del dolor', ancha:true, ctx:{id}, dibujar(c, ctx) {
    const p = ESTADO.pacientes[ctx.id];
    const d = p.dolor;
    const g = () => { p.modificado = ahora(); d.meses = mesesDesde(d.inicio); guardar('pacientes', p.id, p); };

    campo(c, '¿Cuándo comenzó el dolor?', d, 'inicio', {tipo:'date', alCambiar:() => { g(); refrescar(); },
      ayuda:d.inicio ? 'Evolución: ' + (mesesDesde(d.inicio) || 0) + ' meses' : ''});
    campo(c, '¿Cómo comenzó?', d, 'mecanismo', {area:true, filas:2, alCambiar:g});
    campo(c, 'Descripción del dolor', d, 'descripcion', {area:true, filas:3, alCambiar:g});

    const cd = document.createElement('div'); cd.className = 'campo';
    cd.innerHTML = '<label>Descriptores</label>'; c.appendChild(cd);
    opciones(cd, DESCRIPTORES, d.descriptores || [],
             v => { d.descriptores = v; g(); }, true);

    for (const e of [
      {k:'nrsAhora', t:'Intensidad ahora'}, {k:'nrsPromedio', t:'Promedio en 2 semanas'},
      {k:'nrsPeor', t:'En el peor momento'}, {k:'nrsMejor', t:'En el mejor momento'}]) {
      const cc = document.createElement('div'); cc.className = 'campo';
      cc.innerHTML = '<label>' + esc(e.t) + '</label>'; c.appendChild(cc);
      escalaNRS(cc, d[e.k], v => { d[e.k] = v; g(); });
    }

    const cp = document.createElement('div'); cp.className = 'campo';
    cp.innerHTML = '<label>Patrón temporal</label>'; c.appendChild(cp);
    opciones(cp, [{t:'Constante',v:'constante'},{t:'Intermitente',v:'intermitente'},
                  {t:'Constante con crisis',v:'mixto'}], d.patron,
             v => { d.patron = v; g(); refrescar(); });

    campo(c, 'Momento del día en que es peor', d, 'peorMomento', {alCambiar:g});
    campo(c, 'Irradiación', d, 'irradiacion', {alCambiar:g});
    const gg = document.createElement('div'); gg.className = 'dos'; c.appendChild(gg);
    campo(gg, 'Lo alivia', d, 'alivia', {area:true, filas:2, alCambiar:g});
    campo(gg, 'Lo empeora', d, 'empeora', {area:true, filas:2, alCambiar:g});

    /* ---- mapa corporal ------------------------------------------------ */
    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:15px;margin:22px 0 4px">Mapa del dolor</h3>' +
      '<p class="nota" style="margin-bottom:12px">Es el mapa dermatomal que exigen las Normas ' +
      'de Dolor. Tocá para agregar un punto y elegir su intensidad; tocá un punto existente ' +
      'para cambiarlo o quitarlo.</p>');
    if (!Array.isArray(d.mapa)) d.mapa = [];
    const zonaMapa = document.createElement('div');
    c.appendChild(zonaMapa);
    const resumen = document.createElement('div');
    resumen.className = 'bloque';
    resumen.style.marginTop = '14px';
    dibujarMapa(zonaMapa, d.mapa, () => { g(); resumen.innerHTML = '<h3>Lectura del mapa</h3>' + resumenMapa(d.mapa); });
    resumen.innerHTML = '<h3>Lectura del mapa</h3>' + resumenMapa(d.mapa);
    c.appendChild(resumen);

    /* ---- impacto ------------------------------------------------------ */
    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:15px;margin:22px 0 10px">Repercusión en la vida diaria</h3>');
    const im = p.impacto;
    campo(c, 'Sueño', im, 'sueño', {area:true, filas:2, alCambiar:g});
    campo(c, 'Trabajo y actividades', im, 'trabajo', {area:true, filas:2, alCambiar:g});
    campo(c, 'Estado de ánimo', im, 'animo', {area:true, filas:2, alCambiar:g});
    campo(c, 'Actividades que abandonó', im, 'dejoDeHacer', {area:true, filas:2, alCambiar:g});

    /* ---- objetivos funcionales ---------------------------------------- */
    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:15px;margin:22px 0 4px">Objetivos funcionales acordados</h3>' +
      '<p class="nota" style="margin-bottom:10px">Dos o tres cosas concretas que el paciente ' +
      'quiere volver a hacer. Es contra esto que se mide el tratamiento, no contra un número ' +
      'de la escala.</p>');
    if (!Array.isArray(im.objetivos)) im.objetivos = [];
    const zonaObj = document.createElement('div');
    c.appendChild(zonaObj);
    pintarObjetivos();
    function pintarObjetivos() {
      zonaObj.innerHTML = '';
      im.objetivos.forEach((o, i) => {
        const f = document.createElement('div');
        f.className = 'bloque';
        f.style.marginBottom = '7px';
        const obj = {t:typeof o === 'string' ? o : (o.t || ''), logrado:o.logrado || false};
        im.objetivos[i] = obj;
        campo(f, null, obj, 't', {alCambiar:g, pista:'ej. dormir de corrido cinco noches seguidas'});
        const cc = document.createElement('div');
        f.appendChild(cc);
        opciones(cc, [{t:'Logrado', v:true}], obj.logrado ? true : null,
                 v => { obj.logrado = !!v; g(); pintarObjetivos(); });
        f.appendChild(superficie('Quitar', null, () => {
          im.objetivos.splice(i, 1); g(); pintarObjetivos();
        }, 'fina peligro'));
        zonaObj.appendChild(f);
      });
      zonaObj.appendChild(superficie('+ Agregar objetivo', null, () => {
        im.objetivos.push({t:'', logrado:false}); g(); pintarObjetivos();
      }, 'suave'));
    }

    /* ---- tratamientos previos ------------------------------------------ */
    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:15px;margin:22px 0 10px">Tratamientos previos y su resultado</h3>');
    if (!Array.isArray(p.tratamientosPrevios)) p.tratamientosPrevios = [];
    listaEditable(c, p.tratamientosPrevios, [
      {k:'que', t:'Tratamiento'}, {k:'cuando', t:'Cuándo'},
      {k:'resultado', t:'Resultado', lista:['Mejoró','Igual','Empeoró']},
      {k:'obs', t:'Observaciones'}
    ], 'Agregar tratamiento previo', g);
  }});
}

/* ====================================================== EXAMEN ========== */

function ventanaExamen(id) {
  abrir({id:'exa_' + id, titulo:'Examen físico', ctx:{id}, dibujar(c, ctx) {
    const p = ESTADO.pacientes[ctx.id];
    if (!p.examen.signos) p.examen.signos = [];
    const g = () => { p.modificado = ahora(); guardar('pacientes', p.id, p); };

    c.insertAdjacentHTML('beforeend',
      '<p class="nota" style="margin-bottom:14px">Los signos que se marcan acá son los que ' +
      'usa el motor. En particular, el examen sensitivo es lo único que permite pasar de dolor ' +
      'neuropático <i>posible</i> a <i>probable</i> en la gradación NeuPSIG.</p>');

    for (const grupo of EXAMEN_SIGNOS) {
      const cc = document.createElement('div');
      cc.className = 'campo';
      cc.innerHTML = '<label>' + esc(grupo.g) + '</label>';
      c.appendChild(cc);
      opciones(cc, grupo.items, p.examen.signos,
               v => { p.examen.signos = v; g(); }, true);
    }

    campo(c, 'Examen físico completo', p.examen, 'texto', {area:true, filas:6, alCambiar:g,
      pista:'Inspección, palpación, rango de movilidad, fuerza, sensibilidad, reflejos, marcha…'});
    campo(c, 'Observaciones', p.examen, 'observaciones', {area:true, filas:3, alCambiar:g});
  }});
}

/* ====================================================== ESCALAS ========= */

function ventanaEscalas(id) {
  abrir({id:'esc_' + id, titulo:'Escalas e instrumentos', ancha:true, ctx:{id}, dibujar(c, ctx) {
    const p = ESTADO.pacientes[ctx.id];
    p.escalas = p.escalas || {};

    /* Las que valen la pena para ESTE paciente van primero. */
    const a = analizar(p);
    const sugeridas = new Set(['nrs', 'dn4', 'pgic']);
    if (a.fenotipo.predominante === 'neuropatico') sugeridas.add('paindetect');
    if (a.fenotipo.predominante === 'nociplastico') { sugeridas.add('csi'); sugeridas.add('acr2016'); }
    if (a.contexto.regiones.has('lumbar')) { sugeridas.add('odi'); sugeridas.add('startback'); }
    if (a.contexto.regiones.has('cervical')) sugeridas.add('ndi');
    if (a.seguridad.mme.total > 0) sugeridas.add('ort');
    sugeridas.add('bpi'); sugeridas.add('pcs'); sugeridas.add('pseq');

    const orden = Object.keys(ESCALAS).sort((x, y) => {
      const sx = sugeridas.has(x) ? 0 : 1, sy = sugeridas.has(y) ? 0 : 1;
      if (sx !== sy) return sx - sy;
      return ESCALAS[x].sigla.localeCompare(ESCALAS[y].sigla);
    });

    for (const idEsc of orden) {
      const e = ESCALAS[idEsc];
      const hecha = p.escalas[idEsc];
      let detalle;
      if (hecha && hecha.total != null) {
        const corte = interpretarEscala(idEsc, hecha.total);
        detalle = e.nombre + ' — ' + hecha.total + (e.porcentual ? '%' : '') +
                  (corte ? ' · ' + corte.etiqueta : '') + ' · ' + fechaCorta(hecha.fecha);
      } else {
        detalle = e.nombre + ' · ' + e.minutos + ' min · lo completa ' + e.quien;
      }
      const s = superficie(e.sigla + (sugeridas.has(idEsc) ? '  ◇' : ''), detalle,
                           () => ventanaCompletarEscala(p.id, idEsc),
                           hecha && hecha.total != null ? 'suave fina' : 'fina');
      c.appendChild(s);
    }

    c.insertAdjacentHTML('beforeend',
      '<p class="nota" style="margin-top:14px">Las marcadas con ◇ son las que la aplicación ' +
      'considera pertinentes para este paciente según su fenotipo y la topografía del dolor.</p>');
  }});
}

function interpretarEscala(idEsc, total) {
  const e = ESCALAS[idEsc];
  if (!e || !e.cortes) return null;
  for (const c of e.cortes) if (total <= c.hasta) return c;
  return e.cortes[e.cortes.length - 1];
}

function ventanaCompletarEscala(idPac, idEsc) {
  const e = ESCALAS[idEsc];
  abrir({id:'esci_' + idPac + '_' + idEsc, titulo:e.sigla, sub:e.nombre,
    ctx:{idPac, idEsc}, dibujar(c, ctx) {
      const p = ESTADO.pacientes[ctx.idPac];
      const guardadas = p.escalas[ctx.idEsc] || {items:[], total:null};
      const items = e.items || (e.secciones || []).map(s => ({t:s}));
      const respuestas = guardadas.items && guardadas.items.length === items.length
        ? [...guardadas.items] : new Array(items.length).fill(null);

      if (e.enunciado) c.insertAdjacentHTML('beforeend', '<p>' + esc(e.enunciado) + '</p>');
      if (e.regla) c.insertAdjacentHTML('beforeend',
        '<div class="alerta info"><b>Cómo se lee</b><p>' + esc(e.regla) + '</p></div>');

      const zonaTotal = document.createElement('div');

      items.forEach((it, i) => {
        const cc = document.createElement('div');
        cc.className = 'campo';
        cc.innerHTML = '<label>' + esc(it.t) + (it.medico ? '  · lo completa el médico' : '') + '</label>';
        if (it.alerta) cc.insertAdjacentHTML('beforeend',
          '<div class="ayuda" style="color:var(--rojo)">' + esc(it.alerta) + '</div>');
        c.appendChild(cc);
        const ops = it.op || e.opciones ||
          (e.secciones ? [0,1,2,3,4,5].map(v => ({t:String(v), v})) : OP_SINO);
        opciones(cc, ops, respuestas[i], v => {
          respuestas[i] = v;
          recalcular();
        });
      });

      c.appendChild(zonaTotal);

      function recalcular() {
        const contestadas = respuestas.filter(v => v != null).length;
        let total = respuestas.reduce((s, v) => s + (Number(v) || 0), 0);
        if (e.promedio && contestadas) total = Math.round((total / contestadas) * 10) / 10;
        if (e.porcentual) {
          const maximo = items.length * 5;
          total = maximo ? Math.round((respuestas.reduce((s, v) => s + (Number(v) || 0), 0) / maximo) * 100) : 0;
        }
        const corte = interpretarEscala(ctx.idEsc, total);
        zonaTotal.innerHTML =
          '<div class="bloque" style="margin-top:16px"><h3>Resultado</h3>' +
          '<div style="font-size:26px;font-weight:700;letter-spacing:-.02em">' + total +
          (e.porcentual ? '%' : ' <span style="font-size:14px;color:var(--tinta-3)">/ ' +
            (e.rango ? e.rango[1] : '') + '</span>') + '</div>' +
          (corte ? '<div style="margin:6px 0">' + marca(corte.etiqueta, corte.color) + '</div>' : '') +
          (corte && corte.nota ? '<p class="nota">' + esc(corte.nota) + '</p>' : '') +
          '<p class="nota" style="margin-top:8px">' + contestadas + ' de ' + items.length +
          ' ítems respondidos.</p>' +
          (e.fuente ? '<p class="nota" style="margin-top:8px;padding-top:8px;' +
            'border-top:1px solid var(--linea)">' + esc(e.fuente) + '</p>' : '') +
          '</div>';
        zonaTotal.appendChild(superficie('Guardar el resultado', null, () => {
          p.escalas[ctx.idEsc] = {items:respuestas, total, fecha:hoy(),
                                  parcial:contestadas < items.length};
          p.modificado = ahora();
          guardar('pacientes', p.id, p);
          avisar(e.sigla + ' guardada: ' + total + (e.porcentual ? '%' : ''), 'ok');
          cerrarUltima();
        }, 'acento'));
      }
      recalcular();
    }});
}
