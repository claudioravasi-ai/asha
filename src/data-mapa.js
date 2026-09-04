/* =========================================================================
   MAPA CORPORAL DEL DOLOR  —  el "mapa dermatomal de Bonica" de la norma
   -------------------------------------------------------------------------
   Las Normas de Dolor argentinas (FAAAAR / anestesia.org.ar) exigen que la
   historia clinica de dolor incluya un mapa dermatomal. Este modulo lo
   provee y ademas lo vuelve util: cada punto que el paciente marca sobre la
   silueta cae en una ZONA, y cada zona sabe

     - a que region del indice de dolor generalizado (WPI) pertenece,
       con lo cual los criterios ACR 2016 de fibromialgia se calculan solos;
     - que raices nerviosas la inervan, con lo cual se puede evaluar si la
       distribucion del dolor es neuroanatomicamente plausible, que es el
       primer escalon del sistema de gradacion NeuPSIG de dolor neuropatico.

   El paciente marca con el dedo o el mouse y le pone intensidad 0-10 a cada
   punto. El color va del verde al rojo como un semaforo, asi el medico ve la
   topografia y la severidad de un vistazo, sin leer un solo numero.

   COORDENADAS: las siluetas usan un lienzo de 200 x 520 unidades. Los puntos
   se guardan en esas unidades, no en pixeles, para que el dibujo sea el
   mismo en un telefono y en el monitor del consultorio.
   ========================================================================= */
'use strict';

/* -------------------------------------------------------------------------
   SEMAFORO DE INTENSIDAD
   Cinco tramos, del verde al rojo. Se eligieron tramos de a dos puntos
   porque la escala numerica no discrimina mas fino que eso: la diferencia
   entre un 6 y un 7 no es reproducible, la que hay entre un 4 y un 8 si.
   ------------------------------------------------------------------------- */
const COLOR_DOLOR = [
  {hasta:2,  color:'#2f9e5f', borde:'#1e6b3f', nombre:'Leve'},
  {hasta:4,  color:'#8cc63f', borde:'#5f8c25', nombre:'Leve a moderado'},
  {hasta:6,  color:'#f2b705', borde:'#a87f00', nombre:'Moderado'},
  {hasta:8,  color:'#f2711c', borde:'#a84a0b', nombre:'Intenso'},
  {hasta:10, color:'#d92b2b', borde:'#8f1616', nombre:'Muy intenso'}
];

function colorDolor(intensidad) {
  const i = Math.max(0, Math.min(10, Number(intensidad) || 0));
  for (const tramo of COLOR_DOLOR) if (i <= tramo.hasta) return tramo;
  return COLOR_DOLOR[COLOR_DOLOR.length - 1];
}

/* -------------------------------------------------------------------------
   SILUETAS
   Dibujadas como partes separadas y no como un contorno unico, para que el
   trazo se pueda ajustar sin rehacer todo y para poder teñir una parte
   entera cuando el dolor es regional. Vista posterior: la silueta es
   simetrica, lo que cambia es a que lado del cuerpo corresponde cada mitad
   (de frente, la izquierda de la pantalla es la derecha del paciente; de
   espaldas, es su izquierda). De eso se ocupa el mapa de zonas.
   ------------------------------------------------------------------------- */
const SILUETA = {
  /* PROPORCIONES
     El lienzo es de 200 x 520 y la figura mide unas 510 unidades de la
     coronilla al talon. Sobre esa altura: hombros de 84 unidades de ancho,
     cintura de 64, brazos que caen casi verticales pegados al tronco y
     piernas que se afinan del muslo al tobillo. Los brazos no se abren en
     ala: un brazo abierto se lee como un espantapajaros y ademas aleja la
     mano de la zona donde el paciente espera tocarla.

     Las cajas de ZONAS_CUERPO estan calibradas contra ESTAS coordenadas.
     Si se cambia la silueta hay que revisarlas: si no, el paciente marca el
     antebrazo y la aplicacion lo anota en el torax. */
  centro:[
    /* cabeza: 38 de ancho por 54 de alto, con el menton mas angosto */
    'M100,10 C111,10 119,19 119,32 C119,42 116,51 111,58 ' +
    'C108,62 104,65 100,65 C96,65 92,62 89,58 ' +
    'C84,51 81,42 81,32 C81,19 89,10 100,10 Z',
    /* cuello, corto y metido bajo el menton */
    'M93,57 L107,57 L107,74 C107,79 104,82 100,82 C96,82 93,79 93,74 Z',
    /* tronco: el hombro BAJA desde el cuello hacia el deltoides. Un hombro
       horizontal es lo que hace que la figura parezca un cajon. */
    'M100,75 C111,75 121,78 129,84 C137,90 142,99 144,111 ' +
    'L142,148 C141,165 136,179 133,193 L131,217 ' +
    'C131,235 130,249 129,261 L105,261 L100,271 L95,261 L71,261 ' +
    'C70,249 69,235 69,217 L67,193 C64,179 59,165 58,148 ' +
    'L56,111 C58,99 63,90 71,84 C79,78 89,75 100,75 Z'
  ],

  /* Rasgo que aparece SOLO en la vista frontal. Una silueta simetrica de
     frente y de espaldas es identica, y el paciente termina marcando la
     espalda en el dibujo de adelante. Una nariz resuelve eso de un vistazo,
     sin necesidad de leer el rotulo. */
  frente:[
    /* Nariz: triangulo en el CENTRO de la cara, con el vertice hacia arriba.
       Es lo unico que distingue la vista de adelante de la de atras en una
       silueta simetrica, y centrado se lee como cara y no como una oreja. */
    'M100,29 L107,47 L93,47 Z'
  ],

  /* Piezas laterales. Se dibujan dos veces: tal cual, y espejadas sobre la
     linea media con una transformacion. Asi los dos lados son identicos por
     construccion y no por haber copiado bien las coordenadas a mano. */
  lado:[
    /* brazo: arranca POR DENTRO del deltoides para que no quede un escalon
       entre el brazo y el hombro, y cae casi vertical */
    'M70,88 C58,94 50,104 47,117 L43,153 C42,161 39,199 37,234 ' +
    'C36,243 40,250 47,250 C53,250 56,245 57,237 ' +
    'L59,200 L63,153 L67,117 L74,96 Z',
    /* mano: angosta y alargada, no un guante de boxeo */
    'M38,241 C31,247 29,261 31,275 C33,285 42,288 48,282 ' +
    'C53,276 54,257 51,241 Z',
    /* pierna: muslo, rodilla marcada, panza de la pantorrilla y tobillo fino */
    'M68,261 C65,281 65,301 67,321 L71,353 ' +
    'C72,373 70,397 70,419 C70,445 72,471 73,494 ' +
    'C73,500 76,503 79,503 C82,503 85,500 85,494 ' +
    'C86,471 87,445 87,419 C88,397 89,373 90,353 ' +
    'L95,321 C97,301 97,281 97,261 Z',
    /* pie visto desde arriba */
    'M73,497 C65,499 57,505 56,512 C55,517 59,519 67,519 L85,519 ' +
    'C89,519 90,513 89,506 L88,497 Z'
  ]
};

/* -------------------------------------------------------------------------
   ZONAS
   Cada zona es un rectangulo sobre el lienzo. El orden IMPORTA: se recorre
   de arriba hacia abajo y gana la primera que contiene al punto, asi que las
   zonas chicas y especificas (el sacro, la rodilla) van ANTES que las
   grandes que las envuelven (el gluteo, el muslo).

     v      'f' vista frontal, 'd' vista dorsal
     wpi    region del indice de dolor generalizado (ACR 2016), o null si
            la zona no cuenta para ese indice (la cara, la mano, el pie)
     raices raices nerviosas que dan sensibilidad a la zona
     nervio nervio periferico de interes para bloqueos, cuando aplica
   ------------------------------------------------------------------------- */
const ZONAS_CUERPO = [

  /* ---------- VISTA FRONTAL --------------------------------------------
     De frente, la mitad izquierda de la pantalla es el lado DERECHO del
     paciente. Es la convencion de todas las historias clinicas.           */

  {id:'f_cara',        v:'f', nombre:'Cara',                    lado:'',   wpi:null,
   raices:['V1','V2','V3'], nervio:'Trigémino', box:[77,6,46,52]},
  {id:'f_cuello',      v:'f', nombre:'Cuello (cara anterior)',  lado:'',   wpi:'cuello',
   raices:['C2','C3','C4'], box:[86,54,28,24]},

  {id:'f_hombro_der',  v:'f', nombre:'Hombro',                  lado:'derecho', wpi:'hombro_der',
   raices:['C4','C5'], nervio:'Supraescapular / axilar', box:[52,68,30,30]},
  {id:'f_hombro_izq',  v:'f', nombre:'Hombro',                  lado:'izquierdo', wpi:'hombro_izq',
   raices:['C4','C5'], nervio:'Supraescapular / axilar', box:[118,68,30,30]},

  {id:'f_brazo_der',   v:'f', nombre:'Brazo',                   lado:'derecho', wpi:'brazo_der',
   raices:['C5','C6'], box:[36,98,32,64]},
  {id:'f_brazo_izq',   v:'f', nombre:'Brazo',                   lado:'izquierdo', wpi:'brazo_izq',
   raices:['C5','C6'], box:[132,98,32,64]},
  {id:'f_antebrazo_der',v:'f',nombre:'Antebrazo',               lado:'derecho', wpi:'antebrazo_der',
   raices:['C6','C7','C8'], box:[30,162,32,88]},
  {id:'f_antebrazo_izq',v:'f',nombre:'Antebrazo',               lado:'izquierdo', wpi:'antebrazo_izq',
   raices:['C6','C7','C8'], box:[138,162,32,88]},
  {id:'f_mano_der',    v:'f', nombre:'Mano',                    lado:'derecha', wpi:'antebrazo_der',
   raices:['C6','C7','C8'], nervio:'Mediano / cubital / radial', box:[20,250,32,42]},
  {id:'f_mano_izq',    v:'f', nombre:'Mano',                    lado:'izquierda', wpi:'antebrazo_izq',
   raices:['C6','C7','C8'], nervio:'Mediano / cubital / radial', box:[148,250,32,42]},

  {id:'f_torax_der',   v:'f', nombre:'Tórax',                   lado:'derecho', wpi:'torax',
   raices:['T1','T2','T3','T4','T5','T6'], box:[66,74,34,62]},
  {id:'f_torax_izq',   v:'f', nombre:'Tórax',                   lado:'izquierdo', wpi:'torax',
   raices:['T1','T2','T3','T4','T5','T6'], box:[100,74,34,62]},
  {id:'f_epigastrio',  v:'f', nombre:'Epigastrio',              lado:'',   wpi:'abdomen',
   raices:['T6','T7','T8'], box:[80,136,40,26]},
  {id:'f_abdomen_der', v:'f', nombre:'Abdomen',                 lado:'derecho', wpi:'abdomen',
   raices:['T8','T9','T10','T11','T12'], box:[66,162,34,42]},
  {id:'f_abdomen_izq', v:'f', nombre:'Abdomen',                 lado:'izquierdo', wpi:'abdomen',
   raices:['T8','T9','T10','T11','T12'], box:[100,162,34,42]},
  {id:'f_inguinal_der',v:'f', nombre:'Región inguinal',         lado:'derecha', wpi:'cadera_der',
   raices:['L1'], nervio:'Ilioinguinal / iliohipogástrico', box:[70,204,30,32]},
  {id:'f_inguinal_izq',v:'f', nombre:'Región inguinal',         lado:'izquierda', wpi:'cadera_izq',
   raices:['L1'], nervio:'Ilioinguinal / iliohipogástrico', box:[100,204,30,32]},
  {id:'f_genital',     v:'f', nombre:'Región genital / perineal',lado:'',  wpi:null,
   raices:['S2','S3','S4'], nervio:'Pudendo', box:[88,232,24,26]},

  {id:'f_muslo_der',   v:'f', nombre:'Muslo (cara anterior)',   lado:'derecho', wpi:'muslo_der',
   raices:['L2','L3','L4'], nervio:'Femoral / femorocutáneo lateral', box:[66,256,34,88]},
  {id:'f_muslo_izq',   v:'f', nombre:'Muslo (cara anterior)',   lado:'izquierdo', wpi:'muslo_izq',
   raices:['L2','L3','L4'], nervio:'Femoral / femorocutáneo lateral', box:[100,256,34,88]},
  {id:'f_rodilla_der', v:'f', nombre:'Rodilla',                 lado:'derecha', wpi:'muslo_der',
   raices:['L3','L4'], nervio:'Geniculares', box:[66,344,34,38]},
  {id:'f_rodilla_izq', v:'f', nombre:'Rodilla',                 lado:'izquierda', wpi:'muslo_izq',
   raices:['L3','L4'], nervio:'Geniculares', box:[100,344,34,38]},
  {id:'f_pierna_der',  v:'f', nombre:'Pierna (cara anterior)',  lado:'derecha', wpi:'pierna_der',
   raices:['L4','L5'], nervio:'Peroneo / safeno', box:[66,382,34,88]},
  {id:'f_pierna_izq',  v:'f', nombre:'Pierna (cara anterior)',  lado:'izquierda', wpi:'pierna_izq',
   raices:['L4','L5'], nervio:'Peroneo / safeno', box:[100,382,34,88]},
  {id:'f_pie_der',     v:'f', nombre:'Pie (dorso)',             lado:'derecho', wpi:'pierna_der',
   raices:['L4','L5','S1'], nervio:'Peroneo superficial / profundo', box:[52,470,48,50]},
  {id:'f_pie_izq',     v:'f', nombre:'Pie (dorso)',             lado:'izquierdo', wpi:'pierna_izq',
   raices:['L4','L5','S1'], nervio:'Peroneo superficial / profundo', box:[100,470,48,50]},

  /* ---------- VISTA POSTERIOR ------------------------------------------
     De espaldas se invierte: la mitad izquierda de la pantalla es el lado
     IZQUIERDO del paciente.                                               */

  {id:'d_occipucio',   v:'d', nombre:'Occipucio',               lado:'',   wpi:null,
   raices:['C2','C3'], nervio:'Occipital mayor (Arnold) / menor', box:[77,6,46,52]},
  {id:'d_cervical',    v:'d', nombre:'Columna cervical / nuca', lado:'',   wpi:'cuello',
   raices:['C2','C3','C4','C5'], nervio:'Ramos mediales cervicales', box:[86,54,28,26]},

  {id:'d_hombro_izq',  v:'d', nombre:'Cintura escapular',       lado:'izquierda', wpi:'hombro_izq',
   raices:['C4','C5'], box:[52,68,30,30]},
  {id:'d_hombro_der',  v:'d', nombre:'Cintura escapular',       lado:'derecha', wpi:'hombro_der',
   raices:['C4','C5'], box:[118,68,30,30]},

  {id:'d_brazo_izq',   v:'d', nombre:'Brazo',                   lado:'izquierdo', wpi:'brazo_izq',
   raices:['C5','C6'], box:[36,98,32,64]},
  {id:'d_brazo_der',   v:'d', nombre:'Brazo',                   lado:'derecho', wpi:'brazo_der',
   raices:['C5','C6'], box:[132,98,32,64]},
  {id:'d_antebrazo_izq',v:'d',nombre:'Antebrazo',               lado:'izquierdo', wpi:'antebrazo_izq',
   raices:['C6','C7','C8'], box:[30,162,32,88]},
  {id:'d_antebrazo_der',v:'d',nombre:'Antebrazo',               lado:'derecho', wpi:'antebrazo_der',
   raices:['C6','C7','C8'], box:[138,162,32,88]},
  {id:'d_mano_izq',    v:'d', nombre:'Mano',                    lado:'izquierda', wpi:'antebrazo_izq',
   raices:['C6','C7','C8'], box:[20,250,32,42]},
  {id:'d_mano_der',    v:'d', nombre:'Mano',                    lado:'derecha', wpi:'antebrazo_der',
   raices:['C6','C7','C8'], box:[148,250,32,42]},

  {id:'d_escapula_izq',v:'d', nombre:'Región interescapular',   lado:'izquierda', wpi:'espalda_alta',
   raices:['T1','T2','T3','T4','T5'], nervio:'Ramos mediales torácicos', box:[66,74,34,62]},
  {id:'d_escapula_der',v:'d', nombre:'Región interescapular',   lado:'derecha', wpi:'espalda_alta',
   raices:['T1','T2','T3','T4','T5'], nervio:'Ramos mediales torácicos', box:[100,74,34,62]},
  {id:'d_dorsal',      v:'d', nombre:'Columna dorsal',          lado:'',   wpi:'espalda_alta',
   raices:['T6','T7','T8','T9'], box:[84,136,32,30]},
  {id:'d_flanco_izq',  v:'d', nombre:'Flanco / celda renal',    lado:'izquierdo', wpi:'espalda_baja',
   raices:['T10','T11','T12'], box:[66,166,34,32]},
  {id:'d_flanco_der',  v:'d', nombre:'Flanco / celda renal',    lado:'derecho', wpi:'espalda_baja',
   raices:['T10','T11','T12'], box:[100,166,34,32]},
  {id:'d_lumbar',      v:'d', nombre:'Columna lumbar',          lado:'',   wpi:'espalda_baja',
   raices:['L1','L2','L3','L4','L5'], nervio:'Ramos mediales lumbares (facetas)', box:[84,198,32,32]},
  {id:'d_lumbar_izq',  v:'d', nombre:'Región lumbar paravertebral', lado:'izquierda', wpi:'espalda_baja',
   raices:['L1','L2','L3'], box:[66,198,18,32]},
  {id:'d_lumbar_der',  v:'d', nombre:'Región lumbar paravertebral', lado:'derecha', wpi:'espalda_baja',
   raices:['L1','L2','L3'], box:[116,198,18,32]},
  {id:'d_sacro',       v:'d', nombre:'Sacro / cóccix',          lado:'',   wpi:'espalda_baja',
   raices:['S1','S2','S3','S4','S5'], nervio:'Ramos laterales sacros / ganglio impar', box:[88,230,24,34]},
  {id:'d_sacroiliaca_izq',v:'d',nombre:'Articulación sacroilíaca', lado:'izquierda', wpi:'cadera_izq',
   raices:['L5','S1','S2'], box:[74,228,14,26]},
  {id:'d_sacroiliaca_der',v:'d',nombre:'Articulación sacroilíaca', lado:'derecha', wpi:'cadera_der',
   raices:['L5','S1','S2'], box:[112,228,14,26]},
  {id:'d_gluteo_izq',  v:'d', nombre:'Glúteo',                  lado:'izquierdo', wpi:'cadera_izq',
   raices:['L5','S1','S2'], nervio:'Ciático / cluneales', box:[66,230,34,32]},
  {id:'d_gluteo_der',  v:'d', nombre:'Glúteo',                  lado:'derecho', wpi:'cadera_der',
   raices:['L5','S1','S2'], nervio:'Ciático / cluneales', box:[100,230,34,32]},

  {id:'d_muslo_izq',   v:'d', nombre:'Muslo (cara posterior)',  lado:'izquierdo', wpi:'muslo_izq',
   raices:['S1','S2'], nervio:'Ciático / cutáneo femoral posterior', box:[66,262,34,82]},
  {id:'d_muslo_der',   v:'d', nombre:'Muslo (cara posterior)',  lado:'derecho', wpi:'muslo_der',
   raices:['S1','S2'], nervio:'Ciático / cutáneo femoral posterior', box:[100,262,34,82]},
  {id:'d_poplitea_izq',v:'d', nombre:'Hueco poplíteo',          lado:'izquierdo', wpi:'muslo_izq',
   raices:['S1','S2'], box:[66,344,34,38]},
  {id:'d_poplitea_der',v:'d', nombre:'Hueco poplíteo',          lado:'derecho', wpi:'muslo_der',
   raices:['S1','S2'], box:[100,344,34,38]},
  {id:'d_pantorrilla_izq',v:'d',nombre:'Pantorrilla',           lado:'izquierda', wpi:'pierna_izq',
   raices:['S1','S2'], nervio:'Tibial / sural', box:[66,382,34,88]},
  {id:'d_pantorrilla_der',v:'d',nombre:'Pantorrilla',           lado:'derecha', wpi:'pierna_der',
   raices:['S1','S2'], nervio:'Tibial / sural', box:[100,382,34,88]},
  {id:'d_pie_izq',     v:'d', nombre:'Pie (planta y talón)',    lado:'izquierdo', wpi:'pierna_izq',
   raices:['S1','S2'], nervio:'Tibial posterior / plantar', box:[52,470,48,50]},
  {id:'d_pie_der',     v:'d', nombre:'Pie (planta y talón)',    lado:'derecho', wpi:'pierna_der',
   raices:['S1','S2'], nervio:'Tibial posterior / plantar', box:[100,470,48,50]}
];

/* -------------------------------------------------------------------------
   A que zona pertenece un punto. Si cae fuera de todas (el borde de la
   silueta, el hueco entre el brazo y el torso), se toma la zona de la misma
   vista cuyo centro este mas cerca: es preferible asignarlo a la region
   vecina que descartar una marca que el paciente hizo a proposito.
   ------------------------------------------------------------------------- */
function zonaDe(x, y, vista) {
  const v = vista === 'd' ? 'd' : 'f';
  for (const z of ZONAS_CUERPO) {
    if (z.v !== v) continue;
    const [bx, by, bw, bh] = z.box;
    if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) return z;
  }
  let mejor = null, mejorD = Infinity;
  for (const z of ZONAS_CUERPO) {
    if (z.v !== v) continue;
    const [bx, by, bw, bh] = z.box;
    const cx = bx + bw / 2, cy = by + bh / 2;
    const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    if (d < mejorD) { mejorD = d; mejor = z; }
  }
  return mejor;
}

/* Nombre legible de una zona, con el lado incluido: "Muslo derecho". */
function nombreZona(z) {
  if (!z) return '—';
  return z.lado ? z.nombre + ' ' + z.lado : z.nombre;
}

/* -------------------------------------------------------------------------
   LECTURA CLINICA DEL MAPA
   Convierte la nube de puntos en los numeros que el motor necesita. Es la
   pieza que hace que marcar la silueta no sea un dibujito sino un dato.
   ------------------------------------------------------------------------- */
function leerMapa(puntos) {
  const p = Array.isArray(puntos) ? puntos.filter(q => q && q.i > 0) : [];
  const r = {
    total: p.length,
    zonas: [],              // zonas afectadas, con intensidad maxima
    wpi: 0,                 // indice de dolor generalizado, 0 a 19
    wpiRegiones: [],
    areas: [],              // cuantas de las 5 areas corporales
    raices: {},             // raiz nerviosa -> cantidad de puntos
    intensidadMax: 0,
    intensidadMedia: 0,
    bilateral: false,
    distribucion: 'sin marcas'
  };
  if (!p.length) return r;

  const porZona = new Map();
  const wpiSet = new Set();
  const areaSet = new Set();
  let suma = 0;

  for (const punto of p) {
    const z = zonaDe(punto.x, punto.y, punto.v);
    if (!z) continue;
    suma += punto.i;
    r.intensidadMax = Math.max(r.intensidadMax, punto.i);
    const prev = porZona.get(z.id);
    if (!prev || punto.i > prev.i) porZona.set(z.id, {z, i:punto.i, n:(prev ? prev.n : 0) + 1});
    else porZona.set(z.id, {z, i:prev.i, n:prev.n + 1});
    if (z.wpi) {
      wpiSet.add(z.wpi);
      const reg = WPI_REGIONES.find(w => w.id === z.wpi);
      if (reg) areaSet.add(reg.area);
    }
    for (const raiz of (z.raices || [])) r.raices[raiz] = (r.raices[raiz] || 0) + 1;
  }

  r.zonas = [...porZona.values()].sort((a, b) => b.i - a.i);
  r.wpi = wpiSet.size;
  r.wpiRegiones = [...wpiSet];
  r.areas = [...areaSet];
  r.intensidadMedia = Math.round((suma / p.length) * 10) / 10;

  const izq = r.zonas.some(x => /izquierd/.test(x.z.lado));
  const der = r.zonas.some(x => /derech/.test(x.z.lado));
  r.bilateral = izq && der;

  /* Distribucion: es el dato que separa un dolor discreto de uno regional y
     de uno generalizado, y ese es exactamente el primer criterio del sistema
     de gradacion de dolor nociplastico de Kosek (2021). */
  if (r.wpi >= 7 && r.areas.length >= 4)      r.distribucion = 'generalizada';
  else if (r.wpi >= 4)                        r.distribucion = 'multifocal';
  else if (r.zonas.length >= 2)               r.distribucion = 'regional';
  else                                        r.distribucion = 'localizada';

  return r;
}

/* -------------------------------------------------------------------------
   ¿La distribucion sigue un territorio nervioso?
   Devuelve la raiz mas representada y que proporcion de los puntos cubre.
   Una concentracion alta en una sola raiz, sobre todo si es unilateral, es
   lo que en la gradacion NeuPSIG se llama "distribucion neuroanatomicamente
   plausible" y habilita el escalon de dolor neuropatico POSIBLE.
   ------------------------------------------------------------------------- */
function raizDominante(lectura) {
  const entradas = Object.entries(lectura.raices || {});
  if (!entradas.length) return null;
  entradas.sort((a, b) => b[1] - a[1]);
  const totalPuntos = entradas.reduce((s, e) => s + e[1], 0);
  return {
    raiz: entradas[0][0],
    puntos: entradas[0][1],
    proporcion: Math.round((entradas[0][1] / totalPuntos) * 100),
    top: entradas.slice(0, 3).map(e => e[0])
  };
}
