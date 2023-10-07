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

const typeCheck = (type: string | undefined, wantedType: string): boolean => {
  if(type === undefined)
    return true
  return (type === wantedType || type === 'All') ? true : false;
}

const searchQuery = (search?: string, canton?: string, game?: string, language?: string, type?: string, offset?: number): Promise<EntityQuery[]> => {
  const searchString = `%${search?.toLowerCase()}%`;
  const gameString = `${excludeAllText(game)}`;
  const cantonString = `${excludeAllText(canton)}`;
  const langString = `${excludeAllText(language)}`;
  let showUser = typeCheck(type, 'User') ? 1 : 0;
  let showTeam = typeCheck(type, 'Team') ? 'team' : '';
  let showOrg = typeCheck(type, 'Organisation') ? 'organisation' : '';
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
              gro1.name             AS team,
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
              -- group_member
              --
        LEFT OUTER JOIN
              "group_member" grm1
           ON usr.id = grm1.user_id 
           AND grm1.is_main_group = true
           AND grm1.request_status = 'ACCEPTED'
              --
              -- group
              --
        LEFT OUTER JOIN
              "group" gro1
           ON gro1.id = grm1.group_id
           AND gro1.is_active = TRUE
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
             -- GROUP
             -- *********************************
        SELECT
              gro2.id              AS id,
              gro2.handle          AS handle,
              gro2.image           AS image,
              array_agg(DISTINCT gam2.name) AS games,    -- ARRAY ARGUMENTS
              ''                  AS team,
              UPPER(gtype.name)   AS entity_type 
         FROM
              "group" gro2
              --
              -- game
              --
        INNER JOIN
              "game" gam2
           ON gro2.game_id = gam2.id
           AND gam2.name LIKE ${gameString}
              --
              -- canton
              --
        INNER JOIN
              "canton" can2
          ON gro2.canton_id = can2.id
          AND can2.name LIKE ${cantonString}
              --
              -- _GroupToLanguage
              --
        LEFT OUTER JOIN
              "_GroupToLanguage" ltg
          ON gro2.id = ltg."A"
              --
              -- language
              --
        INNER JOIN
              "language" lang2
          ON ltg."B" = lang2.id
          AND lang2.name LIKE ${langString}
              --
              -- group type
              --
        INNER JOIN
            "group_type" gtype
            ON gro2.group_type_id = gtype.id
              --
              -- WHERE
              --
        WHERE
            (gtype.name = ${showTeam}
            OR 
            gtype.name = ${showOrg})
        AND
            gro2.is_active = TRUE
        AND
            LOWER(gro2.handle) LIKE ${searchString}
              --
              --   GROUP BY
              --
        GROUP BY
              1,
              2,
              3,
              -- 4, ignore games
              -- 5, ignore team
              6
        ) AS ent
    ORDER BY ent.handle
    LIMIT 15
    OFFSET ${offset}
`

}

export {
  searchQuery
};

