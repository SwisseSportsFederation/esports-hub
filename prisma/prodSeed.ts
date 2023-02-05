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
      { name: "Freiburg" },
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
      { name: "Tessin" },
      { name: "Waadt" },
      { name: "Wallis" },
      { name: "Neuenburg" },
      { name: "Genf" },
      { name: "Jura" }
    ]
  });

  await prisma.game.createMany({
    data: [
      { name: 'League of Legends' },
      { name: 'Call of Duty' },
      { name: 'Hearthstone' },
      { name: 'Counterstrike' },
      { name: 'Valorant' },
      { name: 'Overwatch' },
      { name: 'Fortnite' }
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
