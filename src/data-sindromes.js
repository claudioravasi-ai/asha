/* =========================================================================
   CATALOGO DE SINDROMES DE DOLOR
   -------------------------------------------------------------------------
   Cada sindrome trae reglas EVALUABLES, no prosa. El motor le pasa a cada
   regla un contexto con todo lo que se sabe del paciente y suma los pesos de
   las que dan verdadero; el resultado es un porcentaje de concordancia que
   se muestra ordenado, como un diagnostico diferencial.

   Esto NO es un diagnosticador. Es lo que en la practica hace un residente
   ordenado: mirar los datos, acordarse de la lista de posibilidades y
   ponerlas en orden para que el que sabe decida. Todas las sugerencias salen
   marcadas y son editables.

   CAMPOS
     icd          codigo ICD-11. Solo se usan los codigos verificados contra
                  la clasificacion de la OMS (ver nota al pie del archivo).
     mecanismo    nociceptivo | neuropatico | nociplastico | mixto
     reglas       [{p:peso, t:texto que se muestra, f:(c)=>bool}]
     excluye      [{t, f}] — si alguna da verdadero, el sindrome se descarta
     estudios     que pedir y cuando
     tratamiento  escalonado, con ids del vademecum (data-farmacos.js)
     procedimientos ids de data-procedimientos.js
     controles    cada cuanto y con que escalas
     banderas     banderas rojas propias de este cuadro
     referencias  de donde sale la recomendacion
   ========================================================================= */
'use strict';

/* Atajos de lectura del contexto, para que las reglas se lean como frases. */
const _z  = (c, ...ids) => ids.some(i => c.regiones.has(i));
const _d  = (c, ...ds)  => ds.some(x => c.desc.has(x));
const _a  = (c, ...as)  => as.some(x => c.ante.has(x));
const _tr = (c, re)     => re.test(c.textoLibre || '');

const SINDROMES = [

/* ======================================================================= */
/* COLUMNA LUMBAR                                                          */
/* ======================================================================= */

{
  id:'lumbalgia_inespecifica',
  nombre:'Dolor lumbar crónico inespecífico',
  grupo:'Columna lumbar',
  icd:{cod:'MG30.02', txt:'Dolor musculoesquelético crónico primario'},
  mecanismo:'nociceptivo',
  resumen:'Dolor lumbar de más de 3 meses sin causa estructural que lo explique. ' +
          'Es el diagnóstico más frecuente de una unidad de dolor y, bien manejado, ' +
          'el de mejor pronóstico. El error clásico es estudiarlo de más.',
  topografia:{t:'Requiere dolor en región lumbar', f:c=>_z(c,'lumbar','flanco','sacro')},
  reglas:[
    {p:4, t:'Dolor localizado en región lumbar', f:c=>_z(c,'lumbar')},
    {p:3, t:'Evolución mayor a 3 meses', f:c=>c.meses>=3},
    {p:2, t:'Sin irradiación por debajo de la rodilla', f:c=>!c.irradiaPierna},
    {p:2, t:'Carácter sordo, profundo o de rigidez', f:c=>_d(c,'sordo','rigidez','opresivo')},
    {p:2, t:'DN4 por debajo del umbral neuropático', f:c=>c.dn4!=null&&c.dn4<4},
    {p:2, t:'Empeora con la actividad y mejora con el reposo', f:c=>/movimi|esfuerz|activid|caminar|cargar|agach/i.test(c.empeora||'')},
    {p:1, t:'Sin déficit neurológico', f:c=>!c.deficitNeuro}
  ],
  excluye:[
    {t:'Dolor generalizado en 4 o más áreas corporales', f:c=>c.dist==='generalizada'}
  ],
  estudios:[
    {t:'NINGUNO de rutina en los primeros 3 meses sin banderas rojas', cuando:'siempre',
     nota:'La imagen precoz sin banderas rojas empeora los resultados: aumenta la ' +
          'cirugía, el costo y la discapacidad, sin mejorar el dolor.'},
    {t:'Radiografía de columna lumbar frente y perfil', cuando:'si hay sospecha de fractura, deformidad o edad >70'},
    {t:'RMN de columna lumbar sin contraste', cuando:'solo si hay bandera roja, déficit progresivo o se planifica un procedimiento'},
    {t:'Laboratorio con VSG y PCR', cuando:'si se sospecha causa inflamatoria o infecciosa'}
  ],
  tratamiento:{
    objetivo:'Recuperar función y actividad. La analgesia es un medio, no la meta.',
    noFarmacologico:[
      'Educación en neurofisiología del dolor y desdramatización de la imagen',
      'Ejercicio terapéutico supervisado, del tipo que el paciente tolere y sostenga',
      'Mantener actividad laboral y evitar el reposo en cama',
      'Terapia cognitivo-conductual si STarT Back es de riesgo alto'
    ],
    primeraLinea:[
      {farmaco:'aine', nota:'Ciclos cortos, la dosis mínima eficaz, con protección gástrica si hay riesgo'},
      {farmaco:'paracetamol', nota:'Evidencia débil como monoterapia; útil combinado'}
    ],
    segundaLinea:[
      {farmaco:'duloxetina', nota:'La mejor evidencia entre los antidepresivos para lumbalgia crónica'},
      {farmaco:'ciclobenzaprina', nota:'Solo en exacerbaciones, no más de 2 semanas'}
    ],
    tercera:[
      {farmaco:'tramadol', nota:'Beneficio pequeño y transitorio. Revalorar a las 4 semanas y suspender si no hay respuesta funcional'}
    ],
    evitar:[
      'Opioides potentes como tratamiento de fondo',
      'Benzodiacepinas',
      'Reposo prolongado en cama',
      'Repetir imágenes sin cambio clínico'
    ]
  },
  procedimientos:[],
  controles:{frecuencia:'6 a 8 semanas', escalas:['nrs','odi','pseq','startback'],
             que:'Función y retorno a la actividad antes que la cifra de dolor.'},
  banderas:['Déficit motor progresivo','Alteración esfinteriana','Anestesia en silla de montar',
            'Fiebre','Pérdida de peso','Dolor nocturno que no cede con el reposo'],
  referencias:['NICE NG59 (2016, revisada)','Foster NE. et al., Lancet 2018 (serie de dolor lumbar)']
},

{
  id:'radiculopatia_lumbar',
  nombre:'Radiculopatía lumbosacra (lumbociatalgia)',
  grupo:'Columna lumbar',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'neuropatico',
  resumen:'Compresión o irritación de una raíz lumbosacra. La clave no es que ' +
          'duela la pierna, sino que el dolor siga un territorio radicular y ' +
          'haya signos en ese territorio.',
  topografia:{t:'Requiere dolor en región lumbar o miembro inferior', f:c=>_z(c,'lumbar','gluteo','muslo','pierna','pantorrilla','pie','poplitea','sacro')},
  reglas:[
    {p:5, t:'Dolor irradiado a la pierna por debajo de la rodilla', f:c=>c.irradiaPierna},
    {p:4, t:'Distribución concentrada en una raíz (L4, L5 o S1)', f:c=>c.raiz&&/L4|L5|S1/.test(c.raiz.raiz)&&c.raiz.proporcion>=35},
    {p:4, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:3, t:'Descargas eléctricas, hormigueo o adormecimiento', f:c=>_d(c,'electrico','hormigueo')},
    {p:3, t:'Maniobra de Lasègue o Slump positiva', f:c=>c.signos.has('lasegue')||c.signos.has('slump')},
    {p:2, t:'Dolor unilateral', f:c=>!c.bilateral},
    {p:2, t:'Alteración sensitiva o reflejo abolido en el territorio', f:c=>c.signos.has('hipoestesia')||c.signos.has('rot_disminuido')},
    {p:2, t:'Empeora al toser, estornudar o sentarse', f:c=>/toser|estornud|sentad|sentar/i.test(c.empeora||'')}
  ],
  estudios:[
    {t:'RMN de columna lumbosacra sin contraste', cuando:'si el dolor persiste más de 6 semanas, si hay déficit, o antes de un procedimiento'},
    {t:'Electromiograma con velocidad de conducción', cuando:'si la clínica y la imagen no coinciden, o para datar la lesión'},
    {t:'Glucemia y hemoglobina glicosilada', cuando:'para descartar una polineuropatía que confunda el cuadro'}
  ],
  tratamiento:{
    objetivo:'Aliviar el dolor radicular y prevenir el déficit. El 60-80% mejora sin cirugía.',
    noFarmacologico:['Kinesiología con progresión a ejercicio activo','Educación y control de la actividad, sin reposo prolongado'],
    primeraLinea:[
      {farmaco:'pregabalina', nota:'Titular lento. La evidencia en radiculopatía es más débil que en otras neuropatías'},
      {farmaco:'duloxetina', nota:'Alternativa razonable, mejor tolerada en el adulto mayor'},
      {farmaco:'amitriptilina', nota:'Barata y eficaz; cuidado con los anticolinérgicos en mayores de 65'}
    ],
    segundaLinea:[
      {farmaco:'gabapentina'},
      {farmaco:'aine', nota:'Ciclo corto en la fase aguda'},
      {farmaco:'corticoide_oral', nota:'Ciclo corto en el brote agudo; sin beneficio sostenido'}
    ],
    tercera:[
      {farmaco:'tramadol', nota:'Puente corto hasta que el coadyuvante alcance dosis útil'},
      {farmaco:'lidocaina_parche', nota:'Si hay alodinia localizada bien delimitada'}
    ],
    evitar:['Opioides potentes de mantenimiento','Reposo en cama prolongado']
  },
  procedimientos:['epidural_transforaminal','epidural_interlaminar','epidural_caudal'],
  controles:{frecuencia:'4 semanas al inicio, luego cada 8 a 12', escalas:['nrs','dn4','odi'],
             que:'Territorio del dolor, fuerza segmentaria y distancia de marcha.'},
  banderas:['Síndrome de cauda equina (retención urinaria, anestesia en silla de montar, déficit bilateral): EMERGENCIA QUIRÚRGICA',
            'Paresia progresiva o pie caído de instalación rápida'],
  referencias:['NeuPSIG / Finnerup NB. et al., Lancet Neurol 2015 y 2025','NICE NG59']
},

{
  id:'sindrome_facetario_lumbar',
  nombre:'Síndrome facetario lumbar',
  grupo:'Columna lumbar',
  icd:{cod:'MG30.3', txt:'Dolor musculoesquelético secundario crónico'},
  mecanismo:'nociceptivo',
  resumen:'Dolor de origen en las articulaciones interapofisarias. Es el cuadro ' +
          'donde el bloqueo diagnóstico de rama medial tiene más valor, porque ' +
          'no hay ningún signo clínico ni imagen que lo confirme por sí solo.',
  topografia:{t:'Requiere dolor en región lumbar', f:c=>_z(c,'lumbar','gluteo','flanco','sacro')},
  reglas:[
    {p:4, t:'Dolor lumbar axial, paravertebral', f:c=>_z(c,'lumbar')},
    {p:3, t:'Sin irradiación por debajo de la rodilla', f:c=>!c.irradiaPierna},
    {p:3, t:'Empeora con la extensión, la rotación o al estar de pie', f:c=>/extend|extensi|rotar|de pie|parad|arquear|hiperextensi/i.test(c.empeora||'')},
    {p:2, t:'Mejora al sentarse o inclinarse hacia adelante', f:c=>/sentar|flexion|inclinar|adelante/i.test(c.alivia||'')},
    {p:2, t:'Dolor referido a glúteo o cara posterior del muslo sin pasar la rodilla', f:c=>_z(c,'gluteo','muslo')&&!c.irradiaPierna},
    {p:2, t:'DN4 bajo', f:c=>c.dn4!=null&&c.dn4<4},
    {p:2, t:'Rigidez matinal breve, peor con la inactividad prolongada', f:c=>_d(c,'rigidez')},
    {p:1, t:'Edad mayor a 50 años', f:c=>c.edad>=50}
  ],
  estudios:[
    {t:'Radiografía dinámica lumbar', cuando:'para descartar inestabilidad o espondilolistesis'},
    {t:'RMN o TC de columna lumbar', cuando:'antes del procedimiento, para planificar el nivel'},
    {t:'Bloqueo diagnóstico de rama medial con anestésico local', cuando:'es la única prueba con valor confirmatorio',
     nota:'Se considera positivo si hay más de 80% de alivio durante la duración esperada del anestésico. ' +
          'Conviene el bloqueo comparativo doble (lidocaína y bupivacaína) para bajar el falso positivo, ' +
          'que con un solo bloqueo llega al 25-40%.'}
  ],
  tratamiento:{
    objetivo:'Confirmar el origen facetario y, si se confirma, denervar por radiofrecuencia.',
    noFarmacologico:['Ejercicio de estabilización lumbar y control motor','Higiene postural y control de peso'],
    primeraLinea:[{farmaco:'aine'},{farmaco:'paracetamol'}],
    segundaLinea:[{farmaco:'duloxetina'},{farmaco:'ciclobenzaprina', nota:'Solo en exacerbaciones'}],
    tercera:[],
    evitar:['Corticoide intraarticular facetario: no tiene evidencia de beneficio sostenido']
  },
  procedimientos:['bloqueo_rama_medial_lumbar','radiofrecuencia_lumbar'],
  controles:{frecuencia:'2 semanas post bloqueo, luego cada 3 meses', escalas:['nrs','odi','pgic'],
             que:'Registrar el porcentaje y la duración exacta del alivio del bloqueo: ' +
                 'de eso depende la indicación de radiofrecuencia.'},
  banderas:[],
  referencias:['Cohen SP, Raja SN. Anesthesiology 2007','Spine Intervention Society, práctica basada en evidencia']
},

{
  id:'sacroiliaca',
  nombre:'Dolor de la articulación sacroilíaca',
  grupo:'Columna lumbar',
  icd:{cod:'MG30.3', txt:'Dolor musculoesquelético secundario crónico'},
  mecanismo:'nociceptivo',
  resumen:'Explica el 15-30% de las lumbalgias bajas. Se sospecha por la ' +
          'topografía y se confirma con maniobras y bloqueo.',
  topografia:{t:'Requiere dolor en región sacroilíaca, sacra, glútea o lumbar', f:c=>_z(c,'sacroiliaca','sacro','gluteo','lumbar')},
  reglas:[
    {p:5, t:'Dolor localizado sobre la articulación sacroilíaca', f:c=>_z(c,'sacroiliaca')},
    {p:3, t:'Dolor por debajo de L5, señalado con un dedo (signo de Fortin)', f:c=>_z(c,'sacro','gluteo')&&c.dist!=='generalizada'},
    {p:3, t:'Tres o más maniobras provocativas positivas', f:c=>c.signos.has('sacroiliacas_positivas')},
    {p:2, t:'Unilateral', f:c=>!c.bilateral},
    {p:2, t:'Empeora al levantarse de la silla, subir escaleras o cargar de un lado', f:c=>/levantar|escaler|subir|silla/i.test(c.empeora||'')},
    {p:2, t:'Antecedente de embarazo, trauma pelviano o cirugía de fusión lumbar', f:c=>_a(c,'embarazo','trauma','cirugia_columna')},
    {p:1, t:'DN4 bajo', f:c=>c.dn4!=null&&c.dn4<4}
  ],
  estudios:[
    {t:'Radiografía de pelvis', cuando:'para descartar sacroileítis inflamatoria'},
    {t:'Laboratorio con VSG, PCR y HLA-B27', cuando:'si es bilateral, en menor de 45 años o con dolor inflamatorio nocturno'},
    {t:'Bloqueo intraarticular sacroilíaco guiado por imagen', cuando:'prueba diagnóstica de referencia'}
  ],
  tratamiento:{
    objetivo:'Diferenciar el origen mecánico del inflamatorio: el manejo es opuesto.',
    noFarmacologico:['Ejercicio de estabilización lumbopélvica','Cinturón pélvico en la inestabilidad postparto'],
    primeraLinea:[{farmaco:'aine'}],
    segundaLinea:[{farmaco:'duloxetina'}],
    tercera:[],
    evitar:[]
  },
  procedimientos:['bloqueo_sacroiliaco','radiofrecuencia_sacroiliaca'],
  controles:{frecuencia:'6 semanas', escalas:['nrs','odi'], que:'Maniobras provocativas y marcha.'},
  banderas:['Dolor inflamatorio (rigidez matinal >30 min, mejora con el ejercicio, despierta en la segunda mitad de la noche) en menor de 45: derivar a reumatología por sospecha de espondiloartritis'],
  referencias:['Cohen SP. Anesth Analg 2005','ASAS, criterios de espondiloartritis axial']
},

{
  id:'estenosis_canal',
  nombre:'Estenosis del canal lumbar (claudicación neurógena)',
  grupo:'Columna lumbar',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'mixto',
  resumen:'La historia es tan característica que vale más que la imagen: la ' +
          'imagen muestra estenosis en mucha gente sin síntomas.',
  topografia:{t:'Requiere dolor en región lumbar o miembros inferiores', f:c=>_z(c,'lumbar','gluteo','muslo','pierna','pantorrilla','pie')},
  reglas:[
    {p:5, t:'Dolor en piernas al caminar que obliga a detenerse', f:c=>/caminar|marcha|andar|caminando/i.test(c.empeora||'')&&_z(c,'muslo','pierna','pantorrilla','gluteo')},
    {p:5, t:'Alivio al sentarse o al inclinarse hacia adelante', f:c=>/sentar|inclinar|flexion|adelante|carrito|changuito|agachar/i.test(c.alivia||'')},
    {p:3, t:'Edad mayor a 60 años', f:c=>c.edad>=60},
    {p:3, t:'Síntomas bilaterales en miembros inferiores', f:c=>c.bilateral&&_z(c,'muslo','pierna','pantorrilla')},
    {p:2, t:'Hormigueo o pesadez en piernas más que dolor lumbar', f:c=>_d(c,'hormigueo')},
    {p:2, t:'Tolera mejor la bicicleta que caminar', f:c=>/bicicleta|bici/i.test((c.alivia||'')+(c.textoLibre||''))}
  ],
  estudios:[
    {t:'RMN de columna lumbar', cuando:'confirma el diagnóstico y define el nivel'},
    {t:'Índice tobillo-brazo o eco Doppler arterial', cuando:'SIEMPRE, para diferenciar de la claudicación vascular',
     nota:'La claudicación vascular no mejora al inclinarse hacia adelante y aparece a distancia fija.'},
    {t:'Electromiograma', cuando:'si coexiste polineuropatía'}
  ],
  tratamiento:{
    objetivo:'Mantener la distancia de marcha. Es la variable que le importa al paciente.',
    noFarmacologico:['Ejercicio en flexión y en bicicleta fija','Programa de marcha progresiva','Descenso de peso'],
    primeraLinea:[{farmaco:'aine'},{farmaco:'duloxetina'}],
    segundaLinea:[{farmaco:'pregabalina', nota:'Evidencia limitada en estenosis; probar y suspender si no responde en 4 semanas'}],
    tercera:[],
    evitar:['Opioides potentes: empeoran el equilibrio y aumentan las caídas en esta población']
  },
  procedimientos:['epidural_interlaminar','epidural_caudal'],
  controles:{frecuencia:'3 meses', escalas:['nrs','odi'],
             que:'Distancia de marcha en cuadras o metros: es el mejor indicador de progresión.'},
  banderas:['Cauda equina','Deterioro rápido de la marcha o caídas'],
  referencias:['NASS, guía de estenosis lumbar degenerativa','Lurie J, Tomkins-Lane C. BMJ 2016']
},

{
  id:'dolor_espinal_persistente',
  nombre:'Dolor espinal persistente tras cirugía (ex síndrome de cirugía fallida)',
  grupo:'Columna lumbar',
  icd:{cod:'MG30.20', txt:'Dolor postquirúrgico crónico'},
  mecanismo:'mixto',
  resumen:'Dolor que persiste o reaparece después de una cirugía de columna. ' +
          'La denominación cambió porque "cirugía fallida" culpabiliza y no ' +
          'describe: el problema suele ser mixto, con fibrosis, sensibilización ' +
          'y a menudo una indicación quirúrgica que nunca fue la adecuada.',
  reglas:[
    {p:6, t:'Cirugía previa de columna', f:c=>_a(c,'cirugia_columna')},
    {p:4, t:'El dolor persiste o reapareció después de esa cirugía', f:c=>_a(c,'cirugia_columna')&&c.meses>=3},
    {p:3, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:2, t:'Componente radicular además del axial', f:c=>c.irradiaPierna},
    {p:2, t:'Catastrofización elevada', f:c=>c.pcs>=30},
    {p:2, t:'Múltiples tratamientos previos sin respuesta', f:c=>c.tratamientosFallidos>=3}
  ],
  excluye:[
    {t:'Sin cirugía de columna previa', f:c=>!_a(c,'cirugia_columna')}
  ],
  estudios:[
    {t:'RMN de columna CON gadolinio', cuando:'siempre',
     nota:'El contraste es lo que distingue fibrosis epidural (realza) de hernia recidivada (no realza). Sin contraste el estudio no sirve para esta pregunta.'},
    {t:'TC con reconstrucción', cuando:'para evaluar la instrumentación, seudoartrosis o aflojamiento'},
    {t:'Electromiograma', cuando:'para documentar y datar el daño radicular'}
  ],
  tratamiento:{
    objetivo:'Programa multimodal. Es el cuadro donde el abordaje aislado fracasa siempre.',
    noFarmacologico:['Programa interdisciplinario: kinesiología, psicología y medicina del dolor juntos',
                     'Terapia cognitivo-conductual, casi obligatoria en este cuadro',
                     'Reacondicionamiento físico progresivo'],
    primeraLinea:[{farmaco:'duloxetina'},{farmaco:'pregabalina'},{farmaco:'amitriptilina'}],
    segundaLinea:[{farmaco:'gabapentina'},{farmaco:'lidocaina_parche'}],
    tercera:[{farmaco:'tapentadol', nota:'Si el componente neuropático es dominante y falló todo lo anterior'},
             {farmaco:'ketamina_ev', nota:'Infusiones en dolor refractario con sensibilización central'}],
    evitar:['Reoperar sin una lesión estructural nueva y concordante con la clínica']
  },
  procedimientos:['epidural_transforaminal','adhesiolisis_epidural','estimulacion_medular'],
  controles:{frecuencia:'6 a 8 semanas', escalas:['nrs','odi','dn4','pcs','pseq','pgic'],
             que:'Función y consumo de opioides. Es un cuadro donde el dolor baja poco y la función puede subir mucho.'},
  banderas:['Fiebre o signos de infección del sitio quirúrgico','Déficit motor nuevo'],
  referencias:['Christelis N. et al., Pain Med 2021 (nueva denominación)',
               'NICE, estimulación medular en dolor neuropático crónico']
},

/* ======================================================================= */
/* COLUMNA CERVICAL Y CABEZA                                               */
/* ======================================================================= */

{
  id:'cervicalgia_facetaria',
  nombre:'Cervicalgia crónica de origen facetario',
  grupo:'Columna cervical',
  icd:{cod:'MG30.3', txt:'Dolor musculoesquelético secundario crónico'},
  mecanismo:'nociceptivo',
  resumen:'Causa más frecuente de dolor cervical crónico tras un latigazo. ' +
          'Los mapas de dolor referido de cada faceta son conocidos y ayudan ' +
          'a elegir el nivel a bloquear.',
  topografia:{t:'Requiere dolor en región cervical, occipital, escapular o del hombro', f:c=>_z(c,'cervical','cuello','occipucio','escapula','hombro')},
  reglas:[
    {p:5, t:'Dolor cervical axial', f:c=>_z(c,'cervical','cuello')},
    {p:3, t:'Dolor referido a occipucio, hombro o región interescapular', f:c=>_z(c,'occipucio','hombro','escapula')},
    {p:3, t:'Sin irradiación por debajo del codo', f:c=>!_z(c,'antebrazo','mano')},
    {p:3, t:'Antecedente de latigazo cervical o accidente vehicular', f:c=>_a(c,'latigazo','trauma')},
    {p:2, t:'Empeora con la extensión y la rotación del cuello', f:c=>/rotar|girar|extend|mirar|extensi/i.test(c.empeora||'')},
    {p:2, t:'DN4 bajo', f:c=>c.dn4!=null&&c.dn4<4},
    {p:2, t:'Dolor a la palpación de las columnas articulares', f:c=>c.signos.has('palpacion_facetaria')}
  ],
  estudios:[
    {t:'Radiografía cervical frente, perfil y transoral', cuando:'inicial'},
    {t:'RMN cervical', cuando:'si hay signos radiculares o mielopáticos, o antes de procedimiento'},
    {t:'Bloqueo de rama medial cervical comparativo', cuando:'para confirmar el nivel'}
  ],
  tratamiento:{
    objetivo:'Confirmar el nivel y denervar. La radiofrecuencia cervical tiene mejores resultados que la lumbar.',
    noFarmacologico:['Ejercicio de fortalecimiento de flexores profundos del cuello','Terapia manual','Corrección ergonómica del puesto de trabajo'],
    primeraLinea:[{farmaco:'aine'},{farmaco:'paracetamol'}],
    segundaLinea:[{farmaco:'amitriptilina', nota:'Dosis bajas nocturnas, útil por el componente de sueño'},
                  {farmaco:'ciclobenzaprina'}],
    tercera:[],
    evitar:['Collar cervical prolongado: atrofia la musculatura y cronifica']
  },
  procedimientos:['bloqueo_rama_medial_cervical','radiofrecuencia_cervical','puntos_gatillo'],
  controles:{frecuencia:'6 semanas', escalas:['nrs','ndi','pgic'], que:'Rango de movilidad cervical y NDI.'},
  banderas:['Signos de mielopatía: torpeza en las manos, marcha inestable, Hoffmann positivo','Trauma reciente sin radiografía'],
  referencias:['Bogduk N, Lord SM.','Spine Intervention Society']
},

{
  id:'radiculopatia_cervical',
  nombre:'Radiculopatía cervical',
  grupo:'Columna cervical',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'neuropatico',
  resumen:'Dolor cervical irradiado al miembro superior en territorio radicular. ' +
          'C6 y C7 son las raíces más comprometidas.',
  topografia:{t:'Requiere dolor en región cervical o miembro superior', f:c=>_z(c,'cervical','cuello','hombro','brazo','antebrazo','mano','escapula')},
  reglas:[
    {p:5, t:'Dolor irradiado al miembro superior por debajo del codo', f:c=>_z(c,'antebrazo','mano')},
    {p:4, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:4, t:'Distribución en territorio de C5, C6, C7 u C8', f:c=>c.raiz&&/C[5-8]/.test(c.raiz.raiz)&&c.raiz.proporcion>=35},
    {p:3, t:'Signo de Spurling positivo', f:c=>c.signos.has('spurling')},
    {p:3, t:'Descargas eléctricas u hormigueo en la mano', f:c=>_d(c,'electrico','hormigueo')},
    {p:2, t:'Alivio al elevar el brazo sobre la cabeza (signo de abducción)', f:c=>/elevar|levantar el brazo|cabeza|abduc/i.test(c.alivia||'')},
    {p:2, t:'Debilidad o reflejo abolido en el territorio', f:c=>c.signos.has('rot_disminuido')||c.signos.has('debilidad')}
  ],
  estudios:[
    {t:'RMN cervical', cuando:'si persiste más de 6 semanas o hay déficit'},
    {t:'Electromiograma de miembro superior', cuando:'para diferenciar de atrapamiento periférico (túnel carpiano, cubital en codo)'}
  ],
  tratamiento:{
    objetivo:'La mayoría mejora en 4 a 6 meses sin cirugía.',
    noFarmacologico:['Kinesiología con tracción intermitente y ejercicio','Evitar posiciones de extensión sostenida'],
    primeraLinea:[{farmaco:'pregabalina'},{farmaco:'duloxetina'},{farmaco:'amitriptilina'}],
    segundaLinea:[{farmaco:'gabapentina'},{farmaco:'corticoide_oral', nota:'Ciclo corto en el brote'}],
    tercera:[{farmaco:'tramadol', nota:'Puente corto'}],
    evitar:['Manipulación cervical de alta velocidad si hay déficit o sospecha de inestabilidad']
  },
  procedimientos:['epidural_cervical_interlaminar'],
  controles:{frecuencia:'4 a 6 semanas', escalas:['nrs','dn4','ndi'], que:'Fuerza segmentaria y territorio del dolor.'},
  banderas:['Mielopatía cervical','Déficit motor progresivo','Atrofia muscular'],
  referencias:['NeuPSIG 2025','NASS, guía de radiculopatía cervical']
},

{
  id:'cefalea_cervicogenica',
  nombre:'Cefalea cervicogénica',
  grupo:'Cabeza y cara',
  icd:{cod:'MG30.6', txt:'Cefalea o dolor orofacial secundario crónico'},
  mecanismo:'nociceptivo',
  resumen:'Cefalea referida desde estructuras cervicales altas (C1 a C3). Se ' +
          'confunde sistemáticamente con migraña; la diferencia está en que ' +
          'el dolor se reproduce desde el cuello.',
  topografia:{t:'Requiere dolor en cabeza o región cervical', f:c=>_z(c,'cara','occipucio','cervical','cuello')},
  reglas:[
    {p:5, t:'Cefalea unilateral que empieza en el cuello', f:c=>_z(c,'cervical','occipucio','cuello')&&_z(c,'cara','occipucio')},
    {p:4, t:'Sin cambio de lado entre episodios', f:c=>!c.bilateral},
    {p:3, t:'Se desencadena o agrava con el movimiento o la postura del cuello', f:c=>/cuello|girar|postura|computadora|celular|almohada/i.test(c.empeora||'')},
    {p:3, t:'Movilidad cervical restringida', f:c=>c.signos.has('movilidad_cervical_limitada')},
    {p:2, t:'Dolor a la palpación de la unión craneocervical', f:c=>c.signos.has('palpacion_occipital')},
    {p:2, t:'Sin náuseas ni fotofobia marcadas', f:c=>!/nausea|vomito|fotofobia|luz/i.test(c.textoLibre||'')}
  ],
  estudios:[
    {t:'Radiografía cervical dinámica', cuando:'inicial'},
    {t:'RMN cervical', cuando:'si hay sospecha de patología estructural alta'},
    {t:'Bloqueo diagnóstico del nervio occipital mayor o de rama medial C2-C3', cuando:'confirma el diagnóstico'}
  ],
  tratamiento:{
    objetivo:'Tratar el cuello, no la cabeza.',
    noFarmacologico:['Kinesiología cervical alta con control motor','Corrección postural y ergonomía'],
    primeraLinea:[{farmaco:'aine'},{farmaco:'amitriptilina'}],
    segundaLinea:[{farmaco:'duloxetina'},{farmaco:'ciclobenzaprina'}],
    tercera:[],
    evitar:['Analgésicos a demanda todos los días: riesgo de cefalea por abuso de medicación']
  },
  procedimientos:['bloqueo_occipital','bloqueo_rama_medial_cervical','radiofrecuencia_cervical','toxina_botulinica'],
  controles:{frecuencia:'6 semanas', escalas:['nrs','ndi'], que:'Días de cefalea al mes y consumo de analgésicos.'},
  banderas:['Cefalea en trueno','Cefalea nueva después de los 50','Fiebre y rigidez de nuca','Papiledema','Déficit neurológico focal'],
  referencias:['IHS, Clasificación Internacional de Cefaleas 3ª edición','Sjaastad O., criterios de cefalea cervicogénica']
},

{
  id:'neuralgia_occipital',
  nombre:'Neuralgia occipital (de Arnold)',
  grupo:'Cabeza y cara',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'neuropatico',
  resumen:'Dolor paroxístico en el territorio del nervio occipital mayor o menor. ' +
          'El bloqueo es diagnóstico y terapéutico a la vez.',
  topografia:{t:'Requiere dolor en región occipital o cervical alta', f:c=>_z(c,'occipucio','cervical','cuello')},
  reglas:[
    {p:5, t:'Dolor en territorio occipital', f:c=>_z(c,'occipucio')},
    {p:5, t:'Paroxismos de dolor eléctrico o punzante', f:c=>_d(c,'electrico','punzante')},
    {p:3, t:'Dolor a la presión del punto de emergencia del nervio occipital', f:c=>c.signos.has('palpacion_occipital')},
    {p:3, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:2, t:'Alodinia o disestesia del cuero cabelludo', f:c=>c.signos.has('alodinia')||_d(c,'hormigueo')},
    {p:2, t:'Unilateral', f:c=>!c.bilateral}
  ],
  excluye:[
    {t:'Sin dolor en el territorio occipital', f:c=>c.regiones.size && !_z(c,'occipucio')}
  ],
  estudios:[
    {t:'RMN de cráneo y columna cervical', cuando:'para descartar lesión estructural en la unión craneocervical'},
    {t:'Bloqueo anestésico del nervio occipital mayor', cuando:'confirma el diagnóstico si alivia el dolor'}
  ],
  tratamiento:{
    objetivo:'Cortar los paroxismos y evitar la cronificación.',
    noFarmacologico:['Kinesiología cervical alta','Corrección postural'],
    primeraLinea:[{farmaco:'pregabalina'},{farmaco:'gabapentina'},{farmaco:'amitriptilina'}],
    segundaLinea:[{farmaco:'carbamazepina'},{farmaco:'duloxetina'}],
    tercera:[{farmaco:'lidocaina_parche'}],
    evitar:[]
  },
  procedimientos:['bloqueo_occipital','radiofrecuencia_pulsada','toxina_botulinica'],
  controles:{frecuencia:'4 semanas', escalas:['nrs','dn4','pgic'], que:'Número y duración de los paroxismos por día.'},
  banderas:['Cefalea nueva y progresiva','Signos de hipertensión endocraneana'],
  referencias:['IHS ICHD-3','Choi I, Jeon SR. J Korean Neurosurg Soc 2016']
},

{
  id:'neuralgia_trigemino',
  nombre:'Neuralgia del trigémino',
  grupo:'Cabeza y cara',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'neuropatico',
  resumen:'Uno de los dolores más intensos que existen y, a la vez, uno de los ' +
          'que mejor responde al fármaco correcto. La carbamazepina es de ' +
          'primera línea y la respuesta sostiene el diagnóstico.',
  topografia:{t:'Requiere dolor en cara', f:c=>_z(c,'cara')},
  reglas:[
    {p:6, t:'Dolor en territorio del trigémino (V1, V2 o V3)', f:c=>_z(c,'cara')},
    {p:6, t:'Paroxismos de segundos, tipo descarga eléctrica', f:c=>_d(c,'electrico')},
    {p:4, t:'Desencadenado por hablar, masticar, lavarse la cara o el viento', f:c=>/hablar|mastic|comer|lavar|afeit|cepill|viento|frio|tocar/i.test(c.empeora||'')},
    {p:3, t:'Estrictamente unilateral', f:c=>!c.bilateral},
    {p:3, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:2, t:'Períodos libres de dolor entre las crisis', f:c=>c.patron==='intermitente'}
  ],
  excluye:[
    {t:'Dolor facial bilateral: la neuralgia del trigémino clásica es estrictamente unilateral (ICHD-3)',
     f:c=>c.bilateral},
    {t:'Dolor continuo sin períodos libres: el cuadro clásico es paroxístico',
     f:c=>c.patron==='constante' && !c.desc.has('electrico')}
  ],
  estudios:[
    {t:'RMN de cerebro con secuencias finas de fosa posterior', cuando:'SIEMPRE',
     nota:'Busca compresión neurovascular y descarta causa secundaria. En menores de 40 años o ' +
          'con déficit sensitivo, la esclerosis múltiple y el tumor de ángulo pontocerebeloso ' +
          'son obligatorios de descartar.'},
    {t:'Evaluación odontológica', cuando:'antes de rotular, para descartar patología dentaria'}
  ],
  tratamiento:{
    objetivo:'Suprimir los paroxismos. La respuesta a carbamazepina apoya el diagnóstico.',
    noFarmacologico:['Identificar y evitar zonas gatillo','Apoyo nutricional si no puede comer'],
    primeraLinea:[
      {farmaco:'carbamazepina', nota:'PRIMERA ELECCIÓN. Iniciar 100 mg cada 12 h y titular. Controlar hepatograma, hemograma y natremia'},
      {farmaco:'oxcarbazepina', nota:'Mejor tolerada, menos interacciones; vigilar hiponatremia'}
    ],
    segundaLinea:[{farmaco:'lamotrigina'},{farmaco:'baclofeno'},{farmaco:'pregabalina'}],
    tercera:[{farmaco:'toxina_botulinica'}],
    evitar:['Opioides: son ineficaces en la neuralgia del trigémino']
  },
  procedimientos:['bloqueo_trigemino','radiofrecuencia_gasser','descompresion_microvascular'],
  controles:{frecuencia:'2 a 4 semanas durante la titulación', escalas:['nrs','pgic'],
             que:'Número de paroxismos por día, tolerancia al fármaco y laboratorio de control.'},
  banderas:['Déficit sensitivo objetivo en el territorio: sospecha de causa secundaria',
            'Bilateralidad: sospecha de esclerosis múltiple','Menor de 40 años'],
  referencias:['Bendtsen L. et al., European Academy of Neurology guideline, Eur J Neurol 2019','IHS ICHD-3']
}

];

/* ======================================================================= */
/* NEUROPATIAS PERIFERICAS                                                 */
/* ======================================================================= */

SINDROMES.push(

{
  id:'neuropatia_diabetica',
  nombre:'Polineuropatía diabética dolorosa',
  grupo:'Neuropatías',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'neuropatico',
  resumen:'Distribución en guante y calcetín, simétrica y de comienzo distal. ' +
          'El control glucémico previene la progresión pero no alivia el dolor ' +
          'ya instalado: son dos objetivos distintos y hay que tratarlos aparte.',
  topografia:{t:'Requiere dolor en extremidades distales', f:c=>_z(c,'pie','pierna','pantorrilla','mano','antebrazo')},
  reglas:[
    {p:6, t:'Diabetes conocida', f:c=>_a(c,'diabetes')},
    {p:5, t:'Dolor distal y simétrico en ambos pies o piernas', f:c=>c.bilateral&&_z(c,'pie','pierna','pantorrilla')},
    {p:4, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:4, t:'Quemazón, hormigueo o adormecimiento', f:c=>_d(c,'quemante','hormigueo')},
    {p:3, t:'Empeora de noche', f:c=>/noche|nocturn|acostad|dormir/i.test(c.peorMomento||'')},
    {p:2, t:'Hipoestesia distal en el examen', f:c=>c.signos.has('hipoestesia')},
    {p:2, t:'Reflejo aquiliano abolido', f:c=>c.signos.has('rot_disminuido')}
  ],
  excluye:[
    {t:'Sin diabetes conocida no es una polineuropatía diabética',
     f:c=>!_a(c,'diabetes')},
    {t:'Distribución unilateral y concentrada en una sola raíz: eso es una radiculopatía, no una polineuropatía simétrica',
     f:c=>!c.bilateral && c.raiz && c.raiz.proporcion>=50}
  ],
  estudios:[
    {t:'Hemoglobina glicosilada y glucemia', cuando:'siempre, y en el seguimiento'},
    {t:'Vitamina B12, TSH, hepatograma, función renal, proteinograma', cuando:'siempre',
     nota:'No todo hormigueo en un diabético es diabético. El déficit de B12 (frecuente con metformina), ' +
          'el hipotiroidismo y la gammapatía monoclonal son causas tratables que se pierden si no se buscan.'},
    {t:'Electromiograma', cuando:'si es asimétrico, de comienzo proximal o de progresión rápida'},
    {t:'Examen del pie con monofilamento y diapasón', cuando:'en cada control, por el riesgo de pie diabético'}
  ],
  tratamiento:{
    objetivo:'Bajar el dolor 30-50% y proteger el pie. La remisión completa es excepcional.',
    noFarmacologico:['Control glucémico estricto (previene progresión, no alivia el dolor actual)',
                     'Cuidado y examen diario del pie','Calzado adecuado','Ejercicio aeróbico regular'],
    primeraLinea:[
      {farmaco:'duloxetina', nota:'La de mejor perfil en neuropatía diabética; aprobada específicamente para esta indicación'},
      {farmaco:'pregabalina'},
      {farmaco:'amitriptilina', nota:'Eficaz y barata; cuidado en mayores de 65 y en cardiopatía'}
    ],
    segundaLinea:[{farmaco:'gabapentina'},{farmaco:'venlafaxina'},{farmaco:'capsaicina_alta'}],
    tercera:[{farmaco:'tramadol'},{farmaco:'tapentadol'},{farmaco:'lidocaina_parche', nota:'Si hay alodinia localizada'}],
    evitar:['Opioides potentes de mantenimiento: sin evidencia de beneficio a largo plazo y con daño demostrado']
  },
  procedimientos:['estimulacion_medular'],
  controles:{frecuencia:'4 semanas en titulación, luego cada 3 meses', escalas:['nrs','dn4','isi','bpi'],
             que:'Dolor nocturno, sueño, examen del pie y hemoglobina glicosilada.'},
  banderas:['Úlcera o infección del pie','Progresión rápida o asimétrica: replantear el diagnóstico',
            'Compromiso motor precoz: pensar en otra neuropatía'],
  referencias:['NeuPSIG / Finnerup NB. et al., Lancet Neurol 2025','ADA, estándares de atención en diabetes']
},

{
  id:'neuralgia_postherpetica',
  nombre:'Neuralgia postherpética',
  grupo:'Neuropatías',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'neuropatico',
  resumen:'Dolor que persiste más de 3 meses después de la erupción de herpes ' +
          'zóster, en el mismo dermatoma. La alodinia suele ser lo que más ' +
          'incapacita: no toleran ni la ropa.',
  topografia:{t:'Requiere dolor en una zona corporal marcada', f:c=>c.zonas.length>0},
  reglas:[
    {p:7, t:'Antecedente de herpes zóster en la zona dolorosa', f:c=>_a(c,'herpes')},
    {p:5, t:'Dolor limitado a un dermatoma', f:c=>c.raiz&&c.raiz.proporcion>=50&&!c.bilateral},
    {p:4, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:4, t:'Alodinia: no tolera el roce de la ropa', f:c=>c.signos.has('alodinia')},
    {p:3, t:'Quemazón continua con paroxismos', f:c=>_d(c,'quemante','electrico')},
    {p:2, t:'Edad mayor a 60 años', f:c=>c.edad>=60}
  ],
  excluye:[
    {t:'Sin antecedente de herpes zóster en la zona', f:c=>!_a(c,'herpes')}
  ],
  estudios:[
    {t:'Ninguno de rutina: el diagnóstico es clínico', cuando:'siempre'},
    {t:'Serología VIH y evaluación de inmunidad', cuando:'si el zóster fue multimetamérico, recurrente o en menor de 50 años'}
  ],
  tratamiento:{
    objetivo:'Controlar la alodinia y recuperar el sueño. Mejora lentamente a lo largo de meses.',
    noFarmacologico:['Ropa suelta y de algodón sobre la zona','Protección de la zona con apósito si la alodinia es severa'],
    primeraLinea:[{farmaco:'pregabalina'},{farmaco:'gabapentina'},{farmaco:'amitriptilina'},{farmaco:'nortriptilina'}],
    segundaLinea:[
      {farmaco:'lidocaina_parche', nota:'De elección cuando la alodinia es el síntoma dominante y está bien localizada'},
      {farmaco:'capsaicina_alta', nota:'Parche al 8%: una aplicación puede dar 3 meses de alivio'}
    ],
    tercera:[{farmaco:'tramadol'},{farmaco:'oxicodona', nota:'Solo si falló todo lo anterior, con plan de retiro escrito desde el inicio'}],
    evitar:['Corticoides sistémicos, que no previenen ni tratan la neuralgia ya instalada']
  },
  procedimientos:['bloqueo_intercostal','bloqueo_simpatico','radiofrecuencia_pulsada'],
  controles:{frecuencia:'4 semanas', escalas:['nrs','dn4','isi'], que:'Alodinia, sueño y tolerancia a la ropa.'},
  banderas:['Zóster oftálmico con compromiso ocular','Zóster diseminado en inmunocomprometido'],
  referencias:['NeuPSIG 2025','La vacuna recombinante contra zóster previene el zóster y la neuralgia: ' +
               'ofrecerla a todo paciente mayor de 50 años']
},

{
  id:'dolor_postquirurgico_cronico',
  nombre:'Dolor postquirúrgico crónico',
  grupo:'Neuropatías',
  icd:{cod:'MG30.20', txt:'Dolor postquirúrgico crónico'},
  mecanismo:'mixto',
  resumen:'Dolor que aparece o se intensifica después de una cirugía, persiste ' +
          'más de 3 meses y no se explica por otra causa. Toracotomía, ' +
          'mastectomía, hernioplastia inguinal y amputación son las cirugías ' +
          'de mayor incidencia. Como anestesiólogo tenés además la ventana ' +
          'de prevenirlo en el quirófano.',
  reglas:[
    {p:6, t:'Cirugía en la zona dolorosa', f:c=>_a(c,'cirugia')},
    {p:4, t:'El dolor empezó después de esa cirugía y persiste más de 3 meses', f:c=>_a(c,'cirugia')&&c.meses>=3},
    {p:4, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:3, t:'Dolor sobre la cicatriz o en su territorio nervioso', f:c=>c.signos.has('dolor_cicatriz')},
    {p:3, t:'Alodinia o hipoestesia en la zona', f:c=>c.signos.has('alodinia')||c.signos.has('hipoestesia')},
    {p:2, t:'Quemazón o descargas eléctricas', f:c=>_d(c,'quemante','electrico')}
  ],
  excluye:[
    {t:'Sin cirugía previa en la zona dolorosa', f:c=>!_a(c,'cirugia','cirugia_columna','cirugia_torax','cirugia_mama','amputacion')}
  ],
  estudios:[
    {t:'Ecografía de partes blandas', cuando:'si se sospecha neuroma, malla o colección'},
    {t:'TC o RMN de la región', cuando:'para descartar recidiva tumoral o complicación quirúrgica'},
    {t:'Bloqueo diagnóstico del nervio sospechado', cuando:'confirma el generador y anticipa la respuesta a la ablación'}
  ],
  tratamiento:{
    objetivo:'Identificar el nervio comprometido. Cuando hay un nervio único, el pronóstico cambia por completo.',
    noFarmacologico:['Desensibilización de la cicatriz','Kinesiología y movilización precoz de la zona'],
    primeraLinea:[{farmaco:'pregabalina'},{farmaco:'duloxetina'},{farmaco:'amitriptilina'}],
    segundaLinea:[{farmaco:'lidocaina_parche'},{farmaco:'gabapentina'},{farmaco:'capsaicina_alta'}],
    tercera:[{farmaco:'tramadol'}],
    evitar:['Opioides crónicos sin plan de retiro']
  },
  procedimientos:['bloqueo_intercostal','bloqueo_pared_abdominal','bloqueo_pecs','radiofrecuencia_pulsada','crioablacion'],
  controles:{frecuencia:'6 semanas', escalas:['nrs','dn4','bpi'], que:'Territorio, alodinia y función del segmento.'},
  banderas:['Sospecha de recidiva tumoral en cirugía oncológica','Signos de infección de malla o material protésico'],
  referencias:['Schug SA. et al., IASP ICD-11 chronic postsurgical pain, Pain 2019',
               'Prevención: analgesia multimodal, anestesia regional y evitar el dolor agudo severo postoperatorio']
},

{
  id:'miembro_fantasma',
  nombre:'Dolor de miembro fantasma y dolor del muñón',
  grupo:'Neuropatías',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'neuropatico',
  resumen:'Son dos cosas distintas y conviene separarlas: el dolor fantasma se ' +
          'siente en la parte que ya no está; el dolor del muñón se siente en ' +
          'el muñón. El tratamiento no es el mismo.',
  reglas:[
    {p:8, t:'Amputación previa', f:c=>_a(c,'amputacion')},
    {p:5, t:'Dolor referido al segmento ausente', f:c=>_tr(c,/fantasma|miembro que no|amputad|falta/i)},
    {p:4, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:3, t:'Descargas, calambres o sensación de posición forzada', f:c=>_d(c,'electrico','hormigueo')},
    {p:2, t:'Dolor a la palpación del muñón (posible neuroma)', f:c=>c.signos.has('tinel_positivo')}
  ],
  excluye:[
    {t:'Sin amputación previa', f:c=>!_a(c,'amputacion')}
  ],
  estudios:[
    {t:'Ecografía del muñón', cuando:'para buscar neuroma, que es palpable y bloqueable'},
    {t:'Evaluación de la prótesis y del encaje', cuando:'siempre, porque un encaje mal ajustado genera dolor que ningún fármaco arregla'}
  ],
  tratamiento:{
    objetivo:'Distinguir fantasma de muñón y tratar cada uno por separado.',
    noFarmacologico:[
      'Terapia con espejo, con evidencia razonable en dolor fantasma',
      'Imaginería motora graduada',
      'Desensibilización y uso precoz de la prótesis'
    ],
    primeraLinea:[{farmaco:'pregabalina'},{farmaco:'gabapentina'},{farmaco:'amitriptilina'}],
    segundaLinea:[{farmaco:'duloxetina'},{farmaco:'lidocaina_parche', nota:'Para el dolor del muñón, no para el fantasma'}],
    tercera:[{farmaco:'ketamina_ev'},{farmaco:'metadona', nota:'Por su acción antagonista NMDA, en casos refractarios'}],
    evitar:[]
  },
  procedimientos:['bloqueo_neuroma','radiofrecuencia_pulsada','estimulacion_medular'],
  controles:{frecuencia:'6 semanas', escalas:['nrs','dn4','pgic'], que:'Separar en la evolución el dolor fantasma del dolor del muñón.'},
  banderas:['Úlcera o infección del muñón','Dolor isquémico en el muñón'],
  referencias:['NeuPSIG 2025','Terapia con espejo: Chan BL. et al., N Engl J Med 2007']
},

{
  id:'cipn',
  nombre:'Neuropatía dolorosa inducida por quimioterapia',
  grupo:'Neuropatías',
  icd:{cod:'MG30.11', txt:'Dolor crónico posterior al tratamiento oncológico'},
  mecanismo:'neuropatico',
  resumen:'Distal, simétrica, en guante y calcetín, aparece durante o después ' +
          'de los platinos, taxanos, alcaloides de la vinca o bortezomib. La ' +
          'duloxetina es el único fármaco con evidencia positiva de calidad.',
  topografia:{t:'Requiere dolor en manos o pies', f:c=>_z(c,'pie','mano','pierna','antebrazo','pantorrilla')},
  reglas:[
    {p:7, t:'Quimioterapia con agente neurotóxico', f:c=>_a(c,'quimioterapia')},
    {p:5, t:'Dolor distal y simétrico en manos o pies', f:c=>c.bilateral&&_z(c,'pie','mano','pierna','antebrazo')},
    {p:4, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:3, t:'Quemazón, hormigueo o adormecimiento', f:c=>_d(c,'quemante','hormigueo')},
    {p:2, t:'Empeora con el frío (típico del oxaliplatino)', f:c=>/frio|helad|hielo|freezer/i.test(c.empeora||'')}
  ],
  excluye:[
    {t:'Sin exposición a quimioterapia neurotóxica', f:c=>!_a(c,'quimioterapia')}
  ],
  estudios:[
    {t:'Revisión del esquema oncológico y dosis acumulada', cuando:'siempre'},
    {t:'Vitamina B12, TSH, función renal', cuando:'para descartar causas concurrentes'},
    {t:'Electromiograma', cuando:'si es asimétrica o hay compromiso motor'}
  ],
  tratamiento:{
    objetivo:'Aliviar y proteger la función manual y la marcha. Comunicar al oncólogo: puede requerir ajuste de dosis.',
    noFarmacologico:['Ejercicio y equilibrio, con buena evidencia preventiva','Terapia ocupacional para la destreza fina',
                     'Prevención de caídas'],
    primeraLinea:[{farmaco:'duloxetina', nota:'ÚNICO fármaco con recomendación positiva en las guías ASCO'}],
    segundaLinea:[{farmaco:'pregabalina'},{farmaco:'gabapentina'},{farmaco:'amitriptilina'}],
    tercera:[{farmaco:'lidocaina_parche'},{farmaco:'capsaicina_alta'}],
    evitar:['Suplementos de calcio y magnesio en profilaxis: no funcionan',
            'Acetil-L-carnitina: empeora la neuropatía, no la previene']
  },
  procedimientos:[],
  controles:{frecuencia:'4 a 6 semanas durante el tratamiento oncológico', escalas:['nrs','dn4','bpi','ecog'],
             que:'Destreza manual, marcha y caídas.'},
  banderas:['Progresión tras terminar la quimioterapia: replantear el diagnóstico','Compromiso motor significativo'],
  referencias:['Loprinzi CL. et al., ASCO guideline update, J Clin Oncol 2020']
},

{
  id:'tunel_carpiano',
  nombre:'Síndrome del túnel carpiano',
  grupo:'Neuropatías',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'neuropatico',
  resumen:'Atrapamiento del nervio mediano en la muñeca. Se confunde con ' +
          'radiculopatía C6-C7; la diferencia está en el territorio y en que ' +
          'el túnel carpiano despierta de noche y se alivia sacudiendo la mano.',
  topografia:{t:'Requiere dolor en mano o antebrazo', f:c=>_z(c,'mano','antebrazo')},
  reglas:[
    {p:6, t:'Dolor y parestesias en la mano', f:c=>_z(c,'mano')},
    {p:5, t:'Despierta de noche y se alivia sacudiendo la mano', f:c=>/noche|nocturn|madrugad/i.test(c.peorMomento||'')&&_z(c,'mano')},
    {p:4, t:'Signo de Tinel o Phalen positivo', f:c=>c.signos.has('tinel_positivo')||c.signos.has('phalen')},
    {p:3, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:3, t:'Hormigueo en los tres primeros dedos', f:c=>_d(c,'hormigueo')},
    {p:2, t:'Antecedente de hipotiroidismo, embarazo, diabetes o artritis reumatoidea', f:c=>_a(c,'hipotiroidismo','embarazo','diabetes','artritis')}
  ],
  estudios:[
    {t:'Electromiograma con velocidad de conducción', cuando:'confirma y gradúa la severidad; obligatorio antes de cirugía'},
    {t:'Ecografía del nervio mediano', cuando:'alternativa accesible, mide el área de sección del nervio'},
    {t:'TSH y glucemia', cuando:'siempre, son causas corregibles'}
  ],
  tratamiento:{
    objetivo:'Evitar la atrofia tenar. Cuando hay atrofia, la ventana quirúrgica ya se está cerrando.',
    noFarmacologico:['Férula nocturna en posición neutra, de primera elección en casos leves y moderados',
                     'Modificación de la actividad y ergonomía'],
    primeraLinea:[{farmaco:'aine', nota:'Alivio sintomático limitado'}],
    segundaLinea:[{farmaco:'pregabalina'},{farmaco:'gabapentina'}],
    tercera:[],
    evitar:['Demorar la derivación quirúrgica si hay déficit motor o atrofia']
  },
  procedimientos:['infiltracion_tunel_carpiano','hidrodiseccion'],
  controles:{frecuencia:'6 a 8 semanas', escalas:['nrs','dn4'], que:'Síntomas nocturnos, fuerza de pinza y trofismo tenar.'},
  banderas:['Atrofia de la eminencia tenar o debilidad de la abducción del pulgar: derivación quirúrgica'],
  referencias:['AAOS, guía de síndrome del túnel carpiano']
},

{
  id:'sdrc',
  nombre:'Síndrome de dolor regional complejo (SDRC tipo I y II)',
  grupo:'Neuropatías',
  icd:{cod:'MG30.04', txt:'Síndrome de dolor regional complejo'},
  mecanismo:'mixto',
  resumen:'Dolor desproporcionado al evento desencadenante, con signos ' +
          'autonómicos, sensitivos, motores y tróficos en un territorio que no ' +
          'respeta ningún nervio. Es tiempo-dependiente: cuanto antes se trata, ' +
          'mejor el resultado. Perder tres meses cambia el pronóstico.',
  topografia:{t:'Requiere dolor en un miembro', f:c=>_z(c,'mano','pie','antebrazo','brazo','pierna','pantorrilla','muslo','rodilla','hombro')},
  reglas:[
    {p:6, t:'Dolor desproporcionado al evento desencadenante', f:c=>c.nrsPromedio>=6&&_a(c,'trauma','cirugia','fractura','inmovilizacion')},
    {p:5, t:'Cambios de color o temperatura en la zona', f:c=>c.signos.has('cambio_color')||c.signos.has('cambio_temperatura')},
    {p:5, t:'Edema o cambios en la sudoración', f:c=>c.signos.has('edema')||c.signos.has('sudoracion')},
    {p:4, t:'Alodinia o hiperalgesia', f:c=>c.signos.has('alodinia')||c.signos.has('hiperalgesia')},
    {p:4, t:'Cambios tróficos: piel, uñas o vello', f:c=>c.signos.has('cambios_troficos')},
    {p:3, t:'Limitación del rango de movimiento, temblor o distonía', f:c=>c.signos.has('rigidez_articular')||c.signos.has('temblor')},
    {p:3, t:'Distribución regional que no sigue un territorio nervioso', f:c=>c.dist==='regional'&&(!c.raiz||c.raiz.proporcion<40)},
    {p:2, t:'Distal a un traumatismo o inmovilización', f:c=>_z(c,'mano','pie')}
  ],
  criterios:'CRITERIOS DE BUDAPEST (IASP). Requiere: 1) dolor continuo desproporcionado; ' +
            '2) al menos un SÍNTOMA referido en 3 de las 4 categorías (sensitiva, vasomotora, ' +
            'sudomotora/edema, motora/trófica); 3) al menos un SIGNO observado en 2 de esas ' +
            '4 categorías; 4) ningún otro diagnóstico que lo explique mejor.',
  excluye:[
    {t:'Sin evento desencadenante (trauma, cirugía, fractura o inmovilización)', f:c=>!_a(c,'trauma','cirugia','fractura','inmovilizacion','amputacion')}
  ],
  estudios:[
    {t:'Radiografía comparativa de ambos miembros', cuando:'puede mostrar osteopenia moteada, pero su ausencia no descarta'},
    {t:'Centellograma óseo trifásico', cuando:'apoya en fases tempranas; su valor cae después de los 6 meses'},
    {t:'Termografía comparativa', cuando:'si está disponible, documenta la asimetría térmica'},
    {t:'El diagnóstico es CLÍNICO, por criterios de Budapest', cuando:'ningún estudio lo confirma ni lo descarta'}
  ],
  tratamiento:{
    objetivo:'Restaurar la función del miembro. La rehabilitación es el tratamiento; lo demás es para que la rehabilitación sea posible.',
    noFarmacologico:[
      'Rehabilitación funcional PRECOZ e intensiva: es la piedra angular',
      'Imaginería motora graduada y terapia con espejo',
      'Desensibilización progresiva',
      'Abordaje psicológico, casi siempre necesario'
    ],
    primeraLinea:[{farmaco:'pregabalina'},{farmaco:'gabapentina'},{farmaco:'amitriptilina'}],
    segundaLinea:[
      {farmaco:'bifosfonatos', nota:'Con evidencia en la fase temprana, dentro de los primeros 6 meses'},
      {farmaco:'corticoide_oral', nota:'Ciclo corto en la fase aguda inflamatoria'},
      {farmaco:'vitamina_c', nota:'500 mg/día por 50 días previene el SDRC tras fractura de muñeca'}
    ],
    tercera:[{farmaco:'ketamina_ev'},{farmaco:'baclofeno', nota:'Intratecal, si hay distonía'}],
    evitar:['Inmovilizar el miembro','Demorar la rehabilitación esperando que el dolor baje primero']
  },
  procedimientos:['bloqueo_simpatico','ganglio_estrellado','simpatico_lumbar','estimulacion_medular'],
  controles:{frecuencia:'2 a 4 semanas al inicio: es un cuadro que exige seguimiento estrecho',
             escalas:['nrs','dn4','pcs','pgic'],
             que:'Rango de movilidad, uso funcional del miembro, temperatura y trofismo.'},
  banderas:['Progresión proximal o al miembro contralateral','Distonía fija establecida'],
  referencias:['Harden RN. et al., criterios de Budapest, Pain Med 2007',
               'Harden RN. et al., CRPS Practical Diagnostic and Treatment Guidelines, 5ª edición, Pain Med 2022']
},

{
  id:'meralgia',
  nombre:'Meralgia parestésica',
  grupo:'Neuropatías',
  icd:{cod:'MG30.50', txt:'Dolor neuropático periférico crónico'},
  mecanismo:'neuropatico',
  resumen:'Atrapamiento del nervio femorocutáneo lateral bajo el ligamento ' +
          'inguinal. Puramente sensitivo: si hay debilidad, no es esto.',
  topografia:{t:'Requiere dolor en muslo o región inguinal', f:c=>_z(c,'muslo','inguinal')},
  reglas:[
    {p:7, t:'Dolor y parestesias en cara anterolateral del muslo', f:c=>_z(c,'muslo')&&!c.bilateral},
    {p:4, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:4, t:'Sin debilidad ni alteración de los reflejos', f:c=>!c.signos.has('debilidad')&&!c.signos.has('rot_disminuido')},
    {p:3, t:'Quemazón o adormecimiento', f:c=>_d(c,'quemante','hormigueo')},
    {p:3, t:'Empeora al estar de pie o caminar, mejora al sentarse', f:c=>/pie|camin|parad/i.test(c.empeora||'')},
    {p:2, t:'Obesidad, embarazo, cinturón o ropa ajustada', f:c=>_a(c,'obesidad','embarazo')}
  ],
  excluye:[
    {t:'Reflejo rotuliano abolido o debilidad: el femorocutáneo es puramente sensitivo, así que eso ya no es una meralgia',
     f:c=>c.signos.has('rot_disminuido')||c.signos.has('debilidad')},
    {t:'Dolor irradiado por debajo de la rodilla: excede el territorio del femorocutáneo lateral',
     f:c=>c.irradiaPierna}
  ],
  estudios:[
    {t:'Ninguno si la clínica es típica', cuando:'la mayoría de los casos'},
    {t:'RMN de columna lumbar', cuando:'para descartar radiculopatía L2-L3 si hay dudas'},
    {t:'Ecografía del nervio femorocutáneo lateral', cuando:'guía la infiltración'}
  ],
  tratamiento:{
    objetivo:'Quitar la causa compresiva. Muchos se resuelven solo con eso.',
    noFarmacologico:['Aflojar cinturón y ropa ajustada','Descenso de peso','Evitar bipedestación prolongada'],
    primeraLinea:[{farmaco:'pregabalina'},{farmaco:'gabapentina'}],
    segundaLinea:[{farmaco:'amitriptilina'},{farmaco:'lidocaina_parche'}],
    tercera:[],
    evitar:[]
  },
  procedimientos:['bloqueo_femorocutaneo','radiofrecuencia_pulsada'],
  controles:{frecuencia:'6 semanas', escalas:['nrs','dn4'], que:'Territorio y tolerancia a la bipedestación.'},
  banderas:['Debilidad del cuádriceps o reflejo rotuliano abolido: no es meralgia, es radiculopatía'],
  referencias:['Cheatham SW. et al., Int J Sports Phys Ther 2013']
},

{
  id:'dolor_central',
  nombre:'Dolor neuropático central (post-ACV, medular, esclerosis múltiple)',
  grupo:'Neuropatías',
  icd:{cod:'MG30.51', txt:'Dolor neuropático central crónico'},
  mecanismo:'neuropatico',
  resumen:'Dolor por lesión del sistema somatosensorial central. Suele ' +
          'aparecer meses después del evento, lo que hace que no se lo ' +
          'relacione. Responde peor que el neuropático periférico y la meta ' +
          'realista es un alivio parcial.',
  reglas:[
    {p:7, t:'Antecedente de ACV, lesión medular o esclerosis múltiple', f:c=>_a(c,'acv','lesion_medular','esclerosis')},
    {p:5, t:'Dolor en el territorio corporal afectado por la lesión', f:c=>c.dn4>=4},
    {p:4, t:'Quemazón, frío doloroso o disestesias', f:c=>_d(c,'quemante')},
    {p:3, t:'Alodinia o hiperalgesia en el hemicuerpo o por debajo del nivel lesional', f:c=>c.signos.has('alodinia')},
    {p:3, t:'Distribución que no corresponde a ninguna raíz ni nervio periférico', f:c=>!c.raiz||c.raiz.proporcion<35}
  ],
  excluye:[
    {t:'Sin lesión documentada del sistema nervioso central', f:c=>!_a(c,'acv','lesion_medular','esclerosis')}
  ],
  estudios:[
    {t:'RMN de cerebro o médula', cuando:'para documentar la lesión, que es lo que da el grado de neuropático DEFINIDO'},
    {t:'Evaluación de espasticidad', cuando:'siempre: la espasticidad genera dolor propio y se trata aparte'}
  ],
  tratamiento:{
    objetivo:'Alivio parcial y sostenido. Prometer más que eso es fijar una expectativa que no se va a cumplir.',
    noFarmacologico:['Rehabilitación','Manejo de la espasticidad','Abordaje psicológico'],
    primeraLinea:[{farmaco:'pregabalina'},{farmaco:'gabapentina'},{farmaco:'amitriptilina'},{farmaco:'duloxetina'}],
    segundaLinea:[{farmaco:'lamotrigina'},{farmaco:'cannabinoides', nota:'Con evidencia en dolor por esclerosis múltiple; en Argentina bajo Ley 27.350'}],
    tercera:[{farmaco:'ketamina_ev'}],
    evitar:['Opioides potentes: son particularmente poco eficaces en el dolor central']
  },
  procedimientos:['estimulacion_medular','bomba_intratecal'],
  controles:{frecuencia:'6 a 8 semanas', escalas:['nrs','dn4','isi','phq9'], que:'Sueño, ánimo y tolerancia al fármaco.'},
  banderas:['Siringomielia postraumática en lesionado medular: dolor ascendente y déficit nuevo, exige RMN urgente'],
  referencias:['NeuPSIG 2025','Widerström-Noga E. et al., dolor en lesión medular']
},

/* ======================================================================= */
/* NOCIPLASTICO Y MUSCULOESQUELETICO                                       */
/* ======================================================================= */

{
  id:'fibromialgia',
  nombre:'Fibromialgia',
  grupo:'Nociplástico',
  icd:{cod:'MG30.01', txt:'Dolor crónico generalizado'},
  mecanismo:'nociplastico',
  resumen:'Dolor generalizado con fatiga, sueño no reparador y síntomas ' +
          'cognitivos. No es un diagnóstico de exclusión ni de descarte: tiene ' +
          'criterios positivos y puede coexistir con cualquier otra enfermedad. ' +
          'El ejercicio es el único tratamiento con evidencia fuerte.',
  topografia:{t:'Requiere dolor en dolor en más de una región', f:c=>c.zonas.length>=3},
  reglas:[
    {p:6, t:'Dolor generalizado en 4 o más de las 5 áreas corporales', f:c=>c.dist==='generalizada'},
    {p:5, t:'Índice de dolor generalizado (WPI) igual o mayor a 7', f:c=>c.wpi>=7},
    {p:4, t:'Fatiga, sueño no reparador y dificultad de concentración', f:c=>c.sss>=5},
    {p:4, t:'Evolución mayor a 3 meses', f:c=>c.meses>=3},
    {p:3, t:'CSI igual o mayor a 40', f:c=>c.csi>=40},
    {p:3, t:'Hipersensibilidad a luz, ruidos u olores', f:c=>c.signos.has('hipersensibilidad_estimulos')},
    {p:2, t:'Estudios previos normales pese a la magnitud de los síntomas', f:c=>c.tratamientosFallidos>=2},
    {p:2, t:'DN4 sin patrón neuropático focal', f:c=>c.dn4!=null&&c.dn4<4}
  ],
  criterios:'ACR 2016: (WPI ≥7 y SSS ≥5) o bien (WPI 4-6 y SSS ≥9), con dolor en al ' +
            'menos 4 de 5 regiones, presente ≥3 meses. El diagnóstico es válido aunque ' +
            'exista otra enfermedad que también explique dolor.',
  estudios:[
    {t:'Hemograma, VSG, PCR, TSH, CPK', cuando:'una sola vez, para descartar lo tratable',
     nota:'Repetir estudios normales una y otra vez refuerza la idea de que hay algo oculto y ' +
          'empeora el cuadro. Se estudia una vez, bien, y se cierra la pregunta.'},
    {t:'Vitamina D, ferritina, B12', cuando:'si hay fatiga marcada'},
    {t:'Nada de imágenes de rutina', cuando:'salvo bandera roja o hallazgo focal en el examen'}
  ],
  tratamiento:{
    objetivo:'Función, sueño y actividad. El objetivo NO es dolor cero: fijarlo así garantiza el fracaso.',
    noFarmacologico:[
      'EJERCICIO AERÓBICO PROGRESIVO: la única intervención con recomendación fuerte de EULAR',
      'Educación en dolor y explicación del mecanismo nociplástico',
      'Terapia cognitivo-conductual',
      'Higiene del sueño y tratamiento del insomnio',
      'Ejercicio en agua templada, con buena adherencia'
    ],
    primeraLinea:[
      {farmaco:'amitriptilina', nota:'10 a 25 mg nocturnos. Dosis bajas, apuntando al sueño'},
      {farmaco:'duloxetina', nota:'Útil sobre todo si hay depresión asociada'},
      {farmaco:'pregabalina', nota:'Mejora sueño y dolor; vigilar aumento de peso y edemas'}
    ],
    segundaLinea:[{farmaco:'ciclobenzaprina', nota:'Dosis baja nocturna'},{farmaco:'venlafaxina'}],
    tercera:[],
    evitar:[
      'OPIOIDES: contraindicados. Empeoran la fibromialgia y pueden producir hiperalgesia',
      'AINE como tratamiento de fondo: no funcionan en dolor nociplástico',
      'Corticoides',
      'Repetir estudios ya hechos'
    ]
  },
  procedimientos:['puntos_gatillo'],
  controles:{frecuencia:'8 a 12 semanas', escalas:['nrs','csi','pcs','pseq','isi','phq9','bpi'],
             que:'Adherencia al ejercicio, sueño y actividad. El dolor baja después de la función, no antes.'},
  banderas:['Fiebre, pérdida de peso o VSG muy elevada: buscar otra enfermedad',
            'Debilidad muscular objetiva o CPK elevada: pensar en miopatía'],
  referencias:['Macfarlane GJ. et al., EULAR revised recommendations, Ann Rheum Dis 2017',
               'Wolfe F. et al., criterios ACR 2016','Kosek E. et al., dolor nociplástico, Pain 2021']
},

{
  id:'miofascial',
  nombre:'Síndrome de dolor miofascial',
  grupo:'Nociplástico',
  icd:{cod:'MG30.02', txt:'Dolor musculoesquelético crónico primario'},
  mecanismo:'nociceptivo',
  resumen:'Dolor regional con puntos gatillo palpables que reproducen el dolor ' +
          'referido característico del músculo. Es frecuentísimo y suele ser ' +
          'secundario a otra cosa: buscar siempre el factor perpetuante.',
  topografia:{t:'Requiere dolor en una zona corporal marcada', f:c=>c.zonas.length>0},
  reglas:[
    {p:5, t:'Dolor regional, no generalizado', f:c=>c.dist==='regional'||c.dist==='localizada'},
    {p:5, t:'Punto gatillo palpable que reproduce el dolor del paciente', f:c=>c.signos.has('punto_gatillo')},
    {p:3, t:'Banda tensa palpable en el músculo', f:c=>c.signos.has('banda_tensa')},
    {p:3, t:'Dolor sordo, profundo, con sensación de contractura', f:c=>_d(c,'sordo','opresivo','rigidez')},
    {p:2, t:'Empeora con el estrés, el frío o la postura sostenida', f:c=>/estres|frio|postur|computadora|tension/i.test(c.empeora||'')},
    {p:2, t:'DN4 bajo', f:c=>c.dn4!=null&&c.dn4<4}
  ],
  estudios:[
    {t:'Ninguno: el diagnóstico es por palpación', cuando:'siempre'},
    {t:'Buscar el factor perpetuante', cuando:'siempre',
     nota:'Postura laboral, dismetría de miembros, hipotiroidismo, déficit de vitamina D o hierro, ' +
          'bruxismo, trastorno del sueño. Si no se corrige, los puntos gatillo vuelven.'}
  ],
  tratamiento:{
    objetivo:'Desactivar el punto gatillo y corregir lo que lo generó.',
    noFarmacologico:['Estiramiento con spray frío','Kinesiología y ejercicio postural','Punción seca',
                     'Corrección ergonómica','Tratamiento del sueño'],
    primeraLinea:[{farmaco:'aine'},{farmaco:'ciclobenzaprina', nota:'Ciclos cortos'}],
    segundaLinea:[{farmaco:'amitriptilina', nota:'Dosis baja nocturna, sobre todo si hay mal dormir'}],
    tercera:[],
    evitar:['Opioides','Infiltrar sin corregir el factor perpetuante: vuelve siempre']
  },
  procedimientos:['puntos_gatillo','toxina_botulinica'],
  controles:{frecuencia:'4 a 6 semanas', escalas:['nrs','bpi'], que:'Número de puntos gatillo activos y rango de movilidad.'},
  banderas:[],
  referencias:['Simons DG, Travell JG. Myofascial Pain and Dysfunction']
},

{
  id:'artrosis',
  nombre:'Dolor por artrosis de rodilla o cadera',
  grupo:'Musculoesquelético',
  icd:{cod:'MG30.31', txt:'Dolor musculoesquelético secundario por cambios estructurales'},
  mecanismo:'nociceptivo',
  resumen:'Dolor mecánico articular. Un tercio de los pacientes con artrosis ' +
          'avanzada desarrolla además sensibilización central, y ese subgrupo ' +
          'no mejora con la prótesis: conviene detectarlo antes de operar.',
  topografia:{t:'Requiere dolor en la rodilla o en la cadera', f:c=>_z(c,'rodilla','poplitea','inguinal')},
  reglas:[
    {p:5, t:'Dolor en rodilla o cadera', f:c=>_z(c,'rodilla','poplitea','inguinal')},
    {p:4, t:'Empeora con la carga y mejora con el reposo', f:c=>/camin|escaler|carga|pie|parad|levantar/i.test(c.empeora||'')&&/repos|sentar|acostar/i.test(c.alivia||'')},
    {p:3, t:'Rigidez matinal menor a 30 minutos', f:c=>_d(c,'rigidez')},
    {p:3, t:'Edad mayor a 50 años', f:c=>c.edad>=50},
    {p:2, t:'Crepitación y limitación del rango articular', f:c=>c.signos.has('crepitacion')||c.signos.has('rigidez_articular')},
    {p:2, t:'Sobrepeso u obesidad', f:c=>_a(c,'obesidad')},
    {p:2, t:'DN4 bajo', f:c=>c.dn4!=null&&c.dn4<4}
  ],
  estudios:[
    {t:'Radiografía de la articulación con carga', cuando:'de pie, porque acostado se subestima el pinzamiento'},
    {t:'CSI', cuando:'antes de indicar una prótesis',
     nota:'Un CSI alto predice mal resultado del reemplazo articular. Vale la pena saberlo antes.'},
    {t:'RMN', cuando:'rara vez necesaria; solo si se sospecha necrosis avascular o lesión meniscal quirúrgica'}
  ],
  tratamiento:{
    objetivo:'Función y peso. El ejercicio y el descenso de peso superan a cualquier fármaco.',
    noFarmacologico:[
      'EJERCICIO: fortalecimiento y aeróbico. Recomendación fuerte en todas las guías',
      'Descenso de peso: cada kilo menos son cuatro kilos menos en la rodilla al caminar',
      'Educación y automanejo','Bastón del lado contralateral'
    ],
    primeraLinea:[
      {farmaco:'aine_topico', nota:'PRIMERA elección en rodilla y mano: misma eficacia que el oral con mucho menos riesgo sistémico'},
      {farmaco:'aine', nota:'Ciclos cortos, la dosis mínima eficaz'},
      {farmaco:'paracetamol', nota:'Efecto pequeño; útil como complemento'}
    ],
    segundaLinea:[{farmaco:'duloxetina', nota:'Con evidencia en artrosis, sobre todo si hay sensibilización central'}],
    tercera:[{farmaco:'tramadol', nota:'Beneficio pequeño y con efectos adversos frecuentes en el adulto mayor'}],
    evitar:['Opioides potentes','Condroitín y glucosamina: no modifican la enfermedad',
            'Artroscopia por artrosis o menisco degenerativo: sin beneficio sobre el tratamiento conservador']
  },
  procedimientos:['infiltracion_intraarticular','geniculares','radiofrecuencia_geniculares'],
  controles:{frecuencia:'3 meses', escalas:['nrs','bpi','csi'],
             que:'Distancia de marcha, escaleras y peso corporal.'},
  banderas:['Articulación caliente, roja y con fiebre: artritis séptica, urgencia',
            'Dolor nocturno de reposo intenso: descartar necrosis avascular o tumor'],
  referencias:['Kolasinski SL. et al., ACR/AF guideline, Arthritis Rheumatol 2020',
               'Bannuru RR. et al., OARSI guidelines, Osteoarthritis Cartilage 2019']
},

{
  id:'hombro_doloroso',
  nombre:'Hombro doloroso crónico y capsulitis adhesiva',
  grupo:'Musculoesquelético',
  icd:{cod:'MG30.3', txt:'Dolor musculoesquelético secundario crónico'},
  mecanismo:'nociceptivo',
  resumen:'La distinción clave es entre limitación por dolor y limitación real ' +
          'del rango pasivo. Si el rango pasivo está restringido en todas las ' +
          'direcciones, es capsulitis y el tratamiento cambia por completo.',
  topografia:{t:'Requiere dolor en hombro o brazo', f:c=>_z(c,'hombro','brazo','escapula')},
  reglas:[
    {p:6, t:'Dolor localizado en el hombro', f:c=>_z(c,'hombro')},
    {p:4, t:'Limitación del rango pasivo en todas las direcciones (capsulitis)', f:c=>c.signos.has('rango_pasivo_limitado')},
    {p:3, t:'Dolor nocturno al acostarse sobre ese lado', f:c=>/noche|acostad|dormir|lado/i.test(c.peorMomento||'')},
    {p:3, t:'Empeora al elevar el brazo o alcanzar objetos altos', f:c=>/elevar|levantar|alcanzar|alto|peinar|espalda/i.test(c.empeora||'')},
    {p:2, t:'Diabetes o hipotiroidismo, que predisponen a capsulitis', f:c=>_a(c,'diabetes','hipotiroidismo')},
    {p:2, t:'DN4 bajo', f:c=>c.dn4!=null&&c.dn4<4}
  ],
  estudios:[
    {t:'Radiografía de hombro', cuando:'inicial, descarta artrosis, calcificaciones y omartrosis'},
    {t:'Ecografía de hombro', cuando:'evalúa manguito rotador y bursa; accesible y dinámica'},
    {t:'RMN de hombro', cuando:'si se plantea cirugía o hay sospecha de rotura masiva'},
    {t:'TSH y glucemia', cuando:'en capsulitis adhesiva, casi siempre hay una de las dos'}
  ],
  tratamiento:{
    objetivo:'Recuperar el rango. En la capsulitis, la evolución natural es a la resolución en 12 a 30 meses; el tratamiento acorta ese tiempo.',
    noFarmacologico:['Kinesiología con movilización y estiramiento capsular','Programa domiciliario diario, que es lo que define el resultado'],
    primeraLinea:[{farmaco:'aine'},{farmaco:'aine_topico'}],
    segundaLinea:[{farmaco:'corticoide_oral', nota:'Ciclo corto en la fase dolorosa de la capsulitis'},{farmaco:'amitriptilina'}],
    tercera:[],
    evitar:['Inmovilizar con cabestrillo: acelera la capsulitis']
  },
  procedimientos:['infiltracion_subacromial','distension_capsular','bloqueo_supraescapular'],
  controles:{frecuencia:'6 semanas', escalas:['nrs','bpi'], que:'Rango activo y pasivo medido en grados, no "mejor o peor".'},
  banderas:['Dolor con fiebre y hombro caliente','Masa palpable','Déficit neurológico del miembro'],
  referencias:['Kelley MJ. et al., APTA clinical practice guideline','Rangan A. et al., Lancet 2020 (UK FROST)']
},

/* ======================================================================= */
/* ONCOLOGICO Y VISCERAL                                                   */
/* ======================================================================= */

{
  id:'dolor_oncologico',
  nombre:'Dolor oncológico',
  grupo:'Oncológico',
  icd:{cod:'MG30.10', txt:'Dolor crónico por cáncer'},
  mecanismo:'mixto',
  resumen:'Casi siempre mixto: componente somático, visceral y neuropático a la ' +
          'vez, más el dolor irruptivo. Es el escenario donde el opioide sí es ' +
          'de primera línea y donde no hay techo de dosis mientras haya ' +
          'beneficio y la titulación sea correcta.',
  reglas:[
    {p:8, t:'Cáncer activo o en tratamiento', f:c=>_a(c,'cancer')},
    {p:4, t:'Dolor de intensidad moderada a severa', f:c=>c.nrsPromedio>=5},
    {p:3, t:'Dolor progresivo, que aumenta con las semanas', f:c=>c.patron==='constante'},
    {p:3, t:'Dolor nocturno que no cede con el reposo', f:c=>/noche|nocturn|despierta/i.test(c.peorMomento||'')},
    {p:3, t:'Componente neuropático asociado', f:c=>c.dn4>=4},
    {p:2, t:'Pérdida de peso', f:c=>c.banderas.has('perdida_peso')}
  ],
  excluye:[
    {t:'Sin antecedente oncológico', f:c=>!_a(c,'cancer')}
  ],
  estudios:[
    {t:'Estadificación actualizada y comunicación con el equipo oncológico', cuando:'siempre'},
    {t:'RMN de columna URGENTE', cuando:'ante cualquier sospecha de compresión medular metastásica',
     nota:'Dolor dorsal progresivo en un paciente oncológico es compresión medular hasta que se demuestre lo contrario. ' +
          'La ventana para conservar la marcha se mide en horas.'},
    {t:'Centellograma óseo o PET-TC', cuando:'para localizar metástasis óseas'},
    {t:'Calcemia corregida', cuando:'siempre en metástasis óseas: la hipercalcemia produce dolor y confusión'}
  ],
  tratamiento:{
    objetivo:'Analgesia efectiva sin demoras. Aquí el reloj corre distinto que en el dolor crónico benigno.',
    noFarmacologico:['Radioterapia antiálgica en metástasis óseas, con excelente respuesta',
                     'Acompañamiento psicológico y del entorno familiar','Cuidados paliativos en forma temprana, no al final'],
    primeraLinea:[
      {farmaco:'morfina', nota:'Opioide de referencia. Titular con liberación inmediata, luego pasar a liberación prolongada'},
      {farmaco:'oxicodona'},
      {farmaco:'paracetamol', nota:'Como coadyuvante, ahorra opioide'},
      {farmaco:'aine', nota:'Especialmente útil en dolor óseo metastásico'}
    ],
    segundaLinea:[
      {farmaco:'metadona', nota:'Excelente en componente neuropático; rotación compleja, exige experiencia'},
      {farmaco:'fentanilo_td', nota:'Solo con dolor estable ya titulado. NUNCA para iniciar ni para dolor inestable'},
      {farmaco:'pregabalina', nota:'Para el componente neuropático'},
      {farmaco:'dexametasona', nota:'En compresión nerviosa, hipertensión endocraneana y dolor óseo'}
    ],
    tercera:[
      {farmaco:'bifosfonatos', nota:'Ácido zoledrónico en metástasis óseas: analgesia y prevención de eventos esqueléticos'},
      {farmaco:'ketamina_ev', nota:'En dolor refractario o tolerancia rápida al opioide'}
    ],
    evitar:['Demorar el opioide por temor a la adicción en un paciente oncológico',
            'Dejarlo sin medicación de rescate para el dolor irruptivo']
  },
  irruptivo:'Todo paciente con dolor oncológico basal controlado necesita una dosis de RESCATE ' +
            'de opioide de liberación inmediata equivalente al 10-15% de la dosis diaria total, ' +
            'disponible cada 1 hora si hace falta. Si usa más de 3 o 4 rescates por día, hay que ' +
            'subir la dosis de base.',
  procedimientos:['bloqueo_celiaco','hipogastrico_superior','ganglio_impar','bomba_intratecal','cordotomia'],
  controles:{frecuencia:'Semanal al inicio, luego según evolución', escalas:['nrs','bpi','ecog'],
             que:'Dolor basal, número de rescates por día, constipación y sedación.'},
  banderas:['COMPRESIÓN MEDULAR: dolor dorsal progresivo, debilidad o alteración esfinteriana. Urgencia',
            'Fractura patológica','Hipercalcemia','Dolor nuevo o de patrón cambiado: buscar progresión'],
  referencias:['Fallon M. et al., ESMO Clinical Practice Guidelines, Ann Oncol 2018',
               'NCCN Guidelines, Adult Cancer Pain','OMS, Directrices sobre el tratamiento farmacológico del dolor por cáncer 2018']
},

{
  id:'dolor_pelvico',
  nombre:'Dolor pélvico crónico y neuralgia del pudendo',
  grupo:'Visceral',
  icd:{cod:'MG30.00', txt:'Dolor visceral crónico primario'},
  mecanismo:'mixto',
  resumen:'Multifactorial casi siempre: visceral, miofascial del piso pelviano ' +
          'y neuropático se superponen. La neuralgia del pudendo tiene criterios ' +
          'propios (Nantes) y el signo cardinal es que duele sentado y no acostado.',
  topografia:{t:'Requiere dolor en región pelviana, perineal, sacra o inguinal', f:c=>_z(c,'genital','sacro','inguinal','gluteo','abdomen')},
  reglas:[
    {p:6, t:'Dolor en región pelviana, perineal o genital', f:c=>_z(c,'genital','sacro','inguinal')},
    {p:5, t:'Empeora al estar sentado y mejora de pie o acostado', f:c=>/sentar|sentad|silla/i.test(c.empeora||'')&&/pie|parad|acostad|caminar/i.test(c.alivia||'')},
    {p:4, t:'Evolución mayor a 6 meses', f:c=>c.meses>=6},
    {p:3, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:3, t:'Sin dolor nocturno que lo despierte', f:c=>!/noche|nocturn|despierta/i.test(c.peorMomento||'')},
    {p:2, t:'Puntos gatillo del piso pelviano', f:c=>c.signos.has('punto_gatillo')}
  ],
  criterios:'CRITERIOS DE NANTES para neuralgia del pudendo: dolor en el territorio del ' +
            'nervio pudendo; que empeora sentado; que no despierta por la noche; sin déficit ' +
            'sensitivo objetivo; y que se alivia con el bloqueo anestésico del pudendo.',
  estudios:[
    {t:'Evaluación ginecológica o urológica según el caso', cuando:'siempre, antes de rotular como primario'},
    {t:'Ecografía o RMN de pelvis', cuando:'para descartar endometriosis, adherencias o masa'},
    {t:'RMN de pelvis con protocolo de nervio pudendo', cuando:'ante sospecha de atrapamiento'},
    {t:'Bloqueo diagnóstico del nervio pudendo', cuando:'es el quinto criterio de Nantes'}
  ],
  tratamiento:{
    objetivo:'Abordaje interdisciplinario. Aislado fracasa.',
    noFarmacologico:['Kinesiología del piso pelviano con relajación (no ejercicios de Kegel, que empeoran la hipertonía)',
                     'Terapia cognitivo-conductual','Cojín en herradura para descargar el periné'],
    primeraLinea:[{farmaco:'amitriptilina'},{farmaco:'pregabalina'},{farmaco:'gabapentina'}],
    segundaLinea:[{farmaco:'duloxetina'},{farmaco:'diazepam_vaginal', nota:'Supositorio para la hipertonía del piso pelviano'}],
    tercera:[{farmaco:'toxina_botulinica'}],
    evitar:['Cirugías repetidas sin diagnóstico claro','Opioides crónicos']
  },
  procedimientos:['bloqueo_pudendo','hipogastrico_superior','ganglio_impar','toxina_botulinica'],
  controles:{frecuencia:'8 semanas', escalas:['nrs','bpi','pcs','phq9'], que:'Tiempo tolerado sentado y función sexual y urinaria.'},
  banderas:['Sangrado','Pérdida de peso','Masa palpable','Fiebre'],
  referencias:['Labat JJ. et al., criterios de Nantes, Neurourol Urodyn 2008',
               'EAU Guidelines on Chronic Pelvic Pain']
},

{
  id:'dolor_toracico_cronico',
  nombre:'Dolor torácico crónico postquirúrgico (post-toracotomía y post-mastectomía)',
  grupo:'Neuropatías',
  icd:{cod:'MG30.20', txt:'Dolor postquirúrgico crónico'},
  mecanismo:'neuropatico',
  resumen:'Hasta la mitad de las toracotomías y un tercio de las mastectomías ' +
          'dejan dolor crónico. Es lesión de nervios intercostales o del ' +
          'intercostobraquial, y responde bien al bloqueo cuando se identifica ' +
          'el nivel.',
  topografia:{t:'Requiere dolor en pared torácica, escápula o hombro', f:c=>_z(c,'torax','escapula','hombro','abdomen')},
  reglas:[
    {p:7, t:'Toracotomía, esternotomía o cirugía mamaria previa', f:c=>_a(c,'cirugia_torax','cirugia_mama')},
    {p:5, t:'Dolor en la pared torácica o axilar del lado operado', f:c=>_z(c,'torax','escapula','hombro')&&!c.bilateral},
    {p:4, t:'DN4 igual o mayor a 4', f:c=>c.dn4>=4},
    {p:4, t:'Alodinia sobre la cicatriz', f:c=>c.signos.has('alodinia')||c.signos.has('dolor_cicatriz')},
    {p:2, t:'Persiste más de 3 meses tras la cirugía', f:c=>c.meses>=3}
  ],
  excluye:[
    {t:'Sin cirugía torácica ni mamaria previa', f:c=>!_a(c,'cirugia_torax','cirugia_mama')}
  ],
  estudios:[
    {t:'TC de tórax', cuando:'para descartar recidiva tumoral, que es la primera preocupación'},
    {t:'Bloqueo intercostal diagnóstico', cuando:'identifica el nivel y anticipa la respuesta a la ablación'}
  ],
  tratamiento:{
    objetivo:'Descartar recidiva y luego tratar como dolor neuropático localizado.',
    noFarmacologico:['Desensibilización de la cicatriz','Kinesiología respiratoria y movilización del hombro'],
    primeraLinea:[{farmaco:'pregabalina'},{farmaco:'amitriptilina'},{farmaco:'duloxetina'}],
    segundaLinea:[{farmaco:'lidocaina_parche', nota:'Muy útil: el territorio suele estar bien delimitado'},
                  {farmaco:'capsaicina_alta'}],
    tercera:[{farmaco:'tramadol'}],
    evitar:[]
  },
  procedimientos:['bloqueo_intercostal','bloqueo_esp','bloqueo_pecs','radiofrecuencia_pulsada','crioablacion'],
  controles:{frecuencia:'6 semanas', escalas:['nrs','dn4','bpi'], que:'Alodinia, movilidad del hombro y respiración profunda.'},
  banderas:['Dolor nuevo o cambiante en paciente oncológico: descartar recidiva'],
  referencias:['Schug SA. et al., Pain 2019','Prevención: bloqueo paravertebral o epidural torácico intraoperatorio']
}

);
