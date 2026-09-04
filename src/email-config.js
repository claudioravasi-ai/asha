/* =========================================================================
   ENVIO DE CORREO AL PACIENTE — CONFIGURACION
   -------------------------------------------------------------------------
   Un navegador no puede mandar mails. La aplicacion le pide a un programa
   chico alojado en Google Apps Script que lo haga, y ese programa envia
   desde la casilla de Gmail del consultorio.

   COMO COMPLETARLO (una sola vez, unos 10 minutos)
     1. script.google.com  con la cuenta de Google del consultorio
     2. Proyecto nuevo -> pegar el contenido de  apps-script/Codigo.gs
     3. Cambiar CLAVE_COMPARTIDA en ese archivo por una frase larga propia
     4. Implementar -> Nueva implementacion -> Aplicacion web
          Ejecutar como:      Yo
          Quien tiene acceso: Cualquier persona
     5. Copiar la URL que termina en /exec y pegarla abajo en ENVIO_URL
     6. Pegar abajo la MISMA frase del paso 3 en ENVIO_CLAVE
     7. Reconstruir con  python3 build.py

   SI SE DEJA VACIO
   El portal del paciente sigue funcionando: en vez de mandar el mail, le
   muestra el enlace en pantalla para que lo copie. No se rompe nada.

   ADVERTENCIA
   Estos dos valores viajan dentro del index.html publico. Quien los lea
   puede usar el envio para mandar correos desde la casilla del consultorio.
   El programa de Apps Script se defiende con un tope diario y un registro de
   todo lo que manda, pero eso limita el daño, no lo impide. Ante cualquier
   sospecha: cambiar la frase en los dos lados, reconstruir y volver a subir.
   ========================================================================= */
'use strict';

const ENVIO_URL   = 'https://script.google.com/macros/s/AKfycbw8jdBL2PqqpAtZ8L2MJWeG-herPL5oqkNqbpNLFJlogYxLBLAeFrfXfRB_6B2tdT06/exec';
const ENVIO_CLAVE = 'asha-pevere-ushuaia-2026-k7m3';
