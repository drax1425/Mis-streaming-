# CS2 Dust II — YouTube Thumbnail Generator

Genera miniaturas de YouTube en **1280 × 720 px** para el video de regreso a CS2 en Dust II.

## Estructura

```
thumbnail-cs2-dust2/
├── index.html       ← diseño base (editable)
├── index-v1.html    ← Variante A/B: "VOLVÍ AL CS2 / ¿SIGO OXIDADO?"
├── index-v2.html    ← Variante A/B: "DESPUÉS DE AÑOS / VOLVÍ A DUST II"
├── index-v3.html    ← Variante A/B: "PRIMERA PARTIDA / EN CS2 OTRA VEZ"
├── styles.css       ← todos los estilos y variables de color
├── render.js        ← script Puppeteer → output.png
├── package.json
└── assets/
    ├── dust2-bg.jpg     ← screenshot de Dust II (mid doors / long A)
    ├── drax-face.png    ← foto/recorte del streamer (fondo transparente ideal)
    ├── ak47.png         ← render del AK-47 (fondo transparente)
    ├── awp.png          ← render del AWP   (para index-v2)
    └── m4a4.png         ← render del M4A4  (para index-v3)
```

---

## Instalación

```bash
cd thumbnail-cs2-dust2
npm install
```

> Requiere Node.js ≥ 18. Puppeteer descarga Chromium automáticamente (~170 MB).

---

## Uso

### Renderizar la miniatura principal

```bash
node render.js
# → output.png (1280×720)
```

### Renderizar todas las variantes de una vez

```bash
node render.js --all
# → output-v1.png  output-v2.png  output-v3.png
```

### Renderizar un archivo concreto con nombre de salida personalizado

```bash
node render.js --file index-v2.html --out thumb-final.png
```

### Previsualizar en el navegador (sin renderizar)

Abre cualquiera de los `.html` directamente en Chrome/Firefox. El diseño se muestra a escala real (1280 × 720). Para simular la vista móvil haz zoom al 25 % (`Ctrl -` o DevTools → Device Toolbar → 320 × 180 px).

---

## Cómo personalizar

### Cambiar texto

Edita directamente el bloque `.text-block` en el HTML que quieras:

```html
<!-- Headline principal -->
<div class="headline">VOLVÍ AL <span class="accent">CS2</span></div>

<!-- Sub-headline -->
<div class="subheadline">¿SIGO OXIDADO?</div>

<!-- Etiqueta del mapa -->
<div class="map-tag">DUST II</div>
```

### Cambiar colores (variables CSS)

Todas las variables están en la sección `:root` de `styles.css`:

| Variable              | Valor por defecto | Descripción                        |
|-----------------------|-------------------|------------------------------------|
| `--color-bg-deep`     | `#0A1520`         | Fondo más oscuro                   |
| `--color-accent`      | `#F39C12`         | Naranja CS2 (texto acento, tags)   |
| `--color-text-main`   | `#FFFFFF`         | Color del headline                 |
| `--color-text-sub`    | `#F39C12`         | Color del sub-headline             |
| `--color-badge-bg`    | `#C0392B`         | Fondo del badge ribbon             |
| `--color-glow`        | `rgba(0,160,255,…)` | Halo detrás de la cara           |

Cada variante (`index-v2.html`, `index-v3.html`) sobreescribe estas variables localmente con un bloque `<style>` propio — sin tocar `styles.css`.

### Cambiar imágenes de fondo / armas / cara

1. Coloca tu archivo en la carpeta `assets/`.
2. Actualiza el atributo `src` del `<img>` correspondiente en el HTML.
3. Si la imagen no carga, los placeholders SVG/div se activan automáticamente.

### Añadir foto del streamer

Reemplaza el `<div class="face-placeholder">` por:

```html
<img class="face-img" src="assets/drax-face.png" alt="Drax" />
```

Idealmente usa un PNG con fondo transparente y recortado a la altura del streamer (o hasta el pecho). El CSS aplica glow azul automáticamente.

---

## Límites y calidad

- El script usa `deviceScaleFactor: 2` → captura a **2560 × 1440 px** y luego recorta a 1280 × 720. Resultado más nítido que 1x.
- Si el PNG supera 2 MB, el script guarda también una versión JPEG (compresión 92 %).
- YouTube acepta PNG, JPG y GIF. PNG es preferido para máxima calidad.
- Resolución mínima recomendada por YouTube: 1280 × 720 px ✓

---

## Requisitos de assets recomendados

| Asset            | Fuente gratuita                                  |
|------------------|--------------------------------------------------|
| Fondo Dust II    | Screenshot in-game desde `cl_drawhud 0`          |
| AK-47 render     | CS2 Wiki / SteamDB                               |
| Foto del streamer | Foto propia o captura de stream                 |
| Fuentes          | Cargadas automáticamente desde Google Fonts      |
