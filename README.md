# Prohibido Prohibir — luz, desgarro y vacío

Apertura audiovisual de 34 segundos. Todavía no incluye la invitación.

## Recorrido

- 0–9 s: el campo cromático vuelve a 30 cambios por segundo (frente a los 5 de la revisión anterior). La paleta rápida se selecciona a mano: carmesí, IKB digital exacto `#002FA7`, violeta, ámbar y cobalto. Las figuras usan colores de esa misma paleta en lugar de gris. No se normalizan los colores al dibujarlos. Rojo puro `#E51B2B`, naranja `#FF5A00`, IKB, negro y blanco aparecen como nueve acentos de 67 ms separados un segundo. Las figuras cambian de posición, giro y escala cada 67 ms, con contraste de luminancia acotado.
- 9–18 s: doce golpes tipográficos de 750 ms. Once franjas se desgarran en direcciones opuestas; las palabras y fuentes se repiten. El fondo cambia de negro a azul oscuro y finalmente blanco.
- 18–32 s: catorce apariciones de video de 280–620 ms, separadas por blanco. Encuadres grandes, fijos en las cuatro esquinas, sin fundidos ni desplazamientos. En móvil ocupan el 82% del ancho y el 62% del alto.
- 32–33 s: blanco vacío.
- 33–34 s: aparece discretamente el nombre. Al terminar se puede repetir.

Los cambios cromáticos rápidos tienen contraste ajustado; esta implementación no constituye una certificación de accesibilidad frente a fotosensibilidad. La preferencia de movimiento reducido inicia la escena pausada.

## Interacción

El botón Sonido activa una composición creada con Web Audio: drones, ruido filtrado y gritos sintéticos. El fondo sonoro baja durante el tramo blanco y hay voces aisladas. No contiene grabaciones humanas. Se activa con una acción explícita y se silencia al pausar. Escape y el control superior pausan la experiencia; cambiar de pestaña también la pausa.

Mantener pulsado sobre la imagen o mantener Espacio aumenta la tensión y la separación tipográfica.

## Ejecución local

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abrir `http://127.0.0.1:4173/`. No requiere instalación ni compilación.

## Archivos

- `dist/index.html`: capas visuales y controles.
- `dist/style.css`: composición, tipografías del sistema y adaptación a móvil.
- `dist/sequence.js`: tiempos y apariciones de video.
- `dist/light-field.js`: campos cromáticos a pantalla completa y figuras fugaces.
- `dist/experience.js`: dibujo Canvas 2D, desgarro de texto e interacción.
- `dist/sound.js`: composición sonora procedural con control de ganancia y compresión.
- `dist/assets/*.mp4`: bucles originales de ocho segundos, sin audio, animados desde el tríptico generado.
- `source-art/nightmare-triptych.png`: imagen original generada para la segunda versión.
- `source-art/nightmare-triptych.prompt.txt`: prompt completo de esa imagen.
- `render-films.sh`: reproducción de los tres bucles con FFmpeg.

## Referencia de esta revisión

Se analizó el archivo local `Colors Epilepsy Warning.mp4`: 1280×720, 20,07 s, 29,97 fps, 599 fotogramas decodificados. Hay 597 cambios grandes de color, con separaciones predominantes de 33,37 ms, alternando RGB a pantalla completa. El archivo no se incluye ni se reproduce en el sitio.

Se localizaron en YouTube `Colors (epilepsy warning)` (Deco Deco, https://www.youtube.com/watch?v=pDEdiyU1i70) y `Hyper Speed Color Changing` (Alex Voxel, https://www.youtube.com/watch?v=jft57_u2geU). El primer reproductor no permitió la reproducción; la segunda referencia sí se observó, con campos de color planos que llenan el cuadro. Las mediciones de frecuencia proceden exclusivamente del MP4 aportado.

La revisión conserva los cambios cromáticos a pantalla completa a 30 cuadros por segundo, con una paleta cromática de luminancia acotada entre los colores rápidos. El IKB aparece también en la alternancia rápida; rojo intenso, naranja puro, negro y blanco son acentos separados. No reproduce la intensidad del estrobo RGB original. Referencia técnica: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html
