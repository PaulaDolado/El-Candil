(function () {
  "use strict";

  var D = window.EL_CANDIL;
  var info = D.info;

  var euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  var longDate = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
  var DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
  var STOCKS = ["champagne", "whiskey", "honey"];
  var TAGS = { veg: "Vegetariano", vegano: "Vegano", compartir: "Para compartir", casa: "De la casa" };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function price(n) { return euro.format(n); }

  /* ---------- Carta ---------- */

  function meta(item) {
    var parts = [];
    (item.etiquetas || []).forEach(function (t) {
      if (TAGS[t]) parts.push('<span class="tag">' + TAGS[t] + "</span>");
    });
    if (item.alergenos && item.alergenos.length) {
      parts.unshift('<span class="tag tag--warn" hidden>No apto</span>');
      parts.push('<span class="dish__allergens">' + item.alergenos.map(function (a) {
        return '<span class="al" data-a="' + esc(a) + '">' + esc(D.alergenos[a] || a) + "</span>";
      }).join(", ") + "</span>");
    }
    return parts.length ? '<div class="dish__meta">' + parts.join("") + "</div>" : "";
  }

  // Cada plato o bebida lleva sus alérgenos en un atributo para poder filtrarlos.
  function allergenAttr(item) {
    return ' data-allergens="' + esc((item.alergenos || []).join(" ")) + '"';
  }

  function renderDishes(section) {
    var d = 0;
    return section.grupos.map(function (g) {
      return '<ul class="dishes">' + g.platos.map(function (p) {
        return '<li class="dish reveal" style="--d:' + (d++) + '"' + allergenAttr(p) + ">" +
          '<div class="dish__row"><h4 class="dish__name">' + esc(p.nombre) + '</h4>' +
          '<span class="dish__leader" aria-hidden="true"></span>' +
          '<span class="dish__price">' + price(p.precio) + "</span></div>" +
          (p.desc ? '<p class="dish__desc">' + esc(p.desc) + "</p>" : "") +
          meta(p) + "</li>";
      }).join("") + "</ul>";
    }).join("");
  }

  function renderSet(section) {
    var d = 0;
    return '<div class="set reveal" style="--d:0">' +
        '<p class="set__price">' + price(section.precio) + "<small>por persona</small></p>" +
        '<div><p class="set__when">' + esc(section.cuando) + "</p>" +
        '<p class="set__includes">' + esc(section.incluye) + "</p></div>" +
      "</div>" +
      '<div class="courses">' + section.grupos.map(function (g) {
        return '<div class="course reveal" style="--d:' + (++d) + '">' +
          '<h4 class="course__title">' + esc(g.titulo) + "</h4><ul>" +
          g.platos.map(function (p) {
            return "<li" + allergenAttr(p) + '><p class="course__dish">' + esc(p.nombre) + "</p>" + meta(p) + "</li>";
          }).join("") + "</ul></div>";
      }).join("") + "</div>";
  }

  function renderDrinks(section) {
    var d = 0;
    return '<div class="drinks">' + section.grupos.map(function (g) {
      var cols = g.columnas || [];
      var n = Math.max(cols.length, 1);
      return '<div class="drinks__group reveal" style="--cols:' + n + ";--d:" + (d++) + '">' +
        '<h4 class="drinks__head"><span>' + esc(g.titulo) + "</span>" +
          cols.map(function (c) { return "<span>" + esc(c) + "</span>"; }).join("") + "</h4>" +
        "<ul>" + g.platos.map(function (p) {
          var prices = p.precios || [p.precio];
          return '<li class="drink"' + allergenAttr(p) + '><div class="drink__name"><span class="drink__title">' + esc(p.nombre) + "</span>" +
            (p.desc ? '<span class="drink__desc">' + esc(p.desc) + "</span>" : "") + meta(p) + "</div>" +
            prices.map(function (v, i) {
              var label = cols[i] ? '<span class="sr-only">' + esc(cols[i]) + ": </span>" : "";
              return '<span class="drink__price">' + label + price(v) + "</span>";
            }).join("") + "</li>";
        }).join("") + "</ul></div>";
    }).join("") + "</div>";
  }

  function summary(section) {
    if (section.tipo === "menu") return [esc(section.cuando), "Precio cerrado · " + price(section.precio)];
    if (section.tipo === "bebidas") {
      return [section.grupos.length + " apartados", "Vinos, cervezas, refrescos y cafés"];
    }
    var all = [];
    section.grupos.forEach(function (g) { g.platos.forEach(function (p) { all.push(p.precio); }); });
    var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    return [all.length + " platos", "De " + price(min) + " a " + price(max)];
  }

  function renderCabinet() {
    var cabinet = $("#cabinet");
    cabinet.innerHTML = D.carta.map(function (s, i) {
      var body = s.tipo === "menu" ? renderSet(s) : s.tipo === "bebidas" ? renderDrinks(s) : renderDishes(s);
      var sum = summary(s);
      return '<section class="folder folder--' + STOCKS[i % 3] + '" id="carpeta-' + s.id + '" data-id="' + s.id + '" style="--pos:' + (i % 4) + '">' +
        '<h3 class="folder__head">' +
          '<button class="folder__tab" type="button" aria-expanded="false" aria-controls="contenido-' + s.id + '">' +
            '<span><span class="folder__tab-full">' + esc(s.titulo) + '</span><span class="folder__tab-short">' + esc(s.tabCorta || s.titulo) + "</span></span>" +
            '<svg class="folder__chev" aria-hidden="true"><use href="#i-chevron"/></svg>' +
          "</button>" +
        "</h3>" +
        '<div class="folder__body">' +
          '<div class="folder__lip" aria-hidden="true"><span class="folder__count">' + sum[0] + "</span><span>" + sum[1] + "</span></div>" +
          '<div class="folder__inner"><div class="folder__content" id="contenido-' + s.id + '" role="region" aria-label="' + esc(s.titulo) + '">' +
            '<p class="folder__title reveal" aria-hidden="true">' + esc(s.titulo) + "</p>" +
            (s.nota ? '<p class="folder__note reveal">' + esc(s.nota) + "</p>" : "") +
            body +
          "</div></div>" +
        "</div>" +
      "</section>";
    }).join("");

    $all(".folder", cabinet).forEach(function (f) {
      $(".folder__tab", f).addEventListener("click", function () { toggle(f); });
      $(".folder__lip", f).addEventListener("click", function () { toggle(f); });
    });
  }

  function setOpen(folder, open) {
    folder.classList.toggle("is-open", open);
    $(".folder__tab", folder).setAttribute("aria-expanded", String(open));
  }

  function toggle(folder, forceOpen) {
    var willOpen = forceOpen || !folder.classList.contains("is-open");
    var tab = $(".folder__tab", folder);
    var before = tab.getBoundingClientRect().top;

    $all(".folder.is-open").forEach(function (f) { if (f !== folder) setOpen(f, false); });
    setOpen(folder, willOpen);

    if (willOpen) {
      // Al cerrar una carpeta de arriba la pestaña pulsada se mueve: la devolvemos a su sitio
      // y, si queda fuera de la vista, llevamos la carpeta a la parte alta de la pantalla.
      requestAnimationFrame(function () {
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var header = $(".bar").offsetHeight;
        var after = tab.getBoundingClientRect().top;
        var target = after < header + 8 || after > window.innerHeight * 0.55 ? header + 24 : before;
        window.scrollBy({ top: after - target, behavior: reduce ? "auto" : "smooth" });
      });
    }
  }

  function openFolder(id) {
    var f = document.getElementById("carpeta-" + id);
    if (f) toggle(f, true);
  }

  /* ---------- Filtro de alérgenos ---------- */

  var allergy = $("#allergy");
  var allergyToggle = $("#allergy-toggle");
  var allergyPanel = $("#allergy-panel");

  function joinNames(list) {
    return list.length > 1 ? list.slice(0, -1).join(", ") + " y " + list[list.length - 1] : list.join("");
  }

  function selectedAllergens() {
    return $all("#allergy-options input:checked").map(function (i) { return i.value; });
  }

  function applyAllergens() {
    var sel = selectedAllergens();
    var items = $all("#cabinet [data-allergens]");
    var ok = 0;

    items.forEach(function (el) {
      var list = el.dataset.allergens ? el.dataset.allergens.split(" ") : [];
      var hit = list.some(function (a) { return sel.indexOf(a) > -1; });
      el.classList.toggle("is-excluded", hit);
      if (!hit) ok++;
      var warn = $(".tag--warn", el);
      if (warn) warn.hidden = !hit;
      $all(".al", el).forEach(function (s) { s.classList.toggle("is-hit", sel.indexOf(s.dataset.a) > -1); });
    });

    $all("#cabinet .folder").forEach(function (f) {
      var count = $(".folder__count", f);
      if (!count.dataset.base) count.dataset.base = count.textContent;
      var mine = $all("[data-allergens]", f);
      var good = mine.filter(function (el) { return !el.classList.contains("is-excluded"); }).length;
      count.textContent = sel.length ? good + " de " + mine.length + " aptos para ti" : count.dataset.base;
    });

    var names = sel.map(function (a) { return D.alergenos[a]; });
    $("#allergy-summary").textContent = !sel.length ? "Ningún alérgeno"
      : names.length > 3 ? names.slice(0, 2).join(", ") + " y " + (names.length - 2) + " más"
      : joinNames(names);
    allergy.classList.toggle("is-active", sel.length > 0);
    $("#allergy-reset").hidden = !sel.length;
    $("#allergy-status").textContent = sel.length
      ? "Tachamos lo que lleva " + joinNames(names.map(function (n) { return n.toLowerCase(); })) +
        ". Puedes tomar " + ok + " de " + items.length + " platos y bebidas."
      : "";
  }

  function setAllergyPanel(open) {
    allergyPanel.hidden = !open;
    allergyToggle.setAttribute("aria-expanded", String(open));
  }

  function clearAllergens() {
    $all("#allergy-options input").forEach(function (i) { i.checked = false; });
    applyAllergens();
  }

  function initAllergy() {
    $("#allergy-options").innerHTML = Object.keys(D.alergenos).map(function (k) {
      return '<label class="chip"><input type="checkbox" value="' + esc(k) + '"><span>' + esc(D.alergenos[k]) + "</span></label>";
    }).join("");

    $("#allergy-options").addEventListener("change", applyAllergens);
    allergyToggle.addEventListener("click", function () { setAllergyPanel(allergyPanel.hidden); });
    $("#allergy-done").addEventListener("click", function () { setAllergyPanel(false); allergyToggle.focus(); });
    $("#allergy-clear").addEventListener("click", clearAllergens);
    $("#allergy-reset").addEventListener("click", function () { clearAllergens(); allergyToggle.focus(); });
    allergy.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !allergyPanel.hidden) { setAllergyPanel(false); allergyToggle.focus(); }
    });
    applyAllergens();
  }

  /* ---------- Horario ---------- */

  function turnos(day) {
    var h = info.horario[day];
    if (!h) return [];
    return ["comida", "cena"].filter(function (k) { return h[k]; }).map(function (k) {
      return { tipo: k, abre: h[k][0], cierra: h[k][1], ultima: h[k][2] };
    });
  }
  function rango(t) { return t.abre + "–" + t.cierra; }

  function renderToday() {
    var now = new Date();
    var day = now.getDay();
    var hoy = turnos(day);
    var el = $("#hoy");
    if (hoy.length) {
      el.innerHTML = "<strong>Hoy, " + DAYS[day] + ":</strong> abrimos de " +
        hoy.map(rango).join(" y de ").replace(/–/g, " a ") + ".";
    } else {
      for (var i = 1; i <= 7; i++) {
        var next = (day + i) % 7;
        var t = turnos(next);
        if (t.length) {
          el.innerHTML = "<strong>Hoy " + DAYS[day] + " cerramos.</strong> Volvemos " +
            (i === 1 ? "mañana" : "el " + DAYS[next]) + " a las " + t[0].abre + ".";
          break;
        }
      }
    }
  }

  function renderHours() {
    var today = new Date().getDay();
    $("#hours").innerHTML = "<tbody>" + WEEK_ORDER.map(function (d) {
      var t = turnos(d);
      var cls = [d === today ? "is-today" : "", t.length ? "" : "is-closed"].join(" ").trim();
      return '<tr class="' + cls + '"><th scope="row">' + DAYS[d].charAt(0).toUpperCase() + DAYS[d].slice(1) + "</th><td>" +
        (t.length ? t.map(rango).join("<br>") : "Cerrado") + "</td></tr>";
    }).join("") + "</tbody>";
  }

  function renderInfo() {
    $("#dir").innerHTML = esc(info.direccion) + "<br>" + esc(info.ciudad);
    var map = $("#map-link");
    map.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(info.nombre + ", " + info.direccion + ", " + info.ciudad);
    var tel = $("#tel-link");
    tel.href = "tel:+34" + info.telefono.replace(/\D/g, "");
    tel.textContent = info.telefono;
    $("#year").textContent = new Date().getFullYear();
    var menu = D.carta.filter(function (s) { return s.id === "menu-del-dia"; })[0];
    if (menu) $("#medal-price").textContent = price(menu.precio);
  }

  /* ---------- Reserva ---------- */

  var form = $("#booking");
  var fecha = $("#f-fecha");
  var comensales = $("#f-comensales");
  var ticket = $(".ticket");
  var status = $("#booking-status");

  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function parseISO(v) {
    var p = v.split("-").map(Number);
    return p.length === 3 && p[0] ? new Date(p[0], p[1] - 1, p[2]) : null;
  }
  function toMin(hhmm) { var p = hhmm.split(":").map(Number); return p[0] * 60 + p[1]; }
  function toHHMM(m) { return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }

  function slotsFor(date) {
    var isToday = iso(date) === iso(new Date());
    var nowMin = new Date().getHours() * 60 + new Date().getMinutes() + 30;
    return turnos(date.getDay()).map(function (t) {
      var list = [];
      for (var m = toMin(t.abre); m <= toMin(t.ultima); m += 30) {
        if (!isToday || m > nowMin) list.push(toHHMM(m));
      }
      return { tipo: t.tipo, horas: list };
    }).filter(function (g) { return g.horas.length; });
  }

  function renderSlots() {
    var box = $("#slots");
    var prev = (form.elements.hora && form.elements.hora.value) || "";
    var date = parseISO(fecha.value);
    if (!date) {
      box.innerHTML = '<p class="slots__empty">Elige primero el día y te enseñamos las horas libres.</p>';
      return;
    }
    var groups = slotsFor(date);
    if (!groups.length) {
      box.innerHTML = '<p class="slots__empty">' + (turnos(date.getDay()).length
        ? "Para hoy ya no quedan horas. Prueba con otro día."
        : "Los " + DAYS[date.getDay()] + " cerramos. Elige otro día.") + "</p>";
      return;
    }
    box.innerHTML = groups.map(function (g) {
      return '<div class="slots__group"><h4>' + (g.tipo === "comida" ? "Comida" : "Cena") + '</h4><div class="slots__list">' +
        g.horas.map(function (h) {
          return '<label class="slot"><input type="radio" name="hora" value="' + h + '"' + (h === prev ? " checked" : "") +
            '><span>' + h + "</span></label>";
        }).join("") + "</div></div>";
    }).join("");
  }

  function setTicket(key, value) {
    var dd = $('[data-t="' + key + '"]', ticket);
    dd.textContent = value || "—";
    dd.classList.toggle("is-empty", !value);
  }

  function updateTicket() {
    var date = parseISO(fecha.value);
    setTicket("fecha", date ? longDate.format(date) : "");
    setTicket("hora", form.elements.hora && form.elements.hora.value ? form.elements.hora.value + " h" : "");
    var n = parseInt(comensales.value, 10);
    setTicket("comensales", n > 0 ? n + (n === 1 ? " persona" : " personas") : "");
    setTicket("nombre", form.elements.nombre.value.trim());
    setTicket("telefono", form.elements.telefono.value.trim());
    setTicket("notas", form.elements.notas.value.trim());
    ticket.classList.remove("is-sent");
  }

  function setError(id, msg, input) {
    $("#e-" + id).textContent = msg || "";
    if (input) {
      if (msg) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  }

  function clampGuests() {
    var n = parseInt(comensales.value, 10);
    $('[data-step="-1"]').disabled = !(n > 1);
    $('[data-step="1"]').disabled = n >= info.maxComensales;
  }

  function validate() {
    var first = null;
    function fail(id, msg, input, focusEl) {
      setError(id, msg, input);
      if (!first) first = focusEl || input;
    }

    ["fecha", "hora", "comensales", "nombre", "telefono"].forEach(function (k) { setError(k, "", form.elements[k] && form.elements[k].nodeType ? form.elements[k] : null); });

    var date = parseISO(fecha.value);
    var today = parseISO(iso(new Date()));
    if (!date) fail("fecha", "Elige el día de la reserva.", fecha);
    else if (date < today) fail("fecha", "Esa fecha ya ha pasado. Elige hoy o un día posterior.", fecha);
    else if (!turnos(date.getDay()).length) fail("fecha", "Los " + DAYS[date.getDay()] + " cerramos. Elige otro día.", fecha);

    var hora = form.elements.hora;
    if (date && !first && !(hora && hora.value)) {
      var firstSlot = $('#slots input[type="radio"]');
      fail("hora", firstSlot ? "Elige a qué hora queréis venir." : "No quedan horas libres ese día. Prueba con otro.", null, firstSlot || fecha);
    }

    var n = parseInt(comensales.value, 10);
    if (!(n >= 1)) fail("comensales", "Indica cuántas personas vais a venir.", comensales);
    else if (n > info.maxComensales) fail("comensales", "Para grupos de más de " + info.maxComensales + " personas, llámanos al " + info.telefono + ".", comensales);

    var nombre = form.elements.nombre;
    if (nombre.value.trim().length < 2) fail("nombre", "Escribe el nombre para la reserva.", nombre);

    var tel = form.elements.telefono;
    var digits = tel.value.replace(/\D/g, "").replace(/^(00)?34(?=\d{9}$)/, "");
    if (!digits) fail("telefono", "Necesitamos un teléfono para confirmarte la mesa.", tel);
    else if (digits.length < 9) fail("telefono", "Revisa el teléfono: debe tener al menos 9 cifras.", tel);

    if (first) first.focus();
    return !first;
  }

  function message() {
    var date = parseISO(fecha.value);
    var lines = [
      "Hola, quiero reservar mesa en " + info.nombre + ":",
      "• Día: " + longDate.format(date),
      "• Hora: " + form.elements.hora.value,
      "• Comensales: " + parseInt(comensales.value, 10),
      "• Nombre: " + form.elements.nombre.value.trim(),
      "• Teléfono: " + form.elements.telefono.value.trim()
    ];
    var notas = form.elements.notas.value.trim();
    if (notas) lines.push("• Comentarios: " + notas);
    lines.push("", "¡Gracias!");
    return lines.join("\n");
  }

  function initBooking() {
    var today = new Date();
    fecha.min = iso(today);
    var max = new Date(today); max.setMonth(max.getMonth() + 3);
    fecha.max = iso(max);

    fecha.addEventListener("change", function () { setError("fecha", "", fecha); renderSlots(); updateTicket(); });
    $("#slots").addEventListener("change", function () { setError("hora", ""); updateTicket(); });

    $all(".stepper__btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var n = (parseInt(comensales.value, 10) || 0) + Number(b.dataset.step);
        comensales.value = Math.min(Math.max(n, 1), info.maxComensales);
        setError("comensales", "", comensales);
        clampGuests();
        updateTicket();
      });
    });
    comensales.addEventListener("input", function () { setError("comensales", "", comensales); clampGuests(); updateTicket(); });

    ["nombre", "telefono", "notas"].forEach(function (k) {
      form.elements[k].addEventListener("input", function () {
        if (k !== "notas") setError(k, "", form.elements[k]);
        updateTicket();
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.innerHTML = "";
      if (!validate()) return;
      var url = "https://wa.me/" + info.whatsapp + "?text=" + encodeURIComponent(message());
      window.open(url, "_blank", "noopener");
      ticket.classList.add("is-sent");
      status.innerHTML = "Te hemos abierto WhatsApp con la reserva escrita. <strong>Envía el mensaje</strong> y te confirmaremos la mesa lo antes posible. " +
        '¿No se ha abierto? <a href="' + url + '" target="_blank" rel="noopener">Abrir WhatsApp</a> o llámanos al <a href="tel:+34' +
        info.telefono.replace(/\D/g, "") + '">' + esc(info.telefono) + "</a>.";
    });

    clampGuests();
    updateTicket();
  }

  /* ---------- Arranque ---------- */

  renderCabinet();
  initAllergy();
  renderToday();
  renderHours();
  renderInfo();
  initBooking();

  // Enlaces que abren una carpeta concreta (p. ej. la medalla del menú del día)
  $all("[data-open]").forEach(function (a) {
    a.addEventListener("click", function () { setTimeout(function () { openFolder(a.dataset.open); }, 350); });
  });

  // La primera carpeta (menú del día) empieza abierta; también admite #carpeta-<id> en la URL.
  var fromHash = location.hash.indexOf("#carpeta-") === 0 ? location.hash.slice(9) : null;
  var first = document.getElementById("carpeta-" + (fromHash || D.carta[0].id));
  if (first) setOpen(first, true);
})();
