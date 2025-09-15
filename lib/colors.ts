// Zentrale Farbfunktion für Teams
export function getTeamColor(teamId: string): string {
  // Einfache Hash-Funktion für den Seed (TeamId)
  let hash = 0;
  for (let i = 0; i < teamId.length; i++) {
    hash = teamId.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generiere Farbwert
  return `hsl(${hash % 360}, 70%, 50%)`;
}

