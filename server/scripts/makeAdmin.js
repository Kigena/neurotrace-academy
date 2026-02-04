import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const makeAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.error('❌ User not found with email:', email);
            console.log('💡 Make sure the user has registered first!');
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`✅ ${user.name} (${user.email}) is already an admin!`);
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ ${user.name} (${user.email}) is now an admin!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

// Get email from command line
const email = process.argv[2] || 'kipropayub@gmail.com';

if (!email) {
    console.error('Usage: node makeAdmin.js user@example.com');
    process.exit(1);
}

console.log(`🔄 Making ${email} an admin...`);
makeAdmin(email);
