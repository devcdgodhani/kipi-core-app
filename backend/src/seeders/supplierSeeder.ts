import mongoose from 'mongoose';
import { USER_TYPE } from '../constants';
import { UserModel } from '../db/mongodb/models/userModel';

export const seedSuppliers = async () => {
  console.log('🌱 Seeding suppliers...');

  const suppliers = [
    {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      username: 'supplier_rajesh',
      email: 'rajesh.supplier@example.com',
      mobile: '9876543210',
      countryCode: '+91',
      type: USER_TYPE.SUPPLIER,
      gender: 'MALE',
      isMobileVerified: true,
      isEmailVerified: true,
      isVerified: true,
      status: 'ACTIVE',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // hashed password
    },
    {
      firstName: 'Priya',
      lastName: 'Sharma',
      username: 'supplier_priya',
      email: 'priya.supplier@example.com',
      mobile: '9876543211',
      countryCode: '+91',
      type: USER_TYPE.SUPPLIER,
      gender: 'FEMALE',
      isMobileVerified: true,
      isEmailVerified: true,
      isVerified: true,
      status: 'ACTIVE',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
    },
    {
      firstName: 'Amit',
      lastName: 'Patel',
      username: 'supplier_amit',
      email: 'amit.supplier@example.com',
      mobile: '9876543212',
      countryCode: '+91',
      type: USER_TYPE.SUPPLIER,
      gender: 'MALE',
      isMobileVerified: true,
      isEmailVerified: true,
      isVerified: true,
      status: 'ACTIVE',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
    },
  ];

  const createdSuppliers = await UserModel.insertMany(suppliers);
  console.log(`✅ Created ${createdSuppliers.length} suppliers`);
  
  return createdSuppliers;
};
