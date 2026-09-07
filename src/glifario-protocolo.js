/* =========================================================================
   GLIFARIO — EL PROTOCOLO, EN LARGO
   -------------------------------------------------------------------------
   El titular del glifo dice el nombre de la figura y una linea. Esto es lo
   que hay detras: los siete ejes con los que se describe una sensacion, las
   diez figuras desarrolladas eje por eje, los tres perfiles de alerta y la
   escala cromatica.

   Se abre desde la ficha del paciente (y cae directo en SU figura) o desde
   la Biblioteca, como cualquier otro material de consulta.

   TRES COSAS QUE NO SON COPIA DEL DOCUMENTO ORIGINAL, Y POR QUE
   -------------------------------------------------------------------------
   1. LOS COLORES SE AJUSTARON A LOS CINCO QUE EL PACIENTE PUEDE ELEGIR.
      El texto original describia el Liquen como verde fosforescente y la
      Lluvia como blanco incandescente. El glifario ofrece cinco tonos y no
      hay verde ni blanco: el medico habria leido "verde" en la ficha de una
      paciente que dibujo rojo, porque no tenia otra opcion. Manda el
      instrumento, que es el que genera el dato. Las otras ocho figuras ya
      coincidian.

   2. "EL ANCLAJE PLOMIZO" NO EXISTE.
      El documento lo nombraba dos veces —en el perfil de inhibicion y en la
      fila del gris— pero no esta en el catalogo de diez ni en la aplicacion.
      Se reemplazo por las figuras que si existen y ocupan ese lugar.

   3. LOS PERFILES DE ALERTA NO DIAGNOSTICAN, MANDAN A TAMIZAR.
      El original saltaba del glifo al diagnostico: "correlato clinico,
      trastorno depresivo mayor comorbido". Son seis toques en un telefono;
      eso no alcanza para nombrar un diagnostico, y puesto en una historia
      clinica ancla al que la lee antes de la consulta. Aca cada perfil
      termina en una escala que la aplicacion ya tiene y que se abre de un
      toque. Sugerir que se mire es util; etiquetar es otra cosa.
   ========================================================================= */
'use strict';

/* Aviso al pie de todas las pantallas del protocolo. El documento de origen
   es un texto de trabajo, no literatura validada, y eso tiene que verse. */
const GLIFO_PROCEDENCIA =
  'Documento de trabajo del consultorio, redactado con asistencia de IA. No es ' +
  'un instrumento validado ni reemplaza la evaluación clínica. Sirve para ' +
  'ordenar y poner en palabras lo que el paciente describió, no para diagnosticar.';

/* ------------------------------------------------------- los siete ejes - */

const GLIFO_EJES = [
  {t:'Forma / morfología',
   d:'La geometría del malestar: nudos, agujas, mallas, bloques, oquedades.'},
  {t:'Movimiento / dinámica',
   d:'La cinética: pulsación, constricción, erosión, chispazos, latigazos.'},
  {t:'Tono / cromatismo / térmico',
   d:'El color y la temperatura subjetiva. Es el eje que más rápido contesta la gente.'},
  {t:'Intensidad analógica',
   d:'Cuánta atención ocupa: de un rumor de fondo a una interferencia masiva.'},
  {t:'Topografía / profundidad',
   d:'Dónde se inserta: óseo profundo, dérmico, visceral, periférico flotante.'},
  {t:'Temporalidad / ritmo',
   d:'Cómo se comporta en el tiempo: paroxístico, estático infinito, oleaje rítmico.'},
  {t:'Resonancia afectiva',
   d:'El eco que deja: fatiga existencial, hipervigilancia, pánico, desprotección.'}
];

/* --------------------------------------------- las diez figuras, en largo */
/* Las claves son las mismas que las de GLIFO_NUCLEOS: una figura, un id, en
   todo el programa. */

const GLIFO_PROTOCOLO = {
  liquen: {
    sub:'Erosión neurocutánea continua',
    forma:'Costra rugosa, porosa, como una hiedra microscópica adherida a la cara interna de la piel.',
    movimiento:'Crecimiento reptante: una micro-expansión milimétrica, constante.',
    tono:'Rojo encendido, pero ácido más que ardiente: una corrosión térmica sostenida.',
    intensidad:'Quemadura sorda pero insomne; un secuestro constante de la atención de fondo.',
    topografia:'Dérmica y subcutánea difusa, típicamente a lo largo de un dermatoma periférico.',
    temporalidad:'Infinito estático que se acentúa con el roce de la ropa.',
    resonancia:'Irritación existencial extrema, pérdida de la paciencia y del confort mínimo.'
  },
  pendulo: {
    sub:'Migraña o neuralgia alternante',
    forma:'Cuña pesada, simétrica, de bordes afilados como cristal volcánico.',
    movimiento:'Oscilación rítmica y pesada que golpea alternativamente de un lado al otro.',
    tono:'Gris plomo llevado al negro; un frío que apaga los estímulos visuales.',
    intensidad:'Un impacto de alta energía mecánica con cada oscilación.',
    topografia:'Intracraneal profunda, alternando entre regiones orbitarias y occipitales.',
    temporalidad:'Oleaje rítmico sincronizado con el pulso cardíaco.',
    resonancia:'Retraimiento absoluto, necesidad de aislamiento sensorial, desamparo.'
  },
  malla: {
    sub:'Dolor neuropático difuso',
    forma:'Cuadrícula o red de pesca metálica y tensa, con los nudos electrificados.',
    movimiento:'Centelleo estocástico: chispazos aleatorios que viajan por las líneas de la red.',
    tono:'Azul cobalto brillante y metálico; sensación de conductividad eléctrica.',
    intensidad:'Intermitencia de alto voltaje que provoca sobresaltos motores involuntarios.',
    topografia:'Extremidades inferiores completas, de distribución periférica flotante.',
    temporalidad:'Zarpazos impredecibles intercalados sobre un rumor de fondo tenso.',
    resonancia:'Hipervigilancia constante, agotamiento por anticipación al impacto.'
  },
  cemento: {
    sub:'Dolor esquelético profundo',
    forma:'Bloque cilíndrico, denso, macizo, compactado dentro de la cavidad medular.',
    movimiento:'Inercia absoluta, con presión expansiva hacia afuera desde el centro del hueso.',
    tono:'Gris plomo, opaco, desprovisto de temperatura y de luz.',
    intensidad:'Gravedad aplastante: el miembro parece pesar el triple de lo que pesa.',
    topografia:'Huesos largos (fémur, tibia) o cuerpos vertebrales axiales profundos.',
    temporalidad:'Continuo y sordo, incapaz de modificarse con los cambios de postura.',
    resonancia:'Desesperanza estructural; la sensación de que el esqueleto está colapsando.'
  },
  tornillo: {
    sub:'Dolor visceral y pélvico',
    forma:'Espiral helicoidal de metal oxidado que atraviesa y ensarta los órganos blandos.',
    movimiento:'Torsión lenta e implacable; un giro de tuerca cada vez que se activa el tránsito.',
    tono:'Ocre herrumbroso, caliente, sofocante y húmedo.',
    intensidad:'Constricción visceral que corta temporalmente la respiración.',
    topografia:'Región mesogástrica e hipogástrica profunda, no localizable en la superficie.',
    temporalidad:'Cólico intermitente con picos que descienden a una molestia pesada.',
    resonancia:'Angustia aguda; sensación de vulnerabilidad orgánica interna.'
  },
  lluvia: {
    sub:'Fibromialgia y alodinia generalizada',
    forma:'Millones de vectores lineales microscópicos, aguzados y densamente agrupados.',
    movimiento:'Precipitación vertical continua que impacta en toda la superficie a la vez.',
    tono:'Rojo encendido llevado al blanco; calor urente en la superficie de la piel.',
    intensidad:'Hipersensibilidad táctil insoportable al menor contacto del aire o las sábanas.',
    topografia:'Distribución generalizada y simétrica (espalda, muslos, brazos), cutánea.',
    temporalidad:'Oleaje continuo que fluctúa según el estrés emocional o el clima.',
    resonancia:'Desprotección absoluta: el entorno se percibe como una amenaza física.'
  },
  garra: {
    sub:'Dolor vascular periférico',
    forma:'Mano rígida, de uñas romas, que abraza con fuerza un gran vaso sanguíneo.',
    movimiento:'Contracción tónica sostenida: aprieta sin soltar, reduciendo el espacio interno.',
    tono:'Violeta cianótico, frío marmóreo y asfixiante, falto de oxígeno.',
    intensidad:'Dolor sordo que se vuelve desgarro punzante al intentar la marcha.',
    topografia:'Pantorrillas, tobillos y porción distal de las extremidades inferiores.',
    temporalidad:'Desencadenamiento funcional (claudicación), o continuo nocturno en reposo.',
    resonancia:'Frustración de la movilidad, pérdida de autonomía, impotencia motora.'
  },
  vacio: {
    sub:'Dolor por deaferentación y miembro fantasma',
    forma:'Oquedad esférica invertida: un agujero donde debería haber tejido.',
    movimiento:'Implosión o succión centrípeta que intenta colapsar los bordes sanos.',
    tono:'Gris humo, distorsionado; una ausencia térmica desconcertante.',
    intensidad:'La paradoja: duele intensamente un espacio que está ausente o anestesiado.',
    topografia:'Segmento distal amputado o región con anestesia completa.',
    temporalidad:'Presencia permanente distorsionada, con descargas fulgurantes impredecibles.',
    resonancia:'Desorientación corporal, extrañeza severa del esquema propio.'
  },
  placa: {
    sub:'Dolor mecánico refractario',
    forma:'Losa rígida, sin elasticidad, encajada a la fuerza entre dos superficies articuladas.',
    movimiento:'Inmovilidad calcificada; fricción cortante y crujido seco ante cualquier flexión.',
    tono:'Ocre mineral, ámbar opaco; calor seco por fricción.',
    intensidad:'Bloqueo funcional absoluto: un tope anatómico insalvable y doloroso.',
    topografia:'Columna lumbar baja o cervical media; articulaciones facetarias.',
    temporalidad:'Rigidez matutina masiva que da paso a crisis agudas con movimientos mínimos.',
    resonancia:'Sensación de envejecimiento prematuro y de rigidez vital forzada.'
  },
  latigazo: {
    sub:'Neuralgia del trigémino y paroxismos',
    forma:'Filamento único, ultradelgado, como un hilo de vidrio templado o fibra óptica.',
    movimiento:'Proyección lineal instantánea: una descarga que corta el espacio como un rayo.',
    tono:'Rojo incandescente; un calor abrasador localizado, de microsegundos.',
    intensidad:'El máximo de la escala: un cortocircuito que paraliza el habla y la respiración.',
    topografia:'Trayecto de las ramas maxilar o mandibular del trigémino.',
    temporalidad:'Paroxismos de segundos, seguidos de un período refractario tenso.',
    resonancia:'Pánico al próximo ataque; pavor condicionado al habla y a la masticación.'
  }
};

/* ------------------------------------------------- los perfiles de alerta */
/* Cada uno termina en una escala que la aplicacion ya tiene y que se abre
   desde aca. Ver el encabezado del archivo: sugieren mirar, no etiquetan. */

const GLIFO_PERFILES = [
  {
    id:'inhibicion',
    titulo:'Inhibición y desgaste',
    resumen:'Dinámica inerte, todo hacia abajo.',
    figuras:['cemento','vacio','placa'],
    indicadores:'Elige figuras pesadas, sin movimiento, o que directamente colapsan. ' +
      'Tonos grises y densos. Lo que deja no es miedo sino cansancio de fondo.',
    queMirar:'Cuánto hace que está así, si abandonó cosas que le importaban, cómo duerme, ' +
      'y si aparece algo parecido a "para qué". El desgaste largo se parece poco a la ' +
      'tristeza y mucho al apagón.',
    escalas:['phq9'],
    color:'gris'
  },
  {
    id:'hiper',
    titulo:'Hiperactivación y catastrofización',
    resumen:'Dinámica caótica, descargas, expansión.',
    figuras:['malla','lluvia','latigazo','liquen'],
    indicadores:'Elige vectores finos, centelleos, descargas. Tonos estridentes. ' +
      'Lo que deja es pánico y guardia alta permanente.',
    queMirar:'Si vive esperando el próximo golpe, si magnifica y rumia, si el roce de la ' +
      'ropa o el clima le cambian el día. Es el perfil donde la sensibilización central ' +
      'suele estar haciendo la mayor parte del trabajo.',
    escalas:['pcs','gad7','csi'],
    color:'rojo'
  },
  {
    id:'rigidez',
    titulo:'Rigidez y fijación somática',
    resumen:'Forma geométrica que no se deja modificar.',
    figuras:['placa','tornillo','pendulo'],
    indicadores:'Estructuras macizas, losas, topografías fijas que no cambian con ninguna ' +
      'maniobra ni postura. Tonos minerales u oxidados.',
    queMirar:'Qué tan cerrada está la explicación que trae, cuánta vida quedó organizada ' +
      'alrededor del síntoma, y si hay lugar para trabajar sobre lo que valora en vez de ' +
      'sobre el dolor. Es el perfil que mejor responde a un abordaje de aceptación.',
    escalas:['pseq','pcs'],
    color:'ocre'
  }
];

/* ------------------------------------------------------ escala cromática */
/* Cinco filas, no cuatro: el ocre existe en el glifario y necesitaba la suya. */

const GLIFO_CROMATICA = [
  {tono:'rojo',
   sospecha:'Dolor nociceptivo activo, crisis inflamatoria periférica o daño tisular.',
   figuras:['latigazo','lluvia','liquen'],
   foco:'Farmacoterapia antiinflamatoria, bloqueos locales, modulación periférica.'},
  {tono:'azul',
   sospecha:'Dolor neuropático, descargas paroxísticas, error de filtrado talámico.',
   figuras:['malla'],
   foco:'Neuromoduladores (gabapentinoides, ligandos α2δ), estabilizadores de membrana.'},
  {tono:'gris',
   sospecha:'Sensibilización central, claudicación de las vías inhibitorias descendentes.',
   figuras:['cemento','pendulo','vacio'],
   foco:'Neuromodulación central (duales), terapia de reprocesamiento somatosensorial.'},
  {tono:'violeta',
   sospecha:'Compromiso autonómico, isquemia focal o dolor visceral profundo.',
   figuras:['garra'],
   foco:'Vasodilatadores, bloqueos simpáticos, optimización del flujo y la motilidad.'},
  {tono:'ocre',
   sospecha:'Bloqueo mecánico o visceral: rigidez articular, torsión, tránsito.',
   figuras:['placa','tornillo'],
   foco:'Fisiokinesia, higiene postural, trabajo sobre el miedo al movimiento; en lo ' +
     'visceral, revisar ritmo digestivo y relación con las comidas.'}
];

/* --------------------------------------------------------------- ventana */

function nombresDeFiguras(ids) {
  return ids.map(i => GLIFO_NUCLEOS[i] ? GLIFO_NUCLEOS[i].nombre : i).join(' · ');
}

/* Un glifo chico para las listas del protocolo, con el tono que le
   corresponde a esa figura en la escala cromatica. */
function glifoMiniatura(id, tam) {
  const fila = GLIFO_CROMATICA.find(f => f.figuras.includes(id));
  const tono = GLIFO_TONOS[fila ? fila.tono : 'gris'];
  return '<div class="glifo-lamina chica"><svg viewBox="0 0 24 24" width="' + (tam || 30) +
         '" height="' + (tam || 30) + '" style="display:block">' +
         GLIFO_NUCLEOS[id].icono(tono.hex) + '</svg></div>';
}

/* La ventana. Si se la llama con una figura, esa queda desplegada y el resto
   plegado: se entra por el paciente que se esta mirando, no por el indice. */
function ventanaProtocoloGlifario(nucleoAbierto) {
  abrir({
    id:'protocolo_glifario',
    titulo:'Glifario — protocolo',
    sub:'Los siete ejes, las diez figuras y los perfiles de alerta',
    ancha:true,
    dibujar(c) {
      c.insertAdjacentHTML('beforeend',
        '<p>Este es el material largo detrás del glifo que completa el paciente. ' +
        'Sirve para poner en palabras lo que eligió y para saber qué preguntar en la ' +
        'consulta a partir de ahí.</p>' +
        '<div class="alerta info" style="margin-top:12px"><b>Qué es y qué no es</b><p>' +
        esc(GLIFO_PROCEDENCIA) + '</p></div>');

      /* ---- 1. los ejes ------------------------------------------------ */
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:15px;margin:24px 0 4px">1 · Con qué se describe una sensación</h3>' +
        '<p class="nota" style="margin-bottom:10px">Siete ejes. El paciente contesta seis de ' +
        'ellos en el portal, en lenguaje llano; el séptimo —la resonancia afectiva— no se le ' +
        'pregunta: se lee.</p>' +
        '<div class="bloque">' +
        GLIFO_EJES.map((e, i) => dato((i + 1) + '. ' + e.t, esc(e.d))).join('') +
        '</div>');

      /* ---- 2. el catalogo --------------------------------------------- */
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:15px;margin:26px 0 4px">2 · Las diez figuras</h3>' +
        '<p class="nota" style="margin-bottom:10px">Cada una desplegada por los siete ejes. ' +
        'Tocá el título para abrirla.</p>' +
        '<div class="alerta info" style="margin-bottom:12px"><b>La zona es la del cuadro típico, ' +
        'no la del paciente</b><p>Donde dice «dónde suele describirse» habla del cuadro de manual. ' +
        'La localización de una persona concreta sale del mapa corporal que marcó ella, y de ' +
        'ningún otro lado: una Garra Isquémica marcada en el hipogastrio es una Garra Isquémica ' +
        'en el hipogastrio.</p></div>');

      for (const id of Object.keys(GLIFO_NUCLEOS)) {
        const n = GLIFO_NUCLEOS[id];
        const p = GLIFO_PROTOCOLO[id];
        if (!p) continue;
        const abierta = id === nucleoAbierto;
        const d = document.createElement('details');
        d.className = 'plegable';
        if (abierta) d.open = true;
        d.innerHTML =
          '<summary>' + glifoMiniatura(id, 26) +
          '<span class="plegable-t"><b style="color:var(--tinta);font-size:13.5px">' +
          esc(n.nombre) + '</b> — ' + esc(p.sub) + '</span>' +
          '<span class="plegable-v">' + esc(n.codigo) + '</span></summary>' +
          '<div class="plegable-c">' +
            dato('Forma', esc(p.forma)) +
            dato('Movimiento', esc(p.movimiento)) +
            dato('Tono y temperatura', esc(p.tono)) +
            dato('Intensidad', esc(p.intensidad)) +
            dato('Dónde suele describirse', esc(p.topografia)) +
            dato('Temporalidad', esc(p.temporalidad)) +
            dato('Resonancia afectiva', esc(p.resonancia)) +
            dato('Hacia dónde mirar', '<i>' + esc(n.foco) + '</i>') +
          '</div>';
        c.appendChild(d);
      }

      /* ---- 3. los perfiles -------------------------------------------- */
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:15px;margin:26px 0 4px">3 · Tres perfiles que conviene tamizar</h3>' +
        '<p class="nota" style="margin-bottom:12px">Cuando la figura elegida cae en uno de ' +
        'estos grupos, vale la pena pasar una escala. <b>No son diagnósticos</b>: son motivos ' +
        'para preguntar mejor. El puntaje lo pone el instrumento, no el dibujo.</p>');

      for (const perfil of GLIFO_PERFILES) {
        const caja = document.createElement('div');
        caja.className = 'bloque';
        caja.innerHTML = '<h3>' + esc(perfil.titulo) +
          ' <span class="nota">— ' + esc(perfil.resumen) + '</span></h3>' +
          dato('Figuras', nombresDeFiguras(perfil.figuras)) +
          dato('Cómo se reconoce', esc(perfil.indicadores)) +
          dato('Qué preguntar', esc(perfil.queMirar));
        c.appendChild(caja);

        const fila = document.createElement('div');
        fila.className = 'fila';
        fila.style.margin = '-4px 0 18px';
        for (const idEsc of perfil.escalas) {
          const e = ESCALAS[idEsc];
          if (!e) continue;
          fila.appendChild(superficie(e.sigla, e.nombre,
            () => ventanaFichaEscala(idEsc), 'fina'));
        }
        c.appendChild(fila);
      }

      /* ---- 4. la escala cromatica ------------------------------------- */
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:15px;margin:26px 0 4px">4 · Qué sugiere cada color</h3>' +
        '<p class="nota" style="margin-bottom:10px">El color es el eje que la gente contesta ' +
        'más rápido y el que menos se piensa. Por eso vale.</p>');

      for (const f of GLIFO_CROMATICA) {
        const t = GLIFO_TONOS[f.tono];
        c.insertAdjacentHTML('beforeend',
          '<div class="bloque"><h3><span class="glifo-punto" style="width:15px;height:15px;' +
          'display:inline-block;vertical-align:-2px;margin-right:7px;background:' + t.hex +
          '"></span>' + esc(t.t) + '</h3>' +
          dato('Sospecha', esc(f.sospecha)) +
          dato('Figuras', nombresDeFiguras(f.figuras)) +
          dato('Foco terapéutico', '<i>' + esc(f.foco) + '</i>') + '</div>');
      }

      c.insertAdjacentHTML('beforeend',
        '<div class="alerta info" style="margin-top:20px"><b>En la sala de espera</b>' +
        '<p>Además del portal, tener lápices o marcadores de estos cinco tonos junto a la ' +
        'ficha de papel. Que la persona pueda colorear los límites de su dolor baja mucho ' +
        'la barrera de la primera consulta, sobre todo con quien no llega con palabras.</p></div>');

      c.insertAdjacentHTML('beforeend',
        '<p class="nota" style="margin-top:18px">' + esc(GLIFO_PROCEDENCIA) + '</p>');
    }
  });
}

/* -------------------------------------------------------------------------
   El bloque que ve la medica en la ficha de un paciente: el titular, el
   detalle plegado y la puerta al protocolo, que cae directo en la figura de
   ESE paciente y no en el indice.

   Es una funcion que escribe sobre un nodo y no una que devuelve texto,
   porque la puerta necesita un onclick y en esta aplicacion los onclick se
   enganchan a mano, nunca como atributo dentro del HTML.
   ------------------------------------------------------------------------- */
function glifoBloqueMedico(nodo, g, mapa) {
  if (!glifoCompleto(g) || !GLIFO_NUCLEOS[g.nucleo]) return;
  nodo.insertAdjacentHTML('beforeend', glifoResumenHTML(g, mapa));
  nodo.appendChild(superficie('Leer el protocolo del glifario',
    'Los siete ejes, ' + GLIFO_NUCLEOS[g.nucleo].nombre + ' en largo y qué conviene tamizar',
    () => ventanaProtocoloGlifario(g.nucleo), 'fina'));
}
