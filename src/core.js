/* =========================================================================
   NUCLEO — estado, almacenamiento, sincronizacion y utilidades
   -------------------------------------------------------------------------
   La aplicacion guarda TODO en el navegador primero y despues lo espeja en
   Firebase. Ese orden importa: si se cae internet en medio de una consulta,
   el medico sigue escribiendo y la historia no se pierde. Cuando vuelve la
   conexion, se sincroniza sola.

   ARBOL EN FIREBASE
     /dolor/pacientes/{id}      historias clinicas   — requiere estar logueado
     /dolor/precargas/{token}   cuestionarios que el paciente completa desde
                                su casa — escritura abierta, lectura solo
                                para el medico logueado
     /dolor/agenda/{id}         turnos
     /dolor/config              configuracion del consultorio

   Las reglas de seguridad correspondientes estan en reglas-firebase.txt y
   HAY QUE PEGARLAS EN LA CONSOLA: sin eso, o no funciona nada, o funciona
   todo para cualquiera.
   ========================================================================= */
'use strict';

/* ---------------------------------------------------------------- utiles */

const $  = (sel, raiz) => (raiz || document).querySelector(sel);
const $$ = (sel, raiz) => [...(raiz || document).querySelectorAll(sel)];

/* Escapa texto para meterlo en HTML. Se usa en TODO lo que viene del
   paciente: un apellido con un signo de menor que no puede romper la app. */
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function uid(prefijo) {
  return (prefijo || 'id') + '_' + Date.now().toString(36) + '_' +
         Math.random().toString(36).slice(2, 8);
}

/* Token del enlace que se le manda al paciente por mail. Se usa
   crypto.getRandomValues y no Math.random: es un secreto, no un identificador. */
function tokenSeguro() {
  const a = new Uint8Array(24);
  (window.crypto || window.msCrypto).getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, '0')).join('');
}

const hoy = () => new Date().toISOString().slice(0, 10);
const ahora = () => new Date().toISOString();

function fechaCorta(iso) {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-AR', {day:'2-digit', month:'2-digit', year:'numeric'});
}

function fechaLarga(iso) {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-AR', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
}

/* "hace 3 meses", "hace 2 años" — para leer de un vistazo cuánto hace que
   no se ve a un paciente. */
function desdeHace(iso) {
  if (!iso) return '';
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias < 0)   return 'en ' + Math.abs(dias) + ' días';
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 30)  return 'hace ' + dias + ' días';
  const meses = Math.floor(dias / 30);
  if (meses < 24) return 'hace ' + meses + (meses === 1 ? ' mes' : ' meses');
  return 'hace ' + Math.floor(meses / 12) + ' años';
}

/* Edad a partir de la fecha de nacimiento. */
function edadDe(fechaNac) {
  if (!fechaNac) return null;
  const n = new Date(fechaNac + 'T12:00:00');
  if (isNaN(n)) return null;
  const h = new Date();
  let e = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) e--;
  return e >= 0 && e < 130 ? e : null;
}

/* Normaliza texto para buscar: saca tildes y pasa a minúsculas, para que
   "Muñoz" se encuentre escribiendo "munoz". */
function normalizar(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function dniLimpio(s) {
  return String(s || '').replace(/\D/g, '');
}

function emailValido(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
}

/* -------------------------------------------------------------------------
   La version se arma sola al construir, con el formato AAAA.MM.DD.HHMM. Sirve
   para saber de un vistazo si el dispositivo que se tiene delante esta viendo
   la ultima version o quedo con una vieja en cache, que es la primera
   pregunta cuando alguien dice "a mi no me aparece eso".
   ------------------------------------------------------------------------- */
function versionLegible() {
  const v = String(window.ALGOS_BUILD || '');
  const m = v.match(/^(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})(\d{2})$/);
  if (!m) return {version:v || '—', fecha:'', texto:v || 'sin versión'};
  const [, a, mes, d, h, min] = m;
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
                 'agosto','septiembre','octubre','noviembre','diciembre'];
  const fecha = Number(d) + ' de ' + meses[Number(mes) - 1] + ' de ' + a +
                ', ' + h + ':' + min;
  return {version:v, fecha, texto:'Versión ' + v + ' · actualizada el ' + fecha};
}

/* ---------------------------------------------------------------- estado */

const ESTADO = {
  pacientes: {},      // id -> paciente con toda su historia
  precargas: {},      // token -> cuestionario que el paciente completa en su casa
  agenda: {},         // id -> turno
  equipo: {},         // uid -> quien puede entrar y con que rol
  invitaciones: {},   // codigo -> invitacion pendiente
  config: {},
  usuario: null,      // {uid, email, rol}
  conectado: false,
  listo: false
};

const CLAVE_LOCAL = 'algos_datos_v1';

/* -------------------------------------------------------- almacenamiento */

function guardarLocal() {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify({
      pacientes: ESTADO.pacientes,
      precargas: ESTADO.precargas,
      agenda: ESTADO.agenda,
      equipo: ESTADO.equipo,
      invitaciones: ESTADO.invitaciones,
      config: ESTADO.config,
      guardadoEn: ahora()
    }));
    return true;
  } catch (e) {
    /* El almacenamiento local tiene un tope de unos 5 MB. Cuando se llena,
       hay que avisarlo y no fallar en silencio: el médico creería que guardó. */
    console.error('No se pudo guardar localmente:', e);
    avisar('No se pudo guardar en este dispositivo. Puede que el almacenamiento ' +
           'esté lleno. Exportá una copia de seguridad ahora.', 'error');
    return false;
  }
}

function cargarLocal() {
  try {
    const crudo = localStorage.getItem(CLAVE_LOCAL);
    if (!crudo) return false;
    const d = JSON.parse(crudo);
    ESTADO.pacientes = d.pacientes || {};
    ESTADO.precargas = d.precargas || {};
    ESTADO.agenda    = d.agenda    || {};
    ESTADO.config    = d.config    || {};
    return true;
  } catch (e) {
    console.error('Los datos guardados no se pudieron leer:', e);
    return false;
  }
}

/* ------------------------------------------------------------- Firebase  */

let fbApp = null, fbDb = null, fbAuth = null;

function firebaseConfigurado() {
  return typeof FIREBASE_EMBEBIDA === 'object' &&
         FIREBASE_EMBEBIDA && FIREBASE_EMBEBIDA.databaseURL;
}

function iniciarFirebase() {
  if (!firebaseConfigurado() || typeof firebase === 'undefined') {
    console.warn('Firebase no configurado: la aplicación trabaja solo en este dispositivo.');
    return false;
  }
  try {
    fbApp  = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_EMBEBIDA);
    fbDb   = firebase.database();
    fbAuth = firebase.auth();

    fbDb.ref('.info/connected').on('value', s => {
      ESTADO.conectado = !!s.val();
      pintarEstadoConexion();
    });
    return true;
  } catch (e) {
    console.error('Firebase no arrancó:', e);
    return false;
  }
}

/* Escucha las tres ramas y mantiene el estado al día en todos los
   dispositivos abiertos a la vez. */
function escucharDatos() {
  if (!fbDb) return;
  const ramas = ['pacientes', 'precargas', 'agenda', 'equipo', 'invitaciones', 'config'];
  for (const rama of ramas) {
    fbDb.ref('dolor/' + rama).on('value', snap => {
      const v = snap.val();
      if (v) ESTADO[rama] = v;
      else if (rama !== 'config') ESTADO[rama] = {};
      guardarLocal();
      if (ESTADO.listo) refrescarVentanaActiva();
    }, err => console.error('Lectura de ' + rama + ':', err));
  }
}

/* Guarda un nodo en Firebase y en local. Devuelve una promesa para poder
   avisar al usuario si falló, en vez de dar por hecho que salió bien. */
function guardar(rama, id, dato) {
  ESTADO[rama][id] = dato;
  guardarLocal();
  if (!fbDb) return Promise.resolve(false);
  return fbDb.ref('dolor/' + rama + '/' + id).set(dato)
    .then(() => true)
    .catch(e => {
      console.error('No se pudo sincronizar:', e);

      /* El mensaje anterior decia siempre "se reintentara al recuperar la
         conexion", y eso solo es cierto cuando el problema ES la conexion.
         Si el servidor rechazo la escritura por permisos, no se va a
         reintentar nunca: prometerlo hace que el medico siga trabajando
         tranquilo mientras nada se guarda. Son dos situaciones distintas y
         tienen dos salidas distintas. */
      const permisos = e && (e.code === 'PERMISSION_DENIED' ||
                             /permission/i.test(e.message || ''));
      if (permisos) {
        avisar('No se pudo guardar en el servidor. Es probable que tu sesión ' +
               'haya vencido: salí y volvé a entrar.', 'error', 12000);
      } else {
        avisar('Sin conexión. Se guardó en esta computadora y se va a subir ' +
               'solo cuando vuelva internet.', 'aviso');
      }
      return false;
    });
}

function borrar(rama, id) {
  delete ESTADO[rama][id];
  guardarLocal();
  if (!fbDb) return Promise.resolve(false);
  return fbDb.ref('dolor/' + rama + '/' + id).remove().then(() => true).catch(() => false);
}

/* --------------------------------------------------------------- avisos  */

const MAX_AVISOS = 3;

function avisar(texto, tipo, ms) {
  const cont = $('#avisos') || document.body;

  /* Si el mismo aviso ya esta en pantalla, no se duplica: se le renueva el
     tiempo. Cuando se corta internet en medio de una consulta, cada guardado
     dispara el mismo mensaje y sin esto la pantalla queda tapada por veinte
     copias de la misma frase. */
  const iguales = $$('.aviso', cont).filter(n => n.dataset.txt === texto);
  if (iguales.length) {
    const n = iguales[iguales.length - 1];
    clearTimeout(Number(n.dataset.reloj));
    n.dataset.reloj = programarSalida(n, tipo, ms);
    return;
  }

  /* Y nunca mas de tres a la vez: el mas viejo se va. */
  const vivos = $$('.aviso', cont);
  for (let i = 0; i <= vivos.length - MAX_AVISOS; i++) vivos[i].remove();

  const d = document.createElement('div');
  d.dataset.txt = texto;
  d.className = 'aviso aviso-' + (tipo || 'info');
  d.innerHTML = esc(texto);
  cont.appendChild(d);
  requestAnimationFrame(() => d.classList.add('entra'));
  d.dataset.reloj = programarSalida(d, tipo, ms);
}

function programarSalida(nodo, tipo, ms) {
  const vida = ms || (tipo === 'error' ? 9000 : 4500);
  return setTimeout(() => {
    nodo.classList.remove('entra');
    setTimeout(() => nodo.remove(), 400);
  }, vida);
}

function pintarEstadoConexion() {
  const n = $('#conexion');
  if (!n) return;
  n.className = 'conexion ' + (ESTADO.conectado ? 'ok' : 'sin');
  n.title = ESTADO.conectado
    ? 'Sincronizado: lo que escribís se guarda también en el servidor'
    : 'Sin internet. Lo que escribís se guarda en esta computadora y se sube solo ' +
      'cuando vuelva la conexión.';
}

/* ------------------------------------------------------- modelo paciente */

/* Ficha vacia. Todo lo que la aplicacion sabe de un paciente cuelga de aca. */
function pacienteNuevo() {
  return {
    id: uid('pac'),
    creado: ahora(),
    modificado: ahora(),
    origen: 'consultorio',        // 'consultorio' | 'portal'

    /* filiación */
    apellido:'', nombre:'', dni:'', fechaNac:'', sexo:'', email:'', telefono:'',
    obraSocial:'', afiliado:'', ocupacion:'', derivante:'', domicilio:'',

    /* antecedentes */
    antecedentes:{
      enfermedades:'', cirugias:'', alergias:'', familiares:'', habitos:'',
      medicacionNoDolor:'', banderas:[], etiquetas:[]
    },

    /* historia del dolor — se completa una vez y se revisa en cada consulta */
    dolor:{
      inicio:'', mecanismo:'', descripcion:'', descriptores:[],
      nrsAhora:null, nrsPromedio:null, nrsPeor:null, nrsMejor:null,
      patron:'', peorMomento:'', irradiacion:'', alivia:'', empeora:'',
      mapa:[],                    // puntos del mapa corporal con intensidad
      meses:null
    },

    impacto:{sueño:'', trabajo:'', animo:'', dejoDeHacer:'', objetivos:[]},

    tratamientosPrevios:[],       // [{que, cuando, resultado, obs}]
    medicacion:[],                // [{farmaco, dosis, frecuencia, desde, id}]

    escalas:{},                   // id de escala -> {items:[], total, fecha}

    examen:{signos:[], texto:'', observaciones:''},

    diagnostico:{
      sindrome:'', sindromeId:'', mecanismo:'', icd:'', grado:'',
      texto:'', aceptadoDeMotor:false, fecha:''
    },

    plan:{
      objetivo:'', farmacos:[], noFarmacologico:[], estudios:[],
      procedimientos:[], derivaciones:[], texto:''
    },

    evoluciones:[],               // [{fecha, nrs, texto, escalas, cambios, efectividad}]
    tratamientos:[],              // [{id, tipo, que, inicio, fin, nrsInicio, nrsActual, estado}]
    consentimientos:[],           // [{procedimiento, fecha, firmado, texto}]
    adjuntos:[],

    proximoControl:'',
    notas:''
  };
}

/* --------------------------------------------------- busqueda y ordenes  */

/* Una fila es basura de diagnostico si su clave empieza con guion bajo o si
   lleva la marca _prueba. Se filtra en TODAS partes: en la lista, en los
   contadores y en las estadisticas. Un registro tecnico no puede aparecer
   nunca como si fuera una persona. */
function esRestoDeDiagnostico(id, p) {
  return String(id || '').startsWith('_') ||
         String(id || '').startsWith('prueba_') ||
         !!(p && p._prueba);
}

function pacientesReales() {
  return Object.entries(ESTADO.pacientes)
    .filter(([id, p]) => p && !esRestoDeDiagnostico(id, p))
    .map(([, p]) => p);
}

function buscarPacientes(texto) {
  const q = normalizar(texto).trim();
  const todos = pacientesReales();
  if (!q) return todos.sort(porApellido);
  const dni = dniLimpio(texto);
  return todos.filter(p =>
    normalizar(p.apellido + ' ' + p.nombre).includes(q) ||
    (dni && dniLimpio(p.dni).includes(dni)) ||
    normalizar(p.diagnostico && p.diagnostico.sindrome).includes(q)
  ).sort(porApellido);
}

const porApellido = (a, b) =>
  normalizar(a.apellido + a.nombre).localeCompare(normalizar(b.apellido + b.nombre));

function nombreCompleto(p) {
  if (!p) return '—';
  const n = [p.apellido, p.nombre].filter(Boolean).join(', ');
  return n || 'Sin nombre';
}

function iniciales(p) {
  const a = (p.apellido || '?')[0] || '?';
  const n = (p.nombre || '')[0] || '';
  return (a + n).toUpperCase();
}

/* Ultimo valor conocido de una escala. */
function ultimaEscala(p, idEscala) {
  const e = p.escalas && p.escalas[idEscala];
  return e && e.total != null ? e.total : null;
}

/* Ultimo NRS registrado: primero mira la evolucion mas reciente, y si no
   hay evoluciones, el de la historia inicial. */
function ultimoNRS(p) {
  const evos = (p.evoluciones || []).filter(e => e.nrs != null);
  if (evos.length) return evos[evos.length - 1].nrs;
  return p.dolor && p.dolor.nrsPromedio != null ? p.dolor.nrsPromedio : null;
}

function primerNRS(p) {
  if (p.dolor && p.dolor.nrsPromedio != null) return p.dolor.nrsPromedio;
  const evos = (p.evoluciones || []).filter(e => e.nrs != null);
  return evos.length ? evos[0].nrs : null;
}

/* =========================================================================
   BORRADO DIFERIDO
   -------------------------------------------------------------------------
   Borrar una historia clinica no puede ser una accion instantanea. Aca no se
   borra al confirmar: se PROGRAMA el borrado para dentro de diez minutos y
   durante todo ese tiempo la historia sigue entera y visible, con un reloj
   en cuenta regresiva y una superficie para arrepentirse.

   Diez minutos alcanzan para darse cuenta del error (que suele ser haber
   entrado al paciente equivocado) y son lo bastante cortos como para que
   nadie tenga que acordarse de volver a terminar el trabajo.

   La marca viaja en el propio registro, asi que si el borrado se programa
   en la computadora del consultorio y despues se abre la aplicacion en el
   celular, el celular ve el mismo reloj y puede cancelarlo. Y cualquiera de
   los dos dispositivos ejecuta el borrado cuando el plazo vence, aunque el
   que lo programo ya haya cerrado la aplicacion.
   ========================================================================= */

const MINUTOS_PARA_BORRAR = 10;

function programarBorrado(id) {
  const p = ESTADO.pacientes[id];
  if (!p) return;
  p.borradoProgramado = {
    desde: ahora(),
    ejecutaEn: new Date(Date.now() + MINUTOS_PARA_BORRAR * 60000).toISOString(),
    por: (ESTADO.usuario && ESTADO.usuario.email) || ''
  };
  p.modificado = ahora();
  guardar('pacientes', id, p);
}

function cancelarBorrado(id) {
  const p = ESTADO.pacientes[id];
  if (!p || !p.borradoProgramado) return;
  delete p.borradoProgramado;
  p.modificado = ahora();
  guardar('pacientes', id, p);
}

/* Segundos que faltan, o null si ese paciente no tiene borrado programado. */
function segundosParaBorrar(p) {
  if (!p || !p.borradoProgramado || !p.borradoProgramado.ejecutaEn) return null;
  const faltan = Math.round(
    (new Date(p.borradoProgramado.ejecutaEn).getTime() - Date.now()) / 1000);
  return faltan;
}

function relojBorrado(segundos) {
  const s = Math.max(0, segundos);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

/* Ejecuta los borrados vencidos. Se llama al arrancar y cada medio minuto:
   al arrancar, porque el plazo pudo vencer con la aplicacion cerrada. */
function revisarBorradosPendientes() {
  let borrados = 0;
  for (const [id, p] of Object.entries(ESTADO.pacientes)) {
    const faltan = segundosParaBorrar(p);
    if (faltan != null && faltan <= 0) {
      const quien = nombreCompleto(p);
      borrar('pacientes', id);
      borrados++;
      if (ESTADO.listo) avisar('Se borró la historia de ' + quien + '.', 'aviso');
    }
  }
  if (borrados && ESTADO.listo) refrescarVentanaActiva();
  return borrados;
}

let relojBorrados = null;
function vigilarBorrados() {
  if (relojBorrados) clearInterval(relojBorrados);
  revisarBorradosPendientes();
  relojBorrados = setInterval(revisarBorradosPendientes, 30000);
}

/* =========================================================================
   LIMPIEZA DE RESTOS DEL DIAGNOSTICO
   -------------------------------------------------------------------------
   El diagnostico de conexion escribia una fila con marca de tiempo en cada
   rama para probar la escritura. Mientras existio el ciclo de redibujado, esa
   prueba se relanzaba sola una y otra vez y dejo miles de filas en la base.

   Esto las borra. Solo toca las que llevan la marca tecnica: las claves que
   empiezan con guion bajo o con "prueba_", o los registros con _prueba. Un
   paciente real no puede tener ninguna de las dos cosas, porque los
   identificadores reales los genera uid() y siempre empiezan con "pac_".

   Se borra en lotes de 400 con un solo update por lote: 5000 llamadas sueltas
   tardarian minutos y muchas fallarian por saturacion.
   ========================================================================= */

function contarRestos() {
  const cuenta = {};
  for (const rama of ['pacientes', 'precargas', 'agenda', 'config']) {
    const ids = Object.keys(ESTADO[rama] || {})
      .filter(id => esRestoDeDiagnostico(id, ESTADO[rama][id]));
    if (ids.length) cuenta[rama] = ids.length;
  }
  return cuenta;
}

function limpiarRestos(alAvanzar) {
  const tareas = [];
  let total = 0;

  for (const rama of ['pacientes', 'precargas', 'agenda', 'config']) {
    const ids = Object.keys(ESTADO[rama] || {})
      .filter(id => esRestoDeDiagnostico(id, ESTADO[rama][id]));
    if (!ids.length) continue;
    total += ids.length;

    for (const id of ids) delete ESTADO[rama][id];

    if (fbDb) {
      for (let i = 0; i < ids.length; i += 400) {
        const lote = {};
        for (const id of ids.slice(i, i + 400)) lote[id] = null;
        tareas.push(() => fbDb.ref('dolor/' + rama).update(lote));
      }
    }
  }

  guardarLocal();
  if (!tareas.length) return Promise.resolve({total, subidos:total, lotesFallados:0});

  /* En serie y no en paralelo: mil borrados a la vez saturan la conexion.

     Y cada lote atrapa su propio error. Si uno falla, los demas siguen: con
     cinco mil registros, abandonar todo porque un lote se cayo obligaria a
     empezar de nuevo. Al final se informa cuantos lotes no salieron, en vez
     de decir "se borraron 0" cuando en realidad se borraron casi todos. */
  let hechos = 0, fallados = 0;
  return tareas.reduce(
    (cadena, tarea) => cadena.then(() =>
      tarea()
        .catch(e => { fallados++; console.error('Lote de limpieza:', e); })
        .then(() => { hechos++; if (alAvanzar) alAvanzar(hechos, tareas.length); })),
    Promise.resolve()
  ).then(() => ({total, lotes:tareas.length, lotesFallados:fallados}));
}

/* ------------------------------------------------------ copia de respaldo */

function exportarRespaldo() {
  const datos = {
    aplicacion:MARCA.nombre, version:1, exportado:ahora(),
    pacientes:ESTADO.pacientes, precargas:ESTADO.precargas,
    agenda:ESTADO.agenda, config:ESTADO.config
  };
  const blob = new Blob([JSON.stringify(datos, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  /* El nombre del archivo sigue a la marca: si manaña la app se llama de otra
     manera, los respaldos viejos y los nuevos no quedan con nombres distintos
     por una constante escrita a mano. */
  a.download = normalizar(MARCA.nombre).replace(/[^a-z0-9]+/g, '-') +
               '-respaldo-' + hoy() + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  avisar('Copia de seguridad descargada.', 'ok');
}

function importarRespaldo(archivo) {
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const d = JSON.parse(lector.result);
      if (!d.pacientes) throw new Error('El archivo no tiene pacientes.');
      const cuantos = Object.keys(d.pacientes).length;
      if (!confirm('Se van a incorporar ' + cuantos + ' pacientes.\n\n' +
                   'Los que ya existan con el mismo identificador se van a SOBRESCRIBIR ' +
                   'con la versión del archivo.\n\n¿Continuar?')) return;
      Object.assign(ESTADO.pacientes, d.pacientes);
      Object.assign(ESTADO.precargas, d.precargas || {});
      Object.assign(ESTADO.agenda, d.agenda || {});
      guardarLocal();
      if (fbDb) {
        fbDb.ref('dolor/pacientes').update(d.pacientes);
        if (d.precargas) fbDb.ref('dolor/precargas').update(d.precargas);
      }
      avisar('Se incorporaron ' + cuantos + ' pacientes.', 'ok');
      refrescarVentanaActiva();
    } catch (e) {
      avisar('No se pudo leer el archivo: ' + e.message, 'error');
    }
  };
  lector.readAsText(archivo);
}
