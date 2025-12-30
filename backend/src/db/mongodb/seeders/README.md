# Database Seeders

## Overview
This directory contains database seeders for populating the database with test data.

## Available Seeders

### User Seeder
Generates 55 diverse users across different user types:
- **15 Admins** - Administrative users
- **25 Customers** - Regular customers
- **15 Suppliers** - Supplier accounts

**Features:**
- All users have `@yopmail.com` email addresses for easy testing
- Default password: `Test@123` for all seeded users
- Realistic names from a pool of common first and last names
- Random gender distribution
- Random country codes and mobile numbers
- 80% of users are email/mobile verified
- 90% of users are in ACTIVE status
- MASTER_ADMIN users are never affected by seeders

## Usage

### Seed Database
Populate the database with test users:
```bash
yarn seed
# or
npm run seed
```

### Clear Data
Remove all seeded users (preserves MASTER_ADMIN):
```bash
yarn seed:clear
# or
npm run seed:clear
```

### Fresh Seed
Clear existing data and seed fresh:
```bash
yarn seed:fresh
# or
npm run seed:fresh
```

## Sample Output

```
🚀 Starting database seeders...

✅ Connected to MongoDB

═══════════════════════════════════════
  SEEDING DATABASE
═══════════════════════════════════════

🌱 Starting user seeder...
📊 Generated 55 users
   - 15 Admins
   - 25 Customers
   - 15 Suppliers
💾 Inserting users into database...
✅ Successfully seeded 55 users!

📧 All users have yopmail.com email addresses
🔑 Default password for all users: Test@123

📝 Sample users:
   Admin: john.smith1@yopmail.com (John Smith)
   Customer: mary.johnson2@yopmail.com (Mary Johnson)
   Supplier: robert.williams3@yopmail.com (Robert Williams)

═══════════════════════════════════════
  ✅ SEEDING COMPLETED SUCCESSFULLY!
═══════════════════════════════════════
```

## Testing with Yopmail

All seeded users have `@yopmail.com` email addresses. To access emails:

1. Go to [yopmail.com](https://yopmail.com)
2. Enter the email address (e.g., `john.smith1@yopmail.com`)
3. View all emails sent to that address

**Note:** Yopmail is a temporary email service that doesn't require registration and is perfect for testing.

## Default Credentials

- **Email:** Any user from the seeded list (e.g., `john.smith1@yopmail.com`)
- **Password:** `Test@123`

## User Distribution

| User Type | Count | Percentage |
|-----------|-------|------------|
| Admin     | 15    | 27%        |
| Customer  | 25    | 45%        |
| Supplier  | 15    | 27%        |
| **Total** | **55**| **100%**   |

## Data Characteristics

- **Names:** Realistic first and last names from common name pools
- **Usernames:** Generated as `firstname.lastname{index}`
- **Emails:** `{username}@yopmail.com`
- **Mobile:** Random 10-digit numbers
- **Country Codes:** Random from pool (+1, +44, +91, +61, +81, +49, +33, +86, +55, +52)
- **Gender:** Random distribution (MALE, FEMALE, OTHER, NONE)
- **Verification:** 80% verified (both email and mobile)
- **Status:** 90% ACTIVE, 10% INACTIVE

## Important Notes

⚠️ **Safety Features:**
- Seeders will skip if users already exist in the database
- MASTER_ADMIN users are never deleted or modified
- Clear operation only removes non-MASTER_ADMIN users

⚠️ **Development Only:**
- These seeders are for development and testing purposes only
- Do not run in production environments
- Always use environment-specific configurations

## Adding New Seeders

To add a new seeder:

1. Create a new file in this directory (e.g., `productSeeder.ts`)
2. Export `seed` and `clear` functions
3. Import and call in `index.ts`
4. Update this README with usage instructions

Example structure:
```typescript
export async function seedProducts() {
  // Seeding logic
}

export async function clearProducts() {
  // Clearing logic
}

export default {
  seedProducts,
  clearProducts,
};
```
