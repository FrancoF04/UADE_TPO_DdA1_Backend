const bcrypt = require('bcryptjs');

const users = [
  {
    id: 'u1',
    email: 'juan@example.com',
    username: 'juanperez',
    password: 'qwerty123',
    fullName: 'Juan Perez',
    phoneNumber: '+5491112345678',
    activities: [],
    preferences: {
      categories: ['free_tour', 'adventure'],
      destinations: ['Buenos Aires'],
    },
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'u2',
    email: 'maria@example.com',
    username: 'mariagarcia',
    password: 'password456',
    fullName: 'Maria Garcia',
    phoneNumber: '+5491165432100',
    activities: [],
    preferences: {
      categories: ['gastronomic', 'guided_visit'],
      destinations: ['Mendoza', 'Bariloche'],
    },
    createdAt: '2026-02-01T10:00:00Z',
  },
];

const otpCodes = [];
const sessions = [];

const activities = [
  {
    id: 'a1',
    name: 'Walking Tour por San Telmo',
    destination: 'Buenos Aires',
    category: 'free_tour',
    description:
      'Recorre las calles empedradas de San Telmo, el barrio mas antiguo de Buenos Aires. Visita la Plaza Dorrego, el Mercado de San Telmo y descubre la historia del tango.',
    imageUrl: 'https://images.example.com/san-telmo-tour.jpg',
    galleryUrls: [
      'https://images.example.com/san-telmo-1.jpg',
      'https://images.example.com/san-telmo-2.jpg',
    ],
    duration: '2.5 horas',
    price: 0,
    currency: 'ARS',
    availableSpots: 15,
    totalSpots: 20,
    date: '2026-04-10T10:00:00Z',
    meetingPoint: 'Plaza de Mayo, frente al Cabildo',
    guide: { name: 'Carlos Rodriguez', rating: 4.8 },
    language: 'Espanol',
    included: ['Guia bilingue', 'Mapa del recorrido'],
    cancellationPolicy: 'Cancelacion gratuita hasta 24 horas antes',
    featured: true,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'a2',
    name: 'Free Tour por La Boca',
    destination: 'Buenos Aires',
    category: 'free_tour',
    description:
      'Descubre el colorido barrio de La Boca, hogar del Caminito y la Bombonera. Conoce la historia de la inmigracion italiana y el arte callejero.',
    imageUrl: 'https://images.example.com/la-boca-tour.jpg',
    galleryUrls: [
      'https://images.example.com/la-boca-1.jpg',
      'https://images.example.com/la-boca-2.jpg',
    ],
    duration: '2 horas',
    price: 0,
    currency: 'ARS',
    availableSpots: 20,
    totalSpots: 25,
    date: '2026-04-12T14:00:00Z',
    meetingPoint: 'Estacion La Boca del Premetro',
    guide: { name: 'Lucia Fernandez', rating: 4.9 },
    language: 'Espanol',
    included: ['Guia profesional', 'Fotos del grupo'],
    cancellationPolicy: 'Cancelacion gratuita hasta 12 horas antes',
    featured: true,
    createdAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'a3',
    name: 'Visita Guiada al Teatro Colon',
    destination: 'Buenos Aires',
    category: 'guided_visit',
    description:
      'Recorre uno de los teatros de opera mas importantes del mundo. Conoce su historia, arquitectura y los secretos detras del escenario.',
    imageUrl: 'https://images.example.com/teatro-colon.jpg',
    galleryUrls: [
      'https://images.example.com/teatro-colon-1.jpg',
      'https://images.example.com/teatro-colon-2.jpg',
    ],
    duration: '1.5 horas',
    price: 8000,
    currency: 'ARS',
    availableSpots: 10,
    totalSpots: 30,
    date: '2026-04-15T11:00:00Z',
    meetingPoint: 'Entrada principal del Teatro Colon, Cerrito 628',
    guide: { name: 'Ana Martinez', rating: 4.7 },
    language: 'Espanol',
    included: ['Entrada al teatro', 'Guia especializado', 'Auriculares'],
    cancellationPolicy: 'Cancelacion gratuita hasta 48 horas antes',
    featured: true,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'a4',
    name: 'Recorrido por el Museo MALBA',
    destination: 'Buenos Aires',
    category: 'guided_visit',
    description:
      'Explora la coleccion de arte latinoamericano mas importante de Argentina. Obras de Frida Kahlo, Diego Rivera, Tarsila do Amaral y mas.',
    imageUrl: 'https://images.example.com/malba.jpg',
    galleryUrls: [
      'https://images.example.com/malba-1.jpg',
      'https://images.example.com/malba-2.jpg',
    ],
    duration: '2 horas',
    price: 6000,
    currency: 'ARS',
    availableSpots: 12,
    totalSpots: 15,
    date: '2026-04-18T15:00:00Z',
    meetingPoint: 'Lobby del MALBA, Av. Figueroa Alcorta 3415',
    guide: { name: 'Pablo Suarez', rating: 4.6 },
    language: 'Espanol',
    included: ['Entrada al museo', 'Guia de arte'],
    cancellationPolicy: 'Cancelacion gratuita hasta 24 horas antes',
    featured: false,
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'a5',
    name: 'Excursion al Glaciar Perito Moreno',
    destination: 'Ushuaia',
    category: 'excursion',
    description:
      'Visita el impresionante Glaciar Perito Moreno en el Parque Nacional Los Glaciares. Incluye navegacion por el Lago Argentino y pasarelas panoramicas.',
    imageUrl: 'https://images.example.com/perito-moreno.jpg',
    galleryUrls: [
      'https://images.example.com/perito-moreno-1.jpg',
      'https://images.example.com/perito-moreno-2.jpg',
    ],
    duration: '8 horas',
    price: 45000,
    currency: 'ARS',
    availableSpots: 8,
    totalSpots: 20,
    date: '2026-05-01T07:00:00Z',
    meetingPoint: 'Terminal de buses de El Calafate',
    guide: { name: 'Miguel Torres', rating: 4.9 },
    language: 'Espanol',
    included: ['Transporte', 'Entrada al parque', 'Almuerzo', 'Guia'],
    cancellationPolicy: 'Cancelacion gratuita hasta 72 horas antes',
    featured: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'a6',
    name: 'Trekking en Cerro Catedral',
    destination: 'Bariloche',
    category: 'excursion',
    description:
      'Ascenso al Cerro Catedral con vistas panoramicas del Lago Nahuel Huapi. Ideal para amantes del senderismo y la naturaleza patagonica.',
    imageUrl: 'https://images.example.com/cerro-catedral.jpg',
    galleryUrls: [
      'https://images.example.com/cerro-catedral-1.jpg',
      'https://images.example.com/cerro-catedral-2.jpg',
    ],
    duration: '6 horas',
    price: 25000,
    currency: 'ARS',
    availableSpots: 10,
    totalSpots: 15,
    date: '2026-04-20T08:00:00Z',
    meetingPoint: 'Base del Cerro Catedral, Bariloche',
    guide: { name: 'Federico Lopez', rating: 4.8 },
    language: 'Espanol',
    included: ['Guia de montana', 'Seguro', 'Snacks'],
    cancellationPolicy: 'Cancelacion gratuita hasta 48 horas antes',
    featured: false,
    createdAt: '2026-02-05T10:00:00Z',
  },
  {
    id: 'a7',
    name: 'Tour de Vinos en Mendoza',
    destination: 'Mendoza',
    category: 'gastronomic',
    description:
      'Recorre las bodegas mas prestigiosas de Mendoza. Degustacion de Malbec, Cabernet Sauvignon y blend de alta gama con maridaje de quesos regionales.',
    imageUrl: 'https://images.example.com/vinos-mendoza.jpg',
    galleryUrls: [
      'https://images.example.com/vinos-mendoza-1.jpg',
      'https://images.example.com/vinos-mendoza-2.jpg',
    ],
    duration: '5 horas',
    price: 35000,
    currency: 'ARS',
    availableSpots: 6,
    totalSpots: 12,
    date: '2026-04-25T10:00:00Z',
    meetingPoint: 'Plaza Independencia, Mendoza',
    guide: { name: 'Valentina Rossi', rating: 4.9 },
    language: 'Espanol',
    included: ['Transporte', 'Degustacion en 3 bodegas', 'Tabla de quesos'],
    cancellationPolicy: 'Cancelacion gratuita hasta 48 horas antes',
    featured: true,
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'a8',
    name: 'Experiencia de Asado Argentino',
    destination: 'Buenos Aires',
    category: 'gastronomic',
    description:
      'Vivi la experiencia completa del asado argentino. Aprende a preparar chimichurri, cortes de carne y el arte del fuego. Incluye empanadas y vino.',
    imageUrl: 'https://images.example.com/asado-argentino.jpg',
    galleryUrls: [
      'https://images.example.com/asado-1.jpg',
      'https://images.example.com/asado-2.jpg',
    ],
    duration: '4 horas',
    price: 28000,
    currency: 'ARS',
    availableSpots: 8,
    totalSpots: 10,
    date: '2026-04-14T12:00:00Z',
    meetingPoint: 'Parrilla Don Julio, Guatemala 4699, Palermo',
    guide: { name: 'Roberto Diaz', rating: 4.7 },
    language: 'Espanol',
    included: ['Almuerzo completo', 'Bebidas', 'Recetario'],
    cancellationPolicy: 'Cancelacion gratuita hasta 24 horas antes',
    featured: false,
    createdAt: '2026-02-12T10:00:00Z',
  },
  {
    id: 'a9',
    name: 'Rafting en el Rio Mendoza',
    destination: 'Mendoza',
    category: 'adventure',
    description:
      'Desafia los rapidos del Rio Mendoza con esta emocionante aventura de rafting. Apto para principiantes y expertos con diferentes niveles de dificultad.',
    imageUrl: 'https://images.example.com/rafting-mendoza.jpg',
    galleryUrls: [
      'https://images.example.com/rafting-1.jpg',
      'https://images.example.com/rafting-2.jpg',
    ],
    duration: '3 horas',
    price: 30000,
    currency: 'ARS',
    availableSpots: 5,
    totalSpots: 8,
    date: '2026-04-22T09:00:00Z',
    meetingPoint: 'Base de Potrerillos, Ruta 82 km 50',
    guide: { name: 'Martin Gutierrez', rating: 4.8 },
    language: 'Espanol',
    included: ['Equipo completo', 'Instructor', 'Seguro', 'Fotos'],
    cancellationPolicy: 'Cancelacion gratuita hasta 48 horas antes',
    featured: true,
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'a10',
    name: 'Tirolesa en Bariloche',
    destination: 'Bariloche',
    category: 'adventure',
    description:
      'Vola sobre los bosques patagonicos con la tirolesa mas larga de Sudamerica. Vistas espectaculares del Lago Nahuel Huapi y los Andes.',
    imageUrl: 'https://images.example.com/tirolesa-bariloche.jpg',
    galleryUrls: [
      'https://images.example.com/tirolesa-1.jpg',
      'https://images.example.com/tirolesa-2.jpg',
    ],
    duration: '2 horas',
    price: 22000,
    currency: 'ARS',
    availableSpots: 10,
    totalSpots: 12,
    date: '2026-04-28T10:00:00Z',
    meetingPoint: 'Cerro Otto, Bariloche',
    guide: { name: 'Santiago Morales', rating: 4.7 },
    language: 'Espanol',
    included: ['Equipo de seguridad', 'Instructor certificado', 'Fotos'],
    cancellationPolicy: 'Cancelacion gratuita hasta 24 horas antes',
    featured: false,
    createdAt: '2026-02-18T10:00:00Z',
  },
  {
    id: 'a11',
    name: 'Tour Historico por Cordoba',
    destination: 'Cordoba',
    category: 'guided_visit',
    description:
      'Recorre la Manzana Jesuitica, la Catedral y el Cabildo de Cordoba. Conoce la historia colonial y la arquitectura barroca de la Docta.',
    imageUrl: 'https://images.example.com/cordoba-historico.jpg',
    galleryUrls: [
      'https://images.example.com/cordoba-1.jpg',
      'https://images.example.com/cordoba-2.jpg',
    ],
    duration: '3 horas',
    price: 5000,
    currency: 'ARS',
    availableSpots: 18,
    totalSpots: 25,
    date: '2026-04-16T09:00:00Z',
    meetingPoint: 'Plaza San Martin, Cordoba',
    guide: { name: 'Elena Vargas', rating: 4.6 },
    language: 'Espanol',
    included: ['Guia profesional', 'Entrada a la Manzana Jesuitica'],
    cancellationPolicy: 'Cancelacion gratuita hasta 24 horas antes',
    featured: false,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'a12',
    name: 'Tren a las Nubes en Salta',
    destination: 'Salta',
    category: 'excursion',
    description:
      'Viaja en el legendario Tren a las Nubes que alcanza los 4220 metros sobre el nivel del mar. Cruza puentes, tuneles y viaductos en la Puna saltena.',
    imageUrl: 'https://images.example.com/tren-nubes.jpg',
    galleryUrls: [
      'https://images.example.com/tren-nubes-1.jpg',
      'https://images.example.com/tren-nubes-2.jpg',
    ],
    duration: '15 horas',
    price: 50000,
    currency: 'ARS',
    availableSpots: 4,
    totalSpots: 40,
    date: '2026-05-05T06:00:00Z',
    meetingPoint: 'Estacion Salta, Ameghino 690',
    guide: { name: 'Jorge Pacheco', rating: 4.5 },
    language: 'Espanol',
    included: ['Pasaje en tren', 'Desayuno', 'Almuerzo', 'Guia a bordo'],
    cancellationPolicy: 'Sin reembolso. Cambio de fecha hasta 72 horas antes.',
    featured: true,
    createdAt: '2026-02-22T10:00:00Z',
  },
  {
    id: 'a13',
    name: 'Navegacion por el Canal Beagle',
    destination: 'Ushuaia',
    category: 'excursion',
    description:
      'Navega por el Canal Beagle y visita la Isla de los Lobos, la Isla de los Pajaros y el Faro Les Eclaireurs. Avistaje de fauna marina.',
    imageUrl: 'https://images.example.com/canal-beagle.jpg',
    galleryUrls: [
      'https://images.example.com/canal-beagle-1.jpg',
      'https://images.example.com/canal-beagle-2.jpg',
    ],
    duration: '4 horas',
    price: 32000,
    currency: 'ARS',
    availableSpots: 15,
    totalSpots: 30,
    date: '2026-05-10T09:00:00Z',
    meetingPoint: 'Puerto turistico de Ushuaia',
    guide: { name: 'Camila Rios', rating: 4.8 },
    language: 'Espanol',
    included: ['Navegacion', 'Guia naturalista', 'Chocolate caliente'],
    cancellationPolicy: 'Cancelacion gratuita hasta 48 horas antes',
    featured: false,
    createdAt: '2026-02-25T10:00:00Z',
  },
  {
    id: 'a14',
    name: 'Cabalgata en la Quebrada de las Flechas',
    destination: 'Salta',
    category: 'adventure',
    description:
      'Recorre a caballo las formaciones rocosas de la Quebrada de las Flechas. Paisajes unicos del noroeste argentino con guias baqueanos locales.',
    imageUrl: 'https://images.example.com/cabalgata-salta.jpg',
    galleryUrls: [
      'https://images.example.com/cabalgata-1.jpg',
      'https://images.example.com/cabalgata-2.jpg',
    ],
    duration: '4 horas',
    price: 20000,
    currency: 'ARS',
    availableSpots: 6,
    totalSpots: 8,
    date: '2026-05-08T08:00:00Z',
    meetingPoint: 'Angastaco, Ruta 40, Salta',
    guide: { name: 'Raul Condori', rating: 4.7 },
    language: 'Espanol',
    included: ['Caballo', 'Guia baqueano', 'Mate y empanadas'],
    cancellationPolicy: 'Cancelacion gratuita hasta 48 horas antes',
    featured: false,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'a15',
    name: 'Degustacion de Empanadas en Salta',
    destination: 'Salta',
    category: 'gastronomic',
    description:
      'Proba las mejores empanadas saltenas en un recorrido por las casas de empanadas mas tradicionales. Aprende la receta original del repulgue salteno.',
    imageUrl: 'https://images.example.com/empanadas-salta.jpg',
    galleryUrls: [
      'https://images.example.com/empanadas-1.jpg',
      'https://images.example.com/empanadas-2.jpg',
    ],
    duration: '3 horas',
    price: 15000,
    currency: 'ARS',
    availableSpots: 10,
    totalSpots: 12,
    date: '2026-05-12T11:00:00Z',
    meetingPoint: 'Plaza 9 de Julio, Salta',
    guide: { name: 'Isabel Mamani', rating: 4.9 },
    language: 'Espanol',
    included: ['Degustacion en 4 locales', 'Bebida', 'Recetario'],
    cancellationPolicy: 'Cancelacion gratuita hasta 24 horas antes',
    featured: true,
    createdAt: '2026-03-05T10:00:00Z',
  },
];

const initPasswords = async () => {
  if (users[0]) {
    users[0].password = await bcrypt.hash('password123', 10);
  }
  if (users[1]) {
    users[1].password = await bcrypt.hash('password456', 10);
  }
};

initPasswords();

const findUserByEmail = (email) => users.find((u) => u.email === email);
const findUserByUsername = (username) => users.find((u) => u.username === username);
const findUserById = (id) => users.find((u) => u.id === id);
const findSessionByToken = (token) => sessions.find((s) => s.token === token);

const addUser = (user) => {
  if (!Array.isArray(user.activities)) {
    user.activities = [];
  }
  users.push(user);
  return user;
};

const addUserActivity = (userId, activityId) => {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }

  const activity = activities.find((item) => item.id === activityId);
  if (!activity) {
    return null;
  }

  if (!Array.isArray(user.activities)) {
    user.activities = [];
  }

  if (!user.activities.includes(activityId)) {
    user.activities.push(activityId);
  }

  return activityId;
};

const getUserActivities = (userId) => {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }

  if (!Array.isArray(user.activities)) {
    user.activities = [];
  }

  return user.activities;
};

const addOtp = (otp) => {
  otpCodes.push(otp);
  return otp;
};

const addSession = (session) => {
  sessions.push(session);
  return session;
};

const removeSession = (token) => {
  const index = sessions.findIndex((s) => s.token === token);
  if (index !== -1) {
    sessions.splice(index, 1);
  }
};

const invalidateOtpsForEmail = (email) => {
  otpCodes.forEach((otp) => {
    if (otp.email === email) {
      otp.used = true;
    }
  });
};

module.exports = {
  users,
  otpCodes,
  sessions,
  activities,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  findSessionByToken,
  addUser,
  addOtp,
  addSession,
  removeSession,
  invalidateOtpsForEmail,
  addUserActivity,
  getUserActivities,
};
