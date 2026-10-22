// Envía al cliente, desde el número de WhatsApp del restaurante, el comprobante
// de una reserva ya creada. La web llama a esta función con { id, token } que
// le devolvió crear_reserva(); sin el token correcto no se envía nada.
//
// Secretos (supabase secrets set ...):
//   WHATSAPP_TOKEN            token de acceso de la API de WhatsApp Business (Cloud API)
//   WHATSAPP_PHONE_NUMBER_ID  identificador del número del restaurante en Meta
//   WHATSAPP_TEMPLATE         nombre de la plantilla aprobada (por defecto «confirmacion_reserva»)
//   WHATSAPP_TEMPLATE_LANG    idioma de la plantilla (por defecto «es»)
//   WHATSAPP_API_VERSION      versión de la Graph API (por defecto «v23.0»)
//   RESTAURANTE_DIRECCION     dirección que aparece en el mensaje
//   RESTAURANTE_TELEFONO      teléfono para cancelar o cambiar la reserva
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los pone Supabase automáticamente.

import { createClient } from "jsr:@supabase/supabase-js@2";

const MAX_ENVIOS = 3;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function env(name: string, fallback?: string) {
  const v = Deno.env.get(name) ?? fallback;
  if (!v) throw new Error(`Falta el secreto ${name}`);
  return v;
}

const fechaLarga = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "metodo" }, 405);

  let id: string, token: string;
  try {
    ({ id, token } = await req.json());
  } catch {
    return json({ ok: false, error: "peticion" }, 400);
  }
  const uuid = /^[0-9a-f-]{36}$/i;
  if (!uuid.test(String(id)) || !uuid.test(String(token))) {
    return json({ ok: false, error: "peticion" }, 400);
  }

  try {
    const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

    const { data: r, error } = await db
      .from("reservas")
      .select("id, codigo, fecha, hora, comensales, nombre, telefono, estado, comprobantes_enviados")
      .eq("id", id)
      .eq("token", token)
      .maybeSingle();
    if (error) throw error;
    if (!r || r.estado !== "confirmada") return json({ ok: false, error: "reserva" }, 404);
    if (r.comprobantes_enviados >= MAX_ENVIOS) return json({ ok: false, error: "limite" }, 429);

    const dia = fechaLarga.format(new Date(`${r.fecha}T00:00:00Z`));
    const parametros = [
      r.nombre,
      dia.charAt(0).toUpperCase() + dia.slice(1),
      String(r.hora).slice(0, 5),
      String(r.comensales),
      r.codigo,
      env("RESTAURANTE_DIRECCION"),
      env("RESTAURANTE_TELEFONO"),
    ];

    const version = env("WHATSAPP_API_VERSION", "v23.0");
    const respuesta = await fetch(
      `https://graph.facebook.com/${version}/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: r.telefono,
          type: "template",
          template: {
            name: env("WHATSAPP_TEMPLATE", "confirmacion_reserva"),
            language: { code: env("WHATSAPP_TEMPLATE_LANG", "es") },
            components: [
              {
                type: "body",
                parameters: parametros.map((text) => ({ type: "text", text })),
              },
            ],
          },
        }),
      },
    );

    if (!respuesta.ok) {
      console.error("WhatsApp rechazó el envío", respuesta.status, await respuesta.text());
      return json({ ok: false, error: "whatsapp" }, 502);
    }

    await db
      .from("reservas")
      .update({
        comprobantes_enviados: r.comprobantes_enviados + 1,
        comprobante_enviado_at: new Date().toISOString(),
      })
      .eq("id", r.id);

    return json({ ok: true, telefono: r.telefono });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "servidor" }, 500);
  }
});
