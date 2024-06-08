const excludeProperties = <T extends Record<string, any>>(
  obj: T,
  propertiesToExclude: Array<string>
) => {
  const newObj = { ...obj };
  propertiesToExclude.forEach((property) => delete newObj[property]);
  return newObj;
};

export default excludeProperties;
