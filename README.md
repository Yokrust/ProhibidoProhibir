# Prohibido Prohibir — apertura

Primera escena del flyer interactivo. La invitación se integrará en una siguiente etapa.

## Abrir en local

Desde esta carpeta:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abrir `http://127.0.0.1:4173/`.

## Interacción

- El cursor deforma las corrientes de luz.
- Mantener pulsado sobre la escena o el control inferior contrae el campo y fractura las letras; soltar genera una onda.
- Espacio permite mantener la interacción desde el teclado. Enter activa el control enfocado.
- Escape y el botón Pausar detienen el movimiento.
- La preferencia de movimiento reducido inicia la escena pausada.

## Estructura

`dist/index.html`: composición y controles. `dist/style.css`: diseño y adaptación a pantalla. `dist/experience.js`: shader WebGL, alternativa Canvas 2D e interacción.

Sitio estático sin dependencias de ejecución. Fuentes alojadas en `dist/assets`: Anton, Cormorant Garamond y Space Mono, distribuidas bajo SIL Open Font License; ver los archivos de licencia incluidos.
