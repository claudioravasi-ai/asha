/* =========================================================================
   PROCEDIMIENTOS INTERVENCIONISTAS EN DOLOR
   -------------------------------------------------------------------------
   Cada procedimiento trae indicacion, que se puede esperar de el, con que
   guia se hace, sus complicaciones y los puntos que tienen que figurar en el
   consentimiento informado, que segun las Normas de Dolor argentinas debe ser
   por escrito, firmado, y explicitar que hay garantia de MEDIOS y no de
   RESULTADOS.

   El campo riesgoSangrado clasifica el procedimiento segun las guias de
   ASRA para intervencionismo en dolor, que es lo que define cuantos dias
   antes hay que suspender cada anticoagulante. La tabla de suspension esta
   al final del archivo.
   ========================================================================= */
'use strict';

const PROCEDIMIENTOS = {

/* ---------- COLUMNA: BLOQUEOS DIAGNOSTICOS Y RADIOFRECUENCIA ---------- */

bloqueo_rama_medial_lumbar:{
  nombre:'Bloqueo diagnóstico de rama medial lumbar', grupo:'Columna lumbar',
  proposito:'diagnóstico',
  indicaciones:['Sospecha de síndrome facetario lumbar','Selección de candidatos a radiofrecuencia'],
  guia:'Radioscopia (fluoroscopia). La guía ecográfica es posible pero menos reproducible',
  tecnica:'Anestésico local en volumen pequeño (0,3 a 0,5 ml por nivel) sobre la unión del proceso ' +
          'transverso con el articular superior. El volumen alto invalida la prueba porque difunde ' +
          'a estructuras vecinas y da falsos positivos.',
  evidencia:'Es la única prueba con valor confirmatorio del origen facetario. Un solo bloqueo tiene ' +
            '25-40% de falsos positivos; el bloqueo comparativo doble (lidocaína y luego bupivacaína, ' +
            'en días distintos) baja mucho esa cifra.',
  exitoEsperado:'Se considera positivo con más de 80% de alivio durante la duración esperada del anestésico',
  duracion:'Horas: es diagnóstico, no terapéutico',
  contraindicaciones:['Infección local o sistémica','Coagulopatía no corregida','Negativa del paciente',
                      'Alergia a anestésicos locales'],
  complicaciones:['Dolor en el sitio de punción','Bloqueo motor transitorio','Punción vascular',
                  'Infección (rara)','Reacción vagal'],
  riesgoSangrado:'intermedio',
  consentimiento:['El bloqueo es una prueba diagnóstica: puede resultar negativo y eso también es información útil',
                  'El alivio es transitorio por definición',
                  'Se garantizan los medios, no el resultado',
                  'Riesgo de infección, sangrado, lesión nerviosa y reacción al anestésico'],
  registro:'Anotar el PORCENTAJE y la DURACIÓN exacta del alivio: son el dato que decide la radiofrecuencia'
},

radiofrecuencia_lumbar:{
  nombre:'Radiofrecuencia de ramas mediales lumbares (denervación facetaria)', grupo:'Columna lumbar',
  proposito:'terapéutico',
  indicaciones:['Síndrome facetario lumbar confirmado por bloqueos diagnósticos positivos'],
  guia:'Radioscopia, con estimulación sensitiva y motora previa a la lesión',
  tecnica:'Lesión térmica a 80 °C durante 90 segundos, con el electrodo paralelo al nervio para ' +
          'maximizar la superficie de contacto. Estimulación motora a 2 Hz para descartar proximidad ' +
          'a la raíz.',
  evidencia:'Alivio significativo en 60-80% de los pacientes bien seleccionados. La selección por ' +
            'bloqueos comparativos es lo que determina el resultado: sin ella, los números caen a la mitad.',
  exitoEsperado:'6 a 12 meses de alivio. El nervio se regenera y el dolor puede volver; se puede repetir',
  duracion:'6 a 12 meses, repetible',
  contraindicaciones:['Bloqueos diagnósticos negativos','Infección','Coagulopatía','Marcapasos o ' +
                      'cardiodesfibrilador sin coordinar con cardiología'],
  complicaciones:['Dolor neurítico postprocedimiento durante 2 a 4 semanas (frecuente, avisarlo)',
                  'Quemadura','Déficit motor (raro)','Hipoestesia cutánea'],
  riesgoSangrado:'intermedio',
  consentimiento:['El objetivo es reducir el dolor, no eliminarlo',
                  'Es habitual un aumento del dolor en las primeras 2 a 4 semanas',
                  'El efecto es temporario porque el nervio se regenera',
                  'Puede requerir repetición','Garantía de medios, no de resultados'],
  registro:'Niveles tratados, temperatura, tiempo de lesión y respuesta a la estimulación'
},

bloqueo_rama_medial_cervical:{
  nombre:'Bloqueo de rama medial cervical', grupo:'Columna cervical', proposito:'diagnóstico',
  indicaciones:['Cervicalgia facetaria','Cefalea cervicogénica de origen C2-C3'],
  guia:'Radioscopia obligatoria. La proximidad a la arteria vertebral y a la médula no admite hacerlo a ciegas',
  tecnica:'Volumen pequeño (0,3 ml) sobre la cintura del pilar articular',
  evidencia:'Buena, con mejores resultados que en la región lumbar',
  exitoEsperado:'Más de 80% de alivio durante la duración del anestésico',
  duracion:'Horas',
  contraindicaciones:['Infección','Coagulopatía','Inestabilidad cervical'],
  complicaciones:['Inyección intravascular o intratecal','Ataxia transitoria','Bloqueo alto'],
  riesgoSangrado:'intermedio',
  consentimiento:['Prueba diagnóstica de alivio transitorio','Riesgo de mareo o inestabilidad transitoria',
                  'Garantía de medios, no de resultados'],
  registro:'Nivel, volumen y porcentaje de alivio'
},

radiofrecuencia_cervical:{
  nombre:'Radiofrecuencia de ramas mediales cervicales', grupo:'Columna cervical', proposito:'terapéutico',
  indicaciones:['Cervicalgia facetaria confirmada','Cefalea cervicogénica C2-C3 confirmada'],
  guia:'Radioscopia con estimulación',
  tecnica:'Lesión a 80 °C, 90 segundos, con múltiples lesiones por nivel',
  evidencia:'Mejores resultados que la lumbar, con alivio prolongado en pacientes bien seleccionados',
  exitoEsperado:'9 a 12 meses',
  duracion:'9 a 12 meses, repetible',
  contraindicaciones:['Bloqueos negativos','Infección','Coagulopatía'],
  complicaciones:['Neuritis postprocedimiento','Hipoestesia occipital','Ataxia transitoria','Déficit motor (raro)'],
  riesgoSangrado:'intermedio',
  consentimiento:['Efecto temporario por regeneración nerviosa','Adormecimiento de la piel de la zona',
                  'Garantía de medios, no de resultados'],
  registro:'Niveles, temperatura y estimulación'
},

epidural_transforaminal:{
  nombre:'Bloqueo epidural transforaminal con corticoide', grupo:'Columna lumbar', proposito:'terapéutico',
  indicaciones:['Radiculopatía lumbosacra con dolor radicular predominante','Hernia discal con correlato clínico'],
  guia:'Radioscopia con contraste, o TC. El contraste es obligatorio para descartar inyección intravascular',
  tecnica:'Abordaje subpedicular. Test de contraste en tiempo real antes de inyectar. ' +
          'Usar corticoide NO PARTICULADO (dexametasona) para reducir el riesgo de infarto medular.',
  evidencia:'Mejora el dolor radicular a corto y mediano plazo y reduce la necesidad de cirugía en ' +
            'algunos pacientes. El efecto sobre el dolor axial es mucho menor.',
  exitoEsperado:'Alivio significativo en 60-70%, con duración de semanas a meses',
  duracion:'Semanas a meses. No más de 3 a 4 por año',
  contraindicaciones:['Infección','Coagulopatía','Diabetes descompensada','Alergia al contraste',
                      'Embarazo (por la radiación)'],
  complicaciones:['Punción dural y cefalea postpunción','Inyección intravascular','INFARTO MEDULAR ' +
                  '(catastrófico, casi siempre asociado a corticoide particulado)','Hiperglucemia',
                  'Absceso epidural','Hematoma epidural'],
  riesgoSangrado:'alto',
  consentimiento:['El corticoide puede elevar la glucemia varios días: relevante si es diabético',
                  'Riesgo de cefalea postpunción','Riesgo excepcional pero grave de lesión neurológica',
                  'Puede requerir repetición','Garantía de medios, no de resultados'],
  registro:'Nivel, lado, corticoide usado (dejar asentado que fue NO particulado), volumen y patrón del contraste'
},

epidural_interlaminar:{
  nombre:'Bloqueo epidural interlaminar', grupo:'Columna lumbar', proposito:'terapéutico',
  indicaciones:['Radiculopatía bilateral o multinivel','Estenosis de canal lumbar'],
  guia:'Radioscopia con pérdida de resistencia y confirmación con contraste',
  tecnica:'Abordaje mediano o paramediano, preferentemente por debajo del nivel patológico',
  evidencia:'Buena para el dolor radicular; en estenosis el beneficio es más modesto y transitorio',
  exitoEsperado:'Alivio en 50-60%, por semanas a meses',
  duracion:'Semanas a meses',
  contraindicaciones:['Infección','Coagulopatía','Hipertensión endocraneana'],
  complicaciones:['Punción dural','Hematoma epidural','Absceso','Hiperglucemia','Retención urinaria'],
  riesgoSangrado:'alto',
  consentimiento:['Riesgo de cefalea postpunción','Elevación transitoria de la glucemia',
                  'Garantía de medios, no de resultados'],
  registro:'Nivel, abordaje, volumen y respuesta'
},

epidural_caudal:{
  nombre:'Bloqueo epidural caudal', grupo:'Columna lumbar', proposito:'terapéutico',
  indicaciones:['Dolor radicular bajo (L5-S1)','Columna con cirugía previa donde el abordaje ' +
                'interlaminar es difícil','Coccigodinia'],
  guia:'Radioscopia o ecografía a través del hiato sacro',
  tecnica:'Abordaje por el hiato sacro con volumen mayor (10 a 20 ml) para alcanzar los niveles altos',
  evidencia:'Alternativa segura y accesible, con el abordaje más alejado de la duramadre',
  exitoEsperado:'Alivio en 50-60%',
  duracion:'Semanas a meses',
  contraindicaciones:['Infección local','Coagulopatía','Quiste pilonidal infectado','Anomalía sacra'],
  complicaciones:['Punción intravascular','Punción dural (rara por la distancia)','Retención urinaria'],
  riesgoSangrado:'alto',
  consentimiento:['Volumen mayor de líquido, con sensación de presión durante la inyección',
                  'Garantía de medios, no de resultados'],
  registro:'Volumen, difusión del contraste y respuesta'
},

epidural_cervical_interlaminar:{
  nombre:'Bloqueo epidural cervical interlaminar', grupo:'Columna cervical', proposito:'terapéutico',
  indicaciones:['Radiculopatía cervical refractaria'],
  guia:'Radioscopia con contraste, SIEMPRE. Abordaje en C7-T1, nunca por encima de C6-C7',
  tecnica:'Pérdida de resistencia con visión lateral continua. Corticoide no particulado',
  evidencia:'Eficaz en dolor radicular cervical, con un margen de seguridad estrecho',
  exitoEsperado:'Alivio en 60%',
  duracion:'Semanas a meses',
  contraindicaciones:['Estenosis severa en el nivel de abordaje','Coagulopatía','Infección'],
  complicaciones:['Hematoma epidural cervical, que es una urgencia neuroquirúrgica','Lesión medular',
                  'Punción dural'],
  riesgoSangrado:'alto',
  consentimiento:['Es un procedimiento de mayor riesgo que el lumbar, por la proximidad de la médula',
                  'Consultar de inmediato ante debilidad o dolor cervical intenso posterior',
                  'Garantía de medios, no de resultados'],
  registro:'Nivel de abordaje, corticoide y control neurológico posterior'
},

bloqueo_sacroiliaco:{
  nombre:'Bloqueo intraarticular sacroilíaco', grupo:'Columna lumbar', proposito:'diagnóstico y terapéutico',
  indicaciones:['Dolor sacroilíaco con maniobras provocativas positivas'],
  guia:'Radioscopia o TC. La ecografía sirve para el bloqueo periarticular, no para el intraarticular',
  tecnica:'Abordaje del tercio inferior de la articulación, con contraste para confirmar el patrón intraarticular',
  evidencia:'Diagnóstica cuando alivia más del 75%; terapéutica con duración variable',
  exitoEsperado:'Alivio en 60-70% cuando la selección es correcta',
  duracion:'Semanas a meses',
  contraindicaciones:['Infección','Coagulopatía'],
  complicaciones:['Punción vascular','Bloqueo transitorio del ciático por difusión'],
  riesgoSangrado:'intermedio',
  consentimiento:['Puede producir adormecimiento transitorio de la pierna','Garantía de medios, no de resultados'],
  registro:'Porcentaje de alivio inmediato y a las 2 semanas'
},

radiofrecuencia_sacroiliaca:{
  nombre:'Radiofrecuencia de ramos laterales sacros', grupo:'Columna lumbar', proposito:'terapéutico',
  indicaciones:['Dolor sacroilíaco confirmado por bloqueos'],
  guia:'Radioscopia',
  tecnica:'Lesiones múltiples o en tira (strip lesion) sobre los ramos laterales de S1 a S3',
  evidencia:'Moderada, con resultados más variables que la faceta lumbar por la inervación difusa de la articulación',
  exitoEsperado:'Alivio en 50-60%',
  duracion:'6 a 12 meses',
  contraindicaciones:['Bloqueos negativos','Infección','Coagulopatía'],
  complicaciones:['Neuritis','Hipoestesia glútea'],
  riesgoSangrado:'intermedio',
  consentimiento:['Resultado más variable que en otras localizaciones','Garantía de medios, no de resultados'],
  registro:'Niveles y técnica de lesión'
},

adhesiolisis_epidural:{
  nombre:'Adhesiolisis epidural (lisis de adherencias)', grupo:'Columna lumbar', proposito:'terapéutico',
  indicaciones:['Dolor espinal persistente tras cirugía con fibrosis epidural documentada'],
  guia:'Radioscopia con epidurografía',
  tecnica:'Catéter dirigido con solución hipertónica, hialuronidasa y corticoide, en una o varias sesiones',
  evidencia:'Moderada y discutida. Puede ayudar en un subgrupo bien seleccionado',
  exitoEsperado:'Alivio parcial en cerca de la mitad de los casos',
  duracion:'Meses',
  contraindicaciones:['Infección','Coagulopatía','Aracnoiditis extensa'],
  complicaciones:['Punción dural','Inyección subaracnoidea de solución hipertónica (grave)','Hematoma'],
  riesgoSangrado:'alto',
  consentimiento:['Procedimiento de evidencia intermedia, que puede no dar resultado',
                  'Garantía de medios, no de resultados'],
  registro:'Patrón de la epidurografía antes y después'
},

/* ---------- BLOQUEOS PERIFERICOS ------------------------------------- */

bloqueo_occipital:{
  nombre:'Bloqueo del nervio occipital mayor y menor', grupo:'Cabeza y cara', proposito:'diagnóstico y terapéutico',
  indicaciones:['Neuralgia occipital','Cefalea cervicogénica','Migraña crónica como coadyuvante'],
  guia:'Por reparos anatómicos o con ecografía a nivel de C2 (técnica de Greher)',
  tecnica:'Anestésico local con o sin corticoide, medial a la arteria occipital',
  evidencia:'Buena en neuralgia occipital, con alivio a veces mayor que la duración del anestésico',
  exitoEsperado:'Alivio en 70-80% en la neuralgia occipital',
  duracion:'Semanas a meses',
  contraindicaciones:['Infección local','Alergia al anestésico'],
  complicaciones:['Punción de la arteria occipital','Mareo','Alopecia local por el corticoide'],
  riesgoSangrado:'bajo',
  consentimiento:['Adormecimiento del cuero cabelludo por horas','Posible alopecia local transitoria',
                  'Garantía de medios, no de resultados'],
  registro:'Alivio inmediato y a las 2 semanas'
},

bloqueo_trigemino:{
  nombre:'Bloqueo de ramas del trigémino', grupo:'Cabeza y cara', proposito:'diagnóstico y terapéutico',
  indicaciones:['Neuralgia del trigémino','Dolor facial neuropático'],
  guia:'Reparos anatómicos o ecografía para las ramas periféricas (supraorbitario, infraorbitario, mentoniano)',
  tecnica:'Volumen pequeño de anestésico local en el foramen correspondiente',
  evidencia:'Útil como prueba diagnóstica y como puente mientras se titula el fármaco',
  exitoEsperado:'Alivio de horas a semanas',
  duracion:'Transitoria',
  contraindicaciones:['Infección local'],
  complicaciones:['Hematoma periorbitario','Adormecimiento facial'],
  riesgoSangrado:'bajo',
  consentimiento:['Adormecimiento de la zona por horas','Posible hematoma','Garantía de medios, no de resultados'],
  registro:'Rama bloqueada y alivio'
},

radiofrecuencia_gasser:{
  nombre:'Radiofrecuencia del ganglio de Gasser', grupo:'Cabeza y cara', proposito:'terapéutico',
  indicaciones:['Neuralgia del trigémino refractaria al tratamiento médico, o con intolerancia a los fármacos'],
  guia:'Radioscopia, abordaje por el foramen oval',
  tecnica:'Termocoagulación controlada con el paciente despierto por momentos, para mapear la rama afectada',
  evidencia:'Alta tasa de alivio inicial, con recurrencia a lo largo de los años',
  exitoEsperado:'Alivio inicial en más del 90%, con recurrencia progresiva',
  duracion:'Años, con posibilidad de repetición',
  contraindicaciones:['Coagulopatía','Infección','Imposibilidad de colaborar durante el procedimiento'],
  complicaciones:['Hipoestesia facial (casi constante y esperable)','Anestesia dolorosa (rara pero muy incapacitante)',
                  'Debilidad del masetero','Queratitis por hipoestesia corneal en el bloqueo de V1'],
  riesgoSangrado:'alto',
  consentimiento:['El adormecimiento de la cara es esperado, no una complicación',
                  'Riesgo de anestesia dolorosa, que es de difícil tratamiento',
                  'Riesgo ocular si se trata la primera rama','Garantía de medios, no de resultados'],
  registro:'Rama tratada, temperatura, tiempo y examen sensitivo posterior'
},

bloqueo_supraescapular:{
  nombre:'Bloqueo del nervio supraescapular', grupo:'Miembro superior', proposito:'terapéutico',
  indicaciones:['Hombro doloroso crónico','Capsulitis adhesiva','Dolor de hombro en hemipléjico'],
  guia:'Ecografía en la escotadura o el surco espinoglenoideo',
  tecnica:'Anestésico local con corticoide; también admite radiofrecuencia pulsada',
  evidencia:'Buena para facilitar la kinesiología, que es lo que en definitiva resuelve el cuadro',
  exitoEsperado:'Alivio en 60-70%, por semanas',
  duracion:'Semanas a meses',
  contraindicaciones:['Infección','Coagulopatía'],
  complicaciones:['Neumotórax (raro, evitable con ecografía)','Debilidad transitoria del supraespinoso'],
  riesgoSangrado:'bajo',
  consentimiento:['Debilidad transitoria del hombro','Riesgo bajo de neumotórax',
                  'Debe acompañarse de kinesiología para dar resultado','Garantía de medios, no de resultados'],
  registro:'Rango articular antes y después'
},

bloqueo_intercostal:{
  nombre:'Bloqueo de nervios intercostales', grupo:'Tronco', proposito:'diagnóstico y terapéutico',
  indicaciones:['Dolor post-toracotomía','Neuralgia postherpética torácica','Dolor de pared costal',
                'Fracturas costales'],
  guia:'Ecografía, muy preferible a los reparos anatómicos',
  tecnica:'Anestésico local en el surco subcostal, en varios niveles adyacentes',
  evidencia:'Buena para diagnóstico y como puente terapéutico',
  exitoEsperado:'Alivio inmediato que confirma el generador del dolor',
  duracion:'Horas a semanas',
  contraindicaciones:['Infección','Coagulopatía'],
  complicaciones:['NEUMOTÓRAX','Toxicidad sistémica por anestésicos locales (por absorción alta en esta región)',
                  'Hematoma'],
  riesgoSangrado:'intermedio',
  consentimiento:['Riesgo de neumotórax, que puede requerir drenaje','Consultar ante dificultad respiratoria',
                  'Garantía de medios, no de resultados'],
  registro:'Niveles bloqueados, volumen total y dosis de anestésico calculada por peso'
},

bloqueo_esp:{
  nombre:'Bloqueo del plano del erector de la espina (ESP)', grupo:'Tronco', proposito:'terapéutico',
  indicaciones:['Dolor torácico o abdominal de pared','Dolor post-toracotomía','Fracturas costales múltiples',
                'Analgesia postoperatoria'],
  guia:'Ecografía',
  tecnica:'Anestésico local en el plano profundo al músculo erector, sobre el proceso transverso',
  evidencia:'Creciente y muy favorable. Es de los bloqueos de plano más seguros y versátiles',
  exitoEsperado:'Analgesia extensa de varios metámeras',
  duracion:'Horas, o días con catéter',
  contraindicaciones:['Infección','Coagulopatía (menor riesgo que el neuroaxial)'],
  complicaciones:['Toxicidad sistémica por anestésicos locales','Neumotórax (muy raro)'],
  riesgoSangrado:'bajo',
  consentimiento:['Adormecimiento amplio de la pared','Garantía de medios, no de resultados'],
  registro:'Nivel, volumen y extensión del bloqueo'
},

bloqueo_pared_abdominal:{
  nombre:'Bloqueos de pared abdominal (TAP, cuadrado lumbar, recto)', grupo:'Tronco', proposito:'terapéutico',
  indicaciones:['Dolor de pared abdominal','Atrapamiento de nervio cutáneo abdominal (ACNES)',
                'Dolor postquirúrgico de hernioplastia','Analgesia postoperatoria'],
  guia:'Ecografía',
  tecnica:'Anestésico local en el plano correspondiente',
  evidencia:'Buena. El test de Carnett positivo (dolor que aumenta al contraer la pared) identifica ' +
            'a los pacientes que van a responder',
  exitoEsperado:'Alivio inmediato en el dolor de pared',
  duracion:'Horas a semanas',
  contraindicaciones:['Infección','Coagulopatía'],
  complicaciones:['Punción visceral (rara con ecografía)','Toxicidad por anestésicos locales'],
  riesgoSangrado:'bajo',
  consentimiento:['Adormecimiento de la pared abdominal','Garantía de medios, no de resultados'],
  registro:'Plano, volumen y respuesta'
},

bloqueo_pecs:{
  nombre:'Bloqueos PECS y del serrato', grupo:'Tronco', proposito:'terapéutico',
  indicaciones:['Dolor crónico postmastectomía','Dolor de pared torácica anterolateral','Analgesia postoperatoria mamaria'],
  guia:'Ecografía',
  tecnica:'Anestésico local en los planos interfasciales pectorales o del serrato',
  evidencia:'Buena en dolor postmastectomía, incluyendo el territorio del intercostobraquial',
  exitoEsperado:'Alivio significativo del dolor de pared',
  duracion:'Horas a semanas',
  contraindicaciones:['Infección','Coagulopatía'],
  complicaciones:['Neumotórax (raro)','Toxicidad por anestésicos locales'],
  riesgoSangrado:'bajo',
  consentimiento:['Adormecimiento de la pared torácica y la axila','Garantía de medios, no de resultados'],
  registro:'Plano y respuesta'
},

bloqueo_pudendo:{
  nombre:'Bloqueo del nervio pudendo', grupo:'Pelvis', proposito:'diagnóstico y terapéutico',
  indicaciones:['Neuralgia del pudendo (es el quinto criterio de Nantes)','Dolor perineal crónico'],
  guia:'Ecografía o TC, a nivel del ligamento sacroespinoso o del canal de Alcock',
  tecnica:'Anestésico local con corticoide',
  evidencia:'Necesario para el diagnóstico según los criterios de Nantes',
  exitoEsperado:'El alivio confirma el diagnóstico',
  duracion:'Horas a semanas',
  contraindicaciones:['Infección','Coagulopatía'],
  complicaciones:['Bloqueo del ciático por difusión','Punción vascular','Retención urinaria transitoria'],
  riesgoSangrado:'intermedio',
  consentimiento:['Adormecimiento perineal y posible debilidad transitoria de la pierna',
                  'Garantía de medios, no de resultados'],
  registro:'Porcentaje y duración del alivio, que definen el criterio de Nantes'
},

bloqueo_femorocutaneo:{
  nombre:'Bloqueo del nervio femorocutáneo lateral', grupo:'Miembro inferior', proposito:'diagnóstico y terapéutico',
  indicaciones:['Meralgia parestésica'],
  guia:'Ecografía, medial y caudal a la espina ilíaca anterosuperior',
  tecnica:'Volumen pequeño de anestésico local con corticoide',
  evidencia:'Buena; confirma el diagnóstico y suele ser terapéutico',
  exitoEsperado:'Alivio en 70-80%',
  duracion:'Semanas a meses',
  contraindicaciones:['Infección local'],
  complicaciones:['Bloqueo del femoral por difusión, con debilidad del cuádriceps y riesgo de caída'],
  riesgoSangrado:'bajo',
  consentimiento:['Posible debilidad transitoria del muslo: no manejar ni caminar solo por unas horas',
                  'Garantía de medios, no de resultados'],
  registro:'Alivio y duración'
},

bloqueo_neuroma:{
  nombre:'Bloqueo de neuroma', grupo:'Miembro', proposito:'diagnóstico y terapéutico',
  indicaciones:['Dolor de muñón con neuroma palpable','Neuroma postquirúrgico'],
  guia:'Ecografía',
  tecnica:'Anestésico local sobre el neuroma identificado por ecografía y por el signo de Tinel',
  evidencia:'Confirma el generador y anticipa la respuesta a la ablación o a la cirugía',
  exitoEsperado:'Alivio inmediato si el neuroma es el generador',
  duracion:'Horas a semanas',
  contraindicaciones:['Infección local'],
  complicaciones:['Dolor transitorio en el sitio'],
  riesgoSangrado:'bajo',
  consentimiento:['Prueba diagnóstica de alivio transitorio','Garantía de medios, no de resultados'],
  registro:'Alivio y correlación con el Tinel'
},

infiltracion_intraarticular:{
  nombre:'Infiltración intraarticular (corticoide o ácido hialurónico)', grupo:'Articular', proposito:'terapéutico',
  indicaciones:['Artrosis de rodilla o cadera con dolor refractario','Brote inflamatorio articular'],
  guia:'Ecografía, sobre todo en cadera; en rodilla es posible por reparos',
  tecnica:'Técnica estéril estricta',
  evidencia:'Corticoide: alivio a corto plazo, de 4 a 8 semanas. Ácido hialurónico: efecto discutido ' +
            'y no recomendado por varias guías',
  exitoEsperado:'Alivio de 4 a 12 semanas con corticoide',
  duracion:'Semanas',
  contraindicaciones:['Infección articular o cutánea','Prótesis articular (riesgo de sembrar la prótesis)',
                      'Diabetes descompensada'],
  complicaciones:['Artritis séptica (rara y grave)','Artropatía por corticoide con inyecciones repetidas',
                  'Hiperglucemia','Atrofia cutánea'],
  riesgoSangrado:'bajo',
  consentimiento:['No más de 3 a 4 infiltraciones por año en la misma articulación',
                  'Elevación de la glucemia en diabéticos','Consultar ante fiebre o articulación caliente',
                  'Garantía de medios, no de resultados'],
  registro:'Articulación, fármaco, dosis y número de infiltración en el año'
},

infiltracion_subacromial:{
  nombre:'Infiltración subacromial', grupo:'Articular', proposito:'terapéutico',
  indicaciones:['Síndrome subacromial','Tendinopatía del manguito rotador','Bursitis'],
  guia:'Ecografía',
  tecnica:'Corticoide con anestésico local en el espacio subacromial-subdeltoideo',
  evidencia:'Alivio a corto plazo que permite empezar la kinesiología',
  exitoEsperado:'Alivio de semanas',
  duracion:'4 a 8 semanas',
  contraindicaciones:['Infección','Rotura completa del manguito con planteo quirúrgico'],
  complicaciones:['Atrofia y despigmentación cutánea','Debilitamiento tendinoso con inyecciones repetidas'],
  riesgoSangrado:'bajo',
  consentimiento:['Debe acompañarse de kinesiología','No repetir indefinidamente','Garantía de medios, no de resultados'],
  registro:'Respuesta y rango articular'
},

infiltracion_tunel_carpiano:{
  nombre:'Infiltración del túnel carpiano', grupo:'Miembro superior', proposito:'terapéutico',
  indicaciones:['Síndrome del túnel carpiano leve a moderado'],
  guia:'Ecografía, que permite ver el nervio y evitarlo',
  tecnica:'Corticoide dentro del túnel, sin inyectar en el nervio',
  evidencia:'Buena a corto y mediano plazo; muchos pacientes evitan o postergan la cirugía',
  exitoEsperado:'Alivio en 70% a 3 meses',
  duracion:'Meses',
  contraindicaciones:['Déficit motor o atrofia tenar, que indican cirugía','Infección'],
  complicaciones:['Lesión del nervio mediano si se inyecta intraneural','Atrofia cutánea'],
  riesgoSangrado:'bajo',
  consentimiento:['Es una medida temporaria; si hay debilidad, la cirugía no debe demorarse',
                  'Garantía de medios, no de resultados'],
  registro:'Síntomas nocturnos y fuerza de pinza antes y después'
},

hidrodiseccion:{
  nombre:'Hidrodisección nerviosa', grupo:'Miembro', proposito:'terapéutico',
  indicaciones:['Atrapamientos nerviosos periféricos','Nervio adherido a planos por fibrosis'],
  guia:'Ecografía',
  tecnica:'Solución (suero, dextrosa o anestésico local) inyectada alrededor del nervio para liberarlo del plano',
  evidencia:'Emergente, con resultados prometedores y menos evidencia acumulada que otras técnicas',
  exitoEsperado:'Variable',
  duracion:'Meses',
  contraindicaciones:['Infección'],
  complicaciones:['Lesión nerviosa por inyección intraneural'],
  riesgoSangrado:'bajo',
  consentimiento:['Técnica de evidencia emergente','Garantía de medios, no de resultados'],
  registro:'Nervio, volumen y respuesta'
},

puntos_gatillo:{
  nombre:'Infiltración de puntos gatillo y punción seca', grupo:'Miofascial', proposito:'terapéutico',
  indicaciones:['Síndrome de dolor miofascial con puntos gatillo activos'],
  guia:'Palpación; ecografía en músculos profundos o cerca de la pleura',
  tecnica:'Punción seca o anestésico local sin corticoide. Buscar la respuesta de espasmo local',
  evidencia:'La punción seca y la infiltración con anestésico tienen eficacia similar. El corticoide ' +
            'no aporta y daña el músculo',
  exitoEsperado:'Alivio inmediato con dolor local por 24-72 h',
  duracion:'Semanas, si se corrige el factor perpetuante',
  contraindicaciones:['Anticoagulación plena','Infección local','Miedo a las agujas no manejable'],
  complicaciones:['NEUMOTÓRAX en puntos de la pared torácica y del trapecio (la complicación grave a temer)',
                  'Dolor local','Hematoma'],
  riesgoSangrado:'bajo',
  consentimiento:['Dolor local por 1 a 3 días después','Riesgo de neumotórax en puntos torácicos',
                  'Necesidad de corregir la causa para que no vuelva','Garantía de medios, no de resultados'],
  registro:'Músculos tratados y factor perpetuante identificado'
},

/* ---------- BLOQUEOS SIMPATICOS -------------------------------------- */

ganglio_estrellado:{
  nombre:'Bloqueo del ganglio estrellado', grupo:'Simpático', proposito:'diagnóstico y terapéutico',
  indicaciones:['SDRC de miembro superior','Dolor neuropático de cara y miembro superior',
                'Síndromes vasculares de miembro superior'],
  guia:'Ecografía (de elección: permite ver la arteria vertebral y la tiroides) o radioscopia',
  tecnica:'Abordaje anterior paratraqueal a nivel de C6, con volumen bajo',
  evidencia:'Buena en SDRC precoz, sobre todo como facilitador de la rehabilitación',
  exitoEsperado:'El signo de éxito es el síndrome de Horner con aumento de la temperatura del miembro',
  duracion:'Horas; se hace en serie',
  contraindicaciones:['Coagulopatía','Infarto reciente','Bloqueo cardíaco','Neumotórax contralateral',
                      'Parálisis recurrencial contralateral'],
  complicaciones:['Hematoma cervical con compromiso de la vía aérea','Inyección intraarterial vertebral ' +
                  'con convulsión inmediata','Parálisis recurrencial con disfonía','Bloqueo frénico',
                  'Neumotórax','Bloqueo espinal alto'],
  riesgoSangrado:'alto',
  consentimiento:['Es esperable el síndrome de Horner: párpado caído y pupila chica por horas',
                  'Ronquera y sensación de nudo en la garganta transitorias',
                  'No comer ni beber por 2 horas después','Riesgo bajo pero real de complicación grave',
                  'Garantía de medios, no de resultados'],
  registro:'Temperatura del miembro antes y después, presencia de Horner, y respuesta analgésica'
},

simpatico_lumbar:{
  nombre:'Bloqueo simpático lumbar', grupo:'Simpático', proposito:'diagnóstico y terapéutico',
  indicaciones:['SDRC de miembro inferior','Enfermedad vascular periférica con dolor de reposo',
                'Hiperhidrosis plantar'],
  guia:'Radioscopia o TC, a nivel de L2-L3',
  tecnica:'Anestésico local; en casos seleccionados, neurólisis química con fenol o alcohol',
  evidencia:'Moderada en SDRC; buena en dolor isquémico',
  exitoEsperado:'Aumento de temperatura del pie como signo de bloqueo efectivo',
  duracion:'Horas con anestésico, meses con neurólisis',
  contraindicaciones:['Coagulopatía','Infección','Aneurisma de aorta abdominal'],
  complicaciones:['Neuralgia genitofemoral (frecuente tras neurólisis)','Punción vascular o ureteral',
                  'Hipotensión'],
  riesgoSangrado:'alto',
  consentimiento:['Sensación de pierna caliente','Posible dolor inguinal transitorio tras la neurólisis',
                  'Garantía de medios, no de resultados'],
  registro:'Temperatura comparativa antes y después'
},

bloqueo_simpatico:{
  nombre:'Bloqueo simpático (según territorio)', grupo:'Simpático', proposito:'diagnóstico y terapéutico',
  indicaciones:['SDRC','Dolor mantenido por el simpático','Neuralgia postherpética en fase precoz'],
  guia:'Según el nivel: ecografía o radioscopia',
  tecnica:'Anestésico local sobre la cadena simpática del territorio comprometido',
  evidencia:'Su rol es sobre todo diagnóstico: identifica el componente mantenido por el simpático',
  exitoEsperado:'Alivio con aumento de temperatura del territorio',
  duracion:'Horas a días',
  contraindicaciones:['Coagulopatía','Infección'],
  complicaciones:['Según el territorio bloqueado'],
  riesgoSangrado:'alto',
  consentimiento:['Cambios de temperatura y coloración del territorio','Garantía de medios, no de resultados'],
  registro:'Termometría comparativa'
},

bloqueo_celiaco:{
  nombre:'Bloqueo y neurólisis del plexo celíaco', grupo:'Simpático', proposito:'terapéutico',
  indicaciones:['Dolor por cáncer de páncreas o de vísceras del abdomen superior','Pancreatitis crónica'],
  guia:'TC, radioscopia o ecoendoscopia',
  tecnica:'Anestésico local de prueba y luego alcohol al 50-100% para la neurólisis',
  evidencia:'BUENA en cáncer de páncreas: reduce el dolor y el consumo de opioides. Hacerlo temprano ' +
            'da mejores resultados que dejarlo como último recurso',
  exitoEsperado:'Alivio significativo en 70-90% en cáncer de páncreas',
  duracion:'Meses',
  contraindicaciones:['Coagulopatía','Obstrucción intestinal','Infección','Distorsión anatómica extrema'],
  complicaciones:['Hipotensión ortostática (frecuente y esperable)','Diarrea (frecuente)',
                  'PARAPLEJÍA por lesión de la arteria de Adamkiewicz (rara y catastrófica)',
                  'Punción visceral o vascular'],
  riesgoSangrado:'alto',
  consentimiento:['Diarrea y presión baja los primeros días son esperables',
                  'Riesgo excepcional de lesión medular','Garantía de medios, no de resultados'],
  registro:'Dolor y MME diario antes y después: la reducción de opioide es la mejor medida del éxito'
},

hipogastrico_superior:{
  nombre:'Bloqueo del plexo hipogástrico superior', grupo:'Simpático', proposito:'terapéutico',
  indicaciones:['Dolor pelviano visceral oncológico','Dolor pelviano crónico refractario'],
  guia:'Radioscopia o TC, a nivel de L5-S1',
  tecnica:'Anestésico local de prueba y luego neurólisis en el paciente oncológico',
  evidencia:'Buena en dolor pelviano oncológico',
  exitoEsperado:'Alivio en 60-70%',
  duracion:'Meses',
  contraindicaciones:['Coagulopatía','Infección'],
  complicaciones:['Punción vascular o discal','Lesión ureteral'],
  riesgoSangrado:'alto',
  consentimiento:['Riesgo de punción de estructuras vecinas','Garantía de medios, no de resultados'],
  registro:'Dolor y MME antes y después'
},

ganglio_impar:{
  nombre:'Bloqueo del ganglio impar (de Walther)', grupo:'Simpático', proposito:'terapéutico',
  indicaciones:['Coccigodinia','Dolor perineal y anorrectal, oncológico o no'],
  guia:'Radioscopia, por la unión sacrococcígea',
  tecnica:'Anestésico local; neurólisis en el paciente oncológico',
  evidencia:'Buena en coccigodinia y dolor perineal',
  exitoEsperado:'Alivio en 60-70%',
  duracion:'Meses',
  contraindicaciones:['Infección local','Coagulopatía'],
  complicaciones:['Punción rectal','Infección'],
  riesgoSangrado:'intermedio',
  consentimiento:['Riesgo de punción rectal','Garantía de medios, no de resultados'],
  registro:'Tiempo tolerado sentado antes y después'
},

/* ---------- OTROS ---------------------------------------------------- */

radiofrecuencia_pulsada:{
  nombre:'Radiofrecuencia pulsada', grupo:'Neuromodulación', proposito:'terapéutico',
  indicaciones:['Dolor neuropático periférico donde una lesión térmica sería inaceptable',
                'Ganglio de la raíz dorsal','Nervios periféricos sensitivos'],
  guia:'Radioscopia o ecografía',
  tecnica:'Campo eléctrico pulsado manteniendo la temperatura por debajo de 42 °C: neuromodula sin destruir',
  evidencia:'Moderada. Ventaja principal: no produce déficit sensitivo ni neuritis por desaferentación',
  exitoEsperado:'Alivio variable, de meses',
  duracion:'3 a 6 meses',
  contraindicaciones:['Infección','Coagulopatía','Marcapasos sin coordinación previa'],
  complicaciones:['Escasas: es su principal atractivo'],
  riesgoSangrado:'intermedio',
  consentimiento:['Resultado variable, sin garantía de alivio','No produce adormecimiento',
                  'Garantía de medios, no de resultados'],
  registro:'Diana, parámetros y respuesta'
},

crioablacion:{
  nombre:'Crioanalgesia (crioablación de nervio periférico)', grupo:'Neuromodulación', proposito:'terapéutico',
  indicaciones:['Dolor post-toracotomía','Neuralgia intercostal','Dolor de pared'],
  guia:'Ecografía',
  tecnica:'Enfriamiento a −70 °C que produce degeneración walleriana conservando el endoneuro, ' +
          'con lo que el nervio regenera y el riesgo de neuroma es bajo',
  evidencia:'Moderada, con buena duración del efecto',
  exitoEsperado:'Alivio de meses',
  duracion:'2 a 6 meses',
  contraindicaciones:['Infección','Coagulopatía','Crioglobulinemia'],
  complicaciones:['Hipoestesia transitoria','Lesión cutánea por frío'],
  riesgoSangrado:'bajo',
  consentimiento:['Adormecimiento de la zona por meses','El nervio se regenera y el dolor puede volver',
                  'Garantía de medios, no de resultados'],
  registro:'Nervios tratados y duración del efecto'
},

estimulacion_medular:{
  nombre:'Estimulación medular (neuroestimulador)', grupo:'Neuromodulación', proposito:'terapéutico',
  indicaciones:['Dolor espinal persistente tras cirugía con componente radicular predominante',
                'SDRC refractario','Neuropatía diabética dolorosa refractaria',
                'Dolor isquémico y angina refractaria'],
  guia:'Radioscopia, con implante en dos etapas',
  tecnica:'PERÍODO DE PRUEBA obligatorio de 5 a 14 días con electrodo externo. Solo se implanta el ' +
          'generador definitivo si la prueba logra más de 50% de alivio con mejoría funcional',
  evidencia:'Buena en dolor neuropático refractario bien seleccionado. La selección psicológica previa ' +
            'no es un trámite: predice el resultado tanto como la indicación clínica',
  exitoEsperado:'Más de 50% de alivio en cerca del 60% de los pacientes que superan la prueba',
  duracion:'Años, con pérdida progresiva de eficacia en algunos casos',
  contraindicaciones:['Infección','Coagulopatía','Psicopatología no compensada','Trastorno por uso de sustancias activo',
                      'Expectativas irreales','Litigio laboral no resuelto (predictor de mal resultado)'],
  complicaciones:['Migración del electrodo (la más frecuente)','Infección del bolsillo','Fibrosis',
                  'Punción dural','Falla del generador','Pérdida de eficacia con el tiempo'],
  riesgoSangrado:'alto',
  consentimiento:['El objetivo es reducir el dolor cerca de la mitad, no eliminarlo',
                  'Requiere una prueba previa que puede resultar negativa',
                  'Requiere evaluación psicológica previa',
                  'Puede requerir reintervenciones por migración o falla',
                  'Limitaciones con la resonancia magnética y en la seguridad de aeropuertos',
                  'Garantía de medios, no de resultados'],
  registro:'Resultado del período de prueba con porcentaje de alivio y cambio funcional documentado'
},

bomba_intratecal:{
  nombre:'Bomba de infusión intratecal', grupo:'Neuromodulación', proposito:'terapéutico',
  indicaciones:['Dolor oncológico refractario con efectos adversos intolerables por vía sistémica',
                'Dolor crónico no oncológico muy seleccionado','Espasticidad severa (baclofeno)'],
  guia:'Radioscopia',
  tecnica:'Prueba con dosis intratecal previa, luego implante de catéter y bomba programable',
  evidencia:'Buena en dolor oncológico refractario, con mejor control y menos efectos sistémicos',
  exitoEsperado:'Alivio significativo con reducción marcada de los efectos adversos sistémicos',
  duracion:'Años, con recargas periódicas',
  contraindicaciones:['Infección','Coagulopatía','Imposibilidad de sostener el seguimiento y las recargas',
                      'Psicopatología no compensada'],
  complicaciones:['GRANULOMA EN LA PUNTA DEL CATÉTER, que puede producir déficit neurológico',
                  'Infección y meningitis','Error de programación o de recarga, potencialmente mortal',
                  'Síndrome de abstinencia por falla del sistema','Higroma'],
  riesgoSangrado:'alto',
  consentimiento:['Requiere recargas periódicas de por vida y un compromiso de seguimiento estricto',
                  'Riesgo de complicaciones graves, incluida la abstinencia si el sistema falla',
                  'Garantía de medios, no de resultados'],
  registro:'Fármaco, concentración, dosis diaria, fecha de recarga y próxima recarga programada'
},

distension_capsular:{
  nombre:'Distensión capsular glenohumeral (hidrodilatación)', grupo:'Articular', proposito:'terapéutico',
  indicaciones:['Capsulitis adhesiva en fase de rigidez'],
  guia:'Ecografía o radioscopia',
  tecnica:'Inyección intraarticular de volumen (suero, anestésico y corticoide) para distender la cápsula retraída',
  evidencia:'Moderada; acelera la recuperación del rango cuando se combina con kinesiología',
  exitoEsperado:'Mejoría del rango articular',
  duracion:'Semanas a meses',
  contraindicaciones:['Infección','Rotura del manguito con planteo quirúrgico'],
  complicaciones:['Dolor intenso durante la distensión','Rotura capsular (habitualmente sin consecuencia)'],
  riesgoSangrado:'bajo',
  consentimiento:['Es doloroso durante la inyección','Requiere kinesiología inmediata posterior para dar resultado',
                  'Garantía de medios, no de resultados'],
  registro:'Rango articular en grados antes y después'
},

geniculares:{
  nombre:'Bloqueo de nervios geniculares', grupo:'Articular', proposito:'diagnóstico',
  indicaciones:['Artrosis de rodilla con dolor refractario','Selección para radiofrecuencia genicular',
                'Dolor persistente tras prótesis de rodilla'],
  guia:'Ecografía o radioscopia',
  tecnica:'Anestésico local sobre los nervios geniculares superomedial, superolateral e inferomedial',
  evidencia:'Buena como prueba de selección',
  exitoEsperado:'Más de 50% de alivio identifica al candidato a radiofrecuencia',
  duracion:'Horas',
  contraindicaciones:['Infección','Coagulopatía'],
  complicaciones:['Punción vascular de la arteria genicular','Hematoma'],
  riesgoSangrado:'bajo',
  consentimiento:['Prueba diagnóstica de alivio transitorio','Garantía de medios, no de resultados'],
  registro:'Porcentaje de alivio'
},

radiofrecuencia_geniculares:{
  nombre:'Radiofrecuencia de nervios geniculares', grupo:'Articular', proposito:'terapéutico',
  indicaciones:['Artrosis de rodilla con bloqueo genicular positivo','Paciente no candidato a prótesis',
                'Dolor persistente tras el reemplazo articular'],
  guia:'Radioscopia o ecografía',
  tecnica:'Lesión térmica de los nervios geniculares',
  evidencia:'Buena y creciente. Muy útil en el paciente que no puede o no quiere operarse',
  exitoEsperado:'Alivio en 60-70% durante 6 a 12 meses',
  duracion:'6 a 12 meses',
  contraindicaciones:['Bloqueo diagnóstico negativo','Infección','Coagulopatía'],
  complicaciones:['Hematoma','Neuritis','Hipoestesia'],
  riesgoSangrado:'intermedio',
  consentimiento:['Efecto temporario por regeneración nerviosa','No corrige la artrosis, solo el dolor',
                  'Garantía de medios, no de resultados'],
  registro:'Distancia de marcha y escaleras antes y después'
},

descompresion_microvascular:{
  nombre:'Descompresión microvascular (derivación a neurocirugía)', grupo:'Cabeza y cara', proposito:'terapéutico',
  indicaciones:['Neuralgia del trigémino con compresión neurovascular en la resonancia, en paciente ' +
                'joven y en buen estado general'],
  guia:'Cirugía a cargo de neurocirugía',
  tecnica:'Craneotomía retrosigmoidea con interposición entre el vaso y el nervio',
  evidencia:'Es el tratamiento con mayor duración del alivio en la neuralgia del trigémino',
  exitoEsperado:'Alivio prolongado en 70-80% a 10 años',
  duracion:'Años',
  contraindicaciones:['Comorbilidad que contraindique la craneotomía','Ausencia de compresión demostrable'],
  complicaciones:['Hipoacusia','Fístula de líquido cefalorraquídeo','Complicaciones de la craneotomía'],
  riesgoSangrado:'alto',
  consentimiento:['Corresponde a neurocirugía. Es una cirugía mayor de fosa posterior'],
  registro:'Derivación con la resonancia y el detalle del tratamiento médico ya intentado'
},

cordotomia:{
  nombre:'Cordotomía percutánea cervical', grupo:'Neuroablativo', proposito:'terapéutico',
  indicaciones:['Dolor oncológico unilateral refractario, con expectativa de vida limitada',
                'Mesotelioma y tumores de pared torácica'],
  guia:'TC o radioscopia, con estimulación',
  tecnica:'Lesión por radiofrecuencia del haz espinotalámico a nivel C1-C2',
  evidencia:'Alivio inmediato y marcado en el dolor unilateral refractario',
  exitoEsperado:'Alivio en más del 80%, con pérdida progresiva a lo largo de meses',
  duracion:'Meses',
  contraindicaciones:['Dolor bilateral','Insuficiencia respiratoria (riesgo de apnea del sueño por ' +
                      'compromiso de las vías respiratorias automáticas)','Expectativa de vida prolongada'],
  complicaciones:['Paresia','Apnea del sueño (síndrome de Ondina)','Disfunción vesical','Dolor en espejo'],
  riesgoSangrado:'alto',
  consentimiento:['Procedimiento destructivo e irreversible','Reservado a situaciones muy seleccionadas',
                  'Garantía de medios, no de resultados'],
  registro:'Nivel sensitivo alcanzado y evolución respiratoria'
}

};

/* =========================================================================
   SUSPENSION DE ANTICOAGULANTES Y ANTIAGREGANTES
   -------------------------------------------------------------------------
   Segun las recomendaciones de ASRA para procedimientos intervencionistas en
   dolor, que estratifican por riesgo del procedimiento y no aplican el mismo
   criterio a un bloqueo superficial que a un epidural.

   Los procedimientos de RIESGO ALTO son los neuroaxiales y los profundos no
   compresibles: cualquier epidural, la radiofrecuencia del ganglio de Gasser,
   los bloqueos simpaticos profundos, la estimulacion medular y la bomba
   intratecal. Los de RIESGO BAJO son los superficiales y compresibles.

   Esta tabla ORIENTA. La decision de suspender un anticoagulante se toma
   siempre junto al medico que lo indico, y en el paciente con stent reciente,
   fibrilacion auricular de alto riesgo o valvula mecanica, el riesgo de
   suspender puede superar al de sangrar.
   ========================================================================= */
const ANTICOAGULACION = {
  aspirina:{
    nombre:'Aspirina (ácido acetilsalicílico)',
    alto:'Evaluar caso por caso. En prevención primaria se puede suspender 6 días antes; ' +
         'en prevención secundaria, habitualmente se continúa',
    intermedio:'Habitualmente se continúa',
    bajo:'Continuar'},
  clopidogrel:{
    nombre:'Clopidogrel',
    alto:'Suspender 7 días antes', intermedio:'Suspender 7 días antes', bajo:'Suspender 7 días antes'},
  prasugrel:{
    nombre:'Prasugrel',
    alto:'Suspender 7 a 10 días antes', intermedio:'Suspender 7 a 10 días', bajo:'Suspender 7 días'},
  ticagrelor:{
    nombre:'Ticagrelor',
    alto:'Suspender 5 a 7 días antes', intermedio:'Suspender 5 días', bajo:'Suspender 5 días'},
  warfarina:{
    nombre:'Warfarina / acenocumarol',
    alto:'Suspender 5 días antes y confirmar RIN menor a 1,2 el día del procedimiento',
    intermedio:'Suspender 5 días, RIN menor a 1,5',
    bajo:'RIN menor a 3'},
  heparina_bpm:{
    nombre:'Heparina de bajo peso molecular (enoxaparina)',
    alto:'Dosis profiláctica: 12 h. Dosis terapéutica: 24 h',
    intermedio:'12 a 24 h según dosis', bajo:'12 h'},
  heparina_no_frac:{
    nombre:'Heparina no fraccionada subcutánea',
    alto:'Suspender 6 h antes y confirmar KPTT normal', intermedio:'6 h', bajo:'Sin suspensión'},
  rivaroxaban:{
    nombre:'Rivaroxabán',
    alto:'Suspender 3 días antes (más si hay insuficiencia renal)', intermedio:'2 días', bajo:'1 día'},
  apixaban:{
    nombre:'Apixabán',
    alto:'Suspender 3 días antes (más si hay insuficiencia renal)', intermedio:'2 días', bajo:'1 día'},
  dabigatran:{
    nombre:'Dabigatrán',
    alto:'Suspender 4 a 5 días antes; más tiempo si el filtrado es menor a 50 ml/min',
    intermedio:'3 días', bajo:'2 días'}
};

const NOTA_ANTICOAGULACION =
  'Estos plazos ORIENTAN. La suspensión se decide junto al médico que indicó el anticoagulante. ' +
  'En el paciente con stent coronario reciente, fibrilación auricular de alto riesgo embólico o ' +
  'válvula mecánica, el riesgo de suspender puede ser mayor que el de sangrar, y muchas veces la ' +
  'conducta correcta es no hacer el procedimiento en vez de suspender el anticoagulante. ' +
  'Los plazos se prolongan con la insuficiencia renal, sobre todo con dabigatrán.';
