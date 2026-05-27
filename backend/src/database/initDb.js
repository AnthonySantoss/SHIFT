const sequelize = require("../config/db");
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
} = require("../models");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

async function initDb() {
  try {
    const dbPath = path.join(__dirname, "db.sqlite");

    // Remove existing database to ensure a clean run if desired
    // (Optional: depending on if you want to wipe it every time)
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log("Existing database removed for fresh start.");
    }

    // Sync database
    console.log("Syncing database...");
    await sequelize.sync({ force: true });
    console.log("Database synced successfully.");

    // Seed Data
    console.log("Seeding data...");

    // 1. Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("123456", salt);

    await User.create({
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

    const userJoao = await User.create({
      name: "João S.",
      email: "joao@shift.com",
      password_hash: passwordHash,
      role: "driver",
      plate: "ABC-1234",
    });

    const userCarlos = await User.create({
      name: "Carlos M.",
      email: "carlos@shift.com",
      password_hash: passwordHash,
      role: "driver",
      plate: "SUI-0099",
    });

    const userAna = await User.create({
      name: "Ana P.",
      email: "ana@shift.com",
      password_hash: passwordHash,
      role: "driver",
      plate: "XYZ-9876",
    });

    // 2. App Config
    await AppConfig.bulkCreate([
      {
        key: "MAX_SPEED_LIMIT",
        value: "90",
        description: "Velocidade máxima permitida em via urbana e rodovia.",
      },
      {
        key: "BRAKING_DECELE_THRESHOLD",
        value: "-10",
        description:
          "Desaceleração mínima para considerar uma travagem brusca.",
      },
      {
        key: "GYRO_DISTRACTION_LIMIT",
        value: "1.2",
        description: "Sensibilidade do giroscópio para detetar uso de celular.",
      },
    ]);

    // 3. Drivers
    const drivers = await Driver.bulkCreate([
      {
        plate: "SHIFT-2026",
        name: driverUser.name,
        score: 96,
        trips: 18,
        status: "excelente",
        badges: ["Foco no Trânsito", "Condução Segura"],
        rating: 4.9,
      },
      {
        plate: "ABC-1234",
        name: "João S.",
        score: 98,
        trips: 142,
        status: "excelente",
        badges: ["Suave", "Respeita Limites"],
        rating: 4.8,
      },
      {
        plate: "SUI-0099",
        name: "Carlos M.",
        score: 42,
        trips: 89,
        status: "atenção",
        badges: ["Aceleração Brusca", "Avança Sinal Vermelho"],
        rating: 2.5,
      },
      {
        plate: "XYZ-9876",
        name: "Ana P.",
        score: 85,
        trips: 56,
        status: "bom",
        badges: ["Focada"],
        rating: 4.2,
      },
    ]);

    // 4. Driver History
    const motorista = drivers.find((d) => d.plate === "SHIFT-2026");
    const joao = drivers.find((d) => d.plate === "ABC-1234");
    const carlos = drivers.find((d) => d.plate === "SUI-0099");
    const ana = drivers.find((d) => d.plate === "XYZ-9876");

    await DriverHistory.bulkCreate([
      {
        driver_id: motorista.id,
        date: "Hoje, 08:15",
        score: 98,
        duration: "25 min",
        status: "excelente",
      },
      {
        driver_id: motorista.id,
        date: "Ontem, 19:40",
        score: 95,
        duration: "31 min",
        status: "excelente",
      },
      {
        driver_id: joao.id,
        date: "Ontem, 18:30",
        score: 99,
        duration: "15 min",
        status: "excelente",
      },
      {
        driver_id: joao.id,
        date: "15 Mai, 09:00",
        score: 97,
        duration: "22 min",
        status: "excelente",
      },
      {
        driver_id: carlos.id,
        date: "Hoje, 08:15",
        score: 35,
        duration: "45 min",
        status: "perigo",
        issue: "3 travagens bruscas e excesso de velocidade",
      },
      {
        driver_id: carlos.id,
        date: "Ontem, 22:10",
        score: 50,
        duration: "18 min",
        status: "perigo",
        issue: "Curva perigosa em alta velocidade",
      },
      {
        driver_id: ana.id,
        date: "Hoje, 12:00",
        score: 88,
        duration: "10 min",
        status: "bom",
      },
    ]);

    // 4.1 Telemetria de Exemplo
    await Trip.bulkCreate([
      {
        driver_id: driverUser.id,
        driver_plate: "SHIFT-2026",
        score: 96,
        speed_avg: 61.2,
        fatigue_max: 1.0,
        distance: 28.4,
        duration_seconds: 1740,
      },
      {
        driver_id: driverUser.id,
        driver_plate: "SHIFT-2026",
        score: 94,
        speed_avg: 58.9,
        fatigue_max: 1.1,
        distance: 19.6,
        duration_seconds: 1320,
      },
      {
        driver_id: userJoao.id,
        driver_plate: "ABC-1234",
        score: 98,
        speed_avg: 64.2,
        fatigue_max: 1.1,
        distance: 32.8,
        duration_seconds: 1980,
      },
      {
        driver_id: userJoao.id,
        driver_plate: "ABC-1234",
        score: 96,
        speed_avg: 58.7,
        fatigue_max: 0.9,
        distance: 18.4,
        duration_seconds: 1260,
      },
      {
        driver_id: userCarlos.id,
        driver_plate: "SUI-0099",
        score: 41,
        speed_avg: 83.1,
        fatigue_max: 2.3,
        distance: 24.1,
        duration_seconds: 2100,
      },
      {
        driver_id: userAna.id,
        driver_plate: "XYZ-9876",
        score: 87,
        speed_avg: 55.4,
        fatigue_max: 1.0,
        distance: 14.7,
        duration_seconds: 1080,
      },
    ]);

    // 5. Challenges
    await Challenge.bulkCreate([
      {
        title: "Auditor Cidadão",
        description:
          "Avalie 1 corrida como passageiro hoje e deixe um feedback construtivo.",
        points: 150,
        role_restriction: "passenger",
      },
      {
        title: "Modo Foco",
        description: "Faça uma viagem como motorista sem tocar no celular.",
        points: 200,
        role_restriction: "driver",
      },
      {
        title: "Guardião do Maio Amarelo",
        description:
          "Mantenha a telemetria acima de 95 por 3 viagens seguidas.",
        points: 500,
        role_restriction: "driver",
      },
      {
        title: "Radar de Cuidado",
        description:
          "Registe 5 alertas de segurança e mantenha score acima de 90.",
        points: 300,
        role_restriction: "all",
      },
      {
        title: "Explorador da Via",
        description: "Registe sua primeira auditoria em uma autoestrada.",
        points: 100,
        role_restriction: "passenger",
      },
      {
        title: "Zero Aceleração Brusca",
        description: "Faça 5 viagens consecutivas sem detecção de acelerações agressivas.",
        points: 350,
        role_restriction: "driver",
      },
      {
        title: "Anjo da Guarda",
        description: "Envie feedbacks com avaliação 5 estrelas para 3 motoristas que te impressionaram.",
        points: 250,
        role_restriction: "passenger",
      },
      {
        title: "Maratona Segura",
        description: "Mantenha o Score de Segurança no máximo por uma semana inteira (mínimo 10 corridas).",
        points: 1000,
        role_restriction: "driver",
      },
      {
        title: "Reporte na Chuva",
        description: "Ajude a mapear uma zona de risco durante condições climáticas adversas (chuva/nevoeiro).",
        points: 180,
        role_restriction: "all",
      }
    ]);

    // 6. Tips
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
      {
        title: "Calibragem dos Pneus",
        subtitle: "Manutenção",
        content: "Pneus descalibrados aumentam a distância de frenagem e o consumo de combustível. Verifique-os semanalmente.",
        points: 70,
      },
      {
        title: "Uso das Setas",
        subtitle: "Comunicação Essencial",
        content: "As setas são a única forma de avisar os outros condutores sobre as suas intenções. Use-as sempre, mesmo se a via parecer vazia.",
        points: 55,
      },
      {
        title: "Farol Baixo de Dia",
        subtitle: "Visibilidade",
        content: "Ligar o farol baixo durante o dia ajuda os outros motoristas e pedestres a notarem seu veículo mais rapidamente em rodovias.",
        points: 65,
      },
      {
        title: "Cuidado com Pontos Cegos",
        subtitle: "Direção Preventiva",
        content: "Mantenha a atenção aos espelhos e ajuste-os corretamente. Evite dirigir por longos períodos no ponto cego de caminhões e ônibus.",
        points: 90,
      }
    ]);

    // 7. Rewards
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
      {
        title: "Voucher Oficina Parceira",
        description: "Complete 3 Missões do Maio Amarelo para receber 15% de desconto na troca de óleo.",
        progress: 75,
        color: "#6366F1",
        completed: false,
      },
      {
        title: "Avatar Exclusivo SHIFT Elite",
        description: "Chegue ao Nível 'Mestre da Segurança' (50+ viagens limpas).",
        progress: 30,
        color: "#10B981",
        completed: false,
      },
      {
        title: "Seguro Auto Reduzido",
        description: "Mantenha um Rating comunitário de 4.9+ por 3 meses (Parceria Seguradora).",
        progress: 90,
        color: "#F59E0B",
        completed: false,
      },
      {
        title: "Café Grátis em Viagens Longas",
        description: "Resgate após concluir o curso interativo sobre 'Fadiga ao Volante'.",
        progress: 100,
        color: "#10B981",
        completed: true,
      }
    ]);

    // 8. Sample Hotspots & Audits (Audits with coordinates)
    await Audit.bulkCreate([
      {
        passenger_id: passengerUser.id,
        driver_plate: "SUI-0099",
        road_context: "urbana",
        weather_context: "limpo",
        score: 40,
        rating_stars: 2,
        infractions: ["Travagem Brusca", "Excesso de Velocidade"],
        latitude: -23.5505,
        longitude: -46.6333,
        feedback: "Motorista muito agressivo no cruzamento.",
      },
      {
        passenger_id: passengerUser.id,
        driver_plate: "SHIFT-2026",
        road_context: "rodovia",
        weather_context: "limpo",
        score: 97,
        rating_stars: 5,
        infractions: [],
        positive_actions: ["Direção Suave", "Velocidade Adequada"],
        latitude: -23.5615,
        longitude: -46.6543,
        feedback: "Condução muito estável e segura.",
      },
      {
        passenger_id: passengerUser.id,
        driver_plate: "SUI-0099",
        road_context: "urbana",
        weather_context: "chuva",
        score: 30,
        rating_stars: 1,
        infractions: ["Avanço de Sinal", "Uso de Telemóvel"],
        latitude: -23.5515,
        longitude: -46.6343,
        feedback: "Furou o sinal vermelho na chuva mexendo no celular!",
      },
      {
        passenger_id: passengerUser.id,
        driver_plate: "ABC-1234",
        road_context: "rodovia",
        weather_context: "limpo",
        score: 95,
        rating_stars: 5,
        infractions: [],
        positive_actions: ["Muito Focado"],
        latitude: -23.5621,
        longitude: -46.6551,
        feedback: "Condução exemplar.",
      },
      {
        passenger_id: null,
        driver_plate: "XYZ-9876",
        road_context: "urbana",
        weather_context: "noite",
        score: 85,
        rating_stars: 4,
        infractions: ["Excesso de Velocidade"],
        positive_actions: ["Uso do Cinto"],
        latitude: -23.5630,
        longitude: -46.6560,
        feedback: "Andou um pouco rápido na marginal, mas de resto foi bem.",
      },
      {
        passenger_id: passengerUser.id,
        driver_plate: "XYZ-9876",
        road_context: "rodovia",
        weather_context: "chuva",
        score: 80,
        rating_stars: 4,
        infractions: [],
        positive_actions: ["Direção Suave"],
        latitude: -23.5650,
        longitude: -46.6590,
        feedback: "Muito cuidadosa durante a tempestade, me senti seguro.",
      },
      {
        passenger_id: null,
        driver_plate: "SHIFT-2026",
        road_context: "urbana",
        weather_context: "limpo",
        score: 100,
        rating_stars: 5,
        infractions: [],
        positive_actions: ["Direção Suave", "Uso do Cinto", "Muito Focado"],
        latitude: -23.5700,
        longitude: -46.6600,
        feedback: "Perfeito, zero reclamações.",
      },
      {
        passenger_id: passengerUser.id,
        driver_plate: "SUI-0099",
        road_context: "rodovia",
        weather_context: "noite",
        score: 55,
        rating_stars: 3,
        infractions: ["Travagem Brusca"],
        positive_actions: [],
        latitude: -23.5800,
        longitude: -46.6700,
        feedback: "Freou muito em cima dos pardais.",
      }
    ]);

    console.log("Seed data inserted successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

initDb();
