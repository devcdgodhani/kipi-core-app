import { seedCategories } from './categorySeeder';

export const runSeeders = async () => {
  try {
    await seedCategories();
    // Add other seeders here
  } catch (error) {
    console.error('Error running seeders:', error);
  }
};
