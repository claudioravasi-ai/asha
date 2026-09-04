/* =========================================================================
   CONFIGURACION DE FIREBASE
   -------------------------------------------------------------------------
   COMO COMPLETARLA (una sola vez)
     1. console.firebase.google.com  ->  crear proyecto
     2. Compilacion -> Realtime Database -> Crear base de datos
        (elegir la region mas cercana; South America esta bien)
     3. Compilacion -> Authentication -> Comenzar -> habilitar
        "Correo electronico / contraseña"
     4. Engranaje -> Configuracion del proyecto -> "Tus apps" -> icono </>
        -> registrar la app -> copiar el objeto de configuracion
     5. Pegar esos valores aca abajo, respetando las comillas
     6. Reconstruir con:  python3 build.py
     7. Pegar en la consola las reglas de  reglas-firebase.txt

   Si se deja vacio, la aplicacion funciona igual pero SOLO en este
   dispositivo: no hay portal del paciente ni acceso desde el celular.

   SOBRE LA SEGURIDAD
   Estas claves viajan dentro del index.html y son publicas por diseño: asi
   funciona Firebase en el navegador. Lo que protege las historias clinicas
   NO es esconder esta configuracion, sino las reglas de la base de datos.
   Sin las reglas de reglas-firebase.txt aplicadas, cualquiera que lea el
   codigo puede leer todas las historias. Con ellas aplicadas, hace falta una
   cuenta que el titular haya creado.
   ========================================================================= */
'use strict';

const FIREBASE_EMBEBIDA = {
  apiKey: "AIzaSyBEDl4qfTfTyI7KYKTrxKNGYH5Bd4YwGlA",
  authDomain: "algos-dolor.firebaseapp.com",
  databaseURL: "https://algos-dolor-default-rtdb.firebaseio.com",
  projectId: "algos-dolor",
  storageBucket: "algos-dolor.firebasestorage.app",
  messagingSenderId: "726462539382",
  appId: "1:726462539382:web:f2a13a05a4c47354c1e157"
};
