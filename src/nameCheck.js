"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkSQLIdentifierName(name) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}
exports.default = checkSQLIdentifierName;
