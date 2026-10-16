# El Candil

Web del restaurante El Candil: carta en forma de archivador (cada sección es una carpeta que se abre al pulsar su pestaña) y reserva de mesa por WhatsApp.

Es una web estática (HTML, CSS y JavaScript) sin dependencias ni paso de build.

## Verla en local

```bash
npx --yes http-server@14.1.1 . -p 5173 -c-1
```

y abre http://localhost:5173.

## Editar los datos

Todo el contenido está en [`js/data.js`](js/data.js): dirección, teléfono, número de WhatsApp, horario, platos, precios y alérgenos. **Ahora mismo son datos de ejemplo**: cámbialos antes de publicar, sobre todo `whatsapp` (es el número al que llegan las reservas).

- Las carpetas de la carta salen del array `carta`, en el mismo orden.
- `horario` define los turnos de cada día y la última hora de reserva; las horas del formulario se calculan a partir de ahí.

## Tipografías

- Pencerio (ITF, Fontshare), alojada en `fonts/` con su licencia (`fonts/Pencerio-LICENSE.txt`).
- Zodiak y General Sans, servidas desde la API de Fontshare.
