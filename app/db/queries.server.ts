import { db } from "~/services/db.server";
import { EntityType } from "~/helpers/entityType";

export type StringOrNull = string | null;

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
              array_agg(DISTINCT gam.name)  AS games,    -- ARRAY ARGUMENTS
              tea1.name             AS team,
              'USER'               AS entity_type
         FROM
              "user" usr 
              --
              -- canton
              --
        INNER JOIN
              "canton" can1
            ON usr.canton_id = can1.id
            AND can1.name LIKE ${cantonString}
              --
              -- _GameToUser
              --
        LEFT OUTER JOIN
              "_GameToUser" gtu
           ON usr.id = gtu."B"
              --
              -- game
              --
        INNER JOIN
              "game" gam
           ON gtu."A" = gam.id  
           AND gam.name LIKE ${gameString}
              --
              -- _LanguageToUser
              --
        LEFT OUTER JOIN
              "_LanguageToUser" ltu
          ON usr.id = ltu."B"
              --
              -- language
              --
        INNER JOIN
              "language" lang1
          ON ltu."A" = lang1.id
          AND lang1.name LIKE ${langString}
              --
              -- team_member
              --
        LEFT OUTER JOIN
              "team_member" tem 
           ON usr.id = tem.user_id 
           AND tem.is_main_team = true
           AND tem.request_status = 'ACCEPTED'
              --
              -- team
              --
        LEFT OUTER JOIN
              "team" tea1 
           ON tea1.id = tem.team_id
           AND tea1.is_active = TRUE
              --
              -- WHERE 
              --      
        WHERE
            1 = ${showUser}
        AND
            usr.is_active = TRUE
        AND
            LOWER(usr.handle) LIKE ${searchString}
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
              array_agg(DISTINCT gam2.name) AS games,    -- ARRAY ARGUMENTS
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
           AND gam2.name LIKE ${gameString}
              --
              -- canton
              --
        INNER JOIN
              "canton" can2
          ON tea.canton_id = can2.id
          AND can2.name LIKE ${cantonString}
              --
              -- _LanguageToTeam
              --
        LEFT OUTER JOIN
              "_LanguageToTeam" ltt
          ON tea.id = ltt."B"
              --
              -- language
              --
        INNER JOIN
              "language" lang2
          ON ltt."A" = lang2.id
          AND lang2.name LIKE ${langString}
              --
              -- WHERE
              --
        WHERE
            1 = ${showTeam}
        AND
            tea.is_active = TRUE
        AND
            LOWER(tea.handle) LIKE ${searchString}
              --
              --   GROUP BY
              --
        GROUP BY
              1,
              2,
              3
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
              array_agg(DISTINCT gam3.name) AS games,    -- ARRAY ARGUMENTS
              ''                  AS team,
              'ORG'               AS entity_type 
         FROM
              "organisation" AS org 
        --
        -- canton
        --
        INNER JOIN
              "canton" can3
           ON org.canton_id = can3.id
           AND can3.name LIKE ${cantonString}
        --
        -- organisation_team
        -- 
        LEFT OUTER JOIN
              "organisation_team" ogt 
           ON org.id = ogt.organisation_id 
           AND ogt.request_status = 'ACCEPTED'
          --
          -- team
          --
       LEFT OUTER JOIN
             "team" tea2
          ON ogt.team_id = tea2.id
          AND tea2.is_active = TRUE
         --
         -- game
         --
       LEFT OUTER JOIN
             "game" gam3
          ON tea2.game_id = gam3.id
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
          AND lang3.name LIKE ${langString}
         --
         -- WHERE
         --
        WHERE
            1 = ${showOrg}
        AND
            org.is_active = TRUE
        AND
            LOWER(org.handle) LIKE ${searchString}
        AND
            ((gam3.name IS NULL AND ${gameString} = '%') OR (gam3.name IS NOT NULL AND gam3.name LIKE ${gameString}))
         --
         -- GROUP BY
         --
       GROUP BY
            1,
            2,
            3
        ) AS ent
    ORDER BY ent.handle
    LIMIT 15
    OFFSET ${offset}
`

}

export {
  searchQuery
};

