import { json } from "@remix-run/node";
import { zx } from "zodix";
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import type { EntityType } from "~/helpers/entityType";

export const deleteEntity = async (request: Request, entity: Omit<EntityType, 'USER'>) => {
  if(request.method !== "DELETE") {
    throw json({}, 404);
  }
  const { entityId } = await zx.parseForm(request, {
    entityId: z.string(),
  });
  const user = await checkUserAuth(request);
  const entity_id = Number(entityId);
  await checkIdAccessForEntity(user.db.id, entity_id, entity, 'ADMINISTRATOR');
  try {
    const query = { where: { id: entity_id } };

    if(entity === 'TEAM') {
      await db.team.delete(query);
    } else {
      await db.organisation.delete(query);
    }
  } catch(error) {
    throw json({}, 404)
  }
  return json({});
}
