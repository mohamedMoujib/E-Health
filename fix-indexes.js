const mongoose = require('mongoose');

async function fixIndexes() {
    try {
        // Try different connection strings
        const connectionStrings = [
            process.env.MONGODB_URI,
            process.env.DATABASE_URL,
            process.env.MONGO_URI,
            'mongodb+srv://3CtjM52TYRcmCQGn:3CtjM52TYRcmCQGn@E-Health.zfysb.mongodb.net/?retryWrites=true&w=majority&appName=E-Health',
            
        ].filter(Boolean);
        
        console.log('Trying to connect with these options:');
        connectionStrings.forEach((str, i) => console.log(`${i + 1}. ${str}`));
        
        let connected = false;
        for (const uri of connectionStrings) {
            try {
                await mongoose.connect(uri);
                console.log(`✅ Connected successfully with: ${uri}`);
                connected = true;
                break;
            } catch (error) {
                console.log(`❌ Failed to connect with: ${uri}`);
            }
        }
        
        if (!connected) {
            throw new Error('Could not connect to MongoDB with any connection string');
        }
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        // Check current indexes
        const indexes = await usersCollection.indexes();
        console.log('\n=== CURRENT INDEXES ===');
        indexes.forEach(index => {
            console.log(`${index.name}: ${JSON.stringify(index.key)}`);
        });
        
        // Check for problematic data first
        const problematicUsers = await usersCollection.find({
            $or: [
                { role: null },
                { role: undefined },
                { roles: { $exists: true } } // Check if there's a "roles" field
            ]
        }).toArray();
        
        console.log('\n=== PROBLEMATIC USERS ===');
        console.log('Users with null/undefined role or "roles" field:', problematicUsers.length);
        problematicUsers.forEach(user => {
            console.log(`ID: ${user._id}, CIN: ${user.cin}, role: ${user.role}, roles: ${user.roles}`);
        });
        
        // Fix any users with null/undefined roles or "roles" field
        if (problematicUsers.length > 0) {
            console.log('\n=== FIXING PROBLEMATIC USERS ===');
            for (const user of problematicUsers) {
                try {
                    const updateData = {};
                    
                    // Fix null/undefined role
                    if (!user.role) {
                        updateData.role = 'patient'; // Set default role
                    }
                    
                    // Remove "roles" field if it exists (typo field)
                    if (user.roles !== undefined) {
                        updateData.$unset = { roles: "" };
                    }
                    
                    if (Object.keys(updateData).length > 0) {
                        await usersCollection.updateOne(
                            { _id: user._id },
                            updateData
                        );
                        console.log(`✅ Fixed user ${user._id}`);
                    }
                } catch (error) {
                    console.log(`❌ Error fixing user ${user._id}: ${error.message}`);
                }
            }
        }
        
        // Drop ALL problematic indexes (including the typo ones)
        const oldIndexes = [
            'cin_1', 
            'cin_1_roles_1',  // The problematic one with typo
            'cin_1_role_1',
            'email_1', 
            'email_1_roles_1',
            'email_1_role_1',
            'phone_1',
            'phone_1_roles_1',
            'phone_1_role_1'
        ];
        console.log('\n=== DROPPING ALL PROBLEMATIC INDEXES ===');
        
        for (const indexName of oldIndexes) {
            try {
                await usersCollection.dropIndex(indexName);
                console.log(`✅ Dropped: ${indexName}`);
            } catch (error) {
                if (error.code === 27) {
                    console.log(`⚠️  ${indexName} doesn't exist`);
                } else {
                    console.log(`❌ Error dropping ${indexName}: ${error.message}`);
                }
            }
        }
        
        // Create new compound indexes with specific names
        console.log('\n=== CREATING NEW COMPOUND INDEXES ===');
        
        try {
            await usersCollection.createIndex({ cin: 1, role: 1 }, { unique: true, name: 'cin_role_unique' });
            console.log('✅ Created: cin + role compound index');
        } catch (error) {
            console.log(`❌ Error creating cin+role index: ${error.message}`);
        }
        
        try {
            await usersCollection.createIndex({ email: 1, role: 1 }, { unique: true, sparse: true, name: 'email_role_unique' });
            console.log('✅ Created: email + role compound index');
        } catch (error) {
            console.log(`❌ Error creating email+role index: ${error.message}`);
        }
        
        try {
            await usersCollection.createIndex({ phone: 1, role: 1 }, { unique: true, name: 'phone_role_unique' });
            console.log('✅ Created: phone + role compound index');
        } catch (error) {
            console.log(`❌ Error creating phone+role index: ${error.message}`);
        }
        
        // Verify final indexes
        const finalIndexes = await usersCollection.indexes();
        console.log('\n=== FINAL INDEXES ===');
        finalIndexes.forEach(index => {
            console.log(`${index.name}: ${JSON.stringify(index.key)}`);
        });
        
        console.log('\n✅ Index migration completed!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed');
    }
}

// Run the fix
fixIndexes();