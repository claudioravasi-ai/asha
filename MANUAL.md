# ASHA — manual de uso

Cómo se usa la aplicación, paso a paso, desde que el paciente saca el turno
hasta que se mide si el tratamiento sirvió.

> **Antes de leer esto:** cargá los pacientes de prueba. Inicio → **Ajustes y
> copia de seguridad** → **«Cargar los pacientes de prueba»**. Son seis
> historias inventadas que entre todas recorren toda la aplicación, y este
> manual las usa de ejemplo. Se quitan después con un toque, y no tocan ningún
> paciente real.

---

## 0. Cómo se entra y cómo se sale

### Si Firebase todavía no está configurado

La pantalla dice «Firebase todavía no está configurado» y ofrece **«Entrar en
modo local»**. Se toca y ya estás adentro. Todo funciona menos dos cosas: no se
sincroniza entre dispositivos y el paciente no puede completar el cuestionario
desde su casa.

### Si ya está configurado

La pantalla pide **correo y contraseña**.

### La primera cuenta

Tocá **«Crear mi cuenta»**. Como todavía no hay ninguna, **no te va a pedir
código**: ponés tu nombre, tu correo y una contraseña, y quedás como **titular**.

> Hacelo **apenas publiques la aplicación**. Hasta que exista la primera cuenta,
> esa pantalla está abierta para cualquiera que conozca la dirección. En cuanto
> creás la tuya, se cierra sola.

### Dar de alta a alguien más

Todo desde la aplicación:

1. Tocá **tu inicial arriba a la derecha** → **Equipo**.
2. **«Invitar a alguien»**.
3. Nombre, correo y rol.
4. La aplicación genera un código tipo `ABCD-EFGH-JKMN-PQRS`.
5. Se lo pasás por donde quieras.
6. Esa persona toca **«Crear mi cuenta»** y usa el código.

El código sirve **una sola vez** y **solo para ese correo**.

### Los tres roles

| Rol | Qué puede |
|-----|-----------|
| **Titular** | Todo. Es el único que puede invitar y dar de baja. |
| **Médico** | Acceso clínico completo. |
| **Secretaría** | Agenda, filiación y bandeja de precargados. **No** ve diagnóstico, medicación ni evoluciones. |

Desde **Equipo** también se cambia el rol de alguien o se lo quita, con efecto
inmediato.

### Exactamente qué ve la secretaría

Esto no es una advertencia en un texto: está aplicado en el código y verificado
pantalla por pantalla.

**En la pantalla de inicio ve tres ventanas** en vez de seis:

| Ve | No ve |
|----|-------|
| **Precargados** | ~~Dolor agudo~~ |
| **Pacientes** | ~~Estadísticas~~ |
| **En seguimiento** | ~~Biblioteca~~ |

Tampoco le aparece el aviso rojo de pacientes con banderas rojas.

**En la lista de pacientes** ve el apellido, el nombre y el documento. No ve el
diagnóstico, ni la intensidad del dolor, ni el anillo de efectividad.

**Al abrir un paciente** ve una **ficha administrativa** y nada más:

- Nombre, documento, fecha de nacimiento
- Teléfono, correo
- Obra social y número de afiliado
- Quién lo derivó
- Próximo control

Puede editar los datos de contacto y cobertura, que es lo que necesita para
agendar y facturar. Debajo dice, con todas las letras: *«El contenido clínico de
esta historia —diagnóstico, medicación, evoluciones— lo ve únicamente el
personal médico.»*

**No accede** a: el diagnóstico, el motor de sugerencias, las banderas rojas, la
medicación y los equivalentes de morfina, las escalas, el examen físico, el
mapa del dolor, las evoluciones, la efectividad, el plan, los procedimientos ni
los consentimientos.

**En un cuestionario del portal** ve quién es, cómo ubicarlo, la cobertura, el
turno y si el paciente ya lo terminó. No ve el mapa del dolor, ni el DN4, ni las
respuestas clínicas.

> **Por qué así:** la secretaría necesita agendar, recibir y facturar, y para eso
> le alcanza con la ficha administrativa. Todo lo demás es secreto médico. La Ley
> 26.529 no distingue entre "mirar sin querer" y "acceder": si no hace falta para
> la tarea, no tiene que estar a la vista.

> **Una cuenta por persona, nunca compartida.** En una historia clínica hace
> falta poder saber quién escribió cada cosa.

### Por qué no hay registro abierto

Cualquiera que conozca la dirección puede **crearse una cuenta** en Firebase: la
clave del proyecto viaja dentro del programa y eso es así por diseño. Lo que las
reglas de la base controlan no es si tenés cuenta, sino **si figurás en el
equipo**. Una cuenta que no fue invitada no puede leer ni escribir nada.

Si alguien entra con una cuenta que no pertenece al consultorio, la aplicación se
lo dice y le ofrece cerrar la sesión.

### La versión, siempre a la vista

Al pie de la pantalla de inicio figura la versión y la fecha de la última
actualización:

```
ASHA · by Dra. Marcela Pevere
Versión 2026.09.04.1446 · actualizada el 4 de septiembre de 2026, 14:46
```

Sirve para una pregunta concreta: cuando alguien dice «a mí no me aparece eso»,
lo primero es mirar qué versión está usando. Casi siempre es una vieja que quedó
en el caché del navegador, y se resuelve recargando con `Cmd+Shift+R`.

### Salir

**Tu inicial, arriba a la derecha.** Se abre un panel chico con quién sos, tu rol
y tres opciones: **Equipo** (si sos titular), **Ajustes**, **Copia de seguridad**
y **Salir**, en rojo.

Está ahí y no enterrado en Ajustes a propósito: en una computadora compartida,
un «salir» que cuesta encontrar es un «salir» que nadie usa, y las sesiones
quedan abiertas.

---

## 1. Cómo está armada: no hay menú

La aplicación no tiene barra de menú, ni pestañas, ni botones sueltos. Tiene un
**lienzo** sobre el que se abren **ventanas**, y cada ventana se abre tocando
una superficie de la anterior.

Las ventanas que quedan atrás se contraen en **lomos verticales** sobre el borde
izquierdo, como los libros de un estante. Se lee de qué son y se vuelve a ellas
tocándolas.

```
┌────┬──────┬────────────────────────────────────┐
│    │      │                                    │
│ A  │ Hist │        Historia del dolor          │
│ L  │ oria │                                    │
│ G  │ clín │        ← ventana activa            │
│ O  │ ica  │                                    │
│ S  │      │                                    │
└────┴──────┴────────────────────────────────────┘
  ↑      ↑
  lomos: tocalos para volver
```

**Todo lo que tiene fondo propio y se levanta cuando pasás el mouse se puede
tocar.** Lo que es texto plano, no.

Tocando **ASHA** arriba a la izquierda volvés al inicio desde donde estés.

---

## 2. El circuito completo, en orden

```
   El paciente saca turno
            │
            ▼
   Entra a la dirección del portal (#turno)
   Deja DNI y correo
            │
            ▼
   Le llega un enlace por mail
            │
            ▼
   Completa el cuestionario en su casa, en varias veces
   (9 pasos, incluye el mapa del dolor con intensidad)
            │
            ▼
   Toca ENVIAR
            │
            ▼
   Aparece en PACIENTES PRECARGADOS   ← te llega un aviso por mail
            │
            ▼
   El día de la consulta: TOMAR EN CONSULTA
            │
            ▼
   Se crea la historia clínica con TODO ya cargado
   La aplicación ya leyó los datos y propone:
     · el mecanismo del dolor
     · un diagnóstico diferencial ordenado
     · las banderas rojas
     · las interacciones peligrosas de la medicación
            │
            ▼
   Examen físico → escalas → diagnóstico → plan
            │
            ▼
   Controles: cada uno mide efectividad con color y porcentaje
```

---

## 3. La pantalla de inicio

Seis ventanas grandes. El número grande es la cantidad.

| Ventana | Qué tiene |
|---------|-----------|
| **Precargados** | Cuestionarios que los pacientes completaron en su casa. Se destaca en color cuando hay alguno nuevo. |
| **Pacientes** | La base completa de historias clínicas. |
| **En seguimiento** | Los que tienen un control programado a futuro. |
| **Dolor agudo** | Postoperatorios e interconsultas en curso. |
| **Estadísticas** | Efectividad del consultorio, diagnósticos, carga opioide. |
| **Biblioteca** | Síndromes, vademécum, procedimientos, escalas, calculadora de morfina. |

Debajo: **paciente nuevo**, **el enlace del portal** y **ajustes**.

Si hay alguna bandera roja urgente sin revisar, o alguna historia con borrado
programado, aparece un aviso rojo arriba de todo.

---

## 4. El portal del paciente

### 4.1 Qué le pasás al paciente

La dirección está en **inicio → «Enlace del portal del paciente»**, con un botón
para copiarla. Es:

```
https://tu-direccion/#turno
```

Se la ponés en el ticket del turno, en un QR en el mostrador o se la mandás por
WhatsApp.

### 4.2 Qué ve el paciente

1. Pone su **documento** y su **correo** (dos veces, porque el enlace se manda
   ahí y no hay forma de recuperarlo si está mal escrito).
2. Le llega un **enlace personal** al correo. Ese enlace es la llave: no hay
   usuario ni contraseña.
3. Completa **nueve pasos**. Puede cerrar y volver: se guarda solo.

| Paso | Qué pregunta |
|------|--------------|
| 1 | Quién es (filiación, cobertura) |
| 2 | Antecedentes personales |
| 3 | Historia del dolor: cuándo, cómo, cómo es, cuánto |
| 4 | **Dónde le duele** — el mapa corporal |
| 5 | Tratamientos previos y medicación actual |
| 6 | Cómo le afecta la vida diaria y **qué quiere recuperar** |
| 7 | Las 7 preguntas del DN4 |
| 8 | Otros síntomas (banderas rojas) y ánimo |
| 9 | Revisar y **ENVIAR** |

4. Toca **ENVIAR**. Desde ahí ya no puede modificarlo: lo que vos ves es
   exactamente lo que él mandó.

### 4.3 El mapa del dolor

Es la parte que más aporta y la que el paciente completa mejor que cualquier
formulario.

- **Toca** sobre la silueta donde le duele.
- Le aparece una escala de 0 a 10: **cuánto le duele en ese punto**.
- La marca queda del color que corresponde:

| Intensidad | Color |
|------------|-------|
| 1–2 | 🟢 verde |
| 3–4 | 🟩 verde claro |
| 5–6 | 🟡 amarillo |
| 7–8 | 🟠 naranja |
| 9–10 | 🔴 rojo |

- Puede marcar todos los puntos que quiera.
- Para cambiar o borrar uno, lo toca de nuevo.
- **La vista frontal tiene nariz**; la posterior, no. Así no se confunde.

Funciona con el dedo en el celular, con el lápiz en la tablet y con el mouse.

> **Por qué esto no es un dibujito:** cada punto sabe en qué zona cayó, qué
> raíces nerviosas la inervan y a qué región del índice de dolor generalizado
> pertenece. De ahí salen solos el WPI de los criterios de fibromialgia y la
> evaluación de si la distribución es neuroanatómicamente plausible, que es el
> primer escalón de la gradación de dolor neuropático.

### 4.4 Cuando llega

Te llega un aviso al correo del consultorio (sin datos clínicos: solo dice que
hay algo para mirar) y aparece en **Precargados**.

Si el paciente marcó algún síntoma de alarma, la fila aparece con un **`!`** rojo.

---

## 5. Tomar un paciente en consulta

1. Inicio → **Precargados**.
2. Tocá al paciente. Se abre todo lo que cargó: identidad, dolor, mapa,
   tratamientos, medicación, impacto, DN4.
3. Si marcó síntomas de alarma, es lo primero que ves, en rojo.
4. Tocá **«Tomar en consulta»**.

Se crea la historia clínica con todo volcado y se abre.

> **Si ya existe un paciente con ese documento**, la aplicación te avisa y los
> datos se vuelcan sobre esa historia. No se duplica el paciente.

---

## 6. La historia clínica

Es la ventana central. El orden de lo que ves no es casual: **primero lo que
puede matar, después lo que puede dañar, después el razonamiento, y al final los
formularios.**

### 6.1 Arriba: quién es y cómo va

Nombre, edad, cobertura, diagnóstico, y a la derecha el **anillo de
efectividad**: un porcentaje con color.

Debajo, una franja del color correspondiente dice qué significa ese número y qué
conviene hacer.

Después, el **gráfico de evolución de la intensidad**: cada control es un punto
del color del semáforo, sobre bandas de fondo verde, amarilla y roja.

### 6.2 Banderas rojas

Si hay alguna, aparece en rojo con **qué hacer al respecto**, no solo el nombre.
Algunas las marca el paciente, otras las deduce sola la aplicación (por ejemplo:
si el ítem 9 del PHQ-9 dio positivo, dispara la evaluación de riesgo suicida).

### 6.3 Control de seguridad farmacológica

Revisa la medicación cargada contra la función renal, la edad, las
contraindicaciones y las interacciones. Es lo más útil del día a día.

Ejemplos reales de los pacientes de prueba:

- **Gómez** toma tramadol + duloxetina → *«Riesgo de síndrome serotoninérgico»*
  en rojo. Además tiene filtrado 42 y toma pregabalina → *«Ajustar el
  gabapentinoide por función renal»*.
- **Barrionuevo** tiene 120 MME/día → *«Dosis alta»* con qué hacer.
- Cualquiera con opioide y sin laxante → *«Falta profilaxis de constipación»*.

### 6.4 Lectura automática

Es la caja con borde punteado. Tiene tres partes:

**a) El mecanismo del dolor.** Nociceptivo, neuropático, nociplástico o mixto,
con el grado según los sistemas publicados (NeuPSIG para neuropático, Kosek 2021
para nociplástico) y **qué dato sostiene cada cosa**.

**b) El diagnóstico diferencial**, ordenado por porcentaje de concordancia, con
lo que juega a favor de cada uno. Tocá cualquiera para ver la ficha completa.

**c) Qué falta.** Si faltan datos importantes te lo dice antes, para que sepas
cuánto pesa lo que estás leyendo.

> **Todo lo que propone la aplicación lleva el aviso de que es una sugerencia
> generada por reglas y hay que verificarla.** La app propone, vos disponés. No
> se aplica nada solo: siempre hace falta un toque tuyo, y ese toque es el acto
> médico.

### 6.5 Las secciones

Diez superficies que abren cada parte de la historia:

| Sección | Qué se carga |
|---------|--------------|
| **Filiación y antecedentes** | Datos, antecedentes, alergias, **filtrado glomerular** y las **etiquetas** que usa el motor |
| **Historia del dolor y mapa** | Todo el interrogatorio, el mapa, el impacto y los **objetivos funcionales** |
| **Examen físico** | Los signos que el motor consulta, más el texto libre |
| **Escalas** | 17 instrumentos validados, con las pertinentes marcadas con ◇ |
| **Diagnóstico** | El síndrome, el código ICD-11 y tu fundamento |
| **Plan terapéutico** | Objetivo, indicaciones, estudios, procedimientos, próximo control |
| **Medicación** | Con cálculo de equivalentes de morfina y efectividad por fármaco |
| **Evoluciones y controles** | Cada control con intensidad, escalas y efectos adversos |
| **Consentimientos** | Emisión e impresión de consentimientos informados |
| **Resumen para el paciente** | Una página en lenguaje llano, para enviarle por correo |
| **Imprimir la historia** | Todo en un documento |

> 💡 **Las etiquetas de antecedentes importan.** En Filiación, la lista de
> «Antecedentes que el motor tiene en cuenta» es lo que hace que el análisis
> funcione bien. Si el paciente es diabético y no marcás «Diabetes», la
> aplicación puede detectarlo del texto, pero marcarlo es más confiable.

---

## 7. Cargar el examen físico

Los signos están agrupados como se exploran: neurológico, maniobras de columna,
musculoesquelético, autonómico y generales.

> **Uno importa más que todos:** el examen sensitivo. Es lo único que permite
> pasar de dolor neuropático **posible** a **probable** en la gradación NeuPSIG.
> Sin marcar hipoestesia, alodinia o hiperalgesia, el motor no puede subir de
> escalón por más alto que dé el DN4, porque el DN4 es una herramienta de
> tamizaje, no de gradación.

---

## 8. Las escalas

Inicio de la historia → **Escalas**. Las marcadas con **◇** son las que la
aplicación considera pertinentes para ese paciente, según su fenotipo y la
topografía del dolor.

Se completan tocando las opciones. El puntaje, la interpretación y la referencia
bibliográfica aparecen solos abajo, en vivo.

**Las cuatro que más conviene tener:**

| Escala | Para qué |
|--------|----------|
| **NRS** | Intensidad. Es la base de todo. |
| **DN4** | ¿Hay componente neuropático? Corte ≥4/10. |
| **PGIC** | Qué le pareció al paciente. **Tarda 15 segundos y es la que más pesa para medir efectividad.** |
| Un índice funcional (**BPI**, **Oswestry** o **NDI**) | Función, que es lo que le importa al paciente. |

---

## 9. El diagnóstico

Dos maneras:

**a) Adoptar uno del diferencial.** Tocá el síndrome en la lectura automática →
se abre su ficha completa → abajo, **«Adoptar como diagnóstico de este
paciente»**. Copia el nombre, el código ICD-11, el mecanismo y el grado.

**b) Escribirlo vos, con el código automático.** En la ventana de Diagnóstico,
el campo **Síndrome** tiene autocompletado: apenas escribís dos letras busca a la
vez en los 27 síndromes del catálogo y en el capítulo MG30 de la CIE-11, y
muestra las coincidencias debajo.

Al elegir una:

- Si es un **síndrome del catálogo**, completa el nombre, el **código ICD-11**,
  la denominación y el mecanismo, y deja enganchado el plan terapéutico sugerido.
- Si es un **código suelto** de la clasificación, completa el código y la
  denominación, y conserva el nombre tal como lo escribiste.

Ejemplos de lo que podés escribir: `fibro`, `ciat`, `trigem`, `herpes`,
`quimio`, `latigazo`, `tunel`, `fantasma`. También el código directo: `MG30.5`.

> El campo **nunca** te obliga a elegir de la lista. Si el diagnóstico no está
> en ninguna de las dos, lo escribís igual y no pasa nada.
>
> Y si preferís escribir el código a mano, la denominación se agrega sola: si
> ponés `MG30.01`, queda `MG30.01 — Dolor crónico generalizado`.

**Por qué esto importa:** buscar un código CIE-11 en otra pestaña es exactamente
la clase de fricción que hace que el campo termine vacío en todas las historias.
Con el código puesto, las estadísticas del consultorio y cualquier informe a una
obra social salen solos.

En los dos casos conviene completar **«Fundamento y diagnósticos diferenciales
considerados»**: es lo que hace que la historia sirva dentro de dos años, y es
lo que exigen las normas.

---

## 10. El plan terapéutico

Si ya adoptaste un diagnóstico, la aplicación propone un plan escalonado:
primera, segunda y tercera línea, con dosis de inicio y titulación, más lo no
farmacológico, los estudios y lo que hay que evitar.

**Y lo filtra contra este paciente.** Si tiene filtrado renal bajo, los fármacos
contraindicados aparecen marcados en naranja con el motivo. Si declaró una
alergia que coincide con el nombre del fármaco, también.

Con **«Volcar el plan sugerido a los campos de abajo»** se copia al campo
editable. Se **copia**, no se aplica: después lo editás como quieras.

---

## 11. La medicación y los equivalentes de morfina

Cada fármaco se elige del vademécum, con su dosis y frecuencia. Arriba aparece
la **carga opioide total en MME/día**, con su color y qué hacer:

| MME/día | Qué significa |
|---------|---------------|
| < 50 | Rango habitual |
| 50–89 | 🟡 Justificar por escrito, ofrecer naloxona domiciliaria |
| ≥ 90 | 🔴 Revisar la indicación, considerar descenso gradual |

> ⚠️ **Los MME miden exposición, no sirven para rotar.** Al pasar de un opioide
> a otro hay que reducir entre 25% y 50% por tolerancia cruzada incompleta, y
> con metadona la reducción es mucho mayor y no lineal. La aplicación lo repite
> cada vez que muestra un MME.

Cada fármaco tiene además su **propio anillo de efectividad**, medido solo dentro
de la ventana en que ese fármaco estuvo activo. Y si lo evaluás antes de tiempo,
te avisa: *«Lleva 12 días. La duloxetina necesita 2 a 4 semanas. Evaluar el
fracaso ahora sería prematuro.»*

---

## 12. Los controles y la efectividad

**Evoluciones y controles → «+ Registrar un control de hoy».**

Se carga: intensidad, evolución, cambios de tratamiento, escalas y efectos
adversos. Mientras ponés la intensidad, te muestra en vivo el porcentaje de
mejoría respecto del basal.

### Cómo se calcula la efectividad

No es solo el dolor. Es la combinación de cuatro cosas, con el peso que las
recomendaciones IMMPACT le dan a cada dominio:

| Peso | Qué |
|------|-----|
| **40%** | Alivio del dolor (caída porcentual del NRS) |
| **30%** | Función (BPI, Oswestry o NDI) |
| **20%** | Impresión del paciente (PGIC) |
| **10%** | Carga farmacológica (variación del MME) |
| — | Los efectos adversos descuentan hasta 15 puntos |

> **Por qué no solo el dolor:** medirlo solo por la escala numérica produce dos
> distorsiones opuestas. Un paciente que bajó dos puntos y volvió a trabajar
> figuraría como fracaso. Un paciente sedado con opioides que declara menos
> dolor pero no sale de la cama figuraría como éxito. Los dos casos son falsos.

### Los colores

| % | Color | Qué significa |
|---|-------|---------------|
| < 0 | 🔴 | **Empeoró.** Revisar el diagnóstico antes de cambiar el tratamiento. |
| 0–14 | 🟠 | **Sin respuesta.** Suspender lo que no funciona antes de agregar. |
| 15–29 | 🟡 | **Mínima.** Optimizar dosis antes de rotar. |
| 30–49 | 🟩 | **Relevante.** Es el umbral clínicamente significativo. |
| ≥ 50 | 🟢 | **Sustancial.** Consolidar y planificar el descenso. |

Debajo del número dice en cuántos dominios se apoya. Con uno solo es
orientativo; con tres o más es una medida sólida.

> **Excepción:** en dolor oncológico la carga opioide no se cuenta. Subir la
> dosis mientras la enfermedad progresa es hacer bien las cosas, no fracasar.

---

## 12 bis. Enviarle el resumen al paciente

Desde la historia clínica → **«Resumen para el paciente»**, o desde Evoluciones
→ **«Enviarle el resumen al paciente»**.

Genera **una página en lenguaje llano** con:

1. **Qué es lo que tiene**, con el mecanismo del dolor explicado sin jerga.
   Por ejemplo, para fibromialgia: *«El sistema que transmite el dolor quedó
   demasiado sensible y amplifica señales que en otra persona no dolerían. El
   dolor es completamente real; lo que cambió es el volumen con el que el cuerpo
   lo transmite.»*
2. **Cómo viene el tratamiento**, con el cambio del dolor en números y en
   palabras, y el estado de cada objetivo que acordaron.
3. **Lo que está tomando ahora**, con la pauta y **para qué sirve cada cosa** —
   que es la pregunta que el paciente hace siempre y que casi nunca queda
   contestada en la receta.
4. **Qué sigue**: próximo control, estudios pendientes, interconsultas.
5. **Cuándo consultar sin esperar el turno**: las pautas de alarma, que se
   arman según lo que tenga ese paciente y lo que esté tomando.

### Cómo se usa

1. Se abre la ventana y la aplicación arma el borrador.
2. Podés editar tres cosas: cómo empieza la carta, tu comentario sobre este
   control y cómo termina.

   > El comentario se copia de lo que escribiste en el último control. **Vale la
   > pena reescribirlo**: lo que anotaste para vos está escrito para un colega,
   > no para el paciente.

3. Abajo tenés la **vista previa exacta** de lo que va a recibir.
4. Recién ahí aparece **«Enviar por correo»**, y todavía te pregunta una vez más
   confirmando la dirección.
5. También podés **imprimirlo o guardarlo como PDF** para entregárselo en mano.

Queda registrado en la historia cuándo se envió, a qué dirección y si salió bien.

### Qué NO viaja

Es un resumen **conceptual**, no la historia clínica.

**No** se envían: el examen físico, los diagnósticos diferenciales, las notas
internas ni el razonamiento clínico.

> **Por qué:** el correo electrónico no es un canal que controle el consultorio.
> Queda copiado en servidores ajenos y se reenvía solo. Va lo que el paciente
> necesita para entender su tratamiento y cuidarse, y nada más.

---

## 13. Los procedimientos y el consentimiento

Desde la ficha de un síndrome, o desde Biblioteca → Procedimientos.

Cada procedimiento tiene indicaciones, técnica, evidencia, qué esperar,
complicaciones, y **la tabla de suspensión de anticoagulantes según su riesgo de
sangrado**. Si el paciente está marcado como anticoagulado, aparece un aviso
rojo arriba.

**«Emitir el consentimiento informado»** genera el texto completo, listo para
imprimir y firmar. Incluye las cuatro cosas que exigen las Normas de Dolor
argentinas: el procedimiento, el pronóstico, las complicaciones posibles y la
declaración expresa de que hay **garantía de medios y no de resultados**. Más el
derecho a revocarlo (Ley 26.529, art. 10) y el espacio para el representante
legal.

Después se marca como firmado y queda asentado en la historia con la fecha.

---

## 14. El módulo de dolor agudo

Inicio → **Dolor agudo**. Para postoperatorios, interconsultas de sala y guardia.

- Cada paciente tiene su cama, servicio, cirugía y técnica analgésica.
- Hay **esquemas de analgesia multimodal por tipo de cirugía**: torácica,
  abdominal, ortopédica, mamaria, cesárea y columna. Siguen la lógica
  procedimiento-específica de PROSPECT.
- Los controles se registran con **dos intensidades**: en reposo y **en
  movimiento**.

> **La que importa es la de movimiento.** Un paciente cómodo en la cama que no
> puede toser ni levantarse está mal analgesiado, y la escala en reposo lo
> oculta.

- La **escala de sedación de Pasero** dispara una alerta en nivel 3 o 4: la
  sedación precede a la depresión respiratoria y es un signo más precoz y
  confiable que la frecuencia respiratoria.
- Si el dolor persiste más de tres meses, **«Abrir como historia de dolor
  crónico»** lo pasa al consultorio como dolor postquirúrgico crónico, sin
  perder nada.

---

## 15. Borrar un paciente

**No se borra en el momento.**

1. Historia clínica → abajo de todo → **«Borrar este paciente»**.
2. Primera pregunta: *«¿Está segura de borrar este paciente?»*, que dice cuántos
   controles y escalas se pierden.
3. Segunda pregunta: confirmar. Ahí **se programa** el borrado.
4. Durante **10 minutos** la historia sigue entera, con un **reloj en cuenta
   regresiva** arriba de todo y una superficie para **cancelar**.
5. Pasado el plazo, se borra.

El reloj viaja con el registro: si lo programaste en la computadora del
consultorio y abrís la app en el celular, ves el mismo reloj y podés cancelarlo
desde ahí. También aparece en la lista de pacientes y en la pantalla de inicio.

> Diez minutos alcanzan para darse cuenta del error —que casi siempre es haber
> entrado al paciente equivocado— y son lo bastante cortos como para que nadie
> tenga que acordarse de volver a terminar el trabajo.

---

## 16. La biblioteca

Todo el conocimiento que usa el motor, consultable por separado:

| | Cantidad |
|---|---|
| Síndromes de dolor | 27, con criterios, estudios, tratamiento escalonado y controles |
| Vademécum | 35 fármacos con dosis, titulación, ajuste renal y hepático, interacciones |
| Procedimientos | 42 técnicas con indicación, complicaciones y consentimiento |
| Escalas | 17 instrumentos validados con sus puntos de corte y su fuente |
| Calculadora de morfina | Suma la carga opioide y avisa de los umbrales |
| Anticoagulación | Plazos de suspensión según el riesgo del procedimiento |

Cada recomendación lleva su referencia bibliográfica al pie.

---

## 17. Copia de seguridad

**Una vez por semana.** Inicio → Ajustes → **«Descargar copia de seguridad»**.

Baja un archivo con toda la base. Guardalo **fuera** de la computadora del
consultorio: un disco externo, un pendrive, Drive.

Para restaurar: **«Restaurar desde una copia»**. Los pacientes que ya existan
con el mismo identificador se sobrescriben con la versión del archivo.

> Es una historia clínica. La Ley 26.529 obliga a conservarla diez años y a
> poder entregarle una copia al paciente cuando la pida.

---

## 18. Preguntas frecuentes

**¿Funciona sin internet?**
Sí. Los datos se guardan primero en el dispositivo y después se espejan en la
nube. Si se corta la conexión en medio de una consulta, seguís escribiendo y se
sincroniza solo al volver. El punto de arriba a la derecha te dice cómo está:
verde sincronizado, amarillo sin conexión.

**¿La aplicación diagnostica?**
No, y no está pensada para eso. Hace lo que hace un residente ordenado: mirar
los datos, acordarse de la lista de posibilidades y ponerlas en orden para que
decida el que sabe. Todo sale marcado como sugerencia y todo es editable.

**¿Por qué la app propone un diagnóstico que no es el que yo pienso?**
Tocalo y mirá **qué juega a favor y qué en contra**. Muchas veces el motivo es
que falta un dato: el mapa corporal sin marcar, el DN4 sin completar o el examen
sensitivo sin cargar cambian el resultado por completo. Si con todo cargado
seguís pensando distinto, ponés el tuyo: para eso los campos son editables.

**¿Puedo cambiar el nombre de la aplicación?**
Sí, en `src/marca.js`, y se propaga a todas las pantallas, a los mails y a todo
lo que se imprime. Ver PUBLICAR.md, paso 1.

**¿Los pacientes de prueba molestan?**
No: están marcados aparte y se quitan de una sola vez desde Ajustes, sin tocar
ningún paciente real.

**¿Puedo usarla en la tablet durante la consulta?**
Sí, y es donde mejor funciona. Ver PUBLICAR.md, paso 5.5, para instalarla como
aplicación con su ícono.
