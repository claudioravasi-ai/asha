/* =========================================================================
   EFECTIVIDAD DEL TRATAMIENTO
   -------------------------------------------------------------------------
   El indicador de color y porcentaje que acompaña a cada paciente y a cada
   tratamiento.

   POR QUE NO ES SOLO EL DOLOR
   Medir el exito de un tratamiento de dolor cronico unicamente por la baja
   de la escala numerica es el error clasico, y produce dos distorsiones
   opuestas: pacientes que bajaron dos puntos y volvieron a trabajar figuran
   como fracaso, y pacientes sedados con opioides que declaran menos dolor
   pero no salen de la cama figuran como exito.

   Por eso la efectividad se compone de cuatro cosas, con el peso que las
   recomendaciones IMMPACT le dan a cada dominio nucleo:

     40%  ALIVIO DEL DOLOR      caida porcentual del NRS respecto del basal
     30%  FUNCION               interferencia (BPI) o indice especifico
     20%  IMPRESION DEL PACIENTE  PGIC
     10%  CARGA FARMACOLOGICA   variacion del MME diario y del numero de farmacos
     -    EFECTOS ADVERSOS      penalizan hasta 15 puntos

   Los umbrales de color salen de la literatura, no de una preferencia
   estetica: 30% de alivio es el minimo clinicamente relevante y 50% es la
   respuesta sustancial (IMMPACT, Dworkin 2008).
   ========================================================================= */
'use strict';

const PESOS_EFECTIVIDAD = {dolor:0.40, funcion:0.30, pgic:0.20, medicacion:0.10};

const BANDAS_EFECTIVIDAD = [
  {hasta:-1,  clave:'empeoro',  etiqueta:'Empeoró',              color:'#d92b2b', texto:'#fff',
   accion:'Revisar el diagnóstico antes de cambiar el tratamiento. Un empeoramiento sostenido ' +
          'suele significar que el mecanismo del dolor no es el que se supuso.'},
  {hasta:14,  clave:'nula',     etiqueta:'Sin respuesta',        color:'#f2711c', texto:'#fff',
   accion:'Por debajo del 15% no hay cambio perceptible para el paciente. Suspender lo que no ' +
          'funciona antes de agregar algo nuevo.'},
  {hasta:29,  clave:'minima',   etiqueta:'Respuesta mínima',     color:'#f2b705', texto:'#3a2c00',
   accion:'Cambio perceptible pero por debajo del umbral clínicamente relevante. Optimizar dosis ' +
          'antes de rotar: buena parte de los fracasos son por dosis insuficiente o tiempo insuficiente.'},
  {hasta:49,  clave:'relevante',etiqueta:'Respuesta relevante',  color:'#8cc63f', texto:'#243d05',
   accion:'Alivio clínicamente relevante (≥30%). Sostener y consolidar la ganancia funcional.'},
  {hasta:100, clave:'sustancial',etiqueta:'Respuesta sustancial',color:'#2f9e5f', texto:'#fff',
   accion:'Respuesta sustancial (≥50%). Consolidar, espaciar controles y planificar el descenso ' +
          'de lo que ya no haga falta.'}
];

function bandaEfectividad(pct) {
  for (const b of BANDAS_EFECTIVIDAD) if (pct <= b.hasta) return b;
  return BANDAS_EFECTIVIDAD[BANDAS_EFECTIVIDAD.length - 1];
}

/* -------------------------------------------------------------------------
   Cambio porcentual entre dos valores, en la direccion "mejor".
   Devuelve null cuando falta alguno de los dos: es importante distinguir
   "no mejoro" de "no lo sabemos".
   ------------------------------------------------------------------------- */
function mejoraPct(basal, actual, mayorEsMejor) {
  if (basal == null || actual == null) return null;
  basal = Number(basal); actual = Number(actual);
  if (mayorEsMejor) {
    const techo = 100;
    if (techo === basal) return actual >= basal ? 0 : -100;
    return Math.round(((actual - basal) / (techo - basal)) * 100);
  }
  if (basal === 0) return actual === 0 ? 0 : -100;
  return Math.round(((basal - actual) / basal) * 100);
}

/* =========================================================================
   EFECTIVIDAD GLOBAL DEL PACIENTE
   ========================================================================= */

function efectividadPaciente(p) {
  const r = {
    porcentaje: null, banda: null, componentes: {}, faltan: [],
    confianza: 'baja', serie: [], resumen: ''
  };

  const evos = (p.evoluciones || []).slice().sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));

  /* --- 1. dolor ------------------------------------------------------- */
  const nrsBasal  = primerNRS(p);
  const nrsActual = ultimoNRS(p);
  const dolor = mejoraPct(nrsBasal, nrsActual, false);
  if (dolor == null) r.faltan.push('intensidad basal o actual del dolor');
  else r.componentes.dolor = {
    valor:dolor, basal:nrsBasal, actual:nrsActual, peso:PESOS_EFECTIVIDAD.dolor,
    etiqueta:'Alivio del dolor',
    detalle:'NRS ' + nrsBasal + ' → ' + nrsActual
  };

  /* --- 2. función ----------------------------------------------------- */
  let funcion = null, detalleFuncion = '';
  const indice = ['odi', 'ndi', 'bpi'].find(id => historialEscala(p, id).length >= 2);
  if (indice) {
    const h = historialEscala(p, indice);
    funcion = mejoraPct(h[0].total, h[h.length - 1].total, false);
    detalleFuncion = ESCALAS[indice].sigla + ' ' + h[0].total + ' → ' + h[h.length - 1].total;
  }
  if (funcion == null) r.faltan.push('un índice funcional medido al menos dos veces (BPI, Oswestry o NDI)');
  else r.componentes.funcion = {valor:funcion, peso:PESOS_EFECTIVIDAD.funcion,
    etiqueta:'Función', detalle:detalleFuncion};

  /* --- 3. impresión del paciente -------------------------------------- */
  const pgic = ultimaEscala(p, 'pgic');
  if (pgic == null) r.faltan.push('la impresión global de cambio del paciente (PGIC)');
  else {
    /* 4 es "sin cambios" y es el cero de la escala; 7 es el máximo. */
    const v = Math.round(((pgic - 4) / 3) * 100);
    r.componentes.pgic = {valor:v, peso:PESOS_EFECTIVIDAD.pgic, etiqueta:'Impresión del paciente',
      detalle:(ESCALAS.pgic.items[0].op.find(o => o.v === pgic) || {}).t || ('PGIC ' + pgic)};
  }

  /* --- 4. carga farmacológica ----------------------------------------- */
  /* En dolor oncologico la carga opioide NO mide el exito del tratamiento:
     subir la dosis mientras la enfermedad progresa es hacer bien las cosas, y
     penalizarlo convierte una buena analgesia paliativa en un "fracaso" del
     8%. En ese escenario el dominio se omite y el resto se reparte el peso. */
  const oncologico = (p.diagnostico && (p.diagnostico.sindromeId === 'dolor_oncologico' ||
                     /MG30\.1/.test(p.diagnostico.icd || '')));
  const mmeBasal  = (!oncologico && p.mmeBasal != null) ? p.mmeBasal : null;
  const mmeActual = calcularMME((p.medicacion || [])
    .filter(m => FARMACOS[m.farmaco] && FARMACOS[m.farmaco].grupo === 'Opioide')
    .map(m => ({id:m.farmaco, mgDia:mgDiariosDe(m), mcgHora:mcgHoraDe(m)}))).total;
  if (mmeBasal != null) {
    let v = mmeBasal === 0
      ? (mmeActual === 0 ? 0 : -50)          /* empezó sin opioide y ahora tiene: cuenta en contra */
      : mejoraPct(mmeBasal, mmeActual, false);
    /* Triplicar una dosis baja da -200% y arrastra el total a un número que no
       significa nada. El dominio pesa un 10%: que se exprese dentro de su rango. */
    v = Math.max(-100, Math.min(100, v));
    r.componentes.medicacion = {valor:v, peso:PESOS_EFECTIVIDAD.medicacion,
      etiqueta:'Carga opioide', detalle:mmeBasal + ' → ' + mmeActual + ' MME/día'};
  }

  /* --- combinar ------------------------------------------------------- */
  let suma = 0, pesos = 0;
  for (const k of Object.keys(r.componentes)) {
    const comp = r.componentes[k];
    suma  += Math.max(-100, Math.min(100, comp.valor)) * comp.peso;
    pesos += comp.peso;
  }
  if (!pesos) {
    r.resumen = 'Todavía no hay datos suficientes para medir la efectividad. ' +
                'Hace falta al menos una intensidad basal y una de control.';
    return r;
  }

  let pct = Math.round(suma / pesos);

  /* --- penalización por efectos adversos ------------------------------- */
  const adversos = (p.evoluciones || []).flatMap(e => e.adversos || []);
  const graves = adversos.filter(a => a && a.grave).length;
  const leves  = adversos.length - graves;
  const castigo = Math.min(15, graves * 8 + leves * 2);
  if (castigo) {
    r.componentes.adversos = {valor:-castigo, peso:0, etiqueta:'Efectos adversos',
      detalle:adversos.length + ' registrado' + (adversos.length === 1 ? '' : 's') +
              (graves ? ', ' + graves + ' grave' + (graves === 1 ? '' : 's') : '')};
    pct -= castigo;
  }

  r.porcentaje = Math.max(-100, Math.min(100, pct));
  r.banda = bandaEfectividad(r.porcentaje);

  /* --- confianza del número -------------------------------------------- */
  const dominios = Object.keys(r.componentes).filter(k => k !== 'adversos').length;
  r.confianza = dominios >= 3 ? 'alta' : dominios === 2 ? 'media' : 'baja';

  /* --- serie temporal para el gráfico ---------------------------------- */
  r.serie = evos.filter(e => e.nrs != null).map(e => ({fecha:e.fecha, nrs:e.nrs}));
  if (nrsBasal != null) {
    const inicio = p.dolor && p.dolor.fechaHistoria || p.creado;
    r.serie.unshift({fecha:(inicio || '').slice(0, 10), nrs:nrsBasal, basal:true});
  }

  r.resumen = r.banda.etiqueta + ' — ' + r.porcentaje + '%. ' +
    (r.confianza === 'baja'
      ? 'El número se apoya en un solo dominio: tomarlo como orientativo.'
      : r.confianza === 'media'
        ? 'Basado en dos dominios.'
        : 'Basado en ' + dominios + ' dominios: es una medida sólida.');

  return r;
}

/* =========================================================================
   EFECTIVIDAD DE UN TRATAMIENTO EN PARTICULAR
   -------------------------------------------------------------------------
   Se mide dentro de la ventana en que ese tratamiento estuvo activo, no
   sobre toda la historia. De otro modo un farmaco arrastra el merito o la
   culpa de lo que hizo el anterior.
   ========================================================================= */

function efectividadTratamiento(p, tratamiento) {
  const t = tratamiento;
  const desde = t.inicio || '';
  const hasta = t.fin || '9999';

  const dentro = (p.evoluciones || [])
    .filter(e => e.fecha && e.fecha >= desde && e.fecha <= hasta && e.nrs != null)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const basal = t.nrsInicio != null ? Number(t.nrsInicio)
              : (dentro.length ? dentro[0].nrs : null);
  const actual = dentro.length ? dentro[dentro.length - 1].nrs : null;

  const pct = mejoraPct(basal, actual, false);
  const banda = pct == null ? null : bandaEfectividad(pct);

  /* Tiempo transcurrido: un fármaco evaluado antes de su latencia no es un
     fracaso, es una evaluación prematura, y conviene decirlo. */
  const dias = desde ? Math.floor((Date.now() - new Date(desde + 'T12:00:00').getTime()) / 86400000) : null;
  const f = FARMACOS[t.farmaco];
  let advertencia = '';
  if (f && f.latencia && dias != null && dias < 21 && (pct == null || pct < 30)) {
    advertencia = 'Lleva ' + dias + ' días. ' + f.nombre + ' necesita ' + f.latencia.toLowerCase() +
                  '. Evaluar el fracaso ahora sería prematuro.';
  }
  if (f && f.titulacion && dias != null && dias < 14) {
    advertencia = advertencia || 'Todavía en período de titulación.';
  }

  return {
    porcentaje: pct, banda, basal, actual, dias,
    mediciones: dentro.length, advertencia,
    serie: dentro.map(e => ({fecha:e.fecha, nrs:e.nrs}))
  };
}

/* Historial de una escala a lo largo de las evoluciones, mas el valor
   inicial de la historia clinica. */
function historialEscala(p, id) {
  const salida = [];
  const base = p.escalas && p.escalas[id];
  if (base && base.total != null) salida.push({fecha:base.fecha || (p.creado || '').slice(0, 10), total:base.total});
  for (const e of (p.evoluciones || [])) {
    const v = e.escalas && e.escalas[id];
    if (v != null) salida.push({fecha:e.fecha, total:typeof v === 'object' ? v.total : v});
  }
  return salida.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));
}

/* =========================================================================
   GRAFICO DE EVOLUCION — SVG generado a mano
   -------------------------------------------------------------------------
   Se dibuja directo en SVG y sin ninguna libreria: son cinco lineas de
   matematica y evita cargar 300 KB de dependencia para mostrar seis puntos.
   El color de cada punto sigue el mismo semaforo que el mapa corporal, para
   que el ojo no tenga que aprender dos codigos distintos.
   ========================================================================= */

function graficoEvolucion(serie, ancho, alto) {
  const W = ancho || 480, H = alto || 150;
  const mI = 34, mD = 12, mS = 14, mInf = 26;
  const gw = W - mI - mD, gh = H - mS - mInf;

  if (!serie || serie.length === 0) {
    return '<div class="grafico-vacio">Sin mediciones registradas todavía.</div>';
  }

  const x = i => mI + (serie.length === 1 ? gw / 2 : (i / (serie.length - 1)) * gw);
  const y = v => mS + gh - (Math.max(0, Math.min(10, v)) / 10) * gh;

  let svg = '<svg class="grafico" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
            'aria-label="Evolución de la intensidad del dolor">';

  /* Bandas de fondo: la zona verde es el objetivo, la roja el dolor severo. */
  svg += '<rect x="' + mI + '" y="' + y(10) + '" width="' + gw + '" height="' + (y(7) - y(10)) +
         '" fill="#d92b2b" opacity=".07"/>';
  svg += '<rect x="' + mI + '" y="' + y(7)  + '" width="' + gw + '" height="' + (y(4) - y(7)) +
         '" fill="#f2b705" opacity=".07"/>';
  svg += '<rect x="' + mI + '" y="' + y(4)  + '" width="' + gw + '" height="' + (y(0) - y(4)) +
         '" fill="#2f9e5f" opacity=".07"/>';

  for (const v of [0, 5, 10]) {
    svg += '<line x1="' + mI + '" y1="' + y(v) + '" x2="' + (W - mD) + '" y2="' + y(v) +
           '" stroke="currentColor" opacity=".14"/>';
    svg += '<text x="' + (mI - 7) + '" y="' + (y(v) + 4) + '" text-anchor="end" ' +
           'font-size="10" fill="currentColor" opacity=".55">' + v + '</text>';
  }

  const puntos = serie.map((s, i) => x(i) + ',' + y(s.nrs)).join(' ');
  if (serie.length > 1) {
    svg += '<polyline points="' + puntos + '" fill="none" stroke="currentColor" ' +
           'stroke-width="2" opacity=".45" stroke-linejoin="round"/>';
  }

  serie.forEach((s, i) => {
    const c = colorDolor(s.nrs);
    svg += '<circle cx="' + x(i) + '" cy="' + y(s.nrs) + '" r="' + (s.basal ? 6 : 5) + '" ' +
           'fill="' + c.color + '" stroke="' + c.borde + '" stroke-width="1.5"><title>' +
           esc(fechaCorta(s.fecha)) + ' — NRS ' + s.nrs + (s.basal ? ' (basal)' : '') +
           '</title></circle>';
  });

  /* Solo la primera y la última fecha: con seis etiquetas no se lee nada. */
  svg += '<text x="' + mI + '" y="' + (H - 7) + '" font-size="10" fill="currentColor" opacity=".55">' +
         esc(fechaCorta(serie[0].fecha)) + '</text>';
  if (serie.length > 1) {
    svg += '<text x="' + (W - mD) + '" y="' + (H - 7) + '" text-anchor="end" font-size="10" ' +
           'fill="currentColor" opacity=".55">' + esc(fechaCorta(serie[serie.length - 1].fecha)) + '</text>';
  }

  return svg + '</svg>';
}

/* Anillo de porcentaje: el indicador redondo que se ve en la lista de
   pacientes y en el encabezado de cada historia. */
function anilloEfectividad(pct, tam) {
  const T = tam || 56, r = T / 2 - 5, C = 2 * Math.PI * r;
  if (pct == null) {
    return '<svg class="anillo" viewBox="0 0 ' + T + ' ' + T + '" width="' + T + '" height="' + T + '">' +
           '<circle cx="' + T/2 + '" cy="' + T/2 + '" r="' + r + '" fill="none" ' +
           'stroke="currentColor" stroke-width="4" opacity=".18"/>' +
           '<text x="' + T/2 + '" y="' + (T/2 + 4) + '" text-anchor="middle" font-size="13" ' +
           'fill="currentColor" opacity=".45">—</text></svg>';
  }
  const b = bandaEfectividad(pct);
  const visible = Math.max(0, pct) / 100;
  return '<svg class="anillo" viewBox="0 0 ' + T + ' ' + T + '" width="' + T + '" height="' + T + '">' +
    '<circle cx="' + T/2 + '" cy="' + T/2 + '" r="' + r + '" fill="none" stroke="currentColor" ' +
    'stroke-width="4" opacity=".15"/>' +
    '<circle cx="' + T/2 + '" cy="' + T/2 + '" r="' + r + '" fill="none" stroke="' + b.color + '" ' +
    'stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (C * visible) + ' ' + C + '" ' +
    'transform="rotate(-90 ' + T/2 + ' ' + T/2 + ')"/>' +
    '<text x="' + T/2 + '" y="' + (T/2 + 5) + '" text-anchor="middle" font-size="14" ' +
    'font-weight="600" fill="' + b.color + '">' + pct + '%</text></svg>';
}
