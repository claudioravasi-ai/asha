/* =========================================================================
   MOTOR CLINICO
   -------------------------------------------------------------------------
   Cuatro cosas hace este modulo, y ninguna de ellas es diagnosticar:

   1. FENOTIPO MECANISTICO — clasifica el dolor en nociceptivo, neuropatico,
      nociplastico o mixto, aplicando la gradacion NeuPSIG (posible /
      probable / definido) y los criterios de Kosek 2021 para nociplastico.
      Esta es la decision que mas cambia el tratamiento: un AINE no sirve en
      dolor neuropatico y un opioide empeora el nociplastico.

   2. DIFERENCIAL PONDERADO — recorre el catalogo de sindromes y devuelve los
      que concuerdan, ordenados por porcentaje, mostrando QUE dato sostiene
      cada uno. El medico ve el razonamiento, no solo la conclusion.

   3. BANDERAS ROJAS — dispara las alertas que no pueden esperar.

   4. CONTROL DE SEGURIDAD FARMACOLOGICA — revisa la medicacion cargada
      contra la funcion renal, la edad, las interacciones y la carga opioide
      total. Es la parte mas util en el dia a dia y la que menos se hace.

   Todo lo que sale de aca esta marcado como SUGERENCIA y es editable.
   ========================================================================= */
'use strict';

/* =========================================================================
   1. CONTEXTO — traduce la ficha del paciente a algo que las reglas puedan leer
   ========================================================================= */

/* Palabras que delatan un antecedente en el texto libre. El médico además
   marca las etiquetas a mano; esto es la red de contención para cuando no
   las marcó y lo escribió en la descripción. */
const PISTAS_ANTECEDENTES = {
  diabetes:        /diabet|dbt|insulina|metformina|glicada/i,
  cancer:          /c[aá]ncer|carcinoma|tumor|neoplasia|met[aá]stasis|linfoma|mieloma|oncol/i,
  quimioterapia:   /quimio|oxaliplatino|cisplatino|paclitaxel|docetaxel|vincristina|bortezomib/i,
  herpes:          /herpes|z[oó]ster|culebrilla/i,
  cirugia:         /cirug[ií]a|operad|operaci[oó]n|post ?quir[uú]rgic|intervenid/i,
  cirugia_columna: /(cirug[ií]a|operad|artrodesis|fusi[oó]n|discectom|laminectom).{0,25}(columna|lumbar|cervical|disco|hernia)/i,
  cirugia_torax:   /toracotom|esternotom|lobectom|neumonectom|cirug[ií]a de t[oó]rax/i,
  cirugia_mama:    /mastectom|cuadrantectom|cirug[ií]a de mama|tumorectom[ií]a mamaria/i,
  amputacion:      /amputa|mu[nñ][oó]n|pr[oó]tesis de miembro/i,
  trauma:          /trauma|accidente|golpe|ca[ií]da|fractura|choque/i,
  fractura:        /fractura/i,
  latigazo:        /latigazo|whiplash|colisi[oó]n|accidente de tr[aá]nsito/i,
  artritis:        /artritis reumatoide|ar\b|espondilo|psori[aá]sic|lupus/i,
  osteoporosis:    /osteoporosis|osteopenia/i,
  hipotiroidismo:  /hipotiroid|tiroides|levotiroxina|t4/i,
  depresion:       /depresi[oó]n|antidepresivo|sertralina|fluoxetina|escitalopram|paroxetina/i,
  fibromialgia:    /fibromialgia/i,
  acv:             /acv|acc?idente cerebrovascular|stroke|isquemia cerebral|hemiplej/i,
  lesion_medular:  /lesi[oó]n medular|parapl[eé]jic|tetrapl[eé]jic|secci[oó]n medular/i,
  esclerosis:      /esclerosis m[uú]ltiple|\bEM\b/,   // sin la /i: "em" suelto en
                   // minusculas aparece dentro de demasiadas palabras
  obesidad:        /obesidad|sobrepeso|imc [3-9]\d/i,
  embarazo:        /embaraz|gestaci[oó]n|post ?parto|pu[eé]rper/i,
  inmovilizacion:  /yeso|f[eé]rula|inmoviliz|cabestrillo/i,
  /* Ojo con las siglas cortas: "irc" sin limites de palabra vive dentro de
     "circuito" y disparaba una alerta de insuficiencia renal en un paciente
     con la funcion renal normal. Va con \b y en mayusculas. */
  renal:           /insuficiencia renal|di[aá]lisis|nefropat[ií]a|filtrado glomerular/i,
  renalSigla:      /\bIRC\b/,
  hepatica:        /cirrosis|hepatopat|hepatitis|insuficiencia hep[aá]tica/i,
  cardiopatia:     /infarto|iam|coronari|insuficiencia card[ií]aca|arritmia|fibrilaci[oó]n/i,
  epilepsia:       /epilepsia|convulsi[oó]n|convulsiv/i,
  glaucoma:        /glaucoma/i,
  prostatismo:     /pr[oó]stata|prostatism|hbp|hiperplasia prost/i,
  anticoagulado:   /anticoagul|warfarina|acenocumarol|rivaroxab|apixab|dabigatr|clopidogrel|aspirina|heparina/i
};

function construirContexto(p) {
  const d  = p.dolor || {};
  const an = p.antecedentes || {};
  const lectura = leerMapa(d.mapa || []);
  const raiz = raizDominante(lectura);

  /* Regiones: del identificador de zona se saca la clave simple.
     'f_muslo_der' pasa a 'muslo'. */
  const regiones = new Set();
  for (const z of lectura.zonas) {
    const clave = z.z.id.replace(/^[fd]_/, '')
                        .replace(/_(izq|der|izquierd[ao]|derech[ao])$/, '');
    regiones.add(clave);
  }

  /* Antecedentes: etiquetas marcadas a mano + lo que se detecta en el texto. */
  const textoAnte = [an.enfermedades, an.cirugias, an.familiares, an.habitos,
                     an.medicacionNoDolor, d.mecanismo, d.descripcion, p.notas].join(' ');
  const ante = new Set(an.etiquetas || []);
  for (const [clave, re] of Object.entries(PISTAS_ANTECEDENTES)) {
    /* Algunas claves son variantes de escritura de lo mismo (la sigla y el
       nombre completo). Se normalizan al mismo antecedente. */
    if (re.test(textoAnte)) ante.add(clave.replace(/Sigla$/, ''));
  }

  const escalaTotal = id => {
    const e = p.escalas && p.escalas[id];
    return e && e.total != null ? e.total : null;
  };

  const irradiacion = String(d.irradiacion || '');
  /* "Hasta el glúteo, no pasa la rodilla" decia que el dolor irradiaba a la
     rodilla, que es exactamente lo contrario de lo que escribio el medico.
     Antes de buscar las palabras hay que sacar las frases negadas. */
  const irradiaPierna = /pierna|pantorrilla|pie|rodilla|gemelo|talon|tal[oó]n|dedos del pie/i
                          .test(sinNegaciones(irradiacion)) ||
                        regiones.has('pierna') || regiones.has('pantorrilla') ||
                        regiones.has('pantorrilla_izq') || regiones.has('pie');

  return {
    /* del mapa corporal */
    regiones, zonas:lectura.zonas, dist:lectura.distribucion, wpi:lectura.wpi,
    areas:lectura.areas.length, bilateral:lectura.bilateral, raiz,
    intensidadMapa:lectura.intensidadMax,

    /* de la historia del dolor */
    desc: new Set(d.descriptores || []),
    meses: d.meses != null ? Number(d.meses) : mesesDesde(d.inicio),
    nrsPromedio: d.nrsPromedio,
    nrsAhora: d.nrsAhora,
    patron: d.patron || '',
    peorMomento: d.peorMomento || '',
    alivia: d.alivia || '',
    empeora: d.empeora || '',
    irradiacion, irradiaPierna,

    /* del paciente */
    edad: edadDe(p.fechaNac) || 0,
    sexo: p.sexo || '',
    ante,

    /* de las escalas */
    dn4: escalaTotal('dn4'),
    csi: escalaTotal('csi'),
    pcs: escalaTotal('pcs'),
    pseq: escalaTotal('pseq'),
    phq9: escalaTotal('phq9'),
    sss: escalaTotal('acr2016'),
    bpi: escalaTotal('bpi'),

    /* del examen */
    signos: new Set((p.examen && p.examen.signos) || []),
    deficitNeuro: ((p.examen && p.examen.signos) || [])
                    .some(s => ['debilidad','rot_disminuido','hipoestesia'].includes(s)),

    /* varios */
    banderas: new Set(an.banderas || []),
    tratamientosFallidos: ((p.tratamientosPrevios || [])
      .filter(t => /igual|empeor|sin cambio|no sirvi|nada/i.test(t.resultado || '')).length),
    textoLibre: [d.descripcion, d.mecanismo, p.notas, textoAnte].join(' ')
  };
}

/* Saca del texto los tramos que estan negados, para que buscar una palabra
   dentro de "no baja de la rodilla" no cuente como que si baja. Corta en la
   negacion y sigue hasta la proxima coma o punto, que es donde en castellano
   termina el alcance de un "no" o un "sin". */
function sinNegaciones(texto) {
  return String(texto || '')
    .replace(/\b(no|sin|nunca|jam[aá]s|tampoco)\b[^,.;]*/gi, ' ');
}

function mesesDesde(iso) {
  if (!iso) return null;
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  if (isNaN(d)) return null;
  return Math.max(0, Math.round((Date.now() - d.getTime()) / (30.44 * 86400000)));
}

/* =========================================================================
   2. FENOTIPO MECANISTICO
   ========================================================================= */

function fenotipar(c) {
  const r = {
    neuropatico:  {puntos:0, grado:'no', porque:[]},
    nociplastico: {puntos:0, grado:'no', porque:[]},
    nociceptivo:  {puntos:0, porque:[]},
    predominante: 'indeterminado',
    mixto: false,
    texto: ''
  };

  /* ---------------- NEUROPATICO: gradación NeuPSIG ---------------------
     Tres escalones. Cada uno exige el anterior. El paso de POSIBLE a
     PROBABLE es el que hace la diferencia clínica y depende del examen
     físico: sin examinar la sensibilidad, no se puede subir de escalón. */
  const n = r.neuropatico;

  const antecedenteLesion = ['diabetes','herpes','cirugia','trauma','amputacion','quimioterapia',
                             'acv','lesion_medular','esclerosis','cirugia_columna']
                            .some(a => c.ante.has(a));
  const distribucionPlausible = !!(c.raiz && c.raiz.proporcion >= 35) ||
                                (c.dist !== 'generalizada' && c.zonas.length > 0 && !c.bilateral);

  if (c.dn4 >= 4) { n.puntos += 3; n.porque.push('DN4 ' + c.dn4 + '/10, por encima del umbral de 4'); }
  if (distribucionPlausible) {
    n.puntos += 2;
    n.porque.push(c.raiz
      ? 'Distribución concentrada en territorio de ' + c.raiz.raiz + ' (' + c.raiz.proporcion + '% de las marcas)'
      : 'Distribución neuroanatómicamente plausible');
  }
  if (antecedenteLesion) { n.puntos += 2; n.porque.push('Antecedente de lesión o enfermedad del sistema somatosensorial'); }
  if (['quemante','electrico','hormigueo'].some(x => c.desc.has(x))) {
    n.puntos += 2; n.porque.push('Descriptores característicos: quemazón, descargas eléctricas u hormigueo');
  }

  const signosSensitivos = c.signos.has('hipoestesia') || c.signos.has('alodinia') ||
                           c.signos.has('hiperalgesia') || c.signos.has('hipoalgesia');
  const pruebaObjetiva   = c.signos.has('emg_confirmatorio') || c.signos.has('imagen_confirmatoria');

  if (distribucionPlausible && antecedenteLesion) {
    n.grado = 'posible';
    if (signosSensitivos) {
      n.grado = 'probable';
      n.porque.push('Signos sensitivos objetivados en el territorio del dolor');
      if (pruebaObjetiva) {
        n.grado = 'definido';
        n.porque.push('Lesión del sistema somatosensorial documentada por estudio complementario');
      }
    }
  } else if (c.dn4 >= 4) {
    n.grado = 'sospechado por tamizaje';
    n.porque.push('El DN4 es una herramienta de tamizaje: orienta, no gradúa. Para llegar a ' +
                  '"probable" hace falta el examen sensitivo del territorio');
  }

  /* ---------------- NOCIPLASTICO: criterios de Kosek 2021 -------------- */
  const np = r.nociplastico;
  const regionalOMas = ['regional','multifocal','generalizada'].includes(c.dist);
  const cronico = c.meses >= 3;
  const hipersensibilidad = c.signos.has('alodinia') || c.signos.has('hiperalgesia') ||
                            c.signos.has('hipersensibilidad_estimulos') || c.csi >= 40;
  const comorbilidades = (c.csi >= 40 ? 1 : 0) +
                         (c.phq9 >= 10 ? 1 : 0) +
                         (c.signos.has('sueño_no_reparador') ? 1 : 0) +
                         (c.signos.has('fatiga') ? 1 : 0) +
                         (c.signos.has('sintomas_cognitivos') ? 1 : 0);

  if (regionalOMas && cronico) {
    np.puntos += 2;
    np.porque.push('Dolor ' + c.dist + ' de más de 3 meses, no discreto');
    np.grado = 'posible';
    if (hipersensibilidad) {
      np.puntos += 3;
      np.porque.push('Hipersensibilidad evocada en la región dolorosa' + (c.csi >= 40 ? ', con CSI ' + c.csi + '/100' : ''));
      if (comorbilidades >= 1) {
        np.grado = 'probable';
        np.puntos += 2;
        np.porque.push('Comorbilidades acompañantes: ' + comorbilidades + ' de las que definen el cuadro ' +
                       '(sueño, fatiga, síntomas cognitivos, ánimo, hipersensibilidad a estímulos)');
      }
    }
  }
  if (c.dist === 'generalizada') { np.puntos += 3; np.porque.push('Dolor generalizado en ' + c.areas + ' de 5 áreas corporales (WPI ' + c.wpi + '/19)'); }

  /* ---------------- NOCICEPTIVO --------------------------------------- */
  const noc = r.nociceptivo;
  if (c.dn4 != null && c.dn4 < 4) { noc.puntos += 2; noc.porque.push('DN4 ' + c.dn4 + '/10, por debajo del umbral neuropático'); }
  if (['sordo','opresivo','rigidez','punzante','pulsatil'].some(x => c.desc.has(x))) {
    noc.puntos += 2; noc.porque.push('Descriptores de dolor somático: sordo, opresivo, rigidez o punzante');
  }
  if (/movimi|esfuerz|activid|camin|carga|peso|agach|levantar/i.test(c.empeora || '')) {
    noc.puntos += 2; noc.porque.push('Ritmo mecánico: empeora con la actividad');
  }
  if (/repos|acost|sentar|quiet|dormir/i.test(c.alivia || '')) {
    noc.puntos += 1; noc.porque.push('Alivia con el reposo');
  }
  if (c.dist === 'localizada') { noc.puntos += 2; noc.porque.push('Dolor localizado y proporcional'); }
  if (!c.signos.has('alodinia') && !c.signos.has('hipoestesia')) { noc.puntos += 1; noc.porque.push('Sin alteraciones sensitivas al examen'); }

  /* ---------------- quién manda ---------------------------------------- */
  const orden = [
    {k:'neuropatico',  v:n.puntos},
    {k:'nociplastico', v:np.puntos},
    {k:'nociceptivo',  v:noc.puntos}
  ].sort((a, b) => b.v - a.v);

  if (orden[0].v === 0) {
    r.predominante = 'indeterminado';
    r.texto = 'Los datos cargados no alcanzan para orientar el mecanismo. Completar el mapa ' +
              'corporal, los descriptores del dolor y el DN4 cambia sustancialmente este resultado.';
    return r;
  }

  r.predominante = orden[0].k;
  /* Se considera mixto cuando el segundo mecanismo llega al 60% del primero:
     por debajo de eso, señalar dos mecanismos confunde más que ayuda. */
  r.mixto = orden[1].v > 0 && orden[1].v >= orden[0].v * 0.6;
  r.segundo = r.mixto ? orden[1].k : null;

  const nombre = {neuropatico:'neuropático', nociplastico:'nociplástico', nociceptivo:'nociceptivo'};
  r.texto = r.mixto
    ? 'Dolor MIXTO, con componente ' + nombre[orden[0].k] + ' y ' + nombre[orden[1].k] + '.'
    : 'Dolor predominantemente ' + nombre[orden[0].k] + '.';
  if (r.predominante === 'neuropatico' && n.grado !== 'no') {
    r.texto += ' Gradación NeuPSIG: neuropático ' + n.grado.toUpperCase() + '.';
  }
  if (r.predominante === 'nociplastico' && np.grado !== 'no') {
    r.texto += ' Criterios de Kosek: nociplástico ' + np.grado.toUpperCase() + '.';
  }
  return r;
}

/* =========================================================================
   3. DIFERENCIAL PONDERADO
   ========================================================================= */

function evaluarSindromes(c, cuantos) {
  const salida = [];

  for (const s of SINDROMES) {
    /* Criterios de exclusión: si alguno se cumple, el síndrome no compite. */
    if ((s.excluye || []).some(e => seguro(e.f, c))) continue;

    /* Compuerta topográfica. Muchos síndromes tienen una localización sin la
       cual el diagnóstico es imposible: una neuralgia occipital que no duele
       en el occipucio no es una neuralgia occipital, por más que el dolor sea
       eléctrico, unilateral y con DN4 alto. Sin esto, esos cuadros se cuelan
       arriba del diferencial sumando puntos por todo lo que NO es topografía.

       Solo se aplica cuando el mapa corporal tiene marcas: si el paciente
       todavía no lo completó, descartar por topografía sería descartar por
       falta de datos, y eso deja al médico sin diferencial ninguno. */
    if (c.regiones.size && s.topografia && !seguro(s.topografia.f, c)) continue;

    let obtenido = 0, posible = 0;
    const aFavor = [], enContra = [];
    for (const regla of s.reglas) {
      posible += regla.p;
      if (seguro(regla.f, c)) { obtenido += regla.p; aFavor.push(regla.t); }
      else if (regla.p >= 4)  { enContra.push(regla.t); }
    }
    if (!posible) continue;
    const pct = Math.round((obtenido / posible) * 100);
    /* Por debajo del 30% no es un diferencial, es ruido. */
    if (pct < 30) continue;

    salida.push({
      sindrome:s, concordancia:pct, aFavor, enContra,
      puntos:obtenido, maximo:posible,
      /* Un síndrome que concuerda pero cuyo mecanismo no coincide con el
         fenotipo merece una marca: suele ser el que hay que mirar dos veces. */
      color: pct >= 70 ? 'alto' : pct >= 50 ? 'medio' : 'bajo'
    });
  }

  salida.sort((a, b) => b.concordancia - a.concordancia);
  return salida.slice(0, cuantos || 6);
}

/* Una regla mal escrita no puede tumbar la consulta entera. */
function seguro(f, c) {
  try { return !!f(c); } catch (e) { return false; }
}

/* =========================================================================
   4. BANDERAS ROJAS
   ========================================================================= */

const BANDERAS = [
  {id:'esfinteres', txt:'Cambios en el control de orina o materia fecal',
   nivel:'urgente', accion:'SÍNDROME DE CAUDA EQUINA hasta que se demuestre lo contrario. ' +
   'Requiere resonancia y consulta neuroquirúrgica el mismo día. La ventana para conservar ' +
   'la función esfinteriana se mide en horas.'},
  {id:'silla_montar', txt:'Anestesia en silla de montar',
   nivel:'urgente', accion:'Cauda equina. Derivación inmediata a guardia con resonancia urgente.'},
  {id:'deficit_progresivo', txt:'Debilidad o adormecimiento progresivo en brazos o piernas',
   nivel:'urgente', accion:'Compresión medular o radicular en progresión. Imagen urgente. ' +
   'En paciente oncológico, iniciar dexametasona sin esperar el estudio.'},
  {id:'cancer', txt:'Antecedente personal de cáncer',
   nivel:'alto', accion:'Con dolor axial nuevo o progresivo: descartar metástasis y compresión ' +
   'medular. Resonancia de columna, no radiografía.'},
  {id:'perdida_peso', txt:'Pérdida de peso no intencional',
   nivel:'alto', accion:'Buscar causa sistémica: neoplasia, infección crónica, enfermedad inflamatoria.'},
  {id:'fiebre', txt:'Fiebre',
   nivel:'alto', accion:'Descartar infección espinal: espondilodiscitis o absceso epidural. ' +
   'Laboratorio con hemograma, VSG, PCR, hemocultivos e imagen con contraste.'},
  {id:'dolor_nocturno', txt:'Dolor que lo despierta de noche y no mejora con el reposo',
   nivel:'alto', accion:'Patrón NO mecánico. Descartar tumor, infección o causa inflamatoria.'},
  {id:'trauma', txt:'Traumatismo significativo reciente',
   nivel:'medio', accion:'Descartar fractura. En el paciente osteoporótico o corticoideo, ' +
   'un trauma mínimo alcanza.'},
  {id:'corticoides', txt:'Uso prolongado de corticoides o inmunosupresión',
   nivel:'medio', accion:'Riesgo de fractura vertebral por compresión y de infección espinal.'},
  {id:'edad_extrema', txt:'Primer episodio antes de los 20 o después de los 50 años',
   nivel:'medio', accion:'Rango de mayor probabilidad de causa específica. Bajar el umbral para estudiar.'},
  {id:'adiv', txt:'Uso de drogas endovenosas',
   nivel:'alto', accion:'Riesgo elevado de infección espinal y endocarditis.'},
  {id:'inflamatorio', txt:'Rigidez matinal mayor a 30 minutos que mejora con el ejercicio',
   nivel:'medio', accion:'Patrón inflamatorio. En menor de 45 años, derivar a reumatología ' +
   'por sospecha de espondiloartritis axial.'},
  {id:'ideacion', txt:'Ideación de muerte o autolesión',
   nivel:'urgente', accion:'Evaluar riesgo suicida HOY y no diferir. El dolor crónico multiplica ' +
   'ese riesgo y el ítem 9 del PHQ-9 es el que lo detecta.'}
];

function revisarBanderas(p, c) {
  const marcadas = new Set((p.antecedentes && p.antecedentes.banderas) || []);
  const encontradas = [];

  for (const b of BANDERAS) if (marcadas.has(b.id)) encontradas.push(b);

  /* Algunas se deducen solas de otros datos: son las que se pasan por alto. */
  if (c.ante.has('cancer') && !marcadas.has('cancer')) {
    encontradas.push({...BANDERAS.find(b => b.id === 'cancer'),
      deducida:'Detectado en los antecedentes cargados'});
  }
  if (c.edad >= 50 && c.meses != null && c.meses <= 3 && !marcadas.has('edad_extrema')) {
    encontradas.push({...BANDERAS.find(b => b.id === 'edad_extrema'),
      deducida:'Primer episodio a los ' + c.edad + ' años'});
  }
  const phq = p.escalas && p.escalas.phq9;
  if (phq && phq.items && phq.items[8] > 0) {
    encontradas.push({...BANDERAS.find(b => b.id === 'ideacion'),
      deducida:'Ítem 9 del PHQ-9 con respuesta positiva'});
  }
  if (c.deficitNeuro && !marcadas.has('deficit_progresivo')) {
    encontradas.push({id:'deficit_examen', txt:'Déficit neurológico en el examen físico',
      nivel:'medio', deducida:'Signos cargados en el examen',
      accion:'Documentar el déficit, su territorio y su evolución. Si progresa, pasa a ser urgente.'});
  }

  const orden = {urgente:0, alto:1, medio:2};
  encontradas.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
  return encontradas;
}

/* =========================================================================
   5. CONTROL DE SEGURIDAD FARMACOLOGICA
   -------------------------------------------------------------------------
   Revisa la medicacion cargada. Es lo que en la practica evita la mayoria
   de los problemas evitables.
   ========================================================================= */

function revisarSeguridad(p, c) {
  const avisos = [];
  const meds = (p.medicacion || []).filter(m => m && m.farmaco);
  const tiene = id => meds.some(m => m.farmaco === id);
  const nombre = id => (FARMACOS[id] && FARMACOS[id].nombre) || id;

  const renalGrave = c.ante.has('renal') || (p.antecedentes && p.antecedentes.filtrado &&
                     Number(p.antecedentes.filtrado) < 30);
  const renalMod   = p.antecedentes && p.antecedentes.filtrado &&
                     Number(p.antecedentes.filtrado) >= 30 && Number(p.antecedentes.filtrado) < 60;
  const mayor      = c.edad >= 65;

  /* --- carga opioide total ------------------------------------------- */
  const opioides = meds.filter(m => FARMACOS[m.farmaco] && FARMACOS[m.farmaco].grupo === 'Opioide')
    .map(m => ({id:m.farmaco, mgDia:mgDiariosDe(m), mcgHora:mcgHoraDe(m)}));
  const mme = calcularMME(opioides);
  if (mme.total > 0) {
    avisos.push({
      nivel: mme.color === 'rojo' ? 'alto' : mme.color === 'ambar' ? 'medio' : 'info',
      titulo:'Carga opioide: ' + mme.total + ' MME/día — ' + mme.nivel,
      texto: mme.aviso || 'Registrado para seguimiento.',
      nota: mme.nota
    });
  }

  /* --- combinaciones peligrosas -------------------------------------- */
  const serotoninergicos = ['tramadol','duloxetina','venlafaxina','amitriptilina','nortriptilina',
                            'tapentadol','ciclobenzaprina'].filter(tiene);
  if (serotoninergicos.length >= 2) {
    /* La combinacion de un dual con un triciclico es de uso corriente en dolor
       y su riesgo es modesto. La que de verdad importa es la que incluye
       tramadol o tapentadol: esa es la que se pasa por alto y la que manda
       gente a la guardia. Marcar las dos igual seria enseñar a ignorar la alerta. */
    const conOpioide = serotoninergicos.some(x => ['tramadol','tapentadol'].includes(x));
    avisos.push({nivel:conOpioide ? 'alto' : 'medio', titulo:'Riesgo de síndrome serotoninérgico',
      texto:'Están cargados a la vez: ' + serotoninergicos.map(nombre).join(', ') + '. ' +
            'La combinación de tramadol con un dual o un tricíclico es la más frecuente en dolor y ' +
            'la que más se pasa por alto. Vigilar agitación, temblor, clonus, hipertermia y sudoración; ' +
            'instruir al paciente sobre qué consultar.'});
  }

  const benzo = /clonazepam|alprazolam|diazepam|lorazepam|bromazepam|zolpidem/i;
  const tomaBenzo = (p.antecedentes && benzo.test(p.antecedentes.medicacionNoDolor || '')) ||
                    meds.some(m => benzo.test(m.farmaco + ' ' + (m.nombreLibre || '')));
  if (mme.total > 0 && tomaBenzo) {
    avisos.push({nivel:'alto', titulo:'Opioide junto con benzodiacepina',
      texto:'Es la combinación con mayor riesgo de depresión respiratoria y muerte por sobredosis. ' +
            'Si no se puede evitar, usar la dosis más baja de ambos, indicar naloxona domiciliaria e ' +
            'instruir a la familia. Planificar el descenso de la benzodiacepina.'});
  }

  if (tiene('pregabalina') && mme.total > 0) {
    avisos.push({nivel:'medio', titulo:'Gabapentinoide junto con opioide',
      texto:'La combinación aumenta el riesgo de sedación y depresión respiratoria. Revisar la ' +
            'necesidad de ambos y vigilar la somnolencia, sobre todo al iniciar o subir dosis.'});
  }

  /* --- función renal -------------------------------------------------- */
  if (renalGrave) {
    if (tiene('aine')) avisos.push({nivel:'alto', titulo:'AINE con función renal comprometida',
      texto:'Los AINE están contraindicados con filtrado menor a 30 ml/min. Suspender y buscar ' +
            'alternativa: paracetamol, dipirona o un tópico.'});
    if (tiene('pregabalina') || tiene('gabapentina'))
      avisos.push({nivel:'alto', titulo:'Gabapentinoide sin ajuste renal',
        texto:'La pregabalina y la gabapentina se eliminan íntegras por riñón. Con filtrado menor a 30 ' +
              'hay que reducir a un cuarto de la dosis habitual. No ajustarlo es la causa más común de ' +
              'somnolencia, ataxia y caídas.'});
    if (tiene('morfina')) avisos.push({nivel:'alto', titulo:'Morfina con insuficiencia renal',
      texto:'El metabolito morfina-6-glucurónido se acumula y produce sedación, mioclonías y depresión ' +
            'respiratoria tardía. Preferir metadona, fentanilo o buprenorfina, que no dependen del riñón.'});
    if (tiene('duloxetina')) avisos.push({nivel:'alto', titulo:'Duloxetina contraindicada',
      texto:'Contraindicada con filtrado menor a 30 ml/min. Rotar a un tricíclico, que no requiere ajuste renal.'});
  } else if (renalMod) {
    if (tiene('pregabalina') || tiene('gabapentina'))
      avisos.push({nivel:'medio', titulo:'Ajustar el gabapentinoide por función renal',
        texto:'Con filtrado entre 30 y 60 ml/min corresponde la mitad de la dosis habitual.'});
  }

  /* --- edad ----------------------------------------------------------- */
  if (mayor) {
    if (tiene('amitriptilina')) avisos.push({nivel:'medio', titulo:'Tricíclico en mayor de 65 años',
      texto:'La amitriptilina figura en los criterios de Beers como potencialmente inapropiada en el ' +
            'adulto mayor por sus efectos anticolinérgicos y el riesgo de caídas. La nortriptilina da ' +
            'el mismo beneficio analgésico con bastante mejor tolerancia.'});
    if (tiene('ciclobenzaprina')) avisos.push({nivel:'medio', titulo:'Relajante muscular en mayor de 65 años',
      texto:'Los relajantes de acción central están desaconsejados en el adulto mayor: sedación, ' +
            'confusión y caídas superan al beneficio.'});
    if (tiene('aine')) avisos.push({nivel:'medio', titulo:'AINE en mayor de 65 años',
      texto:'Riesgo digestivo, renal y cardiovascular aumentado. Si se sostiene, indicar inhibidor de ' +
            'bomba de protones y controlar función renal y presión arterial.'});
  }

  /* --- comorbilidades específicas ------------------------------------- */
  if (c.ante.has('cardiopatia') && (tiene('amitriptilina') || tiene('nortriptilina')))
    avisos.push({nivel:'alto', titulo:'Tricíclico con cardiopatía',
      texto:'Contraindicado tras infarto reciente y en arritmias. Pedir ECG basal y evaluar el QTc antes de sostenerlo.'});
  if (tiene('metadona'))
    avisos.push({nivel:'medio', titulo:'Metadona: control de QT',
      texto:'Requiere ECG basal, a los 30 días y con cada aumento. Con QTc mayor a 500 ms, suspender. ' +
            'Su vida media es larga y errática: la toxicidad aparece días después de subir la dosis.'});
  if (tiene('carbamazepina') || tiene('oxcarbazepina'))
    avisos.push({nivel:'medio', titulo:'Control de natremia',
      texto:'Ambas producen hiponatremia, más frecuente en el adulto mayor y con diuréticos. ' +
            'Natremia basal, al mes y luego periódica. La carbamazepina además exige hemograma y hepatograma.'});
  if (c.ante.has('epilepsia') && tiene('tramadol'))
    avisos.push({nivel:'alto', titulo:'Tramadol con antecedente convulsivo',
      texto:'El tramadol baja el umbral convulsivo y está contraindicado en epilepsia no controlada.'});
  if (c.ante.has('glaucoma') && (tiene('amitriptilina') || tiene('nortriptilina')))
    avisos.push({nivel:'alto', titulo:'Tricíclico con glaucoma',
      texto:'Contraindicado en glaucoma de ángulo cerrado.'});
  if (c.ante.has('prostatismo') && (tiene('amitriptilina') || tiene('nortriptilina')))
    avisos.push({nivel:'medio', titulo:'Tricíclico con prostatismo',
      texto:'Riesgo de retención urinaria aguda. Advertirlo al paciente.'});
  if (c.ante.has('hepatica') && (tiene('paracetamol') || tiene('duloxetina')))
    avisos.push({nivel:'medio', titulo:'Hepatopatía',
      texto:'Paracetamol: máximo 2 g/día. Duloxetina: contraindicada en hepatopatía.'});

  /* --- lo que falta --------------------------------------------------- */
  if (mme.total > 0 && !/laxante|bisacodilo|lactulosa|polietilenglicol|senosidos|picosulfato/i
        .test(JSON.stringify(p.medicacion) + (p.antecedentes && p.antecedentes.medicacionNoDolor || ''))) {
    avisos.push({nivel:'medio', titulo:'Falta profilaxis de constipación',
      texto:'Hay un opioide indicado y ningún laxante. La constipación por opioides es universal y NO ' +
            'desarrolla tolerancia: se previene desde el primer día con un estimulante más un osmótico. ' +
            'Es la causa más frecuente de abandono del tratamiento.'});
  }
  if (mme.total >= 50 && !/naloxona/i.test(JSON.stringify(p.medicacion))) {
    avisos.push({nivel:'medio', titulo:'Considerar naloxona domiciliaria',
      texto:'Con 50 MME/día o más, corresponde ofrecer naloxona e instruir a un conviviente en su uso.'});
  }
  if (mme.total > 0 && !p.escalas?.ort) {
    avisos.push({nivel:'info', titulo:'Falta evaluar el riesgo de uso problemático',
      texto:'Hay opioide indicado y el Opioid Risk Tool no está completado. Conviene hacerlo antes de sostener el tratamiento.'});
  }

  /* --- fibromialgia y opioides ---------------------------------------- */
  if (c.ante.has('fibromialgia') && mme.total > 0) {
    avisos.push({nivel:'alto', titulo:'Opioide en fibromialgia',
      texto:'Los opioides están desaconsejados en fibromialgia por todas las guías. No mejoran el ' +
            'cuadro, pueden producir hiperalgesia y empeoran la evolución a largo plazo. Planificar el descenso.'});
  }

  const orden = {alto:0, medio:1, info:2};
  avisos.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
  return {avisos, mme};
}

/* Interpreta "75mg" o "75 mg cada 12hs" y devuelve los miligramos por día. */
function mgDiariosDe(m) {
  if (m.mgDia != null) return Number(m.mgDia) || 0;
  const dosis = String(m.dosis || '');
  const mg = parseFloat((dosis.match(/([\d.,]+)\s*mg/i) || [])[1] || '0'.replace(',', '.'));
  if (!mg) return 0;
  const frec = String(m.frecuencia || '');
  let veces = 1;
  const cada = (frec.match(/cada\s*(\d+)/i) || [])[1];
  if (cada) veces = 24 / Number(cada);
  else if (/8\s*h|tres veces|3 veces/i.test(frec)) veces = 3;
  else if (/12\s*h|dos veces|2 veces/i.test(frec)) veces = 2;
  else if (/6\s*h|cuatro veces/i.test(frec)) veces = 4;
  return mg * veces;
}

function mcgHoraDe(m) {
  const t = String(m.dosis || '');
  return parseFloat((t.match(/([\d.,]+)\s*mcg/i) || [])[1] || 0);
}

/* =========================================================================
   6. SUGERENCIA DE PLAN
   -------------------------------------------------------------------------
   Toma el sindrome elegido y filtra su esquema de tratamiento contra las
   contraindicaciones REALES de este paciente. Un plan que recomienda AINE a
   un paciente en dialisis no es una ayuda, es un riesgo.
   ========================================================================= */

function sugerirPlan(sindromeId, p, c) {
  const s = SINDROMES.find(x => x.id === sindromeId);
  if (!s) return null;

  const filtrado = p.antecedentes ? Number(p.antecedentes.filtrado) : 0;
  const renalGrave = c.ante.has('renal') || (filtrado > 0 && filtrado < 30);
  /* El deterioro MODERADO tambien obliga a ajustar varios farmacos. Antes solo
     lo avisaba el panel de seguridad y el plan sugerido no decia nada, asi que
     el mismo dato producia dos respuestas distintas segun donde se mirara. */
  const renalModerada = !renalGrave && filtrado >= 30 && filtrado < 60;
  const hepatica = c.ante.has('hepatica');
  const mayor = c.edad >= 65;
  const embarazo = c.ante.has('embarazo');
  const alergias = normalizar((p.antecedentes && p.antecedentes.alergias) || '');

  function revisar(item) {
    const f = FARMACOS[item.farmaco];
    if (!f) return {...item, nombre:item.farmaco, reparos:[]};
    const reparos = [];

    if (renalGrave) {
      if (/contraindicad/i.test(f.ajusteRenal || '')) reparos.push('CONTRAINDICADO con este filtrado renal');
      else if (/imprescindible|reducir|ajustar/i.test(f.ajusteRenal || '')) reparos.push('Requiere ajuste renal: ' + f.ajusteRenal);
    } else if (renalModerada && /imprescindible|reducir|ajustar/i.test(f.ajusteRenal || '')) {
      reparos.push('Filtrado ' + filtrado + ' ml/min: ajustar la dosis. ' + f.ajusteRenal);
    }
    if (hepatica && /contraindicad|evitar/i.test(f.ajusteHepatico || ''))
      reparos.push('Evitar por hepatopatía');
    if (mayor && item.farmaco === 'amitriptilina')
      reparos.push('En mayor de 65 años, preferir nortriptilina');
    if (mayor && ['aine','ciclobenzaprina'].includes(item.farmaco))
      reparos.push('Desaconsejado en el adulto mayor');
    if (embarazo && ['aine','pregabalina','gabapentina','carbamazepina','duloxetina'].includes(item.farmaco))
      reparos.push('Revisar seguridad en el embarazo antes de indicarlo');
    if (alergias && normalizar(f.nombre).split(/[\s(]/).some(w => w.length > 4 && alergias.includes(w)))
      reparos.push('POSIBLE ALERGIA declarada: verificar');
    for (const cc of (f.contraindicaciones || [])) {
      const n = normalizar(cc);
      if ((c.ante.has('epilepsia')   && /epilep|convuls/.test(n)) ||
          (c.ante.has('cardiopatia') && /infarto|arritmia|cardiac/.test(n)) ||
          (c.ante.has('glaucoma')    && /glaucoma/.test(n)) ||
          (c.ante.has('prostatismo') && /prostat/.test(n)))
        reparos.push('Contraindicación relativa: ' + cc);
    }
    return {...item, nombre:f.nombre, inicio:f.inicio, titulacion:f.titulacion,
            maxima:f.maxima, latencia:f.latencia, reparos};
  }

  const t = s.tratamiento || {};
  return {
    sindrome: s,
    objetivo: t.objetivo || '',
    noFarmacologico: t.noFarmacologico || [],
    primeraLinea: (t.primeraLinea || []).map(revisar),
    segundaLinea: (t.segundaLinea || []).map(revisar),
    tercera: (t.tercera || []).map(revisar),
    evitar: t.evitar || [],
    estudios: s.estudios || [],
    procedimientos: (s.procedimientos || []).map(id => ({id, ...(PROCEDIMIENTOS[id] || {})}))
                                            .filter(x => x.nombre),
    controles: s.controles || {},
    irruptivo: s.irruptivo || '',
    criterios: s.criterios || '',
    referencias: s.referencias || []
  };
}

/* =========================================================================
   7. LECTURA COMPLETA — lo que la aplicacion "opina" de un paciente
   ========================================================================= */

function analizar(p) {
  const c = construirContexto(p);
  return {
    contexto: c,
    fenotipo: fenotipar(c),
    diferencial: evaluarSindromes(c),
    banderas: revisarBanderas(p, c),
    seguridad: revisarSeguridad(p, c),
    completitud: medirCompletitud(p, c)
  };
}

/* Que falta para que el analisis valga algo. Se muestra al medico para que
   sepa cuanto pesa lo que la aplicacion le esta diciendo. */
function medirCompletitud(p, c) {
  const faltan = [];
  if (!(p.dolor && (p.dolor.mapa || []).length)) faltan.push('el mapa corporal');
  if (!(p.dolor && p.dolor.descriptores || []).length) faltan.push('los descriptores del dolor');
  if (p.dolor && p.dolor.nrsPromedio == null) faltan.push('la intensidad promedio');
  if (c.dn4 == null) faltan.push('el DN4');
  if (!c.meses && c.meses !== 0) faltan.push('la fecha de inicio del dolor');
  if (!(p.examen && (p.examen.signos || []).length)) faltan.push('el examen físico');
  const total = 6;
  return {
    faltan,
    porcentaje: Math.round(((total - faltan.length) / total) * 100),
    suficiente: faltan.length <= 2
  };
}
