export type EntityType = 'USER' | 'TEAM' | 'ORG';

export const entityToPathSegment = (entity: EntityType) => {
  switch(entity) {
    case 'ORG':
      return 'organisation';
    case 'TEAM':
      return 'team';
    default:
      return 'user';
  }
}
