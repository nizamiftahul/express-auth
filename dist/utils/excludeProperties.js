"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const excludeProperties = (obj, propertiesToExclude) => {
    const newObj = Object.assign({}, obj);
    propertiesToExclude.forEach((property) => delete newObj[property]);
    return newObj;
};
exports.default = excludeProperties;
