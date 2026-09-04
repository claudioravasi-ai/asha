/* =========================================================================
   DOLOR AGUDO Y POSTOPERATORIO
   -------------------------------------------------------------------------
   La otra mitad del trabajo de un anestesiologo dedicado al dolor. Comparte
   la misma base de pacientes que el consultorio de dolor cronico, porque son
   los mismos: el paciente que hoy es un postoperatorio complicado puede ser
   el dolor cronico postquirurgico de dentro de tres meses, y tener las dos
   cosas en la misma historia es lo que permite verlo venir.

   El seguimiento se registra con DOS intensidades y no con una: en reposo y
   en movimiento. Es la diferencia entre un paciente comodo en la cama y un
   paciente que puede toser, levantarse y recuperarse. La analgesia
   postoperatoria se mide con la segunda.
   ========================================================================= */
'use strict';

/* Esquemas de analgesia multimodal por tipo de cirugia. Siguen la logica
   de PROSPECT: procedimiento por procedimiento, no un esquema unico. */
const ESQUEMAS_AGUDO = {
  general:{
    nombre:'Esquema multimodal de base',
    base:['Paracetamol 1 g cada 6-8 h, fijo (no a demanda)',
          'AINE o dipirona pautados, si no hay contraindicación renal, digestiva ni de sangrado',
          'Rescate opioide de liberación inmediata, con dosis y frecuencia escritas'],
    regional:['Considerar siempre la técnica regional que corresponda al procedimiento'],
    coadyuvantes:['Dexametasona 4-8 mg EV intraoperatoria: analgesia y antiemesis',
                  'Sulfato de magnesio y lidocaína EV en cirugía abierta seleccionada',
                  'Ketamina en dosis baja si hay tolerancia previa a opioides'],
    nota:'La regla de oro es que lo fijo va pautado y el opioide queda para el rescate, ' +
         'nunca al revés. Un paracetamol "si tiene dolor" es un paracetamol que no se da.'
  },
  toracica:{
    nombre:'Cirugía torácica y toracotomía',
    base:['Paracetamol fijo','AINE si no hay contraindicación','Opioide de rescate'],
    regional:['Bloqueo paravertebral torácico o catéter epidural torácico',
              'Bloqueo del erector de la espina (ESP) como alternativa segura',
              'Bloqueo intercostal como complemento'],
    coadyuvantes:['Considerar gabapentinoide preoperatorio en paciente de riesgo',
                  'Lidocaína EV en infusión'],
    nota:'Es la cirugía con mayor incidencia de dolor crónico postquirúrgico: hasta la mitad ' +
         'de los pacientes. Una analgesia intraoperatoria y postoperatoria bien hecha es la ' +
         'única prevención con evidencia. Vale la pena el esfuerzo.'
  },
  abdominal:{
    nombre:'Cirugía abdominal mayor',
    base:['Paracetamol fijo','AINE según función renal','Opioide de rescate'],
    regional:['Bloqueo TAP o del cuadrado lumbar','Epidural torácica en laparotomía amplia',
              'Bloqueo del recto abdominal en incisión mediana'],
    coadyuvantes:['Lidocaína EV en infusión, con buena evidencia en cirugía abdominal',
                  'Dexametasona intraoperatoria'],
    nota:'La recuperación del tránsito intestinal es parte del resultado: cuanto menos opioide, ' +
         'antes se recupera y antes se va de alta.'
  },
  ortopedica:{
    nombre:'Cirugía ortopédica de miembros',
    base:['Paracetamol fijo','AINE (evaluar el efecto sobre la consolidación ósea)','Opioide de rescate'],
    regional:['Bloqueo de plexo o de nervio periférico según el territorio',
              'Catéter perineural en cirugía de mucho dolor',
              'Bloqueo del canal aductor en rodilla: analgesia conservando la fuerza del cuádriceps'],
    coadyuvantes:['Infiltración periarticular por el cirujano','Crioterapia y elevación'],
    nota:'En rodilla, el bloqueo femoral clásico da buena analgesia pero debilita el cuádriceps ' +
         'y aumenta las caídas. El del canal aductor resuelve eso y es el que corresponde hoy.'
  },
  mamaria:{
    nombre:'Cirugía mamaria',
    base:['Paracetamol fijo','AINE','Opioide de rescate'],
    regional:['Bloqueos PECS I y II','Bloqueo del serrato anterior','Bloqueo paravertebral'],
    coadyuvantes:['Dexametasona intraoperatoria'],
    nota:'Un tercio de las mastectomías deja dolor crónico, casi siempre en el territorio del ' +
         'nervio intercostobraquial. El bloqueo regional intraoperatorio baja esa incidencia.'
  },
  cesarea:{
    nombre:'Cesárea',
    base:['Paracetamol fijo','AINE (compatible con la lactancia)','Opioide de rescate'],
    regional:['Morfina intratecal en dosis baja','Bloqueo TAP o del cuadrado lumbar si no hubo neuroaxial'],
    coadyuvantes:[],
    nota:'Evitar codeína durante la lactancia: los metabolizadores ultrarrápidos del CYP2D6 ' +
         'concentran morfina en la leche y se describieron muertes de recién nacidos por esa vía.'
  },
  columna:{
    nombre:'Cirugía de columna',
    base:['Paracetamol fijo','AINE según criterio del cirujano por la consolidación','Opioide de rescate'],
    regional:['Bloqueo del erector de la espina','Infiltración de la herida'],
    coadyuvantes:['Gabapentinoide preoperatorio','Ketamina en dosis baja: muy útil en el paciente ' +
                  'que ya venía con opioides crónicos'],
    nota:'Muchos de estos pacientes llegan tolerantes al opioide. Calcular el MME previo y ' +
         'sumarle el requerimiento agudo evita tanto la subdosificación como la sobredosis.'
  }
};

function ventanaAgudo() {
  abrir({id:'agudo', titulo:'Dolor agudo y postoperatorio', ancha:true, dibujar(c) {
    const activos = pacientesReales()
      .filter(p => p.ambito === 'agudo' && !p.altaAgudo)
      .sort((a, b) => (b.modificado || '').localeCompare(a.modificado || ''));

    c.appendChild(superficie('+ Nuevo seguimiento de dolor agudo',
      'Postoperatorio, interconsulta de sala o dolor agudo en guardia', () => {
        const p = pacienteNuevo();
        p.ambito = 'agudo';
        p.agudo = {tipo:'general', cirugia:'', fecha:hoy(), cama:'', servicio:'',
                   tecnica:'', controles:[]};
        guardar('pacientes', p.id, p);
        ventanaAgudoPaciente(p.id);
      }, 'acento'));

    if (!activos.length) {
      c.insertAdjacentHTML('beforeend', vacio('Sin seguimientos activos',
        'Los pacientes de dolor agudo aparecen acá mientras estén en seguimiento. ' +
        'Al darles el alta salen de la lista pero la historia queda.'));
    } else {
      c.insertAdjacentHTML('beforeend',
        '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
        'color:var(--tinta-3);margin:18px 0 8px">En seguimiento · ' + activos.length + '</h3>');
      for (const p of activos) {
        const ag = p.agudo || {};
        const ult = (ag.controles || [])[(ag.controles || []).length - 1];
        const n = document.createElement('div');
        n.className = 'pac';
        const col = ult && ult.nrsMov != null ? colorDolor(ult.nrsMov) : null;
        n.innerHTML =
          '<div class="ini">' + esc(iniciales(p)) + '</div>' +
          '<div class="med"><b>' + esc(nombreCompleto(p)) + '</b><small>' +
          esc([ag.cirugia, ag.cama ? 'cama ' + ag.cama : '', ag.servicio].filter(Boolean).join(' · ')) +
          (ag.fecha ? ' · día ' + Math.max(0, Math.floor((Date.now() - new Date(ag.fecha + 'T12:00:00')) / 86400000)) : '') +
          '</small></div>' +
          (col ? '<span class="marca-txt" style="background:' + col.color + ';color:' +
            (ult.nrsMov >= 3 && ult.nrsMov <= 6 ? '#3a2c00' : '#fff') + '">' +
            ult.nrsMov + ' mov.</span>' : marca('sin control', 'neutro'));
        n.onclick = () => ventanaAgudoPaciente(p.id);
        c.appendChild(n);
      }
    }

    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;' +
      'color:var(--tinta-3);margin:22px 0 8px">Esquemas de analgesia multimodal</h3>');
    for (const [k, e] of Object.entries(ESQUEMAS_AGUDO)) {
      c.appendChild(superficie(e.nombre, resumenCorto(e.nota, 80),
                               () => ventanaEsquemaAgudo(k), 'fina'));
    }
  }});
}

function ventanaEsquemaAgudo(clave) {
  const e = ESQUEMAS_AGUDO[clave];
  abrir({id:'esq_' + clave, titulo:e.nombre, sub:'Analgesia multimodal', dibujar(c) {
    c.insertAdjacentHTML('beforeend', bloque('Base pautada',
      '<ul style="margin:0;padding-left:18px;font-size:13.5px">' +
      e.base.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>'));
    if (e.regional.length) c.insertAdjacentHTML('beforeend', bloque('Técnica regional',
      '<ul style="margin:0;padding-left:18px;font-size:13.5px">' +
      e.regional.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>'));
    if (e.coadyuvantes.length) c.insertAdjacentHTML('beforeend', bloque('Coadyuvantes',
      '<ul style="margin:0;padding-left:18px;font-size:13.5px">' +
      e.coadyuvantes.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>'));
    c.insertAdjacentHTML('beforeend',
      '<div class="alerta info"><b>En la práctica</b><p>' + esc(e.nota) + '</p></div>' +
      '<p class="nota" style="margin-top:12px">Basado en la lógica procedimiento-específica de ' +
      'PROSPECT y en las recomendaciones de analgesia multimodal de ASA y ERAS. Verificar ' +
      'siempre contra el protocolo de la institución.</p>');
  }});
}

function ventanaAgudoPaciente(id) {
  abrir({id:'ag_' + id, titulo:'Dolor agudo', ancha:true, ctx:{id}, dibujar(c, ctx) {
    const p = ESTADO.pacientes[ctx.id];
    if (!p) return;
    p.agudo = p.agudo || {tipo:'general', controles:[]};
    const ag = p.agudo;
    if (!Array.isArray(ag.controles)) ag.controles = [];
    const g = () => { p.modificado = ahora(); guardar('pacientes', p.id, p); };

    const g1 = document.createElement('div'); g1.className = 'dos'; c.appendChild(g1);
    campo(g1, 'Apellido', p, 'apellido', {alCambiar:g});
    campo(g1, 'Nombre', p, 'nombre', {alCambiar:g});
    const g2 = document.createElement('div'); g2.className = 'tres'; c.appendChild(g2);
    campo(g2, 'Documento', p, 'dni', {alCambiar:g});
    campo(g2, 'Cama', ag, 'cama', {alCambiar:g});
    campo(g2, 'Servicio', ag, 'servicio', {alCambiar:g});
    const g3 = document.createElement('div'); g3.className = 'dos'; c.appendChild(g3);
    campo(g3, 'Cirugía o motivo', ag, 'cirugia', {alCambiar:g});
    campo(g3, 'Fecha', ag, 'fecha', {tipo:'date', alCambiar:g});

    const ct = document.createElement('div'); ct.className = 'campo';
    ct.innerHTML = '<label>Esquema aplicable</label>'; c.appendChild(ct);
    opciones(ct, Object.entries(ESQUEMAS_AGUDO).map(([v, e]) => ({t:e.nombre, v})), ag.tipo,
             v => { ag.tipo = v; g(); refrescar(); });

    if (ag.tipo && ESQUEMAS_AGUDO[ag.tipo]) {
      const e = ESQUEMAS_AGUDO[ag.tipo];
      c.insertAdjacentHTML('beforeend', cajaSugerencia('Esquema sugerido',
        '<div style="font-size:13.5px"><b>Base:</b> ' + esc(e.base.join(' · ')) + '</div>' +
        (e.regional.length ? '<div style="font-size:13.5px;margin-top:5px"><b>Regional:</b> ' +
          esc(e.regional.join(' · ')) + '</div>' : '') +
        (e.coadyuvantes.length ? '<div style="font-size:13.5px;margin-top:5px"><b>Coadyuvantes:</b> ' +
          esc(e.coadyuvantes.join(' · ')) + '</div>' : '') +
        '<p class="nota" style="margin-top:8px">' + esc(e.nota) + '</p>'));
    }

    campo(c, 'Técnica analgésica indicada', ag, 'tecnica', {area:true, filas:3, alCambiar:g,
      pista:'Catéter, bloqueo, PCA, esquema pautado con dosis…'});

    /* ---- controles diarios -------------------------------------------- */
    c.insertAdjacentHTML('beforeend',
      '<h3 style="font-size:15px;margin:20px 0 4px">Controles</h3>' +
      '<p class="nota" style="margin-bottom:10px">Se registran las dos intensidades. La que ' +
      'importa para decidir si la analgesia alcanza es la de <b>movimiento</b>: un paciente que ' +
      'está cómodo en la cama pero no puede toser ni levantarse está mal analgesiado.</p>');

    const serie = ag.controles.filter(x => x.nrsMov != null)
      .map(x => ({fecha:x.fecha, nrs:x.nrsMov}));
    if (serie.length) {
      c.insertAdjacentHTML('beforeend',
        '<div class="bloque"><h3>Intensidad en movimiento</h3>' + graficoEvolucion(serie) + '</div>');
    }

    c.appendChild(superficie('+ Registrar control', null, () => {
      const ctrl = {fecha:hoy(), hora:new Date().toTimeString().slice(0, 5),
                    nrsReposo:null, nrsMov:null, sedacion:'', nauseas:false,
                    rescates:0, texto:''};
      abrir({id:'agc_' + p.id, titulo:'Control de dolor agudo', ctx:{}, dibujar(cc) {
        for (const e of [{k:'nrsReposo', t:'Intensidad EN REPOSO'},
                         {k:'nrsMov', t:'Intensidad EN MOVIMIENTO (al toser, sentarse o movilizarse)'}]) {
          const z = document.createElement('div'); z.className = 'campo';
          z.innerHTML = '<label>' + esc(e.t) + '</label>'; cc.appendChild(z);
          escalaNRS(z, ctrl[e.k], v => { ctrl[e.k] = v; refrescar(); });
        }
        const cs = document.createElement('div'); cs.className = 'campo';
        cs.innerHTML = '<label>Sedación (escala de Pasero)</label>'; cc.appendChild(cs);
        opciones(cs, [
          {t:'S — dormido, se despierta fácil', v:'S'},
          {t:'1 — despierto y alerta', v:'1'},
          {t:'2 — algo somnoliento, se despierta fácil', v:'2'},
          {t:'3 — somnoliento, se duerme durante la conversación', v:'3'},
          {t:'4 — somnoliento, no responde', v:'4'}], ctrl.sedacion,
          v => { ctrl.sedacion = v; refrescar(); });
        if (ctrl.sedacion === '3' || ctrl.sedacion === '4') {
          cc.insertAdjacentHTML('beforeend',
            '<div class="alerta urgente"><b>Sedación de riesgo</b>' +
            '<p>Un nivel 3 o 4 de Pasero precede a la depresión respiratoria y obliga a suspender ' +
            'el opioide, estimular al paciente, dar oxígeno y evaluar naloxona. La sedación es un ' +
            'signo más precoz y más confiable que la frecuencia respiratoria.</p></div>');
        }
        const cn = document.createElement('div'); cn.className = 'campo';
        cn.innerHTML = '<label>Náuseas o vómitos</label>'; cc.appendChild(cn);
        opciones(cn, [{t:'Sí', v:true}], ctrl.nauseas ? true : null,
                 v => { ctrl.nauseas = !!v; });
        campo(cc, 'Rescates en las últimas 24 h', ctrl, 'rescates', {tipo:'number'});
        campo(cc, 'Observaciones', ctrl, 'texto', {area:true, filas:3});

        cc.appendChild(superficie('Guardar el control', null, () => {
          ag.controles.push(ctrl); g();
          avisar('Control registrado.', 'ok');
          volverA(PILA.findIndex(v => v.id === 'ag_' + p.id));
        }, 'acento'));
      }});
    }, 'suave'));

    for (let i = ag.controles.length - 1; i >= 0; i--) {
      const x = ag.controles[i];
      const cm = x.nrsMov != null ? colorDolor(x.nrsMov) : null;
      c.insertAdjacentHTML('beforeend',
        '<div class="bloque" style="margin-bottom:7px"><div style="display:flex;gap:9px;align-items:baseline">' +
        '<b style="flex:1">' + esc(fechaCorta(x.fecha)) + ' ' + esc(x.hora || '') + '</b>' +
        '<span class="nota">reposo ' + (x.nrsReposo ?? '—') + '</span>' +
        (cm ? '<span class="marca-txt" style="background:' + cm.color + ';color:' +
          (x.nrsMov >= 3 && x.nrsMov <= 6 ? '#3a2c00' : '#fff') + '">mov. ' + x.nrsMov + '</span>' : '') +
        '</div>' +
        '<div class="nota" style="margin-top:4px">' +
        esc([x.sedacion ? 'Pasero ' + x.sedacion : '', x.nauseas ? 'náuseas' : '',
             x.rescates ? x.rescates + ' rescates' : ''].filter(Boolean).join(' · ')) + '</div>' +
        (x.texto ? '<p style="font-size:13.5px;margin-top:5px">' + esc(x.texto) + '</p>' : '') +
        '</div>');
    }

    c.insertAdjacentHTML('beforeend', '<div style="height:14px"></div>');
    c.appendChild(superficie(p.altaAgudo ? 'Reabrir el seguimiento' : 'Dar de alta del seguimiento',
      p.altaAgudo ? '' : 'Sale de la lista de activos; la historia queda guardada', () => {
        p.altaAgudo = !p.altaAgudo; g(); refrescar();
      }, 'fina'));
    c.appendChild(superficie('Abrir como historia de dolor crónico',
      'Si el dolor persiste más de 3 meses, pasa a ser dolor crónico postquirúrgico', () => {
        p.ambito = 'cronico'; g(); ventanaHistoria(p.id);
      }, 'fina suave'));
  }});
}
