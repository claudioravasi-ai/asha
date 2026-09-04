/* =========================================================================
   CAPITULO MG30 DE LA CIE-11 — DOLOR CRONICO
   -------------------------------------------------------------------------
   La clasificacion de dolor cronico que la IASP desarrollo junto a la OMS y
   que la OMS adopto en 2019. Es la primera vez que el dolor cronico tiene
   codigos propios en una clasificacion internacional, y la distincion que la
   ordena es entre dolor PRIMARIO (el dolor es la enfermedad) y dolor
   SECUNDARIO (el dolor es sintoma de otra cosa).

   Cada entrada trae ademas PALABRAS: los terminos con los que un medico
   escribe ese diagnostico en la practica. Eso es lo que permite que el
   codigo se complete solo mientras se escribe, sin tener que buscarlo en
   otro lado.

   SOBRE LOS CODIGOS
   Los de nivel MG30.0 a MG30.6 y los subcodigos de MG30.0 estan verificados
   contra la clasificacion de la OMS. Los subcodigos de las demas ramas
   siguen la literatura de la IASP y son los de uso corriente, pero antes de
   usarlos en documentacion oficial conviene confirmarlos en la herramienta
   de codificacion de la OMS: https://icd.who.int/ct11
   ========================================================================= */
'use strict';

const ICD11_DOLOR = [

  /* ---------------- DOLOR CRONICO PRIMARIO ---------------------------- */
  {cod:'MG30.0',  txt:'Dolor crónico primario', grupo:'Primario',
   nota:'El dolor es la enfermedad en sí misma, no el síntoma de otra.',
   palabras:'primario idiopatico funcional sin causa'},
  {cod:'MG30.00', txt:'Dolor visceral crónico primario', grupo:'Primario',
   palabras:'visceral abdominal pelvico colon irritable vejiga dispepsia'},
  {cod:'MG30.01', txt:'Dolor crónico generalizado', grupo:'Primario',
   nota:'Incluye la fibromialgia.',
   palabras:'fibromialgia generalizado widespread difuso todo el cuerpo'},
  {cod:'MG30.02', txt:'Dolor musculoesquelético crónico primario', grupo:'Primario',
   nota:'Incluye la lumbalgia crónica inespecífica y la cervicalgia inespecífica.',
   palabras:'lumbalgia lumbar inespecifico cervicalgia dorsalgia miofascial contractura espalda'},
  {cod:'MG30.03', txt:'Cefalea o dolor orofacial crónico primario', grupo:'Primario',
   palabras:'migraña cefalea tensional cluster racimos orofacial temporomandibular atm bruxismo'},
  {cod:'MG30.04', txt:'Síndrome de dolor regional complejo', grupo:'Primario',
   nota:'SDRC tipo I (sin lesión nerviosa) y tipo II (con lesión nerviosa).',
   palabras:'sdrc crps distrofia simpatico refleja causalgia sudeck regional complejo'},

  /* ---------------- ONCOLOGICO ---------------------------------------- */
  {cod:'MG30.1',  txt:'Dolor crónico relacionado con el cáncer', grupo:'Oncológico',
   palabras:'cancer oncologico tumor neoplasia'},
  {cod:'MG30.10', txt:'Dolor crónico por cáncer', grupo:'Oncológico',
   nota:'Producido por el tumor primario o sus metástasis.',
   palabras:'cancer metastasis oseas tumor invasion infiltracion pancreas mieloma'},
  {cod:'MG30.11', txt:'Dolor crónico posterior al tratamiento oncológico', grupo:'Oncológico',
   nota:'Por quimioterapia, radioterapia o cirugía oncológica.',
   palabras:'quimioterapia neuropatia quimio cipn radioterapia post radiacion mucositis linfedema'},

  /* ---------------- POSTQUIRURGICO Y POSTRAUMATICO -------------------- */
  {cod:'MG30.2',  txt:'Dolor crónico postquirúrgico o postraumático', grupo:'Postquirúrgico',
   palabras:'postquirurgico postoperatorio postraumatico cicatriz'},
  {cod:'MG30.20', txt:'Dolor postquirúrgico crónico', grupo:'Postquirúrgico',
   nota:'Persiste más de 3 meses después de la cirugía y no se explica por otra causa.',
   palabras:'postquirurgico postoperatorio toracotomia mastectomia hernioplastia cirugia fallida ' +
            'espalda fbss espinal persistente cesarea protesis'},
  {cod:'MG30.21', txt:'Dolor postraumático crónico', grupo:'Postquirúrgico',
   palabras:'postraumatico trauma accidente latigazo whiplash quemadura fractura'},

  /* ---------------- MUSCULOESQUELETICO SECUNDARIO --------------------- */
  {cod:'MG30.3',  txt:'Dolor musculoesquelético secundario crónico', grupo:'Musculoesquelético',
   palabras:'musculoesqueletico articular columna faceta facetario sacroiliaca hombro'},
  {cod:'MG30.30', txt:'Dolor musculoesquelético crónico por inflamación persistente',
   grupo:'Musculoesquelético',
   palabras:'artritis reumatoidea espondiloartritis psoriasica gota inflamatorio sinovitis'},
  {cod:'MG30.31', txt:'Dolor musculoesquelético crónico por cambios estructurales',
   grupo:'Musculoesquelético',
   nota:'Incluye la artrosis y la patología degenerativa de columna.',
   palabras:'artrosis osteoartritis degenerativo discopatia espondilosis estenosis ' +
            'escoliosis condropatia gonartrosis coxartrosis'},
  {cod:'MG30.32', txt:'Dolor musculoesquelético crónico por enfermedad del sistema nervioso',
   grupo:'Musculoesquelético',
   palabras:'espasticidad parkinson distonia esclerosis contractura neurologica'},

  /* ---------------- VISCERAL SECUNDARIO ------------------------------- */
  {cod:'MG30.4',  txt:'Dolor visceral secundario crónico', grupo:'Visceral',
   palabras:'visceral abdominal toracico pelvico'},
  {cod:'MG30.40', txt:'Dolor visceral crónico por factores mecánicos', grupo:'Visceral',
   palabras:'obstruccion litiasis calculo adherencias reflujo hernia hiato'},
  {cod:'MG30.41', txt:'Dolor visceral crónico por mecanismos vasculares', grupo:'Visceral',
   palabras:'isquemia mesenterica angina abdominal vascular'},
  {cod:'MG30.42', txt:'Dolor visceral crónico por inflamación persistente', grupo:'Visceral',
   palabras:'pancreatitis endometriosis enfermedad inflamatoria intestinal crohn colitis cistitis'},

  /* ---------------- NEUROPATICO --------------------------------------- */
  {cod:'MG30.5',  txt:'Dolor neuropático crónico', grupo:'Neuropático',
   nota:'Por lesión o enfermedad del sistema somatosensorial.',
   palabras:'neuropatico nervio neuralgia'},
  {cod:'MG30.50', txt:'Dolor neuropático periférico crónico', grupo:'Neuropático',
   nota:'La rama más usada en una unidad de dolor.',
   palabras:'neuropatia periferica radiculopatia lumbociatalgia ciatica polineuropatia ' +
            'diabetica postherpetica herpes zoster trigemino occipital arnold pudendo ' +
            'atrapamiento tunel carpiano meralgia fantasma muñon neuroma plexopatia ' +
            'intercostal ilioinguinal cubital'},
  {cod:'MG30.51', txt:'Dolor neuropático central crónico', grupo:'Neuropático',
   nota:'Por lesión medular, ACV o esclerosis múltiple.',
   palabras:'central medular acv talamico esclerosis multiple siringomielia parapleji ' +
            'lesion medular post ictus'},

  /* ---------------- CEFALEA Y OROFACIAL SECUNDARIOS ------------------- */
  {cod:'MG30.6',  txt:'Cefalea o dolor orofacial secundario crónico', grupo:'Cefalea',
   palabras:'cefalea cervicogenica orofacial neuralgia facial atm secundaria ' +
            'abuso de medicacion rebote'},

  /* ---------------- SIN ESPECIFICAR ----------------------------------- */
  {cod:'MG30.Y',  txt:'Otro dolor crónico especificado', grupo:'Otros', palabras:'otro especificado'},
  {cod:'MG30.Z',  txt:'Dolor crónico, sin especificar', grupo:'Otros', palabras:'sin especificar inespecificado'}
];

/* -------------------------------------------------------------------------
   Busca a la vez en el catalogo de sindromes y en la clasificacion. Devuelve
   sugerencias ordenadas: primero los sindromes, que ademas del codigo traen
   el mecanismo y todo el plan, y despues los codigos sueltos para cuando el
   diagnostico no esta en el catalogo.
   ------------------------------------------------------------------------- */
function buscarDiagnostico(texto, cuantos) {
  const q = normalizar(texto).trim();
  if (q.length < 2) return [];
  const partes = q.split(/\s+/).filter(x => x.length >= 2);
  const salida = [];

  /* Sindromes del catalogo: si el medico elige uno, se completa TODO. */
  for (const s of SINDROMES) {
    const heno = normalizar(s.icd.cod + ' ' + s.nombre + ' ' + s.grupo + ' ' +
                            s.icd.txt + ' ' + s.resumen);
    if (!partes.every(t => heno.includes(t))) continue;
    /* Que la coincidencia empiece el nombre pesa mas que aparecer en el medio. */
    const peso = normalizar(s.nombre).startsWith(q) ? 0 : normalizar(s.nombre).includes(q) ? 1 : 2;
    salida.push({tipo:'sindrome', peso, sindrome:s,
      nombre:s.nombre, cod:s.icd.cod, txt:s.icd.txt,
      mecanismo:s.mecanismo, grupo:s.grupo});
  }

  /* Codigos sueltos de la clasificacion. */
  for (const e of ICD11_DOLOR) {
    /* El codigo entra en la busqueda: el medico que ya sabe cual es lo escribe
       directo y es mas rapido que buscarlo por el nombre. */
    const heno = normalizar(e.cod + ' ' + e.txt + ' ' + e.grupo + ' ' +
                            (e.palabras || '') + ' ' + (e.nota || ''));
    if (!partes.every(t => heno.includes(t))) continue;
    if (salida.some(x => x.cod === e.cod && x.tipo === 'sindrome')) continue;
    salida.push({tipo:'codigo', peso:normalizar(e.txt).startsWith(q) ? 3 : 4,
      nombre:e.txt, cod:e.cod, txt:e.txt, grupo:e.grupo, nota:e.nota});
  }

  salida.sort((a, b) => a.peso - b.peso || a.nombre.localeCompare(b.nombre));
  return salida.slice(0, cuantos || 8);
}

/* Dado un codigo, su denominacion. Sirve para completar el texto cuando el
   codigo se escribio a mano. */
function textoICD(cod) {
  const c = String(cod || '').trim().toUpperCase();
  const e = ICD11_DOLOR.find(x => x.cod.toUpperCase() === c);
  return e ? e.txt : '';
}

/* Los mecanismos se guardan sin tilde porque son claves internas; cuando se
   muestran, llevan tilde como cualquier palabra escrita en castellano. */
const MECANISMO_LEGIBLE = {
  nociceptivo:'nociceptivo', neuropatico:'neuropático',
  nociplastico:'nociplástico', mixto:'mixto'
};
function mecanismoLegible(m) { return MECANISMO_LEGIBLE[m] || m || ''; }
