# Prohibido Prohibir — luz, desgarro y vacío

Apertura audiovisual de 112 segundos. Todavía no incluye la invitación.

## Recorrido

- 0–26 s: cortes secos de luz blanca, roja oscura y azul oscuro, con figuras geométricas recortadas. Un pulso por evento, separados al menos 1,45 segundos; sin estrobo rápido.
- 26–62 s: cuatro palabras, una a la vez. Once franjas de cada palabra se estiran, sesgan y separan en direcciones opuestas. La superficie pasa de negro a azul oscuro y después a blanco.
- 62–104 s: seis apariciones de los videos existentes, en blanco y negro, aislados sobre fondo blanco. Entre ellos hay intervalos completamente vacíos de 1,3 a 3 segundos.
- 104–109 s: blanco vacío.
- 109–112 s: aparece discretamente el nombre. Al terminar se puede repetir.

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
- `dist/experience.js`: dibujo Canvas 2D, desgarro de texto e interacción.
- `dist/sound.js`: composición sonora procedural con control de ganancia y compresión.
- `dist/assets/*.mp4`: bucles originales de ocho segundos, sin audio, animados desde el tríptico generado.
- `source-art/nightmare-triptych.png`: imagen original generada para la segunda versión.
- `source-art/nightmare-triptych.prompt.txt`: prompt completo de esa imagen.
- `render-films.sh`: reproducción de los tres bucles con FFmpeg.
