"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = __importDefault(require("./virtualTypes/object"));
const pointer_1 = __importDefault(require("./virtualTypes/pointer"));
const VirtualTypes = {
    Link: pointer_1.default,
    Object: object_1.default,
};
exports.default = VirtualTypes;
