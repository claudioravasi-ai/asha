# ASHA — cómo ponerla en funcionamiento

Guía completa, en orden. Cada paso dice **qué hacer**, **dónde** y **cómo saber
que salió bien**.

No hace falta saber programar. Sí hace falta seguir el orden: cada paso usa
algo del anterior.

**Tiempo total:** entre 60 y 90 minutos la primera vez.

---

## Índice

| # | Paso | Cuánto tarda | ¿Se puede saltear? |
|---|------|--------------|--------------------|
| 0 | Probarla en tu computadora | 5 min | **No.** Es lo primero. |
| 1 | Ponerle tus datos | 10 min | No |
| 2 | Firebase: la base de datos compartida | 20 min | Solo si la vas a usar en una sola computadora |
| 3 | Firebase: las reglas de seguridad | 10 min | **NO. Nunca.** |
| 4 | Crear tu cuenta **desde la app** | 3 min | No |
| 5 | GitHub: publicarla en internet | 20 min | Sí, si la usás solo en la red del consultorio |
| 6 | El envío de correo al paciente | 15 min | Sí (la app funciona igual, muestra el enlace en pantalla) |
| 7 | Que los pacientes se enteren | — | No, o nadie la usa |

---

# PASO 0 — Probala primero, antes de configurar nada

**Esto es lo primero que tenés que hacer.** Antes de crear ninguna cuenta,
antes de tocar nada.

1. Abrí la carpeta `dolor` en tu computadora.
2. Hacé doble clic en **`index.html`**.
3. Se abre en el navegador. Tocá **«Entrar en modo local»**.
4. Abajo de todo, tocá **«Ajustes y copia de seguridad»**.
5. Tocá **«Cargar los pacientes de prueba»**.

Ya tenés seis historias completas para recorrer. Andá al **MANUAL.md** y hacé
el recorrido guiado. Cuando entiendas cómo funciona, volvé acá y seguí.

> **Por qué este paso va primero:** si configurás Firebase y GitHub antes de
> saber si la aplicación te sirve, invertiste una hora en algo que todavía no
> sabés si querés. Y si algo no te gusta, es mucho más fácil cambiarlo ahora
> que después de haberla publicado.

En modo local todo funciona menos dos cosas: no se sincroniza entre
dispositivos y el paciente no puede completar el cuestionario desde su casa.
Para eso son los pasos 2 y 5.

---

# PASO 1 — Ponerle tus datos

## 1.1 Editar el archivo de la marca

Abrí `dolor/src/marca.js` con cualquier editor de texto (TextEdit en Mac sirve,
pero **guardalo como texto plano**, no como documento con formato).

Vas a ver esto:

```js
const MARCA = {
  nombre:      'ASHA',
  firma:       'by Dra. Marcela Pevere',
  bajada:      'Unidad de Dolor Agudo y Crónico',
  titular:     'Dra. Marcela Pevere',
  matricula:   'M.N. —',
  especialidad:'Anestesiología · Medicina del Dolor',
  consultorio: 'Consultorio de Dolor',
  direccion:   '',
  telefono:    '',
  whatsapp:    '',
  email:       '',
  ciudad:      'Argentina'
};
```

Completá lo que corresponda **respetando las comillas**. Lo importante:

- **`matricula`** — poné tu matrícula real. Aparece en los consentimientos
  informados y en la historia impresa.
- **`email`** — la casilla del consultorio. Ahí van a llegar los avisos de que
  un paciente completó su cuestionario.
- **`whatsapp`** — con código de país y sin espacios: `5492901123456`.

## 1.2 Reconstruir la aplicación

Abrí la **Terminal** (en Mac: Aplicaciones → Utilidades → Terminal) y escribí:

```bash
cd ~/Desktop/Claude/dolor && python3 build.py
```

Tiene que responder algo así:

```
OK  index.html  550 KB  (build 2026.09.03.1930, 2026-09-03 19:30)
    23 modulos de JavaScript, 1 de CSS
```

**Cada vez que cambies algo en `src/`, hay que volver a correr ese comando.**
Es lo único que hace `build.py`: junta todos los archivos de `src/` en un solo
`index.html`.

Volvé a abrir `index.html` y fijate que arriba diga tu nombre.

---

# PASO 2 — Firebase: la base de datos compartida

Esto es lo que permite que la app funcione en la computadora del consultorio,
en tu celular y en la tablet **con los mismos datos**, y que el paciente pueda
completar su cuestionario desde la casa.

Es gratis para este volumen de uso. No pide tarjeta.

## 2.1 Crear el proyecto

1. Entrá a **https://console.firebase.google.com** con tu cuenta de Google.
2. Tocá **«Crear un proyecto»**.
3. Nombre del proyecto: `algos-dolor` (o el que quieras).
4. **Desactivá** Google Analytics — no lo necesitás y te ahorra dos pantallas.
5. Tocá **«Crear proyecto»** y esperá.

## 2.2 Crear la base de datos

1. En el menú de la izquierda: **Compilación → Realtime Database**.

   > ⚠️ **Ojo:** tiene que ser **Realtime Database**, NO **Firestore**. Son dos
   > productos distintos y esta aplicación usa el primero. Si elegís Firestore,
   > nada va a funcionar.

2. Tocá **«Crear base de datos»**.
3. Ubicación: elegí la más cercana. **`southamerica-east1`** está bien.
4. Reglas de seguridad: elegí **«Comenzar en modo bloqueado»**.

   > No importa cuál elijas, porque en el paso 3 las vas a reemplazar. Pero
   > empezar bloqueado es más seguro por si te olvidás.

5. Tocá **«Habilitar»**.

## 2.3 Habilitar las cuentas

1. Menú de la izquierda: **Compilación → Authentication**.
2. Tocá **«Comenzar»**.
3. En la lista de proveedores, elegí **«Correo electrónico/contraseña»**.
4. Activá el primer interruptor (**Habilitar**). El segundo, el de «Vínculo del
   correo electrónico», dejalo apagado.
5. Tocá **«Guardar»**.

## 2.4 Copiar la configuración

1. Arriba a la izquierda, tocá el **engranaje ⚙️ → Configuración del proyecto**.
2. Bajá hasta **«Tus apps»**.
3. Tocá el ícono **`</>`** (Web).
4. Sobrenombre de la app: `asha`. **No** marques Firebase Hosting.
5. Tocá **«Registrar app»**.
6. Te muestra un bloque de código. Buscá la parte que empieza con
   `const firebaseConfig = {` y **copiá solo lo de adentro de las llaves**:

```js
apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
authDomain: "algos-dolor.firebaseapp.com",
databaseURL: "https://algos-dolor-default-rtdb.southamerica-east1.firebasedatabase.app",
projectId: "algos-dolor",
storageBucket: "algos-dolor.firebasestorage.app",
messagingSenderId: "123456789012",
appId: "1:123456789012:web:abc123def456"
```

   > ⚠️ Si **no aparece `databaseURL`**, es porque copiaste la configuración
   > antes de crear la base de datos. Volvé al paso 2.2, creala, y volvé acá:
   > ahora sí aparece.

## 2.5 Pegarla en la aplicación

Abrí `dolor/src/firebase-config.js` y pegá esos valores entre las llaves,
reemplazando lo que está:

```js
const FIREBASE_EMBEBIDA = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "algos-dolor.firebaseapp.com",
  databaseURL: "https://algos-dolor-default-rtdb.southamerica-east1.firebasedatabase.app",
  projectId: "algos-dolor",
  storageBucket: "algos-dolor.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

Guardá y reconstruí:

```bash
cd ~/Desktop/Claude/dolor && python3 build.py
```

**Cómo saber que salió bien:** abrí `index.html`. Ahora, en vez de decir
«Firebase todavía no está configurado», te tiene que pedir **correo y
contraseña**. Todavía no vas a poder entrar: para eso falta el paso 4.

---

# PASO 3 — Las reglas de seguridad ⚠️ EL PASO MÁS IMPORTANTE

**Sin este paso, cualquier persona en internet puede leer todas las historias
clínicas.** No es una exageración ni una precaución teórica: la dirección de la
base de datos viaja dentro del `index.html`, que es público, y sin reglas la
base está abierta.

1. En Firebase: **Compilación → Realtime Database → pestaña «Reglas»**.
2. Vas a ver un bloque de texto. **Borralo todo.**
3. Abrí el archivo `dolor/reglas-firebase.txt` de tu computadora.
4. Copiá **solo la parte que empieza con `{` y termina con `}`** (está entre las
   dos líneas de signos `=====`).
5. Pegala en Firebase.
6. Tocá **«Publicar»**.

## 3.1 Verificar que quedaron bien

Esto no es opcional. Hacelo:

1. En la misma pantalla, tocá **«Simulador de reglas»** (arriba a la derecha).
2. Probá estas tres cosas:

| Ubicación | Tipo | Autenticado | Resultado esperado |
|-----------|------|-------------|--------------------|
| `/dolor/pacientes` | Lectura | **No** | 🔴 **Denegado** |
| `/dolor/precargas` | Lectura | **No** | 🔴 **Denegado** |
| `/dolor/equipo` | Lectura | **No** | 🔴 **Denegado** |
| `/dolor/pacientes` | Lectura | **Sí**, con un `uid` inventado | 🔴 **Denegado** |

**Las cuatro tienen que dar «Denegado».**

La cuarta es la más importante y es fácil pasarla por alto: un usuario que se
registró por su cuenta pero **no fue invitado** tampoco puede leer nada. Para
probarla, en el simulador activá «Autenticado» y poné un `uid` cualquiera que no
exista, por ejemplo `pruebafalsa123`.

**Si alguna da «Permitido», las reglas no se publicaron bien.** Volvé al paso 3 y
repetilo. No cargues ningún paciente real hasta que las cuatro den «Denegado».

---

# PASO 4 — Crear tu cuenta, desde la aplicación

Las cuentas **no se crean en la consola de Firebase**: se crean desde la propia
aplicación. Pero no cualquiera puede crearse una, y esa es la parte importante.

## 4.1 Habilitar el registro por correo

Si ya lo hiciste en el paso 2.3, saltealo.

Firebase → **Authentication → Sign-in method → «Correo electrónico/contraseña»**
→ habilitado.

## 4.2 Crear la primera cuenta — HACELO AHORA

1. Abrí la aplicación.
2. Tocá **«Crear mi cuenta»**.
3. Como todavía no hay ninguna cuenta, **no te pide código**.
4. Poné tu nombre, tu correo y una contraseña de al menos 8 caracteres.
5. Listo: quedás como **titular**, con acceso completo y con la facultad de
   invitar al resto.

> 🔴 **Esto hacelo apenas termines el paso 3, no dentro de unos días.**
>
> Mientras no exista ninguna cuenta, esa pantalla está abierta para cualquiera
> que conozca la dirección: el primero que llegue queda como titular. **En cuanto
> vos creás la tuya, la ventana se cierra sola** y nadie más puede registrarse
> sin invitación.
>
> Si todavía no publicaste en GitHub (paso 5), la dirección la sabés solo vos, así
> que el riesgo es nulo. Por eso conviene hacer los pasos en este orden.

## 4.3 Dar de alta al resto

Todo desde la aplicación, sin volver a Firebase:

1. Tocá tu inicial arriba a la derecha → **Equipo**.
   (O inicio → Ajustes → **«Quién puede entrar»**.)
2. **«Invitar a alguien»**.
3. Poné el nombre, el correo y el rol.
4. La aplicación genera un **código** tipo `ABCD-EFGH-JKMN-PQRS`.
5. Pasáselo por el medio que quieras: WhatsApp, en un papel, dictado.
6. Esa persona abre la aplicación, toca **«Crear mi cuenta»**, pone su correo,
   una contraseña y ese código.

El código **sirve una sola vez** y **solo para el correo** que pusiste. Si se
registra con otro correo, la base lo rechaza.

## 4.4 Los tres roles

| Rol | Qué puede |
|-----|-----------|
| **Titular** | Todo, y es el único que puede invitar y dar de baja. |
| **Médico** | Acceso clínico completo: historias, motor, medicación, procedimientos. |
| **Secretaría** | Agenda, datos de filiación y bandeja de precargados. **No** ve el contenido clínico: ni diagnóstico, ni medicación, ni evoluciones. El detalle exacto de lo que ve está en el MANUAL.md, sección 0. |

**Una cuenta por persona, nunca compartida.** En una historia clínica hace falta
poder saber quién escribió cada cosa.

Desde **Equipo** también se cambia el rol de alguien o se lo quita del equipo,
y la baja tiene efecto inmediato.

## 4.5 Por qué esto es seguro y el registro abierto no lo sería

Cualquiera que conozca la dirección de la aplicación **puede crearse una cuenta
en Firebase**: la clave del proyecto viaja dentro del `index.html`, que es
público, y eso es así por diseño de Firebase. No se puede evitar.

Lo que sí se puede —y es lo que hacen las reglas del paso 3— es **separar dos
cosas**:

- **Tener una cuenta** → cualquiera puede sacarse una.
- **Pertenecer al equipo** → solo por invitación tuya.

Las reglas de la base **no** preguntan «¿estás logueado?». Preguntan «¿figurás en
la lista del equipo?». Una cuenta que no fue invitada **no puede leer ni escribir
absolutamente nada**, aunque haya logrado registrarse.

Si alguien entra con una cuenta que no pertenece al equipo, la aplicación se lo
dice con todas las letras y le ofrece cerrar la sesión.

**Cómo saber que salió bien:** cerrá la sesión (tu inicial arriba a la derecha →
**Salir**) y volvé a entrar con tu correo y contraseña. Tenés que ver la pantalla
de inicio con tus pacientes.

---

# PASO 5 — GitHub: publicarla en internet

Esto es lo que hace que la app se pueda abrir desde **cualquier** computadora,
tablet o celular, sin instalar nada, y lo que permite que el paciente entre al
portal desde su casa.

Es gratis.

## 5.1 Crear la cuenta y el repositorio

1. Entrá a **https://github.com** y creá una cuenta si no tenés.
2. Arriba a la derecha, tocá el **`+` → «New repository»**.
3. Completá:
   - **Repository name:** `asha`
   - **Description:** (opcional)
   - Elegí **Public**

     > 🔴 **Importante:** «Public» significa que el **código** es visible, no las
     > historias clínicas. Las historias viven en Firebase y están protegidas
     > por las reglas del paso 3. GitHub Pages **solo funciona con repositorios
     > públicos** en las cuentas gratuitas.
     >
     > Esto es exactamente por qué el paso 3 no se puede saltear.

   - **NO** marques «Add a README file»
4. Tocá **«Create repository»**.

## 5.2 Subir los archivos

Vas a subirlos desde el navegador, sin usar Terminal.

1. En la página del repositorio recién creado, tocá **«uploading an existing
   file»** (el enlace azul en el medio de la pantalla).
2. Abrí la carpeta `dolor` en el Finder.
3. **Arrastrá estos archivos y carpetas** a la ventana del navegador:

   - ✅ `index.html`
   - ✅ `manifest.webmanifest`
   - ✅ `sw.js`
   - ✅ la carpeta `icons` entera

   Y **no** hace falta subir:
   - ❌ la carpeta `src` (ya está adentro del `index.html`)
   - ❌ `build.py`, `make-icons.py`
   - ❌ los archivos `.md` y `.txt`

   > Podés subirlos igual si querés tener el código completo respaldado en
   > GitHub — no molesta y es buena idea. Lo único imprescindible son los cuatro
   > de arriba.

4. Abajo, donde dice **«Commit changes»**, escribí `primera versión`.
5. Tocá el botón verde **«Commit changes»**.

## 5.3 Activar GitHub Pages

1. En el repositorio, tocá la pestaña **«Settings»** (arriba).
2. En el menú de la izquierda, tocá **«Pages»**.
3. En **«Source»** elegí **«Deploy from a branch»**.
4. En **«Branch»** elegí **`main`** y carpeta **`/ (root)`**.
5. Tocá **«Save»**.
6. Esperá entre 1 y 3 minutos y recargá la página.

Arriba va a aparecer:

```
Your site is live at https://TUUSUARIO.github.io/asha/
```

**Esa es la dirección de tu aplicación.** Anotala.

## 5.4 Autorizar la dirección en Firebase

Firebase solo deja entrar desde direcciones autorizadas.

1. Firebase → **Authentication → pestaña «Settings» → «Dominios autorizados»**.
2. Tocá **«Agregar dominio»**.
3. Escribí: `TUUSUARIO.github.io` (sin `https://` y sin `/asha`).
4. Tocá **«Agregar»**.

**Cómo saber que salió bien:** abrí la dirección de tu app desde el celular,
con datos móviles (no wifi). Entrá con tu cuenta. Tenés que ver los mismos
pacientes que en la computadora.

## 5.5 Instalarla como aplicación

En el celular o la tablet, abierta en el navegador:

- **iPhone / iPad (Safari):** tocá el botón de compartir (el cuadrado con la
  flecha) → **«Agregar a pantalla de inicio»**.
- **Android (Chrome):** menú de tres puntos → **«Instalar aplicación»** o
  **«Agregar a pantalla principal»**.

Queda con su ícono, se abre a pantalla completa y funciona sin internet
(los datos que ya tenía).

## 5.6 Cada vez que cambies algo

1. `python3 build.py` en tu computadora.
2. En GitHub, entrá al repositorio, tocá **`index.html`**, después el **lápiz ✏️**.
3. Seleccioná todo el contenido (`Cmd+A`) y borralo.
4. Abrí el `index.html` nuevo con un editor de texto, copiá todo (`Cmd+A`,
   `Cmd+C`) y pegalo en GitHub.
5. **«Commit changes»**.

   > Es engorroso porque el archivo es grande. La alternativa: subir el archivo
   > con **«Add file → Upload files»** arrastrando el `index.html` nuevo, que
   > reemplaza al anterior. Es más rápido.

Los cambios tardan 1 o 2 minutos en verse. Si no aparecen, recargá con
`Cmd+Shift+R`.

---

# PASO 6 — El envío de correo al paciente

Sin esto la app funciona igual: cuando el paciente pide su enlace, se lo muestra
en pantalla para que lo copie. Con esto, le llega solo al correo.

Instructivo completo y detallado en **`apps-script/Codigo.gs`** (está comentado
adentro del archivo). En resumen:

1. Entrá a **https://script.google.com** con la cuenta de Google del consultorio.
2. **«Proyecto nuevo»**. Borrá lo que haya.
3. Abrí `dolor/apps-script/Codigo.gs` y pegá **todo** su contenido.
4. En la línea 24, cambiá `CAMBIAR-ESTA-FRASE-POR-UNA-PROPIA-Y-LARGA` por una
   frase larga tuya. Por ejemplo: `algos-dolor-pevere-2026-x9k3m`.
5. Guardá (el ícono del disquete).
6. Tocá **«Implementar» → «Nueva implementación»**.
7. Al lado de «Seleccionar tipo», tocá el engranaje ⚙️ → **«Aplicación web»**.
8. Completá:
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** **Cualquier persona** ← importante
9. Tocá **«Implementar»**. Te va a pedir autorización: aceptá todo (va a
   aparecer un aviso de «Google no verificó esta aplicación» → **«Configuración
   avanzada» → «Ir a … (no seguro)»**; es tu propio script, es correcto).
10. Copiá la **URL de la aplicación web** (termina en `/exec`).

Abrí `dolor/src/email-config.js` y completá:

```js
const ENVIO_URL   = 'https://script.google.com/macros/s/AKfy...../exec';
const ENVIO_CLAVE = 'algos-dolor-pevere-2026-x9k3m';
```

`python3 build.py`, subir el `index.html` a GitHub.

**Cómo saber que salió bien:** entrá a `TU-DIRECCION/#turno`, poné un DNI
cualquiera y tu propio correo. Te tiene que llegar el mail.

---

# PASO 7 — Que los pacientes se enteren

Este es el paso que se olvida y el que decide si la app sirve o junta polvo.

La dirección del portal es:

```
https://TUUSUARIO.github.io/asha/#turno
```

En la aplicación la tenés en **inicio → «Enlace del portal del paciente»**, con
un botón para copiarla.

Lo que funciona en la práctica:

1. **Imprimirla en el ticket del turno.** Es lo más efectivo.
2. **Un código QR en el mostrador** con esa dirección. Cualquier generador de
   QR gratuito sirve.
3. **Mandarla por WhatsApp** cuando se confirma el turno.
4. **Un cartel en la sala de espera**: «Complete su cuestionario antes de la
   consulta y aproveche mejor el tiempo con la especialista».

Sin esto, la aplicación puede estar impecable y no la va a usar nadie.

---

# Resolución de problemas

| Síntoma | Causa más probable | Qué hacer |
|---------|--------------------|-----------|
| Dice «Firebase todavía no está configurado» | Falta pegar la config o no se reconstruyó | Paso 2.5 y `python3 build.py` |
| No puedo entrar: «El correo o la contraseña no son correctos» | La cuenta no existe | Creala con «Crear mi cuenta» (paso 4) |
| Entro y dice «Tu cuenta no pertenece a este consultorio» | Te registraste sin invitación, o el titular te dio de baja | Pedile al titular un código de invitación |
| «Ese código de invitación no existe» | Mal copiado, o fue anulado | Verificá los guiones, o pedí uno nuevo |
| «El código fue emitido para otro correo» | Te estás registrando con un correo distinto | Usá el correo exacto al que se emitió |
| «El registro por correo no está habilitado» | Falta activarlo en Firebase | Paso 4.1 |
| Entro pero no veo ningún paciente | Las reglas están mal | Paso 3.1, verificar con el simulador |
| Desde el celular no me deja entrar | Falta autorizar el dominio | Paso 5.4 |
| El punto de sincronización está amarillo | Sin internet | Los datos se guardan igual y se suben al reconectar |
| Subí el index.html nuevo y sigo viendo el viejo | Caché del navegador | `Cmd+Shift+R` (Mac) o `Ctrl+F5` (Windows) |
| El paciente no recibe el correo | Apps Script sin configurar | Paso 6. Mientras tanto la app le muestra el enlace |
| «Se guardó en este dispositivo pero no en la nube» | Se cortó internet | Se sube solo al volver la conexión |

---

# Lo que hay que hacer una vez por semana

**Bajar una copia de seguridad.** Inicio → Ajustes → «Descargar copia de
seguridad». Guardá el archivo fuera de la computadora del consultorio: un disco
externo, un pendrive, Drive.

Es una historia clínica. La Ley 26.529 obliga a conservarla diez años y a
poder entregarle una copia al paciente cuando la pida. Firebase es confiable,
pero una copia propia no se discute.
