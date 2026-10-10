# Prohibido Prohibir — luz, desgarro y vacío

Apertura audiovisual de 34 segundos. Todavía no incluye la invitación.

## Recorrido

- 0–9 s: 144 composiciones de luz, a 16 cortes por segundo, sin intervalos de negro. Fondos oscuros continuos y planos de bajo contraste; fragmentos blancos, rojos y azules cambian de posición y orientación. Los fragmentos de alto contraste suman como máximo el 3,4% del área de cada cuadro. Los pulsos de pantalla completa duran 45 ms y siguen separados un segundo.
- 9–18 s: doce golpes tipográficos de 750 ms. Once franjas se desgarran en direcciones opuestas; las palabras y fuentes se repiten. El fondo cambia de negro a azul oscuro y finalmente blanco.
- 18–32 s: catorce apariciones de video de 280–620 ms, separadas por blanco. Encuadres grandes, fijos en las cuatro esquinas, sin fundidos ni desplazamientos. En móvil ocupan el 82% del ancho y el 62% del alto.
- 32–33 s: blanco vacío.
- 33–34 s: aparece discretamente el nombre. Al terminar se puede repetir.

La luz tiene pulsos separados, pero esta implementación no constituye una certificación de accesibilidad frente a fotosensibilidad. La preferencia de movimiento reducido inicia la escena pausada.

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
- `dist/sequence.js`: tiempos, paleta, pulsos y apariciones de video.
- `dist/light-field.js`: composición determinista de planos y fragmentos de luz.
- `dist/experience.js`: dibujo Canvas 2D, desgarro de texto e interacción.
- `dist/sound.js`: composición sonora procedural con control de ganancia y compresión.
- `dist/assets/*.mp4`: bucles originales de ocho segundos, sin audio, animados desde el tríptico generado.
- `source-art/nightmare-triptych.png`: imagen original generada para la segunda versión.
- `source-art/nightmare-triptych.prompt.txt`: prompt completo de esa imagen.
- `render-films.sh`: reproducción de los tres bucles con FFmpeg.
