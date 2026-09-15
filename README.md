# ARIEL / VOLT — séptima prueba jugable

Revisión del 15 de septiembre de 2026. Continúa el proyecto original; es una entrega jugable en desarrollo, con mejoras de visibilidad, preparación gráfica y HUD móvil.

## Abrir el juego

Extrae todo el ZIP y abre **INICIAR.cmd**. El lanzador reutiliza el servidor de esa misma carpeta para conservar su guardado. Si se abre una carpeta diferente, elige un puerto libre entre 8765 y 8795. Cada dirección y puerto mantiene su propio guardado; mover la carpeta o abrir otra copia puede cambiar ese origen. Necesita Node.js; en este ordenador también busca el runtime local disponible. Para abrir manualmente: `node server.mjs` y http://127.0.0.1:8765. Puedes indicar otro puerto con `node server.mjs 8766`. No abras index.html directamente.

Flechas o WASD: carriles, salto y agachado. Espacio: salto. Salto seguido rápidamente de lateral: truco. E: VOLT con batería llena. P o Escape: pausa. Móvil: desliza; doble toque para VOLT. Ajustes permite mostrar botones, cambiar volumen y activar Ahorro.

En Ajustes, **Ruta compartida** permite escribir un código. Dos partidas libres con el mismo código generan el mismo recorrido y obstáculos; el reto diario mantiene su propia semilla. Un código vacío genera una partida nueva. La ruta cambia después del primer ciclo de seis distritos.

## Novedades de la revisión 7

Los obstáculos que quedan detrás de Ariel se disuelven en la zona donde bloquearían la cámara. La calzada, los techos, el tráfico lateral y los obstáculos que se aproximan siguen visibles. El sistema solo afecta al dibujo; no altera ni elimina las colisiones.

El juego prepara de antemano las geometrías, materiales y texturas de los modelos disponibles, incluida una reserva de ruedas para tráfico y trenes. La pantalla de carga permanece hasta completar esa preparación. El reloj de la partida se reinicia al empezar para no contar el tiempo de carga como un frame de juego.

En móvil, el indicador superior muestra un nombre breve del distrito y un paraguas cuando llueve. Los controles, avisos importantes y potenciadores se conservan.

Las cifras nuevas y la comparación con la revisión 6 están en PRUEBAS.md. El avatar conserva exactamente los dos GLB de la revisión 6, con sus límites de acabado documentados.

## Mejoras conservadas de la revisión 6

Corregidos los restos de dedos que seguían pegados a la cintura al levantar los brazos. Las manos siguen el manillar durante el desplazamiento y los pies apoyan en el patinete y en la fase de pisada. La postura en reposo relaja las muñecas y pausar congela la animación. Se han cerrado cuatro pequeños contactos de la malla y retirado restos del chaleco del archivo de cabeza bajo el cuello, conservando la cara y el pelo del maestro.

La galería permite elegir cuerpo completo, cabeza y cuello, manos o pies, girar, acercarse y cambiar de postura. Pulsa **Vista y postura** para plegar los controles. Las irregularidades de textura en los laterales del cuello y la nuca siguen pendientes; los dedos no tienen articulación individual.

## Mejoras conservadas de la revisión 5

Las recogidas ya no muestran carteles durante la carrera: los potenciadores conservan sus iconos y duración. Los avisos de tráfico se limitan al carril del jugador y a los trenes; el peligro tiene prioridad sobre el indicador de persecución. El tutorial aparece al elegir Practicar controles.

El tráfico ambiental dispone de calzadas laterales señalizadas. Se han separado árboles, mobiliario, edificios, aparcamiento y circulación; los coches aparcados mantienen su posición respecto a la calle. El autobús se incorpora dentro del asfalto, la patrulla usa una calzada y las vías quedan libres de papeleras, señales y pilares. Los vehículos completos se comprueban al llegar al límite de un distrito.

## Ciudad y eventos incluidos

- Ritmo con introducción, tráfico, tramos despejados, evento y recuperación; eventos propios de los seis distritos.
- Autobús que se incorpora, camión que pierde una caja, tren expreso con aviso y carril libre, paso policial, jardín despejado y muelle que abre sus dos hojas fuera de la ruta de carrera.
- Puerto con almacenes, fábricas, hangares, chimeneas con vapor y actividad marítima; viviendas con tendederos y garajes.
- Neón con anuncios que alternan, tubos luminosos y hologramas. Reflejos reales en agua y asfalto mojado, desactivados en Ahorro.
- Cielo con nubes, estrellas y transición de luz. Landmarks sin duplicarse en los cuatro tramos de su zona.
- Catálogo de 71 mallas originales de ciudad, 12 tipos de segmento y cuatro variantes por distrito. Tráfico y segmentos reutilizan sus objetos.

Se mantienen las tres calles de carrera, salto, agachado, trucos, VOLT, los cinco potenciadores, lluvia, monedas, puntuación, misiones, logros, guardado y modo offline.

## Sin conexión

Abre una vez con el servidor disponible y espera **Listo sin conexión**. La caché contiene el juego, los modelos y las bibliotecas locales; no usa CDN. Reabre exactamente la misma dirección, incluido el puerto. Un puerto diferente es otro origen y no comparte guardado ni caché. El lanzador abre un servidor local; para una recarga offline del navegador usa la dirección ya preparada.

## Personaje y límites pendientes

El cuerpo y la cabeza provienen de los dos FBX aportados; el cuerpo original se conserva fuera del corte necesario de la cabeza y la unión. Se añadieron pantorrillas y zapatillas con autorización, además de un esqueleto humanoide nuevo porque los FBX no estaban riggeados. El maestro conserva las texturas y materiales originales. Los GLB jugables son versiones reducidas, con texturas de 2K y 1K.

La unión del cuello, la piel y los contactos de manos necesitan acabado. No se certifica una fusión invisible, movimientos finales, ni ausencia de todas las intersecciones. No todos los eventos y elementos del encargo original están terminados: faltan más tipos de persecución e interacción urbana, audio más elaborado y comprobaciones en teléfonos físicos. Las curvas son visuales y mantienen el contrato de tres carriles.

## Resultados y reproducción

**PRUEBAS.md** describe los resultados efectivos de esta revisión y sus límites. **AUDITORIA-INICIAL.md** documenta el estado previo. Evidencias nuevas: `verification/current`; las demás carpetas contienen resultados históricos, no una certificación actual. Una captura controlada no es una partida completa.

Con Node.js: `npm test` y `npm run build`, o cada archivo `.test.mjs` de la lista en package.json. Con Playwright, Chromium instalado y el servidor activo: `node tests/browser-current.cjs`, `node tests/events-browser.cjs`, `node tests/reflections-browser.cjs`, `node tests/endurance-current.cjs`, `node tests/avatar-ik-browser.cjs` y `node tests/avatar-gallery-browser.cjs`. Este último dura más de diez minutos reales. Para capturas de la ciudad sin el ensayo detallado del avatar, ejecuta visual-current.cjs con SKIP_AVATAR=1.

Las pruebas antiguas de navegador conservadas pueden contener supuestos del avatar anterior. Las vistas de móvil son emulación sobre este PC; no certifican 30 FPS en Android o iPhone. Los valores de FPS pertenecen al equipo y sesión indicados en PRUEBAS.md.

## Modelos y dependencias

Los modelos urbanos se generan con `tools/build-city.py`; el cielo, con `tools/build-sky.py`. Three.js r170, GLTFLoader y Reflector se distribuyen localmente bajo su licencia MIT, incluida en assets. El aviso REFLECTOR-NOTICE.txt identifica la fuente oficial. No se descargan recursos durante la partida.
