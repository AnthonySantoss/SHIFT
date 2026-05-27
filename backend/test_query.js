const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, 'src', 'database', 'db.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

async function test() {
  const Audit = require('./src/models/audit.model');
  const count = await Audit.count();
  console.log('Total audits:', count);
  const audits = await Audit.findAll({ where: { driver_plate: 'SHIFT-2026' } });
  console.log('SHIFT-2026 audits:', audits.length);
  audits.forEach(a => console.log('  id:', a.id, 'stars:', a.rating_stars));
  await sequelize.close();
}

test().catch(err => { console.error(err); process.exit(1); });
