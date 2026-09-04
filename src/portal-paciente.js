/* =========================================================================
   PORTAL DEL PACIENTE
   -------------------------------------------------------------------------
   Dos direcciones, dos momentos:

     #turno       la persona que saco turno entra, deja su DNI y su correo, y
                  recibe por mail un ENLACE personal.
     #c=TOKEN     ese enlace. Abre el cuestionario, que se guarda solo paso a
                  paso, y termina en un boton de ENVIAR.

   Por que un enlace y no un codigo de seis digitos: un codigo que genera y
   verifica el mismo navegador no prueba absolutamente nada. El enlace, en
   cambio, solo llega a la casilla que la persona declaro, y eso si es una
   prueba de que ese correo le pertenece.

   El cuestionario reproduce las nueve secciones del formulario en papel y
   agrega tres cosas que valen la pena: la intensidad por punto en el mapa
   corporal, un tamizaje breve de animo, y los objetivos que el paciente
   quiere recuperar, que despues son la vara con la que se mide si el
   tratamiento sirvio.
   ========================================================================= */
'use strict';

const PASOS_PORTAL = [
  {id:'quien',   titulo:'Quién es usted'},
  {id:'antec',   titulo:'Antecedentes personales'},
  {id:'dolor',   titulo:'Historia del dolor'},
  {id:'mapa',    titulo:'Dónde le duele'},
  {id:'previos', titulo:'Tratamientos y medicación'},
  {id:'impacto', titulo:'Cómo le afecta la vida'},
  {id:'dn4',     titulo:'Características del dolor'},
  {id:'otros',   titulo:'Otros síntomas'},
  {id:'enviar',  titulo:'Revisar y enviar'}
];

let PRECARGA = null;      // el cuestionario que se esta completando
let PASO = 0;

/* Encabezado unico del portal. Estaba repetido en cuatro pantallas y en una
   de ellas faltaba la firma; con una sola funcion eso no puede volver a pasar. */
function cabezaPortal(bajada) {
  return '<div class="portal-cabeza"><b>' + esc(MARCA.nombre) + '</b>' +
    (MARCA.firma ? '<span style="color:var(--acento);display:block">' +
      esc(MARCA.firma) + '</span>' : '') +
    (bajada ? '<span>' + esc(bajada) + '</span>' : '') + '</div>';
}

/* -------------------------------------------------------------- entrada  */

function arrancarPortal() {
  document.body.className = 'portal';
  const h = location.hash || '';
  const conToken = h.match(/^#c=([a-f0-9]{20,})/i);
  const cont = document.createElement('div');
  cont.className = 'portal-caja';
  cont.id = 'portal';
  document.body.innerHTML = '';
  document.body.appendChild(cont);
  document.body.insertAdjacentHTML('beforeend', '<div id="avisos"></div>');

  cont.insertAdjacentHTML('beforeend',
    cabezaPortal(MARCA.bajada));

  if (conToken) cargarCuestionario(conToken[1]);
  else pantallaPedirEnlace();
}

/* ---------------------------------------------------- pedir el enlace --- */

function pantallaPedirEnlace() {
  const cont = $('#portal');
  const v = document.createElement('section');
  v.className = 'ventana';
  v.innerHTML = '<header><div><h2>Cuestionario previo a la consulta</h2>' +
    '<div class="sub">Para completar antes de su turno</div></div></header>' +
    '<div class="cuerpo"></div>';
  const c = $('.cuerpo', v);

  c.insertAdjacentHTML('beforeend',
    '<p>Complete este formulario antes de su turno con el especialista en dolor. ' +
    'Cuanta más información aporte, más completa será la evaluación el día de la consulta.</p>' +
    '<p class="nota">Le vamos a enviar un enlace a su correo. Puede completarlo en varias ' +
    'veces: lo que escriba se guarda solo. Tarda entre 10 y 15 minutos.</p>');

  const d = {dni:'', email:'', email2:'', turno:''};
  campo(c, 'Número de documento', d, 'dni',
        {pista:'sin puntos', ayuda:'Solo números, sin puntos ni espacios.'});
  campo(c, 'Correo electrónico', d, 'email', {tipo:'email', pista:'nombre@correo.com'});
  campo(c, 'Repita su correo electrónico', d, 'email2', {tipo:'email',
        ayuda:'Lo pedimos dos veces porque el enlace se envía ahí y no hay forma de recuperarlo si está mal escrito.'});
  campo(c, 'Fecha de su turno (si ya la tiene)', d, 'turno', {tipo:'date'});

  c.appendChild(superficie('Enviarme el enlace', 'Llega a su correo en menos de un minuto', () => {
    const dni = dniLimpio(d.dni);
    if (dni.length < 7) return avisar('Revise el número de documento.', 'error');
    if (!emailValido(d.email)) return avisar('El correo no parece válido.', 'error');
    if (d.email.trim().toLowerCase() !== d.email2.trim().toLowerCase())
      return avisar('Los dos correos no coinciden.', 'error');
    crearPrecarga(dni, d.email.trim().toLowerCase(), d.turno);
  }, 'acento'));

  c.insertAdjacentHTML('beforeend', '<p class="nota" style="margin-top:18px">' + esc(LEGAL_PIE) + '</p>');
  cont.appendChild(v);
}

function crearPrecarga(dni, email, turno) {
  const token = tokenSeguro();
  const p = {
    token, dni, email, turno: turno || '',
    creado: ahora(), modificado: ahora(),
    estado: 'borrador',              // borrador | enviado | tomado
    datos: cuestionarioVacio()
  };
  p.datos.dni = dni;
  p.datos.email = email;

  pantallaPortal('Enviando…', '<p class="nota">Un momento.</p>');

  /* El enlace NO se muestra en pantalla, ni siquiera cuando el envio falla.
     Todo el sentido de mandarlo por correo es que llegue a la casilla que la
     persona declaro: si ademas se lo mostraramos acá, cualquiera podria poner
     el DNI de otro y entrar igual, y el correo dejaria de probar nada.

     Por eso tampoco hay un boton de "empezar ahora": la unica puerta es el
     mail. Si el envio falla, se dice que fallo y se lo deriva al consultorio. */
  guardar('precargas', token, p).then(guardado => {
    if (!guardado && fbDb) {
      pantallaPortal('No pudimos registrar su solicitud',
        '<p>Hubo un problema al guardar sus datos y no podemos enviarle el enlace.</p>' +
        '<p class="nota">Por favor, comuníquese con el consultorio' +
        (MARCA.telefono && MARCA.telefono !== '-' ? ' al <b>' + esc(MARCA.telefono) + '</b>' : '') +
        (MARCA.whatsapp ? ' o por WhatsApp' : '') +
        '. También puede completar el cuestionario en papel el día de la consulta.</p>');
      return;
    }

    const enlace = location.origin + location.pathname + '#c=' + token;
    enviarEnlacePorMail(email, enlace, dni).then(ok => {
      if (ok) {
        pantallaPortal('Le enviamos el enlace',
          '<p>Revise su casilla <b>' + esc(email) + '</b>. Si no lo ve en unos minutos, ' +
          'mire en la carpeta de correo no deseado.</p>' +
          '<p><b>Guarde ese correo.</b> Ese enlace es el único que le permite entrar y ' +
          'volver a entrar para seguir completando el cuestionario en otro momento.</p>' +
          '<p class="nota">Ya puede cerrar esta página.</p>');
      } else {
        pantallaPortal('No pudimos enviarle el correo',
          '<p>Sus datos quedaron registrados, pero el correo no pudo salir en este momento.</p>' +
          '<p class="nota">Por favor, comuníquese con el consultorio' +
          (MARCA.telefono && MARCA.telefono !== '-' ? ' al <b>' + esc(MARCA.telefono) + '</b>' : '') +
          ' para que le reenvíen el enlace, o complete el cuestionario en papel el día ' +
          'de la consulta.</p>');
      }
    });
  });
}

/* Pantalla simple del portal: un titulo y un texto, sin nada mas que tocar.
   Se usa para todos los finales de camino. */
function pantallaPortal(titulo, cuerpoHTML) {
  const cont = $('#portal');
  cont.innerHTML = cabezaPortal();
  const v = document.createElement('section');
  v.className = 'ventana';
  v.innerHTML = '<header><div><h2>' + esc(titulo) + '</h2></div></header>' +
                '<div class="cuerpo">' + cuerpoHTML + '</div>';
  cont.appendChild(v);
  window.scrollTo(0, 0);
}

/* ------------------------------------------------- cargar y completar --- */

function cuestionarioVacio() {
  return {
    apellido:'', nombre:'', dni:'', fechaNac:'', sexo:'', email:'', telefono:'',
    obraSocial:'', ocupacion:'', derivante:'',
    enfermedades:'', cirugias:'', alergias:'', familiares:'', habitos:'',
    inicio:'', mecanismo:'', descripcion:'', descriptores:[],
    nrsAhora:null, nrsPromedio:null, nrsPeor:null, nrsMejor:null,
    patron:'', peorMomento:'', irradiacion:'', alivia:'', empeora:'',
    mapa:[],
    tratamientosRecibidos:[], tratamientos:[], medicacion:[],
    sueño:'', trabajo:'', animo:'', dejoDeHacer:'', objetivos:'',
    dn4:[null,null,null,null,null,null,null],
    phq4:[null,null,null,null],
    banderas:[], comentarios:'',
    consiente:false
  };
}

function cargarCuestionario(token) {
  const cont = $('#portal');
  cont.insertAdjacentHTML('beforeend',
    '<section class="ventana"><div class="cuerpo"><p class="nota">Buscando su cuestionario…</p></div></section>');

  const seguir = p => {
    if (!p) {
      pantallaPortal('No encontramos su cuestionario',
        '<p>Este enlace no corresponde a ningún cuestionario.</p>' +
        '<p class="nota">Lo más común es que se haya copiado cortado. El enlace es ' +
        'largo y termina con una tira de letras y números después del signo <b>#</b>. ' +
        'Volvé al correo y tocá directamente el botón, en vez de copiar y pegar.</p>' +
        '<p class="nota">Si el problema sigue, comuniquese con el consultorio' +
        (MARCA.telefono && MARCA.telefono !== '-' ? ' al ' + esc(MARCA.telefono) : '') +
        ' para que le reenvíen el enlace.</p>');
      return;
    }
    if (p.estado === 'enviado' || p.estado === 'tomado') { pantallaYaEnviado(p); return; }
    PRECARGA = p;
    if (!PRECARGA.datos) PRECARGA.datos = cuestionarioVacio();
    PASO = 0;
    pintarPaso();
  };

  /* Si no se puede LEER, no es lo mismo que no exista: decir "no encontrado"
     ante un problema de conexion hace que el paciente tire el enlace a la
     basura creyendo que no sirve. Se distinguen los dos casos. */
  const noSePudoLeer = e => {
    console.error('Lectura de la precarga:', e);
    pantallaPortal('No pudimos abrir su cuestionario',
      '<p>El enlace es correcto, pero no pudimos conectarnos para abrirlo.</p>' +
      '<p class="nota"><b>No borre el correo.</b> Vuelva a intentarlo en unos minutos, ' +
      'o desde otra conexión.</p>');
  };

  const local = ESTADO.precargas[token];
  if (local) return seguir(local);

  if (!fbDb) return seguir(null);
  fbDb.ref('dolor/precargas/' + token).once('value')
    .then(s => seguir(s.val()))
    .catch(noSePudoLeer);
}

function guardarPrecarga() {
  if (!PRECARGA) return;
  PRECARGA.modificado = ahora();
  guardar('precargas', PRECARGA.token, PRECARGA);
}

function pintarPaso() {
  const cont = $('#portal');
  cont.innerHTML = cabezaPortal('Cuestionario previo a la consulta');

  cont.insertAdjacentHTML('beforeend', '<div class="pasos">' +
    PASOS_PORTAL.map((p, i) =>
      '<i class="' + (i < PASO ? 'hecho' : i === PASO ? 'actual' : '') + '"></i>').join('') +
    '</div>');

  const paso = PASOS_PORTAL[PASO];
  const v = document.createElement('section');
  v.className = 'ventana';
  v.innerHTML = '<header><div><h2>' + esc(paso.titulo) + '</h2>' +
    '<div class="sub">Paso ' + (PASO + 1) + ' de ' + PASOS_PORTAL.length + '</div>' +
    '</div></header><div class="cuerpo"></div>';
  const c = $('.cuerpo', v);
  const d = PRECARGA.datos;

  ({
    quien:pasoQuien, antec:pasoAntecedentes, dolor:pasoDolor, mapa:pasoMapa,
    previos:pasoPrevios, impacto:pasoImpacto, dn4:pasoDN4, otros:pasoOtros, enviar:pasoEnviar
  })[paso.id](c, d);

  /* Navegación: dos superficies, sin barra de botones. */
  if (paso.id !== 'enviar') {
    const nav = document.createElement('div');
    nav.className = 'fila';
    nav.style.marginTop = '22px';
    if (PASO > 0) nav.appendChild(superficie('◀ Anterior', null, () => { PASO--; pintarPaso(); }));
    nav.appendChild(superficie('Continuar ▶', null, () => {
      guardarPrecarga(); PASO++; pintarPaso(); window.scrollTo(0, 0);
    }, 'acento'));
    c.appendChild(nav);
    c.insertAdjacentHTML('beforeend',
      '<p class="nota" style="margin-top:12px;text-align:center">Lo que escribió se guarda solo. ' +
      'Puede cerrar y volver con el mismo enlace.</p>');
  }

  cont.appendChild(v);
  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------- pasos ---- */

function pasoQuien(c, d) {
  c.insertAdjacentHTML('beforeend', '<p class="nota" style="margin-bottom:14px">' +
    'Estos datos son para identificarlo y para la facturación de su cobertura.</p>');
  const g1 = document.createElement('div'); g1.className = 'dos'; c.appendChild(g1);
  campo(g1, 'Apellido', d, 'apellido');
  campo(g1, 'Nombre', d, 'nombre');
  const g2 = document.createElement('div'); g2.className = 'dos'; c.appendChild(g2);
  campo(g2, 'Documento', d, 'dni');
  campo(g2, 'Fecha de nacimiento', d, 'fechaNac', {tipo:'date'});
  const g3 = document.createElement('div'); g3.className = 'dos'; c.appendChild(g3);
  campo(g3, 'Teléfono', d, 'telefono', {tipo:'tel'});
  campo(g3, 'Correo electrónico', d, 'email', {tipo:'email'});

  const cs = document.createElement('div'); cs.className = 'campo';
  cs.innerHTML = '<label>Sexo</label>'; c.appendChild(cs);
  opciones(cs, [{t:'Femenino',v:'F'},{t:'Masculino',v:'M'},{t:'Otro',v:'X'}], d.sexo,
           v => { d.sexo = v; guardarPrecarga(); });

  const g4 = document.createElement('div'); g4.className = 'dos'; c.appendChild(g4);
  campo(g4, 'Obra social o prepaga', d, 'obraSocial');
  campo(g4, 'Ocupación', d, 'ocupacion');
  campo(c, '¿Quién lo derivó?', d, 'derivante', {pista:'nombre del médico o servicio'});
}

function pasoAntecedentes(c, d) {
  campo(c, 'Enfermedades diagnosticadas', d, 'enfermedades',
    {area:true, filas:3, pista:'por ejemplo: diabetes, hipotiroidismo, artritis…'});
  campo(c, 'Cirugías previas', d, 'cirugias',
    {area:true, filas:3, pista:'tipo de cirugía y año aproximado'});
  campo(c, 'Alergias', d, 'alergias',
    {area:true, filas:2, pista:'medicamentos u otras', ayuda:'Si nunca tuvo ninguna, escriba «ninguna conocida».'});
  campo(c, 'Antecedentes familiares relevantes', d, 'familiares', {area:true, filas:2});
  campo(c, 'Hábitos', d, 'habitos',
    {area:true, filas:2, pista:'tabaco, alcohol, actividad física, sueño'});
}

const DESCRIPTORES = [
  {t:'Quemante / ardor', v:'quemante'},   {t:'Punzante', v:'punzante'},
  {t:'Opresivo', v:'opresivo'},           {t:'Tipo corrientazo / eléctrico', v:'electrico'},
  {t:'Hormigueo / adormecimiento', v:'hormigueo'}, {t:'Pulsátil (late)', v:'pulsatil'},
  {t:'Sordo / profundo', v:'sordo'},      {t:'Rigidez', v:'rigidez'}
];

function pasoDolor(c, d) {
  campo(c, '¿Cuándo comenzó el dolor?', d, 'inicio',
    {tipo:'date', ayuda:'Si no recuerda el día exacto, ponga el primero del mes aproximado.'});
  campo(c, '¿Cómo comenzó?', d, 'mecanismo',
    {area:true, filas:2, pista:'golpe, cirugía, sin causa clara…'});
  campo(c, 'Describa el dolor con sus palabras', d, 'descripcion', {area:true, filas:3});

  const cd = document.createElement('div'); cd.className = 'campo';
  cd.innerHTML = '<label>¿Cómo es el dolor? Marque todo lo que corresponda</label>';
  c.appendChild(cd);
  opciones(cd, DESCRIPTORES, d.descriptores, v => { d.descriptores = v; guardarPrecarga(); }, true);

  for (const e of [
    {k:'nrsAhora',    t:'Intensidad del dolor AHORA'},
    {k:'nrsPromedio', t:'Intensidad promedio en las últimas 2 semanas'},
    {k:'nrsPeor',     t:'Intensidad en el PEOR momento'},
    {k:'nrsMejor',    t:'Intensidad en el MEJOR momento'}
  ]) {
    const cc = document.createElement('div'); cc.className = 'campo';
    cc.innerHTML = '<label>' + esc(e.t) + '</label>';
    c.appendChild(cc);
    escalaNRS(cc, d[e.k], v => { d[e.k] = v; guardarPrecarga(); });
  }

  const cp = document.createElement('div'); cp.className = 'campo';
  cp.innerHTML = '<label>¿Es constante o va y viene?</label>'; c.appendChild(cp);
  opciones(cp, [{t:'Constante',v:'constante'},{t:'Va y viene',v:'intermitente'},
                {t:'Constante con crisis',v:'mixto'}], d.patron,
           v => { d.patron = v; guardarPrecarga(); });

  campo(c, 'Momento del día en que es peor', d, 'peorMomento', {pista:'por ejemplo: de noche'});
  campo(c, '¿Se irradia a otra zona?', d, 'irradiacion',
    {pista:'por ejemplo: baja por la pierna hasta el pie'});
  const g = document.createElement('div'); g.className = 'dos'; c.appendChild(g);
  campo(g, '¿Qué lo alivia?', d, 'alivia', {area:true, filas:2});
  campo(g, '¿Qué lo empeora?', d, 'empeora', {area:true, filas:2});
}

function pasoMapa(c, d) {
  c.insertAdjacentHTML('beforeend',
    '<p>Toque sobre las siluetas donde siente dolor. Después de cada toque le vamos a ' +
    'preguntar <b>cuánto</b> le duele en ese punto, y la marca va a quedar de un color: ' +
    'verde si es leve, roja si es muy intenso.</p>' +
    '<p class="nota" style="margin-bottom:14px">Puede marcar todos los puntos que quiera. ' +
    'Para cambiar o borrar uno, tóquelo de nuevo.</p>');
  if (!Array.isArray(d.mapa)) d.mapa = [];
  const zona = document.createElement('div');
  c.appendChild(zona);
  dibujarMapa(zona, d.mapa, () => { guardarPrecarga(); pintarContador(); });

  const contador = document.createElement('p');
  contador.className = 'nota';
  contador.style.textAlign = 'center';
  contador.style.marginTop = '10px';
  c.appendChild(contador);
  function pintarContador() {
    const n = d.mapa.length;
    contador.textContent = n === 0 ? 'Todavía no marcó ningún punto.'
      : n + (n === 1 ? ' punto marcado.' : ' puntos marcados.');
  }
  pintarContador();
}

const TRATAMIENTOS_RECIBIDOS = [
  {t:'Kinesiología / fisioterapia', v:'kinesiologia'},
  {t:'Medicación oral', v:'medicacion'},
  {t:'Infiltraciones / bloqueos', v:'bloqueos'},
  {t:'Cirugía relacionada', v:'cirugia'},
  {t:'Acupuntura', v:'acupuntura'},
  {t:'Psicología / psiquiatría', v:'psicologia'},
  {t:'Terapia ocupacional', v:'to'},
  {t:'Medicina alternativa (otra)', v:'alternativa'}
];

function pasoPrevios(c, d) {
  c.insertAdjacentHTML('beforeend', '<h3 style="font-size:15px;margin-bottom:8px">' +
    'Tratamientos que ya recibió para este dolor</h3>');
  const ct = document.createElement('div'); ct.className = 'campo'; c.appendChild(ct);
  opciones(ct, TRATAMIENTOS_RECIBIDOS, d.tratamientosRecibidos,
           v => { d.tratamientosRecibidos = v; guardarPrecarga(); }, true);

  if (!Array.isArray(d.tratamientos)) d.tratamientos = [];
  listaEditable(c, d.tratamientos, [
    {k:'que',       t:'Tratamiento', pista:'ej. bloqueo facetario'},
    {k:'cuando',    t:'¿Cuándo?',    pista:'ej. 2024'},
    {k:'resultado', t:'Resultado',   lista:['Mejoró','Igual','Empeoró']},
    {k:'obs',       t:'Observaciones', pista:'detalles'}
  ], 'Agregar tratamiento', guardarPrecarga);

  c.insertAdjacentHTML('beforeend',
    '<h3 style="font-size:15px;margin:22px 0 4px">Medicación que toma actualmente</h3>' +
    '<p class="nota" style="margin-bottom:10px">Incluya toda la medicación, aunque no sea ' +
    'para el dolor: presión arterial, tiroides, lo que sea. Nos sirve para no indicarle ' +
    'algo que se lleve mal con lo que ya toma.</p>');

  if (!Array.isArray(d.medicacion)) d.medicacion = [];
  listaEditable(c, d.medicacion, [
    {k:'nombre',     t:'Medicamento', pista:'ej. pregabalina'},
    {k:'dosis',      t:'Dosis',       pista:'ej. 75 mg'},
    {k:'frecuencia', t:'Frecuencia',  pista:'ej. cada 12 hs'},
    {k:'desde',      t:'¿Hace cuánto?', pista:'ej. 3 meses'}
  ], 'Agregar medicamento', guardarPrecarga);
}

function pasoImpacto(c, d) {
  campo(c, '¿Cómo afecta su sueño?', d, 'sueño', {area:true, filas:2});
  campo(c, '¿Cómo afecta su trabajo o sus actividades diarias?', d, 'trabajo', {area:true, filas:2});
  campo(c, '¿Cómo afecta su estado de ánimo?', d, 'animo', {area:true, filas:2});
  campo(c, '¿Qué actividades dejó de hacer por el dolor?', d, 'dejoDeHacer', {area:true, filas:2});
  campo(c, 'Si el tratamiento funcionara, ¿qué le gustaría volver a hacer?', d, 'objetivos',
    {area:true, filas:3,
     pista:'ej. dormir de corrido, jugar con mis nietos, volver a trabajar media jornada',
     ayuda:'Esta respuesta no es de relleno: es la vara con la que vamos a medir si el ' +
           'tratamiento sirvió. Sea lo más concreto que pueda.'});
}

function pasoDN4(c, d) {
  c.insertAdjacentHTML('beforeend',
    '<p>Responda pensando en la zona donde <b>más</b> le duele.</p>' +
    '<p class="nota" style="margin-bottom:16px">Las últimas tres preguntas de este ' +
    'cuestionario las completa el médico durante el examen físico, así que acá no aparecen.</p>');

  if (!Array.isArray(d.dn4) || d.dn4.length !== 7) d.dn4 = [null,null,null,null,null,null,null];
  ESCALAS.dn4.items.slice(0, 7).forEach((it, i) => {
    const cc = document.createElement('div'); cc.className = 'campo';
    cc.innerHTML = '<label>' + esc(it.t) + '</label>';
    c.appendChild(cc);
    opciones(cc, [{t:'Sí',v:1,clase:'si'},{t:'No',v:0,clase:'no'}], d.dn4[i],
             v => { d.dn4[i] = v; guardarPrecarga(); });
  });
}

const BANDERAS_PACIENTE = [
  {t:'Pérdida de peso sin proponérmelo', v:'perdida_peso'},
  {t:'Fiebre', v:'fiebre'},
  {t:'Dolor que me despierta de noche y no mejora con el reposo', v:'dolor_nocturno'},
  {t:'Debilidad o adormecimiento que va en aumento en brazos o piernas', v:'deficit_progresivo'},
  {t:'Cambios en el control de la orina o la materia fecal', v:'esfinteres'},
  {t:'Antecedente personal de cáncer', v:'cancer'}
];

function pasoOtros(c, d) {
  c.insertAdjacentHTML('beforeend',
    '<p>Marque si tiene alguno de estos síntomas. Si no tiene ninguno, no marque nada.</p>');
  const cb = document.createElement('div'); cb.className = 'campo'; c.appendChild(cb);
  opciones(cb, BANDERAS_PACIENTE, d.banderas, v => { d.banderas = v; guardarPrecarga(); }, true);

  c.insertAdjacentHTML('beforeend',
    '<h3 style="font-size:15px;margin:22px 0 4px">Cómo se sintió estas dos semanas</h3>' +
    '<p class="nota" style="margin-bottom:12px">El dolor sostenido afecta el ánimo, y el ánimo ' +
    'afecta el dolor. Preguntarlo no es entrometerse: es parte del tratamiento.</p>');

  if (!Array.isArray(d.phq4) || d.phq4.length !== 4) d.phq4 = [null,null,null,null];
  const PHQ4 = [
    'Sentirse nervioso, ansioso o al límite',
    'No poder dejar de preocuparse o controlar la preocupación',
    'Poco interés o placer en hacer cosas',
    'Sentirse decaído, deprimido o sin esperanza'
  ];
  PHQ4.forEach((t, i) => {
    const cc = document.createElement('div'); cc.className = 'campo';
    cc.innerHTML = '<label>' + esc(t) + '</label>';
    c.appendChild(cc);
    opciones(cc, OP_FREC4, d.phq4[i], v => { d.phq4[i] = v; guardarPrecarga(); }, false);
  });

  campo(c, 'Otras preguntas o comentarios para el especialista', d, 'comentarios',
    {area:true, filas:4});
}

function pasoEnviar(c, d) {
  const faltan = [];
  if (!d.apellido || !d.nombre) faltan.push('su nombre y apellido');
  if (d.nrsPromedio == null) faltan.push('la intensidad promedio del dolor');
  if (!(d.mapa || []).length) faltan.push('marcar dónde le duele en la silueta');
  if (d.dn4.some(x => x == null)) faltan.push('las 7 preguntas sobre las características del dolor');

  c.insertAdjacentHTML('beforeend',
    '<p>Este es el resumen de lo que va a recibir el especialista.</p>');

  c.insertAdjacentHTML('beforeend', bloque('Resumen',
    dato('Paciente', esc([d.apellido, d.nombre].filter(Boolean).join(', ') || '—')) +
    dato('Documento', esc(d.dni)) +
    dato('Dolor desde', d.inicio ? esc(fechaCorta(d.inicio)) : '—') +
    dato('Intensidad promedio', d.nrsPromedio != null
      ? '<b>' + d.nrsPromedio + '/10</b> ' + marca(colorDolor(d.nrsPromedio).nombre,
          d.nrsPromedio <= 2 ? 'verde' : d.nrsPromedio <= 6 ? 'ambar' : 'rojo') : '—') +
    dato('Puntos marcados en el mapa', (d.mapa || []).length) +
    dato('Tratamientos previos declarados', (d.tratamientos || []).length) +
    dato('Medicación actual', (d.medicacion || []).length + ' medicamento(s)')
  ));

  if (faltan.length) {
    c.insertAdjacentHTML('beforeend',
      '<div class="alerta medio"><b>Falta completar</b><p>' +
      esc(faltan.join(' · ')) + '</p><p class="nota">Puede enviarlo igual, pero cuanto más ' +
      'completo llegue, menos tiempo de la consulta se va en preguntar lo que ya sabe.</p></div>');
  }

  const cc = document.createElement('div'); cc.className = 'campo';
  cc.innerHTML = '<label>Autorización para el tratamiento de sus datos</label>' +
    '<p class="nota" style="margin-bottom:8px">' + esc(LEGAL_PIE) + '</p>';
  c.appendChild(cc);
  opciones(cc, [{t:'Sí, autorizo', v:true}], d.consiente ? true : null,
           v => { d.consiente = !!v; guardarPrecarga(); pintarPaso(); });

  const nav = document.createElement('div');
  nav.className = 'fila';
  nav.style.marginTop = '20px';
  nav.appendChild(superficie('◀ Revisar', null, () => { PASO--; pintarPaso(); }));
  if (d.consiente) {
    nav.appendChild(superficie('ENVIAR al especialista',
      'Después de enviarlo ya no se puede modificar', enviarCuestionario, 'acento'));
  } else {
    nav.insertAdjacentHTML('beforeend',
      '<div class="superficie" style="opacity:.5;cursor:default"><b>ENVIAR al especialista</b>' +
      '<small>Marque la autorización para poder enviar</small></div>');
  }
  c.appendChild(nav);
}

function enviarCuestionario() {
  PRECARGA.estado = 'enviado';
  PRECARGA.enviado = ahora();
  guardar('precargas', PRECARGA.token, PRECARGA).then(() => {
    avisarAlMedico(PRECARGA);
    pantallaYaEnviado(PRECARGA);
  });
}

function pantallaYaEnviado(p) {
  pantallaPortal('Cuestionario enviado',
    '<p class="nota" style="margin-bottom:12px">' +
    esc(fechaLarga(p.enviado || p.modificado)) + '</p>' +
    '<p>Listo. El especialista va a tener sus respuestas antes de la consulta.</p>' +
    '<p class="nota">Si necesita corregir algo, avísele el día del turno: desde acá ya no ' +
    'se puede modificar, justamente para que lo que ve el especialista sea exactamente lo ' +
    'que usted envió.</p>' +
    (p.turno ? '<div class="bloque"><h3>Su turno</h3><p>' + esc(fechaLarga(p.turno)) + '</p></div>' : ''));
}

/* -------------------------------------------------------------------------
   Lista de filas que el paciente agrega y quita: tratamientos previos y
   medicacion. Se maneja igual en los dos casos.
   ------------------------------------------------------------------------- */
function listaEditable(nodo, lista, columnas, textoAgregar, alCambiar) {
  const cont = document.createElement('div');
  nodo.appendChild(cont);

  function pintar() {
    cont.innerHTML = '';
    lista.forEach((fila, i) => {
      const caja = document.createElement('div');
      caja.className = 'bloque';
      caja.style.marginBottom = '9px';
      const grilla = document.createElement('div');
      grilla.className = 'dos';
      caja.appendChild(grilla);
      for (const col of columnas) {
        if (col.lista) {
          const cc = document.createElement('div'); cc.className = 'campo';
          cc.innerHTML = '<label>' + esc(col.t) + '</label>';
          grilla.appendChild(cc);
          opciones(cc, col.lista, fila[col.k], v => { fila[col.k] = v; alCambiar(); pintar(); });
        } else {
          campo(grilla, col.t, fila, col.k, {pista:col.pista, alCambiar});
        }
      }
      caja.appendChild(superficie('Quitar', null, () => {
        lista.splice(i, 1); alCambiar(); pintar();
      }, 'fina peligro'));
      cont.appendChild(caja);
    });
    cont.appendChild(superficie('+ ' + textoAgregar, null, () => {
      const f = {}; for (const col of columnas) f[col.k] = '';
      lista.push(f); alCambiar(); pintar();
    }, 'suave'));
  }
  pintar();
}
