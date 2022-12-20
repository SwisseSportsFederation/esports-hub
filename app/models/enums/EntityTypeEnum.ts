enum EntityType {
  User = 1,
  Team = 2,
  Organisation = 3,
}
export const getEntityTypeName = (entityType: EntityType) => EntityType[entityType].toLocaleLowerCase();
export const getEntityTypeNamePlural = (entityType: EntityType) => `${EntityType[entityType].toLocaleLowerCase()}${entityType === EntityType.User ? "" : "s"}`;

export const getEntityTypeFromString = (type: string): number => {
  type = type.charAt(0).toUpperCase() + type.slice(1);
  const entityTypeString = type as keyof typeof EntityType;
  return EntityType[entityTypeString];
};

export default EntityType;
