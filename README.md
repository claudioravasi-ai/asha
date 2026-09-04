# ASHA — Unidad de Dolor Agudo y Crónico

Historia clínica de dolor para consultorio de anestesiología, con portal del
paciente, mapa corporal con intensidad, razonamiento clínico asistido y
seguimiento de efectividad.

Aplicación web sin instalación: se abre en cualquier computadora, tablet o
celular. Funciona sin internet y sincroniza al reconectar.

---

## Por dónde empezar

| Si querés… | Leé |
|------------|-----|
| **Probarla ahora mismo** | Abrí `index.html` → «Entrar en modo local» → Ajustes → «Cargar los pacientes de prueba» |
| **Aprender a usarla** | **[MANUAL.md](MANUAL.md)** |
| **Ponerla en internet** | **[PUBLICAR.md](PUBLICAR.md)** |

---

## Qué hace

**Portal del paciente.** Quien saca turno entra con su documento y su correo,
recibe un enlace personal y completa un cuestionario de nueve pasos desde su
casa, en varias veces. Al enviarlo cae en la bandeja del médico con todo cargado.

**Mapa corporal con intensidad.** El paciente toca la silueta donde le duele y
elige cuánto le duele en cada punto. La marca queda del color de un semáforo, del
verde al rojo. Cada punto sabe en qué zona cayó y qué raíces la inervan, así que
de ahí salen solos el índice de dolor generalizado de los criterios ACR 2016 y la
evaluación de plausibilidad neuroanatómica.

**Razonamiento clínico asistido.** A partir de los datos cargados, la aplicación
clasifica el mecanismo del dolor (nociceptivo, neuropático, nociplástico o
mixto) aplicando la gradación NeuPSIG y los criterios de Kosek 2021, propone un
diagnóstico diferencial ordenado por concordancia mostrando qué dato sostiene
cada opción, dispara las banderas rojas y revisa la medicación contra la función
renal, la edad y las interacciones. **Todo sale marcado como sugerencia y es
editable.**

**Efectividad con color y porcentaje.** Cada paciente y cada tratamiento tiene un
indicador que combina alivio del dolor (40%), función (30%), impresión del
paciente (20%) y carga farmacológica (10%), con los umbrales de IMMPACT.

**Dolor agudo.** Esquemas de analgesia multimodal por tipo de cirugía, con
seguimiento en reposo y en movimiento y escala de sedación.

**Consentimientos informados** que cumplen lo que exigen las Normas de Dolor
argentinas, y **resumen para el paciente** en una página de lenguaje llano.

---

## Qué contiene

| | |
|---|---|
| Síndromes de dolor | 27, con criterios, estudios, tratamiento escalonado y controles |
| Vademécum | 35 fármacos con dosis, titulación, ajustes renal y hepático, interacciones |
| Procedimientos | 42 técnicas con indicación, complicaciones y consentimiento |
| Escalas validadas | 17 instrumentos con sus puntos de corte y su fuente |
| Clasificación CIE-11 | Capítulo MG30 completo, con autocompletado |
| Zonas del mapa corporal | 56, con raíces nerviosas y regiones del índice WPI |

---

## Base clínica

Las recomendaciones citan su fuente en cada ficha. Las principales:

- **Clasificación.** IASP / OMS, capítulo MG30 de la CIE-11 (adoptado en 2019).
- **Dolor neuropático.** Gradación NeuPSIG (Finnerup, *Pain* 2016). Tratamiento:
  revisión sistemática y metaanálisis NeuPSIG, *Lancet Neurology* 2025 (313
  ensayos, más de 48.000 pacientes).
- **Dolor nociplástico.** Criterios y gradación de Kosek et al., *Pain* 2021.
- **Fibromialgia.** Criterios ACR 2016 (Wolfe) y recomendaciones EULAR 2017.
- **Medidas de resultado.** IMMPACT (Dworkin, *J Pain* 2008).
- **Opioides.** CDC Clinical Practice Guideline 2022, con la tabla de
  equivalentes de morfina.
- **Dolor lumbar.** NICE NG59 y la serie del *Lancet* 2018.
- **Dolor oncológico.** ESMO 2018, NCCN y las directrices de la OMS 2018.
- **SDRC.** Criterios de Budapest y guías prácticas de Harden, *Pain Med* 2022.
- **Intervencionismo.** ASRA para la suspensión de anticoagulantes.
- **Argentina.** Normas de Dolor de la FAAAAR (anestesia.org.ar): contenido
  obligatorio de la historia clínica de dolor, mapa dermatomal, consentimiento
  informado por escrito con garantía de medios y no de resultados, y registro de
  la evolución con medicamentos, dosis y escalas.

---

## Cómo está hecha

JavaScript sin dependencias ni compilación. `build.py` junta los archivos de
`src/` en un único `index.html` autocontenido. Los datos se guardan primero en el
dispositivo y después se espejan en Firebase Realtime Database, con
autenticación por correo y contraseña.

```
dolor/
├── index.html              ← lo único que hay que publicar
├── build.py                ← python3 build.py
├── manifest.webmanifest
├── sw.js                   ← funciona sin internet
├── icons/
├── reglas-firebase.txt     ← reglas de seguridad, hay que pegarlas
├── apps-script/Codigo.gs   ← envío de correo
├── MANUAL.md
├── PUBLICAR.md
└── src/
    ├── marca.js                 nombre, titular y datos del consultorio
    ├── firebase-config.js       configuración de la base
    ├── email-config.js          configuración del envío
    ├── data-escalas.js          17 escalas validadas
    ├── data-mapa.js             siluetas, zonas y semáforo de intensidad
    ├── data-sindromes.js        27 síndromes con reglas evaluables
    ├── data-icd.js              capítulo MG30 de la CIE-11
    ├── data-farmacos.js         vademécum y equivalentes de morfina
    ├── data-procedimientos.js   42 procedimientos y anticoagulación
    ├── core.js                  estado, almacenamiento, sincronización
    ├── motor.js                 fenotipado, diferencial, seguridad
    ├── efectividad.js           el indicador de color y porcentaje
    ├── ui-*.js                  la interfaz
    ├── portal-paciente.js       el cuestionario del paciente
    ├── resumen-paciente.js      el resumen de una página
    └── demo.js                  seis pacientes de prueba
```

---

## Advertencia

Todo el contenido clínico de esta aplicación es material de consulta y **no
reemplaza el juicio del médico tratante**. Las sugerencias se generan por reglas
a partir de los datos cargados: orientan, no diagnostican, y siempre requieren
verificación antes de aceptarlas.

Antes de cargar pacientes reales hay que aplicar las reglas de seguridad de
Firebase (`reglas-firebase.txt`). Sin ellas, las historias clínicas quedan
accesibles a cualquiera. Ver PUBLICAR.md, paso 3.

Los datos se tratan conforme a la Ley 25.326 de Protección de los Datos
Personales, la Ley 17.132 de ejercicio de la medicina y la Ley 26.529 de
derechos del paciente.
