/* =========================================================================
   ESCALAS E INSTRUMENTOS VALIDADOS DE DOLOR
   -------------------------------------------------------------------------
   Cada escala trae su enunciado, sus items con el texto exacto en castellano,
   como se puntua y donde estan los puntos de corte publicados. El motor
   clinico no adivina nada: lee de aca.

   Campos de cada escala
     id        clave interna
     sigla     como la nombra el medico
     nombre    nombre completo
     dominio   que mide (intensidad, neuropatico, funcion, animo, sueño...)
     quien     'paciente' | 'medico' | 'mixto'  -- quien la completa
     minutos   cuanto tarda en completarse
     items     [{t: texto, op: [{t: etiqueta, v: valor}]}]
     inverso   indices de items que puntuan al reves (si los hay)
     rango     [min, max] del puntaje total
     cortes    [{hasta, etiqueta, color, nota}] leidos de menor a mayor
     fuente    de donde sale el punto de corte
     ---------------------------------------------------------------------
   Nota sobre las traducciones: se usan las versiones en castellano de uso
   corriente en Argentina. Para trabajos de investigacion conviene usar la
   version validada formalmente de cada instrumento, que en varios casos
   requiere licencia (PainDETECT, WOMAC, EQ-5D).
   ========================================================================= */
'use strict';

/* --- opciones reutilizables -------------------------------------------- */
const OP_SINO      = [{t:'No', v:0}, {t:'Sí', v:1}];
const OP_0_10      = Array.from({length:11}, (_,i) => ({t:String(i), v:i}));
const OP_LIKERT5   = [{t:'Nada', v:0}, {t:'Un poco', v:1}, {t:'Moderado', v:2},
                      {t:'Bastante', v:3}, {t:'Muchísimo', v:4}];
const OP_FREC4     = [{t:'Nunca', v:0}, {t:'Varios días', v:1},
                      {t:'Más de la mitad de los días', v:2},
                      {t:'Casi todos los días', v:3}];

const ESCALAS = {

/* ===================================================================== */
/* INTENSIDAD                                                            */
/* ===================================================================== */

nrs: {
  sigla:'NRS/EVA', nombre:'Escala numérica de intensidad del dolor',
  dominio:'intensidad', quien:'paciente', minutos:1,
  enunciado:'0 = sin dolor; 10 = el peor dolor imaginable.',
  items:[
    {t:'Intensidad AHORA', op:OP_0_10},
    {t:'Intensidad promedio en las últimas 2 semanas', op:OP_0_10},
    {t:'Intensidad en el PEOR momento', op:OP_0_10},
    {t:'Intensidad en el MEJOR momento', op:OP_0_10}
  ],
  rango:[0,10], promedio:true,
  cortes:[
    {hasta:0,  etiqueta:'Sin dolor',   color:'verde'},
    {hasta:3,  etiqueta:'Leve',        color:'lima'},
    {hasta:6,  etiqueta:'Moderado',    color:'ambar',
     nota:'Umbral habitual para intensificar el tratamiento.'},
    {hasta:10, etiqueta:'Severo',      color:'rojo',
     nota:'Dolor severo: requiere conducta activa en esta consulta.'}
  ],
  fuente:'IMMPACT / IASP. Alivio ≥30% = clínicamente relevante; ≥50% = sustancial.'
},

/* ===================================================================== */
/* COMPONENTE NEUROPATICO                                                */
/* ===================================================================== */

dn4: {
  sigla:'DN4', nombre:'Douleur Neuropathique en 4 questions',
  dominio:'neuropatico', quien:'mixto', minutos:3,
  enunciado:'Responda pensando en la zona donde MÁS le duele. Las tres últimas ' +
            'preguntas las completa el médico durante el examen físico.',
  items:[
    {t:'1. ¿El dolor tiene sensación de quemazón?', op:OP_SINO},
    {t:'2. ¿Siente frío doloroso en la zona?', op:OP_SINO},
    {t:'3. ¿Tiene sensación de descargas eléctricas?', op:OP_SINO},
    {t:'4. ¿Tiene hormigueo en la zona dolorosa?', op:OP_SINO},
    {t:'5. ¿Tiene sensación de "alfileres y agujas"?', op:OP_SINO},
    {t:'6. ¿Siente adormecimiento en la zona?', op:OP_SINO},
    {t:'7. ¿Le produce picazón la zona dolorosa?', op:OP_SINO},
    {t:'8. Hipoestesia al tacto en la zona', op:OP_SINO, medico:true},
    {t:'9. Hipoestesia al pinchazo en la zona', op:OP_SINO, medico:true},
    {t:'10. El roce con pincel o algodón provoca o aumenta el dolor (alodinia)',
     op:OP_SINO, medico:true}
  ],
  rango:[0,10],
  cortes:[
    {hasta:3,  etiqueta:'Componente neuropático poco probable', color:'verde'},
    {hasta:10, etiqueta:'Componente neuropático probable', color:'violeta',
     nota:'DN4 ≥4/10 orienta a dolor neuropático (sensibilidad ~83%, especificidad ~90%). ' +
          'Con las 7 preguntas de entrevista solas, el corte es ≥3/7.'}
  ],
  corteClave:4,
  fuente:'Bouhassira D. et al., Pain 2005. Versión española validada.'
},

paindetect: {
  sigla:'PainDETECT', nombre:'Cuestionario PainDETECT',
  dominio:'neuropatico', quien:'paciente', minutos:4,
  enunciado:'Marque cuánto se parece cada afirmación a lo que usted siente en ' +
            'la zona de mayor dolor.',
  items:[
    {t:'¿Siente ardor o quemazón (por ejemplo, como ortigas) en la zona dolorosa?', op:OP_LIKERT5},
    {t:'¿Siente hormigueo o pinchazos en la zona (como hormigas u electricidad)?', op:OP_LIKERT5},
    {t:'¿El roce ligero (ropa, sábana) le resulta doloroso en esa zona?', op:OP_LIKERT5},
    {t:'¿Tiene ataques de dolor súbitos, como descargas eléctricas?', op:OP_LIKERT5},
    {t:'¿El frío o el calor (agua de la ducha) le producen dolor allí?', op:OP_LIKERT5},
    {t:'¿Siente adormecimiento o falta de sensibilidad en la zona?', op:OP_LIKERT5},
    {t:'¿Una presión leve, como con el dedo, desencadena dolor allí?', op:OP_LIKERT5}
  ],
  extra:[
    {t:'Patrón temporal', op:[
      {t:'Dolor persistente con leves fluctuaciones', v:0},
      {t:'Dolor persistente con crisis de dolor', v:-1},
      {t:'Crisis de dolor sin dolor entre ellas', v:1},
      {t:'Crisis de dolor con dolor entre ellas', v:1}]},
    {t:'¿El dolor se irradia a otra zona del cuerpo?', op:[{t:'No', v:0},{t:'Sí', v:2}]}
  ],
  rango:[-1,38],
  cortes:[
    {hasta:12, etiqueta:'Componente neuropático improbable (<15%)', color:'verde'},
    {hasta:18, etiqueta:'Resultado ambiguo', color:'ambar',
     nota:'Zona gris: decidir por clínica y examen, no por el puntaje.'},
    {hasta:38, etiqueta:'Componente neuropático probable (>90%)', color:'violeta'}
  ],
  corteClave:19,
  fuente:'Freynhagen R. et al., Curr Med Res Opin 2006.'
},

/* ===================================================================== */
/* SENSIBILIZACION CENTRAL / NOCIPLASTICO                                */
/* ===================================================================== */

csi: {
  sigla:'CSI', nombre:'Inventario de Sensibilización Central (parte A)',
  dominio:'nociplastico', quien:'paciente', minutos:6,
  enunciado:'Indique con qué frecuencia le ocurre cada una de estas cosas.',
  opciones:[{t:'Nunca', v:0},{t:'Rara vez', v:1},{t:'A veces', v:2},
            {t:'Frecuentemente', v:3},{t:'Siempre', v:4}],
  items:[
    {t:'Me siento cansado y sin energía al despertar'},
    {t:'Siento los músculos rígidos y doloridos'},
    {t:'Tengo crisis de ansiedad'},
    {t:'Aprieto o rechino los dientes'},
    {t:'Tengo diarrea o estreñimiento'},
    {t:'Necesito ayuda para las actividades diarias'},
    {t:'Soy sensible a la luz brillante'},
    {t:'Me canso con facilidad al hacer actividad física'},
    {t:'Tengo dolor en todo el cuerpo'},
    {t:'Tengo dolor de cabeza'},
    {t:'Siento molestia o dolor al orinar'},
    {t:'Duermo mal'},
    {t:'Me cuesta concentrarme'},
    {t:'Tengo problemas de piel (sequedad, picazón, erupciones)'},
    {t:'El estrés empeora mis síntomas físicos'},
    {t:'Me siento triste o deprimido'},
    {t:'Tengo poca energía'},
    {t:'Tengo tensión muscular en el cuello y los hombros'},
    {t:'Me duele la mandíbula'},
    {t:'Ciertos olores (perfumes) me producen mareo o náuseas'},
    {t:'Tengo que orinar con frecuencia'},
    {t:'Siento las piernas incómodas e inquietas cuando quiero dormir'},
    {t:'Me cuesta recordar cosas'},
    {t:'Sufrí un trauma en la infancia'},
    {t:'Tengo dolor en la zona pélvica'}
  ],
  rango:[0,100],
  cortes:[
    {hasta:29, etiqueta:'Subclínico', color:'verde'},
    {hasta:39, etiqueta:'Leve', color:'lima'},
    {hasta:49, etiqueta:'Moderado', color:'ambar',
     nota:'≥40 es el corte publicado: sensibilidad 81%, especificidad 75%.'},
    {hasta:59, etiqueta:'Severo', color:'naranja'},
    {hasta:100, etiqueta:'Extremo', color:'rojo'}
  ],
  corteClave:40,
  fuente:'Mayer TG. et al., Pain Pract 2012. Validación española: Cuesta-Vargas 2016. ' +
         'Es un instrumento de TAMIZAJE: no diagnostica dolor nociplástico por sí solo.'
},

acr2016: {
  sigla:'ACR 2016', nombre:'Criterios diagnósticos de fibromialgia (WPI + SSS)',
  dominio:'nociplastico', quien:'mixto', minutos:5,
  enunciado:'El índice de dolor generalizado (WPI, 0–19) se calcula solo desde ' +
            'el mapa corporal. Aquí se completa la escala de gravedad de síntomas (SSS).',
  items:[
    {t:'Fatiga', op:[{t:'Ausente',v:0},{t:'Leve',v:1},{t:'Moderada',v:2},{t:'Grave',v:3}]},
    {t:'Sueño no reparador', op:[{t:'Ausente',v:0},{t:'Leve',v:1},{t:'Moderado',v:2},{t:'Grave',v:3}]},
    {t:'Síntomas cognitivos (memoria, concentración)', op:[{t:'Ausentes',v:0},{t:'Leves',v:1},{t:'Moderados',v:2},{t:'Graves',v:3}]},
    {t:'Cefalea en los últimos 6 meses', op:OP_SINO},
    {t:'Dolor o calambres en abdomen inferior en los últimos 6 meses', op:OP_SINO},
    {t:'Depresión en los últimos 6 meses', op:OP_SINO}
  ],
  rango:[0,12],
  regla:'Fibromialgia si: (WPI ≥7 y SSS ≥5) O BIEN (WPI 4–6 y SSS ≥9), ' +
        'con dolor generalizado en al menos 4 de 5 regiones corporales, ' +
        'presente ≥3 meses. El diagnóstico es válido aunque haya otra ' +
        'enfermedad que también explique dolor: no es un diagnóstico de exclusión.',
  fuente:'Wolfe F. et al., Semin Arthritis Rheum 2016 (revisión 2016 de los criterios de 2010/2011).'
},

/* ===================================================================== */
/* FUNCION E INTERFERENCIA                                               */
/* ===================================================================== */

bpi: {
  sigla:'BPI', nombre:'Inventario Breve del Dolor — interferencia',
  dominio:'funcion', quien:'paciente', minutos:4,
  enunciado:'En las últimas 24 horas, ¿cuánto interfirió el dolor con...? ' +
            '(0 = no interfirió, 10 = interfirió por completo)',
  items:[
    {t:'Actividad general', op:OP_0_10},
    {t:'Estado de ánimo', op:OP_0_10},
    {t:'Capacidad para caminar', op:OP_0_10},
    {t:'Trabajo habitual (incluye tareas de la casa)', op:OP_0_10},
    {t:'Relación con otras personas', op:OP_0_10},
    {t:'Sueño', op:OP_0_10},
    {t:'Disfrute de la vida', op:OP_0_10}
  ],
  rango:[0,10], promedio:true,
  cortes:[
    {hasta:3,  etiqueta:'Interferencia leve', color:'verde'},
    {hasta:6,  etiqueta:'Interferencia moderada', color:'ambar'},
    {hasta:10, etiqueta:'Interferencia severa', color:'rojo'}
  ],
  fuente:'Cleeland CS. Es una de las cuatro medidas núcleo recomendadas por IMMPACT.'
},

odi: {
  sigla:'ODI', nombre:'Índice de discapacidad de Oswestry (lumbar)',
  dominio:'funcion', quien:'paciente', minutos:5, region:'lumbar',
  enunciado:'Marque en cada sección la frase que mejor describa su situación HOY.',
  items:[
    {t:'Intensidad del dolor', op:[
      {t:'Sin dolor en este momento', v:0},
      {t:'Dolor muy leve', v:1},
      {t:'Dolor moderado', v:2},
      {t:'Dolor bastante intenso', v:3},
      {t:'Dolor muy intenso', v:4},
      {t:'El peor dolor imaginable', v:5}]},
    {t:'Cuidados personales (lavarse, vestirse)', op:[
      {t:'Me arreglo sin que aumente el dolor', v:0},
      {t:'Me arreglo solo, pero me aumenta el dolor', v:1},
      {t:'Me arreglo con dolor, despacio y con cuidado', v:2},
      {t:'Necesito algo de ayuda pero hago casi todo solo', v:3},
      {t:'Necesito ayuda todos los días para casi todo', v:4},
      {t:'No me visto, me lavo con dificultad y me quedo en cama', v:5}]},
    {t:'Levantar peso', op:[
      {t:'Levanto objetos pesados sin más dolor', v:0},
      {t:'Levanto objetos pesados pero me aumenta el dolor', v:1},
      {t:'El dolor me impide levantar objetos pesados del suelo, pero sí desde una mesa', v:2},
      {t:'El dolor me impide levantar objetos pesados, pero sí ligeros o medianos desde una mesa', v:3},
      {t:'Sólo puedo levantar objetos muy ligeros', v:4},
      {t:'No puedo levantar ni acarrear nada', v:5}]},
    {t:'Caminar', op:[
      {t:'El dolor no me impide caminar', v:0},
      {t:'El dolor me impide caminar más de 1 km', v:1},
      {t:'…más de 500 metros', v:2},
      {t:'…más de 100 metros', v:3},
      {t:'Sólo puedo caminar con bastón o muletas', v:4},
      {t:'Permanezco en cama casi todo el tiempo', v:5}]},
    {t:'Estar sentado', op:[
      {t:'Puedo estar sentado en cualquier silla todo el tiempo que quiera', v:0},
      {t:'Sólo en mi silla favorita todo el tiempo que quiera', v:1},
      {t:'El dolor me impide estar sentado más de 1 hora', v:2},
      {t:'…más de 30 minutos', v:3},
      {t:'…más de 10 minutos', v:4},
      {t:'El dolor me impide estar sentado', v:5}]},
    {t:'Estar de pie', op:[
      {t:'Puedo estar de pie todo el tiempo que quiera sin más dolor', v:0},
      {t:'…pero me aumenta el dolor', v:1},
      {t:'El dolor me impide estar de pie más de 1 hora', v:2},
      {t:'…más de 30 minutos', v:3},
      {t:'…más de 10 minutos', v:4},
      {t:'El dolor me impide estar de pie', v:5}]},
    {t:'Dormir', op:[
      {t:'El dolor no me impide dormir bien', v:0},
      {t:'Sólo puedo dormir con medicación', v:1},
      {t:'Incluso con medicación duermo menos de 6 horas', v:2},
      {t:'…menos de 4 horas', v:3},
      {t:'…menos de 2 horas', v:4},
      {t:'El dolor me impide dormir', v:5}]},
    {t:'Actividad sexual', op:[
      {t:'Normal, sin más dolor', v:0},
      {t:'Normal, pero me aumenta el dolor', v:1},
      {t:'Casi normal, pero muy dolorosa', v:2},
      {t:'Muy limitada por el dolor', v:3},
      {t:'Casi ausente a causa del dolor', v:4},
      {t:'El dolor me impide toda actividad sexual', v:5}]},
    {t:'Vida social', op:[
      {t:'Normal, sin más dolor', v:0},
      {t:'Normal, pero me aumenta el dolor', v:1},
      {t:'Sin efecto salvo en actividades enérgicas (deporte, baile)', v:2},
      {t:'El dolor limita mi vida social y salgo menos', v:3},
      {t:'El dolor limita mi vida social a mi casa', v:4},
      {t:'No tengo vida social a causa del dolor', v:5}]},
    {t:'Viajar', op:[
      {t:'Puedo viajar a cualquier sitio sin más dolor', v:0},
      {t:'…pero me aumenta el dolor', v:1},
      {t:'El dolor es fuerte pero aguanto viajes de más de 2 horas', v:2},
      {t:'El dolor me limita a viajes de menos de 1 hora', v:3},
      {t:'…a viajes cortos y necesarios de menos de 30 minutos', v:4},
      {t:'El dolor me impide viajar salvo para ir al médico', v:5}]}
  ],
  rango:[0,100], porcentual:true,
  cortes:[
    {hasta:20, etiqueta:'Discapacidad mínima', color:'verde'},
    {hasta:40, etiqueta:'Discapacidad moderada', color:'lima'},
    {hasta:60, etiqueta:'Discapacidad severa', color:'ambar'},
    {hasta:80, etiqueta:'Discapacidad muy severa (inválido)', color:'naranja'},
    {hasta:100,etiqueta:'Postrado o exageración de síntomas', color:'rojo'}
  ],
  mcid:10,
  fuente:'Fairbank JCT. Cambio mínimo clínicamente importante: 10 puntos porcentuales.'
},

ndi: {
  sigla:'NDI', nombre:'Índice de discapacidad cervical',
  dominio:'funcion', quien:'paciente', minutos:5, region:'cervical',
  enunciado:'Misma estructura que el Oswestry, aplicada al cuello. ' +
            'Cada sección puntúa 0–5 y el total se expresa en porcentaje.',
  secciones:['Intensidad del dolor','Cuidados personales','Levantar peso','Leer',
             'Dolor de cabeza','Concentración','Trabajo','Conducir','Dormir','Recreación'],
  generico:true,
  rango:[0,100], porcentual:true,
  cortes:[
    {hasta:8,  etiqueta:'Sin discapacidad', color:'verde'},
    {hasta:28, etiqueta:'Discapacidad leve', color:'lima'},
    {hasta:48, etiqueta:'Discapacidad moderada', color:'ambar'},
    {hasta:68, etiqueta:'Discapacidad severa', color:'naranja'},
    {hasta:100,etiqueta:'Discapacidad completa', color:'rojo'}
  ],
  mcid:7.5,
  fuente:'Vernon H, Mior S. J Manipulative Physiol Ther 1991.'
},

/* ===================================================================== */
/* FACTORES PSICOLOGICOS — las banderas amarillas                        */
/* ===================================================================== */

pcs: {
  sigla:'PCS', nombre:'Escala de Catastrofización del Dolor',
  dominio:'psicologico', quien:'paciente', minutos:4,
  enunciado:'Cuando siento dolor…  (0 = nada, 4 = todo el tiempo)',
  opciones:[{t:'Nada',v:0},{t:'Un poco',v:1},{t:'Moderado',v:2},
            {t:'Bastante',v:3},{t:'Todo el tiempo',v:4}],
  items:[
    {t:'Me preocupa todo el tiempo pensar si el dolor terminará', sub:'rumiación'},
    {t:'Siento que ya no puedo seguir así', sub:'magnificación'},
    {t:'Es terrible y creo que nunca va a mejorar', sub:'desesperanza'},
    {t:'Es horrible y siento que me supera', sub:'desesperanza'},
    {t:'Siento que no puedo soportarlo más', sub:'desesperanza'},
    {t:'Temo que el dolor empeore', sub:'magnificación'},
    {t:'Pienso en otros episodios dolorosos', sub:'magnificación'},
    {t:'Deseo con ansias que el dolor desaparezca', sub:'rumiación'},
    {t:'No puedo apartar el dolor de mi mente', sub:'rumiación'},
    {t:'No dejo de pensar en cuánto me duele', sub:'rumiación'},
    {t:'No dejo de pensar en cuánto deseo que pare', sub:'rumiación'},
    {t:'No hay nada que pueda hacer para reducir la intensidad del dolor', sub:'desesperanza'},
    {t:'Me pregunto si puede pasarme algo grave', sub:'magnificación'}
  ],
  rango:[0,52],
  cortes:[
    {hasta:19, etiqueta:'Catastrofización baja', color:'verde'},
    {hasta:29, etiqueta:'Catastrofización moderada', color:'ambar'},
    {hasta:52, etiqueta:'Catastrofización alta', color:'rojo',
     nota:'≥30 corresponde al percentil 75 y predice peor respuesta a cualquier ' +
          'tratamiento, incluido el intervencionismo. Indicación de abordaje psicológico.'}
  ],
  corteClave:30,
  fuente:'Sullivan MJL. et al., Psychol Assess 1995. Validación española: García Campayo 2008.'
},

pseq: {
  sigla:'PSEQ', nombre:'Cuestionario de Autoeficacia ante el Dolor',
  dominio:'psicologico', quien:'paciente', minutos:3,
  enunciado:'Califique cuánta confianza tiene en poder hacer esto AHORA, ' +
            'aunque tenga dolor.  (0 = nada seguro, 6 = completamente seguro)',
  opciones:Array.from({length:7}, (_,i)=>({t:String(i), v:i})),
  items:[
    {t:'Puedo disfrutar de las cosas a pesar del dolor'},
    {t:'Puedo hacer casi todas las tareas de la casa a pesar del dolor'},
    {t:'Puedo ver a mis amigos con la frecuencia que quiero'},
    {t:'Puedo sobrellevar el dolor en casi todas las situaciones'},
    {t:'Puedo hacer algún tipo de trabajo a pesar del dolor'},
    {t:'Puedo hacer muchas de las cosas que me gustan (hobbies, ocio)'},
    {t:'Puedo sobrellevar el dolor sin medicación'},
    {t:'Puedo cumplir la mayoría de mis metas en la vida'},
    {t:'Puedo llevar una vida normal'},
    {t:'Puedo ir volviendo activo poco a poco a pesar del dolor'}
  ],
  rango:[0,60],
  cortes:[
    {hasta:19, etiqueta:'Autoeficacia muy baja', color:'rojo'},
    {hasta:39, etiqueta:'Autoeficacia baja', color:'ambar',
     nota:'<40 predice mala evolución y persistencia de la discapacidad.'},
    {hasta:60, etiqueta:'Autoeficacia adecuada', color:'verde'}
  ],
  corteClave:40, mayorEsMejor:true,
  fuente:'Nicholas MK. Eur J Pain 2007. Es el mejor predictor aislado de retorno a la función.'
},

phq9: {
  sigla:'PHQ-9', nombre:'Cuestionario de salud del paciente — depresión',
  dominio:'animo', quien:'paciente', minutos:3,
  enunciado:'Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado ' +
            'los siguientes problemas?',
  opciones:OP_FREC4,
  items:[
    {t:'Poco interés o placer en hacer cosas'},
    {t:'Sentirse decaído, deprimido o sin esperanza'},
    {t:'Problemas para dormir o dormir demasiado'},
    {t:'Sentirse cansado o con poca energía'},
    {t:'Poco apetito o comer en exceso'},
    {t:'Sentirse mal consigo mismo, un fracaso, o haber decepcionado a su familia'},
    {t:'Dificultad para concentrarse (leer, mirar televisión)'},
    {t:'Moverse o hablar tan despacio que otros lo notaron, o al revés, estar ' +
        'tan inquieto que se movió mucho más de lo habitual'},
    {t:'Pensamientos de que estaría mejor muerto o de lastimarse de algún modo',
     alerta:'Cualquier respuesta distinta de "Nunca" obliga a evaluar riesgo suicida HOY.'}
  ],
  rango:[0,27],
  cortes:[
    {hasta:4,  etiqueta:'Sin depresión', color:'verde'},
    {hasta:9,  etiqueta:'Depresión leve', color:'lima'},
    {hasta:14, etiqueta:'Depresión moderada', color:'ambar'},
    {hasta:19, etiqueta:'Depresión moderadamente severa', color:'naranja'},
    {hasta:27, etiqueta:'Depresión severa', color:'rojo'}
  ],
  corteClave:10,
  fuente:'Kroenke K, Spitzer RL. J Gen Intern Med 2001. Ítem 9: riesgo suicida.'
},

gad7: {
  sigla:'GAD-7', nombre:'Escala de ansiedad generalizada',
  dominio:'animo', quien:'paciente', minutos:2,
  enunciado:'Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado ' +
            'los siguientes problemas?',
  opciones:OP_FREC4,
  items:[
    {t:'Sentirse nervioso, ansioso o al límite'},
    {t:'No poder dejar de preocuparse o controlar la preocupación'},
    {t:'Preocuparse demasiado por distintas cosas'},
    {t:'Dificultad para relajarse'},
    {t:'Estar tan inquieto que le cuesta quedarse quieto'},
    {t:'Irritarse o enojarse con facilidad'},
    {t:'Sentir miedo de que algo terrible pueda pasar'}
  ],
  rango:[0,21],
  cortes:[
    {hasta:4,  etiqueta:'Ansiedad mínima', color:'verde'},
    {hasta:9,  etiqueta:'Ansiedad leve', color:'lima'},
    {hasta:14, etiqueta:'Ansiedad moderada', color:'ambar'},
    {hasta:21, etiqueta:'Ansiedad severa', color:'rojo'}
  ],
  corteClave:10,
  fuente:'Spitzer RL. et al., Arch Intern Med 2006.'
},

isi: {
  sigla:'ISI', nombre:'Índice de Gravedad del Insomnio',
  dominio:'sueño', quien:'paciente', minutos:2,
  enunciado:'Piense en las últimas 2 semanas.',
  items:[
    {t:'Dificultad para conciliar el sueño', op:[{t:'Ninguna',v:0},{t:'Leve',v:1},{t:'Moderada',v:2},{t:'Grave',v:3},{t:'Muy grave',v:4}]},
    {t:'Dificultad para mantener el sueño', op:[{t:'Ninguna',v:0},{t:'Leve',v:1},{t:'Moderada',v:2},{t:'Grave',v:3},{t:'Muy grave',v:4}]},
    {t:'Despertar muy temprano', op:[{t:'Ninguna',v:0},{t:'Leve',v:1},{t:'Moderada',v:2},{t:'Grave',v:3},{t:'Muy grave',v:4}]},
    {t:'Satisfacción con su sueño actual', op:[{t:'Muy satisfecho',v:0},{t:'Satisfecho',v:1},{t:'Neutro',v:2},{t:'Insatisfecho',v:3},{t:'Muy insatisfecho',v:4}]},
    {t:'¿Cuánto interfiere su sueño con su vida diaria?', op:[{t:'Nada',v:0},{t:'Poco',v:1},{t:'Algo',v:2},{t:'Mucho',v:3},{t:'Muchísimo',v:4}]},
    {t:'¿Cuánto nota que su problema de sueño afecta su calidad de vida a ojos de los demás?', op:[{t:'Nada',v:0},{t:'Poco',v:1},{t:'Algo',v:2},{t:'Mucho',v:3},{t:'Muchísimo',v:4}]},
    {t:'¿Cuán preocupado está por su problema de sueño?', op:[{t:'Nada',v:0},{t:'Poco',v:1},{t:'Algo',v:2},{t:'Mucho',v:3},{t:'Muchísimo',v:4}]}
  ],
  rango:[0,28],
  cortes:[
    {hasta:7,  etiqueta:'Sin insomnio clínico', color:'verde'},
    {hasta:14, etiqueta:'Insomnio subumbral', color:'lima'},
    {hasta:21, etiqueta:'Insomnio moderado', color:'ambar'},
    {hasta:28, etiqueta:'Insomnio severo', color:'rojo'}
  ],
  corteClave:15,
  fuente:'Bastien CH. et al., Sleep Med 2001. El sueño malo amplifica el dolor: ' +
         'tratarlo mejora la analgesia independientemente del analgésico.'
},

startback: {
  sigla:'STarT Back', nombre:'Herramienta de estratificación de riesgo lumbar',
  dominio:'pronostico', quien:'paciente', minutos:2, region:'lumbar',
  enunciado:'Pensando en las últimas 2 semanas, marque si está de acuerdo.',
  items:[
    {t:'Mi dolor de espalda se ha extendido por la pierna en algún momento', op:OP_SINO},
    {t:'He tenido dolor en el hombro o el cuello en algún momento', op:OP_SINO},
    {t:'Sólo he caminado distancias cortas por el dolor de espalda', op:OP_SINO},
    {t:'Me he vestido más lentamente de lo habitual por el dolor de espalda', op:OP_SINO},
    {t:'No es realmente seguro para una persona como yo hacer actividad física', op:OP_SINO, psico:true},
    {t:'Me han venido pensamientos preocupantes a la cabeza muchas veces', op:OP_SINO, psico:true},
    {t:'Siento que mi dolor de espalda es terrible y nunca va a mejorar', op:OP_SINO, psico:true},
    {t:'En general no he disfrutado de las cosas que solía disfrutar', op:OP_SINO, psico:true},
    {t:'En general, ¿cuánto le ha molestado el dolor de espalda?', psico:true,
     op:[{t:'Nada',v:0},{t:'Poco',v:0},{t:'Moderado',v:0},{t:'Mucho',v:1},{t:'Muchísimo',v:1}]}
  ],
  rango:[0,9],
  regla:'Total ≤3 → riesgo BAJO. Total ≥4: mirar la subescala psicosocial ' +
        '(ítems 5 a 9). Subescala ≤3 → riesgo MEDIO; subescala ≥4 → riesgo ALTO.',
  cortes:[
    {hasta:3, etiqueta:'Riesgo bajo — tratamiento mínimo y consejo activo', color:'verde'},
    {hasta:9, etiqueta:'Riesgo medio o alto — ver subescala psicosocial', color:'ambar'}
  ],
  fuente:'Hill JC. et al., Arthritis Rheum 2008. Estratificar el tratamiento por ' +
         'este puntaje mejora resultados y baja costos (ensayo IMPaCT Back).'
},

/* ===================================================================== */
/* SEGURIDAD DEL OPIOIDE                                                 */
/* ===================================================================== */

ort: {
  sigla:'ORT', nombre:'Opioid Risk Tool — riesgo de uso problemático de opioides',
  dominio:'seguridad', quien:'medico', minutos:2,
  enunciado:'Se completa ANTES de iniciar un opioide. El puntaje difiere entre ' +
            'varones y mujeres en los ítems de abuso familiar y personal.',
  items:[
    {t:'Antecedente FAMILIAR de abuso de alcohol', op:[{t:'No',v:0},{t:'Sí — mujer',v:1},{t:'Sí — varón',v:3}]},
    {t:'Antecedente FAMILIAR de abuso de drogas ilícitas', op:[{t:'No',v:0},{t:'Sí — mujer',v:2},{t:'Sí — varón',v:3}]},
    {t:'Antecedente FAMILIAR de abuso de medicamentos de prescripción', op:[{t:'No',v:0},{t:'Sí — mujer',v:4},{t:'Sí — varón',v:4}]},
    {t:'Antecedente PERSONAL de abuso de alcohol', op:[{t:'No',v:0},{t:'Sí — mujer',v:3},{t:'Sí — varón',v:3}]},
    {t:'Antecedente PERSONAL de abuso de drogas ilícitas', op:[{t:'No',v:0},{t:'Sí — mujer',v:4},{t:'Sí — varón',v:4}]},
    {t:'Antecedente PERSONAL de abuso de medicamentos de prescripción', op:[{t:'No',v:0},{t:'Sí — mujer',v:5},{t:'Sí — varón',v:5}]},
    {t:'Edad entre 16 y 45 años', op:[{t:'No',v:0},{t:'Sí',v:1}]},
    {t:'Antecedente de abuso sexual en la preadolescencia (mujeres)', op:[{t:'No',v:0},{t:'Sí',v:3}]},
    {t:'Enfermedad psicológica: TDAH, TOC, bipolaridad, esquizofrenia', op:[{t:'No',v:0},{t:'Sí',v:2}]},
    {t:'Enfermedad psicológica: depresión', op:[{t:'No',v:0},{t:'Sí',v:1}]}
  ],
  rango:[0,26],
  cortes:[
    {hasta:3,  etiqueta:'Riesgo bajo', color:'verde',
     nota:'Prescripción habitual con controles de rutina.'},
    {hasta:7,  etiqueta:'Riesgo moderado', color:'ambar',
     nota:'Contrato terapéutico escrito, recetas acotadas, controles más frecuentes.'},
    {hasta:26, etiqueta:'Riesgo alto', color:'rojo',
     nota:'Considerar no iniciar opioide, o hacerlo con seguimiento estrecho y ' +
          'consulta con especialista en adicciones.'}
  ],
  fuente:'Webster LR, Webster RM. Pain Med 2005.'
},

/* ===================================================================== */
/* RESULTADO PERCIBIDO                                                   */
/* ===================================================================== */

pgic: {
  sigla:'PGIC', nombre:'Impresión Global de Cambio del Paciente',
  dominio:'resultado', quien:'paciente', minutos:1,
  enunciado:'Desde que empezó este tratamiento, ¿cómo describiría el cambio ' +
            '(si lo hubo) en las limitaciones, síntomas y calidad de vida ' +
            'relacionados con su dolor?',
  items:[
    {t:'Cambio global', op:[
      {t:'Muchísimo peor', v:1},
      {t:'Mucho peor', v:2},
      {t:'Algo peor', v:3},
      {t:'Sin cambios', v:4},
      {t:'Algo mejor', v:5},
      {t:'Mucho mejor', v:6},
      {t:'Muchísimo mejor', v:7}]}
  ],
  rango:[1,7], mayorEsMejor:true,
  cortes:[
    {hasta:3, etiqueta:'Empeoró', color:'rojo'},
    {hasta:4, etiqueta:'Sin cambios', color:'naranja'},
    {hasta:5, etiqueta:'Mejoría mínima', color:'ambar'},
    {hasta:7, etiqueta:'Mejoría clínicamente importante', color:'verde',
     nota:'≥6 ("mucho mejor") es el umbral de respondedor recomendado por IMMPACT.'}
  ],
  corteClave:6,
  fuente:'IMMPACT — Dworkin RH. et al., J Pain 2008. Es la cuarta medida núcleo.'
},

ecog: {
  sigla:'ECOG', nombre:'Estado funcional ECOG (oncológico)',
  dominio:'funcion', quien:'medico', minutos:1,
  items:[
    {t:'Estado funcional', op:[
      {t:'0 — Actividad normal, sin restricciones', v:0},
      {t:'1 — Restringido para actividad física intensa, ambulatorio', v:1},
      {t:'2 — Ambulatorio, capaz de autocuidarse, en cama <50% del día', v:2},
      {t:'3 — Autocuidado limitado, en cama >50% del día', v:3},
      {t:'4 — Completamente incapacitado, confinado a cama o silla', v:4}]}
  ],
  rango:[0,4],
  fuente:'Oken MM. et al., Am J Clin Oncol 1982.'
}

};

/* -------------------------------------------------------------------------
   Regiones del Indice de Dolor Generalizado (WPI) de los criterios ACR 2016.
   Son 19 y se calculan SOLAS a partir del mapa corporal: cada punto que el
   paciente marca cae en una de estas regiones. Las cinco "areas" agrupan las
   19 regiones y sirven para el requisito de dolor en >=4 de 5 areas.
   ------------------------------------------------------------------------- */
const WPI_REGIONES = [
  {id:'hombro_izq',   nombre:'Cintura escapular izquierda', area:'sup_izq'},
  {id:'hombro_der',   nombre:'Cintura escapular derecha',   area:'sup_der'},
  {id:'brazo_izq',    nombre:'Brazo izquierdo',             area:'sup_izq'},
  {id:'brazo_der',    nombre:'Brazo derecho',               area:'sup_der'},
  {id:'antebrazo_izq',nombre:'Antebrazo izquierdo',         area:'sup_izq'},
  {id:'antebrazo_der',nombre:'Antebrazo derecho',           area:'sup_der'},
  {id:'cadera_izq',   nombre:'Cadera / glúteo izquierdo',   area:'inf_izq'},
  {id:'cadera_der',   nombre:'Cadera / glúteo derecho',     area:'inf_der'},
  {id:'muslo_izq',    nombre:'Muslo izquierdo',             area:'inf_izq'},
  {id:'muslo_der',    nombre:'Muslo derecho',               area:'inf_der'},
  {id:'pierna_izq',   nombre:'Pierna izquierda',            area:'inf_izq'},
  {id:'pierna_der',   nombre:'Pierna derecha',              area:'inf_der'},
  {id:'mandibula_izq',nombre:'Mandíbula izquierda',         area:'axial'},
  {id:'mandibula_der',nombre:'Mandíbula derecha',           area:'axial'},
  {id:'torax',        nombre:'Tórax',                       area:'axial'},
  {id:'abdomen',      nombre:'Abdomen',                     area:'axial'},
  {id:'cuello',       nombre:'Cuello',                      area:'axial'},
  {id:'espalda_alta', nombre:'Espalda superior',            area:'axial'},
  {id:'espalda_baja', nombre:'Espalda inferior',            area:'axial'}
];

const WPI_AREAS = {
  sup_izq:'Región superior izquierda',
  sup_der:'Región superior derecha',
  inf_izq:'Región inferior izquierda',
  inf_der:'Región inferior derecha',
  axial:  'Región axial'
};
