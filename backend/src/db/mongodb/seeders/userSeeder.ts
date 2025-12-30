import { UserService } from '../../../services/concrete/userService';
import { USER_TYPE, GENDER, USER_STATUS } from '../../../constants';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const userService = new UserService();

// First names pool
const firstNames = {
  male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle'],
};

// Last names pool
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark'];

// Country codes
const countryCodes = ['+1', '+44', '+91', '+61', '+81', '+49', '+33', '+86', '+55', '+52'];

/**
 * Generate a random element from an array
 */
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random mobile number
 */
function generateMobile(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Generate username from name
 */
function generateUsername(firstName: string, lastName: string, index: number): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}`;
}

/**
 * Generate yopmail email
 */
function generateYopmailEmail(username: string): string {
  return `${username}@yopmail.com`;
}

/**
 * User seeder - Creates 50+ diverse users
 */
export async function seedUsers() {
  console.log('🌱 Starting user seeder...');

  const users = [];
  let userIndex = 1;

  // Distribution: 25 Admins, 60 Customers, 25 Suppliers
  const userDistribution = [
    { type: USER_TYPE.ADMIN, count: 25 },
    { type: USER_TYPE.CUSTOMER, count: 60 },
    { type: USER_TYPE.SUPPLIER, count: 25 },
  ];

  for (const { type, count } of userDistribution) {
    for (let i = 0; i < count; i++) {
      // Randomly select gender
      const gender = randomElement([GENDER.MALE, GENDER.FEMALE, GENDER.OTHER, GENDER.NONE]);
      
      // Select appropriate first name based on gender
      let firstName: string;
      if (gender === GENDER.MALE) {
        firstName = randomElement(firstNames.male);
      } else if (gender === GENDER.FEMALE) {
        firstName = randomElement(firstNames.female);
      } else {
        firstName = randomElement([...firstNames.male, ...firstNames.female]);
      }

      const lastName = randomElement(lastNames);
      const username = generateUsername(firstName, lastName, userIndex);
      const email = generateYopmailEmail(username);
      const mobile = generateMobile();
      const countryCode = randomElement(countryCodes);

      // Randomly set verification status (80% verified)
      const isEmailVerified = Math.random() > 0.2;
      const isMobileVerified = Math.random() > 0.2;

      // Randomly set status (90% active)
      const status = Math.random() > 0.1 ? USER_STATUS.ACTIVE : USER_STATUS.INACTIVE;

      const userData = {
        firstName,
        lastName,
        username,
        email,
        mobile,
        countryCode,
        password: await bcrypt.hash('Test@123', 10), // Default password for all seeded users
        type,
        gender,
        status,
        isEmailVerified,
        isMobileVerified,
      };

      users.push(userData);
      userIndex++;
    }
  }

  console.log(`📊 Generated ${users.length} users`);
  console.log(`   - ${userDistribution[0].count} Admins`);
  console.log(`   - ${userDistribution[1].count} Customers`);
  console.log(`   - ${userDistribution[2].count} Suppliers`);

  try {

    // Bulk create users
    console.log('💾 Inserting users into database...');
    const createdUsers = await userService.bulkCreate(users);
    
    console.log(`✅ Successfully seeded ${createdUsers.length} users!`);
    console.log('\n📧 All users have yopmail.com email addresses');
    console.log('🔑 Default password for all users: Test@123');
    console.log('\n📝 Sample users:');
    
    // Show sample users from each type
    const sampleAdmin = createdUsers.find((u: any) => u.type === USER_TYPE.ADMIN);
    const sampleCustomer = createdUsers.find((u: any) => u.type === USER_TYPE.CUSTOMER);
    const sampleSupplier = createdUsers.find((u: any) => u.type === USER_TYPE.SUPPLIER);

    if (sampleAdmin) {
      console.log(`   Admin: ${sampleAdmin.email} (${sampleAdmin.firstName} ${sampleAdmin.lastName})`);
    }
    if (sampleCustomer) {
      console.log(`   Customer: ${sampleCustomer.email} (${sampleCustomer.firstName} ${sampleCustomer.lastName})`);
    }
    if (sampleSupplier) {
      console.log(`   Supplier: ${sampleSupplier.email} (${sampleSupplier.firstName} ${sampleSupplier.lastName})`);
    }

  } catch (error: any) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
}

/**
 * Clear all users (except MASTER_ADMIN)
 */
export async function clearUsers() {
  console.log('🗑️  Clearing users...');
  
  try {
    const result = await userService.delete({ 
      type: { $ne: USER_TYPE.MASTER_ADMIN } 
    });
    
    console.log(`✅ Cleared ${result?.deletedCount || 0} users (MASTER_ADMIN preserved)`);
  } catch (error: any) {
    console.error('❌ Error clearing users:', error.message);
    throw error;
  }
}

// Export for use in main seeder
export default {
  seedUsers,
  clearUsers,
};
