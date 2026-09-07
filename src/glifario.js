/* =========================================================================
   GLIFARIO — mapa no verbal de la sensacion
   -------------------------------------------------------------------------
   El paciente casi nunca tiene palabras para el dolor cronico. "Me duele"
   y "es feo" es todo lo que llega, y despues la consulta se va en tratar de
   sacarle el adjetivo. El glifario da vuelta el problema: en vez de pedirle
   que NOMBRE la sensacion, le pide que la DESCRIBA por partes —el color, el
   movimiento, cada cuanto viene, si vibra, de que esta hecha, si quema o si
   enfria— y el nombre lo pone la aplicacion.

   Eso es lo unico que este modulo hace y conviene decirlo con todas las
   letras: NO es un diagnostico, ni se le parece. Es una forma de que la
   persona tenga con que empezar a hablar, y de que el medico lea en diez
   segundos algo que en la consulta cuesta veinte minutos.

   COMO SE ELIGE EL NUCLEO
   Cada una de las diez figuras tiene una tabla de pesos: cuantos puntos le
   suma cada respuesta posible. Se suman los puntos de las seis respuestas y
   gana la figura con mas puntos. Si dos quedan cerca, se guarda la segunda
   como alternativa y se le muestra al medico, porque un empate es un dato:
   quiere decir que la descripcion se parece a dos cosas a la vez.

   Los pesos estan verificados por fuerza bruta (las 7.680 combinaciones
   posibles): las diez figuras son alcanzables y ninguna se come a las otras.
   Si se tocan los pesos, hay que volver a correr esa prueba.
   ========================================================================= */
'use strict';

/* --------------------------------------------------------- las preguntas */
/* El orden importa: se contesta de lo mas facil de imaginar (un color) a lo
   mas abstracto (de que esta hecho). Arrancar por la textura deja a la gente
   mirando la pantalla sin saber que tocar. */

const GLIFO_DIMENSIONES = [
  {
    id:'tono', titulo:'¿De qué color es?',
    ayuda:'Si el dolor tuviera un color, ¿cuál sería? No hay respuesta correcta.',
    tipo:'color',
    opciones:[
      {v:'rojo',    t:'Rojo encendido',   hex:'#B23A25', pista:'como una brasa'},
      {v:'azul',    t:'Azul eléctrico',   hex:'#3A4A6B', pista:'como un cable pelado'},
      {v:'gris',    t:'Gris plomo',       hex:'#5B5247', pista:'apagado, pesado'},
      {v:'violeta', t:'Violeta oscuro',   hex:'#7A4060', pista:'como un moretón'},
      {v:'ocre',    t:'Ocre mineral',     hex:'#C08A35', pista:'como piedra o óxido'}
    ]
  },
  {
    id:'movimiento', titulo:'¿Se mueve?',
    ayuda:'Piense en el dolor como algo que está adentro suyo. ¿Se queda quieto o hace algo?',
    opciones:[
      {v:'estatico',    t:'Está siempre quieto', pista:'no se mueve nunca'},
      {v:'pulsante',    t:'Late, va y viene',    pista:'como un latido o una ola'},
      {v:'expansivo',   t:'Se agranda, se corre',pista:'empieza en un lugar y se extiende'},
      {v:'paroxistico', t:'Ataca de golpe',      pista:'zarpazos que no se ven venir'}
    ]
  },
  {
    id:'frecuencia', titulo:'¿Cada cuánto aparece?',
    ayuda:'Pensando en las últimas dos semanas.',
    opciones:[
      {v:'permanente', t:'No se va nunca',        pista:'está todo el día'},
      {v:'diaria',     t:'Varias veces por día',  pista:'aparece y afloja'},
      {v:'semanal',    t:'Algunos días por semana'},
      {v:'esporadica', t:'De vez en cuando',      pista:'pasan días sin que aparezca'}
    ]
  },
  {
    id:'vibracion', titulo:'¿Vibra?',
    ayuda:'Algunos dolores tiemblan, otros están mudos.',
    opciones:[
      {v:'quieta',   t:'No vibra, está mudo'},
      {v:'fina',     t:'Vibra finito',      pista:'como electricidad, hormigueo'},
      {v:'grave',    t:'Late lento y hondo',pista:'como un tambor grave'},
      {v:'sacudida', t:'Sacude de golpe',   pista:'como un corrientazo'}
    ]
  },
  {
    id:'textura', titulo:'¿De qué está hecho?',
    ayuda:'Si pudiera tocarlo con la mano, ¿qué tocaría?',
    opciones:[
      {v:'aspera',   t:'Áspero, con costra', pista:'rugoso, pegado a la piel'},
      {v:'maciza',   t:'Macizo y pesado',    pista:'un bloque lleno'},
      {v:'tensa',    t:'Tenso, como una red',pista:'una malla estirada'},
      {v:'filosa',   t:'Filoso y finito',    pista:'agujas, alfileres, un hilo de vidrio'},
      {v:'hueca',    t:'Hueco, como un vacío',pista:'falta algo donde debería haber algo'},
      {v:'apretada', t:'Aprieta y estruja',  pista:'algo que retuerce por dentro'}
    ]
  },
  {
    id:'temperatura', titulo:'¿Quema o enfría?',
    opciones:[
      {v:'arde',      t:'Arde, quema'},
      {v:'frio',      t:'Es frío'},
      {v:'templado',  t:'Ni frío ni caliente'},
      {v:'cambiante', t:'Cambia: a veces quema y a veces enfría'}
    ]
  }
];

/* Los cinco colores tambien se usan para pintar el glifo. */
const GLIFO_TONOS = {};
GLIFO_DIMENSIONES[0].opciones.forEach(o => { GLIFO_TONOS[o.v] = o; });

/* Etiqueta legible de cualquier respuesta, para las devoluciones y la
   vista del medico. */
function glifoEtiqueta(dim, valor) {
  const d = GLIFO_DIMENSIONES.find(x => x.id === dim);
  if (!d) return valor || '—';
  const o = d.opciones.find(x => x.v === valor);
  return o ? o.t : '—';
}

/* ------------------------------------------------------------ las figuras */
/* Cada figura trae:
     desc        como se la describe en palabras del paciente
     topo        donde suele aparecer (dato para el medico, no para el portal)
     foco        hacia donde mirar en la consulta (SOLO para el medico)
     devolucion  lo que se le dice a la persona cuando le toca esa figura
     pesos       cuantos puntos suma cada respuesta
     figura(c,g) el dibujo grande, en un lienzo de 240x240
     icono(c)    el dibujo chico de 24x24, para listas                      */

const GLIFO_NUCLEOS = {
  liquen: {
    codigo:'LA', nombre:'El Liquen Ácido',
    desc:'una costra rugosa y porosa, como hiedra microscópica pegada a la cara interna de la piel',
    topo:'Dérmica y subcutánea, difusa',
    foco:'Componente inflamatorio periférico. Explorar alodinia táctil, terapia tópica y modulación periférica.',
    devolucion:{
      frase:'Incluso la hiedra más tenaz cede ante la luz del amanecer. Su cuerpo guarda la memoria de batallas silenciosas, y también la capacidad de encontrar alivio en la quietud.',
      valoracion:'Paz para la piel y vuelta al cuidado amable de uno mismo.'
    },
    pesos:{textura:{aspera:4}, tono:{rojo:2}, temperatura:{arde:3},
           movimiento:{expansivo:2}, vibracion:{fina:1}, frecuencia:{permanente:1}},
    figura:(c,g) => '<path d="M60,120 C85,85 110,155 140,110 C162,78 185,145 210,108" stroke="'+c+'" stroke-width="'+(g*1.8)+'" fill="none" stroke-linecap="round"/>' +
                    '<path d="M50,155 C82,132 118,178 150,142 C172,118 195,165 216,132" stroke="'+c+'" stroke-width="'+(g*1.5)+'" fill="none" stroke-linecap="round" opacity=".8"/>' +
                    '<path d="M56,86 C86,64 116,104 146,74" stroke="'+c+'" stroke-width="'+(g*1.1)+'" fill="none" stroke-linecap="round" opacity=".5"/>',
    icono:c => '<path d="M5 12C8 8 10 15 13 11C15 8 18 14 20 11" stroke="'+c+'" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M4 16C8 13 11 18 14 15C16 13 19 17 21 14" stroke="'+c+'" stroke-width="1.5" fill="none" stroke-linecap="round"/>'
  },

  pendulo: {
    codigo:'PO', nombre:'El Péndulo de Obsidiana',
    desc:'una cuña pesada y simétrica, de bordes filosos como cristal volcánico, que se balancea adentro de la cabeza',
    topo:'Craneal profunda',
    foco:'Patrón cefalálgico. Evaluar profilaxis, fotofobia/fonofobia y el aislamiento sensorial que genera.',
    devolucion:{
      frase:'En medio de la tormenta y del vaivén, hay un centro quieto que la tormenta no toca. Descanse ahí: el temporal no es todo lo que usted es, y va a pasar.',
      valoracion:'Silencio adentro y refugio en la propia firmeza.'
    },
    pesos:{movimiento:{pulsante:4}, vibracion:{grave:3}, textura:{maciza:2},
           tono:{gris:2}, temperatura:{templado:1}, frecuencia:{diaria:2}},
    figura:(c,g) => '<polygon points="120,34 192,182 48,182" fill="'+c+'"/>' +
                    '<line x1="120" y1="34" x2="120" y2="182" stroke="var(--glifo-papel)" stroke-width="'+g+'"/>',
    icono:c => '<polygon points="12,4 19,18 5,18" fill="'+c+'"/>'
  },

  malla: {
    codigo:'ME', nombre:'La Malla Eléctrica',
    desc:'una red de pesca metálica, tensa, con los nudos electrificados, tendida justo debajo de la piel',
    topo:'Territorio de nervio periférico, con predominio distal',
    foco:'Patrón sugerente de componente neuropático. Cotejar con el DN4 y con el mapa corporal.',
    devolucion:{
      frase:'Cada chispa que su cuerpo registra es también una señal de que está vivo y buscando armonía. Puede darse permiso para bajar el escudo y descansar.',
      valoracion:'Calma para la guardia alta y lugar para la fragilidad.'
    },
    pesos:{vibracion:{fina:4}, textura:{tensa:4}, tono:{azul:3},
           movimiento:{estatico:1}, temperatura:{templado:1}, frecuencia:{permanente:1}},
    figura:(c,g) => '<rect x="52" y="52" width="136" height="136" fill="none" stroke="'+c+'" stroke-width="'+(g*1.6)+'"/>' +
                    '<line x1="52" y1="97" x2="188" y2="97" stroke="'+c+'" stroke-width="'+g+'"/>' +
                    '<line x1="52" y1="143" x2="188" y2="143" stroke="'+c+'" stroke-width="'+g+'"/>' +
                    '<line x1="97" y1="52" x2="97" y2="188" stroke="'+c+'" stroke-width="'+g+'"/>' +
                    '<line x1="143" y1="52" x2="143" y2="188" stroke="'+c+'" stroke-width="'+g+'"/>',
    icono:c => '<rect x="5" y="5" width="14" height="14" fill="none" stroke="'+c+'" stroke-width="1.6"/><line x1="5" y1="12" x2="19" y2="12" stroke="'+c+'" stroke-width="1.1"/><line x1="12" y1="5" x2="12" y2="19" stroke="'+c+'" stroke-width="1.1"/>'
  },

  cemento: {
    codigo:'CI', nombre:'El Cemento Intraóseo',
    desc:'un bloque macizo, compactado a presión adentro del hueso, que no deja lugar para nada más',
    topo:'Huesos largos o cuerpos vertebrales',
    foco:'Dolor profundo, sordo y continuo. Considerar sensibilización central y reprocesamiento somatosensorial.',
    devolucion:{
      frase:'Bajo la roca más firme late la fuerza vieja de la tierra. Su esqueleto viene sosteniendo una historia larga: hoy puede soltar el aire y apoyarse.',
      valoracion:'Sostén hondo y permiso para dejar la carga en el piso.'
    },
    pesos:{textura:{maciza:4}, tono:{gris:3}, movimiento:{estatico:3},
           vibracion:{quieta:3}, temperatura:{templado:1}, frecuencia:{permanente:2}},
    figura:(c,g) => '<rect x="72" y="38" width="96" height="164" rx="14" fill="'+c+'"/>' +
                    '<line x1="94" y1="88" x2="146" y2="88" stroke="var(--glifo-papel)" stroke-width="'+(g*1.4)+'"/>' +
                    '<line x1="94" y1="128" x2="146" y2="128" stroke="var(--glifo-papel)" stroke-width="'+(g*1.4)+'"/>' +
                    '<line x1="94" y1="168" x2="146" y2="168" stroke="var(--glifo-papel)" stroke-width="'+(g*1.4)+'"/>',
    icono:c => '<rect x="7" y="4" width="10" height="16" rx="2" fill="'+c+'"/>'
  },

  tornillo: {
    codigo:'TV', nombre:'El Tornillo Visceral',
    desc:'una espiral de metal oxidado que atraviesa el centro del cuerpo y lo va retorciendo',
    topo:'Abdominal, mesogástrica e hipogástrica',
    foco:'Sospecha de componente visceral. Revisar ritmo digestivo, relación con las comidas y bloqueos simpáticos.',
    devolucion:{
      frase:'Su centro es un lugar que merece suavidad. Así como el río va modelando la piedra sin apuro, su cuerpo busca su propio cauce de calma.',
      valoracion:'Fluidez adentro y paz con el ritmo del cuerpo.'
    },
    pesos:{textura:{apretada:4}, tono:{ocre:3}, movimiento:{expansivo:2, paroxistico:1},
           vibracion:{grave:2, sacudida:1}, temperatura:{cambiante:2}, frecuencia:{diaria:2}},
    figura:(c,g) => '<path d="M68,36 C176,58 176,112 120,132 C64,152 64,192 172,214" stroke="'+c+'" stroke-width="'+(g*2.2)+'" fill="none" stroke-linecap="round"/>',
    icono:c => '<path d="M8 4C16 6 16 10 12 12C8 14 8 18 16 20" stroke="'+c+'" stroke-width="2" fill="none" stroke-linecap="round"/>'
  },

  lluvia: {
    codigo:'LL', nombre:'La Lluvia de Alfileres',
    desc:'millones de alfileres calientes y finísimos que caen todos juntos sobre una superficie grande del cuerpo',
    topo:'Distribución amplia y bastante simétrica',
    foco:'Patrón difuso y extenso. Descartar sensibilización central; revisar sueño, ánimo y umbral al roce.',
    devolucion:{
      frase:'Su sensibilidad al mundo habla de alguien despierto, no de alguien roto. Que cada roce liviano pueda volverse, de a poco, una caricia y no una alarma.',
      valoracion:'Amparo frente al entorno y una tregua con la propia piel.'
    },
    pesos:{temperatura:{arde:4}, textura:{filosa:3}, tono:{rojo:3},
           vibracion:{fina:2}, movimiento:{expansivo:1, paroxistico:1}, frecuencia:{permanente:2}},
    figura:(c,g) => [58,89,120,151,182].map((x,i) =>
        '<line x1="'+x+'" y1="'+(34+(i%2)*12)+'" x2="'+x+'" y2="'+(206-(i%2)*12)+'" stroke="'+c+'" stroke-width="'+(g*1.3)+'" stroke-linecap="round"/>').join(''),
    icono:c => '<line x1="7" y1="4" x2="7" y2="20" stroke="'+c+'" stroke-width="1.5"/><line x1="12" y1="4" x2="12" y2="20" stroke="'+c+'" stroke-width="1.5"/><line x1="17" y1="4" x2="17" y2="20" stroke="'+c+'" stroke-width="1.5"/>'
  },

  garra: {
    codigo:'GI', nombre:'La Garra Isquémica',
    desc:'una mano rígida que abraza con fuerza un vaso de sangre y no lo suelta, y deja todo frío del otro lado',
    topo:'Pantorrillas, tobillos y porción distal de los miembros',
    foco:'Componente vascular o autonómico. Evaluar pulsos, color, temperatura y relación con la marcha.',
    devolucion:{
      frase:'La fuerza de verdad no está en apretar sin descanso, sino en animarse a aflojar las manos. Su movilidad se renueva también en las pausas.',
      valoracion:'Esperanza en el movimiento y perdón para los propios límites.'
    },
    pesos:{temperatura:{frio:4}, tono:{violeta:4}, textura:{apretada:3},
           movimiento:{pulsante:2, paroxistico:1}, vibracion:{quieta:1}, frecuencia:{diaria:2}},
    figura:(c,g) => '<path d="M48,78 C48,152 90,194 120,194 C150,194 192,152 192,78" stroke="'+c+'" stroke-width="'+(g*2.2)+'" fill="none" stroke-linecap="round"/>' +
                    '<circle cx="120" cy="112" r="26" fill="'+c+'"/>',
    icono:c => '<path d="M5 8C5 14 9 18 12 18C15 18 19 14 19 8" stroke="'+c+'" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="12" cy="11" r="2.4" fill="'+c+'"/>'
  },

  vacio: {
    codigo:'VC', nombre:'El Vacío',
    desc:'un hueco, una ausencia con forma: falta algo justo donde debería haber cuerpo',
    topo:'Segmento con déficit sensitivo, anestesiado o amputado',
    foco:'Sensación de ausencia o miembro fantasma. Considerar terapia de espejo e integración somatosensorial.',
    devolucion:{
      frase:'Lo que hoy se siente como ausencia es también un espacio abierto. Usted no está incompleto: lo que lo hace usted no se perdió en ese hueco.',
      valoracion:'Aceptación serena del propio cuerpo, tal como está hoy.'
    },
    pesos:{textura:{hueca:6}, tono:{gris:2}, movimiento:{estatico:2},
           vibracion:{quieta:2}, temperatura:{frio:2, templado:1}, frecuencia:{permanente:1}},
    figura:(c,g) => '<circle cx="120" cy="120" r="76" fill="none" stroke="'+c+'" stroke-width="'+(g*2.1)+'" stroke-dasharray="12 8"/>',
    icono:c => '<circle cx="12" cy="12" r="7.5" fill="none" stroke="'+c+'" stroke-width="2" stroke-dasharray="3 3"/>'
  },

  placa: {
    codigo:'PC', nombre:'La Placa de Cuarzo',
    desc:'una losa dura, sin nada de elasticidad, encajada a la fuerza entre dos partes que deberían moverse',
    topo:'Columna lumbar baja o cervical media',
    foco:'Patrón mecánico y de rigidez. Fisiokinesia, higiene postural y trabajo sobre el miedo al movimiento.',
    devolucion:{
      frase:'La rigidez afloja cuando el cuerpo se siente escuchado. Permítase la flexibilidad de tratarse con compasión: cada articulación guarda el movimiento que todavía es posible.',
      valoracion:'Paciencia con el tiempo del cuerpo y confianza en el movimiento.'
    },
    pesos:{movimiento:{estatico:4}, tono:{ocre:4}, textura:{maciza:2, apretada:2},
           vibracion:{quieta:2}, temperatura:{templado:2}, frecuencia:{permanente:2}},
    figura:(c,g) => '<rect x="36" y="96" width="168" height="48" rx="6" fill="'+c+'"/>' +
                    '<line x1="36" y1="80" x2="204" y2="80" stroke="'+c+'" stroke-width="'+(g*0.8)+'" opacity=".4"/>' +
                    '<line x1="36" y1="160" x2="204" y2="160" stroke="'+c+'" stroke-width="'+(g*0.8)+'" opacity=".4"/>',
    icono:c => '<rect x="4" y="9" width="16" height="6" rx="1" fill="'+c+'"/>'
  },

  latigazo: {
    codigo:'LS', nombre:'El Latigazo de Sílice',
    desc:'un hilo finísimo de vidrio templado que restalla de golpe, sin aviso, y después desaparece',
    topo:'Trayecto de un nervio, con frecuencia en la cara',
    foco:'Patrón paroxístico tipo neuralgia. Indagar zonas gatillo y anticonvulsivantes específicos.',
    devolucion:{
      frase:'Ante el rayo que llega sin avisar, su respiración es el ancla que lo trae de vuelta. El coraje con que enfrenta cada episodio dice mucho de usted.',
      valoracion:'Coraje sereno y refugio en la respiración.'
    },
    pesos:{vibracion:{sacudida:4}, movimiento:{paroxistico:4}, textura:{filosa:3},
           tono:{rojo:2, azul:2}, temperatura:{templado:1}, frecuencia:{esporadica:3, semanal:2}},
    figura:(c,g) => '<path d="M28,120 L88,58 L152,182 L212,118" stroke="'+c+'" stroke-width="'+(g*2.1)+'" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    icono:c => '<path d="M3 12L9 6L15 18L21 12" stroke="'+c+'" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  }
};

/* --------------------------------------------------------------- motor -- */

/* Suma los puntos de cada figura y devuelve la ganadora. La segunda se
   guarda solo si quedo pegada a la primera: un empate real es informacion
   clinica, un segundo puesto lejano es ruido. */
function glifoInferir(r) {
  const tabla = Object.entries(GLIFO_NUCLEOS).map(([id, n]) => {
    let p = 0;
    for (const dim of Object.keys(n.pesos)) {
      const v = r[dim];
      if (v && n.pesos[dim][v]) p += n.pesos[dim][v];
    }
    return {id, puntaje:p};
  }).sort((a, b) => b.puntaje - a.puntaje);

  const segunda = tabla[1] && (tabla[0].puntaje - tabla[1].puntaje) <= 1 ? tabla[1].id : null;
  return {nucleo:tabla[0].id, puntaje:tabla[0].puntaje, alternativa:segunda, tabla};
}

function glifoCompleto(g) {
  if (!g || !g.respuestas) return false;
  return GLIFO_DIMENSIONES.every(d => g.respuestas[d.id]);
}

function glifoVacio() {
  return {respuestas:{}, intensidad:3, nucleo:'', alternativa:'', codigo:'', fecha:''};
}

/* Recalcula todo lo derivado. Se llama en cada toque: es barato y evita
   que el codigo y la figura queden desfasados de las respuestas. */
function glifoRecalcular(g) {
  if (!glifoCompleto(g)) { g.nucleo = ''; g.alternativa = ''; g.codigo = ''; return g; }
  const r = glifoInferir(g.respuestas);
  g.nucleo = r.nucleo;
  g.alternativa = r.alternativa || '';
  g.puntaje = r.puntaje;
  g.codigo = GLIFO_NUCLEOS[r.nucleo].codigo + '·' +
             g.respuestas.movimiento.slice(0, 2).toUpperCase() + '·' +
             g.respuestas.tono.slice(0, 2).toUpperCase() + '·' + g.intensidad;
  return g;
}

/* --------------------------------------------------------------- dibujo - */

/* El glifo va SIEMPRE sobre papel claro, tambien con el telefono en modo
   oscuro. Es la misma decision que la lamina blanca del codigo QR: los cinco
   tonos estan elegidos para leerse sobre papel y sobre fondo negro el azul
   cobalto y el gris plomo directamente desaparecen. */
function glifoSVG(g, tam) {
  const n = GLIFO_NUCLEOS[g.nucleo];
  if (!n) return '';
  const c = (GLIFO_TONOS[g.respuestas.tono] || {hex:'#5B5247'}).hex;
  const i = g.intensidad || 3;
  const escala = (0.74 + i * 0.06).toFixed(3);
  const grosor = 1.8 + i * 0.7;
  const lado = tam || 240;

  return '<svg viewBox="0 0 240 240" width="' + lado + '" height="' + lado + '" ' +
         'class="glifo-svg mov-' + esc(g.respuestas.movimiento || 'estatico') + '" aria-hidden="true">' +
         glifoAura(c, g.respuestas.movimiento) +
         '<g style="transform-origin:120px 120px;transform:scale(' + escala + ')">' +
         n.figura(c, grosor) + '</g></svg>';
}

/* La dinamica no cambia la figura: la rodea. Asi la figura sigue siendo
   reconocible entre pacientes y el movimiento se lee igual de un vistazo. */
function glifoAura(c, mov) {
  if (mov === 'pulsante') {
    return '<circle class="aura" cx="120" cy="120" r="104" fill="none" stroke="' + c + '" stroke-width="1.4" opacity=".28"/>' +
           '<circle class="aura aura-2" cx="120" cy="120" r="86" fill="none" stroke="' + c + '" stroke-width="1.4" opacity=".18"/>';
  }
  if (mov === 'expansivo') {
    return '<path class="aura" d="M120,14 A106,106 0 0,1 226,120" fill="none" stroke="' + c + '" stroke-width="1.6" opacity=".3"/>' +
           '<path class="aura aura-2" d="M120,226 A106,106 0 0,1 14,120" fill="none" stroke="' + c + '" stroke-width="1.6" opacity=".3"/>';
  }
  if (mov === 'paroxistico') {
    return [[26,34],[214,34],[26,206],[214,206]].map(([x, y]) =>
      '<path class="aura" d="M' + x + ',' + (y - 11) + ' L' + (x + 3) + ',' + y + ' L' + (x + 14) + ',' + y +
      ' L' + (x + 3) + ',' + (y + 2) + ' Z" fill="' + c + '" opacity=".45"/>').join('');
  }
  return '<rect class="aura" x="18" y="18" width="204" height="204" fill="none" stroke="' + c + '" ' +
         'stroke-width="1.2" opacity=".22"/>';
}

/* --------------------------------------------------------------- textos - */

function glifoFrase(g) {
  const n = GLIFO_NUCLEOS[g.nucleo];
  if (!n) return '';
  return 'Su dolor se parece a ' + n.desc + '.';
}

/* Devolucion para el PACIENTE. Deliberadamente NO incluye el foco clinico:
   decirle a alguien "acá corresponden anticonvulsivantes" antes de que lo vea
   un medico es prometerle un tratamiento que todavia nadie indico. Ese campo
   existe, se guarda, y lo lee la medica en su ventana. */
function glifoDevolucionHTML(g) {
  const n = GLIFO_NUCLEOS[g.nucleo];
  if (!n) return '';
  return '<div class="glifo-devo">' +
    '<div class="glifo-devo-t">' + esc(n.nombre) + '</div>' +
    '<p class="glifo-devo-d">' + esc(glifoFrase(g)) + '</p>' +
    '<p class="glifo-devo-f">«' + esc(n.devolucion.frase) + '»</p>' +
    '<p class="glifo-devo-v">' + esc(n.devolucion.valoracion) + '</p>' +
    '</div>';
}

/* TITULAR para la medica. Es lo unico que se muestra arriba de todo, antes
   de la ficha: el nombre de la figura y una linea de que quiere decir.

   Va primero a proposito. La medica abre el cuestionario y en dos segundos
   sabe con que se va a encontrar —una lluvia de alfileres y un cemento
   intraoseo son dos consultas distintas antes de decir la primera palabra—
   y despues lee el cuestionario completo como siempre. */
function glifoTitularHTML(g) {
  if (!glifoCompleto(g) || !GLIFO_NUCLEOS[g.nucleo]) return '';
  const n = GLIFO_NUCLEOS[g.nucleo];
  const alt = g.alternativa && GLIFO_NUCLEOS[g.alternativa];

  return '<div class="glifo-titular">' +
    '<div class="glifo-lamina chica">' + glifoSVG(g, 84) + '</div>' +
    '<div class="glifo-titular-txt">' +
      '<div class="glifo-titular-r">Así dibujó su dolor</div>' +
      '<div class="glifo-titular-n">' + esc(n.nombre) +
        ' <span class="mono">' + esc(g.codigo) + '</span></div>' +
      '<p class="glifo-titular-d">' + esc(n.desc.charAt(0).toUpperCase() + n.desc.slice(1)) +
        '. Intensidad <b>' + (g.intensidad || 3) + '/5</b>.</p>' +
      (alt ? '<p class="glifo-titular-a">También podría leerse como <b>' +
        esc(alt.nombre) + '</b>: quedó a un punto.</p>' : '') +
    '</div></div>';
}

/* El detalle queda plegado debajo del titular. La mayoría de las veces con
   el nombre de la figura alcanza; el dia que no alcanza, esta todo aca y no
   hay que ir a buscarlo a otra pantalla. */
function glifoResumenHTML(g) {
  if (!glifoCompleto(g) || !GLIFO_NUCLEOS[g.nucleo]) return '';
  const n = GLIFO_NUCLEOS[g.nucleo];

  return glifoTitularHTML(g) +
    '<details class="plegable"><summary><span class="plegable-t">' +
    'Cómo llegó a esa figura</span></summary><div class="plegable-c">' +
      dato('Respuestas del paciente', GLIFO_DIMENSIONES.map(d =>
        marca(glifoEtiqueta(d.id, g.respuestas[d.id]), 'neutro')).join(' ')) +
      dato('Topografía típica', esc(n.topo)) +
      dato('Hacia dónde mirar', '<i>' + esc(n.foco) + '</i>') +
      '<p class="nota" style="margin-top:8px">Orientación del glifario a partir de seis ' +
      'respuestas, no un diagnóstico ni una indicación. El paciente no ve este renglón: ' +
      'de su lado solo hay una devolución de acompañamiento.</p>' +
    '</div></details>';
}

/* ---------------------------------------------------------------- modal - */

/* Ventana modal del portal. Recibe el objeto donde guardar y una funcion que
   se llama al tocar Continuar. No se puede cerrar con un tache: el unico
   camino de salida es Continuar o "Prefiero saltearlo", y ese segundo camino
   tiene que existir —obligar a alguien con dolor a jugar a esto para poder
   cargar su historia seria una crueldad chica pero real. */
let GLIFO_ABIERTO = false;

function abrirGlifario(guardarEn, alTerminar) {
  if (GLIFO_ABIERTO) return;
  GLIFO_ABIERTO = true;

  const g = guardarEn.glifario && guardarEn.glifario.respuestas
    ? guardarEn.glifario : glifoVacio();
  guardarEn.glifario = g;

  const capa = document.createElement('div');
  capa.className = 'glifario-capa';
  capa.innerHTML = '<div class="glifario-caja" role="dialog" aria-modal="true" aria-label="Glifario"></div>';
  const caja = $('.glifario-caja', capa);
  document.body.appendChild(capa);
  document.body.classList.add('sin-scroll');

  const cerrar = () => {
    GLIFO_ABIERTO = false;
    document.body.classList.remove('sin-scroll');
    capa.remove();
    if (alTerminar) alTerminar();
  };

  function pintar() {
    /* Se redibuja entero en cada toque porque el dibujo de arriba depende de
       todas las respuestas. Lo que NO puede pasar es que el paciente elija una
       opcion y la pantalla lo devuelva al principio: se guarda el scroll y se
       repone. Es el mismo cuidado que ya tienen la escala NRS y los grupos de
       opciones de la aplicacion. */
    const scroll = caja.scrollTop;
    glifoRecalcular(g);
    const listo = glifoCompleto(g);
    const contestadas = GLIFO_DIMENSIONES.filter(d => g.respuestas[d.id]).length;

    caja.innerHTML =
      '<div class="glifario-cab">' +
        '<div class="glifario-tit">Antes de empezar: ¿cómo es su dolor?</div>' +
        '<p class="glifario-sub">Casi nadie tiene palabras para esto. Por eso no le vamos a pedir ' +
        'que lo nombre: elija cómo se ve, cómo se mueve y de qué está hecho, y nosotros ' +
        'le ponemos el nombre. No hay respuestas correctas ni equivocadas.</p>' +
        '<div class="glifario-barra"><i style="width:' +
          Math.round(contestadas / GLIFO_DIMENSIONES.length * 100) + '%"></i></div>' +
      '</div>' +
      '<div class="glifario-cuerpo"></div>';

    const cuerpo = $('.glifario-cuerpo', caja);

    /* El dibujo, arriba de todo: cambia con cada toque y es lo que hace que
       valga la pena seguir contestando. Mientras falten respuestas muestra
       una silueta a la espera en vez de un hueco. */
    const lam = document.createElement('div');
    lam.className = 'glifo-lamina';
    lam.innerHTML = listo
      ? glifoSVG(g, 210)
      : '<div class="glifo-espera"><svg viewBox="0 0 240 240" width="150" height="150">' +
        '<circle cx="120" cy="120" r="76" fill="none" stroke="#B9AE97" stroke-width="2" stroke-dasharray="7 9"/>' +
        '</svg><span>' + (contestadas ? 'Le faltan ' +
          (GLIFO_DIMENSIONES.length - contestadas) + ' respuestas' : 'Su dibujo aparece acá') + '</span></div>';
    cuerpo.appendChild(lam);

    if (listo) cuerpo.insertAdjacentHTML('beforeend', glifoDevolucionHTML(g));

    /* Las seis preguntas. */
    GLIFO_DIMENSIONES.forEach((dim, i) => {
      const bl = document.createElement('div');
      bl.className = 'glifo-preg';
      bl.innerHTML = '<div class="glifo-preg-n">' + (i + 1) + ' de ' + GLIFO_DIMENSIONES.length + '</div>' +
        '<div class="glifo-preg-t">' + esc(dim.titulo) + '</div>' +
        (dim.ayuda ? '<p class="glifo-preg-a">' + esc(dim.ayuda) + '</p>' : '');

      const fila = document.createElement('div');
      fila.className = 'glifo-ops' + (dim.tipo === 'color' ? ' color' : '');
      dim.opciones.forEach(o => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'glifo-op' + (g.respuestas[dim.id] === o.v ? ' on' : '');
        b.innerHTML =
          (o.hex ? '<span class="glifo-punto" style="background:' + o.hex + '"></span>' : '') +
          '<span class="glifo-op-t">' + esc(o.t) + '</span>' +
          (o.pista ? '<span class="glifo-op-p">' + esc(o.pista) + '</span>' : '');
        b.onclick = () => {
          g.respuestas[dim.id] = g.respuestas[dim.id] === o.v ? '' : o.v;
          pintar();
        };
        fila.appendChild(b);
      });
      bl.appendChild(fila);
      cuerpo.appendChild(bl);
    });

    /* Intensidad: la unica pregunta que no cambia la figura, solo su tamaño. */
    const ci = document.createElement('div');
    ci.className = 'glifo-preg';
    ci.innerHTML = '<div class="glifo-preg-n">Por último</div>' +
      '<div class="glifo-preg-t">¿Cuánto lugar le ocupa?</div>' +
      '<p class="glifo-preg-a">De 1, apenas lo noto, a 5, no puedo pensar en otra cosa.</p>';
    const fi = document.createElement('div');
    fi.className = 'glifo-ops intensidad';
    for (let k = 1; k <= 5; k++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'glifo-op num' + (g.intensidad === k ? ' on' : '');
      b.innerHTML = '<span class="glifo-op-t">' + k + '</span>';
      b.onclick = () => { g.intensidad = k; pintar(); };
      fi.appendChild(b);
    }
    ci.appendChild(fi);
    cuerpo.appendChild(ci);

    /* Salidas. */
    const pie = document.createElement('div');
    pie.className = 'glifario-pie';
    if (listo) {
      const seguir = document.createElement('button');
      seguir.type = 'button';
      seguir.className = 'glifo-seguir';
      seguir.textContent = 'Continuar';
      seguir.onclick = () => {
        g.fecha = ahora();
        glifoRecalcular(g);
        cerrar();
      };
      pie.appendChild(seguir);
      pie.insertAdjacentHTML('beforeend',
        '<p class="glifo-pie-n">Puede volver a abrirlo y cambiarlo cuando quiera, ' +
        'hasta que envíe el cuestionario.</p>');
    } else {
      pie.insertAdjacentHTML('beforeend',
        '<div class="glifo-seguir apagado">Continuar</div>' +
        '<p class="glifo-pie-n">Conteste las ' + GLIFO_DIMENSIONES.length +
        ' preguntas para ver su dibujo.</p>');
    }
    const saltar = document.createElement('button');
    saltar.type = 'button';
    saltar.className = 'glifo-saltar';
    saltar.textContent = listo ? 'Seguir con el cuestionario' : 'Prefiero saltearlo por ahora';
    saltar.onclick = cerrar;
    pie.appendChild(saltar);
    cuerpo.appendChild(pie);

    caja.scrollTop = scroll;
  }

  pintar();
}
