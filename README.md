# Prohibido Prohibir — apertura audiovisual

Una secuencia de 104 segundos, todavía sin invitación. Empieza directamente con luz y figuras; el texto aparece más tarde y de forma fragmentaria.

## Recorrido

- 0–24 s: luces y figuras cambiantes, sin titulares.
- 24–46 s: palabras y fragmentos en cinco tratamientos tipográficos.
- 46–78 s: tres bucles de video intervenidos: ojo, boca y aparición.
- 78–98 s: superposición de luz, video y tipografía.
- 98–104 s: descenso a negro y aparición del nombre; se puede repetir.

El botón Sonido activa una composición creada con Web Audio: drones, ruido filtrado y gritos sintéticos. No contiene grabaciones humanas. El sonido comienza solo tras una acción explícita y se silencia al pausar. Escape y el control superior pausan la experiencia. Mantener pulsado sobre la imagen deforma el campo visual; Espacio hace lo mismo desde el teclado.

El movimiento reducido inicia la escena detenida. Cambiar de pestaña pausa la secuencia. Los pulsos comparten una frecuencia máxima de 1,25 Hz y la composición evita un estrobo rápido de pantalla completa. Esto no equivale a una certificación de accesibilidad frente a fotosensibilidad.

## Ejecución local

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abrir `http://127.0.0.1:4173/`. No requiere instalación ni compilación.

## Archivos

- `dist/index.html`: capas visuales y controles.
- `dist/style.css`: composición, tipografías y adaptación a móvil.
- `dist/experience.js`: shader WebGL, alternativa Canvas 2D, interacción y secuencia.
- `dist/sound.js`: composición sonora procedural, con control de ganancia y compresión.
- `dist/assets/*.mp4`: bucles originales de ocho segundos, sin audio, animados desde el tríptico generado.
- `source-art/nightmare-triptych.png`: imagen original creada con la herramienta integrada de generación de imágenes.
- `source-art/nightmare-triptych.prompt.txt`: prompt completo usado para la imagen.
- `render-films.sh`: reproducción de los tres bucles con FFmpeg.

Anton, Cormorant Garamond y Space Mono se alojan localmente bajo SIL Open Font License; sus licencias están en `dist/assets`.
