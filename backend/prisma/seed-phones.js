const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const catCelulares = await prisma.category.upsert({
    where: { name: 'Teléfonos' },
    update: {},
    create: { name: 'Teléfonos' },
  })

  const phones = [
    {
      name: 'iPhone 16 Pro Max 1TB',
      description: 'Apple A18 Pro, 8GB RAM, pantalla Super Retina XDR 6.9", triple cámara 48MP, Titanio.',
      precioBase: 1899990,
      precioMayorista: 1599990,
      precioCosto: 1299990,
      stock: 10,
      categoryId: catCelulares.id,
    },
    {
      name: 'Samsung Galaxy S25 Ultra',
      description: 'Snapdragon 8 Gen 4, 12GB RAM, pantalla Dynamic AMOLED 2X 6.8", cámara 200MP, S Pen.',
      precioBase: 1599990,
      precioMayorista: 1349990,
      precioCosto: 1099990,
      stock: 12,
      categoryId: catCelulares.id,
    },
    {
      name: 'Xiaomi 15 Pro',
      description: 'Snapdragon 8 Gen 4, 16GB RAM, pantalla AMOLED 6.73", triple cámara Leica 50MP, 5400mAh.',
      precioBase: 899990,
      precioMayorista: 749990,
      precioCosto: 599990,
      stock: 15,
      categoryId: catCelulares.id,
    },
    {
      name: 'Google Pixel 10 Pro',
      description: 'Tensor G5, 16GB RAM, pantalla LTPO OLED 6.7", cámara 50MP + 48MP ultrawide + 48MP telephoto.',
      precioBase: 1099990,
      precioMayorista: 919990,
      precioCosto: 749990,
      stock: 8,
      categoryId: catCelulares.id,
    },
    {
      name: 'OnePlus 13',
      description: 'Snapdragon 8 Gen 4, 16GB RAM, pantalla AMOLED 6.82" 120Hz, cámara Hasselblad 50MP, 6000mAh.',
      precioBase: 799990,
      precioMayorista: 669990,
      precioCosto: 549990,
      stock: 10,
      categoryId: catCelulares.id,
    },
    {
      name: 'Motorola Edge 50 Ultra',
      description: 'Snapdragon 8s Gen 3, 12GB RAM, pantalla pOLED 6.7" 165Hz, cámara 200MP, carga 125W.',
      precioBase: 699990,
      precioMayorista: 579990,
      precioCosto: 469990,
      stock: 14,
      categoryId: catCelulares.id,
    },
    {
      name: 'iPhone 16 Plus 256GB',
      description: 'Apple A18, 8GB RAM, pantalla Super Retina XDR 6.7", doble cámara 48MP, aluminio.',
      precioBase: 1399990,
      precioMayorista: 1179990,
      precioCosto: 959990,
      stock: 10,
      categoryId: catCelulares.id,
    },
    {
      name: 'Samsung Galaxy Z Fold 7',
      description: 'Snapdragon 8 Gen 4, 12GB RAM, pantalla plegable Dynamic AMOLED 7.6", triple cámara 50MP, S Pen.',
      precioBase: 2199990,
      precioMayorista: 1899990,
      precioCosto: 1549990,
      stock: 5,
      categoryId: catCelulares.id,
    },
    {
      name: 'Honor Magic7 Pro',
      description: 'Snapdragon 8 Gen 4, 16GB RAM, pantalla OLED 6.8" 120Hz, cámara 200MP con IA, 5850mAh.',
      precioBase: 949990,
      precioMayorista: 799990,
      precioCosto: 649990,
      stock: 9,
      categoryId: catCelulares.id,
    },
    {
      name: 'Nothing Phone 3',
      description: 'Snapdragon 8s Gen 3, 12GB RAM, pantalla OLED 6.7" 120Hz, doble cámara 50MP, interfaz Glyph LED.',
      precioBase: 599990,
      precioMayorista: 499990,
      precioCosto: 399990,
      stock: 12,
      categoryId: catCelulares.id,
    },
  ]

  for (const phone of phones) {
    await prisma.product.upsert({
      where: { id: phone.id || 0 },
      update: {},
      create: phone,
    })
  }

  console.log('Seed de teléfonos completado')
  console.log(`Categoría: ${catCelulares.name}`)
  console.log(`${phones.length} teléfonos agregados:`)
  phones.forEach((p) => console.log(`  - ${p.name} ($${p.precioBase.toLocaleString('es-CL')})`))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })