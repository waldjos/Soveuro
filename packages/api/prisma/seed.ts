import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

async function main() {
  const hash = await bcrypt.hash('password123', BCRYPT_ROUNDS);

  const doctor1 = await prisma.user.upsert({
    where: { email: 'dr.garcia@soveuro.com' },
    update: {},
    create: {
      email: 'dr.garcia@soveuro.com',
      passwordHash: hash,
      role: 'DOCTOR',
      profile: {
        create: {
          fullName: 'Dra. María García',
          city: 'Madrid',
          bio: 'Especialista en medicina interna con más de 15 años de experiencia.',
        },
      },
      doctor: {
        create: {
          specialty: 'Medicina interna',
          rating: 4.8,
          yearsExp: 15,
          verified: true,
          links: { website: 'https://example.com', linkedIn: 'https://linkedin.com/in/mariagarcia' },
        },
      },
    },
    include: { profile: true, doctor: true },
  });

  const doctor2 = await prisma.user.upsert({
    where: { email: 'dr.martin@soveuro.com' },
    update: {},
    create: {
      email: 'dr.martin@soveuro.com',
      passwordHash: hash,
      role: 'DOCTOR',
      profile: {
        create: {
          fullName: 'Dr. Carlos Martín',
          city: 'Barcelona',
          bio: 'Cardiólogo. Investigación en prevención cardiovascular.',
        },
      },
      doctor: {
        create: {
          specialty: 'Cardiología',
          rating: 4.9,
          yearsExp: 20,
          verified: true,
        },
      },
    },
    include: { profile: true, doctor: true },
  });

  await prisma.user.upsert({
    where: { email: 'admin@soveuro.com' },
    update: {},
    create: {
      email: 'admin@soveuro.com',
      passwordHash: hash,
      role: 'ADMIN',
      profile: { create: { fullName: 'Administrador' } },
    },
  });

  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    await prisma.event.createMany({
      data: [
        {
          title: 'Jornada de salud cardiovascular',
          description: 'Charla y talleres sobre prevención y hábitos saludables.',
          startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Webinar: Nutrición y sistema inmune',
          description: 'Cómo la alimentación refuerza las defensas.',
          startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  console.log('Seed OK: doctors', doctor1.doctor?.id, doctor2.doctor?.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
