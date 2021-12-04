"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class SQLCrud extends __1.Crud {
    /**
     * @depreceated Use setup() instead
     */
    createTableIfNotExists() {
        return this.setup();
    }
}
exports.default = SQLCrud;
