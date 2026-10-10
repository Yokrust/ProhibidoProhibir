# Prohibido Prohibir

Proyecto audiovisual, archivos fuente y versiones de la apertura.

## Ejecutar la apertura

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory apertura/dist
```

Abrir `http://127.0.0.1:4173/`. No requiere instalación ni compilación.

La documentación de la experiencia y sus controles está en [apertura/README.md](apertura/README.md).

## Vercel

Importar este repositorio con **Root Directory** en la raíz del repositorio (sin subcarpeta).
El archivo `vercel.json` configura el sitio estático y publica `apertura/dist`,
incluyendo `index.html`, JavaScript, estilos, videos y tipografías. No requiere
instalación ni compilación. La apertura se sirve en `/`.

Los cambios enviados a `main` generan un nuevo despliegue si la integración con
GitHub está activa. Si está desactivada, ejecutar **Redeploy** con el último commit.

## Contenido

- `apertura/`: experiencia completa, videos, tipografías, arte original y script de renderizado.
- `assets-source/`: recursos originales y prompt de generación.
- `apertura-*.jpg` y `reference-colors-contact.jpg`: vistas previas y referencia visual.
- `prohibido-apertura*.tar.gz`: paquetes de las versiones del proyecto.
