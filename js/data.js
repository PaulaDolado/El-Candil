/*
 * Datos de El Candil.
 * TODO ANTES DE PUBLICAR: todo lo que hay aquí son DATOS DE EJEMPLO
 * (dirección, teléfonos, horario, platos y precios). Edita este archivo y la web se actualiza sola.
 */
window.EL_CANDIL = {
  info: {
    nombre: "El Candil",
    direccion: "Calle de la Lumbre, 7",
    ciudad: "28000 Madrid",
    telefono: "910 000 000",
    // Número de WhatsApp que recibe las reservas: prefijo de país + número, sin espacios ni "+".
    whatsapp: "34600000000",
    email: "hola@elcandil.es",
    // Horario por día de la semana (0 = domingo … 6 = sábado). Cada turno: [apertura, cierre, última reserva].
    horario: {
      0: { comida: ["13:00", "16:30", "15:30"] },
      1: null,
      2: { comida: ["13:00", "16:00", "15:00"], cena: ["20:30", "23:30", "22:30"] },
      3: { comida: ["13:00", "16:00", "15:00"], cena: ["20:30", "23:30", "22:30"] },
      4: { comida: ["13:00", "16:00", "15:00"], cena: ["20:30", "23:30", "22:30"] },
      5: { comida: ["13:00", "16:00", "15:00"], cena: ["20:30", "00:00", "23:00"] },
      6: { comida: ["13:00", "16:30", "15:30"], cena: ["20:30", "00:00", "23:00"] }
    },
    maxComensales: 12
  },

  // Alérgenos (los 14 de declaración obligatoria en la UE).
  alergenos: {
    gluten: "Gluten",
    crustaceos: "Crustáceos",
    huevo: "Huevo",
    pescado: "Pescado",
    cacahuetes: "Cacahuetes",
    soja: "Soja",
    lacteos: "Lácteos",
    frutos: "Frutos de cáscara",
    apio: "Apio",
    mostaza: "Mostaza",
    sesamo: "Sésamo",
    sulfitos: "Sulfitos",
    altramuces: "Altramuces",
    moluscos: "Moluscos"
  },

  /*
   * La carta. Cada sección es una carpeta del archivador.
   * tipo: "platos" (lista con precio), "menu" (precio cerrado con opciones) o "bebidas" (columnas de precio).
   * etiquetas posibles en un plato: "veg" (vegetariano), "vegano", "compartir", "casa" (de la casa).
   */
  carta: [
    {
      id: "menu-del-dia",
      titulo: "Menú del día",
      tipo: "menu",
      precio: 14.5,
      cuando: "De martes a viernes, a mediodía",
      incluye: "Primero, segundo, postre o café, pan y bebida (agua, vino de la casa o refresco).",
      grupos: [
        {
          titulo: "Primeros",
          platos: [
            { nombre: "Lentejas estofadas con chorizo", alergenos: ["apio"] },
            { nombre: "Ensalada mixta de la huerta", alergenos: ["huevo", "pescado"] },
            { nombre: "Crema de calabaza con picatostes", alergenos: ["gluten", "lacteos"], etiquetas: ["veg"] },
            { nombre: "Macarrones gratinados", alergenos: ["gluten", "lacteos"] }
          ]
        },
        {
          titulo: "Segundos",
          platos: [
            { nombre: "Pollo de corral al ajillo", alergenos: ["sulfitos"] },
            { nombre: "Merluza a la romana con pimientos", alergenos: ["gluten", "huevo", "pescado"] },
            { nombre: "Albóndigas en salsa de almendras", alergenos: ["gluten", "huevo", "frutos"] },
            { nombre: "Tortilla de patata con ensalada", alergenos: ["huevo"], etiquetas: ["veg"] }
          ]
        },
        {
          titulo: "Postres",
          platos: [
            { nombre: "Flan de huevo casero", alergenos: ["huevo", "lacteos"] },
            { nombre: "Arroz con leche", alergenos: ["lacteos"] },
            { nombre: "Fruta de temporada", etiquetas: ["vegano"] },
            { nombre: "Café o infusión" }
          ]
        }
      ]
    },
    {
      id: "entrantes",
      titulo: "Entrantes",
      tipo: "platos",
      nota: "Pensados para compartir en el centro de la mesa.",
      grupos: [
        {
          platos: [
            { nombre: "Croquetas caseras de jamón", desc: "Ocho unidades, bechamel de toda la vida.", precio: 9.5, alergenos: ["gluten", "lacteos", "huevo"], etiquetas: ["casa"] },
            { nombre: "Patatas bravas del Candil", desc: "Salsa brava picante y alioli.", precio: 6.5, alergenos: ["huevo"], etiquetas: ["veg"] },
            { nombre: "Jamón ibérico de cebo", desc: "Cortado a cuchillo, con pan con tomate.", precio: 18, alergenos: ["gluten"] },
            { nombre: "Tabla de quesos manchegos", desc: "Tierno, semicurado y curado, con membrillo.", precio: 14, alergenos: ["lacteos"], etiquetas: ["veg"] },
            { nombre: "Pimientos de Padrón", desc: "Unos pican y otros no.", precio: 7, etiquetas: ["vegano"] },
            { nombre: "Calamares a la andaluza", desc: "Con limón y alioli suave.", precio: 11.5, alergenos: ["gluten", "moluscos", "huevo"] },
            { nombre: "Tostas de escalivada con anchoa", desc: "Pimiento y berenjena asados al horno.", precio: 8.5, alergenos: ["gluten", "pescado"] },
            { nombre: "Salmorejo cordobés", desc: "Con huevo duro y virutas de jamón.", precio: 7.5, alergenos: ["gluten", "huevo"] }
          ]
        }
      ]
    },
    {
      id: "otros-primeros",
      titulo: "Otros primeros",
      tipo: "platos",
      nota: "Ensaladas, platos de cuchara, huevos y arroces.",
      grupos: [
        {
          platos: [
            { nombre: "Ensalada de tomate con ventresca", desc: "Tomate de temporada, cebolleta y aceite de oliva virgen extra.", precio: 12, alergenos: ["pescado"] },
            { nombre: "Ensalada de queso de cabra", desc: "Brotes tiernos, nueces y miel.", precio: 11.5, alergenos: ["lacteos", "frutos"], etiquetas: ["veg"] },
            { nombre: "Fabada asturiana", desc: "Con su compango: chorizo, morcilla y lacón.", precio: 13, alergenos: ["sulfitos"] },
            { nombre: "Sopa castellana", desc: "Ajo, pan, pimentón, jamón y huevo escalfado.", precio: 8, alergenos: ["gluten", "huevo"] },
            { nombre: "Huevos rotos con jamón", desc: "Patatas fritas en aceite de oliva.", precio: 11, alergenos: ["huevo"] },
            { nombre: "Verduras a la brasa con romesco", desc: "Según lo que traiga el mercado.", precio: 12.5, alergenos: ["frutos", "gluten"], etiquetas: ["vegano"] },
            { nombre: "Arroz meloso de setas", desc: "Precio por persona, mínimo dos.", precio: 15.5, alergenos: ["lacteos", "apio"], etiquetas: ["veg"] }
          ]
        }
      ]
    },
    {
      id: "carnes",
      titulo: "Platos de carne",
      tabCorta: "Carnes",
      tipo: "platos",
      nota: "Todas las carnes van con guarnición de patatas y pimientos.",
      grupos: [
        {
          platos: [
            { nombre: "Chuletón de vaca madurada", desc: "Un kilo, para compartir entre dos.", precio: 52, etiquetas: ["compartir"] },
            { nombre: "Entrecot de ternera", desc: "A la brasa, con sal en escamas.", precio: 22 },
            { nombre: "Secreto ibérico", desc: "A la brasa, con mojo verde.", precio: 17.5 },
            { nombre: "Cochinillo asado", desc: "Un cuarto, al horno de leña.", precio: 24, etiquetas: ["casa"] },
            { nombre: "Cordero lechal asado", desc: "Paletilla con su jugo.", precio: 23.5 },
            { nombre: "Rabo de toro estofado", desc: "Guisado lentamente al vino tinto.", precio: 19, alergenos: ["sulfitos", "apio"] },
            { nombre: "Carrillera ibérica", desc: "Al Pedro Ximénez con puré de patata.", precio: 17, alergenos: ["sulfitos", "lacteos"] }
          ]
        }
      ]
    },
    {
      id: "pescados",
      titulo: "Platos de pescado",
      tabCorta: "Pescados",
      tipo: "platos",
      nota: "Pescado del día según la lonja; pregúntanos por fuera de carta.",
      grupos: [
        {
          platos: [
            { nombre: "Bacalao al pil-pil", desc: "Confitado a baja temperatura.", precio: 19.5, alergenos: ["pescado"] },
            { nombre: "Lubina a la espalda", desc: "Con refrito de ajo y guindilla.", precio: 21, alergenos: ["pescado"] },
            { nombre: "Pulpo a la brasa", desc: "Con cachelos y pimentón de la Vera.", precio: 22, alergenos: ["moluscos"] },
            { nombre: "Merluza en salsa verde", desc: "Con almejas y espárragos.", precio: 20, alergenos: ["pescado", "moluscos", "gluten"] },
            { nombre: "Chipirones encebollados", desc: "Con cebolla pochada a fuego lento.", precio: 16.5, alergenos: ["moluscos"] },
            { nombre: "Gambas al ajillo", desc: "En cazuela de barro, con pan para mojar.", precio: 14.5, alergenos: ["crustaceos", "gluten"] }
          ]
        }
      ]
    },
    {
      id: "postres",
      titulo: "Postres",
      tipo: "platos",
      nota: "Todos los postres se hacen aquí cada mañana.",
      grupos: [
        {
          platos: [
            { nombre: "Torrija caramelizada", desc: "Con helado de vainilla.", precio: 6.5, alergenos: ["gluten", "lacteos", "huevo"], etiquetas: ["casa"] },
            { nombre: "Tarta de queso al horno", desc: "Cremosa por dentro.", precio: 6, alergenos: ["lacteos", "huevo", "gluten"] },
            { nombre: "Flan de huevo de la abuela", desc: "Con nata montada.", precio: 4.5, alergenos: ["lacteos", "huevo"] },
            { nombre: "Arroz con leche requemado", desc: "Con canela y piel de limón.", precio: 5, alergenos: ["lacteos"] },
            { nombre: "Natillas con galleta", precio: 4.5, alergenos: ["lacteos", "huevo", "gluten"] },
            { nombre: "Sorbete de limón al cava", precio: 5, alergenos: ["sulfitos"], etiquetas: ["vegano"] },
            { nombre: "Fruta de temporada", precio: 4, etiquetas: ["vegano"] }
          ]
        }
      ]
    },
    {
      id: "infantil",
      titulo: "Menú infantil",
      tabCorta: "Infantil",
      tipo: "menu",
      precio: 11,
      cuando: "Para peques hasta 12 años, todos los días",
      incluye: "Un plato principal, bebida y postre. Tenemos tronas: pídelas al reservar.",
      grupos: [
        {
          titulo: "Principal",
          platos: [
            { nombre: "Escalope de pollo con patatas fritas", alergenos: ["gluten", "huevo"] },
            { nombre: "Macarrones con tomate", alergenos: ["gluten"], etiquetas: ["veg"] },
            { nombre: "Hamburguesa de ternera con patatas", alergenos: ["gluten", "sesamo"] },
            { nombre: "Merluza rebozada con patatas", alergenos: ["gluten", "huevo", "pescado"] }
          ]
        },
        {
          titulo: "Bebida",
          platos: [{ nombre: "Agua, zumo o refresco" }]
        },
        {
          titulo: "Postre",
          platos: [
            { nombre: "Helado", alergenos: ["lacteos"] },
            { nombre: "Flan", alergenos: ["lacteos", "huevo"] },
            { nombre: "Fruta" }
          ]
        }
      ]
    },
    {
      id: "bebidas",
      titulo: "Bebidas",
      tipo: "bebidas",
      nota: "Pregunta por los vinos fuera de carta.",
      grupos: [
        {
          titulo: "Vinos tintos",
          columnas: ["Copa", "Botella"],
          platos: [
            { nombre: "Rioja Crianza", desc: "D.O.Ca. Rioja", precios: [3.5, 18] },
            { nombre: "Ribera del Duero Roble", desc: "D.O. Ribera del Duero", precios: [3.8, 20] },
            { nombre: "Toro joven", desc: "D.O. Toro", precios: [3, 15] }
          ]
        },
        {
          titulo: "Blancos y rosados",
          columnas: ["Copa", "Botella"],
          platos: [
            { nombre: "Verdejo", desc: "D.O. Rueda", precios: [3, 16] },
            { nombre: "Albariño", desc: "D.O. Rías Baixas", precios: [4, 22] },
            { nombre: "Rosado de Navarra", desc: "D.O. Navarra", precios: [3, 15] }
          ]
        },
        {
          titulo: "Cervezas, vermut y sangría",
          platos: [
            { nombre: "Caña", precio: 2.2 },
            { nombre: "Tercio", precio: 3 },
            { nombre: "Cerveza sin alcohol", precio: 2.8 },
            { nombre: "Vermut de grifo", desc: "Con su aceituna y piel de naranja.", precio: 3, etiquetas: ["casa"] },
            { nombre: "Sangría", desc: "Jarra de un litro.", precio: 14 }
          ]
        },
        {
          titulo: "Refrescos y agua",
          platos: [
            { nombre: "Refrescos", precio: 2.5 },
            { nombre: "Zumos", precio: 2.8 },
            { nombre: "Agua mineral", desc: "Con o sin gas.", precio: 2 }
          ]
        },
        {
          titulo: "Cafés e infusiones",
          platos: [
            { nombre: "Café solo", precio: 1.5 },
            { nombre: "Cortado", precio: 1.6 },
            { nombre: "Café con leche", precio: 1.8 },
            { nombre: "Infusiones", precio: 1.8 },
            { nombre: "Carajillo", precio: 2.5 }
          ]
        }
      ]
    }
  ]
};
