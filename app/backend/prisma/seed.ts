import { PrismaClient, Role, AmbulanceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const coordinador = await prisma.user.upsert({
    where: { email: 'coordinador@ambureview.local' },
    update: {},
    create: {
      email: 'coordinador@ambureview.local',
      passwordHash: hashedPassword,
      name: 'Alicia Coordinadora',
      role: Role.COORDINADOR,
    },
  });

  const usuario = await prisma.user.upsert({
    where: { email: 'usuario@ambureview.local' },
    update: {},
    create: {
      email: 'usuario@ambureview.local',
      passwordHash: hashedPassword,
      name: 'Carlos Usuario',
      role: Role.USUARIO,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ambureview.local' },
    update: {},
    create: {
      email: 'admin@ambureview.local',
      passwordHash: hashedPassword,
      name: 'Admin Sistema',
      role: Role.ADMIN,
    },
  });

  console.log('✅ Users created');

  // Create ambulances
  const ambulancia1 = await prisma.ambulance.upsert({
    where: { code: 'AMB001' },
    update: {},
    create: {
      code: 'AMB001',
      name: 'Ambulancia 01',
      plate: 'XYZ 123',
      model: 'Mercedes Sprinter',
      year: 2022,
      type: AmbulanceType.SVB,
      lastKnownKilometers: 10500,
    },
  });

  const ambulancia2 = await prisma.ambulance.upsert({
    where: { code: 'AMB002' },
    update: {},
    create: {
      code: 'AMB002',
      name: 'Ambulancia 02',
      plate: 'ABC 789',
      model: 'Ford Transit',
      year: 2021,
      type: AmbulanceType.SVB,
      lastKnownKilometers: 22300,
    },
  });

  const svb1 = await prisma.ambulance.upsert({
    where: { code: 'SVB001' },
    update: {},
    create: {
      code: 'SVB001',
      name: 'SVB B001',
      plate: 'SVB-001',
      model: 'Furgoneta SVB',
      year: 2023,
      type: AmbulanceType.SVB,
      lastKnownKilometers: 5200,
    },
  });

  // Assign user to ambulance
  await prisma.user.update({
    where: { id: usuario.id },
    data: { assignedAmbulanceId: ambulancia1.id },
  });

  console.log('✅ Ambulances created');

  // Create material categories
  const categoryMedicamentos = await prisma.materialCategory.upsert({
    where: { name: 'Medicamentos' },
    update: {},
    create: {
      name: 'Medicamentos',
      color: '#ef4444',
    },
  });

  const categoryEquipos = await prisma.materialCategory.upsert({
    where: { name: 'Equipos Médicos' },
    update: {},
    create: {
      name: 'Equipos Médicos',
      color: '#3b82f6',
    },
  });

  const categoryConsumibles = await prisma.materialCategory.upsert({
    where: { name: 'Consumibles' },
    update: {},
    create: {
      name: 'Consumibles',
      color: '#10b981',
    },
  });

  console.log('✅ Material categories created');

  // Create materials
  const material1 = await prisma.material.upsert({
    where: { id: 'material-1' },
    update: {},
    create: {
      id: 'material-1',
      name: 'Adrenalina 1mg/1ml',
      unit: 'mg/ml',
      critical: true,
      categoryId: categoryMedicamentos.id,
    },
  });

  const material2 = await prisma.material.upsert({
    where: { id: 'material-2' },
    update: {},
    create: {
      id: 'material-2',
      name: 'Desfibrilador Externo Automático',
      unit: 'unidad',
      critical: true,
      categoryId: categoryEquipos.id,
    },
  });

  const material3 = await prisma.material.upsert({
    where: { id: 'material-3' },
    update: {},
    create: {
      id: 'material-3',
      name: 'Vendas Estériles',
      unit: 'paquete',
      critical: false,
      categoryId: categoryConsumibles.id,
    },
  });

  console.log('✅ Materials created');

  // Create inventory items
  const inventory1 = await prisma.inventoryItem.upsert({
    where: { id: 'inventory-1' },
    update: {},
    create: {
      id: 'inventory-1',
      ambulanceId: ambulancia1.id,
      materialId: material1.id,
      batch: 'ADR2024001',
      qty: 10,
      location: 'Mochila Principal (Rojo)',
      minStock: 5,
      expiryDate: new Date('2025-12-31'),
      status: 'OK',
    },
  });

  const inventory2 = await prisma.inventoryItem.upsert({
    where: { id: 'inventory-2' },
    update: {},
    create: {
      id: 'inventory-2',
      ambulanceId: ambulancia1.id,
      materialId: material2.id,
      qty: 1,
      location: 'Compartimento Principal',
      minStock: 1,
      status: 'OK',
    },
  });

  const inventory3 = await prisma.inventoryItem.upsert({
    where: { id: 'inventory-3' },
    update: {},
    create: {
      id: 'inventory-3',
      ambulanceId: ambulancia1.id,
      materialId: material3.id,
      batch: 'VEN2024001',
      qty: 50,
      location: 'Cajón Lateral Superior',
      minStock: 20,
      expiryDate: new Date('2024-12-31'),
      status: 'OK',
    },
  });

  console.log('✅ Inventory items created');

  // Create checklist template
  const template = await prisma.checklistTemplate.upsert({
    where: { id: 'template-daily' },
    update: {},
    create: {
      id: 'template-daily',
      name: 'Revisión Diaria del Vehículo',
      periodicity: 'DAILY',
      active: true,
    },
  });

  // Create checklist items
  const items = [
    { label: 'Pastillas de Freno (Delanteras)', type: 'OKKO', category: 'Frenos', order: 1 },
    { label: 'Líquido de Frenos (Nivel y Estado)', type: 'OKKO', category: 'Frenos', order: 2 },
    { label: 'Presión Neumático Delantero Izquierdo', type: 'NUMBER', category: 'Neumáticos', order: 3 },
    { label: 'Luces de Cruce (Cortas)', type: 'OKKO', category: 'Luces', order: 4 },
    { label: 'Nivel de Aceite Motor', type: 'OKKO', category: 'Motor', order: 5 },
  ];

  for (const item of items) {
    await prisma.checklistItem.upsert({
      where: { id: `item-${item.order}` },
      update: {},
      create: {
        id: `item-${item.order}`,
        templateId: template.id,
        label: item.label,
        type: item.type,
        required: true,
        order: item.order,
        category: item.category,
      },
    });
  }

  console.log('✅ Checklist template created');

  // Create spaces for ampulario
  const space1 = await prisma.space.upsert({
    where: { name: 'Espacio Principal' },
    update: {},
    create: {
      name: 'Espacio Principal',
    },
  });

  const space2 = await prisma.space.upsert({
    where: { name: 'Espacio Secundario' },
    update: {},
    create: {
      name: 'Espacio Secundario',
    },
  });

  console.log('✅ Spaces created');

  // Create ampulario materials
  const ampularioMaterial1 = await prisma.ampularioMaterial.upsert({
    where: { id: 'amp-1' },
    update: {},
    create: {
      id: 'amp-1',
      spaceId: space1.id,
      name: 'Adrenalina 1mg/1ml',
      dose: '1',
      unit: 'mg/ml',
      quantity: 10,
      route: 'IV/IM',
      expiryDate: new Date('2025-12-31'),
      minStockLevel: 5,
    },
  });

  const ampularioMaterial2 = await prisma.ampularioMaterial.upsert({
    where: { id: 'amp-2' },
    update: {},
    create: {
      id: 'amp-2',
      spaceId: space1.id,
      name: 'Salbutamol Neb.',
      dose: '5',
      unit: 'mg',
      quantity: 20,
      route: 'Nebulizador',
      expiryDate: new Date('2024-10-01'),
      minStockLevel: 10,
    },
  });

  console.log('✅ Ampulario materials created');

  // Create USVB kits
  const kit1 = await prisma.uSVBKit.upsert({
    where: { number: 1 },
    update: {},
    create: {
      number: 1,
      name: 'Mochila Pediátrica',
      iconName: 'ToyBrick',
      genericImageHint: 'pediatric supplies',
    },
  });

  const kit2 = await prisma.uSVBKit.upsert({
    where: { number: 2 },
    update: {},
    create: {
      number: 2,
      name: 'Mochila Adulto',
      iconName: 'BriefcaseMedical',
      genericImageHint: 'adult supplies',
    },
  });

  // Create USVB kit materials
  const kitMaterials = [
    { kitId: kit1.id, name: 'Mascarilla RCP Pediátrica', quantity: 2, targetQuantity: 2 },
    { kitId: kit1.id, name: 'Cánula Orofaringea Pediátrica', quantity: 3, targetQuantity: 3 },
    { kitId: kit2.id, name: 'Mascarilla RCP Adulto', quantity: 1, targetQuantity: 1 },
    { kitId: kit2.id, name: 'Cánula Orofaringea Adulto', quantity: 2, targetQuantity: 2 },
  ];

  for (const material of kitMaterials) {
    await prisma.uSVBKitMaterial.create({
      data: {
        kitId: material.kitId,
        name: material.name,
        quantity: material.quantity,
        targetQuantity: material.targetQuantity,
        status: material.quantity >= material.targetQuantity ? 'ok' : 'low',
      },
    });
  }

  console.log('✅ USVB kits created');

  // Create sample incidents
  const incident1 = await prisma.incident.create({
    data: {
      ambulanceId: ambulancia1.id,
      inventoryItemId: inventory1.id,
      type: 'EXPIRED',
      severity: 'HIGH',
      title: 'Material próximo a caducar',
      description: 'Adrenalina caduca en 30 días',
      status: 'OPEN',
      responsibleId: coordinador.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  console.log('✅ Sample incidents created');

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'CREATE',
      tableName: 'User',
      recordId: coordinador.id,
      payload: { email: coordinador.email, role: coordinador.role },
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script',
    },
  });

  console.log('✅ Audit logs created');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('👑 Admin: admin@ambureview.local / password123');
  console.log('👨‍💼 Coordinador: coordinador@ambureview.local / password123');
  console.log('👤 Usuario: usuario@ambureview.local / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
