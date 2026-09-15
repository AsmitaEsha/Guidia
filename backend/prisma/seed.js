// Seeds one clearly-labeled demo account for local development and
// demonstrations. This is demo data, not production data — see
// GUIDIA_IMPLEMENTATION_PLAN.md's Data Integrity note.
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUser({ email, password, fullName, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`${email} already exists, skipping.`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { fullName, email, passwordHash, role, preferredLanguage: 'en', preference: { create: {} } },
  });
  console.log(`Seeded ${role.toLowerCase()} account: ${email} / ${password}`);
}

async function main() {
  await seedUser({ email: 'demo@guidia.app', password: 'Demo1234', fullName: 'Demo Account', role: 'SENIOR' });
  await seedUser({ email: 'admin@guidia.app', password: 'Admin1234', fullName: 'Admin Account', role: 'ADMIN' });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
