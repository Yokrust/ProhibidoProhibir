# Prohibido Prohibir — luz, censura y vacío

Apertura audiovisual de 24 segundos, seguida por un campo blanco interactivo sin límite de tiempo. La presentación editorial del proyecto y los colaboradores está en `dist/proyecto.html`, accesible desde la entrada y desde el campo blanco. El contacto y las condiciones de la invitación quedan pendientes de definición.

## Recorrido

- 0–9 s: el campo cromático vuelve a 30 cambios por segundo (frente a los 5 de la revisión anterior). La paleta rápida se selecciona a mano: carmesí, IKB digital exacto `#002FA7`, violeta, ámbar y cobalto. Las figuras usan colores de esa misma paleta en lugar de gris. No se normalizan los colores al dibujarlos. Rojo puro `#E51B2B`, naranja `#FF5A00`, IKB, negro y blanco aparecen como nueve acentos de 67 ms separados un segundo. Las figuras cambian de posición, giro y escala cada 67 ms, con contraste de luminancia acotado.
- 9–10,2 s: corte al blanco absoluto y silencio. El sonido original de los flashes termina en el segundo 9.
- 10,2–10,85 s: el cartel oficial completo aparece de golpe, grande, sobre blanco; mantiene su geometría, colores, símbolo y letras. Es una única aparición fija de 650 ms.
- 10,85–12,2 s: desaparece el cartel y queda blanco.
- 12,2–15,4 s: «PROHIBIDO PROHIBIR!» con las letras rojas originales, completo e inmóvil, rodeado de márgenes.
- 15,4–18,1 s: marca negra de Broyer du Noir., aislada en el futuro lugar de la incisión. El crédito aparece pequeño y separado, al pie.
- 18,1–20,8 s: la marca de La Societe Depressive. ocupa ese mismo lugar y conserva el mismo encuadre del crédito.
- 20,8–22,25 s: el perfil original se imprime en negro, pequeño, en la misma posición.
- 22,25–24 s: blanco absoluto. Los cambios posteriores al segundo 9 son cortes secos entre imágenes quietas; las letras y marcas no se mueven ni se disuelven.
- Desde 24 s: corte al blanco y silencio. Durante 2,8 segundos no hay ningún elemento visible. Después aparece una incisión negra de hasta 136 px de ancho, situada al 64% del ancho y al 43% del alto. En móvil se adapta al ancho disponible. El resto de la superficie permanece blanco.
- Mantener pulsada la incisión aumenta la tensión lentamente, ensancha la abertura y alimenta una huella roja. Arrastrar desvía la abertura y el recorrido del derrame. Al soltar, la presión cede despacio, pero el corte conserva una abertura más profunda y la tinta continúa descendiendo durante varios segundos. Cada intervención acumula más rojo; la huella no se borra durante esa entrada. El líquido se reúne primero en puntos distintos del borde; cuando su peso vence la adhesión, cada gota desciende lentamente y deposita un rastro. Se usa un modelo acotado de volumen, peso, viscosidad y adhesión, con cantidades conservadas entre el borde, la gota y la película que deja. El frente del líquido se mueve de forma independiente; las coordenadas y anchuras del rastro depositado no se estiran ni se desplazan al añadir más líquido. Los recorridos cercanos se atraen hacia la película ya húmeda; al tocarse, el líquido se reúne y se transfiere gradualmente. El flujo conserva gotas de distinto tamaño y recorridos desiguales, sin chorros proyectados, partículas aleatorias, parpadeos ni sacudidas. La caída y el volumen están acotados para conservar los márgenes blancos; al agotarse el líquido pendiente, el movimiento se detiene y la huella permanece.
- Tras unos segundos, aparece el nombre en tamaño mínimo, separado de la incisión y rodeado de márgenes amplios. Una indicación discreta, «mantén», desaparece cuando se realiza la primera intervención.
- El blanco no tiene cuenta atrás, fotos, videos, gritos, música ni un cierre automático. La persona decide cuánto tiempo permanece ahí.

La apertura usa únicamente el nombre del proyecto y los créditos de los colaboradores; se retiraron las dos frases editoriales anteriores. El texto de la presentación es una propuesta editorial basada en la intención del proyecto descrita por su autor; los documentos de identidad aportan marcas y colores, no un manifiesto.

Los cambios cromáticos rápidos tienen contraste ajustado; esta implementación no constituye una certificación de accesibilidad frente a fotosensibilidad. La preferencia de movimiento reducido permite entrar directamente al blanco, sin apertura ni sonido, con respuestas inmediatas a los gestos y sin animación autónoma. En ese modo, cada intervención deja una huella acumulativa de forma inmediata; al soltar no hay derrame animado.

## Entrada y reproducción

Una pantalla negra con **Entrar** inicia la secuencia y activa Web Audio en el mismo gesto. **Entrar sin animación** permite abrir directamente el campo blanco en silencio y con respuesta estática al gesto, independientemente de la preferencia del sistema. **Leer el proyecto** abre la presentación sin iniciar la experiencia. El aviso breve de luces y sonido y la indicación de Escape aparecen únicamente antes de entrar. No se intenta eludir las restricciones de reproducción automática del navegador.

Durante los primeros 24 segundos no hay controles visibles ni reacciones al ratón, al tacto o a Espacio. En el campo blanco, la incisión ofrece una zona de interacción de hasta 156 × 72 px, ajustada al ancho de la pantalla, para ratón y tacto. Con teclado, Tab enfoca la incisión y mantener Espacio o Intro produce la misma tensión. Las instrucciones completas están disponibles para lectores de pantalla. El logotipo oficial aparece desde los 7 s de blanco; a los 9 s se ofrece **Leer el proyecto**, oculto también al teclado hasta ese momento. Ambos aparecen inmediatamente sin animación. El enlace permite navegar a la presentación y detiene el motor mediante `pagehide`.

Escape corta la reproducción o cancela el gesto activo y vuelve a la entrada. Cambiar de pestaña o abandonar la página también detiene la experiencia; no se reanuda sin otra entrada explícita. Una nueva entrada reinicia las marcas del campo blanco. Se conserva la preferencia de movimiento reducido. Si falla la activación del audio, se muestra el error en la entrada y permite reintentar.

Los primeros 9 segundos conservan exactamente sus drones y ruido filtrado. Desde el segundo 9 se corta la salida y se suspende AudioContext. La aparición del cartel, los nombres, los créditos y el campo blanco permanecen en silencio. No contiene grabaciones humanas ni sonidos tomados de archivos históricos.

Las marcas se precargan al abrir la página. Entrar activa Web Audio en el gesto y espera la carga de los recursos antes de iniciar el tiempo. Si falla una marca, se muestra un error recuperable en la entrada y se mantienen disponibles la entrada sin animación y la presentación editorial.

## Ejecución local

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abrir `http://127.0.0.1:4173/`. No requiere instalación ni compilación.

## Archivos

- `dist/index.html`: capas visuales y controles.
- `dist/style.css`: composición, tipografías del sistema y adaptación a móvil.
- `dist/proyecto.html` y `dist/proyecto.css`: presentación editorial y créditos de Broyer du Noir. y La Societe Depressive., con lectura y navegación nativas sin JavaScript.
- `dist/assets/brand/`: marcas originales optimizadas y símbolo vectorial extraído fielmente del PDF del proyecto.
- `dist/sequence.js`: tiempos de los flashes, la irrupción del cartel, los nombres, los créditos y las pausas blancas.
- `dist/light-field.js`: campos cromáticos a pantalla completa y figuras fugaces.
- `dist/experience.js`: dibujo Canvas 2D y ciclo de reproducción.
- `dist/typography.js`: precarga y composición de las marcas oficiales, adaptadas sin deformación a cada pantalla.
- `dist/white-space.js`: incisión permanente, resistencia al gesto, acumulación y entrada por ratón, tacto y teclado.
- `dist/liquid-flow.js`: volumen del líquido, adhesión al borde, descenso viscoso y depósito permanente del rastro.
- `dist/sound.js`: sonido original de los flashes y corte a silencio en el segundo 9, con control de ganancia y compresión.
- `dist/assets/*.mp4`: bucles de la revisión anterior, conservados como recursos de trabajo. La página ya no los carga ni reproduce.
- `source-art/nightmare-triptych.png`: imagen original generada para la segunda versión.
- `source-art/nightmare-triptych.prompt.txt`: prompt completo de esa imagen.
- `render-films.sh`: reproducción de los tres bucles con FFmpeg.

## Referencia cromática conservada

Se analizó el archivo local `Colors Epilepsy Warning.mp4`: 1280×720, 20,07 s, 29,97 fps, 599 fotogramas decodificados. Hay 597 cambios grandes de color, con separaciones predominantes de 33,37 ms, alternando RGB a pantalla completa. El archivo no se incluye ni se reproduce en el sitio.

Se localizaron en YouTube `Colors (epilepsy warning)` (Deco Deco, https://www.youtube.com/watch?v=pDEdiyU1i70) y `Hyper Speed Color Changing` (Alex Voxel, https://www.youtube.com/watch?v=jft57_u2geU). El primer reproductor no permitió la reproducción; la segunda referencia sí se observó, con campos de color planos que llenan el cuadro. Las mediciones de frecuencia proceden exclusivamente del MP4 aportado.

La revisión conserva los cambios cromáticos a pantalla completa a 30 cuadros por segundo, con una paleta cromática de luminancia acotada entre los colores rápidos. El IKB aparece también en la alternancia rápida; rojo intenso, naranja puro, negro y blanco son acentos separados. No reproduce la intensidad del estrobo RGB original. Referencia técnica: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html
