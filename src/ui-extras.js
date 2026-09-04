/* =========================================================================
   ESTADISTICAS, BIBLIOTECA, AJUSTES E IMPRESION
   ========================================================================= */
'use strict';

/* ====================================================== ESTADISTICAS ==== */

function ventanaEstadisticas() {
  abrir({id:'stats', titulo:'Estadísticas del consultorio', ancha:true, dibujar(c) {
    const ps = Object.values(ESTADO.pacientes).filter(p => p.ambito !== 'agudo');
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
    c.insertAdjacentHTML('beforeend', bloque('Estado de la aplicación',
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
      dato('Versión', window.ALGOS_BUILD || '—')));

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
      '<p class="nota" style="margin-bottom:10px">La copia baja un archivo con TODA la base. ' +
      'Conviene hacerlo una vez por semana y guardarlo fuera de esta computadora. Es una ' +
      'historia clínica: tratalo como tal.</p>');
    c.appendChild(superficie('Descargar copia de seguridad', null, exportarRespaldo, 'suave'));

    const importar = superficie('Restaurar desde una copia',
      'Incorpora los pacientes del archivo; los repetidos se sobrescriben', () => {
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

/* ====================================================== IMPRESION ======= */

function imprimirHistoria(id) {
  const p = ESTADO.pacientes[id];
  if (!p) return;
  const a = analizar(p);
  const ef = efectividadPaciente(p);
  const L = [];
  const linea = t => L.push(t);
  const seccion = t => L.push('\n\n═══ ' + t.toUpperCase() + ' ═══');

  linea(MARCA.nombre + ' — ' + MARCA.consultorio);
  if (MARCA.titular !== 'Dr. —') linea(MARCA.titular + ' · ' + MARCA.matricula);
  linea('HISTORIA CLÍNICA DE DOLOR — impresa el ' + fechaCorta(hoy()));

  seccion('Filiación');
  linea('Paciente: ' + nombreCompleto(p));
  linea('Documento: ' + (p.dni || '—') + '   Nacimiento: ' + (p.fechaNac ? fechaCorta(p.fechaNac) +
    ' (' + edadDe(p.fechaNac) + ' años)' : '—'));
  linea('Sexo: ' + (p.sexo === 'F' ? 'femenino' : p.sexo === 'M' ? 'masculino' : '—') +
    '   Cobertura: ' + (p.obraSocial || '—'));
  linea('Ocupación: ' + (p.ocupacion || '—') + '   Derivado por: ' + (p.derivante || '—'));

  seccion('Antecedentes');
  linea('Enfermedades: ' + (p.antecedentes.enfermedades || '—'));
  linea('Cirugías: ' + (p.antecedentes.cirugias || '—'));
  linea('Alergias: ' + (p.antecedentes.alergias || '—'));
  linea('Familiares: ' + (p.antecedentes.familiares || '—'));
  linea('Hábitos: ' + (p.antecedentes.habitos || '—'));
  linea('Otra medicación: ' + (p.antecedentes.medicacionNoDolor || '—'));

  seccion('Historia del dolor');
  linea('Inicio: ' + (p.dolor.inicio ? fechaCorta(p.dolor.inicio) + ' (' +
    (mesesDesde(p.dolor.inicio) || 0) + ' meses de evolución)' : '—'));
  linea('Mecanismo de comienzo: ' + (p.dolor.mecanismo || '—'));
  linea('Descripción: ' + (p.dolor.descripcion || '—'));
  linea('Descriptores: ' + ((p.dolor.descriptores || []).map(v =>
    (DESCRIPTORES.find(x => x.v === v) || {t:v}).t).join(', ') || '—'));
  linea('Intensidad — ahora: ' + (p.dolor.nrsAhora ?? '—') + '/10   promedio: ' +
    (p.dolor.nrsPromedio ?? '—') + '/10   peor: ' + (p.dolor.nrsPeor ?? '—') +
    '/10   mejor: ' + (p.dolor.nrsMejor ?? '—') + '/10');
  linea('Patrón: ' + (p.dolor.patron || '—') + '   Peor momento: ' + (p.dolor.peorMomento || '—'));
  linea('Irradiación: ' + (p.dolor.irradiacion || '—'));
  linea('Lo alivia: ' + (p.dolor.alivia || '—'));
  linea('Lo empeora: ' + (p.dolor.empeora || '—'));

  seccion('Mapa dermatomal del dolor');
  const lm = leerMapa(p.dolor.mapa || []);
  if (lm.total) {
    linea('Distribución ' + lm.distribucion + ', intensidad máxima ' + lm.intensidadMax + '/10' +
      (lm.bilateral ? ', bilateral' : ', unilateral'));
    linea('Zonas: ' + lm.zonas.map(z => nombreZona(z.z) + ' (' + z.i + '/10)').join(' · '));
    linea('Índice de dolor generalizado (WPI): ' + lm.wpi + '/19 en ' + lm.areas.length + ' de 5 áreas');
    const rz = raizDominante(lm);
    if (rz) linea('Territorio predominante: ' + rz.raiz + ' (' + rz.proporcion + '% de las marcas)');
  } else linea('Sin marcas registradas.');

  seccion('Repercusión en la vida diaria');
  linea('Sueño: ' + (p.impacto.sueño || '—'));
  linea('Trabajo y actividades: ' + (p.impacto.trabajo || '—'));
  linea('Ánimo: ' + (p.impacto.animo || '—'));
  linea('Actividades abandonadas: ' + (p.impacto.dejoDeHacer || '—'));
  linea('Objetivos acordados: ' + ((p.impacto.objetivos || []).map(o =>
    (typeof o === 'string' ? o : o.t) + (o.logrado ? ' [LOGRADO]' : '')).join(' · ') || '—'));

  seccion('Tratamientos previos y su resultado');
  if ((p.tratamientosPrevios || []).length) {
    for (const t of p.tratamientosPrevios)
      linea('· ' + (t.que || '—') + ' — ' + (t.cuando || 's/f') + ' — ' + (t.resultado || 's/d') +
        (t.obs ? ' — ' + t.obs : ''));
  } else linea('—');

  seccion('Medicación actual');
  if ((p.medicacion || []).length) {
    for (const m of p.medicacion) {
      const f = FARMACOS[m.farmaco];
      linea('· ' + (f ? f.nombre : m.nombreLibre || '—') + ' ' + (m.dosis || '') + ' ' +
        (m.frecuencia || '') + (m.desde ? ' — desde ' + fechaCorta(m.desde) : ''));
    }
    linea('Carga opioide total: ' + a.seguridad.mme.total + ' MME/día (' + a.seguridad.mme.nivel + ')');
  } else linea('—');

  seccion('Examen físico');
  const signosTxt = [];
  for (const g of EXAMEN_SIGNOS)
    for (const i of g.items)
      if ((p.examen.signos || []).includes(i.v)) signosTxt.push(i.t);
  linea('Signos: ' + (signosTxt.join(' · ') || '—'));
  linea(p.examen.texto || '');
  if (p.examen.observaciones) linea('Observaciones: ' + p.examen.observaciones);

  seccion('Escalas aplicadas');
  const esc_ = Object.entries(p.escalas || {}).filter(([, v]) => v && v.total != null);
  if (esc_.length) {
    for (const [k, v] of esc_) {
      const e = ESCALAS[k];
      const corte = interpretarEscala(k, v.total);
      linea('· ' + (e ? e.sigla : k) + ': ' + v.total + (e && e.porcentual ? '%' : '') +
        (corte ? ' — ' + corte.etiqueta : '') + '  (' + fechaCorta(v.fecha) + ')' +
        (v.parcial ? ' [incompleta]' : ''));
    }
  } else linea('—');

  seccion('Impresión diagnóstica');
  linea('Síndrome: ' + (p.diagnostico.sindrome || '—'));
  linea('Código ICD-11: ' + (p.diagnostico.icd || '—'));
  linea('Mecanismo: ' + (p.diagnostico.mecanismo || '—') +
    (p.diagnostico.grado ? ' — grado ' + p.diagnostico.grado : ''));
  if (p.diagnostico.texto) linea(p.diagnostico.texto);
  linea('');
  linea('Lectura automática de la aplicación: ' + a.fenotipo.texto);
  if (a.diferencial.length)
    linea('Diferencial ponderado: ' + a.diferencial.slice(0, 4).map(d =>
      d.sindrome.nombre + ' ' + d.concordancia + '%').join(' · '));

  if (a.banderas.length) {
    seccion('Banderas rojas');
    for (const b of a.banderas) linea('· ' + b.txt + ' → ' + b.accion);
  }

  seccion('Plan terapéutico');
  linea('Objetivo: ' + (p.plan.objetivo || '—'));
  linea(p.plan.texto || '');
  if ((p.plan.estudios || []).length) linea('Estudios: ' + p.plan.estudios.join(' · '));
  if ((p.plan.noFarmacologico || []).length) linea('No farmacológico: ' + p.plan.noFarmacologico.join(' · '));
  if ((p.plan.derivaciones || []).length) linea('Derivaciones: ' + p.plan.derivaciones.join(' · '));
  if ((p.plan.procedimientos || []).length)
    linea('Procedimientos planificados: ' + p.plan.procedimientos.map(x =>
      (PROCEDIMIENTOS[x] || {nombre:x}).nombre).join(' · '));
  linea('Próximo control: ' + (p.proximoControl ? fechaCorta(p.proximoControl) : '—'));

  seccion('Evolución');
  if ((p.evoluciones || []).length) {
    for (const e of p.evoluciones) {
      linea('');
      linea('— ' + fechaCorta(e.fecha) + (e.nrs != null ? '   NRS ' + e.nrs + '/10' : ''));
      if (e.texto) linea(e.texto);
      if (e.cambios) linea('Cambios: ' + e.cambios);
      if ((e.adversos || []).length)
        linea('Efectos adversos: ' + e.adversos.map(x => x.t + (x.grave ? ' (grave)' : '')).join(' · '));
      if (e.escalas && Object.keys(e.escalas).length)
        linea('Escalas: ' + Object.entries(e.escalas).map(([k, v]) =>
          (ESCALAS[k] || {sigla:k}).sigla + ' ' + (typeof v === 'object' ? v.total : v)).join(' · '));
    }
  } else linea('—');

  seccion('Resultado del plan analgésico');
  if (ef.porcentaje != null) {
    linea('Efectividad global: ' + ef.porcentaje + '% — ' + ef.banda.etiqueta);
    for (const comp of Object.values(ef.componentes))
      linea('· ' + comp.etiqueta + ': ' + (comp.valor > 0 ? '+' : '') + comp.valor + '%  (' + comp.detalle + ')');
    linea(ef.resumen);
  } else linea('Todavía sin datos suficientes para medir.');

  if ((p.consentimientos || []).length) {
    seccion('Consentimientos informados');
    for (const k of p.consentimientos)
      linea('· ' + k.procedimiento + ' — ' + fechaCorta(k.fecha) + (k.firmado ? ' — FIRMADO' : ' — sin firmar'));
  }

  L.push('\n\n');
  L.push('___________________________');
  L.push('Firma y sello del médico tratante');

  imprimirTexto('Historia clínica de dolor — ' + nombreCompleto(p), L.join('\n'));
}
