# Prohibido Prohibir — luz, censura y vacío

Apertura audiovisual de 24 segundos, seguida por un campo blanco interactivo sin límite de tiempo. Todavía no incluye la invitación.

## Recorrido

- 0–9 s: el campo cromático vuelve a 30 cambios por segundo (frente a los 5 de la revisión anterior). La paleta rápida se selecciona a mano: carmesí, IKB digital exacto `#002FA7`, violeta, ámbar y cobalto. Las figuras usan colores de esa misma paleta en lugar de gris. No se normalizan los colores al dibujarlos. Rojo puro `#E51B2B`, naranja `#FF5A00`, IKB, negro y blanco aparecen como nueve acentos de 67 ms separados un segundo. Las figuras cambian de posición, giro y escala cada 67 ms, con contraste de luminancia acotado.
- 9–14 s: «¿QUIÉN DECIDE QUÉ SE CALLA?». Impresión fija, de gran formato. La intervención cubre primero «DECIDE» y después el final de la pregunta; «¿QUIÉN» queda pendiente.
- 14–19 s: «EL SILENCIO SE FABRICA.». Campo blanco y letras negras. Dos bandas opacas de tinta tachan la frase con golpes secos.
- 19–24 s: «PROHIBIDO PROHIBIR». Un trazo rojo cancela «PROHIBIDO»; después se cubre esa palabra y queda «PROHIBIR». En pantallas verticales, este cartel ocupa la pantalla girado 90°.
- Cada cartel conserva sus letras inmóviles. Las intervenciones comienzan después de una pausa de lectura y terminan con un corte a vacío de 350 ms. Las imperfecciones de tinta son fijas, sin ruido animado, franjas desplazadas ni deformaciones.
- Desde 24 s: corte al blanco y silencio. Durante 2,8 segundos no hay ningún elemento visible. Después aparece una incisión negra de hasta 136 px de ancho, situada al 64% del ancho y al 43% del alto. En móvil se adapta al ancho disponible. El resto de la superficie permanece blanco.
- Mantener pulsada la incisión aumenta la tensión lentamente, ensancha la abertura y alimenta una huella roja. Arrastrar desvía la abertura y el recorrido del derrame. Al soltar, la presión cede despacio, pero el corte conserva una abertura más profunda y la tinta continúa descendiendo durante varios segundos. Cada intervención acumula más rojo; la huella no se borra durante esa entrada. El líquido se reúne primero en puntos distintos del borde; cuando su peso vence la adhesión, cada gota desciende lentamente y deposita un rastro. Se usa un modelo acotado de volumen, peso, viscosidad y adhesión, con cantidades conservadas entre el borde, la gota y la película que deja. El frente del líquido se mueve de forma independiente; las coordenadas y anchuras del rastro depositado no se estiran ni se desplazan al añadir más líquido. Los recorridos cercanos se atraen hacia la película ya húmeda; al tocarse, el líquido se reúne y se transfiere gradualmente. El flujo conserva gotas de distinto tamaño y recorridos desiguales, sin chorros proyectados, partículas aleatorias, parpadeos ni sacudidas. La caída y el volumen están acotados para conservar los márgenes blancos; al agotarse el líquido pendiente, el movimiento se detiene y la huella permanece.
- Tras unos segundos, aparece el nombre en tamaño mínimo, separado de la incisión y rodeado de márgenes amplios. Una indicación discreta, «mantén», desaparece cuando se realiza la primera intervención.
- El blanco no tiene cuenta atrás, fotos, videos, gritos, música ni un cierre automático. La persona decide cuánto tiempo permanece ahí.

Los textos de los dos primeros carteles son una propuesta editorial original para esta apertura, sin atribuirlos a un autor o movimiento. La invitación al artista todavía no se incluye.

Los cambios cromáticos rápidos tienen contraste ajustado; esta implementación no constituye una certificación de accesibilidad frente a fotosensibilidad. La preferencia de movimiento reducido permite entrar directamente al blanco, sin apertura ni sonido, con respuestas inmediatas a los gestos y sin animación autónoma. En ese modo, cada intervención deja una huella acumulativa de forma inmediata; al soltar no hay derrame animado.

## Entrada y reproducción

Una pantalla negra con un único botón **Entrar** inicia la secuencia y activa Web Audio en el mismo gesto. El aviso breve de luces y sonido y la indicación de Escape aparecen únicamente antes de entrar. No se intenta eludir las restricciones de reproducción automática del navegador.

Durante los primeros 24 segundos no hay controles visibles ni reacciones al ratón, al tacto o a Espacio. En el campo blanco, la incisión ofrece una zona de interacción de hasta 156 × 72 px, ajustada al ancho de la pantalla, para ratón y tacto. Con teclado, Tab enfoca la incisión y mantener Espacio o Intro produce la misma tensión. Las instrucciones completas están disponibles para lectores de pantalla. No hay botón de repetición.

Escape corta la reproducción o cancela el gesto activo y vuelve a la entrada. Cambiar de pestaña o abandonar la página también detiene la experiencia; no se reanuda sin otra entrada explícita. Una nueva entrada reinicia las marcas del campo blanco. Se conserva la preferencia de movimiento reducido. Si falla la activación del audio, se muestra el error en la entrada y permite reintentar.

La primera parte conserva sus drones y ruido filtrado. Durante los carteles esa base se apaga: solo hay golpes breves de impresión, fricción de tinta y pausas de silencio. No hay gritos ni reverberación en la sección tipográfica. Al llegar al blanco se desactiva la salida de audio y se detienen las fuentes de los golpes. Se retiraron los gritos sintéticos y las apariciones de video. No contiene grabaciones humanas ni sonidos tomados de archivos históricos.

## Ejecución local

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abrir `http://127.0.0.1:4173/`. No requiere instalación ni compilación.

## Archivos

- `dist/index.html`: capas visuales y controles.
- `dist/style.css`: composición, tipografías del sistema y adaptación a móvil.
- `dist/sequence.js`: tiempos de la apertura y los tres carteles.
- `dist/light-field.js`: campos cromáticos a pantalla completa y figuras fugaces.
- `dist/experience.js`: dibujo Canvas 2D y ciclo de reproducción.
- `dist/typography.js`: composición de los tres carteles, impresión fija y censura, con adaptación a orientación vertical.
- `dist/white-space.js`: incisión permanente, resistencia al gesto, acumulación y entrada por ratón, tacto y teclado.
- `dist/liquid-flow.js`: volumen del líquido, adhesión al borde, descenso viscoso y depósito permanente del rastro.
- `dist/sound.js`: composición sonora de la apertura y los carteles, con control de ganancia y compresión.
- `dist/assets/*.mp4`: bucles de la revisión anterior, conservados como recursos de trabajo. La página ya no los carga ni reproduce.
- `source-art/nightmare-triptych.png`: imagen original generada para la segunda versión.
- `source-art/nightmare-triptych.prompt.txt`: prompt completo de esa imagen.
- `render-films.sh`: reproducción de los tres bucles con FFmpeg.

## Referencia cromática conservada

Se analizó el archivo local `Colors Epilepsy Warning.mp4`: 1280×720, 20,07 s, 29,97 fps, 599 fotogramas decodificados. Hay 597 cambios grandes de color, con separaciones predominantes de 33,37 ms, alternando RGB a pantalla completa. El archivo no se incluye ni se reproduce en el sitio.

Se localizaron en YouTube `Colors (epilepsy warning)` (Deco Deco, https://www.youtube.com/watch?v=pDEdiyU1i70) y `Hyper Speed Color Changing` (Alex Voxel, https://www.youtube.com/watch?v=jft57_u2geU). El primer reproductor no permitió la reproducción; la segunda referencia sí se observó, con campos de color planos que llenan el cuadro. Las mediciones de frecuencia proceden exclusivamente del MP4 aportado.

La revisión conserva los cambios cromáticos a pantalla completa a 30 cuadros por segundo, con una paleta cromática de luminancia acotada entre los colores rápidos. El IKB aparece también en la alternancia rápida; rojo intenso, naranja puro, negro y blanco son acentos separados. No reproduce la intensidad del estrobo RGB original. Referencia técnica: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html
