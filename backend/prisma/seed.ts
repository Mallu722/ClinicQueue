import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting ClinicQueue database seeding on Neon PostgreSQL...')

  // 1. Create or upsert Clinic
  const clinic = await prisma.clinic.upsert({
    where: { slug: 'shanti-ayush' },
    update: {},
    create: {
      name: 'Shanti Ayush Health Clinic',
      slug: 'shanti-ayush',
      address: 'Vidyanagar OPD Wing, Main Road, Hubli - 580021',
      phone: '+919845012345',
      timezone: 'Asia/Kolkata',
      status: 'ACTIVE',
    },
  })
  console.log(`✅ Clinic established: ${clinic.name} (${clinic.id})`)

  // 2. Hash default password
  const defaultPasswordHash = await bcrypt.hash('Clinic@123', 10)

  // 3. Create Doctors in the database
  const doctorData = [
    {
      name: 'Dr. Ramesh Hegde',
      email: 'doctor@clinicqueue.com',
      phone: '9845011111',
      specialty: 'Senior Physician & Diabetologist',
      qualification: 'MBBS, MD (Internal Medicine)',
      fee: 350,
    },
    {
      name: 'Dr. Ananya Rao',
      email: 'ananya@clinicqueue.com',
      phone: '9845022222',
      specialty: 'Consultant Pediatrician & Child Health',
      qualification: 'MBBS, DCH (Pediatrics)',
      fee: 400,
    },
    {
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh@clinicqueue.com',
      phone: '9845033333',
      specialty: 'Orthopedic & Joint Care Specialist',
      qualification: 'MBBS, MS (Ortho)',
      fee: 450,
    },
    {
      name: 'Dr. Sneha Patil',
      email: 'sneha@clinicqueue.com',
      phone: '9845044445',
      specialty: 'Dermatology & Skin Care',
      qualification: 'MBBS, MD (Dermatology)',
      fee: 400,
    },
  ]

  for (const doc of doctorData) {
    const user = await prisma.user.upsert({
      where: { phone: doc.phone },
      update: {},
      create: {
        email: doc.email,
        phone: doc.phone,
        displayName: doc.name,
        passwordHash: defaultPasswordHash,
        status: 'ACTIVE',
      },
    })

    await prisma.clinicMembership.upsert({
      where: {
        clinicId_userId: {
          clinicId: clinic.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        clinicId: clinic.id,
        userId: user.id,
        role: 'CLINICIAN',
      },
    })

    const doctorRecord = await prisma.doctor.findFirst({
      where: { clinicId: clinic.id, displayName: doc.name },
    })

    if (!doctorRecord) {
      await prisma.doctor.create({
        data: {
          clinicId: clinic.id,
          displayName: doc.name,
          specialization: doc.specialty,
          qualification: doc.qualification,
          consultationFee: doc.fee,
          status: 'AVAILABLE',
        },
      })
    }
  }
  console.log(`✅ ${doctorData.length} Doctors registered into Neon cloud database.`)

  // 4. Create Receptionist Staff
  const receptionistUser = await prisma.user.upsert({
    where: { phone: '9845099999' },
    update: {},
    create: {
      email: 'reception@clinicqueue.com',
      phone: '9845099999',
      displayName: 'Pooja Patil',
      passwordHash: defaultPasswordHash,
      status: 'ACTIVE',
    },
  })

  await prisma.clinicMembership.upsert({
    where: {
      clinicId_userId: {
        clinicId: clinic.id,
        userId: receptionistUser.id,
      },
    },
    update: {},
    create: {
      clinicId: clinic.id,
      userId: receptionistUser.id,
      role: 'RECEPTIONIST',
    },
  })
  console.log(`✅ Reception desk staff seeded: ${receptionistUser.displayName}`)

  // 5. Create Demo Patient Suresh Kumar
  const demoPatient = await prisma.patient.upsert({
    where: {
      clinicId_patientReference: {
        clinicId: clinic.id,
        patientReference: 'MRN-8492',
      },
    },
    update: {},
    create: {
      clinicId: clinic.id,
      patientReference: 'MRN-8492',
      displayName: 'Suresh Kumar',
      phone: '9845044444',
      age: 52,
      gender: 'Male',
      preferredLanguage: 'en',
      whatsappConsent: true,
      status: 'ACTIVE',
    },
  })
  console.log(`✅ Demo patient record seeded: ${demoPatient.displayName} (${demoPatient.patientReference})`)

  console.log('🎉 Database seeding completed successfully on Neon!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
