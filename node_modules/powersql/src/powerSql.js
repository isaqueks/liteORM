"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function PowerSQL(...statements) {
    let sql = '';
    for (let statement of statements) {
        sql += statement + ' ';
    }
    return sql.trim() + ';';
}
exports.default = PowerSQL;
