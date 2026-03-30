import { config } from "dotenv";
config(); // load .env before anything else

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("Admin@2112", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@medgallery.com" },
    update: { password: hashedPassword, email: "admin@medgallery.com", name: "Admin" },
    create: {
      email: "admin@medgallery.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user:", admin.email);

  const categories = [
    { name: "X-Ray", slug: "x-ray", description: "X-Ray imaging files" },
    { name: "MRI", slug: "mri", description: "Magnetic Resonance Imaging files" },
    { name: "CT Scan", slug: "ct-scan", description: "Computed Tomography scan files" },
    { name: "Blood Report", slug: "blood-report", description: "Blood test reports and results" },
    { name: "Prescription", slug: "prescription", description: "Doctor prescriptions" },
    { name: "Ultrasound", slug: "ultrasound", description: "Ultrasound imaging files" },
    { name: "ECG", slug: "ecg", description: "Electrocardiogram reports" },
    { name: "Other", slug: "other", description: "Other medical documents" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
