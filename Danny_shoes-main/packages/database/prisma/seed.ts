import { PrismaClient, UserRole, StoreType, Plan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Tenant demo ──────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'dannyszapatos' },
    update: {},
    create: {
      slug: 'dannyszapatos',
      name: 'Danny Zapatos S.A.S.',
      plan: Plan.PROFESSIONAL,
      settings: {
        currency: 'COP',
        timezone: 'America/Bogota',
        invoicePrefix: 'FAC-',
        taxRate: 0.19,
        thermalPaperWidth: 80,
      },
    },
  });
  console.log(`✅ Tenant: ${tenant.name}`);

  // ── Stores ────────────────────────────────────────────────────────────────
  const bodega = await prisma.store.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'BOD-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'BOD-001',
      name: 'Bodega Central',
      type: StoreType.WAREHOUSE,
      address: 'Calle 80 # 45-23, Bogotá',
      phone: '601-234-5678',
      isCentralWarehouse: true,
      printerConfig: { ip: '192.168.1.100', port: 9100, model: 'Epson TM-T20III' },
    },
  });

  const local1 = await prisma.store.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'LOCAL-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'LOCAL-001',
      name: 'Local Centro',
      type: StoreType.RETAIL,
      address: 'Carrera 7 # 15-45, Bogotá',
      phone: '601-987-6543',
    },
  });

  const local2 = await prisma.store.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'LOCAL-002' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'LOCAL-002',
      name: 'Local Norte',
      type: StoreType.RETAIL,
      address: 'Calle 127 # 13-65, Bogotá',
      phone: '601-456-7890',
    },
  });
  console.log(`✅ Stores: ${bodega.name}, ${local1.name}, ${local2.name}`);

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin2024!', 12);
  const cashierPassword = await bcrypt.hash('Cajero2024!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dannyszapatos.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@dannyszapatos.com',
      passwordHash: adminPassword,
      firstName: 'Danny',
      lastName: 'García',
      role: UserRole.TENANT_ADMIN,
    },
  });

  const gerente = await prisma.user.upsert({
    where: { email: 'gerente@dannyszapatos.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      storeId: local1.id,
      email: 'gerente@dannyszapatos.com',
      passwordHash: adminPassword,
      firstName: 'María',
      lastName: 'López',
      role: UserRole.STORE_MANAGER,
    },
  });

  const cajero = await prisma.user.upsert({
    where: { email: 'cajero@dannyszapatos.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      storeId: local1.id,
      email: 'cajero@dannyszapatos.com',
      passwordHash: cashierPassword,
      firstName: 'Carlos',
      lastName: 'Pérez',
      role: UserRole.CASHIER,
    },
  });

  const bodeguero = await prisma.user.upsert({
    where: { email: 'bodega@dannyszapatos.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      storeId: bodega.id,
      email: 'bodega@dannyszapatos.com',
      passwordHash: cashierPassword,
      firstName: 'Jorge',
      lastName: 'Martínez',
      role: UserRole.WAREHOUSE_OP,
    },
  });
  console.log(`✅ Users: ${admin.email}, ${gerente.email}, ${cajero.email}, ${bodeguero.email}`);

  // ── Supplier ──────────────────────────────────────────────────────────────
  const supplier = await prisma.supplier.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: tenant.id,
      name: 'Calzado Exportar Ltda.',
      nitRut: '900.123.456-7',
      contactEmail: 'ventas@exportar.com',
      phone: '604-321-9876',
      paymentTerms: { days: 30, creditLimit: 50000000 },
    },
  });
  console.log(`✅ Supplier: ${supplier.name}`);

  // ── Products + SKUs ───────────────────────────────────────────────────────
  const productosData = [
    {
      reference: 'REF-001',
      name: 'Zapato Oxford Clásico',
      brand: 'DannyStep',
      color: 'Negro',
      material: 'Cuero genuino',
      costPrice: 85000,
      salePrice: 180000,
      sizes: ['35', '36', '37', '38', '39', '40', '41', '42'],
    },
    {
      reference: 'REF-002',
      name: 'Sandalia Casual Mujer',
      brand: 'DannyStep',
      color: 'Café',
      material: 'Cuero sintético',
      costPrice: 45000,
      salePrice: 95000,
      sizes: ['35', '36', '37', '38', '39'],
    },
    {
      reference: 'REF-003',
      name: 'Tenis Deportivo',
      brand: 'DannyFit',
      color: 'Blanco',
      material: 'Textil + Caucho',
      costPrice: 65000,
      salePrice: 140000,
      sizes: ['38', '39', '40', '41', '42', '43', '44'],
    },
  ];

  for (const p of productosData) {
    const product = await prisma.product.upsert({
      where: { tenantId_reference: { tenantId: tenant.id, reference: p.reference } },
      update: {},
      create: {
        tenantId: tenant.id,
        supplierId: supplier.id,
        reference: p.reference,
        name: p.name,
        brand: p.brand,
        color: p.color,
        material: p.material,
        costPrice: p.costPrice,
        salePrice: p.salePrice,
      },
    });

    for (const size of p.sizes) {
      await prisma.skuVariant.upsert({
        where: { productId_size: { productId: product.id, size } },
        update: {},
        create: {
          productId: product.id,
          size,
          barcode: `${p.reference.replace('REF-', '77012345')}-${size}`,
          minStockAlert: 3,
        },
      });
    }
    console.log(`✅ Product: ${product.reference} — ${product.name} (${p.sizes.length} tallas)`);
  }

  // ── Inventory locations ───────────────────────────────────────────────────
  const locations = [
    { aisle: 'A', rack: '1', level: '1', bin: '1', fullCode: 'A-1-1-1' },
    { aisle: 'A', rack: '1', level: '2', bin: '1', fullCode: 'A-1-2-1' },
    { aisle: 'A', rack: '2', level: '1', bin: '1', fullCode: 'A-2-1-1' },
    { aisle: 'B', rack: '1', level: '1', bin: '1', fullCode: 'B-1-1-1' },
    { aisle: 'B', rack: '2', level: '1', bin: '1', fullCode: 'B-2-1-1' },
  ];

  for (const loc of locations) {
    await prisma.inventoryLocation.upsert({
      where: { storeId_fullCode: { storeId: bodega.id, fullCode: loc.fullCode } },
      update: {},
      create: { storeId: bodega.id, ...loc },
    });
  }
  console.log(`✅ Inventory locations: ${locations.length} ubicaciones en bodega`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de acceso:');
  console.log('   Admin:     admin@dannyszapatos.com   / Admin2024!');
  console.log('   Gerente:   gerente@dannyszapatos.com / Admin2024!');
  console.log('   Cajero:    cajero@dannyszapatos.com  / Cajero2024!');
  console.log('   Bodeguero: bodega@dannyszapatos.com  / Cajero2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
