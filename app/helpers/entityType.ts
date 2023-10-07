export type EntityType = 'USER' | 'TEAM' | 'ORGANISATION';

export const entityToPathSegment = (entity: EntityType) => {
  return entity.toLowerCase();
}
