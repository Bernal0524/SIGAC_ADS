"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWeekend = void 0;
const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
};
exports.isWeekend = isWeekend;
//# sourceMappingURL=date-validator.util.js.map