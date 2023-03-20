import { db } from "~/services/db.server";
import type { Prisma } from "@prisma/client";
import { EntityType } from "~/helpers/entityType";

const query = (search?: string): Prisma.StringFilter => ({
  contains: search?.toString(),
  mode: 'insensitive'
});

export type StringOrNull = string | null;

type TeamsQuery = {
  id: bigint,
  image: StringOrNull,
  name: string,
  handle: string,
  game: { name: string } | null;
}[]

type OrgsQuery = {
  id: bigint,
  image: StringOrNull,
  name: string,
  handle: string
}[]

type UsersQuery = {
  id: bigint,
  image: StringOrNull,
  handle: string,
  games: { name: string }[],
  teams: { team: { name: StringOrNull } }[]
}[];

type EntityQuery = {
  id: bigint,
  image: StringOrNull,
  handle: string,
  games: string[],
  team?: string[],
  entity_type: EntityType
}[];

const excludeAllText = (text: string | undefined): string => {
  if(text && text !== 'All') {
    return text;
  }
  return '%'
}

const typeCheck = (type: string | undefined, wantedType: string): number => {
  if(type === undefined)
    return 1
  return (type === wantedType || type === 'All') ? 1 : 0;
}

const searchQuery = (search?: string, canton?: string, game?: string, language?: string, type?: string, offset?: number): Promise<EntityQuery[]> => {
  const searchString = `%${search?.toLowerCase()}%`;
  const gameString = `${excludeAllText(game)}`;
  const cantonString = `${excludeAllText(canton)}`;
  const langString = `${excludeAllText(language)}`;
  let showUser = typeCheck(type, 'User');
  let showTeam = typeCheck(type, 'Team');
  let showOrg = typeCheck(type, 'Organisation');
  return db.$queryRaw<EntityQuery[]>`
  -- *********************************
  -- ENTITY 
  -- *********************************
    SELECT
        ent.id,
        ent.handle,
        ent.image,
        ent.games,
        ent.team,
        ent.entity_type
  FROM (
        -- *********************************
        -- USER 
        -- *********************************
        SELECT
              usr.id               AS id,
              usr.handle           AS handle,
              usr.image            AS image,
              array_agg(gam.name)  AS games,    -- ARRAY ARGUMENTS
              tea.name             AS team,
              'USER'               AS entity_type
         FROM
              "user" usr 
              --
              -- _GameToUser
              --
        INNER JOIN
              "_GameToUser" gtu
           ON usr.id = gtu."B"
              --
              -- game
              --
        INNER JOIN
              "game" gam
           ON gtu."A" = gam.id  
              --
              -- canton
              --
        INNER JOIN
              "canton" can1
          ON usr.canton_id = can1.id
              --
              -- _LanguageToUser
              --
        INNER JOIN
              "_LanguageToUser" ltu
          ON usr.id = ltu."B"
              --
              -- language
              --
        INNER JOIN
              "language" lang1
          ON ltu."A" = lang1.id
              --
              -- team_member
              --
        INNER JOIN
              "team_member" tem 
           ON usr.id = tem.user_id 
              --
              -- team
              --
        INNER JOIN
              "team" tea 
           ON tea.id = tem.team_id 
              --
              -- WHERE 
              --      
        WHERE
            1 = ${showUser}
        AND
            LOWER(usr.handle) LIKE ${searchString}
        AND
            can1.name LIKE ${cantonString}
        AND
            lang1.name LIKE ${langString}
        AND
            gam.name LIKE ${gameString}
        AND 
            tem.is_main_team = true           
             --
             --  GROUP BY
             --
       GROUP BY
              1,
              2,
              3,    
          -- 4,-- ARRAY ARGUMENTS
              5       
             -- ---------------------------------
             -- UNION ALL
             -- ---------------------------------
       UNION ALL
             -- *********************************
             -- TEAM
             -- *********************************
        SELECT
              tea.id              AS id,
              tea.handle          AS handle,
              tea.image           AS image,
              array_agg(gam2.name) AS games,    -- ARRAY ARGUMENTS
              ''                  AS team,
              'TEAM'              AS entity_type 
         FROM
              "team" tea
              --
              -- game
              --
        INNER JOIN
              "game" gam2
           ON tea.game_id = gam2.id
              --
              -- canton
              --
        INNER JOIN
              "canton" can2
          ON tea.canton_id = can2.id
              --
              -- _LanguageToTeam
              --
        INNER JOIN
              "_LanguageToTeam" ltt
          ON tea.id = ltt."B"
              --
              -- language
              --
        INNER JOIN
              "language" lang2
          ON ltt."A" = lang2.id
              --
              -- WHERE
              --
        WHERE
            1 = ${showTeam}
        AND
            LOWER(tea.handle) LIKE ${searchString}
        AND
            can2.name LIKE ${cantonString}
        AND
            lang2.name LIKE ${langString}
        AND
            gam2.name LIKE ${gameString}
              --
              --   GROUP BY
              --
        GROUP BY
              1,
              2,
              3,    
          -- 4, -- ARRAY ARGUMENTS
              5
             -- ---------------------------------
             -- UNION ALL
             -- ---------------------------------
       UNION ALL
             -- *********************************
             -- ORGANISATION
             -- *********************************  
        SELECT
              org.id              AS id,
              org.handle          AS handle,
              org.image           AS image,
              array_agg(gam3.name) AS games,    -- ARRAY ARGUMENTS
              ''                  AS team,
              'ORG'               AS entity_type 
         FROM
              "organisation" AS org 
        --
        -- organisation_team
        -- 
        INNER JOIN
              "organisation_team" ogt 
           ON org.id = ogt.organisation_id 
          --
          -- team
          --
       INNER JOIN
             "team" tem 
          ON ogt.team_id = tem.id 
         --
         -- game
         --
       INNER JOIN
             "game" gam3
          ON tem.game_id = gam3.id
        --
        -- canton
        --
        INNER JOIN
              "canton" can3
           ON org.canton_id = can3.id
        --
        -- _LanguageToOrg
        --
        INNER JOIN
              "_LanguageToOrganisation" lto
          ON org.id = lto."B"
        --
        -- language
        --
        INNER JOIN
              "language" lang3
          ON lto."A" = lang3.id
         --
         -- WHERE
         --
        WHERE
            1 = ${showOrg}
        AND
            LOWER(org.handle) LIKE ${searchString}
        AND
            can3.name LIKE ${cantonString}
        AND
            lang3.name LIKE ${langString}
        AND
            gam3.name LIKE ${gameString}
         --
         -- GROUP BY
         --
       GROUP BY
            1,
            2,
            3,    
         -- 4,  -- ARRAY ARGUMENTS
            5
        ) AS ent
    ORDER BY ent.handle
    LIMIT 15
    OFFSET ${offset}
`

}

const typeFilter = (name: string, type?: string) => !type || type === name;

const searchQueries = (search?: string, canton?: string, game?: string, language?: string, type?: string, offsetOrg?: number, offsetTeam?: number, offsetUser?: number): [Promise<UsersQuery>, Promise<TeamsQuery>, Promise<OrgsQuery>] => {
  const u = typeFilter("User", type) ? usersQuery(search, canton, game, language, offsetUser ?? 0) : Promise.resolve<UsersQuery>([]);
  const t = typeFilter("Team", type) ? teamsQuery(search, canton, game, language, offsetTeam ?? 0) : Promise.resolve<TeamsQuery>([]);
  const o = typeFilter("Organisation", type) ? orgsQuery(search, canton, language, offsetOrg ?? 0) : Promise.resolve<OrgsQuery>([]);
  return [u, t, o];
};

const usersQuery = (search?: string, canton?: string, language?: string, game?: string, offset?: number) => db.user.findMany({
  where: {
    AND: [
      ...(canton ? [{ canton: { name: { equals: canton } } }] : []),
      ...(language ? [{ languages: { some: { name: language } } }] : []),
      ...(game ? [{ games: { some: { name: game } } }] : []),
      ...(search ? [{ OR: [
        { handle: query(search) },
        { name: query(search) },
        { surname: query(search) }
      ]}
      ] : [])
    ],
  },
  select: {
    id: true,
    image: true,
    handle: true,
    games: { select: { name: true } },
    teams: { select: { team: { select: { name: true } } } }
  },
  skip: offset,
  take: 5
});

const teamsQuery = (search?: string, canton?: string, game?: string, language?: string, offset?: number) => db.team.findMany({
  where: {
    AND: [
      ...(canton ? [{ canton: { name: { equals: canton } } }] : []),
      ...(language ? [{ languages: { some: { name: language } } }] : []),
      ...(game ? [{ game: { name: game } }] : []),
      ...(search ? [{ OR: [
        { handle: query(search) },
        { name: query(search) },
      ]}
      ] : [])
    ]
  },
  select: {
    id: true,
    image: true,
    name: true,
    handle: true,
    game: {
      select: {
        name: true
      }
    }
  },
  skip: offset,
  take: 5,
});

const orgsQuery = (search?: string, canton?: string, language?: string, offset?: number) => db.organisation.findMany({
  where: {
    AND: [
      ...(canton ? [{ canton: { name: { equals: canton } } }] : []),
      ...(language ? [{ languages: { some: { name: language } } }] : []),
      ...(search ? [{ OR: [
        { handle: query(search) },
        { name: query(search) },
      ]}
      ] : [])
    ]
  },
  select: {
    id: true,
    image: true,
    name: true,
    handle: true
  },
  skip: offset,
  take: 5
});


export {
  searchQueries,
  searchQuery
};

