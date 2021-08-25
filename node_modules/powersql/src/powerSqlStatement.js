"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerSQLStatementFactory = void 0;
const powerSqlStatementTemplate_1 = __importDefault(require("./powerSqlStatementTemplate"));
function PowerSQLStatementFactory(template, executor) {
    const result = function () {
        return this.template.toSql.apply(this.template, arguments);
    };
    result.template = new powerSqlStatementTemplate_1.default(template, executor);
    return result.bind(result);
}
exports.PowerSQLStatementFactory = PowerSQLStatementFactory;
