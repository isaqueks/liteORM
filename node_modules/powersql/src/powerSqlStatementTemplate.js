"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PowerSQLStatementTemplate {
    constructor(Template, Execute) {
        this.template = Template;
        this.execute = Execute;
    }
    toSql(...args) {
        let sqlItems = this.execute.apply(this, arguments);
        if (!Array.isArray(sqlItems)) {
            sqlItems = [sqlItems];
        }
        const templateDivided = this.template.split('$');
        let result = '';
        let i = 0;
        for (let templateItem of templateDivided) {
            result += templateItem + (i <= sqlItems.length - 1 ? sqlItems[i++] : '');
        }
        return result;
    }
}
exports.default = PowerSQLStatementTemplate;
