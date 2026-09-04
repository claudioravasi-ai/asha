/* =========================================================================
   GESTOR DE VENTANAS
   -------------------------------------------------------------------------
   Toda la navegacion de la aplicacion pasa por aca. No hay rutas, ni menu,
   ni botones de volver: hay una PILA de ventanas.

     abrir({...})        apila una ventana nueva a la derecha
     volverA(indice)     cierra todo lo que esta a la derecha de esa posicion
     refrescar()         vuelve a dibujar la ventana activa sin perder el scroll

   Las ventanas de atras se dibujan como LOMOS verticales sobre el borde
   izquierdo. Tocar un lomo vuelve a esa ventana. Eso es todo el sistema de
   navegacion, y por eso no hace falta ningun menu.

   Una ventana se declara asi:
     {id, titulo, sub, ancha, ctx, dibujar(cuerpo, ctx)}
   donde dibujar() recibe el nodo del cuerpo y lo llena. Si la ventana
   necesita rehacerse cuando cambian los datos, no guarda nada: se vuelve a
   llamar a dibujar() y listo.
   ========================================================================= */
'use strict';

const PILA = [];

function abrir(def) {
  /* Si esa ventana ya esta abierta, no se duplica: se vuelve a ella. */
  const ya = PILA.findIndex(v => v.id === def.id);
  if (ya >= 0) {
    PILA.length = ya + 1;
    PILA[ya] = {...PILA[ya], ...def};
  } else {
    PILA.push(def);
  }
  pintarPila();
}

function volverA(indice) {
  PILA.length = Math.max(1, indice + 1);
  pintarPila();
}

function cerrarUltima() {
  if (PILA.length > 1) { PILA.pop(); pintarPila(); }
}

function reemplazar(def) {
  if (PILA.length) PILA[PILA.length - 1] = def;
  else PILA.push(def);
  pintarPila();
}

/* Redibuja solo el cuerpo de la ventana activa, conservando la posicion del
   scroll. Es lo que se llama despues de guardar algo: el medico no pierde
   el lugar donde estaba escribiendo. */
function refrescarVentanaActiva() {
  if (!PILA.length) return;

  /* Algunas ventanas NO se pueden redibujar mientras trabajan.

     El diagnostico de conexion escribe un dato de prueba en cada rama. Esa
     escritura despierta al oyente de Firebase, que llama aca, que rehace la
     ventana entera... y borra el resultado que el diagnostico estaba
     escribiendo. Peor: al rehacerla, el diagnostico vuelve a arrancar y a
     escribir, y se entra en un ciclo que congela la aplicacion.

     Una ventana que se declara asi pide que la dejen en paz hasta terminar. */
  if (PILA[PILA.length - 1].noRefrescar) return;
  const cuerpo = $('#pila .ventana:last-child .cuerpo');
  if (!cuerpo) { pintarPila(); return; }
  const y = cuerpo.scrollTop;
  const v = PILA[PILA.length - 1];
  cuerpo.innerHTML = '';
  try { v.dibujar(cuerpo, v.ctx); } catch (e) { errorEnVentana(cuerpo, e); }
  cuerpo.scrollTop = y;
  pintarLomos();
}
const refrescar = refrescarVentanaActiva;

function pintarPila() {
  const lienzo = $('#pila');
  if (!lienzo) return;
  lienzo.innerHTML = '';

  PILA.forEach((v, i) => {
    const ultima = i === PILA.length - 1;

    if (!ultima) {
      const lomo = document.createElement('div');
      lomo.className = 'lomo';
      lomo.title = v.titulo;
      lomo.innerHTML = '<b>' + esc(v.titulo) + '</b>';
      lomo.onclick = () => volverA(i);
      lienzo.appendChild(lomo);
      return;
    }

    const vent = document.createElement('section');
    vent.className = 'ventana' + (v.ancha ? ' ancha' : '');
    vent.innerHTML =
      '<header><div><h2>' + esc(v.titulo) + '</h2>' +
      (v.sub ? '<div class="sub">' + esc(v.sub) + '</div>' : '') +
      '</div><div class="espacio"></div>' +
      (i > 0 ? '<button class="cerrar" title="Cerrar esta ventana">✕</button>' : '') +
      '</header><div class="cuerpo"></div>';

    const cerrar = $('.cerrar', vent);
    if (cerrar) cerrar.onclick = cerrarUltima;

    const cuerpo = $('.cuerpo', vent);
    try { v.dibujar(cuerpo, v.ctx); } catch (e) { errorEnVentana(cuerpo, e); }
    lienzo.appendChild(vent);
  });

  /* La ventana activa siempre a la vista, aunque haya muchos lomos. */
  requestAnimationFrame(() => { lienzo.scrollLeft = lienzo.scrollWidth; });
}

function pintarLomos() { /* los lomos no cambian al refrescar el cuerpo */ }

function errorEnVentana(cuerpo, e) {
  console.error(e);
  cuerpo.innerHTML =
    '<div class="alerta alto"><b>Esta ventana no se pudo dibujar</b>' +
    '<p>' + esc(e && e.message ? e.message : String(e)) + '</p>' +
    '<p class="nota">El resto de la aplicación sigue funcionando y los datos están a salvo. ' +
    'Cerrá esta ventana y volvé a intentarlo.</p></div>';
}

/* =========================================================================
   CONSTRUCTORES DE PIEZAS
   -------------------------------------------------------------------------
   Funciones cortas que devuelven HTML. Estan aca y no en cada modulo para
   que todas las ventanas se parezcan entre si sin tener que acordarse de
   las clases de CSS.
   ========================================================================= */

/* Superficie tocable: reemplaza al boton. */
function superficie(titulo, detalle, alTocar, clase) {
  const n = document.createElement('div');
  n.className = 'superficie' + (clase ? ' ' + clase : '');
  n.innerHTML = '<b>' + esc(titulo) + '</b>' +
                (detalle ? '<small>' + esc(detalle) + '</small>' : '');
  n.onclick = alTocar;
  return n;
}

function bloque(titulo, contenidoHTML) {
  return '<div class="bloque">' + (titulo ? '<h3>' + esc(titulo) + '</h3>' : '') +
         contenidoHTML + '</div>';
}

function marca(texto, color) {
  return '<span class="marca-txt m-' + (color || 'neutro') + '">' + esc(texto) + '</span>';
}

function dato(rotulo, valor) {
  return '<dl class="dato"><dt>' + esc(rotulo) + '</dt><dd>' +
         (valor == null || valor === '' ? '—' : valor) + '</dd></dl>';
}

function vacio(titulo, texto) {
  return '<div class="vacio"><b>' + esc(titulo) + '</b><p>' + esc(texto) + '</p></div>';
}

/* Envuelve cualquier contenido con la marca de "esto lo propuso la app". */
function cajaSugerencia(titulo, contenidoHTML, sinAviso) {
  return '<div class="sugerido"><div class="cabeza">◇ ' + esc(titulo) + '</div>' +
    contenidoHTML +
    (sinAviso ? '' : '<div class="pie-aviso">' + esc(AVISO_SUGERENCIA) + '</div>') +
    '</div>';
}

/* Grupo de opciones que se marcan tocandolas. */
function opciones(nodo, lista, seleccion, alCambiar, multiple) {
  const cont = document.createElement('div');
  cont.className = 'opciones';
  const sel = new Set(multiple ? (seleccion || []) : (seleccion != null ? [seleccion] : []));

  /* El grupo se repinta A SI MISMO al tocarlo.

     Antes solo avisaba hacia afuera y daba por sentado que quien lo usaba iba
     a redibujar la pantalla. Donde eso no pasaba —los descriptores del dolor,
     entre otros— el dato se guardaba bien pero la opcion no se marcaba: el
     paciente tocaba "Quemante", no veia ningun cambio, y volvia a tocar, con
     lo cual la desmarcaba. Peor que no funcionar: funcionaba al reves de lo
     que se veia. */
  function pintar() {
    cont.innerHTML = '';
    for (const o of lista) {
      const valor = o.v !== undefined ? o.v : o;
      const texto = o.t !== undefined ? o.t : o;
      const b = document.createElement('div');
      b.className = 'op' + (sel.has(valor) ? ' on' : '') +
                    (o.clase ? ' ' + o.clase : '');
      b.textContent = texto;
      b.onclick = () => {
        if (multiple) {
          sel.has(valor) ? sel.delete(valor) : sel.add(valor);
          pintar();
          alCambiar([...sel]);
        } else {
          const nuevo = sel.has(valor) ? null : valor;
          sel.clear();
          if (nuevo != null) sel.add(nuevo);
          pintar();
          alCambiar(nuevo);
        }
      };
      cont.appendChild(b);
    }
  }
  pintar();

  nodo.appendChild(cont);
  return cont;
}

/* Escala numerica 0 a 10 con el color del semaforo del dolor. */
function escalaNRS(nodo, valor, alCambiar, etiquetas) {
  const cont = document.createElement('div');
  cont.className = 'nrs';

  /* La escala se repinta A SI MISMA. Antes avisaba hacia afuera y quien la
     usaba rehacia la pantalla entera, con lo cual el paciente elegia un
     numero y la pagina lo devolvia al principio: tenia que volver a bajar con
     el dedo por cada una de las cuatro intensidades. */
  let actual = valor;

  function pintar() {
    cont.innerHTML = '';
    for (let i = 0; i <= 10; i++) {
      const n = document.createElement('div');
      n.className = 'n' + (actual === i ? ' on' : '');
      n.textContent = i;
      if (actual === i) {
        const c = colorDolor(i);
        n.style.background = i === 0 ? 'var(--verde)' : c.color;
        n.style.color = i >= 3 && i <= 6 ? '#3a2c00' : '#fff';
      }
      n.onclick = () => {
        actual = (actual === i) ? null : i;
        pintar();
        alCambiar(actual);
      };
      cont.appendChild(n);
    }
  }
  pintar();

  nodo.appendChild(cont);
  const pie = document.createElement('div');
  pie.className = 'nrs-pie';
  const e = etiquetas || ['sin dolor', 'el peor dolor imaginable'];
  pie.innerHTML = '<span>' + esc(e[0]) + '</span><span>' + esc(e[1]) + '</span>';
  nodo.appendChild(pie);
  return cont;
}

/* Campo de texto conectado a un objeto. Guarda al salir del campo, no en
   cada tecla: escribir no debe disparar una escritura en la nube por letra. */
function campo(nodo, rotulo, obj, clave, opciones) {
  const o = opciones || {};
  const cont = document.createElement('div');
  cont.className = 'campo';
  const id = 'c_' + Math.random().toString(36).slice(2, 8);
  const etiqueta = rotulo ? '<label for="' + id + '">' + esc(rotulo) + '</label>' : '';
  const valor = esc(obj[clave] == null ? '' : obj[clave]);

  if (o.area) {
    cont.innerHTML = etiqueta + '<textarea id="' + id + '" rows="' + (o.filas || 3) + '" ' +
      'placeholder="' + esc(o.pista || '') + '">' + valor + '</textarea>';
  } else if (o.lista) {
    const ops = o.lista.map(x => {
      const v = x.v !== undefined ? x.v : x, t = x.t !== undefined ? x.t : x;
      return '<option value="' + esc(v) + '"' + (String(obj[clave]) === String(v) ? ' selected' : '') +
             '>' + esc(t) + '</option>';
    }).join('');
    cont.innerHTML = etiqueta + '<select id="' + id + '"><option value="">— elegir —</option>' + ops + '</select>';
  } else {
    cont.innerHTML = etiqueta + '<input id="' + id + '" type="' + (o.tipo || 'text') + '" ' +
      'value="' + valor + '" placeholder="' + esc(o.pista || '') + '"' +
      (o.max != null ? ' max="' + o.max + '"' : '') + '>';
  }
  if (o.ayuda) cont.insertAdjacentHTML('beforeend', '<div class="ayuda">' + esc(o.ayuda) + '</div>');

  const control = $('#' + id, cont);
  const guardar = () => {
    obj[clave] = control.value;
    if (o.alCambiar) o.alCambiar(control.value);
  };
  control.addEventListener('change', guardar);
  control.addEventListener('blur', guardar);
  nodo.appendChild(cont);
  return control;
}

/* Confirmacion propia, para no usar el confirm() del navegador en acciones
   que borran cosas. */
function confirmar(titulo, texto, alAceptar, textoBoton) {
  const capa = document.createElement('div');
  capa.className = 'selector-dolor';
  capa.innerHTML =
    '<div><h3 style="font-size:16px;margin-bottom:8px">' + esc(titulo) + '</h3>' +
    '<p class="nota" style="margin-bottom:16px">' + esc(texto) + '</p>' +
    '<div class="fila"><div class="superficie peligro" data-si><b>' +
    esc(textoBoton || 'Sí, continuar') + '</b></div>' +
    '<div class="superficie" data-no><b>Cancelar</b></div></div></div>';
  capa.querySelector('[data-si]').onclick = () => { capa.remove(); alAceptar(); };
  capa.querySelector('[data-no]').onclick = () => capa.remove();
  capa.onclick = e => { if (e.target === capa) capa.remove(); };
  document.body.appendChild(capa);
}
