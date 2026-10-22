-- Reservas de El Candil con control de aforo.
--
-- La web nunca lee ni escribe las tablas directamente: solo puede llamar a
-- disponibilidad() y crear_reserva(). El comprobante por WhatsApp lo envía la
-- Edge Function «enviar-comprobante» con la clave de servicio.

-- ---------------------------------------------------------------------------
-- Ajustes del local (una sola fila)
-- ---------------------------------------------------------------------------

create table public.ajustes (
  id             int primary key default 1 check (id = 1),
  aforo          int not null default 60  check (aforo > 0),           -- comensales sentados a la vez
  duracion_min   int not null default 120 check (duracion_min >= 30),  -- lo que ocupa una mesa
  max_comensales int not null default 12  check (max_comensales > 0),  -- tope por reserva online
  zona_horaria   text not null default 'Europe/Madrid'
);

insert into public.ajustes (id) values (1);

-- ---------------------------------------------------------------------------
-- Reservas
-- ---------------------------------------------------------------------------

create table public.reservas (
  id                    uuid primary key default gen_random_uuid(),
  codigo                text not null unique,
  token                 uuid not null default gen_random_uuid(),  -- secreto para pedir el comprobante
  fecha                 date not null,
  hora                  time not null,
  comensales            int  not null check (comensales > 0),
  nombre                text not null,
  telefono              text not null,                            -- solo cifras, con prefijo de país
  notas                 text,
  estado                text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  comprobantes_enviados int  not null default 0,
  comprobante_enviado_at timestamptz,
  created_at            timestamptz not null default now()
);

create index reservas_fecha_idx on public.reservas (fecha) where estado = 'confirmada';

alter table public.ajustes  enable row level security;
alter table public.reservas enable row level security;
-- Sin políticas: el rol anónimo de la web no puede leer ni escribir las tablas.

-- ---------------------------------------------------------------------------
-- Ocupación
-- ---------------------------------------------------------------------------

-- Máximo de comensales sentados a la vez durante [inicio, inicio + duración)
-- de un día. El pico solo puede darse al empezar el tramo o al llegar una reserva.
create function public.ocupacion_maxima(p_fecha date, p_inicio int, p_duracion int)
returns int
language sql
stable
set search_path = public
as $$
  with r as (
    select (extract(epoch from hora) / 60)::int as ini, comensales
    from reservas
    where fecha = p_fecha and estado = 'confirmada'
  ),
  puntos as (
    select p_inicio as t
    union
    select ini from r where ini >= p_inicio and ini < p_inicio + p_duracion
  )
  select coalesce(max(ocupados), 0)::int
  from (
    select (select coalesce(sum(comensales), 0) from r where r.ini <= puntos.t and puntos.t < r.ini + p_duracion) as ocupados
    from puntos
  ) x;
$$;

revoke all on function public.ocupacion_maxima(date, int, int) from public, anon, authenticated;

-- Plazas libres para cada hora pedida. La web la usa para marcar las horas completas.
create function public.disponibilidad(p_fecha date, p_horas text[])
returns table (hora text, libres int)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  a ajustes;
begin
  select * into a from ajustes where id = 1;
  return query
    select h, greatest(a.aforo - ocupacion_maxima(p_fecha, (extract(epoch from h::time) / 60)::int, a.duracion_min), 0)
    from unnest(p_horas) as h;
end;
$$;

-- ---------------------------------------------------------------------------
-- Crear una reserva
-- ---------------------------------------------------------------------------

-- Devuelve {ok: true, id, codigo, token} o {ok: false, error, ...}.
-- El bloqueo por día impide que dos reservas simultáneas superen el aforo.
create function public.crear_reserva(
  p_fecha date,
  p_hora text,
  p_comensales int,
  p_nombre text,
  p_telefono text,
  p_notas text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  a        ajustes;
  ahora    timestamp;
  v_hora   time;
  v_inicio int;
  v_tel    text;
  v_libres int;
  v_codigo text;
  v_res    reservas;
  letras   constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  select * into a from ajustes where id = 1;
  ahora := now() at time zone a.zona_horaria;

  -- Validaciones (la web ya las hace, pero aquí son las que cuentan)
  begin
    v_hora := p_hora::time;
  exception when others then
    return jsonb_build_object('ok', false, 'error', 'hora');
  end;
  if p_fecha is null or p_fecha < ahora::date or p_fecha > ahora::date + 92 then
    return jsonb_build_object('ok', false, 'error', 'fecha');
  end if;
  if p_fecha = ahora::date and v_hora <= ahora::time then
    return jsonb_build_object('ok', false, 'error', 'hora');
  end if;
  if p_comensales is null or p_comensales < 1 or p_comensales > a.max_comensales then
    return jsonb_build_object('ok', false, 'error', 'comensales', 'max', a.max_comensales);
  end if;
  if length(trim(coalesce(p_nombre, ''))) not between 2 and 80 then
    return jsonb_build_object('ok', false, 'error', 'nombre');
  end if;

  v_tel := regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g');
  v_tel := regexp_replace(v_tel, '^00', '');
  if length(v_tel) = 9 then
    v_tel := '34' || v_tel;  -- número español sin prefijo
  end if;
  if length(v_tel) not between 10 and 15 then
    return jsonb_build_object('ok', false, 'error', 'telefono');
  end if;

  -- Aforo
  perform pg_advisory_xact_lock(hashtext('reservas:' || p_fecha::text));
  v_inicio := (extract(epoch from v_hora) / 60)::int;
  v_libres := a.aforo - ocupacion_maxima(p_fecha, v_inicio, a.duracion_min);
  if p_comensales > v_libres then
    return jsonb_build_object('ok', false, 'error', 'completo', 'libres', greatest(v_libres, 0));
  end if;

  -- Código corto y legible, sin letras que se confundan (0/O, 1/I)
  loop
    select string_agg(substr(letras, 1 + floor(random() * length(letras))::int, 1), '')
      into v_codigo from generate_series(1, 6);
    exit when not exists (select 1 from reservas where codigo = v_codigo);
  end loop;

  insert into reservas (codigo, fecha, hora, comensales, nombre, telefono, notas)
  values (v_codigo, p_fecha, v_hora, p_comensales, trim(p_nombre), v_tel, nullif(left(trim(coalesce(p_notas, '')), 500), ''))
  returning * into v_res;

  return jsonb_build_object('ok', true, 'id', v_res.id, 'codigo', v_res.codigo, 'token', v_res.token);
end;
$$;

revoke all on function public.disponibilidad(date, text[]) from public;
revoke all on function public.crear_reserva(date, text, int, text, text, text) from public;
grant execute on function public.disponibilidad(date, text[]) to anon, authenticated;
grant execute on function public.crear_reserva(date, text, int, text, text, text) to anon, authenticated;
