# Reservas online: Supabase y WhatsApp

Con esto, «Reservar mesa» guarda la reserva comprobando el aforo, y «Enviar comprobante por WhatsApp» le manda al cliente un mensaje desde el número del restaurante.

Mientras `supabaseUrl` y `supabaseKey` estén vacíos en `js/data.js`, la web sigue funcionando como antes: la reserva se envía al WhatsApp del restaurante y no se guarda.

```
Web ──rpc──► crear_reserva()        guarda la reserva si cabe en el aforo
    ──rpc──► disponibilidad()       marca las horas completas
    ──POST─► enviar-comprobante     Edge Function ──► API de WhatsApp Business ──► cliente
```

## 1. Base de datos

1. Crea un proyecto en [supabase.com](https://supabase.com) (el plan gratuito sirve).
2. Abre **SQL Editor**, pega el contenido de [`migrations/20261020120000_reservas.sql`](migrations/20261020120000_reservas.sql) y ejecútalo.
   Con la CLI: `supabase link --project-ref <ref>` y `supabase db push`.
3. Ajusta el aforo en **Table Editor → ajustes**:

| Campo | Qué es | Por defecto |
| --- | --- | --- |
| `aforo` | Comensales que caben sentados a la vez | 60 |
| `duracion_min` | Minutos que ocupa una mesa | 120 |
| `max_comensales` | Máximo de personas por reserva online | 12 |
| `zona_horaria` | Zona horaria del restaurante | Europe/Madrid |

4. En **Project Settings → API** copia la **URL del proyecto** y la clave **anon / publishable** en `js/data.js`:

```js
reservas: {
  supabaseUrl: "https://xxxxxxxx.supabase.co",
  supabaseKey: "eyJ… o sb_publishable_…"
}
```

Esa clave es pública: la web solo puede llamar a `crear_reserva()` y `disponibilidad()`. Las tablas tienen Row Level Security sin políticas, así que nadie puede leer ni modificar las reservas desde fuera.

### Cómo se controla el aforo

Cada reserva ocupa sus comensales durante `duracion_min` desde su hora. Al reservar se calcula el momento de más ocupación dentro de ese tramo; si los nuevos comensales no caben, la reserva se rechaza y la web propone otra hora. La comprobación y el guardado van dentro de un bloqueo por día, así que dos reservas simultáneas no pueden superar el aforo entre las dos.

Las reservas se ven en **Table Editor → reservas**. Para anular una, cambia `estado` a `cancelada`: deja de contar para el aforo.

> [!NOTE]
> Las horas que se ofrecen salen del horario de `js/data.js`. El servidor comprueba aforo, fecha (de hoy a tres meses), comensales y teléfono, pero no los días de cierre.

## 2. Comprobante por WhatsApp

Un mensaje que **empieza el restaurante** solo se puede enviar con la API de WhatsApp Business y una plantilla aprobada por Meta.

### 2.1 Cuenta y número

1. En [developers.facebook.com](https://developers.facebook.com) crea una app de tipo **Business** y añade el producto **WhatsApp**.
2. Registra y verifica el número del restaurante. Si ese número ya está en la app de WhatsApp, Meta te pedirá migrarlo o, si está en WhatsApp Business, te ofrecerá usarlo a la vez en la app y en la API; revisa qué opción tienes.
3. Apunta el **Phone number ID**.
4. Crea un **usuario del sistema** en el Business Manager, dale permiso sobre la app y genera un **token permanente** con `whatsapp_business_messaging`.

### 2.2 Plantilla

En **WhatsApp Manager → Plantillas de mensajes** crea una plantilla:

- **Nombre:** `confirmacion_reserva`
- **Categoría:** Utilidad
- **Idioma:** Español (`es`)
- **Cuerpo:**

```
Hola {{1}}, tu reserva en El Candil está confirmada.

📅 {{2}}
🕘 {{3}} h
👥 {{4}} personas
🔖 Código de reserva: {{5}}

📍 {{6}}

Si no puedes venir o quieres cambiar algo, responde a este mensaje o llámanos al {{7}}.
```

Las variables las rellena la función en este orden: nombre, día, hora, comensales, código, dirección y teléfono. Si cambias el texto de la plantilla, mantén las siete variables y su orden.

### 2.3 Desplegar la función

```bash
supabase secrets set WHATSAPP_TOKEN=... WHATSAPP_PHONE_NUMBER_ID=... RESTAURANTE_DIRECCION="Calle de la Lumbre, 7, 28000 Madrid" RESTAURANTE_TELEFONO="910 000 000"
```

```bash
supabase functions deploy enviar-comprobante --no-verify-jwt
```

`--no-verify-jwt` es necesario porque la web no inicia sesión. La función solo envía el comprobante a quien presenta el `id` y el `token` secreto que devolvió `crear_reserva()`, y como mucho tres veces por reserva.

Secretos opcionales: `WHATSAPP_TEMPLATE` (por defecto `confirmacion_reserva`), `WHATSAPP_TEMPLATE_LANG` (`es`) y `WHATSAPP_API_VERSION` (`v23.0`; revisa en la documentación de Meta cuál es la vigente).

Los fallos de envío quedan en **Edge Functions → enviar-comprobante → Logs**.

## Costes y límites

- Supabase: el plan gratuito cubre de sobra un restaurante.
- WhatsApp: Meta cobra por mensaje de plantilla según el país y la categoría (Utilidad es la más barata). Revisa sus tarifas actuales.
- Cualquiera puede hacer una reserva con un teléfono que no es el suyo, igual que por teléfono. Si se abusara, el siguiente paso sería añadir un captcha (por ejemplo Cloudflare Turnstile) antes de `crear_reserva()`.
