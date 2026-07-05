const bcrypt = require('bcryptjs');

const users = [
  {
    id: 'u1',
    email: 'juan@example.com',
    username: 'juanperez',
    password: '',
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
    password: '',
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
const bookings = [];
const favorites = [];
const ratings = [];
const news = [
  {
    id: 'n1',
    category: 'promocion',
    imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&q=80&auto=format&fit=crop',
    title: 'Promo especial en Buenos Aires',
    description: 'Beneficios y precios promocionales para recorridos guiados durante abril y mayo.',
    activityId: 'a1',
    content:
      'Promocion especial para recorridos guiados, con cupos limitados y beneficios para reservas anticipadas.',
    createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'n2',
    category: 'descuento',
    imageUrl: 'https://images.unsplash.com/photo-1606185695994-f392203f3583?w=1200&q=80&auto=format&fit=crop',
    title: '20% off en experiencias de vino',
    description: 'Tarifas con descuento para tours de bodegas y degustaciones premium en Mendoza.',
    activityId: 'a7',
    content: 'La temporada de vendimia incluye beneficios especiales y descuentos para reservas flexibles.',
    createdAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'n3',
    category: 'nuevo_destino',
    imageUrl: 'https://images.unsplash.com/photo-1612900538226-0e2140aa02f6?w=1200&q=80&auto=format&fit=crop',
    title: 'Nuevo destino: Salta',
    description: 'Sumamos Salta al catalogo: excursiones de altura y experiencias gastronomicas regionales.',
    activityId: 'a12',
    content: 'Salta concentra varias de las experiencias destacadas del mes con alta demanda.',
    createdAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'n4',
    category: 'noticia',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80&auto=format&fit=crop',
    title: 'XploreNow renueva su catalogo de actividades',
    description: 'Incorporamos nuevas guias certificadas y actualizamos las politicas de cancelacion.',
    content:
      'Como parte de la mejora continua, sumamos guias certificadas en categoria adventure y excursion, y actualizamos los plazos de cancelacion para mayor flexibilidad.',
    createdAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'n5',
    category: 'descuento',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80&auto=format&fit=crop',
    title: '15% off en aventura patagonica',
    description: 'Descuento aplicado en trekking y travesias para reservas de mayo.',
    activityId: 'a4',
    content: 'Reservando en mayo accedes a 15% de descuento en actividades adventure de Bariloche y Ushuaia.',
    createdAt: '2026-04-18T10:00:00Z',
  },
  {
    id: 'n6',
    category: 'nuevo_destino',
    imageUrl: 'https://images.unsplash.com/photo-1610995195985-7229a1409d4b?w=1200&q=80&auto=format&fit=crop',
    title: 'Nuevo destino: Cordoba',
    description: 'Sumamos Cordoba al catalogo: recorridos historicos por la Manzana Jesuitica y arquitectura barroca.',
    activityId: 'a11',
    content: 'La Docta ya esta disponible con visitas guiadas por su patrimonio jesuitico, la Catedral y el Cabildo.',
    createdAt: '2026-04-20T10:00:00Z',
  },
];

const activities = [
  {
    id: 'a1',
    name: 'Walking Tour por San Telmo',
    destination: 'Buenos Aires',
    category: 'free_tour',
    description:
      'Recorre las calles empedradas de San Telmo, el barrio mas antiguo de Buenos Aires. Visita la Plaza Dorrego, el Mercado de San Telmo y descubre la historia del tango.',
    imageUrl: '/uploads/activities/a1_0.jpg',
    galleryUrls: [
      '/uploads/activities/a1_1.jpg',
      '/uploads/activities/a1_2.jpg',
    ],
    duration: '2.5 horas',
    price: 0,
    currency: 'ARS',
    availableSpots: 15,
    totalSpots: 20,
    date: '2026-04-10T10:00:00Z',
    dates: buildAvailableDates('2026-04-10T10:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a2_0.jpg',
    galleryUrls: [
      'https://images.unsplash.com/photo-1611865422861-391cf5f3ba49?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1609080814811-5837f3c7095a?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1684355277143-69c991fa052a?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1693891557268-70c5d6195922?w=1200&q=80&auto=format&fit=crop',
    ],
    duration: '2 horas',
    price: 0,
    currency: 'ARS',
    availableSpots: 20,
    totalSpots: 25,
    date: '2026-04-12T14:00:00Z',
    dates: buildAvailableDates('2026-04-12T14:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a3_0.jpg',
    galleryUrls: [
      '/uploads/activities/a3_1.jpg',
    ],
    duration: '1.5 horas',
    price: 8000,
    currency: 'ARS',
    availableSpots: 10,
    totalSpots: 30,
    date: '2026-04-15T11:00:00Z',
    dates: buildAvailableDates('2026-04-15T11:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a4_0.jpg',
    galleryUrls: [
      '/uploads/activities/a4_1.jpg',
      '/uploads/activities/a4_2.jpg',
      '/uploads/activities/a4_3.jpg',
    ],
    duration: '2 horas',
    price: 6000,
    currency: 'ARS',
    availableSpots: 12,
    totalSpots: 15,
    date: '2026-04-18T15:00:00Z',
    dates: buildAvailableDates('2026-04-18T15:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a5_0.jpg',
    galleryUrls: [
      'https://images.unsplash.com/photo-1638500551033-a0f60c8e768e?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552751753-0fc84ae5b6c8?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593434820349-0ca11844c957?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1694011772958-fa5641fa8873?w=1200&q=80&auto=format&fit=crop',
    ],
    duration: '8 horas',
    price: 45000,
    currency: 'ARS',
    availableSpots: 8,
    totalSpots: 20,
    date: '2026-05-01T07:00:00Z',
    dates: buildAvailableDates('2026-05-01T07:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a6_0.jpg',
    galleryUrls: [
      '/uploads/activities/a6_1.jpg',
    ],
    duration: '6 horas',
    price: 25000,
    currency: 'ARS',
    availableSpots: 10,
    totalSpots: 15,
    date: '2026-04-20T08:00:00Z',
    dates: buildAvailableDates('2026-04-20T08:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a7_0.jpg',
    galleryUrls: [
      'https://images.unsplash.com/photo-1639757664366-83a495f4a9d9?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558565850-88bf2a02e42e?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1659038025134-5f47bf7956c0?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1627626651107-7ce593b9bd76?w=1200&q=80&auto=format&fit=crop',
    ],
    duration: '5 horas',
    price: 35000,
    currency: 'ARS',
    availableSpots: 6,
    totalSpots: 12,
    date: '2026-04-25T10:00:00Z',
    dates: buildAvailableDates('2026-04-25T10:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a8_0.jpg',
    galleryUrls: [
      'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497395122351-5d3554bbdb17?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1673491100948-8ef540ceedf4?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592409713878-33e2015e92b4?w=1200&q=80&auto=format&fit=crop',
    ],
    duration: '4 horas',
    price: 28000,
    currency: 'ARS',
    availableSpots: 8,
    totalSpots: 10,
    date: '2026-04-14T12:00:00Z',
    dates: buildAvailableDates('2026-04-14T12:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a9_0.jpg',
    galleryUrls: [
      '/uploads/activities/a9_1.jpg',
    ],
    duration: '3 horas',
    price: 30000,
    currency: 'ARS',
    availableSpots: 5,
    totalSpots: 8,
    date: '2026-04-22T09:00:00Z',
    dates: buildAvailableDates('2026-04-22T09:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a10_0.jpg',
    galleryUrls: [
      '/uploads/activities/a10_1.jpg',
      '/uploads/activities/a10_2.jpg',
    ],
    duration: '2 horas',
    price: 22000,
    currency: 'ARS',
    availableSpots: 10,
    totalSpots: 12,
    date: '2026-04-28T10:00:00Z',
    dates: buildAvailableDates('2026-04-28T10:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a11_0.jpg',
    galleryUrls: [
      'https://images.unsplash.com/photo-1610995195985-7229a1409d4b?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1619906437551-0226322e0a72?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610995181977-0283a334a65c?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1699375220213-a444c2edcb50?w=1200&q=80&auto=format&fit=crop',
    ],
    duration: '3 horas',
    price: 5000,
    currency: 'ARS',
    availableSpots: 18,
    totalSpots: 25,
    date: '2026-04-16T09:00:00Z',
    dates: buildAvailableDates('2026-04-16T09:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a12_0.png',
    galleryUrls: [
      '/uploads/activities/a12_1.jpg',
      '/uploads/activities/a12_2.jpg',
      '/uploads/activities/a12_3.jpg',
    ],
    duration: '15 horas',
    price: 50000,
    currency: 'ARS',
    availableSpots: 4,
    totalSpots: 40,
    date: '2026-05-05T06:00:00Z',
    dates: buildAvailableDates('2026-05-05T06:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a13_0.jpg',
    galleryUrls: [
      'https://images.unsplash.com/photo-1671595334685-fce6db1f53a4?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520637438573-ee1ba80b2a7f?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1712921674745-09ee3dbdff3d?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1671595425121-91f5c1b54ff9?w=1200&q=80&auto=format&fit=crop',
    ],
    duration: '4 horas',
    price: 32000,
    currency: 'ARS',
    availableSpots: 15,
    totalSpots: 30,
    date: '2026-05-10T09:00:00Z',
    dates: buildAvailableDates('2026-05-10T09:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a14_0.jpg',
    galleryUrls: [
      'https://images.unsplash.com/photo-1764967112006-4e4631abd58e?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1764962223825-4fee79748d09?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1764962249533-cd4539d25354?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1660866838294-672fe35589b6?w=1200&q=80&auto=format&fit=crop',
    ],
    duration: '4 horas',
    price: 20000,
    currency: 'ARS',
    availableSpots: 6,
    totalSpots: 8,
    date: '2026-05-08T08:00:00Z',
    dates: buildAvailableDates('2026-05-08T08:00:00Z', 4, 7),
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
    imageUrl: '/uploads/activities/a15_0.jpg',
    galleryUrls: [
      'https://images.unsplash.com/photo-1646314230198-e27c375e1a2a?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1619926340139-9a2e2245a64e?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1679310249395-ae267ae0d273?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1762207654337-73ccc93a80c4?w=1200&q=80&auto=format&fit=crop',
    ],
    duration: '3 horas',
    price: 15000,
    currency: 'ARS',
    availableSpots: 10,
    totalSpots: 12,
    date: '2026-05-12T11:00:00Z',
    dates: buildAvailableDates('2026-05-12T11:00:00Z', 4, 7),
    meetingPoint: 'Plaza 9 de Julio, Salta',
    guide: { name: 'Isabel Mamani', rating: 4.9 },
    language: 'Espanol',
    included: ['Degustacion en 4 locales', 'Bebida', 'Recetario'],
    cancellationPolicy: 'Cancelacion gratuita hasta 24 horas antes',
    featured: true,
    createdAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 'a16',
    name: 'Free Tour por Nuñez',
    destination: 'Buenos Aires',
    category: 'free_tour',
    description:
      'Descubre el colorido barrio de Nuñez, hogar del Monumental, estadio de River Plate.',
    imageUrl: '/uploads/activities/a16_0.jpg',
    galleryUrls: [
      '/uploads/activities/a16_1.jpg',
    ],
    duration: '1 hora',
    price: 0,
    currency: 'ARS',
    availableSpots: 20,
    totalSpots: 25,
    date: '2026-04-29T20:50:00Z',
    dates: buildAvailableDates('2026-04-29T20:50:00Z', 4, 7),
    meetingPoint: 'Estacion Nuñez',
    guide: { name: 'Lucia Fernandez', rating: 4.9 },
    language: 'Espanol',
    included: ['Guia profesional', 'Fotos del grupo'],
    cancellationPolicy: 'Cancelacion gratuita hasta 12 horas antes',
    featured: true,
    createdAt: '2026-01-12T10:00:00Z',
  },
];

function buildAvailableDates(baseDate, count = 3, dayStep = 7) {
  const parsed = new Date(baseDate);
  if (Number.isNaN(parsed.getTime())) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    const next = new Date(parsed);
    next.setUTCDate(next.getUTCDate() + index * dayStep);
    return next.toISOString();
  });
}

const buildActivitySchedules = (activity, dates) => {
  const baseTotalSpots =
    Number.isFinite(activity.totalSpots) && activity.totalSpots > 0 ? activity.totalSpots : 20;
  const baseAvailableSpots =
    Number.isFinite(activity.availableSpots) && activity.availableSpots >= 0
      ? Math.min(activity.availableSpots, baseTotalSpots)
      : Math.floor(baseTotalSpots * 0.75);

  return dates.map((date, index) => ({
    id: `${activity.id}-s${index + 1}`,
    date,
    availableSpots: Math.max(0, baseAvailableSpots - index),
    totalSpots: baseTotalSpots,
  }));
};

const buildActivityDateTimes = (activity) => {
  const sourceDates = Array.isArray(activity.schedules) && activity.schedules.length > 0
    ? activity.schedules.map((schedule) => schedule.date)
    : Array.isArray(activity.dates) && activity.dates.length > 0
      ? activity.dates
      : typeof activity.date === 'string' && activity.date.length > 0
        ? [activity.date]
        : [];

  return sourceDates
    .map((value) => {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return null;
      }

      const iso = parsed.toISOString();
      return {
        date: iso.slice(0, 10),
        time: iso.slice(11, 16),
      };
    })
    .filter(Boolean);
};

activities.forEach((activity) => {
  if (!Array.isArray(activity.dates) || activity.dates.length === 0) {
    activity.dates = buildAvailableDates(activity.date);
  }

  if (!Array.isArray(activity.schedules) || activity.schedules.length === 0) {
    activity.schedules = buildActivitySchedules(activity, activity.dates);
  }

  if (!Array.isArray(activity.dateTimes) || activity.dateTimes.length === 0) {
    activity.dateTimes = buildActivityDateTimes(activity);
  }
});

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
const findSessionByToken = (token) => sessions.find((s) => s.token === token || s.refreshToken === token);

const findBookingById = (bookingId) => bookings.find((booking) => booking.id === bookingId);

const findFavorite = (userId, activityId) =>
  favorites.find((favorite) => favorite.userId === userId && favorite.activityId === activityId);

const findRatingByBookingId = (bookingId) => ratings.find((rating) => rating.bookingId === bookingId);

const normalizeDateString = (value) => {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
};

const getActivityDates = (activity) => {
  if (Array.isArray(activity.schedules) && activity.schedules.length > 0) {
    return activity.schedules
      .map((schedule) => (typeof schedule.date === 'string' ? schedule.date : null))
      .filter(Boolean);
  }

  if (Array.isArray(activity.dates) && activity.dates.length > 0) {
    return activity.dates;
  }

  if (typeof activity.date === 'string' && activity.date.length > 0) {
    return [activity.date];
  }

  return [];
};

const buildDynamicSchedules = (activity) => {
  const sourceSchedules =
    Array.isArray(activity.schedules) && activity.schedules.length > 0
      ? activity.schedules
      : buildActivitySchedules(activity, getActivityDates(activity));

  const reservationsByScheduleKey = new Map();

  users.forEach((user) => {
    normalizeUserActivities(user);

    user.activities
      .filter((selection) => selection.activityId === activity.id && selection.status === 'active')
      .forEach((selection) => {
        const reservedQuantity =
          Number.isInteger(selection.quantity) && selection.quantity > 0 ? selection.quantity : 1;
        const scheduleKey =
          typeof selection.selectedScheduleId === 'string' && selection.selectedScheduleId.length > 0
            ? selection.selectedScheduleId
            : normalizeDateString(selection.selectedDate);

        if (!scheduleKey) {
          return;
        }

        reservationsByScheduleKey.set(
          scheduleKey,
          (reservationsByScheduleKey.get(scheduleKey) || 0) + reservedQuantity,
        );
      });
  });

  // DEBUG: mostrar resumen de reservas por schedule cuando se construyen schedules
  try {
    /* eslint-disable no-console */
    console.debug('[buildDynamicSchedules] activityId=%s sourceSchedules=%d reservations=%o',
      activity.id,
      Array.isArray(sourceSchedules) ? sourceSchedules.length : 0,
      Object.fromEntries(reservationsByScheduleKey),
    );
    /* eslint-enable no-console */
  } catch {
    // ignore debug failures
  }

  return sourceSchedules.map((schedule) => {
    const normalizedDate = normalizeDateString(schedule.date) || schedule.date;
    const totalSpots =
      Number.isFinite(schedule.totalSpots) && schedule.totalSpots > 0
        ? schedule.totalSpots
        : Number.isFinite(activity.totalSpots) && activity.totalSpots > 0
          ? activity.totalSpots
          : 20;

    const scheduleKey =
      typeof schedule.id === 'string' && schedule.id.length > 0 ? schedule.id : normalizedDate;
    const usedSpots = scheduleKey ? reservationsByScheduleKey.get(scheduleKey) || 0 : 0;

    return {
      ...schedule,
      date: normalizedDate,
      totalSpots,
      availableSpots: Math.max(totalSpots - usedSpots, 0),
    };
  });
};

const buildDynamicActivity = (activity) => {
  const schedules = buildDynamicSchedules(activity);
  const dates = schedules
    .map((schedule) => (typeof schedule.date === 'string' ? schedule.date : null))
    .filter(Boolean);
  const dateTimes = buildActivityDateTimes({ ...activity, schedules, dates });

  return {
    ...activity,
    schedules,
    dates,
    dateTimes,
    availableSpots: schedules.reduce((sum, schedule) => sum + (schedule.availableSpots || 0), 0),
    totalSpots: schedules.reduce((sum, schedule) => sum + (schedule.totalSpots || 0), 0),
  };
};

const getDynamicActivityById = (activityId) => {
  const activity = activities.find((item) => item.id === activityId);
  if (!activity) {
    return null;
  }

  return buildDynamicActivity(activity);
};

const getActivitiesWithDynamicAvailability = () => activities.map(buildDynamicActivity);

const normalizeUserActivities = (user) => {
  if (!Array.isArray(user.activities)) {
    user.activities = [];
    return;
  }

  user.activities = user.activities
    .map((entry) => {
      if (typeof entry === 'string') {
        const legacyActivity = activities.find((activity) => activity.id === entry);
        const [defaultDate] = legacyActivity ? getActivityDates(legacyActivity) : [];
        return {
          activityId: entry,
          selectedDate: defaultDate || null,
        };
      }

      if (!entry || typeof entry.activityId !== 'string') {
        return null;
      }

      return {
        activityId: entry.activityId,
        selectedDate: normalizeDateString(entry.selectedDate),
        selectedScheduleId:
          typeof entry.selectedScheduleId === 'string' ? entry.selectedScheduleId : null,
        bookingId: typeof entry.bookingId === 'string' ? entry.bookingId : null,
        quantity: Number.isInteger(entry.quantity) && entry.quantity > 0 ? entry.quantity : 1,
        cancellationHours:
          Number.isFinite(entry.cancellationHours) && entry.cancellationHours >= 0
            ? entry.cancellationHours
            : 0,
        status: typeof entry.status === 'string' ? entry.status : 'active',
      };
    })
    .filter(Boolean);
};

const addUser = (user) => {
  normalizeUserActivities(user);
  users.push(user);
  return user;
};

const extractCancellationHours = (cancellationPolicy) => {
  if (!cancellationPolicy || typeof cancellationPolicy !== 'string') {
    return null;
  }
  const match = cancellationPolicy.match(/(\d+)\s*horas?/i);
  return match ? parseInt(match[1], 10) : null;
};

const getCancellationDeadline = (selection, activity) => {
  if (!selection || typeof selection.selectedDate !== 'string') {
    return null;
  }

  const activityDate = new Date(selection.selectedDate);
  if (Number.isNaN(activityDate.getTime())) {
    return null;
  }

  const cancellationHours = Number.isFinite(selection.cancellationHours) && selection.cancellationHours >= 0
    ? selection.cancellationHours
    : extractCancellationHours(activity?.cancellationPolicy) ?? 0;

  return new Date(activityDate.getTime() - (cancellationHours * 60 * 60 * 1000));
};

const addUserActivity = (userId, activityId, selectedDate, selectedScheduleId = null, quantity = 1) => {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }

  const activity = getDynamicActivityById(activityId);
  if (!activity) {
    return null;
  }

  const validQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  normalizeUserActivities(user);

  const availableSchedules = Array.isArray(activity.schedules) ? activity.schedules : [];
  const selectedSchedule = selectedScheduleId
    ? availableSchedules.find((item) => item.id === selectedScheduleId)
    : null;
  const resolvedDate = normalizeDateString(selectedSchedule?.date || selectedDate);
  const resolvedScheduleId = selectedSchedule?.id || selectedScheduleId;

  if (!resolvedDate || typeof resolvedDate !== 'string') {
    return null;
  }

  const targetSchedule = availableSchedules.find(
    (item) => item.id === resolvedScheduleId || normalizeDateString(item.date) === resolvedDate,
  );

  if (!targetSchedule || targetSchedule.availableSpots < validQuantity) {
    return null;
  }

  // Usar siempre el ID del schedule encontrado para que buildDynamicSchedules pueda contar la reserva
  const finalScheduleId = targetSchedule.id || resolvedScheduleId;

  const cancellationHours = extractCancellationHours(activity.cancellationPolicy);
  const bookingId = `b${Date.now()}-${bookings.length + 1}`;

  const activitySelection = {
    bookingId,
    activityId,
    selectedDate: resolvedDate,
    selectedScheduleId: finalScheduleId,
    quantity: validQuantity,
    cancellationHours,
    status: 'active',
  };
  user.activities.push(activitySelection);

  bookings.push({
    id: bookingId,
    userId,
    activityId,
    selectedDate: resolvedDate,
    selectedScheduleId: finalScheduleId,
    quantity: validQuantity,
    cancellationHours,
    cancellationPolicy: activity.cancellationPolicy,
    status: 'confirmed',
    voucherCode: `VCH-${bookingId.toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // DEBUG: registro cuando se crea una reserva
  try {
    /* eslint-disable no-console */
    console.debug('[addUserActivity] bookingId=%s userId=%s activityId=%s schedule=%s quantity=%d',
      bookingId, userId, activityId, finalScheduleId, validQuantity,
    );
    /* eslint-enable no-console */
  } catch {
    // ignore
  }

  return activitySelection;
};

const cancelUserActivity = (
  userId,
  activityId,
  selectedScheduleId = null,
  selectedDate = null,
  bookingId = null,
) => {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }

  normalizeUserActivities(user);

  const activity = getDynamicActivityById(activityId);

  const normalizedDate = normalizeDateString(selectedDate);
  const targetSelection = user.activities.find((selection) => {
    if (selection.activityId !== activityId || selection.status !== 'active') {
      return false;
    }

    if (typeof bookingId === 'string' && bookingId.length > 0) {
      return selection.bookingId === bookingId;
    }

    if (typeof selectedScheduleId === 'string' && selectedScheduleId.length > 0) {
      return selection.selectedScheduleId === selectedScheduleId;
    }

    if (normalizedDate) {
      return selection.selectedDate === normalizedDate;
    }

    return true;
  });

  if (!targetSelection) {
    return null;
  }

  const cancellationDeadline = getCancellationDeadline(targetSelection, activity);
  if (cancellationDeadline && Date.now() >= cancellationDeadline.getTime()) {
    return {
      blocked: true,
      cancellationDeadline: cancellationDeadline.toISOString(),
      selection: targetSelection,
    };
  }

  targetSelection.status = 'cancelled';

  // Los cupos se recalculan dinámicamente en buildDynamicSchedules
  // (cuenta solo reservas activas), no es necesario mutarlos aquí.

  const booking = bookings.find(
    (item) =>
      item.userId === userId
      && item.activityId === activityId
      && item.status !== 'cancelled'
      && (
        typeof bookingId === 'string' && bookingId.length > 0
          ? item.id === bookingId
          : true
      )
      && (
        (typeof selectedScheduleId === 'string' && selectedScheduleId.length > 0
          ? item.selectedScheduleId === selectedScheduleId
          : false)
        || (normalizedDate ? item.selectedDate === normalizedDate : false)
      ),
  );

  if (booking) {
    booking.status = 'cancelled';
    booking.updatedAt = new Date().toISOString();
  }

  return {
    blocked: false,
    selection: targetSelection,
  };
};

const getUserActivities = (userId) => {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }

  normalizeUserActivities(user);

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
    return;
  }

  const refreshIndex = sessions.findIndex((s) => s.refreshToken === token);
  if (refreshIndex !== -1) {
    sessions.splice(refreshIndex, 1);
  }
};

const invalidateOtpsForEmail = (email) => {
  otpCodes.forEach((otp) => {
    if (otp.email === email) {
      otp.used = true;
    }
  });
};

const parseDurationMs = (duration) => {
  if (!duration || typeof duration !== 'string') return 0;
  const match = duration.match(/([\d.]+)\s*horas?/i);
  return match ? parseFloat(match[1]) * 60 * 60 * 1000 : 0;
};

const ARGENTINA_OFFSET_MS = -3 * 60 * 60 * 1000;

const normalizeBookingStatuses = () => {
  const nowUtc = Date.now();
  // Comparamos contra la hora actual en Argentina (UTC-3)
  const nowArgentina = nowUtc + ARGENTINA_OFFSET_MS;

  bookings.forEach((booking) => {
    if (booking.status !== 'confirmed') {
      return;
    }

    const bookingDate = new Date(booking.selectedDate);
    if (Number.isNaN(bookingDate.getTime())) return;

    // Interpretamos selectedDate como hora local Argentina si no tiene offset explícito
    const hasExplicitTz = /[zZ]$/.test(booking.selectedDate) || /[+-]\d\d:\d\d$/.test(booking.selectedDate);
    const bookingMs = hasExplicitTz
      ? bookingDate.getTime()
      : bookingDate.getTime() - ARGENTINA_OFFSET_MS;

    const activity = activities.find((a) => a.id === booking.activityId);
    const endMs = bookingMs + parseDurationMs(activity?.duration);

    if (endMs < nowArgentina) {
      booking.status = 'finalized';
      booking.updatedAt = new Date().toISOString();
    }
  });
};

const getUserBookings = (userId) => {
  normalizeBookingStatuses();
  return bookings.filter((booking) => booking.userId === userId);
};

const getBookingById = (bookingId) => {
  normalizeBookingStatuses();
  return findBookingById(bookingId);
};

const addFavorite = (userId, activityId) => {
  const activity = getDynamicActivityById(activityId);
  if (!activity) {
    return null;
  }

  const existing = findFavorite(userId, activityId);
  if (existing) {
    return existing;
  }

  const favorite = {
    userId,
    activityId,
    priceAtFavorite: activity.price,
    currencyAtFavorite: activity.currency,
    spotsAtFavorite: activity.availableSpots,
    createdAt: new Date().toISOString(),
  };

  favorites.push(favorite);
  return favorite;
};

const removeFavorite = (userId, activityId) => {
  const index = favorites.findIndex(
    (favorite) => favorite.userId === userId && favorite.activityId === activityId,
  );

  if (index === -1) {
    return false;
  }

  favorites.splice(index, 1);
  return true;
};

const getFavoritesByUser = (userId) => favorites.filter((favorite) => favorite.userId === userId);

const addRating = (rating) => {
  const existing = findRatingByBookingId(rating.bookingId);
  if (existing) {
    return null;
  }

  ratings.push(rating);
  return rating;
};

const getRatingByBooking = (bookingId) => findRatingByBookingId(bookingId);

const getRatingsByUser = (userId) => ratings.filter((rating) => rating.userId === userId);

const getBookingsSummaryForUser = (userId) => {
  const userBookings = getUserBookings(userId);
  const summary = userBookings.reduce(
    (accumulator, booking) => {
      accumulator.total += 1;
      accumulator.byStatus[booking.status] = (accumulator.byStatus[booking.status] || 0) + 1;

      if (booking.status === 'confirmed') {
        accumulator.upcoming += 1;
      }

      if (booking.status === 'finalized') {
        accumulator.completed += 1;
      }

      if (booking.status !== 'cancelled') {
        const activity = getDynamicActivityById(booking.activityId);
        accumulator.totalSpent += Number(activity?.price || 0) * Number(booking.quantity || 1);
      }

      return accumulator;
    },
    {
      total: 0,
      confirmed: 0,
      cancelled: 0,
      finalized: 0,
      upcoming: 0,
      completed: 0,
      totalSpent: 0,
      byStatus: {},
    },
  );

  summary.confirmed = summary.byStatus.confirmed || 0;
  summary.cancelled = summary.byStatus.cancelled || 0;
  summary.finalized = summary.byStatus.finalized || 0;

  return summary;
};

const getActivityHistoryForUser = (userId) => {
  const userBookings = getUserBookings(userId).filter((booking) => booking.status === 'finalized');

  return userBookings.map((booking) => {
    const activity = getDynamicActivityById(booking.activityId);
    return {
      bookingId: booking.id,
      activityId: booking.activityId,
      activityName: activity?.name || '',
      destination: activity?.destination || '',
      guide: activity?.guide || null,
      duration: activity?.duration || '',
      date: booking.selectedDate,
    };
  });
};

const getOfflineBundleForUser = (userId) => {
  const userBookings = getUserBookings(userId).filter((booking) => booking.status === 'confirmed');
  return userBookings.map((booking) => ({
    booking,
    activity: getDynamicActivityById(booking.activityId),
  }));
};

const getSyncChangesSince = (since) => {
  const sinceDate = since ? new Date(since) : null;
  const normalizedSince = sinceDate && !Number.isNaN(sinceDate.getTime()) ? sinceDate.getTime() : 0;

  return bookings
    .filter((booking) => {
      const updatedAt = new Date(booking.updatedAt || booking.createdAt || new Date().toISOString());
      return !Number.isNaN(updatedAt.getTime()) && updatedAt.getTime() >= normalizedSince;
    })
    .map((booking) => ({
      bookingId: booking.id,
      activityId: booking.activityId,
      status: booking.status,
      selectedDate: booking.selectedDate,
      selectedScheduleId: booking.selectedScheduleId,
      updatedAt: booking.updatedAt || booking.createdAt,
      changeType: booking.status === 'cancelled' ? 'cancelled' : booking.status === 'finalized' ? 'finalized' : 'updated',
    }));
};

const updateActivityImage = (activityId, imageUrl) => {
  const idx = activities.findIndex((a) => a.id === activityId);
  if (idx === -1) return null;
  activities[idx] = { ...activities[idx], imageUrl };
  return activities[idx];
};

module.exports = {
  users,
  otpCodes,
  sessions,
  bookings,
  favorites,
  ratings,
  news,
  activities,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  findSessionByToken,
  findBookingById,
  addUser,
  addOtp,
  addSession,
  removeSession,
  invalidateOtpsForEmail,
  addUserActivity,
  cancelUserActivity,
  getUserActivities,
  getDynamicActivityById,
  getActivitiesWithDynamicAvailability,
  addFavorite,
  removeFavorite,
  getFavoritesByUser,
  addRating,
  getRatingByBooking,
  getRatingsByUser,
  getBookingsSummaryForUser,
  getActivityHistoryForUser,
  getOfflineBundleForUser,
  getSyncChangesSince,
  getUserBookings,
  getBookingById,
  updateActivityImage,
  parseDurationMs,
};

