import bcrypt from 'bcryptjs';
import { USER_TYPE, USER_STATUS, GENDER, ADDRESS_TYPE, ADDRESS_STATUS } from '../../../constants';
import { userService } from '../../../services/concrete/userService';
import { addressService } from '../../../services/concrete/addressService';

export const seedUsers = async () => {
  console.log('🌱 Seeding users...');
  try {
    // 1. Create Admin User
    await upsertUser({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@kipi.com',
      mobile: '9876543210',
      password: 'password123',
      type: USER_TYPE.ADMIN,
      gender: GENDER.MALE,
      isVerified: true,
      isEmailVerified: true,
    });

    // 2. Create Customers
    const customers = [
      { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@example.com', mobile: '9876543211', gender: GENDER.MALE },
      { firstName: 'Priya', lastName: 'Verma', email: 'priya@example.com', mobile: '9876543212', gender: GENDER.FEMALE },
      { firstName: 'Amit', lastName: 'Patel', email: 'amit@example.com', mobile: '9876543213', gender: GENDER.MALE },
      { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha@example.com', mobile: '9876543214', gender: GENDER.FEMALE },
      { firstName: 'Vikram', lastName: 'Singh', email: 'vikram@example.com', mobile: '9876543215', gender: GENDER.MALE },
    ];

    for (const customer of customers) {
      const user = await upsertUser({
        ...customer,
        password: 'password123',
        type: USER_TYPE.CUSTOMER,
        isVerified: true,
        isEmailVerified: true,
      });

      // Add address for customer
      if (user) {
        await upsertAddress((user as any)._id, {
          name: `${customer.firstName} ${customer.lastName}`,
          mobile: customer.mobile,
          street: '123, Main Street, Near Park',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          type: ADDRESS_TYPE.HOME,
          isDefault: true,
        });
      }
    }

    console.log('✅ User seeding completed.');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

const upsertUser = async (data: any) => {
  let user = await userService.findOne({ email: data.email });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    user = await userService.create({
      ...data,
      password: hashedPassword,
      status: USER_STATUS.ACTIVE,
    });
    console.log(`+ Created user: ${data.firstName} ${data.lastName}`);
  }
  return user;
};

const upsertAddress = async (userId: any, data: any) => {
  const address = await addressService.findOne({ userId, isDefault: true } as any);
  if (!address) {
    await addressService.create({
      userId,
      ...data,
      location: { type: 'Point', coordinates: [72.8777, 19.0760] }, // Default Mumbai coordinates
      status: ADDRESS_STATUS.ACTIVE,
    } as any);
    // console.log(`+ Added address for user: ${data.name}`);
  }
};
