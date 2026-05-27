/**
 * Badge awarding logic for SHIFT PRO
 */
const awardBadges = (driver, tripData = null, auditData = null) => {
  const currentBadges = driver.badges || [];
  const newBadges = [...currentBadges];

  // 1. "Novato": First trip completed
  if (driver.trips >= 1 && !newBadges.includes('Novato')) {
    newBadges.push('Novato');
  }

  // 2. "Veterano": 50 trips
  if (driver.trips >= 50 && !newBadges.includes('Veterano')) {
    newBadges.push('Veterano');
  }

  // 3. "Lenda do Volante": 200 trips
  if (driver.trips >= 200 && !newBadges.includes('Lenda do Volante')) {
    newBadges.push('Lenda do Volante');
  }

  // 4. "Mestre da Suavidade": Score 100 in a trip with significant distance
  if (tripData && tripData.score >= 100 && tripData.distance > 5 && !newBadges.includes('Mestre da Suavidade')) {
    newBadges.push('Mestre da Suavidade');
  }

  // 5. "Foco Total": Multiple trips without phone distraction (simulated by trip score)
  if (tripData && tripData.score >= 95 && driver.trips > 10 && !newBadges.includes('Foco Total')) {
    newBadges.push('Foco Total');
  }

  // 6. "Favorito da Comunidade": Excellent rating based on audits
  if (driver.rating >= 4.9 && driver.trips > 20 && !newBadges.includes('Favorito da Comunidade')) {
    newBadges.push('Favorito da Comunidade');
  }

  return newBadges;
};

module.exports = { awardBadges };
