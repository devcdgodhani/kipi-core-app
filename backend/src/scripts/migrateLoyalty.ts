import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { UserModel } from '../db/mongodb/models/userModel';
import { walletService } from '../services/concrete/walletService';
import { walletTransactionService } from '../services/concrete/walletTransactionService';
import { 
    WALLET_TRANSACTION_TYPE, 
    WALLET_SOURCE_TYPE, 
    WALLET_CREATED_BY 
} from '../constants/walletTransaction';

const migrate = async () => {
    try {
        console.log('🚀 Starting Loyalty Migration...');
        
        if (!process.env.MONGO_DB_CONNECTION_URL) {
            throw new Error('MONGO_DB_CONNECTION_URL is not defined in .env');
        }

        await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL, {
            dbName: process.env.MONGO_DB_NAME,
        });
        console.log('✅ MongoDB Connected');

        const users = await UserModel.find({ loyaltyPoints: { $gt: 0 } });
        console.log(`Found ${users.length} users with loyalty points.`);

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
             console.log(`Processing user ${user.email} (${user._id}). Points: ${user.loyaltyPoints}`);
             try {
                 const amount = user.loyaltyPoints;
                 
                 // Credit Wallet
                 // This ensures wallet exists and updates balance
                 // We pass description to metadata as per recent walletService updates
                 const wallet = await walletService.creditWallet(
                     user._id as string, 
                     amount, 
                     { description: 'Migration from Loyalty Points' }
                 );

                 // Create Transaction Record
                 // Using createTransaction to ensure full record history
                 await walletTransactionService.createTransaction({
                    walletId: (wallet as any)._id.toString(),
                    userId: user._id as string,
                    transactionType: WALLET_TRANSACTION_TYPE.CREDIT,
                    sourceType: WALLET_SOURCE_TYPE.LOYALTY_MIGRATION,
                    amount: amount,
                    balanceBefore: wallet.availableBalance - amount,
                    balanceAfter: wallet.availableBalance,
                    description: 'Migration from Loyalty Points',
                    createdBy: WALLET_CREATED_BY.SYSTEM
                 });

                 // Reset Loyalty Points
                 user.loyaltyPoints = 0;
                 await user.save();
                 
                 console.log(`   ✅ Migrated ${amount} points for ${user.email}`);
                 successCount++;
             } catch (err) {
                 console.error(`   ❌ Failed to migrate user ${user.email}:`, err);
                 failCount++;
             }
        }

        console.log(`\n✨ Migration Complete. Success: ${successCount}, Failed: ${failCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed', error);
        process.exit(1);
    }
};

migrate();
