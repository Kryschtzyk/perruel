export type Checkpoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  riddle?: string;
  answer?: string;
  order: number;
};

export const seedCheckpoints: Checkpoint[] = [
  {
    id: 'c1',
    name: "Start: 290 Rue de l'Andelle",
    lat: 49.38945,
    lng: 1.32024,
    radius: 25,
    riddle: 'Los geht\'s! Scan den QR und tippe Teamnamen ein.',
    order: 1,
  },
  {
    id: 'c2',
    name: 'Église Sainte‑Geneviève (Vorplatz)',
    lat: 49.39253,
    lng: 1.31756,
    radius: 30,
    riddle: 'Zähle die großen Fenster am Schiff. Produkt aus Anzahl x 3 ist der Code.',
    order: 2,
  },
  {
    id: 'c3',
    name: 'Andelle‑Ufer (Öffentlicher Zugangspunkt)',
    lat: 49.39135,
    lng: 1.32218,
    radius: 35,
    riddle: 'Finde ein rundes Schild. Welcher Buchstabe ist am größten?',
    order: 3,
  },
  {
    id: 'c4',
    name: "Abbaye de l'Isle‑Dieu (Außen/Infotafel)",
    lat: 49.39305,
    lng: 1.3268,
    radius: 40,
    riddle: 'Auf der Tafel: Welches Jahr wird zweimal erwähnt?',
    order: 4,
  },
  {
    id: 'c5',
    name: 'Kleiner Platz / Wegkreuz',
    lat: 49.3906,
    lng: 1.3259,
    radius: 25,
    riddle: 'Fotomission: Formt als Team einen Buchstaben und macht ein Selfie.',
    order: 5,
  },
  {
    id: 'c6',
    name: 'Ziel: Haus – Garten',
    lat: 49.38945,
    lng: 1.32024,
    radius: 25,
    riddle: 'Finale Team‑Challenge (gemeinsam)',
    order: 6,
  },
];

