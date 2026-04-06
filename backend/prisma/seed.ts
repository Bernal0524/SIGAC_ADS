import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando orquestación de datos SIGAC...');

  // 1. Limpieza de datos previos (Opcional, para evitar conflictos en desarrollo)
  // await prisma.groupCode.deleteMany({});
  // await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash('admin2026', 10);
  const colaboradorPassword = await bcrypt.hash('equipo2026', 10);

  // 2. Crear a ERICK como ÚNICO COORDINADOR (Admin)
  const erick = await prisma.user.upsert({
    where: { email: 'erick@sigac.com' },
    update: {},
    create: {
      email: 'erick@sigac.com',
      name: 'Erick Admin',
      password: adminPassword,
      role: Role.COORDINADOR,
      sector: 'ADMINISTRACION', // <--- Campo obligatorio según nuestro nuevo schema
    },
  });

  // 3. Crear un Colaborador de prueba (Alexander)
  const alexander = await prisma.user.upsert({
    where: { email: 'alexander@sigac.com' },
    update: {},
    create: {
      email: 'alexander@sigac.com',
      name: 'Alexander Dev',
      password: colaboradorPassword,
      role: Role.COLABORADOR,
      sector: 'IT',
    },
  });

  // 4. Pre-cargar Códigos de Grupo para la Orquestación
  // Esto permite que el sistema tenga códigos válidos desde el inicio
  const codes = [
    { code: 'SIGAC-IT-2026', sector: 'IT', role: Role.COLABORADOR },
    { code: 'SIGAC-FINANZAS-2026', sector: 'FINANZAS', role: Role.COLABORADOR },
  ];

  for (const item of codes) {
    await prisma.groupCode.upsert({
      where: { code: item.code },
      update: {},
      create: {
        code: item.code,
        sector: item.sector,
        role: item.role,
      },
    });
  }

  console.log('-------------------------------------------');
  console.log('✅ SEED COMPLETADO CON ÉXITO');
  console.log(`👤 ADMIN CREADO: ${erick.email}`);
  console.log(`👤 DEV CREADO: ${alexander.email}`);
  console.log(`🔑 CÓDIGOS ACTIVOS: ${codes.map(c => c.code).join(', ')}`);
  console.log('-------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error en el proceso de Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });