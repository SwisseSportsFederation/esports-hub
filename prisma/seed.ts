import type { Prisma } from "@prisma/client";
import { AccessRight, PrismaClient, RequestStatus, SocialPlatform, VerificationLevel } from "@prisma/client";
import { faker } from '@faker-js/faker';

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
      { name: 'League of Legends', is_active: true },
      { name: 'Call of Duty', is_active: true },
      { name: 'Hearthstone', is_active: true },
      { name: 'Counterstrike', is_active: true },
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

  await prisma.groupType.createMany({
    data: [
      { name: 'organisation' },
      { name: 'team' },
    ]
  });


  await Promise.all(createOrgs().map(data => prisma.group.create({ data })));
  await Promise.all(createTeams().map(data => prisma.group.create({ data })));
  await Promise.all(createUsers().map(data => prisma.user.create({ data })));
  const user = createUsers()[0];
  await prisma.user.create({
    data: {
      ...user,
      auth_id: 'auth0|63ac8a2f73084ca5370c4aed',
      email: 'test@test.com'
    }
  });
}

seed();

function fakeBigInt(min: number, max: number) {
  return faker.datatype.bigInt({
    min,
    max
  })
}

function common() {
  const languagesCount = faker.datatype.number({
    min: 1,
    max: 3
  });

  return {
    handle: faker.name.firstName(),
    verification_level: faker.helpers.objectValue(VerificationLevel),
    name: faker.company.name(),
    description: faker.lorem.lines(3),
    socials: {
      create: [{
        name: faker.company.name(),
        platform: faker.helpers.objectValue(SocialPlatform)
      }]
    },
    languages: {
      connect: Array.from({ length: languagesCount }).map(() => {
        return {
          id: fakeBigInt(1, 6)
        }
      })
    },
    canton: {
      connect: {
        id: fakeBigInt(1, 26)
      }
    }
  }
}

const array = (max: number = 4) => Array.from({ length: max });


function createUsers(): Prisma.UserCreateInput[] {
  return array(10).map(() => {
    return {
      ...common(),
      email: faker.internet.email(),
      surname: faker.name.lastName(),
      groups: {
        createMany: {
          data: createGroupMember()
        }
      },
      former_teams: {
        createMany: {
          data: createFormerTeams()
        }
      },
      games: {
        connect: array(3).map(() => {
          return {
            id: fakeBigInt(1, 7)
          }
        })
      }
    }
  });
}


function createFormerTeams(): Prisma.FormerTeamCreateManyUserInput[] {
  return array().map(() => {
    return {
      name: faker.company.name(),
      from: faker.datatype.datetime(),
      to: faker.datatype.datetime(),
    }
  });

}

function createGroupMember(): Prisma.GroupMemberCreateManyUserInput[] {
  return array().map((_, index) => {
    return {
      access_rights: faker.helpers.objectValue(AccessRight),
      is_main_group: index === 0,
      request_status: faker.helpers.arrayElement([RequestStatus.ACCEPTED, RequestStatus.PENDING_USER, RequestStatus.PENDING_GROUP]),
      joined_at: faker.datatype.datetime(),
      role: faker.name.jobTitle(),
      group_id: index + 1
    }
  });
}

function createTeams(): Prisma.GroupCreateInput[] {
  return array(10).map(() => {
    return {
      ...common(),
      game: {
        connect: {
          id: fakeBigInt(1, 7)
        }
      },
      groupType: {
        connect: {
          id: 2
        }
      },
      parent: {
        create: {
          request_status: faker.helpers.arrayElement([RequestStatus.ACCEPTED, RequestStatus.PENDING_GROUP, RequestStatus.PENDING_PARENT_GROUP]),
          parent: {
            connect: {
              id: fakeBigInt(1, 10)
            }
          }
        }
      }
    }
  });
}

function createOrgs(): Prisma.GroupCreateInput[] {
  return array(10).map(() => {
    return {
      ...common(),
      groupType: {
        connect: {
          id: 1
        }
      },
    }
  })
}

