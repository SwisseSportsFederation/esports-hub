import { EntityType } from "@prisma/client";

export const entityToPathSegment = (entity: EntityType) => {
  return entity.toLowerCase();
}

