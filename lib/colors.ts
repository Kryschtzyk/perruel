// Zentrale Farbfunktion für Teams

// Vordefinierte, gut unterscheidbare Farben
const TEAM_COLORS = [
  '#e6194B',  // Rot
  '#3cb44b',  // Grün
  '#4363d8',  // Blau
  '#f58231',  // Orange
  '#911eb4',  // Lila
  '#42d4f4',  // Hellblau
  '#f032e6',  // Pink
  '#469990',  // Türkis
  '#9A6324',  // Braun
  '#800000',  // Dunkelrot
  '#808000',  // Olive
  '#000075',  // Navy
  '#e6beff',  // Helllila
  '#ff6b6b',  // Korallenrot
  '#4b7bec'   // Königsblau
];

// Speichere die bereits zugewiesenen Farben
const assignedColors: { [key: string]: string } = {};
let colorIndex = 0;

export function getTeamColor(teamId: string): string {
  // Wenn diesem Team bereits eine Farbe zugewiesen wurde, verwende diese
  if (assignedColors[teamId]) {
    return assignedColors[teamId];
  }

  // Weise die nächste verfügbare Farbe zu
  const color = TEAM_COLORS[colorIndex % TEAM_COLORS.length];
  assignedColors[teamId] = color;
  colorIndex++;

  return color;
}
