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
  let comoViene, cambio = null;
  if (basal != null && actual != null) {
    cambio = mejoraPct(basal, actual, false);
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
      para: f ? paraQueSirve(m.farmaco) : '',
      /* El grupo se lleva hasta el resumen solo para pintarle una franja de
         color a cada medicamento. Un opioide y un antiinflamatorio no son la
         misma cosa, y en una lista de siete renglones todos iguales eso no se
         ve. */
      grupo: f ? (f.grupo || '') : ''
    };
  });

  return {
    p, a, ef, comoViene, basal, actual, cambio, objetivos, logrados, explicacion, meds,
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

      /* La vista previa NO lleva marco ni relleno propios: el documento ya
         trae los suyos, y encimarlos hacia que en pantalla se viera un
         recuadro dentro de otro recuadro que en el correo no existe. */
      const pintarPrevia = () => {
        previa.innerHTML = '<h3>Vista previa — esto es exactamente lo que va a recibir</h3>' +
          '<div style="margin-top:10px">' + resumenHTML(r, true) + '</div>';
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
/* =========================================================================
   EL DOCUMENTO
   -------------------------------------------------------------------------
   El mismo HTML sirve para las tres salidas: la vista previa dentro de la
   aplicacion, el correo y el PDF. Que sea uno solo no es comodidad: es la
   unica manera de que la vista previa sea de verdad lo que el paciente va a
   recibir, y no una aproximacion que un dia se despega del original.

   POR QUE ESTA ARMADO CON TABLAS Y ESTILOS ESCRITOS EN CADA ETIQUETA
   Porque tiene que verse igual en Gmail, en Outlook y en el Mail del
   telefono, y esos programas no entienden hojas de estilo, ni flexbox, ni
   grillas, ni variables de CSS. Todo lo que aca parece anticuado esta asi
   para que llegue entero a donde se lee.

   QUE CAMBIO RESPECTO DE LA VERSION ANTERIOR
   Era una carta: titulos, parrafos y una lista. Se leia como un informe y el
   paciente se perdia. Ahora la informacion esta en TARJETAS, cada seccion
   tiene su numero, y lo que se mira de un vistazo esta dibujado y no
   escrito: la evolucion del dolor es una barra con las dos cifras enfrentadas,
   los objetivos llevan tilde o circulo, cada medicamento tiene su franja de
   color y para que sirve, y las pautas de alarma estan en un recuadro rojo
   que no se puede pasar por alto. Un paciente con dolor cronico y mala noche
   no lee tres carillas seguidas: mira, encuentra y despues lee.
   ========================================================================= */

function resumenHTML(r, enPantalla) {
  const p = r.p;

  /* En pantalla se usan las variables del tema, para que el resumen se vea
     bien tambien de noche. En el correo y en el papel van los colores
     escritos: alla no hay variables que valgan. */
  const C = enPantalla ? {
    tinta:'var(--tinta)', suave:'var(--tinta-2)', tenue:'var(--tinta-3)',
    acento:'var(--acento)', acentoTinta:'var(--acento-tinta)', acentoClaro:'var(--acento-claro)',
    linea:'var(--linea)', papel:'var(--ventana)', fondo:'transparent', hueco:'var(--linea)'
  } : {
    tinta:'#141821', suave:'#4a5364', tenue:'#828b9c',
    acento:'#2d6a72', acentoTinta:'#1d4a50', acentoClaro:'#e3f0f1',
    linea:'#dde1e9', papel:'#ffffff', fondo:'#eef1f5', hueco:'#e4e8ef'
  };
  const VERDE = '#2f9e5f', LIMA = '#8cc63f', AMBAR = '#f2b705',
        NARANJA = '#f2711c', ROJO = '#d92b2b', VIOLETA = '#7c5cc4';

  const H = [];
  const tipografia = '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif';

  /* ---------------------------------------------------- ladrillos ------ */

  /* Una tarjeta. Con franja de color a la izquierda cuando hay algo que
     distinguir, sin franja cuando no. */
  const tarjeta = (dentro, franja, relleno) =>
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="border-collapse:separate;margin:0 0 12px;width:100%"><tr>' +
    '<td style="background:' + (relleno || C.papel) + ';border:1px solid ' + C.linea + ';' +
    (franja ? 'border-left:4px solid ' + franja + ';' : '') +
    'border-radius:12px;padding:15px 17px">' + dentro + '</td></tr></table>';

  /* Titulo de seccion con su numero. El numero no es decorativo: le dice al
     paciente cuantas cosas hay y en que orden, que es lo primero que se
     pregunta el que abre una hoja escrita por un medico. */
  let nSeccion = 0;
  const seccion = titulo => {
    nSeccion++;
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:collapse;margin:26px 0 10px"><tr>' +
      '<td width="24" height="24" bgcolor="' + C.acento + '" align="center" ' +
      'style="width:24px;height:24px;background:' + C.acento + ';border-radius:12px;' +
      'color:#ffffff;font-family:' + tipografia + ';font-size:12px;font-weight:700;' +
      'line-height:24px;text-align:center">' + nSeccion + '</td>' +
      '<td style="padding-left:10px;font-family:' + tipografia + ';font-size:13px;' +
      'font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:' + C.acentoTinta +
      '">' + esc(titulo) + '</td></tr></table>';
  };

  const insignia = (texto, fondo, tinta) =>
    '<span style="background:' + fondo + ';color:' + (tinta || '#ffffff') + ';' +
    'font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;' +
    'padding:4px 10px;border-radius:20px;white-space:nowrap">' + esc(texto) + '</span>';

  /* La escala del dolor, dibujada. Diez casillas y las primeras N pintadas:
     es la misma escala del 0 al 10 que el paciente ya contesto en la
     consulta, asi que no hay nada que explicarle. */
  const escalaDolor = (valor, color) => {
    if (valor == null) return '';
    const c = [];
    for (let i = 1; i <= 10; i++) {
      const lleno = i <= valor;
      c.push('<td width="10%" height="16" bgcolor="' + (lleno ? color : C.hueco) + '" ' +
        'style="width:10%;height:16px;background:' + (lleno ? color : C.hueco) + ';' +
        'padding:0;font-size:1px;line-height:16px;' +
        (i > 1 ? 'border-left:2px solid ' + C.papel + ';' : '') +
        'border-radius:' + (i === 1 ? '4px 0 0 4px' : i === 10 ? '0 4px 4px 0' : '0') +
        '">&#8203;</td>');
    }
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:collapse;width:100%;margin:4px 0 2px"><tr>' + c.join('') + '</tr></table>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:collapse;width:100%"><tr>' +
      '<td style="font-size:10.5px;color:' + C.tenue + '">0 · sin dolor</td>' +
      '<td align="right" style="font-size:10.5px;color:' + C.tenue + '">' +
      'el peor imaginable · 10</td></tr></table>';
  };

  const colorNRS = n => n == null ? C.tenue
    : n >= 8 ? ROJO : n >= 6 ? NARANJA : n >= 4 ? AMBAR : n >= 2 ? LIMA : VERDE;

  const parrafo = (texto, tam) =>
    '<p style="margin:0 0 10px;font-size:' + (tam || 15) + 'px;line-height:1.6;color:' +
    C.tinta + '">' + texto + '</p>';

  /* ---------------------------------------------------- encabezado ----- */

  H.push('<div style="font-family:' + tipografia + ';max-width:660px;margin:0 auto;' +
    'color:' + C.tinta + ';line-height:1.6;font-size:15px;background:' + C.fondo + ';' +
    'padding:' + (enPantalla ? '0' : '22px') + '">');

  H.push('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="border-collapse:separate;width:100%;margin-bottom:16px"><tr>' +
    '<td style="background:' + C.acento + ';border-radius:14px;padding:20px 22px">' +
    '<div style="font-size:23px;font-weight:700;letter-spacing:.10em;color:#ffffff;' +
    'line-height:1.2">' + esc(MARCA.nombre) + '</div>' +
    (MARCA.firma ? '<div style="font-size:13px;color:#cfe6e8;margin-top:3px">' +
      esc(MARCA.firma) + '</div>' : '') +
    '<div style="font-size:12px;color:#a8ced2;margin-top:2px;letter-spacing:.03em">' +
      esc(MARCA.bajada) + '</div>' +
    '</td></tr></table>');

  /* Quien y cuando. Va en su propia tarjeta y no en un renglon suelto:
     cuando esta hoja se imprime y se archiva junto a otras cinco, lo primero
     que hay que poder leer de lejos es de quien es. */
  H.push(tarjeta(
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="border-collapse:collapse;width:100%"><tr>' +
    '<td style="vertical-align:middle">' +
    '<div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;' +
    'color:' + C.tenue + '">Resumen de tratamiento</div>' +
    '<div style="font-size:19px;font-weight:700;letter-spacing:-.01em;margin-top:2px">' +
    esc(nombreCompleto(p)) + '</div>' +
    (p.dni ? '<div style="font-size:12.5px;color:' + C.tenue + '">Documento ' +
      esc(p.dni) + '</div>' : '') +
    '</td>' +
    '<td align="right" style="vertical-align:middle;white-space:nowrap;padding-left:12px">' +
    '<div style="font-size:11px;color:' + C.tenue + '">Al día</div>' +
    '<div style="font-size:15px;font-weight:600">' + esc(fechaCorta(hoy())) + '</div>' +
    '</td></tr></table>', C.acento));

  H.push(parrafo(esc(r.saludo)));

  /* ---------------------------------------------------- 1. diagnostico - */

  if (p.diagnostico.sindrome) {
    H.push(seccion('Qué es lo que tiene'));
    const nombreMec = {neuropatico:'dolor neuropático', nociplastico:'dolor nociplástico',
                       nociceptivo:'dolor nociceptivo', mixto:'dolor mixto'};
    const colorMec = {neuropatico:VIOLETA, nociplastico:AMBAR, nociceptivo:LIMA, mixto:C.acento};
    const mec = p.diagnostico.mecanismo || r.a.fenotipo.predominante;
    H.push(tarjeta(
      '<div style="font-size:19px;font-weight:700;letter-spacing:-.01em;line-height:1.3">' +
      esc(p.diagnostico.sindrome) + '</div>' +
      (nombreMec[mec] ? '<div style="margin:9px 0 4px">' +
        insignia(nombreMec[mec], colorMec[mec] || C.acento,
                 (mec === 'nociplastico' || mec === 'nociceptivo') ? '#243d05' : '#ffffff') +
        '</div>' : '') +
      (r.explicacion ? '<p style="margin:10px 0 0;font-size:14.5px;line-height:1.6;color:' +
        C.suave + '">' + esc(r.explicacion) + '</p>' : ''),
      colorMec[mec] || C.acento));
  }

  /* ---------------------------------------------------- 2. evolucion --- */

  H.push(seccion('Cómo viene el tratamiento'));

  if (r.basal != null && r.actual != null) {
    const mejoro = r.cambio >= 0;
    const colorCambio = r.cambio >= 50 ? VERDE : r.cambio >= 30 ? LIMA
                      : r.cambio >= 15 ? AMBAR : r.cambio >= 0 ? NARANJA : ROJO;
    H.push(tarjeta(
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:collapse;width:100%;margin-bottom:12px"><tr>' +

      '<td width="33%" style="width:33%;vertical-align:top">' +
      '<div style="font-size:10.5px;font-weight:700;letter-spacing:.07em;' +
      'text-transform:uppercase;color:' + C.tenue + '">Al empezar</div>' +
      '<div style="font-size:34px;font-weight:700;letter-spacing:-.03em;line-height:1.1;' +
      'color:' + colorNRS(r.basal) + '">' + r.basal +
      '<span style="font-size:15px;color:' + C.tenue + ';font-weight:600">/10</span></div>' +
      '</td>' +

      '<td width="33%" align="center" style="width:33%;vertical-align:middle;' +
      'font-size:22px;color:' + C.tenue + '">&#8594;</td>' +

      '<td width="34%" align="right" style="width:34%;vertical-align:top">' +
      '<div style="font-size:10.5px;font-weight:700;letter-spacing:.07em;' +
      'text-transform:uppercase;color:' + C.tenue + '">Hoy</div>' +
      '<div style="font-size:34px;font-weight:700;letter-spacing:-.03em;line-height:1.1;' +
      'color:' + colorNRS(r.actual) + '">' + r.actual +
      '<span style="font-size:15px;color:' + C.tenue + ';font-weight:600">/10</span></div>' +
      '</td></tr></table>' +

      escalaDolor(r.actual, colorNRS(r.actual)) +

      '<div style="margin:14px 0 0">' +
      insignia(mejoro ? 'Bajó un ' + r.cambio + '%' : 'Subió un ' + Math.abs(r.cambio) + '%',
               colorCambio, (colorCambio === LIMA || colorCambio === AMBAR) ? '#243d05' : '#ffffff') +
      '</div>' +
      '<p style="margin:11px 0 0;font-size:14.5px;line-height:1.6;color:' + C.suave + '">' +
      esc(r.comoViene) + '</p>',
      colorCambio));
  } else {
    H.push(tarjeta('<p style="margin:0;font-size:14.5px;line-height:1.6;color:' + C.suave +
      '">' + esc(r.comoViene) + '</p>', C.tenue));
  }

  /* Los objetivos, con tilde o circulo. Es lo que el paciente dijo que
     queria volver a hacer, y por eso va antes que la medicacion: el
     tratamiento se mide contra esto, no contra la receta. */
  if (r.objetivos.length) {
    const filas = r.objetivos.map(o =>
      '<tr><td width="26" style="width:26px;vertical-align:top;padding:7px 0;' +
      'font-size:16px;line-height:1.3;color:' + (o.logrado ? VERDE : C.tenue) + '">' +
      (o.logrado ? '&#10003;' : '&#9675;') + '</td>' +
      '<td style="padding:7px 0;border-bottom:1px solid ' + C.linea + ';font-size:14.5px;' +
      'line-height:1.5">' + esc(o.t) +
      '<div style="font-size:12px;color:' + (o.logrado ? VERDE : C.tenue) + ';font-weight:600;' +
      'margin-top:1px">' + (o.logrado ? 'Logrado' : 'En eso estamos') + '</div>' +
      '</td></tr>').join('');
    H.push(tarjeta(
      '<div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;' +
      'color:' + C.tenue + ';margin-bottom:4px">Los objetivos que nos pusimos</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:collapse;width:100%">' + filas + '</table>' +
      '<div style="font-size:12px;color:' + C.tenue + ';margin-top:9px">' +
      r.logrados.length + ' de ' + r.objetivos.length + ' cumplidos.</div>'));
  }

  /* El comentario del medico, como una cita. */
  if (r.comentario) {
    H.push('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:separate;width:100%;margin:0 0 12px"><tr>' +
      '<td style="background:' + C.acentoClaro + ';border-left:4px solid ' + C.acento + ';' +
      'border-radius:0 12px 12px 0;padding:15px 17px">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;' +
      'color:' + C.acentoTinta + ';margin-bottom:5px">Sobre este control</div>' +
      '<div style="font-size:14.5px;line-height:1.6;color:' + C.tinta + '">' +
      esc(r.comentario).replace(/\n/g, '<br>') + '</div>' +
      '</td></tr></table>');
  }

  /* ---------------------------------------------------- 3. medicacion -- */

  if (r.meds.length) {
    H.push(seccion('Lo que está tomando ahora'));
    for (const m of r.meds) {
      /* Comparacion exacta y no "contiene opioide": el grupo del ibuprofeno
         se llama literalmente "No opioide", y con una busqueda por substring
         los antiinflamatorios salian pintados como analgesicos fuertes. */
      const fuerte = normalizar(m.grupo || '').trim() === 'opioide';
      const color = fuerte ? NARANJA : C.acento;
      H.push(tarjeta(
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
        'style="border-collapse:collapse;width:100%"><tr>' +
        '<td style="vertical-align:top">' +
        '<div style="font-size:16px;font-weight:700;letter-spacing:-.01em">' +
        esc(m.nombre) + '</div>' +
        (m.para ? '<div style="font-size:13.5px;color:' + C.suave + ';margin-top:2px">' +
          esc(m.para.charAt(0).toUpperCase() + m.para.slice(1)) + '</div>' : '') +
        '</td>' +
        (m.pauta ? '<td align="right" style="vertical-align:top;padding-left:12px;' +
          'white-space:nowrap"><span style="display:inline-block;background:' + C.acentoClaro +
          ';color:' + C.acentoTinta + ';font-size:13px;font-weight:600;padding:5px 11px;' +
          'border-radius:8px">' + esc(m.pauta) + '</span></td>' : '') +
        '</tr></table>', color));
    }
    H.push('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:separate;width:100%;margin:0 0 12px"><tr>' +
      '<td style="background:' + C.acentoClaro + ';border-radius:12px;padding:13px 16px;' +
      'font-size:13.5px;line-height:1.55;color:' + C.acentoTinta + '">' +
      '<b>No cambie ni suspenda nada por su cuenta</b>, aunque se sienta mejor. Varios de ' +
      'estos medicamentos necesitan bajarse de a poco.</td></tr></table>');
  }

  /* ---------------------------------------------------- 4. que sigue --- */

  H.push(seccion('Qué sigue'));

  if (p.proximoControl) {
    H.push(tarjeta(
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:collapse;width:100%"><tr>' +
      '<td width="52" style="width:52px;vertical-align:middle">' +
      '<div style="background:' + C.acento + ';border-radius:10px;padding:8px 0;' +
      'text-align:center;color:#ffffff">' +
      '<div style="font-size:19px;font-weight:700;line-height:1.1">' +
      esc(fechaCorta(p.proximoControl).slice(0, 2)) + '</div>' +
      '<div style="font-size:10px;letter-spacing:.06em">' +
      esc(fechaCorta(p.proximoControl).slice(3, 5)) + '</div></div></td>' +
      '<td style="padding-left:13px;vertical-align:middle">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:.07em;' +
      'text-transform:uppercase;color:' + C.tenue + '">Próximo control</div>' +
      '<div style="font-size:15.5px;font-weight:600">' +
      esc(fechaLarga(p.proximoControl)) + '</div></td>' +
      '</tr></table>', C.acento));
  }

  const sigue = [];
  if ((p.plan.estudios || []).length)
    sigue.push(['Estudios pendientes', p.plan.estudios.join(', ')]);
  if ((p.plan.noFarmacologico || []).length)
    sigue.push(['Además de la medicación', p.plan.noFarmacologico.join('; ')]);
  if ((p.plan.derivaciones || []).length)
    sigue.push(['Interconsultas', p.plan.derivaciones.join(', ')]);

  if (sigue.length) {
    H.push(tarjeta(sigue.map(([rotulo, texto], i) =>
      '<div style="' + (i ? 'margin-top:12px;padding-top:12px;border-top:1px solid ' +
        C.linea + ';' : '') + '">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;' +
      'color:' + C.tenue + '">' + esc(rotulo) + '</div>' +
      '<div style="font-size:14.5px;line-height:1.55;margin-top:2px">' + esc(texto) + '</div>' +
      '</div>').join('')));
  } else if (!p.proximoControl) {
    H.push(tarjeta('<p style="margin:0;font-size:14.5px;color:' + C.suave +
      '">Seguimos con el plan acordado.</p>'));
  }

  /* ---------------------------------------------------- 5. alarmas ----- */

  H.push(seccion('Cuándo consultar sin esperar el turno'));

  H.push('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="border-collapse:separate;width:100%;margin:0 0 12px"><tr>' +
    '<td style="background:' + (enPantalla ? 'rgba(217,43,43,.06)' : '#fdf1f1') + ';' +
    'border:1px solid ' + (enPantalla ? 'rgba(217,43,43,.28)' : '#f3d2d2') + ';' +
    'border-left:4px solid ' + ROJO + ';border-radius:12px;padding:15px 17px">' +
    '<div style="font-size:13px;font-weight:700;color:' + ROJO + ';letter-spacing:.03em;' +
    'margin-bottom:9px">Si aparece cualquiera de estas cosas, no espere</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="border-collapse:collapse;width:100%">' +
    r.alarmas.map(x =>
      '<tr><td width="18" style="width:18px;vertical-align:top;padding:5px 0;color:' + ROJO +
      ';font-size:15px;line-height:1.5">&#8226;</td>' +
      '<td style="padding:5px 0;font-size:14.5px;line-height:1.55;color:' + C.tinta + '">' +
      esc(x) + '</td></tr>').join('') +
    '</table></td></tr></table>');

  H.push(parrafo(esc(r.cierre)));

  /* ---------------------------------------------------- firma ---------- */

  /* Se descartan los guiones sueltos: en la marca, un dato que todavia no se
     cargo esta escrito como "-" o "—", y en el pie de una carta al paciente
     eso quedaba como "- · correo@..." , que parece un error de impresion. */
  const contacto = [MARCA.telefono, MARCA.email, MARCA.direccion]
    .filter(x => x && !/^[-—–\s]*$/.test(String(x))).join(' · ');
  H.push(tarjeta(
    '<div style="font-size:15.5px;font-weight:700">' + esc(MARCA.titular) + '</div>' +
    '<div style="font-size:13px;color:' + C.tenue + ';margin-top:1px">' +
    esc(MARCA.matricula) + ' · ' + esc(MARCA.especialidad) + '</div>' +
    (contacto ? '<div style="font-size:13px;color:' + C.suave + ';margin-top:7px;' +
      'padding-top:7px;border-top:1px solid ' + C.linea + '">' + esc(contacto) + '</div>' : ''),
    C.acento));

  H.push('<p style="margin:14px 0 0;color:' + C.tenue + ';font-size:11.5px;line-height:1.5">' +
    esc(LEGAL_PIE) + '</p>');
  H.push('<p style="margin:8px 0 0;color:' + C.tenue + ';font-size:11.5px;line-height:1.5">' +
    'Este resumen es un complemento de la consulta y no la reemplaza. Su historia clínica ' +
    'completa está en el consultorio y usted puede pedir una copia cuando quiera ' +
    '(Ley 26.529, art. 14).</p>');

  H.push('</div>');
  return H.join('');
}

/* Imprimir o guardar como PDF. La hoja lleva sus propias reglas de
   impresion: los colores de fondo no se imprimen si no se piden a mano
   (print-color-adjust), y sin eso todo el diseño sale en blanco y negro y no
   se entiende nada. */
function imprimirResumen(r) {
  const v = window.open('', '_blank');
  if (!v) return avisar('El navegador bloqueó la ventana de impresión.', 'error');
  v.document.write('<!DOCTYPE html><html lang="es-AR"><head><meta charset="utf-8">' +
    '<title>Resumen — ' + esc(nombreCompleto(r.p)) + '</title><style>' +
    '@page{size:A4;margin:1.1cm}' +
    'html,body{margin:0;padding:0;background:#eef1f5;' +
    '-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    'table{page-break-inside:avoid;break-inside:avoid}' +
    '@media print{body{background:#fff}}' +
    '</style></head><body>' + resumenHTML(r, false) + '</body></html>');
  v.document.close();
  setTimeout(() => v.print(), 380);
}
