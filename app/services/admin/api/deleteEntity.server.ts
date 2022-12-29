import { json } from "@remix-run/node";
import { zx } from "zodix";
import { z } from "zod";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { EntityType } from "~/helpers/entityType";

export const deleteEntity = async (request: Request, entity: Omit<EntityType, 'USER'>) => {
  if(request.method !== "DELETE") {
    throw json({}, 404);
  }
  const { entityId } = await zx.parseForm(request, {
    entityId: z.string(),
  });
  const user = await checkUserAuth(request);
  const entity_id = Number(entityId);

  const entityName = entity === 'TEAM' ? 'team_id' : 'organisation_id';

  try {
    const membership = await db.member.findFirstOrThrow({
      where: {
        user_id: Number(user.db.id),
        [entityName]: entity_id
      },
      select: {
        access_rights: true
      }
    });

    if(membership.access_rights !== "ADMINISTRATOR") {
      return json({}, 403);
    }

    if(entity === 'TEAM') {
      await db.team.delete({
        where: {
          id: entity_id
        }
      });
    }
  } catch(error) {
    throw json({}, 404)
  }
  return json({});
}
