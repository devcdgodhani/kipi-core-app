import { seedCategories } from './categorySeeder';
import { seedAttributes } from './attributeSeeder';

export const runSeeders = async () => {
  try {
    await seedCategories();
    await seedAttributes(); // Run after categories are seeded
    // Add other seeders here
  } catch (error) {
    console.error('Error running seeders:', error);
  }
};
