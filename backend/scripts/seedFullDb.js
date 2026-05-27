const sequelize = require("../src/config/db");
const {
  User,
  Driver,
  DriverHistory,
  Audit,
  Trip,
  Challenge,
  Tip,
  Reward,
  AppConfig,
} = require("../src/models");
const bcrypt = require("bcryptjs");

async function seedFullDb() {
  console.log("Syncing database (dropping and recreating tables)...");
  await sequelize.sync({ force: true });
  console.log("Database synced successfully.");
  console.log("Seeding data...");

  const passwordHash = await bcrypt.hash("123456", 10);

  // ── USERS ──────────────────────────────────────────────────────────
  const adminUser = await User.create({
    name: "Admin Master",
    email: "admin@shift.com",
    password_hash: passwordHash,
    role: "admin",
    plate: null,
  });

  const passengerUser = await User.create({
    name: "Passageiro Shift",
    email: "passageiro@shift.com",
    password_hash: passwordHash,
    role: "passenger",
    plate: null,
  });

  const driverUser = await User.create({
    name: "Motorista Shift",
    email: "motorista@shift.com",
    password_hash: passwordHash,
    role: "driver",
    plate: "SHIFT-2026",
  });

  // ── APP CONFIG ─────────────────────────────────────────────────────
  await AppConfig.bulkCreate([
    {
      key: "MAX_SPEED_LIMIT",
      value: "90",
      description: "Velocidade máxima permitida em via urbana e rodovia.",
    },
    {
      key: "BRAKING_DECELE_THRESHOLD",
      value: "-10",
      description: "Desaceleração mínima para considerar uma travagem brusca.",
    },
    {
      key: "GYRO_DISTRACTION_LIMIT",
      value: "1.2",
      description: "Sensibilidade do giroscópio para detetar uso de celular.",
    },
  ]);

  // ── DRIVERS ────────────────────────────────────────────────────────
  const drivers = await Driver.bulkCreate([
    {
      plate: "SHIFT-2026",
      name: driverUser.name,
      score: 96,
      trips: 18,
      status: "excellent",
      badges: ["Foco no Trânsito", "Condução Segura"],
      rating: 4.9,
    },
    {
      plate: "ABC-1234",
      name: "João S.",
      score: 98,
      trips: 142,
      status: "excellent",
      badges: ["Suave", "Respeita Limites"],
      rating: 4.8,
    },
    {
      plate: "SUI-0099",
      name: "Carlos M.",
      score: 42,
      trips: 89,
      status: "danger",
      badges: ["Aceleração Brusca", "Avança Sinal Vermelho"],
      rating: 2.5,
    },
    {
      plate: "XYZ-9876",
      name: "Ana P.",
      score: 85,
      trips: 56,
      status: "good",
      badges: ["Focada"],
      rating: 4.2,
    },
  ]);

  const motorista = drivers.find((d) => d.plate === "SHIFT-2026");
  const joao = drivers.find((d) => d.plate === "ABC-1234");
  const carlos = drivers.find((d) => d.plate === "SUI-0099");
  const ana = drivers.find((d) => d.plate === "XYZ-9876");

  // ── DRIVER HISTORY ─────────────────────────────────────────────────
  await DriverHistory.bulkCreate([
    // SHIFT-2026 (Motorista Shift) — 3 entries
    {
      driver_id: motorista.id,
      date: "Hoje, 08:15",
      score: 98,
      duration: "25 min",
      status: "excellent",
    },
    {
      driver_id: motorista.id,
      date: "Ontem, 19:40",
      score: 95,
      duration: "31 min",
      status: "excellent",
    },
    {
      driver_id: motorista.id,
      date: "16 Mai, 14:20",
      score: 88,
      duration: "18 min",
      status: "good",
    },
    // ABC-1234 (João S.) — 2 entries
    {
      driver_id: joao.id,
      date: "Ontem, 18:30",
      score: 99,
      duration: "15 min",
      status: "excellent",
    },
    {
      driver_id: joao.id,
      date: "15 Mai, 09:00",
      score: 97,
      duration: "22 min",
      status: "excellent",
    },
    // SUI-0099 (Carlos M.) — 2 entries
    {
      driver_id: carlos.id,
      date: "Hoje, 08:15",
      score: 35,
      duration: "45 min",
      status: "danger",
      issue: "3 travagens bruscas e excesso de velocidade",
    },
    {
      driver_id: carlos.id,
      date: "Ontem, 22:10",
      score: 50,
      duration: "18 min",
      status: "danger",
      issue: "Curva perigosa em alta velocidade",
    },
    // XYZ-9876 (Ana P.) — 2 entries
    {
      driver_id: ana.id,
      date: "Hoje, 12:00",
      score: 88,
      duration: "10 min",
      status: "good",
    },
    {
      driver_id: ana.id,
      date: "Ontem, 07:30",
      score: 92,
      duration: "20 min",
      status: "excellent",
    },
  ]);

  // ── TRIPS ──────────────────────────────────────────────────────────
  await Trip.bulkCreate([
    // SHIFT-2026 — 4 trips
    {
      driver_id: driverUser.id,
      driver_plate: "SHIFT-2026",
      score: 96,
      speed_avg: 61.2,
      fatigue_max: 1.0,
      distance: 28.4,
      duration_seconds: 1740,
      latitude: -23.5505,
      longitude: -46.6333,
    },
    {
      driver_id: driverUser.id,
      driver_plate: "SHIFT-2026",
      score: 94,
      speed_avg: 58.9,
      fatigue_max: 1.1,
      distance: 19.6,
      duration_seconds: 1320,
      latitude: -23.5615,
      longitude: -46.6543,
    },
    {
      driver_id: driverUser.id,
      driver_plate: "SHIFT-2026",
      score: 99,
      speed_avg: 63.4,
      fatigue_max: 0.8,
      distance: 22.9,
      duration_seconds: 1500,
      latitude: -23.5505,
      longitude: -46.6333,
    },
    {
      driver_id: driverUser.id,
      driver_plate: "SHIFT-2026",
      score: 97,
      speed_avg: 55.4,
      fatigue_max: 1.0,
      distance: 14.7,
      duration_seconds: 1080,
      latitude: -23.5621,
      longitude: -46.6551,
    },
    // ABC-1234 (João S.) — 2 trips
    {
      driver_plate: "ABC-1234",
      score: 98,
      speed_avg: 52.3,
      fatigue_max: 0.5,
      distance: 15.2,
      duration_seconds: 960,
      latitude: -23.5578,
      longitude: -46.6421,
    },
    {
      driver_plate: "ABC-1234",
      score: 97,
      speed_avg: 48.7,
      fatigue_max: 0.6,
      distance: 11.8,
      duration_seconds: 840,
      latitude: -23.5489,
      longitude: -46.6387,
    },
    // SUI-0099 (Carlos M.) — 2 trips
    {
      driver_plate: "SUI-0099",
      score: 45,
      speed_avg: 82.5,
      fatigue_max: 2.3,
      distance: 35.1,
      duration_seconds: 2100,
      latitude: -23.5532,
      longitude: -46.6355,
    },
    {
      driver_plate: "SUI-0099",
      score: 52,
      speed_avg: 78.1,
      fatigue_max: 1.8,
      distance: 24.6,
      duration_seconds: 1620,
      latitude: -23.5601,
      longitude: -46.6489,
    },
    // XYZ-9876 (Ana P.) — 2 trips
    {
      driver_plate: "XYZ-9876",
      score: 87,
      speed_avg: 54.2,
      fatigue_max: 0.9,
      distance: 12.3,
      duration_seconds: 900,
      latitude: -23.5544,
      longitude: -46.6399,
    },
    {
      driver_plate: "XYZ-9876",
      score: 90,
      speed_avg: 51.6,
      fatigue_max: 0.7,
      distance: 18.7,
      duration_seconds: 1140,
      latitude: -23.5566,
      longitude: -46.6411,
    },
  ]);

  // ── CHALLENGES ─────────────────────────────────────────────────────
  await Challenge.bulkCreate([
    {
      title: "Auditor Cidadão",
      description:
        "Avalie 1 corrida como passageiro hoje e deixe um feedback construtivo.",
      points: 150,
      role_restriction: "passenger",
      is_completed: false,
    },
    {
      title: "Modo Foco",
      description: "Faça uma viagem como motorista sem tocar no celular.",
      points: 200,
      role_restriction: "driver",
      is_completed: false,
    },
    {
      title: "Guardião do Maio Amarelo",
      description:
        "Mantenha a telemetria acima de 95 por 3 viagens seguidas.",
      points: 500,
      role_restriction: "driver",
      is_completed: true,
    },
    {
      title: "Radar de Cuidado",
      description:
        "Registe 5 alertas de segurança e mantenha score acima de 90.",
      points: 300,
      role_restriction: "all",
      is_completed: false,
    },
    {
      title: "Cinto Solidário",
      description:
        "Complete 3 auditorias como passageiro verificando o uso do cinto.",
      points: 250,
      role_restriction: "passenger",
      is_completed: true,
    },
    {
      title: "Condutor do Mês",
      description: "Mantenha score acima de 95 por 10 viagens consecutivas.",
      points: 600,
      role_restriction: "driver",
      is_completed: false,
    },
  ]);

  // ── TIPS ───────────────────────────────────────────────────────────
  await Tip.bulkCreate([
    {
      title: "Cinto no banco de trás",
      subtitle: "Segurança de Base",
      content:
        "Use sempre o cinto em todos os bancos. Em caso de impacto, ele reduz drasticamente o risco de ferimentos graves.",
      points: 50,
    },
    {
      title: "Fadiga ao volante",
      subtitle: "Estado de Alerta",
      content:
        "Se sentir sono, pare. Fadiga altera os reflexos e aumenta a chance de erro mesmo em percursos curtos.",
      points: 100,
    },
    {
      title: "Distância na chuva",
      subtitle: "Direção Defensiva",
      content:
        "Na chuva, aumente a distância de segurança e reduza a velocidade para ter mais tempo de reação.",
      points: 80,
    },
    {
      title: "Celular no painel",
      subtitle: "Foco Total",
      content:
        "Evite pegar no telemóvel durante a condução. Qualquer distração pode comprometer a sua segurança e a de terceiros.",
      points: 60,
    },
  ]);

  // ── REWARDS ────────────────────────────────────────────────────────
  await Reward.bulkCreate([
    {
      title: "Desconto em Combustível",
      description: "Mantenha Score acima de 90 por 7 dias para resgatar.",
      progress: 85,
      color: "#F59E0B",
      completed: false,
    },
    {
      title: "Prioridade VIP nos Apps",
      description:
        "Entre na fila antes de outros condutores por mérito de condução.",
      progress: 100,
      color: "#10B981",
      completed: true,
    },
    {
      title: "Desconto em Lavagem Premium",
      description: "Mantenha Score acima de 95 por 5 corridas consecutivas.",
      progress: 60,
      color: "#F59E0B",
      completed: false,
    },
    {
      title: "Bónus de Perfil",
      description:
        "Atinja 10 viagens perfeitas para desbloquear um bónus especial.",
      progress: 40,
      color: "#3B82F6",
      completed: false,
    },
  ]);

  // ── AUDITS ─────────────────────────────────────────────────────────
  await Audit.bulkCreate([
    // SUI-0099 (Carlos M.) — 2 audits (negativas, com infrações)
    {
      passenger_id: passengerUser.id,
      driver_plate: "SUI-0099",
      road_context: "urbana",
      weather_context: "limpo",
      score: 40,
      rating_stars: 2,
      positive_actions: [],
      infractions: ["Travagem Brusca", "Excesso de Velocidade"],
      latitude: -23.5505,
      longitude: -46.6333,
      feedback: "Motorista muito agressivo no cruzamento.",
    },
    {
      passenger_id: passengerUser.id,
      driver_plate: "SUI-0099",
      road_context: "urbana",
      weather_context: "chuva",
      score: 30,
      rating_stars: 1,
      positive_actions: [],
      infractions: ["Avanço de Sinal"],
      latitude: -23.5515,
      longitude: -46.6343,
      feedback: "Furou o sinal vermelho na chuva!",
    },
    // SHIFT-2026 (Motorista Shift) — 2 audits (positivas)
    {
      passenger_id: passengerUser.id,
      driver_plate: "SHIFT-2026",
      road_context: "rodovia",
      weather_context: "limpo",
      score: 97,
      rating_stars: 5,
      positive_actions: ["Direção Suave", "Muito Focado"],
      infractions: [],
      latitude: -23.5615,
      longitude: -46.6543,
      feedback: "Condução muito estável e segura.",
    },
    {
      passenger_id: passengerUser.id,
      driver_plate: "SHIFT-2026",
      road_context: "urbana",
      weather_context: "limpo",
      score: 92,
      rating_stars: 4,
      positive_actions: ["Direção Suave", "Velocidade Adequada"],
      infractions: [],
      latitude: -23.5532,
      longitude: -46.6355,
      feedback: "Motorista atento e cuidadoso.",
    },
    // ABC-1234 (João S.) — 2 audits (positivas)
    {
      passenger_id: passengerUser.id,
      driver_plate: "ABC-1234",
      road_context: "rodovia",
      weather_context: "limpo",
      score: 95,
      rating_stars: 5,
      positive_actions: ["Direção Suave", "Uso do Cinto", "Muito Focado"],
      infractions: [],
      latitude: -23.5621,
      longitude: -46.6551,
      feedback: "Condução exemplar.",
    },
    {
      passenger_id: passengerUser.id,
      driver_plate: "ABC-1234",
      road_context: "urbana",
      weather_context: "noite",
      score: 88,
      rating_stars: 4,
      positive_actions: ["Direção Suave", "Velocidade Adequada"],
      infractions: [],
      latitude: -23.5489,
      longitude: -46.6387,
      feedback: "Muito cuidado mesmo à noite.",
    },
    // XYZ-9876 (Ana P.) — 2 audits (mistas)
    {
      passenger_id: passengerUser.id,
      driver_plate: "XYZ-9876",
      road_context: "urbana",
      weather_context: "limpo",
      score: 85,
      rating_stars: 4,
      positive_actions: ["Muito Focado"],
      infractions: [],
      latitude: -23.5544,
      longitude: -46.6399,
      feedback: "Condução tranquila e segura.",
    },
    {
      passenger_id: passengerUser.id,
      driver_plate: "XYZ-9876",
      road_context: "rodovia",
      weather_context: "chuva",
      score: 72,
      rating_stars: 3,
      positive_actions: [],
      infractions: ["Travagem Brusca"],
      latitude: -23.5566,
      longitude: -46.6411,
      feedback: "Precisa de mais cuidado em piso molhado.",
    },
  ]);

  console.log("Seed data inserted successfully.");
  process.exit(0);
}

seedFullDb().catch((error) => {
  console.error("Error initializing database:", error);
  process.exit(1);
});
