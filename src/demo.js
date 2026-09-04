/* =========================================================================
   PACIENTES DE PRUEBA
   -------------------------------------------------------------------------
   Seis historias inventadas que, entre todas, recorren TODA la aplicacion.
   Sirven para conocerla sin cargar nada y para probar cambios sin tocar
   pacientes reales.

   Que muestra cada una:

     1. Ramón Gómez        radiculopatía L5-S1 en diabético
                           → fenotipo neuropático PROBABLE, diferencial,
                             CUATRO alertas de seguridad farmacológica,
                             evolución con mejoría, efectividad media
     2. Silvia Ferreyra    fibromialgia
                           → fenotipo nociplástico, criterios ACR 2016
                             calculados desde el mapa, "evitar opioides",
                             escalas psicológicas completas
     3. Héctor Barrionuevo dolor oncológico con metástasis óseas
                           → BANDERAS ROJAS urgentes, carga opioide alta,
                             dolor irruptivo, ECOG
     4. Nadia Kaufmann     SDRC tipo I de muñeca
                           → criterios de Budapest, signos autonómicos,
                             consentimiento informado emitido y firmado
     5. Carlos Duarte      síndrome facetario lumbar, anticoagulado
                           → bloqueo diagnóstico hecho, radiofrecuencia
                             planificada, tabla de suspensión de
                             anticoagulantes, buena efectividad
     6. Marta Ojeda        postoperatorio de toracotomía
                           → módulo de dolor agudo, controles en reposo y
                             en movimiento, escala de sedación

   Ademas se carga UNA PRECARGA sin tomar, para probar el circuito completo
   del portal del paciente: llega, se revisa y se toma en consulta.

   Todos llevan la marca  demo:true  y se pueden borrar de una sola vez.
   ========================================================================= */
'use strict';

/* Fecha relativa a hoy, para que las historias no envejezcan. */
function haceDias(n) {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString().slice(0, 10);
}

function base(datos) {
  const p = pacienteNuevo();
  p.demo = true;
  return Object.assign(p, datos);
}

function pacientesDemo() {
  const L = [];

  /* ------------------------------------------------------------------ 1 */
  const p1 = base({
    apellido:'Gómez', nombre:'Ramón', dni:'10234567', fechaNac:'1962-04-11',
    sexo:'M', obraSocial:'PAMI', afiliado:'150-2345678-00',
    telefono:'2901 45-2233', email:'', ocupacion:'Jubilado, ex operario metalúrgico',
    derivante:'Dr. Sosa, clínica médica', creado:haceDias(210)
  });
  p1.antecedentes = {
    enfermedades:'Diabetes tipo 2 de 12 años de evolución. Hipertensión arterial. ' +
      'Dislipemia. Última hemoglobina glicosilada 8,4%.',
    cirugias:'Colecistectomía laparoscópica, 2009.',
    alergias:'Ninguna conocida.',
    familiares:'Padre diabético. Madre con artrosis.',
    habitos:'Ex tabaquista, 20 paquetes-año, dejó hace 6 años. No alcohol. Sedentario. ' +
      'Duerme mal desde que empezó el dolor.',
    medicacionNoDolor:'Metformina 1 g cada 12 h. Enalapril 10 mg/día. Atorvastatina 20 mg/noche.',
    filtrado:42,
    banderas:[],
    etiquetas:['diabetes','cardiopatia','obesidad']
  };
  p1.dolor = {
    inicio:haceDias(300), mecanismo:'Levantando una garrafa. Dolor lumbar agudo que a los ' +
      'pocos días bajó por la pierna derecha.',
    descripcion:'Un ardor que baja por atrás de la pierna hasta el dedo gordo. A veces ' +
      'siente corrientazos. La planta del pie la tiene dormida.',
    descriptores:['quemante','electrico','hormigueo'],
    nrsAhora:5, nrsPromedio:8, nrsPeor:10, nrsMejor:4,
    patron:'constante', peorMomento:'de noche y al levantarse',
    irradiacion:'Baja por la cara posterior de la pierna derecha hasta el pie.',
    alivia:'Acostado de costado con una almohada entre las piernas.',
    empeora:'Al toser, al estar sentado más de veinte minutos, al caminar más de tres cuadras.',
    meses:10, fechaHistoria:haceDias(210),
    mapa:[{v:'d',x:100,y:212,i:7},{v:'d',x:118,y:243,i:8},{v:'d',x:116,y:300,i:8},
          {v:'d',x:113,y:412,i:9},{v:'f',x:86,y:432,i:8},{v:'f',x:80,y:492,i:9}]
  };
  p1.impacto = {
    sueño:'Se despierta tres o cuatro veces por noche. Duerme unas cuatro horas.',
    trabajo:'Está jubilado, pero dejó la huerta y las changas que hacía.',
    animo:'Irritable. Dice que se siente inútil.',
    dejoDeHacer:'La huerta, salir a caminar, jugar con los nietos en el piso.',
    objetivos:[{t:'Dormir cinco noches seguidas sin despertarme por el dolor', logrado:false},
               {t:'Caminar hasta la plaza y volver, seis cuadras', logrado:true},
               {t:'Volver a atender la huerta media hora por día', logrado:false}]
  };
  p1.examen = {
    signos:['lasegue','hipoestesia','rot_disminuido','alodinia','debilidad'],
    texto:'Marcha antálgica con descarga sobre el miembro izquierdo. Rectificación de la ' +
      'lordosis lumbar. Dolor a la palpación paravertebral L4-L5 y L5-S1 derecha. ' +
      'Lasègue derecho positivo a 40°. Bragard positivo. Hipoestesia en cara lateral de ' +
      'pierna y dorso del pie derecho. Reflejo aquiliano derecho disminuido. ' +
      'Fuerza para la flexión dorsal del hallux 4/5 a derecha. Alodinia al roce en el ' +
      'dorso del pie. Pulsos periféricos presentes y simétricos.',
    observaciones:'Examen del pie con monofilamento: percibe 8 de 10 puntos en el pie ' +
      'izquierdo y 5 de 10 en el derecho.'
  };
  p1.escalas = {
    dn4:{items:[1,0,1,1,1,1,0,1,1,0], total:7, fecha:haceDias(210)},
    odi:{items:[], total:52, fecha:haceDias(210)},
    pcs:{items:[], total:34, fecha:haceDias(210)},
    pseq:{items:[], total:24, fecha:haceDias(210)},
    isi:{items:[], total:19, fecha:haceDias(210)},
    pgic:{items:[6], total:6, fecha:haceDias(20)},
    ort:{items:[], total:2, fecha:haceDias(210)}
  };
  p1.medicacion = [
    {id:uid('med'), farmaco:'pregabalina', dosis:'150 mg', frecuencia:'cada 12 hs',
     desde:haceDias(200), nrsInicio:8},
    {id:uid('med'), farmaco:'duloxetina', dosis:'60 mg', frecuencia:'cada 24 hs',
     desde:haceDias(150), nrsInicio:7},
    {id:uid('med'), farmaco:'tramadol', dosis:'50 mg', frecuencia:'cada 8 hs',
     desde:haceDias(200), nrsInicio:8},
    {id:uid('med'), farmaco:'aine', dosis:'600 mg', frecuencia:'cada 8 hs',
     desde:haceDias(200), nrsInicio:8}
  ];
  p1.mmeBasal = 0;
  p1.tratamientosPrevios = [
    {que:'Kinesiología, 20 sesiones', cuando:'2025', resultado:'Igual',
     obs:'Abandonó porque le aumentaba el dolor'},
    {que:'Meloxicam y diclofenac', cuando:'2025', resultado:'Mejoró',
     obs:'Alivio parcial y transitorio'},
    {que:'Corticoide oral, ciclo corto', cuando:'2025', resultado:'Mejoró',
     obs:'Muy buena respuesta la primera semana, después volvió'}
  ];
  p1.diagnostico = {
    sindrome:'Radiculopatía lumbosacra (lumbociatalgia)', sindromeId:'radiculopatia_lumbar',
    mecanismo:'neuropatico', icd:'MG30.50 — Dolor neuropático periférico crónico',
    grado:'probable', aceptadoDeMotor:true, fecha:haceDias(210),
    texto:'Radiculopatía L5-S1 derecha, sobre una polineuropatía diabética de base. ' +
      'El componente radicular es el que domina el cuadro: distribución unilateral ' +
      'en territorio L5-S1, Lasègue positivo, reflejo aquiliano disminuido y déficit ' +
      'motor incipiente para la flexión dorsal del hallux. La polineuropatía diabética ' +
      'coexiste y explica la hipoestesia distal bilateral en calcetín, pero no el dolor ' +
      'unilateral irradiado. Descartada estenosis de canal por la ausencia de ' +
      'claudicación neurógena.'
  };
  p1.plan = {
    objetivo:'Recuperar la marcha a seis cuadras y el sueño continuo. Vigilar el déficit ' +
      'motor: si progresa, cambia la conducta.',
    texto:'Pregabalina 150 mg cada 12 h — REVISAR: con filtrado de 42 ml/min corresponde ' +
      'la mitad de la dosis.\nDuloxetina 60 mg/día.\nSuspender el tramadol: suma riesgo ' +
      'serotoninérgico con la duloxetina y no aporta.\nSuspender el AINE por la función renal.\n' +
      'Agregar laxante osmótico mientras siga con opioide.\nPautas de alarma explicadas ' +
      'al paciente y a la hija.',
    estudios:['RMN de columna lumbosacra sin contraste',
              'Electromiograma de miembros inferiores con velocidad de conducción',
              'Hemoglobina glicosilada, vitamina B12, TSH, función renal'],
    noFarmacologico:['Kinesiología con progresión a ejercicio activo, sin reposo prolongado',
                     'Educación en dolor y desdramatización de la imagen',
                     'Programa de marcha progresiva',
                     'Higiene del sueño'],
    derivaciones:['Diabetología, para optimizar el control glucémico'],
    procedimientos:['epidural_transforaminal']
  };
  p1.evoluciones = [
    {fecha:haceDias(160), nrs:7, texto:'Tolera la pregabalina. Sigue despertándose de noche. ' +
      'Empezó kinesiología.', cambios:'Se agrega duloxetina 30 mg y se sube a 60 mg a la semana.',
     escalas:{}, adversos:[{t:'somnolencia matinal', grave:false}]},
    {fecha:haceDias(100), nrs:6, texto:'Camina cuatro cuadras. Duerme mejor pero todavía ' +
      'se despierta dos veces. La RMN muestra hernia L5-S1 posterolateral derecha con ' +
      'compromiso de la raíz S1.', cambios:'Se mantiene el esquema. Se solicita ' +
      'interconsulta para bloqueo transforaminal.',
     escalas:{odi:44}, adversos:[]},
    {fecha:haceDias(45), nrs:5, texto:'Bloqueo epidural transforaminal S1 derecho realizado ' +
      'hace tres semanas, con dexametasona. Alivio del 60% sostenido. Camina seis cuadras. ' +
      'El déficit del hallux no progresó.',
     cambios:'Se suspende el ketorolac que se había automedicado.',
     escalas:{odi:36}, adversos:[]},
    {fecha:haceDias(20), nrs:5, texto:'Estable. Retomó la huerta de a ratos. Sigue el dolor ' +
      'nocturno pero duerme de corrido casi todas las noches.',
     cambios:'Sin cambios. Se refuerza la indicación de suspender el tramadol.',
     escalas:{odi:34, pgic:6, bpi:4}, adversos:[]}
  ];
  p1.consentimientos = [{idProc:'epidural_transforaminal',
    procedimiento:'Bloqueo epidural transforaminal con corticoide',
    fecha:haceDias(50), firmado:true}];
  p1.proximoControl = haceDias(-25);
  p1.notas = 'Vive solo. La hija lo acompaña a los controles. Buena adherencia.';
  L.push(p1);

  /* ------------------------------------------------------------------ 2 */
  const p2 = base({
    apellido:'Ferreyra', nombre:'Silvia', dni:'27890123', fechaNac:'1979-08-22',
    sexo:'F', obraSocial:'OSDE 210', telefono:'2901 51-8890',
    email:'silvia.ferreyra@ejemplo.com', ocupacion:'Docente de primaria',
    derivante:'Reumatología', creado:haceDias(120)
  });
  p2.antecedentes = {
    enfermedades:'Colon irritable. Migraña episódica. Hipotiroidismo en tratamiento.',
    cirugias:'Cesárea, 2011.',
    alergias:'Ninguna conocida.',
    familiares:'Madre con fibromialgia y depresión.',
    habitos:'No fuma. No alcohol. Sedentaria por el dolor. Sueño muy fragmentado.',
    medicacionNoDolor:'Levotiroxina 75 mcg/día.',
    filtrado:'', banderas:[],
    etiquetas:['hipotiroidismo','depresion','fibromialgia']
  };
  p2.dolor = {
    inicio:haceDias(1100),
    mecanismo:'Sin causa clara. Empezó en el cuello y los hombros y se fue extendiendo.',
    descripcion:'Me duele todo el cuerpo. Es un dolor sordo, como si me hubieran golpeado. ' +
      'Amanezco peor que cuando me acuesto. No tolero que me abracen fuerte.',
    descriptores:['sordo','rigidez','opresivo'],
    nrsAhora:6, nrsPromedio:7, nrsPeor:9, nrsMejor:5,
    patron:'constante', peorMomento:'a la mañana al levantarse',
    irradiacion:'Generalizado, sin un recorrido definido.',
    alivia:'El agua caliente. Los días de calor.',
    empeora:'El frío, el estrés, dormir mal, el ruido.',
    meses:36, fechaHistoria:haceDias(120),
    mapa:[{v:'d',x:70,y:82,i:7},{v:'d',x:130,y:82,i:7},{v:'d',x:100,y:60,i:8},
          {v:'d',x:100,y:120,i:6},{v:'d',x:100,y:212,i:8},{v:'d',x:75,y:245,i:6},
          {v:'d',x:125,y:245,i:6},{v:'f',x:52,y:130,i:6},{v:'f',x:148,y:130,i:6},
          {v:'f',x:82,y:300,i:7},{v:'f',x:118,y:300,i:7},{v:'f',x:80,y:420,i:6},
          {v:'f',x:120,y:420,i:6},{v:'f',x:40,y:200,i:5},{v:'f',x:160,y:200,i:5}]
  };
  p2.impacto = {
    sueño:'Se despierta cinco o seis veces. Nunca amanece descansada.',
    trabajo:'Pidió licencia dos veces este año. Le cuesta sostener la jornada.',
    animo:'Llora con facilidad. Dice que nadie le cree.',
    dejoDeHacer:'Natación, salir con amigas, cocinar los domingos.',
    objetivos:[{t:'Sostener la semana completa de clases sin faltar', logrado:false},
               {t:'Volver a la pileta dos veces por semana', logrado:false}]
  };
  p2.examen = {
    signos:['hiperalgesia','hipersensibilidad_estimulos','sueño_no_reparador','fatiga',
            'sintomas_cognitivos','punto_gatillo','banda_tensa'],
    texto:'Dolor a la palpación difuso en múltiples regiones, sin artritis ni sinovitis. ' +
      'Rango articular conservado. Fuerza 5/5 globalmente. Reflejos normales y simétricos. ' +
      'Sensibilidad conservada. Sin déficit focal. Hiperalgesia a la presión digital ' +
      'moderada en trapecios, glúteos y cara interna de rodillas. Refiere molestia ' +
      'importante con la luz del consultorio.',
    observaciones:'Trae tres carpetas de estudios normales de los últimos dos años.'
  };
  p2.escalas = {
    dn4:{items:[0,0,0,1,0,1,0,0,0,0], total:2, fecha:haceDias(120)},
    csi:{items:[], total:58, fecha:haceDias(120)},
    acr2016:{items:[3,3,2,1,1,1], total:11, fecha:haceDias(120)},
    pcs:{items:[], total:41, fecha:haceDias(120)},
    pseq:{items:[], total:18, fecha:haceDias(120)},
    isi:{items:[], total:21, fecha:haceDias(120)},
    phq9:{items:[2,2,3,3,1,2,2,0,0], total:15, fecha:haceDias(120)},
    gad7:{items:[], total:13, fecha:haceDias(120)},
    bpi:{items:[], total:7, fecha:haceDias(120)},
    pgic:{items:[5], total:5, fecha:haceDias(15)}
  };
  p2.medicacion = [
    {id:uid('med'), farmaco:'amitriptilina', dosis:'25 mg', frecuencia:'por la noche',
     desde:haceDias(110), nrsInicio:7},
    {id:uid('med'), farmaco:'duloxetina', dosis:'60 mg', frecuencia:'cada 24 hs',
     desde:haceDias(70), nrsInicio:7}
  ];
  p2.mmeBasal = 0;
  p2.tratamientosPrevios = [
    {que:'Ibuprofeno y diclofenac', cuando:'2023-2024', resultado:'Igual',
     obs:'Sin ningún efecto sobre el dolor'},
    {que:'Tramadol', cuando:'2024', resultado:'Empeoró', obs:'Náuseas y más cansancio'},
    {que:'Corticoides', cuando:'2024', resultado:'Igual', obs:''},
    {que:'Psicoterapia', cuando:'2025', resultado:'Mejoró', obs:'La abandonó por el costo'}
  ];
  p2.diagnostico = {
    sindrome:'Fibromialgia', sindromeId:'fibromialgia', mecanismo:'nociplastico',
    icd:'MG30.01 — Dolor crónico generalizado', grado:'probable',
    aceptadoDeMotor:true, fecha:haceDias(120),
    texto:'Cumple criterios ACR 2016: índice de dolor generalizado 12/19 en las cinco ' +
      'áreas corporales y escala de gravedad de síntomas 11/12, con más de tres meses de ' +
      'evolución. CSI 58/100. No es un diagnóstico de exclusión: tiene criterios positivos. ' +
      'Coexisten catastrofización alta (PCS 41), autoeficacia muy baja (PSEQ 18), insomnio ' +
      'severo y depresión moderada, que son los cuatro factores que más van a condicionar ' +
      'la respuesta al tratamiento.'
  };
  p2.plan = {
    objetivo:'Función, sueño y actividad. El objetivo NO es dolor cero: fijarlo así ' +
      'garantiza el fracaso y ella ya viene de dos años de fracasos.',
    texto:'Amitriptilina 25 mg nocturnos, dos horas antes de acostarse.\n' +
      'Duloxetina 60 mg/día por la depresión asociada.\n' +
      'NO indicar opioides bajo ninguna circunstancia: empeoran el cuadro.\n' +
      'NO repetir estudios ya realizados.\n' +
      'Explicación del mecanismo nociplástico en lenguaje llano, con material escrito.',
    estudios:['Ninguno nuevo. Los estudios previos son suficientes y están normales.'],
    noFarmacologico:['Ejercicio aeróbico progresivo: es la única intervención con ' +
                     'recomendación fuerte de EULAR',
                     'Pileta en agua templada, dos veces por semana, empezando por 15 minutos',
                     'Terapia cognitivo-conductual',
                     'Higiene del sueño y tratamiento del insomnio'],
    derivaciones:['Psicología, para terapia cognitivo-conductual',
                  'Kinesiología con orientación a ejercicio, no a terapia pasiva'],
    procedimientos:[]
  };
  p2.evoluciones = [
    {fecha:haceDias(80), nrs:7, texto:'Tolera la amitriptilina. Duerme algo mejor. ' +
      'Todavía no empezó el ejercicio.', cambios:'Se agrega duloxetina.',
     escalas:{}, adversos:[{t:'boca seca', grave:false}]},
    {fecha:haceDias(45), nrs:6, texto:'Empezó la pileta, dos veces por semana, 15 minutos. ' +
      'Le costó mucho las primeras semanas. Duerme cuatro o cinco horas seguidas.',
     cambios:'Sin cambios de medicación. Se refuerza el ejercicio.',
     escalas:{isi:16}, adversos:[]},
    {fecha:haceDias(15), nrs:6, texto:'Sostiene la pileta y ya hace 30 minutos. No faltó a ' +
      'clases en tres semanas, que es lo que más valora. El dolor no bajó mucho pero ella ' +
      'dice que está mejor.',
     cambios:'Sin cambios.',
     escalas:{isi:14, phq9:11, pgic:5, csi:52, bpi:5}, adversos:[]}
  ];
  p2.proximoControl = haceDias(-40);
  p2.notas = 'Es el caso donde la función mejora antes que el número de la escala. ' +
    'Mostrarle el gráfico de objetivos y no el del dolor.';
  L.push(p2);

  /* ------------------------------------------------------------------ 3 */
  const p3 = base({
    apellido:'Barrionuevo', nombre:'Héctor', dni:'8123456', fechaNac:'1955-01-30',
    sexo:'M', obraSocial:'IPAUSS', telefono:'2901 47-1122',
    ocupacion:'Jubilado', derivante:'Oncología', creado:haceDias(40)
  });
  p3.antecedentes = {
    enfermedades:'Adenocarcinoma de próstata con metástasis óseas en columna dorsolumbar ' +
      'y pelvis. En tratamiento con bloqueo hormonal. EPOC leve.',
    cirugias:'RTU prostática, 2023.',
    alergias:'Alergia a la penicilina.',
    familiares:'Sin datos relevantes.',
    habitos:'Ex tabaquista 40 paquetes-año.',
    medicacionNoDolor:'Bicalutamida. Ácido zoledrónico mensual. Calcio y vitamina D. ' +
      'Salbutamol a demanda.',
    filtrado:58,
    banderas:['cancer','perdida_peso','dolor_nocturno'],
    etiquetas:['cancer','osteoporosis']
  };
  p3.dolor = {
    inicio:haceDias(150),
    mecanismo:'Dolor dorsal que fue apareciendo de a poco y se hizo continuo.',
    descripcion:'Un dolor profundo en la espalda que no cede con nada y que de noche es ' +
      'peor. Por momentos le agarra un dolor que le corta la respiración.',
    descriptores:['sordo','opresivo','punzante'],
    nrsAhora:6, nrsPromedio:7, nrsPeor:10, nrsMejor:4,
    patron:'mixto', peorMomento:'de noche, lo despierta',
    irradiacion:'Se le va como un cinturón hacia adelante.',
    alivia:'La morfina. Estar quieto.',
    empeora:'Moverse en la cama, sentarse, toser.',
    meses:5, fechaHistoria:haceDias(40),
    mapa:[{v:'d',x:100,y:150,i:8},{v:'d',x:100,y:180,i:9},{v:'d',x:82,y:180,i:7},
          {v:'d',x:118,y:180,i:7},{v:'d',x:100,y:240,i:8},{v:'f',x:100,y:175,i:6}]
  };
  p3.impacto = {
    sueño:'Duerme a intervalos de dos horas.',
    trabajo:'Dependiente para bañarse y vestirse. Pasa más de la mitad del día en cama.',
    animo:'Preocupado por ser una carga para la esposa.',
    dejoDeHacer:'Todo lo que hacía fuera de la casa.',
    objetivos:[{t:'Poder sentarme a comer en la mesa con la familia', logrado:false},
               {t:'Dormir cuatro horas seguidas', logrado:false}]
  };
  p3.examen = {
    signos:['hipoestesia'],
    texto:'Adelgazado. Dolor a la percusión de apófisis espinosas D10 a L2. ' +
      'Sin déficit motor en miembros inferiores. Reflejos presentes y simétricos. ' +
      'Tono esfinteriano conservado. Sensibilidad perineal conservada. Marcha con andador.',
    observaciones:'CONTROL NEUROLÓGICO EN CADA CONSULTA: dolor dorsal progresivo en ' +
      'paciente oncológico es compresión medular hasta que se demuestre lo contrario.'
  };
  p3.escalas = {
    dn4:{items:[0,0,1,1,0,1,0,1,0,0], total:4, fecha:haceDias(40)},
    bpi:{items:[], total:8, fecha:haceDias(40)},
    ecog:{items:[3], total:3, fecha:haceDias(40)},
    pgic:{items:[5], total:5, fecha:haceDias(10)},
    ort:{items:[], total:1, fecha:haceDias(40)}
  };
  p3.medicacion = [
    {id:uid('med'), farmaco:'morfina', dosis:'60 mg', frecuencia:'cada 12 hs',
     desde:haceDias(35), nrsInicio:9},
    {id:uid('med'), farmaco:'dexametasona', dosis:'4 mg', frecuencia:'a la mañana',
     desde:haceDias(35)},
    {id:uid('med'), farmaco:'pregabalina', dosis:'75 mg', frecuencia:'cada 12 hs',
     desde:haceDias(30), nrsInicio:8},
    {id:uid('med'), farmaco:'paracetamol', dosis:'1 g', frecuencia:'cada 8 hs',
     desde:haceDias(35)}
  ];
  p3.mmeBasal = 30;
  p3.tratamientosPrevios = [
    {que:'Radioterapia antiálgica sobre D11-D12', cuando:'hace 2 meses', resultado:'Mejoró',
     obs:'Muy buena respuesta las primeras semanas'},
    {que:'Tramadol', cuando:'hace 4 meses', resultado:'Igual', obs:'Insuficiente, se rotó a morfina'}
  ];
  p3.diagnostico = {
    sindrome:'Dolor oncológico', sindromeId:'dolor_oncologico', mecanismo:'mixto',
    icd:'MG30.10 — Dolor crónico por cáncer', grado:'definido',
    aceptadoDeMotor:true, fecha:haceDias(40),
    texto:'Dolor óseo metastásico dorsolumbar, de mecanismo mixto: componente nociceptivo ' +
      'somático dominante más un componente neuropático radicular incipiente (DN4 4/10, ' +
      'dolor en cinturón). Dolor irruptivo incidental al movilizarse, que es lo que más ' +
      'lo limita. Vigilar compresión medular: hoy sin déficit motor ni esfinteriano.'
  };
  p3.plan = {
    objetivo:'Analgesia efectiva sin demora y que pueda sentarse a la mesa. Cuidados ' +
      'paliativos en forma temprana, no al final.',
    texto:'Morfina de liberación prolongada 60 mg cada 12 h.\n' +
      'RESCATE: morfina de liberación inmediata 15 mg (10% de la dosis diaria total), ' +
      'disponible cada 1 hora si hace falta. Si usa más de 3 o 4 rescates por día, se sube la base.\n' +
      'Dexametasona 4 mg a la mañana por el componente de compresión nerviosa.\n' +
      'Pregabalina 75 mg cada 12 h por el componente neuropático.\n' +
      'Paracetamol 1 g cada 8 h como ahorrador de opioide.\n' +
      'Laxante estimulante más osmótico, pautados desde hoy.\n' +
      'Antiemético los primeros días.\n' +
      'PAUTAS DE ALARMA escritas y entregadas a la esposa: debilidad en las piernas, ' +
      'dificultad para orinar o adormecimiento entre las piernas, consultar el mismo día.',
    estudios:['RMN de columna dorsolumbar, para evaluar compresión',
              'Calcemia corregida por albúmina',
              'Centellograma óseo de control'],
    noFarmacologico:['Radioterapia antiálgica sobre nuevas lesiones sintomáticas',
                     'Acompañamiento psicológico al paciente y a la esposa',
                     'Adaptación del domicilio: cama articulada, andador'],
    derivaciones:['Cuidados paliativos','Oncología, para evaluar progresión'],
    procedimientos:['bloqueo_intercostal']
  };
  p3.evoluciones = [
    {fecha:haceDias(25), nrs:7, texto:'Mejor con la morfina. Usa cuatro o cinco rescates por día.',
     cambios:'Se sube la morfina de 40 a 60 mg cada 12 h.',
     escalas:{}, adversos:[{t:'constipación', grave:false},{t:'somnolencia', grave:false}]},
    {fecha:haceDias(10), nrs:6, texto:'Dos rescates por día. Duerme tres horas seguidas. ' +
      'Sigue sin poder sentarse mucho tiempo. Sin déficit neurológico nuevo.',
     cambios:'Se mantiene. Se ajusta el laxante.',
     escalas:{bpi:7, pgic:5}, adversos:[]}
  ];
  p3.proximoControl = haceDias(-4);
  p3.notas = 'Vive con la esposa. Ella es la que administra la medicación. ' +
    'Tiene el teléfono del consultorio y la indicación de llamar sin dudar.';
  L.push(p3);

  /* ------------------------------------------------------------------ 4 */
  const p4 = base({
    apellido:'Kaufmann', nombre:'Nadia', dni:'34567890', fechaNac:'1988-11-03',
    sexo:'F', obraSocial:'Swiss Medical', telefono:'2901 40-7788',
    email:'nadia.kaufmann@ejemplo.com', ocupacion:'Fotógrafa',
    derivante:'Traumatología', creado:haceDias(70)
  });
  p4.antecedentes = {
    enfermedades:'Sin antecedentes de relevancia.',
    cirugias:'Osteosíntesis de radio distal derecho hace cinco meses, tras caída en bicicleta. ' +
      'Inmovilizada seis semanas.',
    alergias:'Ninguna conocida.',
    familiares:'Sin datos relevantes.',
    habitos:'No fuma. Actividad física habitual, suspendida desde la fractura.',
    medicacionNoDolor:'Anticonceptivo oral.',
    filtrado:'', banderas:[],
    etiquetas:['trauma','fractura','inmovilizacion','cirugia']
  };
  p4.dolor = {
    inicio:haceDias(120),
    mecanismo:'Después de que le sacaron el yeso. El dolor no bajó como esperaba, al revés.',
    descripcion:'La mano me arde todo el tiempo. No tolero que me la rocen ni que me toque ' +
      'el agua fría. Cambia de color, a veces se pone violácea y otras muy roja. Está hinchada.',
    descriptores:['quemante','hormigueo'],
    nrsAhora:7, nrsPromedio:8, nrsPeor:10, nrsMejor:6,
    patron:'constante', peorMomento:'todo el día, peor con el frío',
    irradiacion:'Sube hasta el antebrazo.',
    alivia:'Casi nada. El calor seco, un poco.',
    empeora:'El roce, el frío, el movimiento, el estrés.',
    meses:4, fechaHistoria:haceDias(70),
    mapa:[{v:'f',x:38,y:265,i:10},{v:'f',x:45,y:210,i:8},{v:'f',x:48,y:180,i:6},
          {v:'d',x:162,y:265,i:9}]
  };
  p4.impacto = {
    sueño:'El dolor la despierta. No puede apoyar la mano.',
    trabajo:'No puede sostener la cámara. Dejó de trabajar hace tres meses.',
    animo:'Angustiada. Con miedo de que quede así para siempre.',
    dejoDeHacer:'Fotografía, bicicleta, cocinar.',
    objetivos:[{t:'Poder sostener la cámara con las dos manos diez minutos', logrado:false},
               {t:'Que me puedan dar la mano sin que me duela', logrado:false}]
  };
  p4.examen = {
    signos:['alodinia','hiperalgesia','cambio_color','cambio_temperatura','edema',
            'sudoracion','cambios_troficos','rigidez_articular','temblor'],
    texto:'Mano derecha edematizada, con piel brillante y moteada. Temperatura 2,1 °C menor ' +
      'que la contralateral. Sudoración aumentada. Vello más grueso en el dorso. Uñas ' +
      'quebradizas. Alodinia mecánica intensa al roce con algodón en todo el dorso y la ' +
      'palma. Hiperalgesia al pinchazo. Rango de movilidad de muñeca muy limitado, con ' +
      'flexión de 20° y extensión de 15°. Temblor fino de los dedos. Fuerza de prensión ' +
      'no valorable por el dolor. La distribución NO respeta ningún territorio nervioso.',
    observaciones:'CRITERIOS DE BUDAPEST: cumple síntomas en las 4 categorías y signos ' +
      'observados en 4 de 4. Sin otro diagnóstico que lo explique mejor.'
  };
  p4.escalas = {
    dn4:{items:[1,1,0,1,1,0,0,1,1,1], total:7, fecha:haceDias(70)},
    pcs:{items:[], total:38, fecha:haceDias(70)},
    pseq:{items:[], total:21, fecha:haceDias(70)},
    isi:{items:[], total:18, fecha:haceDias(70)},
    phq9:{items:[], total:12, fecha:haceDias(70)},
    pgic:{items:[6], total:6, fecha:haceDias(12)}
  };
  p4.medicacion = [
    {id:uid('med'), farmaco:'pregabalina', dosis:'150 mg', frecuencia:'cada 12 hs',
     desde:haceDias(65), nrsInicio:8},
    {id:uid('med'), farmaco:'amitriptilina', dosis:'25 mg', frecuencia:'por la noche',
     desde:haceDias(65), nrsInicio:8},
    {id:uid('med'), farmaco:'vitamina_c', dosis:'500 mg', frecuencia:'por día',
     desde:haceDias(65)}
  ];
  p4.mmeBasal = 0;
  p4.tratamientosPrevios = [
    {que:'Kinesiología convencional', cuando:'hace 3 meses', resultado:'Empeoró',
     obs:'Movilización pasiva forzada, muy dolorosa. Se reorientó el enfoque.'},
    {que:'Ibuprofeno', cuando:'hace 4 meses', resultado:'Igual', obs:''}
  ];
  p4.diagnostico = {
    sindrome:'Síndrome de dolor regional complejo (SDRC tipo I y II)', sindromeId:'sdrc',
    mecanismo:'mixto', icd:'MG30.04 — Síndrome de dolor regional complejo',
    grado:'probable', aceptadoDeMotor:true, fecha:haceDias(70),
    texto:'SDRC tipo I de mano derecha, posterior a fractura de radio distal e ' +
      'inmovilización. Cumple criterios de Budapest. Es un cuadro tiempo-dependiente: ' +
      'lleva cuatro meses y cada semana de demora en la rehabilitación empeora el ' +
      'pronóstico funcional.'
  };
  p4.plan = {
    objetivo:'Restaurar la función de la mano. La rehabilitación ES el tratamiento; ' +
      'lo demás está para que la rehabilitación sea posible.',
    texto:'Pregabalina 150 mg cada 12 h.\nAmitriptilina 25 mg nocturnos.\n' +
      'Vitamina C 500 mg/día.\nBloqueo de ganglio estrellado en serie, para permitir la ' +
      'rehabilitación.\nNO inmovilizar. NO forzar la movilización pasiva.',
    estudios:['Radiografía comparativa de ambas muñecas',
              'Termografía comparativa',
              'Centellograma óseo trifásico'],
    noFarmacologico:['Rehabilitación funcional precoz e intensiva, activa y no pasiva',
                     'Imaginería motora graduada y terapia con espejo',
                     'Desensibilización progresiva de la mano',
                     'Abordaje psicológico'],
    derivaciones:['Psicología','Terapia ocupacional con experiencia en SDRC'],
    procedimientos:['ganglio_estrellado','bloqueo_simpatico']
  };
  p4.evoluciones = [
    {fecha:haceDias(40), nrs:8, texto:'Primer bloqueo de ganglio estrellado. Horner presente, ' +
      'temperatura de la mano subió 3 °C. Alivio del 70% durante 36 horas, que aprovechó ' +
      'para trabajar con la terapista.',
     cambios:'Se programa serie de tres bloqueos.',
     escalas:{}, adversos:[{t:'ronquera transitoria', grave:false}]},
    {fecha:haceDias(25), nrs:7, texto:'Tercer bloqueo. La alodinia bajó. Ya tolera el roce ' +
      'de la manga. Rango de muñeca: flexión 35°, extensión 30°.',
     cambios:'Sin cambios de medicación.', escalas:{}, adversos:[]},
    {fecha:haceDias(12), nrs:6, texto:'Sostiene la terapia con espejo en casa. Edema menor. ' +
      'Diferencia térmica bajó a 0,8 °C. Puede sostener la cámara apoyada, tres minutos.',
     cambios:'Se espacian los bloqueos.',
     escalas:{pgic:6, pcs:31}, adversos:[]}
  ];
  p4.consentimientos = [{idProc:'ganglio_estrellado',
    procedimiento:'Bloqueo del ganglio estrellado', fecha:haceDias(42), firmado:true}];
  p4.proximoControl = haceDias(-12);
  p4.notas = 'Muy buena adherencia a la rehabilitación. Es el factor que está cambiando el caso.';
  L.push(p4);

  /* ------------------------------------------------------------------ 5 */
  const p5 = base({
    apellido:'Duarte', nombre:'Carlos', dni:'16789012', fechaNac:'1968-06-14',
    sexo:'M', obraSocial:'OSECAC', telefono:'2901 43-5566',
    ocupacion:'Chofer de larga distancia', derivante:'Consulta espontánea',
    creado:haceDias(180)
  });
  p5.antecedentes = {
    enfermedades:'Fibrilación auricular anticoagulada. Hipertensión arterial. Sobrepeso.',
    cirugias:'Ninguna.',
    alergias:'Ninguna conocida.',
    familiares:'Padre con infarto a los 60.',
    habitos:'Fuma 10 cigarrillos por día. Alcohol social. Diez horas sentado al volante.',
    medicacionNoDolor:'Apixabán 5 mg cada 12 h. Bisoprolol 5 mg/día. Losartán 50 mg/día.',
    filtrado:76, banderas:[],
    etiquetas:['cardiopatia','obesidad','anticoagulado']
  };
  p5.dolor = {
    inicio:haceDias(900),
    mecanismo:'Sin un episodio único. Se fue instalando con los años de manejar.',
    descripcion:'Dolor en la cintura, de un lado y del otro, que se me pone duro. Cuando me ' +
      'levanto de la butaca no me puedo enderezar los primeros pasos.',
    descriptores:['sordo','rigidez','opresivo'],
    nrsAhora:4, nrsPromedio:7, nrsPeor:9, nrsMejor:3,
    patron:'intermitente', peorMomento:'al final del día y al levantarse de la butaca',
    irradiacion:'Hasta el glúteo, no pasa la rodilla.',
    alivia:'Sentarse inclinado hacia adelante, caminar un rato, el calor.',
    empeora:'Estar parado mucho tiempo, arquear la espalda hacia atrás, girar el tronco.',
    meses:30, fechaHistoria:haceDias(180),
    mapa:[{v:'d',x:100,y:212,i:7},{v:'d',x:78,y:212,i:6},{v:'d',x:122,y:212,i:6},
          {v:'d',x:80,y:245,i:5},{v:'d',x:120,y:245,i:5},{v:'d',x:82,y:290,i:4}]
  };
  p5.impacto = {
    sueño:'Duerme bien salvo cuando hace viajes largos.',
    trabajo:'Sigue manejando pero le cuesta cada vez más. Le preocupa el carnet.',
    animo:'Fastidiado, no deprimido.',
    dejoDeHacer:'Fútbol los sábados.',
    objetivos:[{t:'Hacer un viaje de ocho horas sin tener que parar por el dolor', logrado:true},
               {t:'Volver a jugar al fútbol una vez por semana', logrado:false}]
  };
  p5.examen = {
    signos:['palpacion_facetaria','rigidez_articular'],
    texto:'Dolor a la palpación de columnas articulares L4-L5 y L5-S1 bilateral. ' +
      'Extensión lumbar limitada y dolorosa, con reproducción del dolor habitual. ' +
      'Rotación dolorosa bilateral. Flexión conservada y sin dolor. Lasègue negativo ' +
      'bilateral. Sin déficit sensitivo ni motor. Reflejos normales y simétricos. ' +
      'Maniobras sacroilíacas negativas.',
    observaciones:'El patrón es claramente facetario: peor en extensión, mejor en flexión, ' +
      'sin componente radicular.'
  };
  p5.escalas = {
    dn4:{items:[0,0,0,0,0,0,0,0,0,0], total:0, fecha:haceDias(180)},
    odi:{items:[], total:38, fecha:haceDias(180)},
    startback:{items:[], total:3, fecha:haceDias(180)},
    pcs:{items:[], total:16, fecha:haceDias(180)},
    pseq:{items:[], total:44, fecha:haceDias(180)},
    pgic:{items:[6], total:6, fecha:haceDias(30)}
  };
  p5.medicacion = [
    {id:uid('med'), farmaco:'aine', dosis:'15 mg', frecuencia:'por día',
     desde:haceDias(170), nrsInicio:7},
    {id:uid('med'), farmaco:'duloxetina', dosis:'60 mg', frecuencia:'cada 24 hs',
     desde:haceDias(140), nrsInicio:7}
  ];
  p5.mmeBasal = 0;
  p5.tratamientosPrevios = [
    {que:'Kinesiología, dos series', cuando:'2024 y 2025', resultado:'Mejoró',
     obs:'Mejora mientras la hace, vuelve al dejarla'},
    {que:'Infiltración facetaria con corticoide', cuando:'2024', resultado:'Igual', obs:''}
  ];
  p5.diagnostico = {
    sindrome:'Síndrome facetario lumbar', sindromeId:'sindrome_facetario_lumbar',
    mecanismo:'nociceptivo', icd:'MG30.3 — Dolor musculoesquelético secundario crónico',
    grado:'', aceptadoDeMotor:true, fecha:haceDias(180),
    texto:'Síndrome facetario lumbar L4-L5 y L5-S1 bilateral, confirmado por bloqueo ' +
      'comparativo doble de rama medial: 90% de alivio por 4 horas con lidocaína y 85% ' +
      'por 9 horas con bupivacaína. Candidato a radiofrecuencia. ATENCIÓN: anticoagulado ' +
      'con apixabán, procedimiento de riesgo intermedio, coordinar la suspensión con ' +
      'cardiología.'
  };
  p5.plan = {
    objetivo:'Sostener la actividad laboral. Denervación por radiofrecuencia una vez ' +
      'confirmado el origen facetario.',
    texto:'Meloxicam 15 mg/día en ciclos, con protección gástrica.\nDuloxetina 60 mg/día.\n' +
      'Radiofrecuencia de ramas mediales L4-L5-S1 bilateral, programada.\n' +
      'Suspensión de apixabán 48 h antes, coordinada con cardiología.',
    estudios:['Radiografía dinámica lumbar','RMN de columna lumbar para planificar los niveles',
              'Bloqueo comparativo doble de rama medial — REALIZADO, positivo'],
    noFarmacologico:['Ejercicio de estabilización lumbar y control motor',
                     'Pausas cada dos horas en los viajes, con caminata de cinco minutos',
                     'Descenso de peso','Cesación tabáquica'],
    derivaciones:['Cardiología, para la suspensión del anticoagulante'],
    procedimientos:['bloqueo_rama_medial_lumbar','radiofrecuencia_lumbar']
  };
  p5.evoluciones = [
    {fecha:haceDias(120), nrs:6, texto:'Mejor con el meloxicam y la kinesiología. ' +
      'Sigue con el dolor al final del día.', cambios:'Se agrega duloxetina.',
     escalas:{odi:34}, adversos:[]},
    {fecha:haceDias(75), nrs:6, texto:'Primer bloqueo diagnóstico de rama medial con ' +
      'lidocaína: 90% de alivio durante 4 horas.',
     cambios:'Se programa el segundo bloqueo con bupivacaína.', escalas:{}, adversos:[]},
    {fecha:haceDias(60), nrs:5, texto:'Segundo bloqueo con bupivacaína: 85% de alivio ' +
      'durante 9 horas. Bloqueo comparativo POSITIVO. Es candidato a radiofrecuencia.',
     cambios:'Se solicita autorización y se coordina la suspensión del apixabán.',
     escalas:{odi:30}, adversos:[]},
    {fecha:haceDias(30), nrs:3, texto:'Radiofrecuencia de ramas mediales L4-L5-S1 bilateral ' +
      'realizada hace tres semanas. Tuvo la neuritis esperable los primeros diez días y ' +
      'ahora está mucho mejor. Hizo un viaje de ocho horas sin parar por el dolor.',
     cambios:'Se suspende el meloxicam. Se mantiene la duloxetina y la kinesiología.',
     escalas:{odi:18, pgic:6}, adversos:[{t:'dolor neurítico postprocedimiento, 10 días', grave:false}]}
  ];
  p5.consentimientos = [
    {idProc:'bloqueo_rama_medial_lumbar', procedimiento:'Bloqueo diagnóstico de rama medial lumbar',
     fecha:haceDias(78), firmado:true},
    {idProc:'radiofrecuencia_lumbar', procedimiento:'Radiofrecuencia de ramas mediales lumbares (denervación facetaria)',
     fecha:haceDias(33), firmado:true}
  ];
  p5.proximoControl = haceDias(-60);
  p5.notas = 'Es el caso que mejor muestra el circuito completo: sospecha clínica, ' +
    'bloqueo comparativo doble, radiofrecuencia y resultado medido.';
  L.push(p5);

  /* ------------------------------------------------------------------ 6 */
  const p6 = base({
    apellido:'Ojeda', nombre:'Marta', dni:'29456789', fechaNac:'1982-02-19',
    sexo:'F', obraSocial:'IPAUSS', telefono:'2901 42-9911',
    ocupacion:'Administrativa', derivante:'Cirugía torácica', creado:haceDias(4)
  });
  p6.ambito = 'agudo';
  p6.antecedentes = {
    enfermedades:'Nódulo pulmonar en lóbulo superior derecho, resecado.',
    cirugias:'Toracotomía posterolateral derecha hace 4 días.',
    alergias:'Ninguna conocida.', familiares:'', habitos:'No fuma.',
    medicacionNoDolor:'', filtrado:'', banderas:[],
    etiquetas:['cirugia','cirugia_torax']
  };
  p6.agudo = {
    tipo:'toracica', cirugia:'Toracotomía posterolateral derecha, lobectomía superior',
    fecha:haceDias(4), cama:'312', servicio:'Cirugía torácica',
    tecnica:'Catéter paravertebral torácico derecho con bupivacaína 0,125% a 8 ml/h. ' +
      'Paracetamol 1 g cada 6 h fijo. Ketorolac 30 mg cada 8 h por 48 h. ' +
      'Morfina de rescate 3 mg EV cada 4 h si el dolor en movimiento supera 4/10.',
    controles:[
      {fecha:haceDias(3), hora:'08:30', nrsReposo:3, nrsMov:7, sedacion:'1',
       nauseas:true, rescates:4,
       texto:'Dolor bien controlado en reposo pero no tolera toser. Kinesiología ' +
         'respiratoria limitada por el dolor. Se sube la infusión del catéter.'},
      {fecha:haceDias(2), hora:'09:00', nrsReposo:2, nrsMov:5, sedacion:'2',
       nauseas:false, rescates:2,
       texto:'Mejor. Tose con almohada. Espirometría incentivada 1200 ml.'},
      {fecha:haceDias(1), hora:'08:45', nrsReposo:2, nrsMov:4, sedacion:'1',
       nauseas:false, rescates:1,
       texto:'Se sentó al borde de la cama y caminó hasta el baño. Espirometría 1600 ml.'},
      {fecha:hoy(), hora:'08:20', nrsReposo:1, nrsMov:3, sedacion:'1',
       nauseas:false, rescates:0,
       texto:'Camina por el pasillo. Se retira el catéter paravertebral y se pasa a ' +
         'esquema oral. Se explican pautas y se advierte sobre el dolor crónico ' +
         'postoracotomía: si a los tres meses persiste, tiene que volver a consultar.'}
    ]
  };
  p6.dolor = {...p6.dolor, nrsPromedio:4, mapa:[{v:'d',x:122,y:120,i:5},{v:'f',x:78,y:110,i:4}]};
  p6.notas = 'Toracotomía: hasta la mitad de los casos deja dolor crónico postquirúrgico. ' +
    'Control a los 3 meses agendado.';
  L.push(p6);

  return L;
}

/* -------------------------------------------------------------------------
   Una precarga sin tomar, para probar el circuito del portal del paciente
   de punta a punta.
   ------------------------------------------------------------------------- */
function precargaDemo() {
  const token = tokenSeguro();
  const d = cuestionarioVacio();
  Object.assign(d, {
    apellido:'Villalba', nombre:'Estela', dni:'21345678', fechaNac:'1971-09-05',
    sexo:'F', email:'estela.villalba@ejemplo.com', telefono:'2901 46-3344',
    obraSocial:'OSPRERA', ocupacion:'Empleada de comercio',
    derivante:'Dra. Aguirre, clínica médica',
    enfermedades:'Hipotiroidismo. Anemia ferropénica el año pasado.',
    cirugias:'Histerectomía en 2019.',
    alergias:'Alergia a la aspirina.',
    familiares:'Madre con artrosis. Hermana con migraña.',
    habitos:'No fumo. Camino poco. Duermo mal desde hace un año.',
    inicio:haceDias(400),
    mecanismo:'Después de un accidente de tránsito, me chocaron de atrás.',
    descripcion:'Me duele el cuello y la nuca todo el tiempo, y de ahí me agarra el dolor ' +
      'de cabeza. A veces me baja hormigueo por el brazo derecho hasta los dedos.',
    descriptores:['opresivo','electrico','hormigueo','rigidez'],
    nrsAhora:6, nrsPromedio:7, nrsPeor:9, nrsMejor:4,
    patron:'constante', peorMomento:'a la tarde, después de trabajar',
    irradiacion:'Del cuello a la nuca y a la cabeza. A veces al brazo derecho.',
    alivia:'El calor, acostarme.',
    empeora:'Estar mucho tiempo en la computadora, girar el cuello, el estrés.',
    mapa:[{v:'d',x:100,y:64,i:7},{v:'d',x:100,y:100,i:8},{v:'d',x:78,y:105,i:6},
          {v:'d',x:100,y:130,i:5},{v:'f',x:100,y:40,i:6},{v:'f',x:52,y:180,i:5},
          {v:'f',x:42,y:265,i:4}],
    tratamientosRecibidos:['kinesiologia','medicacion','psicologia'],
    tratamientos:[
      {que:'Kinesiología, 15 sesiones', cuando:'2025', resultado:'Mejoró',
       obs:'Mejor mientras la hacía'},
      {que:'Ibuprofeno y paracetamol', cuando:'todo 2025', resultado:'Igual',
       obs:'Los tomo casi todos los días'}],
    medicacion:[
      {nombre:'Levotiroxina', dosis:'100 mcg', frecuencia:'en ayunas', desde:'6 años'},
      {nombre:'Ibuprofeno', dosis:'600 mg', frecuencia:'2 o 3 veces por día', desde:'un año'},
      {nombre:'Clonazepam', dosis:'0,5 mg', frecuencia:'a la noche', desde:'8 meses'}],
    sueño:'Me despierto varias veces. Amanezco con el cuello duro.',
    trabajo:'Me cuesta terminar el turno. Falté cuatro veces este mes.',
    animo:'Ando de mal humor y con poca paciencia.',
    dejoDeHacer:'Dejé de tejer y de manejar distancias largas.',
    objetivos:'Poder trabajar la jornada completa sin tomar analgésicos todos los días, ' +
      'y volver a manejar hasta lo de mi hija.',
    dn4:[0,0,1,1,1,1,0],
    phq4:[2,2,1,2],
    banderas:['dolor_nocturno'],
    comentarios:'Quisiera saber si esto tiene solución o si voy a tener que vivir así. ' +
      'Y si puedo dejar el ibuprofeno, porque leí que hace mal al riñón.',
    consiente:true
  });
  return {
    token, dni:d.dni, email:d.email, turno:haceDias(-3),
    creado:haceDias(6), modificado:haceDias(5), enviado:haceDias(5),
    estado:'enviado', demo:true, datos:d
  };
}

/* -------------------------------------------------------------------------
   Cargar y quitar.
   ------------------------------------------------------------------------- */
function cargarDemo() {
  const ps = pacientesDemo();
  for (const p of ps) guardar('pacientes', p.id, p);
  const pre = precargaDemo();
  guardar('precargas', pre.token, pre);
  avisar('Se cargaron ' + ps.length + ' pacientes de prueba y 1 cuestionario del portal.', 'ok');
  volverA(0);
  ventanaInicio();
}

function quitarDemo() {
  let n = 0;
  for (const [id, p] of Object.entries(ESTADO.pacientes)) {
    if (p && p.demo) { borrar('pacientes', id); n++; }
  }
  for (const [t, p] of Object.entries(ESTADO.precargas)) {
    if (p && p.demo) { borrar('precargas', t); n++; }
  }
  avisar('Se quitaron ' + n + ' registros de prueba.', 'ok');
  volverA(0);
  ventanaInicio();
}

function hayDemo() {
  return Object.values(ESTADO.pacientes).some(p => p && p.demo) ||
         Object.values(ESTADO.precargas).some(p => p && p.demo);
}
