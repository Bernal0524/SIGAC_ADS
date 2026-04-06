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
exports.UpdateActivityStatusDto = exports.CreateActivityDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateActivityDto {
}
exports.CreateActivityDto = CreateActivityDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El título de la actividad es obligatorio' }),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La ubicación es obligatoria para la logística' }),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha de inicio debe tener un formato ISO válido' }),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha de fin debe tener un formato ISO válido' }),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El máximo de participantes debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'El máximo de participantes debe ser al menos 1' }),
    __metadata("design:type", Number)
], CreateActivityDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El quórum mínimo debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'El quórum debe ser al menos 1' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Definir el quórum mínimo es parte de la Orquestación obligatoria' }),
    __metadata("design:type", Number)
], CreateActivityDto.prototype, "minQuorum", void 0);
class UpdateActivityStatusDto {
}
exports.UpdateActivityStatusDto = UpdateActivityStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ActivityStatus, { message: 'El estado proporcionado no es válido para el flujo de SIGAC' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateActivityStatusDto.prototype, "status", void 0);
//# sourceMappingURL=create-activity.dto.js.map