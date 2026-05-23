const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'db.sqlite');

// Remove existing database to ensure a clean optimized run
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database connected successfully at:', dbPath);
});

db.serialize(() => {
  // 1. USERS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('driver', 'passenger', 'admin')) NOT NULL,
      plate TEXT, -- Assigned if role is 'driver'
      bonus_points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. DRIVERS TABLE (Linked to vehicle tracking)
  db.run(`
    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      score INTEGER DEFAULT 100,
      trips INTEGER DEFAULT 0,
      status TEXT DEFAULT 'good',
      badges TEXT, -- JSON Array of strings
      rating REAL DEFAULT 5.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. DRIVER HISTORY TABLE (Trips linked to driver)
  db.run(`
    CREATE TABLE IF NOT EXISTS driver_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      score INTEGER NOT NULL,
      duration TEXT NOT NULL,
      status TEXT NOT NULL,
      issue TEXT,
      FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
    )
  `);

  // 4. AUDITS TABLE (Crowdsourced passenger audits, now including author_id)
  db.run(`
    CREATE TABLE IF NOT EXISTS audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      passenger_id INTEGER, -- Optional link to logged-in user
      driver_plate TEXT NOT NULL,
      road_context TEXT NOT NULL,
      weather_context TEXT NOT NULL,
      score INTEGER NOT NULL,
      rating_stars INTEGER NOT NULL,
      positive_actions TEXT, -- JSON Array
      infractions TEXT, -- JSON Array
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // 5. TRIPS TABLE (Logged in user self-trips, now including driver_id)
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER, -- Link to logged-in user
      driver_plate TEXT NOT NULL,
      score INTEGER NOT NULL,
      speed_avg REAL NOT NULL,
      fatigue_max REAL NOT NULL,
      distance REAL NOT NULL,
      duration_seconds INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 6. CAMPAIGN CHALLENGES TABLE (Daily and monthly safe driving challenges)
  db.run(`
    CREATE TABLE IF NOT EXISTS campaign_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      points INTEGER NOT NULL,
      is_completed INTEGER DEFAULT 0,
      role_restriction TEXT CHECK(role_restriction IN ('driver', 'passenger', 'all')) NOT NULL
    )
  `);

  // 7. CAMPAIGN TIPS TABLE (Safe-driving educational tips)
  db.run(`
    CREATE TABLE IF NOT EXISTS campaign_tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      points INTEGER NOT NULL
    )
  `);

  // 8. CLUBE REWARDS TABLE (Benefits, priority lanes and discounts)
  db.run(`
    CREATE TABLE IF NOT EXISTS clube_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      progress INTEGER NOT NULL,
      color TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    )
  `);

  // 9. APP CONFIGURATION TABLE (Administrative controls)
  db.run(`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT
    )
  `);

  // ==========================================
  // HIGH-PERFORMANCE INDEXES (OPTIMIZATION)
  // ==========================================
  
  // Fast query index for challenges by role
  db.run(`CREATE INDEX IF NOT EXISTS idx_challenges_role ON campaign_challenges(role_restriction);`);

  // Instant user search by email (Login check)
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);`);

  // Instant driver search by plate
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_plate ON drivers(plate);`);

  // Foreign key index for history lookup
  db.run(`CREATE INDEX IF NOT EXISTS idx_history_driver_id ON driver_history(driver_id);`);

  // Fast retrieval of reviews/audits by plate (descending order by date)
  db.run(`CREATE INDEX IF NOT EXISTS idx_audits_driver_plate_date ON audits(driver_plate, created_at DESC);`);

  // Fast retrieval of self trips by date
  db.run(`CREATE INDEX IF NOT EXISTS idx_trips_driver_plate_date ON trips(driver_plate, created_at DESC);`);

  console.log('Tables and indexes created successfully.');

  // ==========================================
  // SEED DATA
  // ==========================================

  // Hashing password '123456' for seed accounts
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('123456', salt);

  // Insert seed users
  const stmtUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, plate)
    VALUES (?, ?, ?, ?, ?)
  `);

  // 1. Seed Driver Profile
  stmtUser.run('João Silva', 'joao@shift.com', passwordHash, 'driver', 'XYZ-1992');
  // 2. Seed Passenger Profile
  stmtUser.run('Ana Santos', 'ana@shift.com', passwordHash, 'passenger', null);
  // 3. Seed Admin Profile
  stmtUser.run('SHIFT Administrador', 'admin@shift.com', passwordHash, 'admin', null);
  stmtUser.finalize();

  // 9. Seed dynamic App configurations
  const configStmt = db.prepare(`
    INSERT INTO app_config (key, value, description)
    VALUES (?, ?, ?)
  `);
  configStmt.run('MAX_SPEED_LIMIT', '90', 'Velocidade máxima permitida na autoestrada em km/h');
  configStmt.run('BRAKING_DECELE_THRESHOLD', '-10', 'Desaceleração física para travar em km/h/s');
  configStmt.run('GYRO_DISTRACTION_LIMIT', '1.2', 'Sensibilidade do giroscópio para detetar celular (rad/s)');
  configStmt.finalize();

  // Insert seed drivers (public database of audited vehicles)
  const driversSeed = [
    {
      plate: 'ABC-1234',
      name: 'João S.',
      score: 98,
      trips: 142,
      status: 'excellent',
      badges: JSON.stringify(['Suave', 'Respeita Limites']),
      rating: 4.8
    },
    {
      plate: 'SUI-0099',
      name: 'Carlos M.',
      score: 42,
      trips: 89,
      status: 'danger',
      badges: JSON.stringify(['Aceleração Brusca', 'Avança Sinal vermelho']),
      rating: 2.5
    },
    {
      plate: 'XYZ-9876',
      name: 'Ana P.',
      score: 85,
      trips: 56,
      status: 'good',
      badges: JSON.stringify(['Focada']),
      rating: 4.2
    },
    {
      plate: 'XYZ-1992',
      name: 'João Silva', // Public profile for search sync
      score: 100,
      trips: 0,
      status: 'excellent',
      badges: JSON.stringify([]),
      rating: 5.0
    }
  ];

  const stmtDriver = db.prepare(`
    INSERT INTO drivers (plate, name, score, trips, status, badges, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  driversSeed.forEach((d) => {
    stmtDriver.run(d.plate, d.name, d.score, d.trips, d.status, d.badges, d.rating);
  });
  stmtDriver.finalize();

  // Get driver IDs to insert histories
  db.all('SELECT id, plate FROM drivers', [], (err, rows) => {
    if (err) {
      console.error('Error fetching drivers for history seeding:', err);
      return;
    }

    const joaoId = rows.find(r => r.plate === 'ABC-1234').id;
    const carlosId = rows.find(r => r.plate === 'SUI-0099').id;
    const anaId = rows.find(r => r.plate === 'XYZ-9876').id;

    // Seeding driver histories
    const historyStmt = db.prepare(`
      INSERT INTO driver_history (driver_id, date, score, duration, status, issue)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // João S. History
    historyStmt.run(joaoId, "Ontem, 18:30", 99, "15 min", "perfect", null);
    historyStmt.run(joaoId, "15 Mai, 09:00", 97, "22 min", "perfect", null);

    // Carlos M. History
    historyStmt.run(carlosId, "Hoje, 08:15", 35, "45 min", "danger", "3 Travagens Bruscas, Excesso de Velocidade");
    historyStmt.run(carlosId, "Ontem, 22:10", 50, "18 min", "danger", "Curva Perigosa em Alta Velocidade");
    historyStmt.run(carlosId, "14 Mai, 19:00", 42, "30 min", "danger", "Aceleração Brusca Constante");

    // Ana P. History
    historyStmt.run(anaId, "Hoje, 12:00", 88, "10 min", "good", null);
    historyStmt.run(anaId, "Ontem, 14:45", 82, "30 min", "warning", "1 Travagem Brusca Leve");

    historyStmt.finalize();

    // 6. Seed Challenges
    const challengeStmt = db.prepare(`
      INSERT INTO campaign_challenges (title, description, points, is_completed, role_restriction)
      VALUES (?, ?, ?, ?, ?)
    `);
    challengeStmt.run('Auditor Cidadão', 'Avalie 1 corrida de App (Uber/99) como passageiro hoje.', 150, 0, 'passenger');
    challengeStmt.run('Modo Foco', 'Faça uma viagem como motorista sem tocar no celular.', 200, 0, 'driver');
    challengeStmt.run('Maio Amarelo Guardião', 'Mantenha a nota da sua telemetria acima de 95 por 3 corridas.', 500, 0, 'driver');
    challengeStmt.finalize();

    // 7. Seed Tips
    const tipStmt = db.prepare(`
      INSERT INTO campaign_tips (title, points)
      VALUES (?, ?)
    `);
    tipStmt.run('Mito vs Fato: Cinto no banco de trás', 50);
    tipStmt.run('Riscos da fadiga ao volante', 100);
    tipStmt.run('Distância de reação em pistas molhadas', 80);
    tipStmt.finalize();

    // 8. Seed Rewards
    const rewardStmt = db.prepare(`
      INSERT INTO clube_rewards (title, description, progress, color, completed)
      VALUES (?, ?, ?, ?, ?)
    `);
    rewardStmt.run('Desconto Combustível', 'Mantenha Score > 90 por 7 dias para resgatar.', 85, '#F59E0B', 0);
    rewardStmt.run('Prioridade VIP Apps', 'Corridas 5 segundos antes que outros condutores.', 100, '#10B981', 1);
    rewardStmt.run('Desconto Lavagem Premium', 'Score de Condução > 95 por 5 corridas consecutivas.', 60, '#6366F1', 0);
    rewardStmt.finalize();

    console.log('Seed data inserted successfully.');
    db.close();
  });
});
