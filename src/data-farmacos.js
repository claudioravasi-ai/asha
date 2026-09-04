/* =========================================================================
   VADEMECUM DE DOLOR
   -------------------------------------------------------------------------
   Dosis de inicio, esquema de titulacion, techo, ajustes por funcion renal y
   hepatica, efectos adversos que hacen abandonar el tratamiento, y linea de
   recomendacion segun la evidencia actual.

   Las lineas de recomendacion en dolor neuropatico siguen la revision
   sistematica y metaanalisis de NeuPSIG publicada en Lancet Neurology en
   2025 (313 ensayos, mas de 48.000 pacientes), que mantuvo como PRIMERA
   LINEA a los antidepresivos triciclicos, los duales (IRSN) y los ligandos
   alfa-2-delta, y ubico como SEGUNDA LINEA a los topicos (parche de
   lidocaina al 5%, capsaicina al 8%) sobre todo en dolor neuropatico
   periferico localizado.

   PRESENTACIONES: se indican las formas y concentraciones habituales en
   Argentina. No se incluyen nombres comerciales a proposito, porque cambian,
   varian por provincia y por cobertura, y un nombre equivocado en un
   vademecum es peor que ningun nombre.

   El campo mme es el factor de conversion a miligramos equivalentes de
   morfina oral por dia, segun la tabla del CDC 2022. Sirve para el calculo
   de carga opioide total; NO sirve para rotar de un opioide a otro sin
   reducir por tolerancia cruzada incompleta.
   ========================================================================= */
'use strict';

const FARMACOS = {

/* ===================================================================== */
/* NO OPIOIDES                                                           */
/* ===================================================================== */

paracetamol:{
  nombre:'Paracetamol (acetaminofeno)', grupo:'No opioide', clase:'Analgésico central',
  presentaciones:['Comprimidos 500 mg y 1 g','Gotas y jarabe pediátrico','Ampollas 1 g EV'],
  inicio:'500 mg a 1 g cada 6-8 h',
  maxima:'4 g/día en adulto sano; 3 g/día si es mayor de 65 años, bajo peso, hepatopatía o consumo de alcohol',
  ajusteRenal:'Filtrado <30 ml/min: espaciar a cada 8 h',
  ajusteHepatico:'Hepatopatía: máximo 2 g/día. Contraindicado en insuficiencia hepática severa',
  adversos:'Muy bien tolerado. La toxicidad es hepática y depende de la dosis acumulada',
  contraindicaciones:['Insuficiencia hepática grave'],
  interacciones:'Potencia el efecto de los anticoagulantes orales con uso sostenido',
  evidencia:{linea:'Primera línea como coadyuvante', calidad:'Efecto pequeño en monoterapia'},
  nota:'Sumado a un AINE mejora el resultado de los dos. Como monoterapia en lumbalgia ' +
       'crónica y artrosis su efecto es marginal. Vigilar el paracetamol oculto en ' +
       'combinados: es la causa más frecuente de sobredosis involuntaria.'
},

aine:{
  nombre:'AINE sistémico', grupo:'No opioide', clase:'Antiinflamatorio no esteroide',
  opciones:'Ibuprofeno 400-600 mg c/8 h · Naproxeno 500 mg c/12 h · Diclofenac 50-75 mg c/12 h · ' +
           'Meloxicam 7,5-15 mg/día · Celecoxib 100-200 mg c/12-24 h · Ketorolac 10 mg c/8 h (máximo 5 días)',
  presentaciones:['Comprimidos','Ampollas','Formas de liberación prolongada'],
  inicio:'La dosis mínima eficaz, por el tiempo más corto posible',
  maxima:'Según molécula. Ketorolac: nunca más de 5 días por riesgo de sangrado digestivo',
  ajusteRenal:'CONTRAINDICADOS con filtrado <30 ml/min. Precaución entre 30 y 60',
  ajusteHepatico:'Precaución; evitar en cirrosis',
  adversos:'Gastrolesividad, hipertensión, retención hidrosalina, deterioro renal, riesgo cardiovascular',
  contraindicaciones:['Insuficiencia renal avanzada','Úlcera péptica activa','Insuficiencia cardíaca descompensada',
                      'Anticoagulación plena','Tercer trimestre de embarazo','Antecedente de infarto reciente'],
  interacciones:'Anticoagulantes y antiagregantes (sangrado), IECA más diurético (fallo renal por triple whammy), litio, metotrexato',
  evidencia:{linea:'Primera línea en dolor nociceptivo e inflamatorio', calidad:'Alta en agudo, moderada en crónico'},
  nota:'No sirven en dolor neuropático ni nociplástico. Si el paciente tiene más de 65 años, ' +
       'antecedente digestivo o toma antiagregantes, va con inhibidor de bomba de protones. ' +
       'El celecoxib tiene menos riesgo digestivo con riesgo cardiovascular comparable al resto.'
},

aine_topico:{
  nombre:'AINE tópico (diclofenac gel)', grupo:'No opioide', clase:'Antiinflamatorio tópico',
  presentaciones:['Gel al 1% y 1,16%','Parches'],
  inicio:'Aplicar 2 a 4 veces por día sobre la articulación',
  maxima:'32 g/día repartidos entre todas las articulaciones',
  ajusteRenal:'Absorción sistémica mínima; seguro donde el oral está contraindicado',
  ajusteHepatico:'Sin ajuste',
  adversos:'Irritación local, dermatitis de contacto',
  contraindicaciones:['Piel lesionada o infectada en el sitio de aplicación'],
  interacciones:'Despreciables',
  evidencia:{linea:'PRIMERA línea en artrosis de rodilla y mano', calidad:'Alta'},
  nota:'Misma eficacia que el AINE oral en articulaciones superficiales, con una fracción del riesgo. ' +
       'Muy infrautilizado. No sirve en cadera, que está demasiado profunda.'
},

dipirona:{
  nombre:'Dipirona (metamizol)', grupo:'No opioide', clase:'Analgésico y antipirético pirazolónico',
  presentaciones:['Comprimidos 500 mg','Gotas','Ampollas 1 g y 2 g'],
  inicio:'500 mg a 1 g cada 6-8 h',
  maxima:'4 g/día',
  ajusteRenal:'Precaución con filtrado bajo',
  ajusteHepatico:'Precaución',
  adversos:'Hipotensión con la administración endovenosa rápida. Agranulocitosis: rara pero grave',
  contraindicaciones:['Antecedente de discrasia sanguínea','Porfiria','Déficit de G6PD'],
  interacciones:'Ciclosporina, metotrexato',
  evidencia:{linea:'Alternativa útil', calidad:'Buena en dolor agudo y cólico'},
  nota:'De uso corriente en Argentina y en buena parte de Europa y Latinoamérica; retirada en ' +
       'algunos países por el riesgo de agranulocitosis. Muy buena opción cuando el AINE está ' +
       'contraindicado por riesgo renal o digestivo. Advertir al paciente que consulte ante ' +
       'fiebre con odinofagia mientras la toma.'
},

/* ===================================================================== */
/* ANTIDEPRESIVOS — PRIMERA LINEA EN DOLOR NEUROPATICO                   */
/* ===================================================================== */

amitriptilina:{
  nombre:'Amitriptilina', grupo:'Antidepresivo', clase:'Tricíclico',
  presentaciones:['Comprimidos 10 mg, 25 mg y 75 mg'],
  inicio:'10 mg por la noche (10 mg si es mayor de 65 años)',
  titulacion:'Subir 10 mg cada 7 días según tolerancia. La dosis útil suele estar entre 25 y 75 mg',
  maxima:'150 mg/día, aunque en dolor rara vez se necesita pasar de 75 mg',
  latencia:'2 a 4 semanas para el efecto analgésico pleno. Avisarlo o el paciente abandona antes',
  ajusteRenal:'Sin ajuste',
  ajusteHepatico:'Reducir dosis',
  adversos:'Boca seca, somnolencia, constipación, retención urinaria, aumento de peso, ' +
           'hipotensión ortostática, prolongación del QT',
  contraindicaciones:['Infarto reciente','Arritmia o QT prolongado','Glaucoma de ángulo cerrado',
                      'Hipertrofia prostática con retención','Uso de IMAO'],
  interacciones:'IMAO (síndrome serotoninérgico), tramadol (baja el umbral convulsivo y suma serotonina), ' +
                'antiarrítmicos, otros fármacos que prolongan el QT',
  evidencia:{linea:'PRIMERA línea en dolor neuropático', calidad:'NNT ≈ 3,6 — el mejor de todos los grupos',
             nota:'El efecto analgésico es independiente del antidepresivo y se logra con dosis mucho menores'},
  monitoreo:'ECG basal si es mayor de 65 años, cardiópata o toma otros fármacos que prolongan el QT',
  nota:'La opción más eficaz y más barata. Su límite es la tolerancia, no la eficacia. ' +
       'Darla 2 horas antes de acostarse: si se toma justo al dormir, el paciente amanece atontado. ' +
       'En mayores de 65 preferir nortriptilina, que tiene menos efectos anticolinérgicos.'
},

nortriptilina:{
  nombre:'Nortriptilina', grupo:'Antidepresivo', clase:'Tricíclico',
  presentaciones:['Cápsulas 25 mg'],
  inicio:'10 a 25 mg por la noche',
  titulacion:'Subir 25 mg cada 7 días',
  maxima:'150 mg/día',
  latencia:'2 a 4 semanas',
  ajusteRenal:'Sin ajuste', ajusteHepatico:'Reducir dosis',
  adversos:'Los mismos que la amitriptilina, pero notablemente menos sedación y sequedad',
  contraindicaciones:['Infarto reciente','Arritmia','Glaucoma de ángulo cerrado'],
  interacciones:'Las mismas que la amitriptilina',
  evidencia:{linea:'PRIMERA línea', calidad:'Similar a la amitriptilina'},
  nota:'Es la elección cuando el paciente es mayor o cuando la amitriptilina se toleró mal. ' +
       'Mismo beneficio, mejor perfil.'
},

duloxetina:{
  nombre:'Duloxetina', grupo:'Antidepresivo', clase:'Inhibidor de la recaptación de serotonina y noradrenalina',
  presentaciones:['Cápsulas 30 mg y 60 mg'],
  inicio:'30 mg/día con el desayuno, por 7 días',
  titulacion:'Subir a 60 mg/día. Empezar directo con 60 mg produce náuseas y abandono',
  maxima:'120 mg/día, aunque por encima de 60 mg el beneficio adicional es escaso',
  latencia:'2 a 4 semanas',
  ajusteRenal:'CONTRAINDICADA con filtrado <30 ml/min',
  ajusteHepatico:'Contraindicada en hepatopatía o consumo importante de alcohol',
  adversos:'Náuseas (lo más frecuente, cede en 1-2 semanas), boca seca, insomnio, sudoración, ' +
           'aumento leve de la presión arterial, disfunción sexual',
  contraindicaciones:['Insuficiencia renal severa','Hepatopatía','Glaucoma de ángulo cerrado no controlado','IMAO'],
  interacciones:'Tramadol y triptanes (síndrome serotoninérgico), anticoagulantes (sangrado), ' +
                'inhibidores del CYP1A2 como la ciprofloxacina',
  evidencia:{linea:'PRIMERA línea en dolor neuropático', calidad:'NNT ≈ 6,4',
             nota:'Es el único con recomendación positiva en neuropatía por quimioterapia (ASCO)'},
  monitoreo:'Presión arterial y hepatograma si hay factores de riesgo',
  nota:'La mejor relación eficacia-tolerancia del grupo. Aprobada para neuropatía diabética, ' +
       'fibromialgia, lumbalgia crónica y artrosis. No suspender de golpe: produce síndrome de ' +
       'discontinuación con mareos y sensaciones eléctricas. Bajar a lo largo de 2 semanas.'
},

venlafaxina:{
  nombre:'Venlafaxina de liberación prolongada', grupo:'Antidepresivo', clase:'IRSN',
  presentaciones:['Cápsulas 75 mg y 150 mg'],
  inicio:'37,5 a 75 mg/día',
  titulacion:'Subir cada 1 a 2 semanas',
  maxima:'225 mg/día',
  latencia:'2 a 4 semanas',
  ajusteRenal:'Reducir 50% con filtrado <30 ml/min',
  ajusteHepatico:'Reducir 50%',
  adversos:'Náuseas, hipertensión dosis-dependiente por encima de 150 mg, sudoración, insomnio',
  contraindicaciones:['Hipertensión no controlada','IMAO'],
  interacciones:'Serotoninérgicos, tramadol',
  evidencia:{linea:'Primera línea (algo por detrás de la duloxetina)', calidad:'NNT ≈ 6,4'},
  monitoreo:'Presión arterial, sobre todo por encima de 150 mg/día',
  nota:'El efecto noradrenérgico, que es el que analgesia, recién aparece por encima de 150 mg/día. ' +
       'Por debajo de esa dosis es solo un antidepresivo serotoninérgico.'
},

/* ===================================================================== */
/* LIGANDOS ALFA-2-DELTA — PRIMERA LINEA                                 */
/* ===================================================================== */

pregabalina:{
  nombre:'Pregabalina', grupo:'Anticonvulsivante', clase:'Ligando alfa-2-delta',
  presentaciones:['Cápsulas 25, 50, 75, 100, 150 y 300 mg'],
  inicio:'75 mg por la noche, o 25-50 mg si es mayor de 65 años o frágil',
  titulacion:'Subir 75 mg cada 3 a 7 días hasta 150 mg cada 12 h',
  maxima:'600 mg/día, aunque por encima de 300-450 mg el beneficio adicional es pequeño y los adversos crecen',
  latencia:'Efecto en pocos días, más rápida que los antidepresivos',
  ajusteRenal:'IMPRESCINDIBLE. Filtrado 30-60: mitad de dosis. 15-30: un cuarto. <15: 25-75 mg/día. ' +
              'La pregabalina se elimina íntegra por riñón y no ajustarla es la causa más común de ' +
              'somnolencia y caídas en el adulto mayor',
  ajusteHepatico:'Sin ajuste',
  adversos:'Somnolencia, mareo, edema periférico, aumento de peso, visión borrosa, ataxia',
  contraindicaciones:[],
  interacciones:'Suma sedación con opioides, benzodiacepinas y alcohol. La combinación con opioides ' +
                'aumenta el riesgo de depresión respiratoria',
  evidencia:{linea:'PRIMERA línea en dolor neuropático', calidad:'NNT ≈ 7,7'},
  monitoreo:'Función renal, peso, edemas y somnolencia. En el adulto mayor, riesgo de caídas',
  nota:'Tiene potencial de mal uso y hay mercado paralelo: en pacientes con antecedente de ' +
       'adicción conviene la gabapentina. No suspender bruscamente. Si a las 4 semanas en dosis ' +
       'plena no hubo respuesta, no la va a haber: retirarla en vez de acumularla.'
},

gabapentina:{
  nombre:'Gabapentina', grupo:'Anticonvulsivante', clase:'Ligando alfa-2-delta',
  presentaciones:['Cápsulas 300 mg y 400 mg','Comprimidos 600 mg y 800 mg'],
  inicio:'300 mg por la noche (100 mg si es mayor de 65 años)',
  titulacion:'Subir 300 mg cada 3 a 5 días hasta 300-600 mg cada 8 h',
  maxima:'3600 mg/día repartidos en 3 tomas',
  latencia:'1 a 2 semanas',
  ajusteRenal:'IMPRESCINDIBLE. Filtrado 30-60: 400-1400 mg/día. 15-30: 200-700 mg/día. <15: 100-300 mg/día',
  ajusteHepatico:'Sin ajuste',
  adversos:'Somnolencia, mareo, edema, ataxia, aumento de peso',
  contraindicaciones:[],
  interacciones:'Los antiácidos con aluminio o magnesio reducen su absorción: separarlos 2 horas',
  evidencia:{linea:'PRIMERA línea', calidad:'NNT ≈ 6,3'},
  monitoreo:'Función renal y somnolencia',
  nota:'Absorción saturable y no lineal: por eso hay que repartirla en tres tomas y por eso subir ' +
       'la dosis no siempre sube el efecto. Más barata que la pregabalina y con menos potencial de mal uso.'
},

carbamazepina:{
  nombre:'Carbamazepina', grupo:'Anticonvulsivante', clase:'Bloqueante de canales de sodio',
  presentaciones:['Comprimidos 200 mg','Comprimidos de liberación prolongada 200 y 400 mg','Suspensión'],
  inicio:'100 mg cada 12 h',
  titulacion:'Subir 100-200 mg cada 3 días según respuesta',
  maxima:'1200 mg/día',
  latencia:'Días. En neuralgia del trigémino la respuesta suele ser rápida y llamativa',
  ajusteRenal:'Precaución',
  ajusteHepatico:'Reducir dosis; contraindicada en hepatopatía severa',
  adversos:'Mareo, diplopía, ataxia, HIPONATREMIA, hepatotoxicidad, leucopenia, ' +
           'reacciones cutáneas graves (síndrome de Stevens-Johnson)',
  contraindicaciones:['Bloqueo auriculoventricular','Antecedente de depresión medular','Porfiria'],
  interacciones:'Potente inductor enzimático: baja los niveles de anticonceptivos orales, warfarina, ' +
                'estatinas y muchos otros. Revisar SIEMPRE toda la medicación del paciente',
  evidencia:{linea:'PRIMERA línea en neuralgia del trigémino, y solo ahí', calidad:'Alta en esa indicación'},
  monitoreo:'Hemograma, hepatograma y NATREMIA basales, al mes y luego cada 3-6 meses',
  nota:'En pacientes de origen asiático conviene el estudio del HLA-B*1502 antes de iniciarla, ' +
       'por el riesgo de necrólisis epidérmica tóxica.'
},

oxcarbazepina:{
  nombre:'Oxcarbazepina', grupo:'Anticonvulsivante', clase:'Bloqueante de canales de sodio',
  presentaciones:['Comprimidos 300 mg y 600 mg'],
  inicio:'150 mg cada 12 h',
  titulacion:'Subir 300 mg cada 3 días',
  maxima:'1800 mg/día',
  ajusteRenal:'Reducir 50% con filtrado <30 ml/min',
  ajusteHepatico:'Precaución',
  adversos:'HIPONATREMIA (más frecuente que con carbamazepina), mareo, somnolencia, diplopía',
  contraindicaciones:[],
  interacciones:'Menos que la carbamazepina, pero reduce igual la eficacia de los anticonceptivos orales',
  evidencia:{linea:'Alternativa de primera línea en neuralgia del trigémino', calidad:'Buena'},
  monitoreo:'NATREMIA basal, al mes y luego periódica. Sobre todo en el adulto mayor y con diuréticos',
  nota:'Mejor tolerada y con muchas menos interacciones que la carbamazepina. Suele ser la elección ' +
       'práctica cuando el paciente toma otros fármacos.'
},

lamotrigina:{
  nombre:'Lamotrigina', grupo:'Anticonvulsivante', clase:'Bloqueante de canales de sodio',
  presentaciones:['Comprimidos 25, 50, 100 y 200 mg'],
  inicio:'25 mg/día por 2 semanas',
  titulacion:'MUY lenta y sin excepciones: 25 mg/día por 2 semanas, luego 50 mg/día por 2 semanas, ' +
             'luego subir 50 mg cada 1-2 semanas. Acelerar la titulación es lo que dispara el exantema grave',
  maxima:'400 mg/día',
  ajusteRenal:'Reducir en insuficiencia severa', ajusteHepatico:'Reducir 50%',
  adversos:'EXANTEMA, que puede evolucionar a Stevens-Johnson. Mareo, cefalea, diplopía',
  contraindicaciones:[],
  interacciones:'El valproato duplica sus niveles: reducir la dosis a la mitad',
  evidencia:{linea:'Tercera línea', calidad:'Limitada'},
  monitoreo:'Instruir al paciente: ante cualquier erupción cutánea, suspender y consultar el mismo día',
  nota:'Útil en dolor central y en neuralgia del trigémino refractaria. La titulación lenta no es negociable.'
},

/* ===================================================================== */
/* TOPICOS — SEGUNDA LINEA EN NEUROPATICO PERIFERICO LOCALIZADO          */
/* ===================================================================== */

lidocaina_parche:{
  nombre:'Lidocaína en parche al 5%', grupo:'Tópico', clase:'Bloqueante de canales de sodio tópico',
  presentaciones:['Parche 700 mg (5%)','Gel al 5% como alternativa de preparación magistral'],
  inicio:'Hasta 3 parches sobre la zona dolorosa, 12 horas puestos y 12 horas sin',
  maxima:'3 parches simultáneos',
  ajusteRenal:'Sin ajuste', ajusteHepatico:'Sin ajuste',
  adversos:'Eritema local leve. Absorción sistémica despreciable',
  contraindicaciones:['Piel lesionada o infectada','Alergia a anestésicos locales tipo amida'],
  interacciones:'Ninguna relevante',
  evidencia:{linea:'SEGUNDA línea en dolor neuropático periférico localizado', calidad:'Moderada, ' +
            'con excelente perfil de seguridad'},
  nota:'De elección en el paciente añoso y polimedicado, donde cualquier fármaco sistémico es un riesgo. ' +
       'Especialmente eficaz cuando el síntoma dominante es la alodinia y el territorio está bien delimitado ' +
       '(neuralgia postherpética, dolor de cicatriz).'
},

capsaicina_alta:{
  nombre:'Capsaicina en parche al 8%', grupo:'Tópico', clase:'Agonista TRPV1 (defuncionaliza la fibra C)',
  presentaciones:['Parche 179 mg (8%) — aplicación en consultorio'],
  inicio:'Una aplicación de 30 minutos en pie, o 60 minutos en otras localizaciones',
  maxima:'Repetible cada 3 meses',
  ajusteRenal:'Sin ajuste', ajusteHepatico:'Sin ajuste',
  adversos:'Ardor intenso durante la aplicación (premedicar y usar frío local), eritema, ' +
           'elevación transitoria de la presión arterial por el dolor',
  contraindicaciones:['Aplicación sobre la cara o cerca de mucosas'],
  interacciones:'Ninguna',
  evidencia:{linea:'SEGUNDA línea en dolor neuropático periférico', calidad:'Moderada'},
  nota:'Una sola aplicación puede dar hasta 3 meses de alivio. Se aplica en el consultorio con guantes ' +
       'y protección; no es un tópico que el paciente se ponga en la casa. En Argentina su disponibilidad ' +
       'es irregular y suele requerir gestión con la cobertura.'
},

capsaicina_baja:{
  nombre:'Capsaicina en crema al 0,075%', grupo:'Tópico', clase:'Agonista TRPV1',
  presentaciones:['Crema al 0,025% y 0,075%'],
  inicio:'Aplicar 3 a 4 veces por día',
  maxima:'4 aplicaciones diarias',
  ajusteRenal:'Sin ajuste', ajusteHepatico:'Sin ajuste',
  adversos:'Ardor local en las primeras 1-2 semanas, que después cede',
  contraindicaciones:['Piel lesionada'],
  interacciones:'Ninguna',
  evidencia:{linea:'Segunda a tercera línea', calidad:'Baja'},
  nota:'Accesible y barata. Requiere constancia: el efecto aparece recién a las 2-4 semanas de uso ' +
       'continuo, y el ardor inicial hace que muchos abandonen. Avisarlo de entrada mejora la adherencia.'
},

/* ===================================================================== */
/* OPIOIDES                                                              */
/* ===================================================================== */

tramadol:{
  nombre:'Tramadol', grupo:'Opioide', clase:'Agonista mu débil con acción monoaminérgica',
  mme:0.2,
  presentaciones:['Gotas 100 mg/ml','Cápsulas 50 mg','Comprimidos de liberación prolongada 100, 150 y 200 mg','Ampollas 100 mg'],
  inicio:'25 a 50 mg cada 8-12 h. En el adulto mayor, empezar con 25 mg',
  titulacion:'Subir cada 3 a 5 días',
  maxima:'400 mg/día; 300 mg/día si es mayor de 75 años',
  ajusteRenal:'Filtrado <30 ml/min: máximo 200 mg/día y espaciar las tomas',
  ajusteHepatico:'Reducir 50% en cirrosis',
  adversos:'Náuseas y vómitos (muy frecuentes al inicio), mareo, constipación, somnolencia, sudoración',
  contraindicaciones:['Epilepsia no controlada','Uso de IMAO','Intoxicación aguda por alcohol o psicofármacos'],
  interacciones:'RIESGO SEROTONINÉRGICO con IRSN, ISRS, tricíclicos y triptanes, que es exactamente ' +
                'lo que el paciente de dolor suele estar tomando. Baja el umbral convulsivo',
  evidencia:{linea:'Tercera línea en dolor neuropático', calidad:'NNT ≈ 4,7 pero con NNH bajo'},
  monitoreo:'Náuseas, sedación, y siempre la pregunta por convulsiones si toma otros serotoninérgicos',
  nota:'Es un profármaco que depende del CYP2D6: cerca del 7% de la población son metabolizadores ' +
       'lentos y no obtienen analgesia, y los ultrarrápidos hacen toxicidad con dosis normales. ' +
       'Si un paciente dice que "no le hace nada", puede ser genético y no falta de adherencia. ' +
       'Empezar con gotas permite subir de a poco y baja mucho las náuseas.'
},

codeina:{
  nombre:'Codeína', grupo:'Opioide', clase:'Agonista mu débil', mme:0.15,
  presentaciones:['Habitualmente combinada con paracetamol o ibuprofeno'],
  inicio:'30 mg cada 6-8 h',
  maxima:'240 mg/día',
  ajusteRenal:'Evitar con filtrado <30 ml/min',
  ajusteHepatico:'Evitar',
  adversos:'Constipación marcada, náuseas, sedación',
  contraindicaciones:['Menores de 12 años','Lactancia','Insuficiencia respiratoria'],
  interacciones:'Depende del CYP2D6, igual que el tramadol',
  evidencia:{linea:'Escaso lugar en dolor crónico', calidad:'Baja'},
  nota:'Mismo problema farmacogenético que el tramadol y más constipación. Su uso en dolor crónico ' +
       'es cada vez más marginal.'
},

morfina:{
  nombre:'Morfina', grupo:'Opioide', clase:'Agonista mu puro — el opioide de referencia', mme:1,
  presentaciones:['Comprimidos de liberación inmediata 10 y 30 mg','Comprimidos de liberación prolongada 10, 30, 60 y 100 mg',
                  'Solución oral','Ampollas 10 mg'],
  inicio:'5 a 10 mg de liberación inmediata cada 4 h en el paciente sin opioide previo',
  titulacion:'Titular con liberación inmediata durante 24-48 h, sumar el total consumido y pasar ' +
             'ese total a liberación prolongada repartido cada 12 h',
  maxima:'Sin techo en dolor oncológico mientras haya beneficio y la titulación sea correcta. ' +
         'En dolor NO oncológico, revalorar seriamente por encima de 50 MME/día y evitar superar 90 MME/día',
  ajusteRenal:'PRECAUCIÓN. Su metabolito morfina-6-glucurónido se acumula en insuficiencia renal ' +
              'y produce sedación, mioclonías y depresión respiratoria tardía. Con filtrado <30 ' +
              'preferir metadona, fentanilo o buprenorfina',
  ajusteHepatico:'Reducir dosis y espaciar',
  adversos:'CONSTIPACIÓN (no desarrolla tolerancia: se previene siempre desde el día uno), ' +
           'náuseas, sedación, prurito, retención urinaria, depresión respiratoria, ' +
           'hipogonadismo e hiperalgesia con el uso prolongado',
  contraindicaciones:['Insuficiencia respiratoria descompensada','Íleo'],
  interacciones:'Benzodiacepinas (riesgo grave de depresión respiratoria), alcohol, gabapentinoides',
  evidencia:{linea:'PRIMERA línea en dolor oncológico. Última línea en dolor crónico no oncológico', calidad:'Alta en oncológico'},
  monitoreo:'Sedación, frecuencia respiratoria, constipación, MME diario acumulado',
  nota:'Se prescribe SIEMPRE junto con un laxante estimulante más un osmótico, no "por si acaso": ' +
       'la constipación es universal y es el motivo más frecuente de abandono. Indicar antiemético ' +
       'los primeros días. Todo paciente con más de 50 MME/día debería tener naloxona disponible y ' +
       'la familia instruida en usarla.'
},

oxicodona:{
  nombre:'Oxicodona', grupo:'Opioide', clase:'Agonista mu puro', mme:1.5,
  presentaciones:['Comprimidos de liberación prolongada 10, 20 y 40 mg','Combinada con naloxona'],
  inicio:'5 a 10 mg cada 12 h en liberación prolongada',
  titulacion:'Subir 25-50% cada 3 días según necesidad de rescates',
  maxima:'La misma consideración de MME que la morfina',
  ajusteRenal:'Reducir 50% con filtrado <30 ml/min',
  ajusteHepatico:'Reducir 50%',
  adversos:'Los mismos que la morfina, con algo menos de prurito y náuseas',
  contraindicaciones:['Insuficiencia respiratoria','Íleo'],
  interacciones:'Inhibidores del CYP3A4 (claritromicina, ketoconazol, jugo de pomelo) aumentan sus niveles',
  evidencia:{linea:'Alternativa a la morfina', calidad:'Equivalente'},
  monitoreo:'Igual que la morfina',
  nota:'Mejor tolerada por vía oral que la morfina en algunos pacientes. La combinación con naloxona ' +
       'de liberación prolongada reduce la constipación sin perder analgesia, porque la naloxona actúa ' +
       'en el intestino y se destruye en el primer paso hepático.'
},

metadona:{
  nombre:'Metadona', grupo:'Opioide', clase:'Agonista mu con antagonismo NMDA', mme:'variable',
  presentaciones:['Comprimidos 5 mg y 10 mg','Solución oral'],
  inicio:'2,5 mg cada 8-12 h en el paciente sin opioide previo',
  titulacion:'MUY lenta: no subir antes de 5 a 7 días. Su vida media es larga y errática ' +
             '(de 8 a 150 horas) y la acumulación mata varios días después de la última suba',
  maxima:'Sin techo fijo, pero exige experiencia',
  ajusteRenal:'SEGURA en insuficiencia renal: se elimina por vía fecal. Es una de sus grandes ventajas',
  ajusteHepatico:'Precaución',
  adversos:'Prolongación del QT y torsades de pointes, sedación tardía, acumulación',
  contraindicaciones:['QT prolongado','Uso concomitante de otros fármacos que prolongan el QT'],
  interacciones:'Muchas y relevantes: inductores e inhibidores del CYP3A4, fluconazol, antirretrovirales, ' +
                'ciprofloxacina, todos los que prolongan el QT',
  evidencia:{linea:'Segunda línea en dolor oncológico; muy útil en componente neuropático', calidad:'Buena en manos expertas'},
  monitoreo:'ECG basal, a los 30 días y con cada aumento significativo. Con QTc >500 ms, suspender',
  nota:'Su factor de conversión NO es lineal: cuanto mayor la dosis previa de morfina, menor la ' +
       'proporción de metadona. Las rotaciones a metadona deben hacerse con tabla en mano y, si no ' +
       'se hacen a diario, con consulta. Es el opioide con el que más muertes por error de conversión ocurren.'
},

fentanilo_td:{
  nombre:'Fentanilo transdérmico', grupo:'Opioide', clase:'Agonista mu potente', mme:2.4,
  presentaciones:['Parches de 12, 25, 50, 75 y 100 mcg/h'],
  inicio:'NUNCA como primer opioide. Requiere que el paciente ya tolere al menos 60 MME/día ' +
         'durante una semana',
  titulacion:'Cambiar el parche cada 72 h. Ajustar recién después de dos parches',
  maxima:'Según necesidad, con las mismas consideraciones de MME',
  ajusteRenal:'SEGURO en insuficiencia renal: no tiene metabolitos activos',
  ajusteHepatico:'Precaución',
  adversos:'Los del grupo, con menos constipación que la morfina. Reacciones cutáneas locales',
  contraindicaciones:['Paciente sin exposición previa a opioides','Dolor agudo','Dolor inestable o en titulación',
                      'Fiebre alta o fuente de calor externa sobre el parche, que aceleran la absorción y pueden ser mortales'],
  interacciones:'Inhibidores del CYP3A4',
  evidencia:{linea:'Segunda línea en dolor oncológico estable', calidad:'Buena en esa situación'},
  monitoreo:'Sedación en las primeras 24 h de cada cambio; el pico de concentración es a las 12-24 h',
  nota:'Tarda 12 a 24 horas en hacer efecto y otras tantas en desaparecer tras retirarlo: por eso no ' +
       'sirve en dolor inestable. Indicado sobre todo cuando la vía oral no está disponible ' +
       '(disfagia, obstrucción, vómitos). Instruir a doblar el parche usado sobre sí mismo antes de ' +
       'descartarlo: los parches usados conservan fentanilo suficiente para matar a un chico.'
},

buprenorfina_td:{
  nombre:'Buprenorfina transdérmica', grupo:'Opioide', clase:'Agonista parcial mu', mme:12.6,
  presentaciones:['Parches de 5, 10 y 20 mcg/h'],
  inicio:'5 mcg/h, cambio cada 7 días',
  titulacion:'Subir cada 7 días',
  maxima:'20 mcg/h en las presentaciones habituales',
  ajusteRenal:'SEGURA en insuficiencia renal y en diálisis. Es la mejor opción en el renal crónico',
  ajusteHepatico:'Precaución',
  adversos:'Menos constipación y menos efecto sobre el eje hormonal que los agonistas puros. Reacción cutánea local',
  contraindicaciones:[],
  interacciones:'Menos que otros opioides',
  evidencia:{linea:'Buena opción en el adulto mayor y en el paciente renal', calidad:'Moderada'},
  monitoreo:'Sedación y piel',
  nota:'Techo de depresión respiratoria por ser agonista parcial, lo que la hace más segura. ' +
       'Su alta afinidad por el receptor mu puede desplazar a otros opioides: ojo al rotar.'
},

tapentadol:{
  nombre:'Tapentadol', grupo:'Opioide', clase:'Agonista mu más inhibición de recaptación de noradrenalina', mme:0.4,
  presentaciones:['Comprimidos de liberación prolongada 50, 100, 150, 200 y 250 mg'],
  inicio:'50 mg cada 12 h',
  titulacion:'Subir 50 mg cada 3 días',
  maxima:'500 mg/día',
  ajusteRenal:'No recomendado con filtrado <30 ml/min',
  ajusteHepatico:'No recomendado en insuficiencia moderada a severa',
  adversos:'Menos constipación y náuseas que la oxicodona a igual analgesia',
  contraindicaciones:['IMAO','Insuficiencia renal o hepática severas'],
  interacciones:'Serotoninérgicos',
  evidencia:{linea:'Opción cuando el componente neuropático coexiste con el nociceptivo', calidad:'Moderada'},
  monitoreo:'Igual que los demás opioides',
  nota:'Su doble mecanismo lo hace atractivo en dolor mixto, por ejemplo lumbociatalgia o dolor ' +
       'oncológico con componente neuropático. Su disponibilidad y costo en Argentina son limitantes reales.'
},

/* ===================================================================== */
/* COADYUVANTES                                                          */
/* ===================================================================== */

ciclobenzaprina:{
  nombre:'Ciclobenzaprina', grupo:'Coadyuvante', clase:'Relajante muscular de acción central',
  presentaciones:['Comprimidos 5 mg y 10 mg'],
  inicio:'5 a 10 mg por la noche',
  maxima:'30 mg/día',
  ajusteRenal:'Sin ajuste', ajusteHepatico:'Reducir; evitar en hepatopatía severa',
  adversos:'Somnolencia, boca seca, mareo',
  contraindicaciones:['Infarto reciente','Arritmias','Hipertiroidismo','IMAO'],
  interacciones:'Suma sedación; es un tricíclico estructural, con riesgo serotoninérgico',
  evidencia:{linea:'Ciclos cortos en contractura y dolor miofascial', calidad:'Modesta'},
  nota:'No más de 2 a 3 semanas. En dosis baja nocturna ayuda al sueño en fibromialgia.'
},

baclofeno:{
  nombre:'Baclofeno', grupo:'Coadyuvante', clase:'Agonista GABA-B',
  presentaciones:['Comprimidos 10 mg y 25 mg','Presentación intratecal'],
  inicio:'5 mg cada 8 h',
  titulacion:'Subir 5 mg cada 3 días',
  maxima:'80 mg/día por vía oral',
  ajusteRenal:'Reducir mucho: se acumula y produce encefalopatía en el renal crónico',
  ajusteHepatico:'Precaución',
  adversos:'Somnolencia, debilidad, náuseas, confusión en el adulto mayor',
  contraindicaciones:[],
  interacciones:'Suma sedación',
  evidencia:{linea:'Espasticidad y neuralgia del trigémino como coadyuvante', calidad:'Moderada'},
  nota:'NUNCA suspender bruscamente, y menos el intratecal: el síndrome de abstinencia cursa con ' +
       'espasticidad de rebote, fiebre, rabdomiólisis y puede ser mortal.'
},

toxina_botulinica:{
  nombre:'Toxina botulínica tipo A', grupo:'Coadyuvante', clase:'Bloqueante de la liberación de acetilcolina',
  presentaciones:['Viales de 100 y 200 U'],
  inicio:'Según protocolo por indicación. En migraña crónica, protocolo PREEMPT de 155 a 195 U',
  maxima:'Repetir cada 12 semanas',
  ajusteRenal:'Sin ajuste', ajusteHepatico:'Sin ajuste',
  adversos:'Debilidad local, ptosis, disfagia si difunde en el cuello, dolor en el sitio de inyección',
  contraindicaciones:['Miastenia gravis y otros trastornos de la placa neuromuscular','Infección en el sitio'],
  interacciones:'Aminoglucósidos potencian el bloqueo neuromuscular',
  evidencia:{linea:'Migraña crónica (evidencia alta); dolor miofascial y neuropático localizado (moderada)', calidad:'Variable según indicación'},
  nota:'En migraña crónica la indicación exige 15 o más días de cefalea al mes durante al menos 3 meses.'
},

ketamina_ev:{
  nombre:'Ketamina en infusión', grupo:'Coadyuvante', clase:'Antagonista NMDA',
  presentaciones:['Ampollas 50 mg/ml'],
  inicio:'0,1 a 0,5 mg/kg/h en infusión, en ámbito monitorizado',
  maxima:'Según protocolo institucional',
  ajusteRenal:'Precaución', ajusteHepatico:'Precaución',
  adversos:'Efectos psicotomiméticos y disociativos, hipertensión, taquicardia, sialorrea, ' +
           'hepatotoxicidad con infusiones repetidas',
  contraindicaciones:['Psicosis activa','Hipertensión no controlada','Hipertensión endocraneana',
                      'Insuficiencia hepática'],
  interacciones:'Benzodiacepinas atenúan los efectos psicotomiméticos',
  evidencia:{linea:'Dolor refractario con sensibilización central; SDRC; dolor oncológico refractario', calidad:'Moderada, ' +
             'con efecto que suele ser transitorio'},
  monitoreo:'Monitoreo continuo durante la infusión, hepatograma si se repiten los ciclos',
  nota:'Requiere ámbito con monitoreo y personal entrenado. Como anestesiólogo tenés la ventaja de ' +
       'poder ofrecerla con seguridad, pero conviene protocolizar el ámbito, el consentimiento y el ' +
       'seguimiento antes de empezar a usarla en consultorio.'
},

lidocaina_ev:{
  nombre:'Lidocaína en infusión endovenosa', grupo:'Coadyuvante', clase:'Bloqueante de canales de sodio',
  presentaciones:['Ampollas al 1% y 2% sin epinefrina'],
  inicio:'1 a 5 mg/kg en 30 a 60 minutos, con monitoreo cardíaco',
  maxima:'Según protocolo',
  ajusteRenal:'Precaución', ajusteHepatico:'Reducir: se metaboliza en hígado',
  adversos:'Sabor metálico, parestesia peribucal, mareo, tinnitus (signos precoces de toxicidad), ' +
           'convulsiones y arritmias si se excede',
  contraindicaciones:['Bloqueo cardíaco','Insuficiencia cardíaca severa','Alergia a amidas','Epilepsia no controlada'],
  interacciones:'Antiarrítmicos, betabloqueantes',
  evidencia:{linea:'Dolor neuropático refractario', calidad:'Moderada, efecto transitorio'},
  monitoreo:'ECG continuo, presión arterial. Debe haber emulsión lipídica al 20% disponible',
  nota:'Terreno propio del anestesiólogo. Exige monitoreo, consentimiento y disponibilidad de ' +
       'rescate lipídico ante toxicidad sistémica por anestésicos locales.'
},

corticoide_oral:{
  nombre:'Corticoide oral (meprednisona o dexametasona)', grupo:'Coadyuvante', clase:'Glucocorticoide',
  presentaciones:['Meprednisona 4, 8, 16 y 40 mg','Dexametasona 4 y 8 mg'],
  inicio:'Meprednisona 0,5-1 mg/kg/día, o dexametasona 4-8 mg/día',
  maxima:'Ciclos cortos de 5 a 7 días, con descenso',
  ajusteRenal:'Sin ajuste', ajusteHepatico:'Sin ajuste',
  adversos:'Hiperglucemia, insomnio, agitación, gastrolesividad sumada al AINE, retención hidrosalina. ' +
           'Con uso prolongado: osteoporosis, supresión suprarrenal, infecciones',
  contraindicaciones:['Infección sistémica no tratada','Úlcera activa'],
  interacciones:'AINE (sangrado digestivo), hipoglucemiantes',
  evidencia:{linea:'Brote agudo radicular, compresión nerviosa tumoral, capsulitis', calidad:'Modesta y transitoria'},
  nota:'Sin lugar como tratamiento de fondo del dolor crónico. En el paciente oncológico con ' +
       'compresión nerviosa o hipertensión endocraneana, la dexametasona es de primera línea.'
},

dexametasona:{
  nombre:'Dexametasona', grupo:'Coadyuvante', clase:'Glucocorticoide',
  presentaciones:['Comprimidos 4 y 8 mg','Ampollas 4 y 8 mg'],
  inicio:'4 a 8 mg/día; hasta 16 mg/día en compresión medular',
  maxima:'Según indicación, con descenso programado',
  ajusteRenal:'Sin ajuste', ajusteHepatico:'Sin ajuste',
  adversos:'Los del grupo, con menos retención hidrosalina que la meprednisona',
  contraindicaciones:['Infección sistémica no tratada'],
  interacciones:'AINE, hipoglucemiantes',
  evidencia:{linea:'Dolor oncológico por compresión, dolor óseo y hepatomegalia dolorosa', calidad:'Buena en esas indicaciones'},
  nota:'Darla siempre a la mañana para no arruinar el sueño. En compresión medular metastásica ' +
       'se inicia de inmediato, antes incluso de la imagen.'
},

bifosfonatos:{
  nombre:'Bifosfonatos (ácido zoledrónico, pamidronato)', grupo:'Coadyuvante', clase:'Inhibidor de la resorción ósea',
  presentaciones:['Ácido zoledrónico 4 mg EV','Pamidronato 90 mg EV'],
  inicio:'Ácido zoledrónico 4 mg EV cada 4 semanas',
  maxima:'Según protocolo oncológico',
  ajusteRenal:'Ajustar por filtrado; contraindicado con filtrado <30 ml/min',
  ajusteHepatico:'Sin ajuste',
  adversos:'Síndrome pseudogripal tras la primera dosis, hipocalcemia, ' +
           'OSTEONECROSIS MANDIBULAR, fractura atípica de fémur',
  contraindicaciones:['Insuficiencia renal severa','Hipocalcemia no corregida'],
  interacciones:'Aminoglucósidos (hipocalcemia)',
  evidencia:{linea:'Dolor óseo metastásico y SDRC en fase temprana', calidad:'Buena'},
  monitoreo:'Calcemia, función renal, y EVALUACIÓN ODONTOLÓGICA ANTES de iniciar',
  nota:'La evaluación odontológica previa no es un trámite: la osteonecrosis mandibular se previene ' +
       'resolviendo los focos sépticos antes de la primera dosis, y no tiene buen tratamiento después.'
},

vitamina_c:{
  nombre:'Vitamina C (ácido ascórbico)', grupo:'Coadyuvante', clase:'Antioxidante',
  presentaciones:['Comprimidos 500 mg y 1 g'],
  inicio:'500 mg/día',
  maxima:'500 mg/día por 50 días',
  ajusteRenal:'Precaución en litiasis por oxalato', ajusteHepatico:'Sin ajuste',
  adversos:'Molestias digestivas',
  contraindicaciones:['Litiasis renal por oxalato'],
  interacciones:'Ninguna relevante',
  evidencia:{linea:'PREVENCIÓN del SDRC tras fractura de muñeca', calidad:'Moderada'},
  nota:'Barato, inocuo y con evidencia razonable en prevención. Vale la pena indicarlo en toda ' +
       'fractura de radio distal.'
},

diazepam_vaginal:{
  nombre:'Diazepam en supositorio vaginal', grupo:'Coadyuvante', clase:'Benzodiacepina de acción local',
  presentaciones:['Preparación magistral 5 a 10 mg'],
  inicio:'5 a 10 mg por la noche',
  maxima:'10 mg/día',
  ajusteRenal:'Sin ajuste', ajusteHepatico:'Reducir',
  adversos:'Somnolencia si hay absorción sistémica significativa',
  contraindicaciones:['Antecedente de dependencia a benzodiacepinas','Miastenia gravis'],
  interacciones:'Suma sedación con opioides',
  evidencia:{linea:'Hipertonía del piso pelviano', calidad:'Baja, con buena experiencia clínica'},
  nota:'Se usa junto con la kinesiología del piso pelviano, no en lugar de ella.'
},

cannabinoides:{
  nombre:'Cannabinoides (CBD y THC)', grupo:'Coadyuvante', clase:'Agonista del sistema endocannabinoide',
  presentaciones:['Aceites de distinta proporción CBD:THC, según el marco de la Ley 27.350 y su reglamentación'],
  inicio:'Dosis baja nocturna, con titulación muy lenta',
  maxima:'Según tolerancia',
  ajusteRenal:'Precaución', ajusteHepatico:'Precaución',
  adversos:'Mareo, sedación, sequedad bucal, alteración cognitiva, taquicardia; con THC, riesgo psiquiátrico',
  contraindicaciones:['Antecedente psicótico','Embarazo y lactancia','Menores, salvo indicación específica'],
  interacciones:'Suma sedación; interfiere con el CYP',
  evidencia:{linea:'Tercera o cuarta línea', calidad:'Débil en dolor crónico en general; algo mejor ' +
             'en espasticidad y dolor de esclerosis múltiple'},
  nota:'En Argentina el uso está regulado por la Ley 27.350 y el REPROCANN. La expectativa del ' +
       'paciente suele ser mucho mayor que la evidencia disponible, y conviene conversarlo antes ' +
       'de empezar y no después.'
}

};

/* =========================================================================
   MILIGRAMOS EQUIVALENTES DE MORFINA (MME)
   -------------------------------------------------------------------------
   Factores de conversion de la guia del CDC 2022. El MME diario total es
   la unidad con la que se mide la carga opioide de un paciente y la que
   define los umbrales de precaucion.

   ADVERTENCIA que la aplicacion repite cada vez que muestra un MME: estos
   factores sirven para MEDIR la exposicion total, no para ROTAR de un
   opioide a otro. Al rotar hay que reducir entre 25% y 50% por tolerancia
   cruzada incompleta, y con la metadona el ajuste es mucho mayor y no lineal.
   ========================================================================= */
const MME_FACTOR = {
  codeina:0.15, tramadol:0.2, tapentadol:0.4, morfina:1, hidrocodona:1,
  oxicodona:1.5, oximorfona:3, hidromorfona:5,
  fentanilo_td:2.4,        // por mcg/h
  buprenorfina_td:12.6     // por mcg/h
};

/* La metadona no tiene un factor unico: crece con la dosis. */
const MME_METADONA = [
  {hasta:20,  factor:4},
  {hasta:40,  factor:8},
  {hasta:60,  factor:10},
  {hasta:Infinity, factor:12}
];

function mmeDeMetadona(mgDia) {
  for (const t of MME_METADONA) if (mgDia <= t.hasta) return mgDia * t.factor;
  return mgDia * 12;
}

/* Calcula el MME diario total de una lista de opioides.
   Cada item: {id, mgDia} para los orales, o {id, mcgHora} para los parches. */
function calcularMME(opioides) {
  let total = 0;
  const detalle = [];
  for (const o of (opioides || [])) {
    let mme = 0;
    if (o.id === 'metadona') {
      mme = mmeDeMetadona(Number(o.mgDia) || 0);
    } else if (o.id === 'fentanilo_td' || o.id === 'buprenorfina_td') {
      mme = (Number(o.mcgHora) || 0) * MME_FACTOR[o.id];
    } else if (MME_FACTOR[o.id] != null) {
      mme = (Number(o.mgDia) || 0) * MME_FACTOR[o.id];
    }
    total += mme;
    if (mme > 0) detalle.push({id:o.id, mme:Math.round(mme)});
  }
  total = Math.round(total);

  let nivel, color, aviso;
  if (total === 0)       { nivel='Sin opioides';  color='verde';  aviso=''; }
  else if (total < 50)   { nivel='Dosis baja';    color='lima';
    aviso='Rango habitual. Revalorar beneficio funcional en cada control.'; }
  else if (total < 90)   { nivel='Precaución';    color='ambar';
    aviso='≥50 MME/día: justificar la indicación por escrito, ofrecer naloxona domiciliaria y ' +
          'evaluar riesgo de sobredosis. Evitar benzodiacepinas concomitantes.'; }
  else                   { nivel='Dosis alta';    color='rojo';
    aviso='≥90 MME/día: el riesgo de sobredosis se multiplica. Revisar la indicación, considerar ' +
          'descenso gradual, naloxona domiciliaria e interconsulta. Descender siempre de a 10% cada ' +
          '2-4 semanas en tratamientos largos, nunca de golpe.'; }

  return {total, nivel, color, aviso, detalle,
    nota:'Los MME miden exposición total. NO usar estos factores para rotar de un opioide a otro ' +
         'sin reducir 25-50% por tolerancia cruzada incompleta.'};
}
