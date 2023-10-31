import { json } from "@remix-run/node";
import { zx } from "zodix";
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";

export const deleteEntity = async (request: Request) => {
  if(request.method !== "DELETE") {
    throw json({}, 404);
  }
  const { entityId } = await zx.parseForm(request, {
    entityId: z.string(),
  });
  const user = await checkUserAuth(request);
  const entity_id = Number(entityId);
  await checkIdAccessForEntity(user.db.id, entity_id, 'ADMINISTRATOR');
  try {
    const query = { where: { id: entity_id } };

    await db.group.delete(query);
  } catch(error) {
    throw json({}, 404)
  }
  return json({});
}
