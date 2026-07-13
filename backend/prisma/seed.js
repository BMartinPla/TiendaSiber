const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const catRopa = await prisma.category.upsert({
    where: { name: 'Ropa y Accesorios' },
    update: {},
    create: { name: 'Ropa y Accesorios' },
  })
  const catCalzado = await prisma.category.upsert({
    where: { name: 'Calzado' },
    update: {},
    create: { name: 'Calzado' },
  })
  const catElectro = await prisma.category.upsert({
    where: { name: 'Electrónica' },
    update: {},
    create: { name: 'Electrónica' },
  })
  const catMochilas = await prisma.category.upsert({
    where: { name: 'Mochilas y Bolsos' },
    update: {},
    create: { name: 'Mochilas y Bolsos' },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tiendasiper.com' },
    update: {},
    create: {
      name: 'Admin Principal',
      email: 'admin@tiendasiper.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '56912345678',
    },
  })

  const retail = await prisma.user.upsert({
    where: { email: 'cliente@tiendasiper.com' },
    update: {},
    create: {
      name: 'Cliente Minorista',
      email: 'cliente@tiendasiper.com',
      password: hashedPassword,
      role: 'RETAIL',
      phone: '56987654321',
    },
  })

  const wholesale = await prisma.user.upsert({
    where: { email: 'mayorista@tiendasiper.com' },
    update: {},
    create: {
      name: 'Cliente Mayorista',
      email: 'mayorista@tiendasiper.com',
      password: hashedPassword,
      role: 'WHOLESALE',
      phone: '56911223344',
    },
  })

  const products = [
    {
      name: 'Camiseta Algodón Premium',
      description: 'Camiseta de algodón orgánico, corte regular.',
      precioBase: 15990,
      precioMayorista: 11990,
      stock: 50,
      imageUrl: '/images/camiseta-premium.jpg',
      categoryId: catRopa.id,
    },
    {
      name: 'Zapatillas Urbanas Run',
      description: 'Zapatillas ligeras para uso diario.',
      precioBase: 45990,
      precioMayorista: 34990,
      stock: 30,
      imageUrl: '/images/zapatillas-run.jpg',
      categoryId: catCalzado.id,
    },
    {
      name: 'Mochila Ejecutiva 40L',
      description: 'Mochila con compartimento para notebook de 15.6".',
      precioBase: 32990,
      precioMayorista: 25990,
      stock: 20,
      imageUrl: '/images/mochila-ejecutiva.jpg',
      categoryId: catMochilas.id,
    },
    {
      name: 'Reloj Deportivo Smart',
      description: 'Reloj inteligente con monitor cardíaco y GPS.',
      precioBase: 89990,
      precioMayorista: 69990,
      stock: 15,
      imageUrl: '/images/reloj-smart.jpg',
      categoryId: catElectro.id,
    },
    {
      name: 'Audífonos Inalámbricos Pro',
      description: 'Audífonos con cancelación de ruido activa.',
      precioBase: 54990,
      precioMayorista: 42990,
      stock: 25,
      imageUrl: '/images/audifonos-pro.jpg',
      categoryId: catElectro.id,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id || 0 },
      update: {},
      create: product,
    })
  }

  console.log('Seed completado exitosamente')
  console.log('Categorías creadas:')
  console.log(`  - ${catRopa.name}`)
  console.log(`  - ${catCalzado.name}`)
  console.log(`  - ${catElectro.name}`)
  console.log(`  - ${catMochilas.name}`)
  console.log('Usuarios creados (contraseña: admin123):')
  console.log('  - admin@tiendasiper.com (ADMIN)')
  console.log('  - cliente@tiendasiper.com (RETAIL)')
  console.log('  - mayorista@tiendasiper.com (WHOLESALE)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
