/* =========================================================================
   ESTADISTICAS, BIBLIOTECA, AJUSTES E IMPRESION
   ========================================================================= */
'use strict';

/* ====================================================== ESTADISTICAS ==== */

function ventanaEstadisticas() {
  abrir({id:'stats', titulo:'Estadísticas del consultorio', ancha:true, dibujar(c) {
    const ps = pacientesReales().filter(p => p.ambito !== 'agudo');
    if (!ps.length) {
      c.innerHTML = vacio('Todavía no hay datos', 'Las estadísticas aparecen cuando haya ' +
        'pacientes con evoluciones registradas.');
      return;
    }

    /* --- efectividad global --------------------------------------------- */
    const efs = ps.map(p => efectividadPaciente(p)).filter(e => e.porcentaje != null);
    const promedio = efs.length ? Math.round(efs.reduce((s, e) => s + e.porcentaje, 0) / efs.length) : null;
    const respondedores = efs.filter(e => e.porcentaje >= 30).length;
    const sustanciales = efs.filter(e => e.porcentaje >= 50).length;

    c.insertAdjacentHTML('beforeend',
      '<div class="bloque" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">' +
      anilloEfectividad(promedio, 80) +
      '<div style="flex:1;min-width:180px"><h3 style="margin-bottom:6px">Efectividad promedio</h3>' +
      '<p class="nota">' + efs.length + ' pacientes con datos suficientes para medir.<br>' +
      '<b>' + respondedores + '</b> alcanzaron el umbral clínicamente relevante (≥30%).<br>' +
      '<b>' + sustanciales + '</b> alcanzaron respuesta sustancial (≥50%).</p></div></div>');

    /* --- reparto por banda ---------------------------------------------- */
    const bandas = {};
    for (const e of efs) bandas[e.banda.clave] = (bandas[e.banda.clave] || 0) + 1;
    let hb = '';
    for (const b of BANDAS_EFECTIVIDAD) {
      const n = bandas[b.clave] || 0;
      const pct = efs.length ? Math.round((n / efs.length) * 100) : 0;
      hb += '<div style="margin-bottom:8px"><div style="display:flex;gap:8px;font-size:13.5px">' +
            '<span style="flex:1">' + esc(b.etiqueta) + '</span><b>' + n + '</b>' +
            '<span class="nota">' + pct + '%</span></div>' +
            '<div class="barra-pct"><i style="width:' + pct + '%;background:' + b.color + '"></i></div></div>';
    }
    c.insertAdjacentHTML('beforeend', bloque('Reparto de resultados', hb));

    /* --- diagnósticos más frecuentes ------------------------------------ */
    const dx = {};
    for (const p of ps) {
      const d = (p.diagnostico && p.diagnostico.sindrome) || 'Sin diagnóstico';
      dx[d] = (dx[d] || 0) + 1;
    }
    const ordenDx = Object.entries(dx).sort((a, b) => b[1] - a[1]).slice(0, 12);
    c.insertAdjacentHTML('beforeend', bloque('Diagnósticos',
      ordenDx.map(([d, n]) => dato(esc(d), '<b>' + n + '</b> <span class="nota">' +
        Math.round((n / ps.length) * 100) + '%</span>')).join('')));

    /* --- mecanismos ------------------------------------------------------ */
    const mec = {};
    for (const p of ps) {
      const m = (p.diagnostico && p.diagnostico.mecanismo) || 'sin definir';
      mec[m] = (mec[m] || 0) + 1;
    }
    c.insertAdjacentHTML('beforeend', bloque('Mecanismo predominante',
      Object.entries(mec).sort((a, b) => b[1] - a[1])
        .map(([m, n]) => dato(esc(m), '<b>' + n + '</b>')).join('')));

    /* --- carga opioide del consultorio ----------------------------------- */
    const mmes = ps.map(p => {
      const ops = (p.medicacion || [])
        .filter(m => FARMACOS[m.farmaco] && FARMACOS[m.farmaco].grupo === 'Opioide')
        .map(m => ({id:m.farmaco, mgDia:mgDiariosDe(m), mcgHora:mcgHoraDe(m)}));
      return {p, mme:calcularMME(ops).total};
    }).filter(x => x.mme > 0).sort((a, b) => b.mme - a.mme);

    c.insertAdjacentHTML('beforeend', bloque('Carga opioide del consultorio',
      dato('Pacientes con opioide', '<b>' + mmes.length + '</b> de ' + ps.length +
        ' <span class="nota">(' + Math.round((mmes.length / ps.length) * 100) + '%)</span>') +
      dato('Con 50 MME/día o más', '<b>' + mmes.filter(x => x.mme >= 50).length + '</b>') +
      dato('Con 90 MME/día o más', '<b>' + mmes.filter(x => x.mme >= 90).length + '</b> ' +
        (mmes.filter(x => x.mme >= 90).length ? marca('revisar indicación', 'rojo') : '')) +
      (mmes.length
        ? '<div style="margin-top:10px">' + mmes.slice(0, 8).map(x =>
            dato(esc(nombreCompleto(x.p)), '<b>' + x.mme + '</b> MME/día ' +
              marca(calcularMME([{id:'morfina', mgDia:x.mme}]).nivel,
                    x.mme >= 90 ? 'rojo' : x.mme >= 50 ? 'ambar' : 'lima'))).join('') + '</div>'
        : '')));

    /* --- escalas y adherencia al registro -------------------------------- */
    const conMapa = ps.filter(p => (p.dolor.mapa || []).length).length;
    const conDN4 = ps.filter(p => p.escalas && p.escalas.dn4).length;
    const conPGIC = ps.filter(p => p.escalas && p.escalas.pgic).length;
    const conControl = ps.filter(p => (p.evoluciones || []).length).length;
    c.insertAdjacentHTML('beforeend', bloque('Calidad del registro',
      dato('Con mapa corporal', conMapa + ' / ' + ps.length) +
      dato('Con DN4', conDN4 + ' / ' + ps.length) +
      dato('Con PGIC (medida de resultado)', conPGIC + ' / ' + ps.length) +
      dato('Con al menos un control', conControl + ' / ' + ps.length) +
      '<p class="nota" style="margin-top:9px">El PGIC es el que más suele faltar y el que más ' +
      'pesa para medir efectividad. Toma quince segundos y cambia por completo la calidad ' +
      'del seguimiento.</p>'));

    /* --- pendientes ------------------------------------------------------- */
    const vencidos = ps.filter(p => p.proximoControl && p.proximoControl < hoy());
    if (vencidos.length) {
      c.insertAdjacentHTML('beforeend',
        '<div class="alerta medio"><b>' + vencidos.length + ' paciente' +
        (vencidos.length === 1 ? '' : 's') + ' con control vencido</b><p>' +
        esc(vencidos.slice(0, 10).map(p => nombreCompleto(p) + ' (' + fechaCorta(p.proximoControl) + ')').join(' · ')) +
        '</p></div>');
    }
  }});
}

/* ====================================================== BIBLIOTECA ====== */

function ventanaBiblioteca() {
  abrir({id:'biblio', titulo:'Biblioteca', sub:'Todo el conocimiento que usa el motor', dibujar(c) {
    c.appendChild(superficie('Síndromes de dolor', SINDROMES.length + ' cuadros con criterios, ' +
      'estudios, tratamiento y controles', () => ventanaListaSindromes(), 'suave'));
    c.appendChild(superficie('Vademécum', Object.keys(FARMACOS).length + ' fármacos con dosis, ' +
      'titulación, ajustes e interacciones', () => ventanaListaFarmacos(), 'suave'));
    c.appendChild(superficie('Procedimientos', Object.keys(PROCEDIMIENTOS).length +
      ' técnicas con indicación, complicaciones y consentimiento', () => ventanaListaProcedimientos(), 'suave'));
    c.appendChild(superficie('Escalas', Object.keys(ESCALAS).length +
      ' instrumentos validados con sus puntos de corte', () => ventanaListaEscalas(), 'suave'));
    c.appendChild(superficie('Calculadora de equivalentes de morfina',
      'Suma la carga opioide total y avisa de los umbrales', ventanaCalculadoraMME, 'suave'));
    c.appendChild(superficie('Suspensión de anticoagulantes',
      'Plazos según el riesgo de sangrado del procedimiento', () => {
        abrir({id:'anticoag', titulo:'Anticoagulación', ancha:true, dibujar(cc) {
          for (const riesgo of ['alto', 'intermedio', 'bajo']) {
            cc.insertAdjacentHTML('beforeend', bloque('Procedimiento de riesgo ' + riesgo,
              Object.values(ANTICOAGULACION).map(a =>
                dato(esc(a.nombre), esc(a[riesgo]))).join('')));
          }
          cc.insertAdjacentHTML('beforeend',
            '<div class="alerta alto"><b>Antes de usar esta tabla</b><p>' +
            esc(NOTA_ANTICOAGULACION) + '</p></div>');
        }});
      }, 'suave'));
  }});
}

function ventanaListaSindromes() {
  abrir({id:'lsx', titulo:'Síndromes de dolor', ancha:true, ctx:{q:''}, dibujar(c, ctx) {
    const b = document.createElement('div');
    b.className = 'campo';
    b.innerHTML = '<input type="text" placeholder="Buscar síndrome" value="' + esc(ctx.q) + '">';
    c.appendChild(b);
    const lista = document.createElement('div');
    c.appendChild(lista);
    $('input', b).oninput = e => { ctx.q = e.target.value; pintar(); };
    function pintar() {
      lista.innerHTML = '';
      const q = normalizar(ctx.q);
      const grupos = {};
      for (const s of SINDROMES) {
        if (q && !normalizar(s.nombre + ' ' + s.grupo + ' ' + s.resumen).includes(q)) continue;
        (grupos[s.grupo] = grupos[s.grupo] || []).push(s);
      }
      for (const [g, ss] of Object.entries(grupos)) {
        lista.insertAdjacentHTML('beforeend',
          '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
          'color:var(--tinta-3);margin:16px 0 7px">' + esc(g) + '</h3>');
        for (const s of ss) {
          lista.appendChild(superficie(s.nombre, s.icd.cod + ' · ' + s.mecanismo,
                                       () => ventanaSindrome(s.id, null), 'fina'));
        }
      }
      if (!Object.keys(grupos).length) lista.innerHTML = vacio('Sin resultados', 'Probá con otra palabra.');
    }
    pintar();
  }});
}

function ventanaListaFarmacos() {
  abrir({id:'lfar', titulo:'Vademécum de dolor', ancha:true, dibujar(c) {
    const grupos = {};
    for (const [k, f] of Object.entries(FARMACOS)) (grupos[f.grupo] = grupos[f.grupo] || []).push({k, f});
    for (const [g, ff] of Object.entries(grupos)) {
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:16px 0 7px">' + esc(g) + '</h3>');
      for (const {k, f} of ff) {
        c.appendChild(superficie(f.nombre, f.evidencia.linea,
                                 () => ventanaFarmaco(k, null), 'fina'));
      }
    }
  }});
}

function ventanaListaProcedimientos() {
  abrir({id:'lproc', titulo:'Procedimientos', ancha:true, dibujar(c) {
    const grupos = {};
    for (const [k, p] of Object.entries(PROCEDIMIENTOS)) (grupos[p.grupo] = grupos[p.grupo] || []).push({k, p});
    for (const [g, pp] of Object.entries(grupos)) {
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:16px 0 7px">' + esc(g) + '</h3>');
      for (const {k, p} of pp) {
        c.appendChild(superficie(p.nombre, p.proposito + ' · riesgo de sangrado ' + p.riesgoSangrado,
                                 () => ventanaProcedimiento(k, null), 'fina'));
      }
    }
  }});
}

function ventanaListaEscalas() {
  abrir({id:'lesc', titulo:'Escalas e instrumentos', ancha:true, dibujar(c) {
    const dominios = {};
    for (const [k, e] of Object.entries(ESCALAS)) (dominios[e.dominio] = dominios[e.dominio] || []).push({k, e});
    for (const [d, ee] of Object.entries(dominios)) {
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:16px 0 7px">' + esc(d) + '</h3>');
      for (const {k, e} of ee) {
        c.appendChild(superficie(e.sigla + ' — ' + e.nombre,
          e.minutos + ' min · lo completa ' + e.quien + (e.corteClave ? ' · corte ' + e.corteClave : ''),
          () => {
            abrir({id:'fesc_' + k, titulo:e.sigla, sub:e.nombre, ancha:true, dibujar(cc) {
              if (e.enunciado) cc.insertAdjacentHTML('beforeend', '<p>' + esc(e.enunciado) + '</p>');
              if (e.regla) cc.insertAdjacentHTML('beforeend',
                '<div class="alerta info"><b>Cómo se lee</b><p>' + esc(e.regla) + '</p></div>');
              if (e.cortes) cc.insertAdjacentHTML('beforeend', bloque('Puntos de corte',
                e.cortes.map(x => dato('hasta ' + x.hasta, marca(x.etiqueta, x.color) +
                  (x.nota ? '<div class="nota" style="margin-top:4px">' + esc(x.nota) + '</div>' : ''))).join('')));
              const items = e.items || (e.secciones || []).map(s => ({t:s}));
              cc.insertAdjacentHTML('beforeend', bloque('Ítems',
                '<ol style="margin:0;padding-left:20px;font-size:13.5px">' +
                items.map(i => '<li style="margin-bottom:4px">' + esc(i.t) + '</li>').join('') + '</ol>'));
              cc.insertAdjacentHTML('beforeend',
                '<p class="nota" style="margin-top:12px">' + esc(e.fuente || '') + '</p>');
            }});
          }, 'fina'));
      }
    }
  }});
}

function ventanaCalculadoraMME() {
  abrir({id:'mme', titulo:'Equivalentes de morfina', ancha:true, ctx:{lista:[]}, dibujar(c, ctx) {
    const zona = document.createElement('div');
    c.appendChild(zona);
    const salida = document.createElement('div');
    c.appendChild(salida);

    const opioides = Object.entries(FARMACOS).filter(([, f]) => f.grupo === 'Opioide');

    function pintar() {
      zona.innerHTML = '';
      ctx.lista.forEach((o, i) => {
        const caja = document.createElement('div');
        caja.className = 'bloque';
        caja.style.marginBottom = '8px';
        const cf = document.createElement('div');
        cf.className = 'campo';
        cf.innerHTML = '<label>Opioide</label>';
        caja.appendChild(cf);
        const sel = document.createElement('select');
        sel.innerHTML = '<option value="">— elegir —</option>' + opioides.map(([k, f]) =>
          '<option value="' + k + '"' + (o.id === k ? ' selected' : '') + '>' + esc(f.nombre) + '</option>').join('') +
          '<option value="metadona"' + (o.id === 'metadona' ? ' selected' : '') + '>Metadona</option>';
        sel.onchange = () => { o.id = sel.value; calcular(); };
        cf.appendChild(sel);
        const esParche = o.id === 'fentanilo_td' || o.id === 'buprenorfina_td';
        campo(caja, esParche ? 'Microgramos por hora del parche' : 'Miligramos por día (total)',
              o, esParche ? 'mcgHora' : 'mgDia', {tipo:'number', alCambiar:calcular});
        caja.appendChild(superficie('Quitar', null, () => {
          ctx.lista.splice(i, 1); pintar(); calcular();
        }, 'fina peligro'));
        zona.appendChild(caja);
      });
      zona.appendChild(superficie('+ Agregar opioide', null, () => {
        ctx.lista.push({id:'', mgDia:0, mcgHora:0}); pintar();
      }, 'suave'));
    }

    function calcular() {
      const r = calcularMME(ctx.lista);
      salida.innerHTML =
        '<div class="bloque" style="border-left:3px solid var(--' + r.color + ')">' +
        '<h3>Total</h3><div style="font-size:32px;font-weight:700;letter-spacing:-.02em">' +
        r.total + ' <span style="font-size:15px;color:var(--tinta-3)">MME/día</span></div>' +
        '<div style="margin:6px 0">' + marca(r.nivel, r.color) + '</div>' +
        (r.aviso ? '<p class="nota">' + esc(r.aviso) + '</p>' : '') +
        (r.detalle.length ? '<div style="margin-top:10px">' + r.detalle.map(d =>
          dato(esc((FARMACOS[d.id] || {}).nombre || d.id), d.mme + ' MME')).join('') + '</div>' : '') +
        '<div class="alerta alto" style="margin-top:12px"><b>Antes de usar esto para rotar</b>' +
        '<p>' + esc(r.nota) + ' Al rotar de un opioide a otro hay que reducir entre 25% y 50% la ' +
        'dosis equianalgésica calculada, por tolerancia cruzada incompleta. Con metadona la ' +
        'reducción es mucho mayor y la conversión no es lineal.</p></div></div>';
    }

    pintar(); calcular();
  }});
}

/* ====================================================== AJUSTES ========= */

function ventanaAjustes() {
  abrir({id:'ajustes', titulo:'Ajustes', ancha:true, dibujar(c) {
    /* Si quedaron restos del diagnostico, es lo PRIMERO que hay que ver: son
       filas tecnicas que ensucian el contador de pacientes. */
    const restos = contarRestos();
    const cuantos = Object.values(restos).reduce((a, b) => a + b, 0);
    if (cuantos) {
      c.insertAdjacentHTML('beforeend',
        '<div class="alerta alto"><b>Hay ' + cuantos + ' registros de prueba en la base</b>' +
        '<p>Los dejó el diagnóstico de conexión. No son pacientes: son filas técnicas ' +
        'con una marca interna, y ya no se cuentan ni se muestran en ningún lado. ' +
        'Igual conviene borrarlas.</p>' +
        '<p class="nota">' + esc(Object.entries(restos)
          .map(([r, n]) => n + ' en ' + r).join(' · ')) + '</p></div>');
      c.appendChild(superficie('Borrar los ' + cuantos + ' registros de prueba',
        'No toca ningún paciente real', () => {
          /* El cartel de "estoy borrando" se pide con veinte segundos porque
             nadie sabe cuánto va a tardar, pero casi siempre termina en menos
             de uno. Sin bajarlo a mano al terminar, el cartel se quedaba en
             pantalla anunciando un borrado que ya había terminado hacía
             quince segundos, y parecía que la aplicación se había colgado.
             Por eso se guardan los textos exactos: para poder cerrarlos. */
          const enCurso = 'Borrando ' + cuantos + ' registros…';
          const bajarCarteles = () => { cerrarAviso(enCurso); cerrarAviso(/^Borrando… lote /); };
          avisar(enCurso, 'aviso', 20000);
          limpiarRestos((hechos, total) => {
            if (total > 1) avisar('Borrando… lote ' + hechos + ' de ' + total, 'aviso', 3000);
          }).then(r => {
            bajarCarteles();
            if (r.lotesFallados) {
              avisar('Se borraron ' + r.total + ' registros de este dispositivo, pero ' +
                     r.lotesFallados + ' de ' + r.lotes + ' lotes no se pudieron borrar del ' +
                     'servidor. Volvé a tocar el botón para reintentar.', 'error', 14000);
            } else {
              avisar('Listo: se borraron ' + r.total + ' registros de prueba.', 'ok', 8000);
            }
            refrescar();
          }).catch(e => {
            console.error(e);
            bajarCarteles();
            avisar('No se pudo completar la limpieza. Probá de nuevo.', 'error');
            refrescar();
          });
        }, 'acento'));
    }

    /* EL ESTADO, PLEGADO.

       Ocho renglones de diagnostico tecnico encabezando la pantalla de
       ajustes le decian al que entra que lo primero que tiene que mirar es
       si la base sincroniza, y no es cierto: eso se mira el dia que algo
       falla, y ese dia se abre. El resto de los dias alcanza con una linea
       que diga que todo esta en orden. Va con <details>, que es del propio
       navegador: se pliega y se despliega sin una linea de JavaScript y sin
       que haya que acordarse en que estado quedo. */
    const enOrden = ESTADO.conectado || !firebaseConfigurado();
    c.insertAdjacentHTML('beforeend',
      '<details class="plegable">' +
      '<summary><span class="plegable-t">Estado de la aplicación</span>' +
      '<span class="plegable-r">' +
      marca(ESTADO.conectado ? 'en la nube'
            : firebaseConfigurado() ? 'sin conexión' : 'solo este dispositivo',
            enOrden ? 'verde' : 'ambar') +
      '<span class="plegable-v">' + esc(window.ALGOS_BUILD || '—') + '</span>' +
      '</span></summary>' +
      '<div class="plegable-c">' +
      dato('Sincronización', ESTADO.conectado
        ? marca('conectada a la nube', 'verde')
        : marca(firebaseConfigurado() ? 'sin conexión' : 'solo este dispositivo', 'ambar')) +
      dato('Sesión', ESTADO.usuario && ESTADO.usuario.uid
        ? esc(ESTADO.usuario.email)
        : marca('modo local, sin cuenta', 'ambar') +
          '<div class="nota">Los datos quedan solo en este dispositivo. Para entrar con ' +
          'cuenta y sincronizar hay que configurar Firebase (PUBLICAR.md, pasos 2 a 4).</div>') +
      dato('Envío de correo', envioConfigurado()
        ? marca('configurado', 'verde') : marca('sin configurar', 'ambar')) +
      dato('Pacientes', Object.keys(ESTADO.pacientes).length) +
      dato('Cuestionarios del portal', Object.keys(ESTADO.precargas).length) +
      dato('Tu rol', (() => { const m = miembroActual();
        return m ? marca((ROLES[m.rol] || {}).nombre || m.rol, 'acento') +
                   '<div class="nota">' + esc((ROLES[m.rol] || {}).detalle || '') + '</div>'
                 : marca('sin equipo (modo local)', 'neutro'); })()) +
      dato('Versión', window.ALGOS_BUILD || '—') +
      '</div></details>');

    if (firebaseConfigurado()) {
      c.appendChild(superficie('Diagnóstico de conexión',
        'Si algo no se guarda, esto dice exactamente por qué', ventanaRevision, 'fina'));
    }

    c.appendChild(superficie('Forzar actualización',
      'Si ves una versión vieja aunque hayas subido una nueva', () => {
        confirmar('Forzar actualización',
          'Se borra la copia que el navegador guardó de la aplicación y se vuelve a ' +
          'descargar desde cero. Los pacientes NO se tocan: están en la nube y en el ' +
          'almacenamiento de este dispositivo, que es otra cosa distinta.',
          forzarActualizacion, 'Sí, actualizar');
      }, 'fina'));

    if (firebaseConfigurado()) {
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:18px 0 8px">Equipo</h3>');
      const n = Object.keys(ESTADO.equipo || {}).length;
      const pend = Object.values(ESTADO.invitaciones || {}).filter(i => i && !i.usada).length;
      c.appendChild(superficie('Quién puede entrar',
        n + ' miembro' + (n === 1 ? '' : 's') +
        (pend ? ' · ' + pend + ' invitación' + (pend === 1 ? '' : 'es') + ' sin usar' : '') +
        (esTitular() ? ' · podés invitar' : ''),
        ventanaEquipo, 'suave'));
    }

    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
      'color:var(--tinta-3);margin:18px 0 8px">Copia de seguridad</h3>' +
      '<p class="nota" style="margin-bottom:10px">Un archivo con TODA la base: pacientes, ' +
      'cuestionarios del portal, agenda y configuración. Conviene bajarlo una vez por semana ' +
      'y guardarlo fuera de esta computadora. Es una historia clínica: tratalo como tal.</p>' +
      /* Las tres preguntas que se hace cualquiera antes de tocar un boton que
         dice "copia de seguridad": que baja, adonde va y como es por dentro.
         Contestarlas aca evita la unica respuesta peligrosa, que es no
         hacer la copia por no saber que iba a pasar. */
      '<div class="bloque" style="margin-bottom:10px">' +
      dato('Qué contiene', 'Todos los pacientes con su historia completa, los cuestionarios ' +
        'del portal, la agenda y la configuración del consultorio. No incluye las cuentas ' +
        'del equipo ni las claves.') +
      dato('Dónde se guarda', 'En la carpeta de descargas de <b>esta</b> computadora, como ' +
        'cualquier archivo bajado del navegador. No se sube a ningún lado: de ahí hay que ' +
        'moverlo a un pendrive o a un disco externo.') +
      dato('En qué formato', 'Un archivo <b>.json</b> de texto, llamado <span class="mono">' +
        esc(normalizar(MARCA.nombre).replace(/[^a-z0-9]+/g, '-')) +
        '-respaldo-' + esc(hoy()) + '.json</span>. Se abre con cualquier editor de texto y ' +
        'lo lee la propia aplicación al restaurar.') +
      dato('Sin cifrar', '<b>El archivo no tiene contraseña.</b> Cualquiera que lo abra lee ' +
        'las historias clínicas enteras. Guardalo como guardarías la carpeta de papel: bajo ' +
        'llave, y no en una carpeta compartida ni en un correo.') +
      '</div>');
    c.appendChild(superficie('Descargar copia de seguridad',
      'Un archivo .json a la carpeta de descargas de esta computadora',
      exportarRespaldo, 'suave'));

    const importar = superficie('Restaurar desde una copia',
      'Se elige un archivo .json bajado antes; los pacientes repetidos se sobrescriben', () => {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = '.json,application/json';
        inp.onchange = () => { if (inp.files[0]) importarRespaldo(inp.files[0]); };
        inp.click();
      }, 'fina');
    c.appendChild(importar);

    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
      'color:var(--tinta-3);margin:18px 0 8px">Pacientes de prueba</h3>' +
      '<p class="nota" style="margin-bottom:10px">Seis historias inventadas que entre todas ' +
      'recorren toda la aplicación: radiculopatía, fibromialgia, dolor oncológico, síndrome ' +
      'de dolor regional complejo, síndrome facetario con radiofrecuencia y un postoperatorio ' +
      'de toracotomía, más un cuestionario del portal sin tomar. Sirven para conocerla sin ' +
      'cargar nada y para probar cambios sin tocar pacientes reales.</p>');
    if (hayDemo()) {
      c.appendChild(superficie('Quitar los pacientes de prueba',
        'Solo borra los marcados como prueba; los pacientes reales no se tocan', () => {
          confirmar('Quitar los pacientes de prueba',
            'Se borran únicamente los seis pacientes de demostración y el cuestionario ' +
            'de prueba. Ningún paciente real se ve afectado.', quitarDemo, 'Sí, quitarlos');
        }, 'fina peligro'));
    } else {
      c.appendChild(superficie('Cargar los pacientes de prueba',
        'Seis historias completas más un cuestionario del portal', cargarDemo, 'suave'));
    }

    /* La superficie de cerrar sesion solo aparece cuando HAY una sesion de
       verdad. En modo local no hay ninguna, y un boton que no hace nada al
       tocarlo es peor que no tenerlo. */
    if (fbAuth && ESTADO.usuario && ESTADO.usuario.uid) {
      c.insertAdjacentHTML('beforeend', '<div style="height:16px"></div>');
      c.appendChild(superficie('Cerrar sesión', esc(ESTADO.usuario.email), () => {
        fbAuth.signOut()
          .then(() => location.reload())
          .catch(() => avisar('No se pudo cerrar la sesión.', 'error'));
      }, 'fina peligro'));
    }

    c.insertAdjacentHTML('beforeend',
      '<p class="nota" style="margin-top:22px;padding-top:14px;border-top:1px solid var(--linea)">' +
      '<b>' + esc(MARCA.nombre) + '</b> — ' + esc(MARCA.bajada) + '<br>' +
      'Todo el contenido clínico de esta aplicación es material de consulta y no reemplaza el ' +
      'juicio del médico tratante. Las referencias de cada recomendación están en la ficha ' +
      'de cada síndrome, fármaco y procedimiento.</p>');
  }});
}

/* =========================================================================
   LA HISTORIA CLINICA, IMPRESA
   -------------------------------------------------------------------------
   Es el unico documento de la aplicacion que sale para OTRO MEDICO: se
   adjunta a una derivacion, se lleva a una junta, se archiva en la carpeta
   de papel. Eso manda sobre todas las decisiones de diseño y las hace casi
   opuestas a las del resumen para el paciente.

     · DENSIDAD ANTES QUE AIRE. Al colega no hay que explicarle nada, hay que
       darle todo y que lo encuentre rapido. Cuerpo de 9,3 puntos y datos en
       dos columnas: entra el triple por carilla y se lee igual de bien.
     · LO URGENTE, PRIMERO. Las banderas rojas y los reparos de seguridad van
       arriba de todo, antes que la filiacion. Una bandera roja escondida en
       la pagina cuatro es una bandera roja que nadie vio.
     · LOS NUMEROS, DIBUJADOS. La intensidad, la concordancia de cada
       diferencial, el puntaje de cada escala y la efectividad van con su
       barra. Un 7/10 escrito y un 7/10 dibujado tardan lo mismo en
       imprimirse y no tardan lo mismo en leerse.
     · QUE NO SE PARTA. Cada tarjeta lleva break-inside:avoid: una tabla de
       medicacion cortada al medio por un salto de pagina obliga a dar vuelta
       la hoja para leer una dosis, y asi es como se lee mal una dosis.

   Antes esto salia como texto plano con lineas de igual: cuatro carillas de
   renglones identicos donde encontrar el filtrado glomerular era cuestion de
   suerte.
   ========================================================================= */

function imprimirHistoria(id) {
  const p = ESTADO.pacientes[id];
  if (!p) return;
  const a = analizar(p);
  const ef = efectividadPaciente(p);

  const A = '#2d6a72', AT = '#1d4a50', ACL = '#e8f2f3';
  const TINTA = '#141821', SUAVE = '#4a5364', TENUE = '#7d8698', LINEA = '#dde1e9';
  const VERDE = '#2f9e5f', LIMA = '#7fb32e', AMBAR = '#d9a406',
        NARANJA = '#f2711c', ROJO = '#d92b2b', VIOLETA = '#7c5cc4';

  const H = [];
  const T = x => esc(x == null || x === '' ? '—' : x);

  /* ------------------------------------------------------- ladrillos --- */

  let nSec = 0;
  const seccion = titulo => {
    nSec++;
    H.push('<h2><span class="n">' + nSec + '</span>' + esc(titulo) + '</h2>');
  };

  const abrirTarjeta = clase => H.push('<div class="t' + (clase ? ' ' + clase : '') + '">');
  const cerrarTarjeta = () => H.push('</div>');

  /* Los datos van en dos columnas y no en renglones sueltos: el rotulo
     siempre en el mismo lugar es lo que permite barrer la hoja con la vista
     buscando uno solo, que es como se lee una historia ajena. */
  const filas = pares => {
    const vivas = pares.filter(x => x);
    if (!vivas.length) return;
    H.push('<table class="d">');
    for (const [rot, val, ancho] of vivas)
      H.push('<tr><th>' + esc(rot) + '</th><td' + (ancho ? ' class="ancho"' : '') + '>' +
             val + '</td></tr>');
    H.push('</table>');
  };

  const barra = (pct, color, alto) =>
    '<span class="b" style="height:' + (alto || 7) + 'px"><i style="width:' +
    Math.max(0, Math.min(100, pct)) + '%;background:' + color + '"></i></span>';

  const colorNRS = n => n == null ? TENUE
    : n >= 8 ? ROJO : n >= 6 ? NARANJA : n >= 4 ? AMBAR : n >= 2 ? LIMA : VERDE;

  const nrsConBarra = n => n == null ? '—'
    : '<b style="color:' + colorNRS(n) + '">' + n + '</b><span class="u">/10</span> ' +
      barra(n * 10, colorNRS(n));

  const pastilla = (txt, color, fondo) =>
    '<span class="p" style="color:' + color + ';background:' + (fondo || 'transparent') +
    ';border-color:' + color + '">' + esc(txt) + '</span>';

  const COLOR_NOMBRE = {verde:VERDE, lima:LIMA, ambar:AMBAR, naranja:NARANJA,
                        rojo:ROJO, violeta:VIOLETA, acento:A, neutro:TENUE};

  /* ------------------------------------------------------ encabezado --- */

  H.push('<div class="cab">' +
    '<div class="cab-i"><div class="marca">' + esc(MARCA.nombre) + '</div>' +
    (MARCA.firma ? '<div class="firma">' + esc(MARCA.firma) + '</div>' : '') +
    '<div class="bajada">' + esc(MARCA.consultorio) + ' · ' + esc(MARCA.ciudad) + '</div></div>' +
    '<div class="cab-d"><div class="tipo">Historia clínica de dolor</div>' +
    '<div class="fecha">Impresa el ' + esc(fechaCorta(hoy())) + '</div>' +
    (MARCA.titular !== 'Dr. —' ? '<div class="fecha">' + esc(MARCA.titular) + ' · ' +
      esc(MARCA.matricula) + '</div>' : '') +
    '</div></div>');

  /* ------------------------------------------------- quien es --------- */

  const edad = edadDe(p.fechaNac);
  H.push('<div class="t ident">' +
    '<div class="nombre">' + esc(nombreCompleto(p)) + '</div>' +
    '<div class="tira">' +
    '<span><b>DNI</b> ' + T(p.dni) + '</span>' +
    '<span><b>Nacimiento</b> ' + (p.fechaNac ? esc(fechaCorta(p.fechaNac)) +
      (edad != null ? ' (' + edad + ' años)' : '') : '—') + '</span>' +
    '<span><b>Sexo</b> ' + T(p.sexo === 'F' ? 'femenino' : p.sexo === 'M' ? 'masculino' : '') + '</span>' +
    '<span><b>Cobertura</b> ' + T(p.obraSocial) + '</span>' +
    '<span><b>Ocupación</b> ' + T(p.ocupacion) + '</span>' +
    '<span><b>Derivado por</b> ' + T(p.derivante) + '</span>' +
    '</div></div>');

  /* ------------------------------------------- tablero de cabecera ----- */

  const nrsHoy = ultimoNRS(p);
  const mme = a.seguridad.mme;
  H.push('<div class="tablero">');

  H.push('<div class="cel"><div class="rot">Diagnóstico</div>' +
    '<div class="val chico">' + T(p.diagnostico.sindrome) + '</div>' +
    (p.diagnostico.icd ? '<div class="sub">' + esc(p.diagnostico.icd) + '</div>' : '') +
    '</div>');

  H.push('<div class="cel"><div class="rot">Intensidad actual</div>' +
    '<div class="val" style="color:' + colorNRS(nrsHoy) + '">' +
    (nrsHoy == null ? '—' : nrsHoy + '<span class="u">/10</span>') + '</div>' +
    (nrsHoy == null ? '' : barra(nrsHoy * 10, colorNRS(nrsHoy), 6)) + '</div>');

  H.push('<div class="cel"><div class="rot">Carga opioide</div>' +
    '<div class="val" style="color:' + (COLOR_NOMBRE[mme.color] || TENUE) + '">' +
    mme.total + '<span class="u">MME/día</span></div>' +
    '<div class="sub">' + esc(mme.nivel) + '</div></div>');

  H.push('<div class="cel"><div class="rot">Efectividad del plan</div>' +
    (ef.porcentaje == null
      ? '<div class="val">—</div><div class="sub">sin datos suficientes</div>'
      : '<div class="val" style="color:' + ef.banda.color + '">' + ef.porcentaje +
        '<span class="u">%</span></div>' +
        barra(Math.max(0, ef.porcentaje), ef.banda.color, 6) +
        '<div class="sub">' + esc(ef.banda.etiqueta) + '</div>') +
    '</div>');

  H.push('</div>');

  /* --------------------------------------- lo urgente, antes que nada -- */

  if (a.banderas.length) {
    H.push('<div class="t alarma"><div class="alarma-t">Banderas rojas — ' +
      a.banderas.length + '</div>');
    for (const b of a.banderas)
      H.push('<div class="linea-alarma"><b>' + esc(b.txt) + '</b><span>' +
             esc(b.accion) + '</span></div>');
    H.push('</div>');
  }

  const reparos = (a.seguridad.avisos || []).filter(x => x.nivel === 'alto' || x.nivel === 'medio');
  if (reparos.length) {
    H.push('<div class="t reparo"><div class="reparo-t">Reparos de seguridad farmacológica — ' +
      reparos.length + '</div>');
    for (const x of reparos)
      H.push('<div class="linea-alarma"><b style="color:' +
        (x.nivel === 'alto' ? ROJO : AMBAR) + '">' + esc(x.titulo) + '</b><span>' +
        esc(x.texto) + '</span></div>');
    H.push('</div>');
  }

  /* ------------------------------------------------- 1. antecedentes --- */

  seccion('Antecedentes');
  abrirTarjeta();
  filas([
    ['Enfermedades', T(p.antecedentes.enfermedades), true],
    ['Cirugías', T(p.antecedentes.cirugias), true],
    /* La alergia va en rojo, pero SOLO si es una alergia. "Ninguna conocida"
       escrito en rojo y en negrita es exactamente el mismo aviso visual que
       "alergia a la morfina", y en una hoja que se lee apurada eso no es un
       detalle de estilo. */
    ['Alergias', !p.antecedentes.alergias ? 'No refiere'
      : /^\s*(no|ninguna|niega|sin|nada)\b/i.test(p.antecedentes.alergias)
        ? esc(p.antecedentes.alergias)
        : '<b style="color:' + ROJO + '">' + esc(p.antecedentes.alergias) + '</b>', true],
    ['Familiares', T(p.antecedentes.familiares), true],
    ['Hábitos', T(p.antecedentes.habitos), true],
    ['Otra medicación', T(p.antecedentes.medicacionNoDolor), true],
    p.antecedentes.filtrado ? ['Filtrado glomerular', esc(p.antecedentes.filtrado) + ' ml/min'] : null
  ]);
  cerrarTarjeta();

  /* --------------------------------------------- 2. historia del dolor - */

  seccion('Historia del dolor');
  abrirTarjeta();
  const meses = p.dolor.inicio ? mesesDesde(p.dolor.inicio) : null;
  filas([
    ['Inicio', p.dolor.inicio
      ? esc(fechaCorta(p.dolor.inicio)) + '  ' +
        pastilla((meses || 0) + ' meses de evolución',
                 (meses || 0) >= 3 ? NARANJA : SUAVE)
      : '—'],
    ['Mecanismo de comienzo', T(p.dolor.mecanismo), true],
    ['Descripción', T(p.dolor.descripcion), true],
    ['Descriptores', (p.dolor.descriptores || []).length
      ? (p.dolor.descriptores || []).map(v =>
          pastilla((DESCRIPTORES.find(x => x.v === v) || {t:v}).t, AT, ACL)).join(' ')
      : '—', true],
    ['Patrón', T(p.dolor.patron)],
    ['Peor momento', T(p.dolor.peorMomento)],
    ['Irradiación', T(p.dolor.irradiacion), true],
    ['Lo alivia', T(p.dolor.alivia), true],
    ['Lo empeora', T(p.dolor.empeora), true]
  ]);

  H.push('<div class="intens">' +
    ['nrsAhora:Ahora', 'nrsPromedio:Promedio', 'nrsPeor:Peor', 'nrsMejor:Mejor']
      .map(par => {
        const [k, rot] = par.split(':');
        const n = p.dolor[k];
        return '<div><div class="rot">' + rot + '</div><div class="v">' +
          nrsConBarra(n == null ? null : Number(n)) + '</div></div>';
      }).join('') + '</div>');
  cerrarTarjeta();

  /* ------------------------------------------------- 3. mapa corporal -- */

  seccion('Mapa corporal del dolor');
  abrirTarjeta();
  const lm = leerMapa(p.dolor.mapa || []);
  if (lm.total) {
    const rz = raizDominante(lm);
    filas([
      ['Distribución', pastilla(lm.distribucion, A, ACL) + ' ' +
        pastilla(lm.bilateral ? 'bilateral' : 'unilateral', SUAVE)],
      ['Índice generalizado', 'WPI ' + lm.wpi + '/19 en ' + lm.areas.length + ' de 5 áreas ' +
        barra((lm.wpi / 19) * 100, lm.wpi >= 7 ? NARANJA : A)],
      rz ? ['Territorio predominante', '<b>' + esc(rz.raiz) + '</b> — ' + rz.proporcion +
            '% de las marcas ' + barra(rz.proporcion, VIOLETA)] : null
    ]);
    H.push('<table class="zonas">');
    for (const z of lm.zonas)
      H.push('<tr><td class="z">' + esc(nombreZona(z.z)) + '</td>' +
        '<td class="i"><b style="color:' + colorNRS(z.i) + '">' + z.i + '</b>' +
        '<span class="u">/10</span></td>' +
        '<td class="g">' + barra(z.i * 10, colorNRS(z.i)) + '</td></tr>');
    H.push('</table>');
  } else {
    H.push('<p class="vacio">Sin marcas registradas en el mapa corporal.</p>');
  }
  cerrarTarjeta();

  /* --------------------------------------------------- 4. repercusión -- */

  seccion('Repercusión en la vida diaria');
  abrirTarjeta();
  filas([
    ['Sueño', T(p.impacto.sueño), true],
    ['Trabajo y actividades', T(p.impacto.trabajo), true],
    ['Ánimo', T(p.impacto.animo), true],
    ['Dejó de hacer', T(p.impacto.dejoDeHacer), true]
  ]);
  const objs = (p.impacto.objetivos || []).map(o => typeof o === 'string' ? {t:o} : o)
                                          .filter(o => o && o.t);
  if (objs.length) {
    H.push('<div class="rot" style="margin-top:7px">Objetivos acordados con el paciente</div>');
    H.push('<table class="objs">');
    for (const o of objs)
      H.push('<tr><td class="mk" style="color:' + (o.logrado ? VERDE : TENUE) + '">' +
        (o.logrado ? '&#10003;' : '&#9675;') + '</td><td>' + esc(o.t) + '</td>' +
        '<td class="est" style="color:' + (o.logrado ? VERDE : TENUE) + '">' +
        (o.logrado ? 'logrado' : 'pendiente') + '</td></tr>');
    H.push('</table>');
  }
  cerrarTarjeta();

  /* ------------------------------------------ 5. tratamientos previos -- */

  seccion('Tratamientos previos y su resultado');
  abrirTarjeta();
  if ((p.tratamientosPrevios || []).length) {
    H.push('<table class="lista"><thead><tr><th>Qué</th><th>Cuándo</th>' +
           '<th>Resultado</th><th>Observaciones</th></tr></thead><tbody>');
    for (const t of p.tratamientosPrevios) {
      const fallo = /igual|empeor|sin cambio|no sirvi|nada/i.test(t.resultado || '');
      H.push('<tr><td><b>' + T(t.que) + '</b></td><td>' + T(t.cuando) + '</td>' +
        '<td>' + (t.resultado
          ? pastilla(t.resultado, fallo ? ROJO : VERDE)
          : '—') + '</td><td class="obs">' + T(t.obs) + '</td></tr>');
    }
    H.push('</tbody></table>');
  } else H.push('<p class="vacio">No se registraron tratamientos previos.</p>');
  cerrarTarjeta();

  /* -------------------------------------------- 6. medicación actual --- */

  seccion('Medicación actual');
  abrirTarjeta();
  if ((p.medicacion || []).length) {
    H.push('<table class="lista"><thead><tr><th>Fármaco</th><th>Grupo</th><th>Dosis</th>' +
           '<th>Frecuencia</th><th>Desde</th></tr></thead><tbody>');
    for (const m of p.medicacion) {
      const f = FARMACOS[m.farmaco];
      const opioide = f && f.grupo === 'Opioide';
      H.push('<tr' + (opioide ? ' class="op"' : '') + '>' +
        '<td><b>' + esc(f ? f.nombre : (m.nombreLibre || '—')) + '</b></td>' +
        '<td class="gr">' + T(f ? f.grupo : '') + '</td>' +
        '<td>' + T(m.dosis) + '</td><td>' + T(m.frecuencia) + '</td>' +
        '<td>' + (m.desde ? esc(fechaCorta(m.desde)) : '—') + '</td></tr>');
    }
    H.push('</tbody></table>');
    if (mme.total > 0) {
      H.push('<div class="mme" style="border-color:' + (COLOR_NOMBRE[mme.color] || TENUE) + '">' +
        '<div class="mme-n" style="color:' + (COLOR_NOMBRE[mme.color] || TENUE) + '">' +
        mme.total + '<span class="u">MME/día</span></div>' +
        '<div class="mme-t"><b>' + esc(mme.nivel) + '</b>' +
        (mme.aviso ? '<span>' + esc(mme.aviso) + '</span>' : '') +
        (mme.detalle.length ? '<span class="det">' + mme.detalle.map(d =>
          esc((FARMACOS[d.id] || {}).nombre || d.id) + ' ' + d.mme).join(' · ') +
          ' MME</span>' : '') + '</div></div>');
    }
  } else H.push('<p class="vacio">Sin medicación cargada.</p>');
  cerrarTarjeta();

  /* ------------------------------------------------ 7. examen físico --- */

  seccion('Examen físico');
  abrirTarjeta();
  const signos = [];
  for (const g of EXAMEN_SIGNOS)
    for (const i of g.items)
      if ((p.examen.signos || []).includes(i.v)) signos.push(i.t);
  if (signos.length || p.examen.texto || p.examen.observaciones) {
    if (signos.length)
      H.push('<div class="chips">' + signos.map(x => pastilla(x, AT, ACL)).join(' ') + '</div>');
    filas([
      p.examen.texto ? ['Descripción', esc(p.examen.texto), true] : null,
      p.examen.observaciones ? ['Observaciones', esc(p.examen.observaciones), true] : null
    ]);
  } else H.push('<p class="vacio">Examen físico no registrado.</p>');
  cerrarTarjeta();

  /* --------------------------------------------- 8. escalas aplicadas -- */

  seccion('Escalas aplicadas');
  abrirTarjeta();
  const aplicadas = Object.entries(p.escalas || {}).filter(([, v]) => v && v.total != null);
  if (aplicadas.length) {
    H.push('<table class="lista escalas"><thead><tr><th>Escala</th><th>Puntaje</th>' +
           '<th></th><th>Interpretación</th><th>Fecha</th></tr></thead><tbody>');
    for (const [k, v] of aplicadas) {
      const e = ESCALAS[k] || {};
      const corte = interpretarEscala(k, v.total);
      const tope = e.porcentual ? 100 : (e.rango ? e.rango[1] : null);
      const col = corte ? (COLOR_NOMBRE[corte.color] || A) : A;
      H.push('<tr><td><b>' + esc(e.sigla || k) + '</b>' +
        (e.nombre ? '<div class="gr">' + esc(e.nombre) + '</div>' : '') + '</td>' +
        '<td class="num"><b style="color:' + col + '">' + v.total + '</b>' +
        (tope ? '<span class="u">/' + tope + '</span>' : e.porcentual ? '<span class="u">%</span>' : '') +
        '</td>' +
        '<td class="g">' + (tope ? barra((v.total / tope) * 100, col) : '') + '</td>' +
        '<td>' + (corte ? pastilla(corte.etiqueta, col) : '—') +
        (v.parcial ? ' ' + pastilla('incompleta', NARANJA) : '') + '</td>' +
        '<td>' + esc(fechaCorta(v.fecha)) + '</td></tr>');
    }
    H.push('</tbody></table>');
  } else H.push('<p class="vacio">No se aplicó ninguna escala.</p>');
  cerrarTarjeta();

  /* ---------------------------------------- 9. impresión diagnóstica --- */

  seccion('Impresión diagnóstica');
  abrirTarjeta();
  const NOMBRE_MEC = {neuropatico:'neuropático', nociplastico:'nociplástico',
                      nociceptivo:'nociceptivo', mixto:'mixto', indeterminado:'indeterminado'};
  const COLOR_MEC = {neuropatico:VIOLETA, nociplastico:AMBAR, nociceptivo:LIMA,
                     mixto:A, indeterminado:TENUE};
  filas([
    ['Síndrome', '<b class="grande">' + T(p.diagnostico.sindrome) + '</b>', true],
    ['Código CIE-11', T(p.diagnostico.icd)],
    ['Mecanismo', p.diagnostico.mecanismo
      ? pastilla(NOMBRE_MEC[p.diagnostico.mecanismo] || p.diagnostico.mecanismo,
                 COLOR_MEC[p.diagnostico.mecanismo] || A) +
        (p.diagnostico.grado ? ' ' + pastilla('grado ' + p.diagnostico.grado, SUAVE) : '')
      : '—'],
    p.diagnostico.texto ? ['Fundamento', esc(p.diagnostico.texto), true] : null
  ]);
  cerrarTarjeta();

  /* La lectura de la maquina va aparte y rotulada como tal: en una historia
     que va a leer otro medico tiene que quedar claro que esto lo propuso un
     programa y no lo firmo nadie. */
  H.push('<div class="t maquina">');
  H.push('<div class="maquina-t">Lectura automática de la aplicación</div>');
  H.push('<p class="fen">' + esc(a.fenotipo.texto) + '</p>');
  if (a.diferencial.length) {
    H.push('<div class="rot">Diagnóstico diferencial ponderado</div>');
    H.push('<table class="dif">');
    for (const d of a.diferencial.slice(0, 5)) {
      const col = d.concordancia >= 70 ? VERDE : d.concordancia >= 50 ? AMBAR : TENUE;
      H.push('<tr><td class="s">' + esc(d.sindrome.nombre) + '</td>' +
        '<td class="pc" style="color:' + col + '">' + d.concordancia + '%</td>' +
        '<td class="g">' + barra(d.concordancia, col) + '</td>' +
        '<td class="af">' + esc(d.aFavor.slice(0, 3).join(' · ')) + '</td></tr>');
    }
    H.push('</table>');
  }
  if (!a.completitud.suficiente)
    H.push('<p class="falta">Análisis orientativo: falta cargar ' +
      esc(a.completitud.faltan.join(', ')) + '.</p>');
  H.push('<p class="aviso">' + esc(AVISO_SUGERENCIA) + '</p></div>');

  /* ---------------------------------------------- 10. plan terapéutico - */

  seccion('Plan terapéutico');
  abrirTarjeta();
  filas([
    ['Objetivo', T(p.plan.objetivo), true],
    p.plan.texto ? ['Plan', esc(p.plan.texto), true] : null,
    (p.plan.estudios || []).length ? ['Estudios',
      p.plan.estudios.map(x => pastilla(x, AT, ACL)).join(' '), true] : null,
    (p.plan.noFarmacologico || []).length ? ['No farmacológico',
      esc(p.plan.noFarmacologico.join('; ')), true] : null,
    (p.plan.derivaciones || []).length ? ['Derivaciones',
      p.plan.derivaciones.map(x => pastilla(x, AT, ACL)).join(' '), true] : null,
    (p.plan.procedimientos || []).length ? ['Procedimientos planificados',
      p.plan.procedimientos.map(x =>
        pastilla((PROCEDIMIENTOS[x] || {nombre:x}).nombre, VIOLETA)).join(' '), true] : null,
    ['Próximo control', p.proximoControl
      ? '<b>' + esc(fechaLarga(p.proximoControl)) + '</b>' : '—']
  ]);
  cerrarTarjeta();

  /* ---------------------------------------------------- 11. evolución -- */

  seccion('Evolución');
  if ((p.evoluciones || []).length) {
    H.push('<div class="t linea-tiempo">');
    for (const e of p.evoluciones) {
      H.push('<div class="hito">' +
        '<div class="hito-f"><b>' + esc(fechaCorta(e.fecha)) + '</b>' +
        (e.nrs != null ? '<span class="nrs" style="color:' + colorNRS(e.nrs) + '">' +
          e.nrs + '<i>/10</i></span>' + barra(e.nrs * 10, colorNRS(e.nrs), 5) : '') +
        '</div><div class="hito-c">' +
        (e.texto ? '<p>' + esc(e.texto) + '</p>' : '') +
        (e.cambios ? '<p class="cambio"><b>Cambios:</b> ' + esc(e.cambios) + '</p>' : '') +
        ((e.adversos || []).length ? '<p class="adv"><b>Efectos adversos:</b> ' +
          e.adversos.map(x => esc(x.t) + (x.grave ? ' (grave)' : '')).join(' · ') + '</p>' : '') +
        (e.escalas && Object.keys(e.escalas).length ? '<p class="esc">' +
          Object.entries(e.escalas).map(([k, v]) =>
            esc((ESCALAS[k] || {sigla:k}).sigla) + ' ' +
            esc(String(typeof v === 'object' ? v.total : v))).join(' · ') + '</p>' : '') +
        '</div></div>');
    }
    H.push('</div>');
  } else {
    H.push('<div class="t"><p class="vacio">Sin evoluciones registradas.</p></div>');
  }

  /* ------------------------------------- 12. resultado del plan -------- */

  seccion('Resultado del plan analgésico');
  abrirTarjeta();
  if (ef.porcentaje != null) {
    H.push('<div class="efect">' +
      '<div class="efect-n" style="color:' + ef.banda.color + '">' + ef.porcentaje +
      '<span class="u">%</span></div>' +
      '<div class="efect-t"><b style="color:' + ef.banda.color + '">' +
      esc(ef.banda.etiqueta) + '</b><span>' + esc(ef.resumen) + '</span></div></div>');
    H.push('<table class="lista"><thead><tr><th>Dominio</th><th>Aporte</th><th></th>' +
           '<th>Detalle</th></tr></thead><tbody>');
    for (const comp of Object.values(ef.componentes)) {
      const col = comp.valor >= 50 ? VERDE : comp.valor >= 30 ? LIMA
                : comp.valor >= 0 ? AMBAR : ROJO;
      H.push('<tr><td><b>' + esc(comp.etiqueta) + '</b></td>' +
        '<td class="num" style="color:' + col + '"><b>' + (comp.valor > 0 ? '+' : '') +
        comp.valor + '%</b></td>' +
        '<td class="g">' + barra(Math.abs(comp.valor), col) + '</td>' +
        '<td class="obs">' + esc(comp.detalle) + '</td></tr>');
    }
    H.push('</tbody></table>');
    if (ef.banda.accion)
      H.push('<p class="accion">' + esc(ef.banda.accion) + '</p>');
  } else {
    H.push('<p class="vacio">Todavía no hay datos suficientes para medir. ' +
      'Hace falta al menos una intensidad basal y una de control.</p>');
  }
  cerrarTarjeta();

  /* ------------------------------------------- 13. consentimientos ----- */

  if ((p.consentimientos || []).length) {
    seccion('Consentimientos informados');
    abrirTarjeta();
    H.push('<table class="lista"><tbody>');
    for (const k of p.consentimientos)
      H.push('<tr><td><b>' + esc(k.procedimiento) + '</b></td>' +
        '<td>' + esc(fechaCorta(k.fecha)) + '</td>' +
        '<td>' + pastilla(k.firmado ? 'firmado' : 'sin firmar',
                          k.firmado ? VERDE : NARANJA) + '</td></tr>');
    H.push('</tbody></table>');
    cerrarTarjeta();
  }

  /* -------------------------------------------------------- la firma -- */

  H.push('<div class="firmar">' +
    '<div class="raya"></div>' +
    '<div class="pie-firma"><b>' + esc(MARCA.titular) + '</b><br>' +
    esc(MARCA.matricula) + ' · ' + esc(MARCA.especialidad) + '<br>' +
    'Firma y sello del médico tratante</div></div>');

  H.push('<div class="legal">Documento generado por ' + esc(MARCA.nombre) + ' el ' +
    esc(fechaCorta(hoy())) + '. La historia clínica es de titularidad del paciente ' +
    '(Ley 26.529, art. 14) y está amparada por el secreto médico (Ley 17.132). ' +
    'Contiene datos sensibles: su tratamiento se rige por la Ley 25.326.</div>');

  abrirImpresion('Historia clínica de dolor — ' + nombreCompleto(p),
                 H.join('\n'), estiloHistoriaImpresa());
}

/* La hoja de estilo del documento impreso. Va aparte de la funcion que arma
   el contenido para que se pueda leer una cosa sin la otra. */
function estiloHistoriaImpresa() {
  return `
@page{size:A4;margin:1.2cm 1.3cm}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  font-size:9.3pt; line-height:1.45; color:#141821; background:#f2f4f7;
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
.hoja{max-width:19.6cm; margin:0 auto; padding:14px}
@media print{ body{background:#fff} .hoja{max-width:none; margin:0; padding:0} }

/* ---- encabezado ---- */
.cab{display:flex; justify-content:space-between; align-items:flex-end;
  border-bottom:2.5px solid #2d6a72; padding-bottom:8px; margin-bottom:12px}
.marca{font-size:17pt; font-weight:700; letter-spacing:.10em; line-height:1.1}
.firma{font-size:8.5pt; color:#2d6a72}
.bajada{font-size:7.6pt; color:#7d8698; margin-top:1px}
.cab-d{text-align:right}
.tipo{font-size:10pt; font-weight:700; color:#1d4a50; letter-spacing:.03em}
.fecha{font-size:7.8pt; color:#7d8698}

/* ---- tarjetas ---- */
.t{background:#fff; border:1px solid #dde1e9; border-radius:9px; padding:10px 12px;
  margin-bottom:9px; page-break-inside:avoid; break-inside:avoid}
h2{font-size:8.4pt; font-weight:700; letter-spacing:.10em; text-transform:uppercase;
  color:#1d4a50; margin:14px 0 6px; display:flex; align-items:center; gap:7px;
  page-break-after:avoid; break-after:avoid}
h2 .n{display:inline-block; width:16px; height:16px; border-radius:8px; background:#2d6a72;
  color:#fff; font-size:7.5pt; line-height:16px; text-align:center; letter-spacing:0}

/* ---- identificacion ---- */
.ident{border-left:3px solid #2d6a72}
.nombre{font-size:15pt; font-weight:700; letter-spacing:-.01em; line-height:1.2}
.tira{display:flex; flex-wrap:wrap; gap:4px 16px; margin-top:5px;
  font-size:8.4pt; color:#4a5364}
.tira b{color:#7d8698; font-weight:600; text-transform:uppercase; font-size:7.2pt;
  letter-spacing:.05em; margin-right:3px}

/* ---- tablero de cabecera ---- */
.tablero{display:flex; gap:9px; margin-bottom:9px; page-break-inside:avoid}
.tablero .cel{flex:1; background:#fff; border:1px solid #dde1e9; border-radius:9px;
  padding:9px 11px; min-width:0}
.rot{font-size:7.2pt; font-weight:700; letter-spacing:.07em; text-transform:uppercase;
  color:#7d8698}
.val{font-size:20pt; font-weight:700; letter-spacing:-.03em; line-height:1.15; margin-top:1px}
.val.chico{font-size:10.5pt; letter-spacing:0; line-height:1.3}
.val .u{font-size:8pt; color:#7d8698; font-weight:600; margin-left:2px}
.sub{font-size:7.6pt; color:#7d8698; margin-top:2px}

/* ---- barras ---- */
.b{display:inline-block; width:100%; min-width:34px; background:#e7eaf0; border-radius:4px;
  overflow:hidden; vertical-align:middle}
.b i{display:block; height:100%; border-radius:4px}

/* ---- fichas de dos columnas ---- */
table.d{width:100%; border-collapse:collapse}
table.d th{width:26%; text-align:left; vertical-align:top; padding:3px 10px 3px 0;
  font-size:7.4pt; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  color:#7d8698; border-bottom:1px solid #eef0f4}
table.d td{vertical-align:top; padding:3px 0; font-size:9pt; border-bottom:1px solid #eef0f4}
table.d tr:last-child th, table.d tr:last-child td{border-bottom:0}
table.d td.ancho{white-space:normal}
.grande{font-size:11pt}

/* ---- pastillas ---- */
.p{display:inline-block; border:1px solid; border-radius:20px; padding:1px 7px;
  font-size:7.4pt; font-weight:600; line-height:1.5; white-space:nowrap}
.chips{margin-bottom:6px; line-height:2}

/* ---- intensidades ---- */
.intens{display:flex; gap:10px; margin-top:8px; padding-top:8px; border-top:1px solid #eef0f4}
.intens > div{flex:1}
.intens .v{font-size:11pt; font-weight:700; margin-top:1px}
.intens .u{font-size:7.6pt; color:#7d8698; font-weight:600; margin-right:5px}

/* ---- zonas del mapa ---- */
table.zonas{width:100%; border-collapse:collapse; margin-top:7px}
table.zonas td{padding:2.5px 0; border-bottom:1px solid #eef0f4; font-size:8.6pt}
table.zonas td.z{width:46%}
table.zonas td.i{width:12%; text-align:right; padding-right:9px; white-space:nowrap}
table.zonas td.i .u{font-size:7.2pt; color:#7d8698}
table.zonas td.g{width:42%}

/* ---- objetivos ---- */
table.objs{width:100%; border-collapse:collapse; margin-top:3px}
table.objs td{padding:2.5px 0; border-bottom:1px solid #eef0f4; font-size:8.8pt}
table.objs td.mk{width:16px; font-size:10pt}
table.objs td.est{width:70px; text-align:right; font-size:7.4pt; font-weight:700;
  text-transform:uppercase; letter-spacing:.04em}

/* ---- listas tabulares ---- */
table.lista{width:100%; border-collapse:collapse; font-size:8.6pt}
table.lista thead th{text-align:left; font-size:7.2pt; font-weight:700; letter-spacing:.06em;
  text-transform:uppercase; color:#7d8698; padding:0 8px 4px 0;
  border-bottom:1.5px solid #dde1e9}
table.lista td{padding:4px 8px 4px 0; border-bottom:1px solid #eef0f4; vertical-align:top}
table.lista tbody tr:last-child td{border-bottom:0}
table.lista td.num{text-align:right; white-space:nowrap; padding-right:9px}
table.lista td.num .u{font-size:7.2pt; color:#7d8698}
table.lista td.g{width:22%}
table.lista td.obs{color:#4a5364; font-size:8.2pt}
table.lista tr.op td{background:rgba(242,113,28,.06)}
.gr{font-size:7.4pt; color:#7d8698}
table.escalas td.g{width:16%}

/* ---- MME ---- */
.mme{display:flex; gap:11px; align-items:flex-start; margin-top:9px; padding:9px 11px;
  border:1px solid; border-left-width:3px; border-radius:8px; background:#fafbfc}
.mme-n{font-size:17pt; font-weight:700; letter-spacing:-.03em; line-height:1.1;
  white-space:nowrap}
.mme-n .u{font-size:7.6pt; color:#7d8698; margin-left:3px; font-weight:600}
.mme-t{font-size:8.2pt; color:#4a5364}
.mme-t b{display:block; font-size:9pt; color:#141821}
.mme-t span{display:block; margin-top:2px}
.mme-t .det{color:#7d8698; font-size:7.6pt}

/* ---- alarmas ---- */
.alarma{border-color:#f0c4c4; border-left:3px solid #d92b2b; background:#fdf3f3}
.alarma-t{font-size:8.4pt; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
  color:#d92b2b; margin-bottom:5px}
.reparo{border-color:#f0dcae; border-left:3px solid #d9a406; background:#fefaef}
.reparo-t{font-size:8.4pt; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
  color:#a87f00; margin-bottom:5px}
.linea-alarma{padding:3.5px 0; border-bottom:1px solid rgba(0,0,0,.06)}
.linea-alarma:last-child{border-bottom:0}
.linea-alarma b{display:block; font-size:8.8pt}
.linea-alarma span{display:block; font-size:8.2pt; color:#4a5364}

/* ---- lectura de la maquina ---- */
.maquina{border-left:3px solid #7c5cc4; background:#fbfaff; border-color:#e2dcf3}
.maquina-t{font-size:7.6pt; font-weight:700; letter-spacing:.07em; text-transform:uppercase;
  color:#5b41a0; margin-bottom:4px}
.fen{margin:0 0 7px; font-size:9.6pt; font-weight:600}
table.dif{width:100%; border-collapse:collapse; margin-top:3px}
table.dif td{padding:3px 8px 3px 0; border-bottom:1px solid #eef0f4; font-size:8.4pt;
  vertical-align:middle}
table.dif td.s{width:26%; font-weight:600}
table.dif td.pc{width:8%; text-align:right; font-weight:700; padding-right:9px}
table.dif td.g{width:18%}
table.dif td.af{color:#4a5364; font-size:8pt}
.falta{margin:7px 0 0; font-size:8pt; color:#a87f00}
.aviso{margin:6px 0 0; font-size:7.4pt; color:#7d8698; line-height:1.4}

/* ---- linea de tiempo ---- */
.linea-tiempo{padding:11px 12px}
.hito{display:flex; gap:12px; padding:7px 0; border-bottom:1px solid #eef0f4;
  page-break-inside:avoid; break-inside:avoid}
.hito:last-child{border-bottom:0}
.hito-f{width:88px; flex:0 0 88px}
.hito-f b{display:block; font-size:8.6pt}
.hito-f .nrs{font-size:12pt; font-weight:700; letter-spacing:-.02em}
.hito-f .nrs i{font-size:7.2pt; color:#7d8698; font-style:normal; font-weight:600}
.hito-c{flex:1; min-width:0}
.hito-c p{margin:0 0 3px; font-size:8.6pt}
.hito-c p:last-child{margin-bottom:0}
.hito-c .cambio{color:#1d4a50}
.hito-c .adv{color:#d92b2b}
.hito-c .esc{font-size:7.8pt; color:#7d8698}

/* ---- efectividad ---- */
.efect{display:flex; gap:12px; align-items:flex-start; margin-bottom:8px}
.efect-n{font-size:26pt; font-weight:700; letter-spacing:-.04em; line-height:1;
  white-space:nowrap}
.efect-n .u{font-size:11pt; color:#7d8698; font-weight:600}
.efect-t{font-size:8.4pt; color:#4a5364}
.efect-t b{display:block; font-size:10pt}
.accion{margin:8px 0 0; padding-top:7px; border-top:1px solid #eef0f4;
  font-size:8.2pt; color:#4a5364}

/* ---- cierres ---- */
.vacio{margin:0; font-size:8.6pt; color:#7d8698; font-style:italic}
.firmar{margin-top:34px; page-break-inside:avoid}
.raya{width:7cm; border-top:1px solid #141821; margin-bottom:4px}
.pie-firma{font-size:8.2pt; color:#4a5364; line-height:1.5}
.pie-firma b{color:#141821; font-size:9pt}
.legal{margin-top:16px; padding-top:8px; border-top:1px solid #dde1e9;
  font-size:7.2pt; color:#7d8698; line-height:1.45}
`;
}

/* Abre la ventana de impresion con un documento con estilos propios. Es el
   hermano de imprimirTexto(), que sigue existiendo para el consentimiento
   informado: ese es un texto legal y tiene que salir como un texto legal. */
function abrirImpresion(titulo, cuerpoHTML, css) {
  const v = window.open('', '_blank');
  if (!v) return avisar('El navegador bloqueó la ventana de impresión.', 'error');
  v.document.write('<!DOCTYPE html><html lang="es-AR"><head><meta charset="utf-8">' +
    '<title>' + esc(titulo) + '</title><style>' + css + '</style></head><body>' +
    '<div class="hoja">' + cuerpoHTML + '</div></body></html>');
  v.document.close();
  setTimeout(() => v.print(), 400);
}


/* =========================================================================
   DIAGNOSTICO DE CONEXION
   -------------------------------------------------------------------------
   "Se guardo en este dispositivo pero no en la nube" es un sintoma, no un
   diagnostico: puede ser falta de internet, una sesion vencida, unas reglas
   mal publicadas o una cuenta que no figura en el equipo. Las cuatro se ven
   iguales desde afuera y tienen soluciones distintas.

   Esta ventana prueba de verdad: lee y escribe en cada rama y dice cual
   falla y que hacer. Es lo que evita el "no anda" sin mas informacion.
   ========================================================================= */

function ventanaRevision() {
  abrir({id:'revision', titulo:'Diagnóstico de conexión',
    sub:'Prueba real de lectura y escritura', ancha:true,
    /* Esta ventana escribe en la base, y esa escritura despierta al oyente que
       redibuja la ventana activa. Sin esta marca la pantalla se rehace sola en
       medio de la prueba, borra el resultado y vuelve a arrancarla: la
       aplicacion se cuelga. */
    noRefrescar: true,
    dibujar(c) {

      if (!firebaseConfigurado()) {
        c.innerHTML = vacio('La aplicación está en modo local',
          'No hay nada que diagnosticar: los datos viven solo en este dispositivo. ' +
          'Para sincronizar hay que configurar Firebase (PUBLICAR.md, pasos 2 a 4).');
        return;
      }

      const u = ESTADO.usuario || {};
      const yo = miembroActual();

      c.insertAdjacentHTML('beforeend', bloque('Quién sos para el servidor',
        dato('Sesión', u.uid ? marca('iniciada', 'verde') : marca('sin sesión', 'rojo')) +
        dato('Correo', esc(u.email || '—')) +
        dato('Identificador (uid)', '<span class="mono" style="font-size:11.5px">' +
          esc(u.uid || '—') + '</span>') +
        dato('Figurás en el equipo', yo
          ? marca('sí, como ' + ((ROLES[yo.rol] || {}).nombre || yo.rol), 'verde')
          : marca('NO — esto explica cualquier fallo de guardado', 'rojo')) +
        dato('Canal con el servidor', ESTADO.conectado
          ? marca('abierto', 'verde') : marca('cerrado', 'ambar') +
            '<div class="nota">El canal abierto no garantiza que puedas escribir: ' +
            'eso lo deciden las reglas.</div>') +
        dato('Versión que estás usando', '<span class="mono">' +
          esc(window.ALGOS_BUILD || '—') + '</span>' +
          '<div class="nota">Si no coincide con la última que subiste, el navegador ' +
          'guardó una copia vieja: recargá con Cmd+Shift+R.</div>')));

      /* El boton PRIMERO y la salida DEBAJO. Al reves, el resultado se
         insertaba encima del boton: empujaba el boton hacia abajo y aparecia
         fuera de donde uno esta mirando, con lo cual parecia que no habia
         pasado nada. */
      c.appendChild(superficie('Probar ahora',
        'Escribe y borra un dato de prueba en cada rama', () => correr(), 'acento'));

      const salida = document.createElement('div');
      c.appendChild(salida);

      function correr() {
        console.log('[ASHA] Diagnóstico iniciado', new Date().toISOString());
        salida.innerHTML =
          '<div class="bloque" style="border-left:3px solid var(--acento)">' +
          '<h3>Probando…</h3>' +
          '<p class="nota">Tarda unos segundos. Si en 10 segundos no aparece el ' +
          'resultado, es que el servidor no está contestando.</p></div>';
        salida.scrollIntoView({block:'nearest'});

        /* UNA clave fija, no una con marca de tiempo.
           Con marca de tiempo, cada corrida dejaba una fila nueva; y mientras
           existio el ciclo de redibujado, cientos. Con clave fija, correr el
           diagnostico mil veces deja como mucho un registro, que ademas se
           borra al terminar. */
        const CLAVE = '_diagnostico';

        /* Cada rama se prueba con un dato que RESPETA su validacion.
           Un {prueba:true} en precargas era rechazado por la regla que exige
           token, dni y estado: la prueba decia "sin permiso" cuando en realidad
           las reglas estaban haciendo bien su trabajo, y eso es peor que no
           probar nada.

           equipo e invitaciones se prueban SOLO de lectura: escribir ahi
           crearia un miembro o una invitacion falsos, aunque fuera por un
           instante, y no vale la pena por un diagnostico. */
        const ramas = [
          {r:'pacientes', que:'las historias clínicas',
           dato:{_prueba:true, apellido:'(prueba de diagnóstico)'}},
          {r:'precargas', que:'los cuestionarios del portal',
           dato:{token:'0'.repeat(48), dni:'0', estado:'borrador', _prueba:true}},
          {r:'agenda', que:'la agenda', dato:{_prueba:true}},
          {r:'config', que:'la configuración', dato:{_prueba:true}},
          {r:'equipo', que:'el equipo', soloLectura:true},
          {r:'invitaciones', que:'las invitaciones', soloLectura:true}
        ];

        const conTope = (promesa, seg) => Promise.race([
          promesa,
          new Promise((_, rechazar) =>
            setTimeout(() => rechazar(new Error('sin respuesta en ' + seg + ' segundos')),
                       seg * 1000))
        ]);

        const pruebas = ramas.map(x =>
          conTope(fbDb.ref('dolor/' + x.r).limitToFirst(1).once('value'), 8)
            .then(() => ({...x, lectura:'ok'}))
            .catch(e => ({...x, lectura:'falla', errorL:e.code || e.message}))
            .then(res => {
              if (x.soloLectura) return {...res, escritura:'—'};
              return conTope(fbDb.ref('dolor/' + x.r + '/' + CLAVE).set(x.dato), 8)
                .then(() => fbDb.ref('dolor/' + x.r + '/' + CLAVE).remove().catch(() => {}))
                .then(() => ({...res, escritura:'ok'}))
                .catch(e => ({...res, escritura:'falla', errorE:e.code || e.message}));
            })
        );

        pruebas.push(
          conTope(fbDb.ref('dolor/publico/instalado').once('value'), 8)
            .then(s => ({r:'publico/instalado', que:'la marca de instalado',
                         lectura:'ok', escritura:'—', valor:String(s.val())}))
            .catch(e => ({r:'publico/instalado', que:'la marca de instalado',
                          lectura:'falla', errorL:e.code || e.message, escritura:'—'})));

        Promise.all(pruebas).then(res => {
          const fallan = res.filter(x => x.lectura === 'falla' || x.escritura === 'falla');

          let h = '<div class="bloque"><h3>Resultado</h3>';
          for (const x of res) {
            const okL = x.lectura === 'ok', okE = x.escritura !== 'falla';
            h += '<div style="padding:8px 0;border-bottom:1px solid var(--linea)">' +
                 '<b style="font-size:14px">' + esc(x.que) + '</b> ' +
                 marca('leer: ' + (okL ? 'sí' : 'no'), okL ? 'verde' : 'rojo') + ' ' +
                 (x.escritura === '—'
                    ? '<span class="nota">escritura no probada</span>'
                    : marca('escribir: ' + (okE ? 'sí' : 'no'), okE ? 'verde' : 'rojo')) +
                 (x.valor !== undefined ? ' <span class="nota">valor: ' + esc(x.valor) + '</span>' : '') +
                 ((x.errorL || x.errorE)
                    ? '<div class="nota mono" style="margin-top:3px">' +
                      esc([x.errorL, x.errorE].filter(Boolean).join(' · ')) + '</div>' : '') +
                 '</div>';
          }
          h += '<p class="nota" style="margin-top:10px">En el equipo y las invitaciones ' +
               'solo se prueba la lectura: escribir ahí crearía un miembro o una invitación ' +
               'falsos, y no vale la pena por una prueba.</p></div>';
          salida.innerHTML = h;

          let conclusion;
          if (!fallan.length) {
            conclusion = '<div class="alerta info"><b>Todo funciona</b>' +
              '<p>Se pudo leer en todas las ramas y escribir en las que corresponde. ' +
              'La sincronización con el servidor está bien.</p></div>';
          } else if (!ESTADO.usuario || !ESTADO.usuario.uid) {
            conclusion = '<div class="alerta alto"><b>No hay sesión iniciada</b>' +
              '<p>Sin sesión no se puede escribir nada. Salí y volvé a entrar.</p></div>';
          } else if (!yo) {
            conclusion = '<div class="alerta alto"><b>Tu cuenta no figura en el equipo</b>' +
              '<p>Tenés sesión, pero las reglas exigen estar en la lista del equipo. ' +
              'Nada de lo que escribas se va a guardar en el servidor.</p></div>';
          } else if (fallan.every(x => /sin respuesta/i.test((x.errorE || x.errorL || '')))) {
            conclusion = '<div class="alerta alto"><b>El servidor no contesta</b>' +
              '<p>Las pruebas se agotaron sin respuesta. No es un problema de permisos: ' +
              'directamente no hay diálogo con la base.</p>' +
              '<p class="nota">Suele ser la conexión, o que la dirección de la base no sea ' +
              'la correcta. Revisá que en Firebase exista la <b>Realtime Database</b>.</p></div>';
          } else {
            conclusion = '<div class="alerta alto"><b>El servidor rechaza algunas escrituras</b>' +
              '<p>Ramas que fallan: ' + esc(fallan.map(x => x.que).join(', ')) + '.</p>' +
              '<p class="nota">Volvé a pegar el contenido de <span class="mono">' +
              'reglas-firebase.txt</span> completo, desde la primera llave hasta la última, ' +
              'y tocá Publicar.</p></div>';
          }
          salida.insertAdjacentHTML('beforeend', conclusion);
          salida.scrollIntoView({block:'nearest', behavior:'smooth'});
        })
        .catch(e => {
          console.error('Diagnóstico:', e);
          salida.innerHTML =
            '<div class="alerta alto"><b>El diagnóstico no pudo terminar</b>' +
            '<p class="mono" style="font-size:12px">' + esc(e && e.message ? e.message : String(e)) +
            '</p><p class="nota">Suele ser falta de conexión. Probá de nuevo.</p></div>';
        });
      }

    }});
}


/* -------------------------------------------------------------------------
   FORZAR ACTUALIZACION
   -------------------------------------------------------------------------
   La salida cuando quedo una version vieja pegada. Borra el service worker y
   todas sus copias, y recarga.

   No toca los datos: los pacientes viven en localStorage y en Firebase, que
   son almacenes distintos del cache de archivos. Vale la pena decirlo en el
   propio aviso, porque "borrar" al lado de una historia clinica asusta, y con
   razon.
   ------------------------------------------------------------------------- */
function forzarActualizacion() {
  avisar('Borrando la copia guardada…', 'aviso');

  const tareas = [];

  if ('caches' in window) {
    tareas.push(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))));
  }
  if ('serviceWorker' in navigator) {
    tareas.push(navigator.serviceWorker.getRegistrations()
      .then(rs => Promise.all(rs.map(r => r.unregister()))));
  }

  Promise.all(tareas)
    .catch(e => console.error('Forzar actualización:', e))
    .then(() => {
      /* El parametro sobrante obliga al navegador a pedir la pagina de nuevo
         en vez de servir la que tiene guardada en su propio cache HTTP. */
      const base = location.origin + location.pathname;
      location.replace(base + '?actualizado=' + Date.now());
    });
}
