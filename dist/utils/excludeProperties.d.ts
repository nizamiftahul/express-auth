declare const excludeProperties: <T extends Record<string, any>>(obj: T, propertiesToExclude: Array<string>) => T;
export default excludeProperties;
