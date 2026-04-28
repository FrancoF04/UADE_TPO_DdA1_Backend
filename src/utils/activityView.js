const meetingPointCatalog = {
  'a1': { latitude: -34.6083, longitude: -58.3712, address: 'Plaza de Mayo, frente al Cabildo, Buenos Aires' },
  'a2': { latitude: -34.6345, longitude: -58.3648, address: 'Estacion La Boca del Premetro, Buenos Aires' },
  'a3': { latitude: -34.6012, longitude: -58.3842, address: 'Entrada principal del Teatro Colon, Cerrito 628, Buenos Aires' },
  'a4': { latitude: -34.5831, longitude: -58.4079, address: 'Lobby del MALBA, Av. Figueroa Alcorta 3415, Buenos Aires' },
  'a5': { latitude: -50.3379, longitude: -72.2486, address: 'Terminal de buses de El Calafate, Santa Cruz' },
  'a6': { latitude: -41.1335, longitude: -71.3103, address: 'Base del Cerro Catedral, Bariloche, Rio Negro' },
  'a7': { latitude: -32.8895, longitude: -68.8458, address: 'Plaza Independencia, Mendoza' },
  'a8': { latitude: -34.5711, longitude: -58.4295, address: 'Parrilla Don Julio, Guatemala 4699, Palermo, Buenos Aires' },
  'a9': { latitude: -32.8916, longitude: -68.8538, address: 'Base de Potrerillos, Ruta 82 km 50, Mendoza' },
  'a10': { latitude: -41.1209, longitude: -71.2995, address: 'Cerro Otto, Bariloche, Rio Negro' },
  'a11': { latitude: -31.4173, longitude: -64.1831, address: 'Plaza San Martin, Cordoba' },
  'a12': { latitude: -24.7859, longitude: -65.4117, address: 'Estacion Salta, Ameghino 690, Salta' },
  'a13': { latitude: -54.8068, longitude: -68.3077, address: 'Puerto turistico de Ushuaia, Tierra del Fuego' },
  'a14': { latitude: -26.2896, longitude: -67.6924, address: 'Angastaco, Ruta 40, Salta' },
  'a15': { latitude: -24.7892, longitude: -65.4106, address: 'Plaza 9 de Julio, Salta' },
};

const destinationFallback = {
  'Buenos Aires': { latitude: -34.6037, longitude: -58.3816 },
  'Mendoza': { latitude: -32.8895, longitude: -68.8458 },
  'Bariloche': { latitude: -41.1335, longitude: -71.3103 },
  'Ushuaia': { latitude: -54.8019, longitude: -68.303 } ,
  'Salta': { latitude: -24.7887, longitude: -65.4102 },
  'Cordoba': { latitude: -31.4201, longitude: -64.1888 },
};

const itineraryCatalog = {
  a13: [
    { name: 'Isla de los Lobos', description: 'Observacion de fauna marina', latitude: -54.8152, longitude: -68.2491 },
    { name: 'Isla de los Pajaros', description: 'Avistaje de aves', latitude: -54.8227, longitude: -68.2482 },
    { name: 'Faro Les Eclaireurs', description: 'Emblema del Canal Beagle', latitude: -54.8633, longitude: -68.0877 },
  ],
  a14: [
    { name: 'Angastaco', description: 'Inicio del recorrido a caballo', latitude: -26.2896, longitude: -67.6924 },
    { name: 'Quebrada de las Flechas', description: 'Formaciones rocosas principales', latitude: -25.9994, longitude: -66.7042 },
  ],
  a12: [
    { name: 'Salinas Grandes', description: 'Parada panoramica en la puna', latitude: -23.5833, longitude: -65.3667 },
    { name: 'Viaducto La Polvorilla', description: 'Punto mas alto del tren', latitude: -24.3217, longitude: -66.4516 },
  ],
};

const buildMeetingPoint = (activity) => {
  if (!activity) {
    return null;
  }

  if (activity.meetingPoint && typeof activity.meetingPoint === 'object') {
    return {
      latitude: activity.meetingPoint.latitude ?? null,
      longitude: activity.meetingPoint.longitude ?? null,
      address: activity.meetingPoint.address || activity.meetingPoint.name || '',
    };
  }

  const override = meetingPointCatalog[activity.id];
  const destinationFallbackCoordinates = destinationFallback[activity.destination] || null;

  return {
    latitude: override?.latitude ?? destinationFallbackCoordinates?.latitude ?? null,
    longitude: override?.longitude ?? destinationFallbackCoordinates?.longitude ?? null,
    address:
      override?.address
      || (typeof activity.meetingPoint === 'string' ? activity.meetingPoint : '')
      || '',
  };
};

const buildItineraryPoints = (activity) => {
  if (!activity) {
    return [];
  }

  if (Array.isArray(activity.itineraryPoints) && activity.itineraryPoints.length > 0) {
    return activity.itineraryPoints;
  }

  return itineraryCatalog[activity.id] || [];
};

const serializeActivity = (activity, extra = {}) => {
  if (!activity) {
    return null;
  }

  return {
    ...activity,
    meetingPoint: buildMeetingPoint(activity),
    itineraryPoints: buildItineraryPoints(activity),
    ...extra,
  };
};

const serializeBooking = (booking, activity, extra = {}) => {
  if (!booking) {
    return null;
  }

  const serializedActivity = activity ? serializeActivity(activity) : null;

  return {
    ...booking,
    activity: serializedActivity,
    meetingPoint: serializedActivity?.meetingPoint || buildMeetingPoint(activity) || null,
    ...extra,
  };
};

module.exports = {
  buildMeetingPoint,
  buildItineraryPoints,
  serializeActivity,
  serializeBooking,
};