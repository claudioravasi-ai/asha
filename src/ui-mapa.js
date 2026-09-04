/* =========================================================================
   MAPA CORPORAL INTERACTIVO
   -------------------------------------------------------------------------
   El paciente toca la silueta donde le duele y elige la intensidad de ese
   punto en una escala de 0 a 10. El punto queda del color que le
   corresponde: verde, verde claro, amarillo, naranja o rojo.

   Que se gana con eso, respecto de la cruz de toda la vida:
     - el medico ve la topografia Y la severidad de un vistazo, sin leer;
     - el dolor irradiado se distingue del dolor principal por el color;
     - la aplicacion puede calcular el indice de dolor generalizado y la
       plausibilidad neuroanatomica, porque cada punto sabe en que zona cayo.

   Funciona con el dedo, con el mouse y con el lapiz. Las coordenadas se
   guardan en las unidades del lienzo de 200x520 y no en pixeles, asi el
   dibujo es identico en el telefono del paciente y en el monitor del
   consultorio.
   ========================================================================= */
'use strict';

const CUERPO_W = 200, CUERPO_H = 520;

/* -------------------------------------------------------------------------
   Dibuja las dos vistas. `puntos` es el array que se va a modificar en el
   lugar; `alCambiar` se llama despues de cada modificacion para guardar.
   Con `soloLectura` en verdadero se dibuja igual pero no se puede tocar:
   es como lo ve el medico en la historia clinica y como sale impreso.
   ------------------------------------------------------------------------- */
function dibujarMapa(nodo, puntos, alCambiar, soloLectura) {
  const cont = document.createElement('div');
  cont.className = 'mapa';
  const VISTAS = [{v:'f', t:'Vista frontal'}, {v:'d', t:'Vista posterior'}];

  for (const vista of VISTAS) {
    const caja = document.createElement('div');
    caja.className = 'mapa-vista';
    caja.dataset.vista = vista.v;
    cont.appendChild(caja);
  }
  nodo.appendChild(cont);
  nodo.insertAdjacentHTML('beforeend', leyendaColores());

  /* Un solo lugar donde se decide qué pasa al tocar la silueta: si se tocó
     un punto existente se edita, y si no, se crea uno nuevo. Al redibujar se
     vuelve a llamar a esta misma función, así que no hay dos copias de la
     misma lógica que puedan quedar desincronizadas. */
  function alTocar(vista, svg, e) {
    const marca = e.target.closest('.punto');
    if (marca) {
      editarPunto(puntos, Number(marca.dataset.i), aplicar);
      return;
    }
    const c = coordenadasDe(svg, e);
    if (!c) return;
    const nuevo = {v:vista, x:Math.round(c.x), y:Math.round(c.y), i:5};
    elegirIntensidad(nuevo.i, zonaDe(nuevo.x, nuevo.y, vista), valor => {
      if (valor == null) return;
      nuevo.i = valor;
      puntos.push(nuevo);
      aplicar();
    });
  }

  function aplicar() {
    redibujar();
    if (alCambiar) alCambiar(puntos);
  }

  function redibujar() {
    for (const vista of VISTAS) {
      const caja = $('.mapa-vista[data-vista="' + vista.v + '"]', cont);
      caja.innerHTML = '<span>' + vista.t + '</span>' + svgSilueta(vista.v, puntos);
      if (soloLectura) continue;
      const svg = $('svg', caja);
      svg.addEventListener('click', e => alTocar(vista.v, svg, e));
    }
  }

  redibujar();
  return {redibujar};
}

/* Del evento del navegador a las coordenadas del lienzo del cuerpo. */
function coordenadasDe(svg, evento) {
  const caja = svg.getBoundingClientRect();
  if (!caja.width) return null;
  const cx = evento.clientX != null ? evento.clientX
           : (evento.touches && evento.touches[0] ? evento.touches[0].clientX : null);
  const cy = evento.clientY != null ? evento.clientY
           : (evento.touches && evento.touches[0] ? evento.touches[0].clientY : null);
  if (cx == null) return null;
  return {
    x: ((cx - caja.left) / caja.width)  * CUERPO_W,
    y: ((cy - caja.top)  / caja.height) * CUERPO_H
  };
}

/* -------------------------------------------------------------------------
   El SVG de una vista, con la silueta y los puntos que le corresponden.
   ------------------------------------------------------------------------- */
function svgSilueta(vista, puntos) {
  let s = '<svg class="silueta" viewBox="0 0 ' + CUERPO_W + ' ' + CUERPO_H + '" ' +
          'preserveAspectRatio="xMidYMid meet" role="img" ' +
          'aria-label="Silueta del cuerpo, ' + (vista === 'f' ? 'vista frontal' : 'vista posterior') +
          '. Tocá donde te duele.">';

  for (const parte of SILUETA.centro) {
    s += '<path class="cuerpo-parte" d="' + parte + '"/>';
  }
  /* Las piezas laterales se dibujan una vez tal cual y otra espejadas sobre
     la linea media (x = 100). La simetria queda garantizada por la
     transformacion y no por haber tipeado bien las dos mitades. */
  /* La nariz va solo de frente: es lo que distingue las dos vistas de un
     vistazo, sin tener que leer el rotulo de arriba. */
  if (vista === 'f') {
    for (const rasgo of (SILUETA.frente || [])) {
      s += '<path class="cuerpo-parte" d="' + rasgo + '"/>';
    }
  }

  for (const parte of SILUETA.lado) {
    s += '<path class="cuerpo-parte" d="' + parte + '"/>';
    s += '<path class="cuerpo-parte" d="' + parte + '" transform="translate(200,0) scale(-1,1)"/>';
  }

  /* Línea media discreta: ayuda a ubicarse y a marcar simetrías. */
  s += '<line x1="100" y1="60" x2="100" y2="500" stroke="currentColor" ' +
       'opacity=".12" stroke-dasharray="3 5"/>';

  (puntos || []).forEach((p, i) => {
    if (p.v !== vista) return;
    const c = colorDolor(p.i);
    const z = zonaDe(p.x, p.y, p.v);
    s += '<g class="punto" data-i="' + i + '">' +
         '<circle cx="' + p.x + '" cy="' + p.y + '" r="9" fill="' + c.color +
         '" fill-opacity=".28"/>' +
         '<circle cx="' + p.x + '" cy="' + p.y + '" r="6" fill="' + c.color +
         '" stroke="' + c.borde + '" stroke-width="1.4"/>' +
         '<text x="' + p.x + '" y="' + (p.y + 3.4) + '" text-anchor="middle" ' +
         'font-size="8" font-weight="700" fill="' + (p.i >= 3 && p.i <= 6 ? '#3a2c00' : '#fff') +
         '" pointer-events="none">' + p.i + '</text>' +
         '<title>' + esc(nombreZona(z)) + ' — intensidad ' + p.i + '/10</title></g>';
  });

  return s + '</svg>';
}

function leyendaColores() {
  return '<div class="leyenda-dolor">' +
    COLOR_DOLOR.map((t, k) => {
      const desde = k === 0 ? 1 : COLOR_DOLOR[k - 1].hasta + 1;
      return '<span><i style="background:' + t.color + '"></i>' + desde + '–' + t.hasta +
             ' ' + esc(t.nombre.toLowerCase()) + '</span>';
    }).join('') + '</div>';
}

/* -------------------------------------------------------------------------
   Selector de intensidad. Aparece cuando se marca un punto nuevo.
   ------------------------------------------------------------------------- */
function elegirIntensidad(valorInicial, zona, alTerminar) {
  const capa = document.createElement('div');
  capa.className = 'selector-dolor';
  const caja = document.createElement('div');
  caja.innerHTML =
    '<h3 style="font-size:16px">' + esc(nombreZona(zona)) + '</h3>' +
    '<p class="nota" style="margin:4px 0 16px">¿Cuánto le duele en este punto?</p>';

  let valor = valorInicial;
  const zonaNRS = document.createElement('div');
  caja.appendChild(zonaNRS);
  const pintarNRS = () => {
    zonaNRS.innerHTML = '';
    escalaNRS(zonaNRS, valor, v => { valor = v == null ? 0 : v; pintarNRS(); },
              ['casi no duele', 'dolor insoportable']);
  };
  pintarNRS();

  const acciones = document.createElement('div');
  acciones.className = 'fila';
  acciones.style.marginTop = '18px';
  caja.appendChild(acciones);

  acciones.appendChild(superficie('Marcar este punto', null, () => {
    capa.remove(); alTerminar(valor == null ? 5 : valor);
  }, 'acento'));
  acciones.appendChild(superficie('Cancelar', null, () => { capa.remove(); alTerminar(null); }));

  capa.appendChild(caja);
  capa.onclick = e => { if (e.target === capa) { capa.remove(); alTerminar(null); } };
  document.body.appendChild(capa);
}

/* Tocar un punto ya marcado: se cambia la intensidad o se borra. */
function editarPunto(puntos, indice, alTerminar) {
  const p = puntos[indice];
  if (!p) return;
  const zona = zonaDe(p.x, p.y, p.v);

  const capa = document.createElement('div');
  capa.className = 'selector-dolor';
  const caja = document.createElement('div');
  caja.innerHTML =
    '<h3 style="font-size:16px">' + esc(nombreZona(zona)) + '</h3>' +
    '<p class="nota" style="margin:4px 0 16px">Cambiá la intensidad o quitá el punto.</p>';

  let valor = p.i;
  const zonaNRS = document.createElement('div');
  caja.appendChild(zonaNRS);
  const pintarNRS = () => {
    zonaNRS.innerHTML = '';
    escalaNRS(zonaNRS, valor, v => { valor = v == null ? 0 : v; pintarNRS(); },
              ['casi no duele', 'dolor insoportable']);
  };
  pintarNRS();

  const acciones = document.createElement('div');
  acciones.className = 'fila';
  acciones.style.marginTop = '18px';
  caja.appendChild(acciones);
  acciones.appendChild(superficie('Guardar', null, () => {
    p.i = valor == null ? 0 : valor; capa.remove(); alTerminar();
  }, 'acento'));
  acciones.appendChild(superficie('Quitar este punto', null, () => {
    puntos.splice(indice, 1); capa.remove(); alTerminar();
  }, 'peligro'));

  capa.appendChild(caja);
  capa.onclick = e => { if (e.target === capa) capa.remove(); };
  document.body.appendChild(capa);
}

/* =========================================================================
   LECTURA DEL MAPA PARA EL MEDICO
   -------------------------------------------------------------------------
   El resumen que acompaña al dibujo en la historia clinica. Traduce la nube
   de puntos a las tres cosas que cambian una conducta: donde duele mas, si
   la distribucion es discreta o generalizada, y si sigue un territorio
   nervioso.
   ========================================================================= */
function resumenMapa(puntos) {
  const l = leerMapa(puntos);
  if (!l.total) {
    return '<p class="nota">El mapa corporal está vacío. Es el dato que más cambia el ' +
           'análisis automático: sin él no se puede calcular la distribución del dolor, ' +
           'el índice de dolor generalizado ni la plausibilidad neuroanatómica.</p>';
  }

  const raiz = raizDominante(l);
  const colorDist = {localizada:'verde', regional:'lima', multifocal:'ambar', generalizada:'rojo'}[l.distribucion];

  let h = '<div class="fila" style="margin-bottom:12px">';
  h += '<div style="flex:1 1 130px">' + marca(l.total + ' punto' + (l.total === 1 ? '' : 's'), 'neutro') + '</div>';
  h += '<div style="flex:1 1 130px">' + marca('Distribución ' + l.distribucion, colorDist) + '</div>';
  h += '<div style="flex:1 1 130px">' + marca('Máxima ' + l.intensidadMax + '/10',
        colorDolor(l.intensidadMax).nombre === 'Leve' ? 'verde' : l.intensidadMax >= 7 ? 'rojo' : 'ambar') + '</div>';
  if (l.bilateral) h += '<div style="flex:1 1 130px">' + marca('Bilateral', 'violeta') + '</div>';
  h += '</div>';

  h += '<dl style="margin:0">';
  h += dato('Zonas comprometidas',
    l.zonas.slice(0, 8).map(z => {
      const c = colorDolor(z.i);
      return '<span style="display:inline-flex;align-items:center;gap:5px;margin:0 9px 4px 0">' +
        '<i style="width:9px;height:9px;border-radius:50%;background:' + c.color +
        ';display:inline-block"></i>' + esc(nombreZona(z.z)) + ' <b>' + z.i + '</b></span>';
    }).join('') + (l.zonas.length > 8 ? '<span class="nota"> y ' + (l.zonas.length - 8) + ' más</span>' : ''));

  h += dato('Índice de dolor generalizado (WPI)',
    l.wpi + ' / 19 regiones · ' + l.areas.length + ' de 5 áreas corporales' +
    (l.wpi >= 7 && l.areas.length >= 4
      ? ' ' + marca('cumple el criterio de extensión de fibromialgia', 'ambar') : ''));

  if (raiz) {
    h += dato('Territorio nervioso predominante',
      '<b>' + esc(raiz.raiz) + '</b> — ' + raiz.proporcion + '% de las marcas' +
      (raiz.proporcion >= 35
        ? ' ' + marca('distribución neuroanatómicamente plausible', 'violeta')
        : ' <span class="nota">(distribución dispersa: no sigue un territorio único)</span>') +
      (raiz.top.length > 1 ? '<div class="nota">También comprometidos: ' + esc(raiz.top.slice(1).join(', ')) + '</div>' : ''));
  }
  h += '</dl>';
  return h;
}
