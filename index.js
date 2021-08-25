"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectData = exports.ValuableField = exports.Field = exports.ObjectModel = exports.SimpleCrud = exports.Crud = void 0;
const Crud_1 = __importDefault(require("./src/Crud"));
exports.Crud = Crud_1.default;
const field_1 = __importDefault(require("./src/field"));
exports.Field = field_1.default;
const ObjectData_1 = __importDefault(require("./src/ObjectData"));
exports.ObjectData = ObjectData_1.default;
const objectModel_1 = __importDefault(require("./src/objectModel"));
exports.ObjectModel = objectModel_1.default;
const simpleCrud_1 = __importDefault(require("./src/simpleCrud"));
exports.SimpleCrud = simpleCrud_1.default;
const valuableField_1 = __importDefault(require("./src/valuableField"));
exports.ValuableField = valuableField_1.default;
