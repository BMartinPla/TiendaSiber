const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const images = [
  { name: 'iPhone 16 Pro Max 1TB',        imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { name: 'Samsung Galaxy S25 Ultra',     imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg' },
  { name: 'Xiaomi 15 Pro',                imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15-pro.jpg' },
  { name: 'Google Pixel 10 Pro',          imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-10-pro-.jpg' },
  { name: 'OnePlus 13',                   imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg' },
  { name: 'Motorola Edge 50 Ultra',       imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-ultra.jpg' },
  { name: 'iPhone 16 Plus 256GB',         imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-plus.jpg' },
  { name: 'Samsung Galaxy Z Fold 7',      imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold7.jpg' },
  { name: 'Honor Magic7 Pro',             imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/honor-magic7-pro.jpg' },
  { name: 'Nothing Phone 3',              imageUrl: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-3.jpg' },
]

async function main() {
  let updated = 0
  for (const { name, imageUrl } of images) {
    const product = await prisma.product.findFirst({ where: { name } })
    if (product) {
      await prisma.product.update({ where: { id: product.id }, data: { imageUrl } })
      console.log(`✓ ${name}`)
      updated++
    } else {
      console.log(`✗ ${name} — no encontrado`)
    }
  }
  console.log(`\n${updated} productos actualizados con imagen`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())