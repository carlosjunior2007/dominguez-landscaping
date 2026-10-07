# Dominguez Landscaping & Pressure Washing

Sitio web de servicios de jardinería y lavado a presión en Wilmington y Leland, NC.

- **Vista previa:** https://carlosjunior2007.github.io/dominguez-landscaping/
- **Publicación:** cada push a `main` despliega GitHub Pages mediante Actions.
- **Construcción local:** `python3 scripts/build-pages.py` genera `_site/`.

## Formulario

GitHub Pages solo sirve archivos estáticos. La vista previa conserva el diseño final del formulario sin avisos adicionales. Si se intenta enviar, JavaScript informa que no se envían solicitudes desde esta versión. No publica PHP ni archivos de configuración del servidor.

El formulario PHP y la configuración de Hostinger se conservan únicamente en la copia local, fuera de este repositorio público.

## Desarrollo

HTML, JavaScript y CSS compilado en `assets/css/styles.css`; fuente de Tailwind en `src/tailwind.css`. Recompilar con Tailwind CLI: `tailwindcss -i src/tailwind.css -o assets/css/styles.css --minify`.
