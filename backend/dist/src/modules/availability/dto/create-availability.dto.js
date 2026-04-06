"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAvailabilityDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateAvailabilityDto {
}
exports.CreateAvailabilityDto = CreateAvailabilityDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La hora de inicio es obligatoria para la orquestación' }),
    (0, class_validator_1.IsString)({ message: 'startTime debe ser una cadena de texto en formato ISO' }),
    (0, class_validator_1.IsISO8601)({}, { message: 'startTime debe ser una fecha válida (Ej: 2026-03-10T08:00:00Z)' }),
    __metadata("design:type", String)
], CreateAvailabilityDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La hora de fin es obligatoria para la orquestación' }),
    (0, class_validator_1.IsString)({ message: 'endTime debe ser una cadena de texto en formato ISO' }),
    (0, class_validator_1.IsISO8601)({}, { message: 'endTime debe ser una fecha válida (Ej: 2026-03-10T12:00:00Z)' }),
    __metadata("design:type", String)
], CreateAvailabilityDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El día de la semana es obligatorio' }),
    (0, class_validator_1.IsInt)({ message: 'El día de la semana debe ser un número entero' }),
    (0, class_validator_1.Min)(0, { message: 'El día mínimo es 0 (Domingo)' }),
    (0, class_validator_1.Max)(6, { message: 'El día máximo es 6 (Sábado)' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateAvailabilityDto.prototype, "dayOfWeek", void 0);
//# sourceMappingURL=create-availability.dto.js.map