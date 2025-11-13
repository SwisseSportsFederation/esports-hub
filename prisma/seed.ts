import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {

  await prisma.canton.createMany({
    data: [
      { name: "Zürich" },
      { name: "Bern" },
      { name: "Luzern" },
      { name: "Uri" },
      { name: "Schwyz" },
      { name: "Obwalden" },
      { name: "Nidwalden" },
      { name: "Glarus" },
      { name: "Zug" },
      { name: "Fribourg/Freiburg" },
      { name: "Solothurn" },
      { name: "Basel-Stadt" },
      { name: "Basel-Landschaft" },
      { name: "Schaffhausen" },
      { name: "Appenzell A.Rh." },
      { name: "Appenzell I.Rh." },
      { name: "Sankt Gallen" },
      { name: "Graubünden" },
      { name: "Aargau" },
      { name: "Thurgau" },
      { name: "Ticino" },
      { name: "Vaud" },
      { name: "Valais/Wallis" },
      { name: "Neuchâtel" },
      { name: "Genève" },
      { name: "Jura" }
    ]
  });
  
  await prisma.game.createMany({
    data: [
      { name: 'League of Legends', is_active: true },
      { name: 'Call of Duty', is_active: true },
      { name: 'Hearthstone', is_active: true },
      { name: 'Counter Strike 2', is_active: true },
      { name: 'Valorant', is_active: true },
      { name: 'Overwatch', is_active: true },
      { name: 'Fortnite', is_active: true }
    ]
  });

  await prisma.language.createMany({
    data: [
      { name: 'Deutsch' },
      { name: 'English' },
      { name: 'Français' },
      { name: 'Italiano' },
      { name: 'Español' },
      { name: 'Português' },
    ]
  });
}

seed();
