import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from '@modules/users/users.service';
import { Role } from '@common/enums/role.enum';

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const adminEmail = 'admin@cloudcure.com';
  const adminPassword = 'Admincloudcure@1';

  try {
    // Check if admin already exists
    const existingAdmin = await usersService.findOneByEmail(adminEmail);

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', adminEmail);
      await app.close();
      return;
    }

    // Create admin user
    const admin = await usersService.create({
      name: 'CloudCure Administrator',
      email: adminEmail,
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 User ID:', admin._id.toString());
    console.log('🎭 Role:', admin.role);

    console.log(
      '\n⚠️  IMPORTANT: Please change the password after first login!\n',
    );
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error creating admin user:', err.message);
    throw error;
  }

  await app.close();
}

seedAdmin()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
