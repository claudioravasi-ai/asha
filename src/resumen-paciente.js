/* =========================================================================
   RESUMEN DE LA EVOLUCION PARA EL PACIENTE
   -------------------------------------------------------------------------
   Una pagina, en castellano llano, que el paciente puede leer sin que le
   traduzcan nada, y que puede mostrarle a otro medico o a la familia.

   TRES DECISIONES QUE VALE LA PENA EXPLICAR

   1. Es un resumen CONCEPTUAL, no la historia clinica. El correo electronico
      no es un canal seguro: no lo controla el consultorio, queda copiado en
      servidores ajenos y se reenvia solo. Va lo que el paciente necesita
      para entender su tratamiento y nada mas. Los diferenciales, las notas
      internas, el examen fisico y el razonamiento clinico NO viajan.

   2. Nada se manda sin que el medico lo lea. La aplicacion arma el borrador,
      lo muestra completo en pantalla y recien despues aparece la superficie
      de enviar. El texto ademas es editable antes de mandarlo.

   3. Lleva las pautas de alarma. Un resumen que dice como va el tratamiento
      pero no dice cuando hay que consultar sin esperar el turno esta a mitad
      de camino.
   ========================================================================= */
'use strict';

/* Traduce el mecanismo del dolor a algo que se pueda leer sin ser medico. */
const MECANISMO_LLANO = {
  nociceptivo:
    'El dolor viene de un tejido que está irritado o dañado —una articulación, ' +
    'un músculo, un hueso— y los nervios lo transmiten con normalidad.',
  neuropatico:
    'El dolor viene del propio nervio, que está lesionado o irritado. Por eso ' +
    'arde, da corrientazos o adormece, y por eso los analgésicos comunes ' +
    'funcionan poco: hacen falta medicamentos que actúan sobre el nervio.',
  nociplastico:
    'El sistema que transmite el dolor quedó demasiado sensible y amplifica ' +
    'señales que en otra persona no dolerían. El dolor es completamente real; ' +
    'lo que cambió es el volumen con el que el cuerpo lo transmite. Por eso el ' +
    'tratamiento se apoya sobre todo en el ejercicio, el sueño y la actividad, ' +
    'y no en los analgésicos.',
  mixto:
    'Hay más de un mecanismo funcionando a la vez, y por eso el tratamiento ' +
    'combina medicamentos que actúan de maneras distintas.'
};

/* Pautas de alarma. Las tres primeras van siempre; el resto se agregan segun
   lo que tenga este paciente. */
function pautasDeAlarma(p, a) {
  const L = [
    'Debilidad en las piernas o los brazos que va en aumento.',
    'Dificultad para orinar, para retener la orina o adormecimiento entre las piernas.',
    'Fiebre junto con el dolor.'
  ];
  const tiene = id => (p.antecedentes.etiquetas || []).includes(id);
  if (tiene('cancer'))
    L.push('Dolor de espalda que aumenta día a día, sobre todo si aparece debilidad en las piernas.');
  if (a.seguridad.mme.total > 0)
    L.push('Somnolencia excesiva, confusión o respiración lenta: son señales de que la ' +
           'dosis del analgésico fuerte es demasiada.');
  if ((p.medicacion || []).some(m => m.farmaco === 'carbamazepina' || m.farmaco === 'oxcarbazepina'))
    L.push('Cualquier erupción en la piel: suspenda el medicamento y consulte el mismo día.');
  if ((p.medicacion || []).some(m => m.farmaco === 'lamotrigina'))
    L.push('Cualquier erupción en la piel: suspenda la lamotrigina y consulte el mismo día.');
  if ((p.medicacion || []).some(m => m.farmaco === 'aine'))
    L.push('Dolor de estómago fuerte, vómitos oscuros o materia fecal negra.');
  if ((p.escalas || {}).phq9 && (p.escalas.phq9.items || [])[8] > 0)
    L.push('Si aparecen pensamientos de hacerse daño, no espere el turno: consulte ese mismo día.');
  L.push('Cualquier síntoma nuevo que lo preocupe. Preguntar de más nunca está de más.');
  return L;
}

/* -------------------------------------------------------------------------
   Arma el borrador del resumen. Devuelve un objeto con las partes por
   separado, para que la ventana pueda mostrarlas y dejarlas editar.
   ------------------------------------------------------------------------- */
function armarResumenPaciente(p) {
  const a = analizar(p);
  const ef = efectividadPaciente(p);
  const basal = primerNRS(p);
  const actual = ultimoNRS(p);
  const evos = (p.evoluciones || []).slice().sort((x, y) => (x.fecha || '').localeCompare(y.fecha || ''));
  const ultima = evos[evos.length - 1];

  /* --- cómo viene --------------------------------------------------- */
  let comoViene;
  if (basal != null && actual != null) {
    const cambio = mejoraPct(basal, actual, false);
    if (cambio >= 50)
      comoViene = 'Su dolor bajó de ' + basal + ' a ' + actual + ' sobre 10. Es una mejoría ' +
        'importante: más de la mitad de lo que dolía al principio.';
    else if (cambio >= 30)
      comoViene = 'Su dolor bajó de ' + basal + ' a ' + actual + ' sobre 10. Es una mejoría ' +
        'real y significativa. En dolor crónico, bajar un tercio es un buen resultado.';
    else if (cambio >= 15)
      comoViene = 'Su dolor bajó de ' + basal + ' a ' + actual + ' sobre 10. Hay una mejoría, ' +
        'todavía menor a la que buscamos. Por eso vamos a seguir ajustando el tratamiento.';
    else if (cambio >= 0)
      comoViene = 'Su dolor está en ' + actual + ' sobre 10, prácticamente igual que al ' +
        'comenzar (' + basal + '). Todavía no encontramos el tratamiento que le sirva, y ' +
        'eso es lo que vamos a seguir buscando.';
    else
      comoViene = 'Su dolor pasó de ' + basal + ' a ' + actual + ' sobre 10. Empeoró, y por ' +
        'eso vamos a revisar el diagnóstico y el plan completo, no solo la medicación.';
  } else {
    comoViene = 'Todavía no tenemos suficientes mediciones como para decir cómo viene la ' +
      'evolución. Eso se va a ver en los próximos controles.';
  }

  /* --- objetivos ------------------------------------------------------ */
  const objetivos = (p.impacto.objetivos || []).map(o =>
    typeof o === 'string' ? {t:o, logrado:false} : o).filter(o => o.t);
  const logrados = objetivos.filter(o => o.logrado);

  /* --- diagnóstico en llano ------------------------------------------- */
  const mecanismo = p.diagnostico.mecanismo || a.fenotipo.predominante;
  const explicacion = MECANISMO_LLANO[mecanismo] || '';

  /* --- medicación ------------------------------------------------------ */
  const meds = (p.medicacion || []).filter(m => m.farmaco || m.nombreLibre).map(m => {
    const f = FARMACOS[m.farmaco];
    return {
      nombre: f ? f.nombre : (m.nombreLibre || '—'),
      pauta: [m.dosis, m.frecuencia].filter(Boolean).join(', '),
      para: f ? paraQueSirve(m.farmaco) : ''
    };
  });

  return {
    p, a, ef, comoViene, objetivos, logrados, explicacion, meds,
    ultima, evos,
    alarmas: pautasDeAlarma(p, a),
    /* estos tres son editables antes de enviar */
    saludo: 'Le dejo por escrito un resumen de cómo viene su tratamiento, para que lo ' +
            'tenga a mano y pueda mostrárselo a quien haga falta.',
    comentario: (ultima && ultima.texto) ? ultima.texto : '',
    cierre: 'Cualquier duda, escriba o llame al consultorio. No hace falta esperar al turno.'
  };
}

/* Para qué sirve cada fármaco, dicho de manera que se entienda. Es la
   pregunta que el paciente hace siempre y que casi nunca queda contestada
   en la receta. */
function paraQueSirve(id) {
  const g = (FARMACOS[id] || {}).grupo;
  const map = {
    pregabalina:'calma el dolor de origen nervioso',
    gabapentina:'calma el dolor de origen nervioso',
    amitriptilina:'calma el dolor de origen nervioso y ayuda a dormir',
    nortriptilina:'calma el dolor de origen nervioso y ayuda a dormir',
    duloxetina:'calma el dolor y ayuda con el ánimo',
    venlafaxina:'calma el dolor y ayuda con el ánimo',
    carbamazepina:'corta las crisis de dolor tipo corrientazo',
    oxcarbazepina:'corta las crisis de dolor tipo corrientazo',
    lamotrigina:'calma el dolor de origen nervioso',
    paracetamol:'analgésico de base',
    aine:'antiinflamatorio y analgésico',
    aine_topico:'antiinflamatorio en gel, para aplicar sobre la articulación',
    dipirona:'analgésico',
    tramadol:'analgésico fuerte, para los momentos peores',
    morfina:'analgésico fuerte',
    oxicodona:'analgésico fuerte',
    metadona:'analgésico fuerte de acción prolongada',
    fentanilo_td:'analgésico fuerte en parche',
    buprenorfina_td:'analgésico fuerte en parche',
    tapentadol:'analgésico fuerte',
    lidocaina_parche:'parche que adormece la zona dolorosa',
    capsaicina_alta:'parche que desensibiliza la zona dolorosa',
    capsaicina_baja:'crema que desensibiliza la zona dolorosa',
    ciclobenzaprina:'relaja la contractura muscular',
    baclofeno:'relaja la contractura muscular',
    dexametasona:'desinflama',
    corticoide_oral:'desinflama',
    vitamina_c:'protege al nervio',
    bifosfonatos:'protege el hueso y calma el dolor óseo'
  };
  return map[id] || (g === 'Opioide' ? 'analgésico fuerte' : 'para el dolor');
}

/* =========================================================================
   LA VENTANA
   ========================================================================= */

function ventanaResumenPaciente(id) {
  abrir({id:'res_' + id, titulo:'Resumen para el paciente',
    sub:'Una página, en lenguaje llano', ancha:true, ctx:{id}, dibujar(c, ctx) {
      const p = ESTADO.pacientes[ctx.id];
      if (!p) return;
      const r = armarResumenPaciente(p);

      if (!p.email) {
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta medio"><b>Este paciente no tiene correo cargado</b>' +
          '<p>Podés generar el resumen e imprimirlo igual, pero para enviarlo hace falta ' +
          'completar el correo en Filiación.</p></div>');
      }

      c.insertAdjacentHTML('beforeend',
        '<div class="alerta info"><b>Qué viaja y qué no</b>' +
        '<p>Este resumen es <b>conceptual</b>: lleva el diagnóstico explicado, cómo viene la ' +
        'evolución, la medicación y las pautas de alarma. <b>No</b> lleva el examen físico, ' +
        'los diagnósticos diferenciales, las notas internas ni el razonamiento clínico. ' +
        'El correo electrónico no es un canal que controlemos: lo que se manda se queda ' +
        'copiado en servidores ajenos y se puede reenviar solo.</p></div>');

      /* --- lo que se puede tocar antes de enviar --------------------- */
      campo(c, 'Cómo empieza la carta', r, 'saludo', {area:true, filas:2});
      campo(c, 'Comentario suyo sobre este control', r, 'comentario',
        {area:true, filas:4,
         ayuda:'Se copió lo que escribió en el último control. Reescribalo pensando en que ' +
               'lo va a leer el paciente, no un colega.'});
      campo(c, 'Cómo termina', r, 'cierre', {area:true, filas:2});

      /* --- vista previa ---------------------------------------------- */
      const previa = document.createElement('div');
      previa.className = 'bloque';
      previa.style.background = 'var(--ventana)';
      c.appendChild(previa);

      const pintarPrevia = () => {
        previa.innerHTML = '<h3>Vista previa — esto es exactamente lo que va a recibir</h3>' +
          '<div style="border:1px solid var(--linea);border-radius:10px;padding:16px;' +
          'font-size:13.5px;line-height:1.6">' + resumenHTML(r, true) + '</div>';
      };
      pintarPrevia();

      c.appendChild(superficie('Actualizar la vista previa',
        'Después de editar los textos de arriba', pintarPrevia, 'fina suave'));

      c.insertAdjacentHTML('beforeend', '<div style="height:12px"></div>');

      /* --- enviar e imprimir ------------------------------------------ */
      if (p.email && envioConfigurado()) {
        c.appendChild(superficie('Enviar por correo a ' + p.email,
          'Se envía tal como se ve arriba', () => {
            confirmar('Enviar el resumen a ' + nombreCompleto(p),
              'Se va a enviar a ' + p.email + '. Revisá que la dirección sea correcta: ' +
              'un resumen clínico que llega a la casilla equivocada no se puede retirar.',
              () => enviarResumen(p, r), 'Sí, enviar');
          }, 'acento'));
      } else if (p.email && !envioConfigurado()) {
        c.insertAdjacentHTML('beforeend',
          '<div class="alerta medio"><b>El envío de correo no está configurado</b>' +
          '<p>Podés imprimirlo o guardarlo como PDF y mandarlo por el medio que prefieras. ' +
          'Para activar el envío automático, ver el paso 6 de PUBLICAR.md.</p></div>');
      }

      c.appendChild(superficie('Imprimir o guardar como PDF',
        'Para entregárselo en mano o mandarlo por otro medio', () => {
          imprimirResumen(r);
        }, 'suave'));

      if ((p.resumenesEnviados || []).length) {
        c.insertAdjacentHTML('beforeend',
          '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
          'color:var(--tinta-3);margin:20px 0 8px">Resúmenes ya enviados</h3>' +
          p.resumenesEnviados.map(x =>
            dato(fechaCorta(x.fecha), esc(x.para) + (x.ok ? ' ' + marca('enviado', 'verde')
                                                          : ' ' + marca('falló', 'rojo')))).join(''));
      }
    }});
}

function enviarResumen(p, r) {
  const html = resumenHTML(r, false);
  mandar({
    para: p.email,
    asunto: MARCA.nombre + ' — resumen de su tratamiento',
    html,
    tipo: 'resumen-paciente'
  }).then(ok => {
    p.resumenesEnviados = p.resumenesEnviados || [];
    p.resumenesEnviados.push({fecha:ahora(), para:p.email, ok});
    p.modificado = ahora();
    guardar('pacientes', p.id, p);
    avisar(ok ? 'Resumen enviado a ' + p.email
              : 'No se pudo enviar. Probá imprimirlo y mandarlo por otro medio.',
           ok ? 'ok' : 'error');
    refrescar();
  });
}

/* -------------------------------------------------------------------------
   El documento. `enPantalla` cambia solo los colores, para que se lea bien
   dentro de la aplicacion; el que se manda por correo va con estilos
   fijos, porque los clientes de correo no entienden variables de CSS.
   ------------------------------------------------------------------------- */
function resumenHTML(r, enPantalla) {
  const p = r.p;
  const col = enPantalla
    ? {t:'inherit', s:'var(--tinta-3)', a:'var(--acento)', l:'var(--linea)', f:'transparent'}
    : {t:'#141821', s:'#828b9c', a:'#2d6a72', l:'#dde1e9', f:'#f7f8fa'};

  const H = [];
  const est = 'font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
              'max-width:640px;margin:0 auto;color:' + col.t + ';line-height:1.6;font-size:15px';

  H.push('<div style="' + est + '">');

  /* encabezado */
  H.push('<div style="border-bottom:2px solid ' + col.a + ';padding-bottom:10px;margin-bottom:20px">' +
    '<div style="font-size:20px;font-weight:700;letter-spacing:.07em">' + esc(MARCA.nombre) + '</div>' +
    (MARCA.firma ? '<div style="color:' + col.a + ';font-size:13px">' + esc(MARCA.firma) + '</div>' : '') +
    '<div style="color:' + col.s + ';font-size:12px">' + esc(MARCA.bajada) + '</div></div>');

  H.push('<p style="margin:0 0 4px"><b>' + esc(nombreCompleto(p)) + '</b></p>');
  H.push('<p style="margin:0 0 18px;color:' + col.s + ';font-size:13px">Resumen al ' +
    esc(fechaCorta(hoy())) + '</p>');

  H.push('<p>' + esc(r.saludo) + '</p>');

  /* qué tiene */
  if (p.diagnostico.sindrome) {
    H.push(seccion('Qué es lo que tiene', col));
    H.push('<p><b>' + esc(p.diagnostico.sindrome) + '.</b>' +
      (r.explicacion ? ' ' + esc(r.explicacion) : '') + '</p>');
  }

  /* cómo viene */
  H.push(seccion('Cómo viene el tratamiento', col));
  H.push('<p>' + esc(r.comoViene) + '</p>');

  if (r.objetivos.length) {
    H.push('<p style="margin-top:12px"><b>Los objetivos que nos pusimos:</b></p>');
    H.push('<ul style="margin:6px 0 0;padding-left:20px">');
    for (const o of r.objetivos) {
      H.push('<li style="margin-bottom:4px">' + esc(o.t) +
        (o.logrado ? ' <b style="color:#2f9e5f">— logrado</b>'
                   : ' <span style="color:' + col.s + '">— en eso estamos</span>') + '</li>');
    }
    H.push('</ul>');
  }

  if (r.comentario) {
    H.push('<div style="background:' + col.f + ';border-left:3px solid ' + col.a + ';' +
      'padding:12px 14px;border-radius:8px;margin:16px 0">' +
      esc(r.comentario).replace(/\n/g, '<br>') + '</div>');
  }

  /* medicación */
  if (r.meds.length) {
    H.push(seccion('Lo que está tomando ahora', col));
    H.push('<table style="width:100%;border-collapse:collapse;font-size:14px">');
    for (const m of r.meds) {
      H.push('<tr><td style="padding:7px 0;border-bottom:1px solid ' + col.l + ';vertical-align:top">' +
        '<b>' + esc(m.nombre) + '</b>' +
        (m.pauta ? '<br><span style="color:' + col.s + '">' + esc(m.pauta) + '</span>' : '') +
        (m.para ? '<br><span style="color:' + col.s + ';font-size:13px">— ' + esc(m.para) + '</span>' : '') +
        '</td></tr>');
    }
    H.push('</table>');
    H.push('<p style="font-size:13px;color:' + col.s + ';margin-top:10px">' +
      'No cambie ni suspenda nada por su cuenta, aunque se sienta mejor. ' +
      'Varios de estos medicamentos necesitan bajarse de a poco.</p>');
  }

  /* qué sigue */
  H.push(seccion('Qué sigue', col));
  const sigue = [];
  if (p.proximoControl) sigue.push('Próximo control: <b>' + esc(fechaCorta(p.proximoControl)) + '</b>.');
  if ((p.plan.estudios || []).length)
    sigue.push('Estudios pendientes: ' + esc(p.plan.estudios.join(', ')) + '.');
  if ((p.plan.noFarmacologico || []).length)
    sigue.push('Además de la medicación: ' + esc(p.plan.noFarmacologico.join('; ')) + '.');
  if ((p.plan.derivaciones || []).length)
    sigue.push('Interconsultas: ' + esc(p.plan.derivaciones.join(', ')) + '.');
  H.push(sigue.length
    ? '<ul style="margin:0;padding-left:20px">' +
      sigue.map(x => '<li style="margin-bottom:5px">' + x + '</li>').join('') + '</ul>'
    : '<p>Seguimos con el plan acordado.</p>');

  /* alarmas */
  H.push(seccion('Cuándo consultar sin esperar el turno', col));
  H.push('<ul style="margin:0;padding-left:20px">');
  for (const x of r.alarmas) H.push('<li style="margin-bottom:5px">' + esc(x) + '</li>');
  H.push('</ul>');

  H.push('<p style="margin-top:20px">' + esc(r.cierre) + '</p>');

  /* firma y pie */
  H.push('<div style="margin-top:26px;padding-top:14px;border-top:1px solid ' + col.l + '">');
  H.push('<p style="margin:0"><b>' + esc(MARCA.titular) + '</b><br>' +
    '<span style="color:' + col.s + ';font-size:13px">' + esc(MARCA.matricula) + ' · ' +
    esc(MARCA.especialidad) + '</span></p>');
  const contacto = [MARCA.telefono, MARCA.email, MARCA.direccion].filter(Boolean).join(' · ');
  if (contacto) H.push('<p style="margin:6px 0 0;color:' + col.s + ';font-size:13px">' +
    esc(contacto) + '</p>');
  H.push('</div>');

  H.push('<p style="margin-top:18px;color:' + col.s + ';font-size:11.5px;line-height:1.5">' +
    esc(LEGAL_PIE) + '</p>');
  H.push('<p style="color:' + col.s + ';font-size:11.5px;line-height:1.5">' +
    'Este resumen es un complemento de la consulta y no la reemplaza. Su historia clínica ' +
    'completa está en el consultorio y usted puede pedir una copia cuando quiera ' +
    '(Ley 26.529, art. 14).</p>');

  H.push('</div>');
  return H.join('');
}

function seccion(titulo, col) {
  return '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;' +
    'color:' + col.a + ';margin:22px 0 8px;font-weight:700">' + esc(titulo) + '</h3>';
}

function imprimirResumen(r) {
  const v = window.open('', '_blank');
  if (!v) return avisar('El navegador bloqueó la ventana de impresión.', 'error');
  v.document.write('<!DOCTYPE html><html lang="es-AR"><head><meta charset="utf-8">' +
    '<title>Resumen — ' + esc(nombreCompleto(r.p)) + '</title>' +
    '<style>body{margin:1.6cm auto;max-width:19cm}@media print{body{margin:0}}</style>' +
    '</head><body>' + resumenHTML(r, false) + '</body></html>');
  v.document.close();
  setTimeout(() => v.print(), 350);
}
