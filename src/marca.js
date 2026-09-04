/* =========================================================================
   MARCA — nombre, titular y datos del consultorio
   -------------------------------------------------------------------------
   Todo lo que identifica al consultorio vive ACA y en ningun otro lado. Para
   cambiar el nombre de la aplicacion, el medico titular o el telefono, se
   edita este archivo y se reconstruye con  python3 build.py . No hace falta
   tocar ninguna otra linea del programa.

   ALGOS viene del griego algos, dolor: la misma raiz de analgesia y de
   algologia. Es un nombre de trabajo; cambialo por el que quieras. Aparece
   en la pantalla de entrada, en la barra superior, en los mails al paciente
   y en el encabezado de todo lo que se imprime.
   ========================================================================= */
'use strict';

const MARCA = {
  nombre:      'ASHA',
  firma:       'by Dra. Marcela Pevere',   // acompaña al nombre en la portada
  bajada:      'Unidad de Dolor Agudo y Crónico',
  titular:     'Dra. Marcela Pevere',
  matricula:   'MM283 —',
  especialidad:'Anestesiología · Medicina del Dolor',
  consultorio: 'Consultorio de Dolor',
  direccion:   'HRU',
  telefono:    '-',
  whatsapp:    '542901419044',                         // con codigo de pais, sin espacios
  email:       'mmpevere1@gmail.com',
  ciudad:      'Ushuaia-AeIAS-Argentina'
};

/* Texto legal al pie de todo lo que sale de la aplicacion hacia el paciente.
   Ley 25.326 (proteccion de datos personales) y Ley 17.132 (ejercicio de la
   medicina) son las dos que aplican a una historia clinica informatizada en
   Argentina; la 26.529 es la de derechos del paciente y es la que obliga a
   que la historia clinica sea inviolable y de titularidad del paciente. */
const LEGAL_PIE =
  'Los datos que usted informa se tratan conforme a la Ley 25.326 de Protección de ' +
  'los Datos Personales y quedan amparados por el secreto médico (Ley 17.132). ' +
  'La historia clínica es de su titularidad (Ley 26.529, art. 14) y usted puede ' +
  'solicitar copia en cualquier momento. Esta información se usa exclusivamente ' +
  'para su atención médica y no se cede a terceros.';

/* Aviso que acompaña a TODA sugerencia automatica de la aplicacion. No es
   decorativo: la app propone, el medico dispone, y eso tiene que estar
   escrito donde el que lo lee lo vea. */
const AVISO_SUGERENCIA =
  'Sugerencia generada por reglas a partir de los datos cargados. No reemplaza ' +
  'el juicio clínico ni constituye un diagnóstico. Verificar antes de aceptar.';
