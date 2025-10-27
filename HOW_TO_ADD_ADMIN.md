# 🔐 How to Add Admin - Complete Guide

## 📝 **Method 1: Using MongoDB Compass (Easiest)**

### **Step 1: Open MongoDB Compass**
```
1. Open MongoDB Compass
2. Connect to your database
3. Select database: vyldo (or your database name)
4. Click on "users" collection
```

### **Step 2: Find Your User**
```
1. Click "Filter" button
2. Enter: { "email": "your-email@example.com" }
3. Click "Find"
4. Your user will appear
```

### **Step 3: Edit User**
```
1. Click on your user document
2. Click "Edit Document" (pencil icon)
3. Find the "role" field
4. Change value from "buyer" to "admin"
5. Click "Update"
```

### **Step 4: Add Permissions (Optional)**
```
Add this field to your user:

"permissions": {
  "manageUsers": true,
  "suspendUsers": true,
  "manageGigs": true,
  "suspendGigs": true,
  "manageOrders": true,
  "cancelOrders": true,
  "manageWithdrawals": true,
  "manageWallets": true,
  "viewAnalytics": true,
  "manageTeam": true
}

Click "Update"
```

---

## 📝 **Method 2: Using MongoDB Shell**

### **Step 1: Open MongoDB Shell**
```bash
mongosh
```

### **Step 2: Select Database**
```javascript
use vyldo
```

### **Step 3: Update User to Admin**
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { 
    $set: { 
      role: "admin",
      permissions: {
        manageUsers: true,
        suspendUsers: true,
        manageGigs: true,
        suspendGigs: true,
        manageOrders: true,
        cancelOrders: true,
        manageWithdrawals: true,
        manageWallets: true,
        viewAnalytics: true,
        manageTeam: true
      }
    } 
  }
)
```

### **Step 4: Verify**
```javascript
db.users.findOne({ email: "your-email@example.com" })
```

You should see:
```javascript
{
  _id: ObjectId("..."),
  email: "your-email@example.com",
  role: "admin",
  permissions: { ... }
}
```

---

## 📝 **Method 3: Create Admin Script**

### **Create File: `server/scripts/createAdmin.js`**

```javascript
import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Admin details
    const adminData = {
      email: 'admin@vyldo.com',
      username: 'admin',
      displayName: 'Admin',
      password: await bcrypt.hash('Admin@123', 10),
      role: 'admin',
      permissions: {
        manageUsers: true,
        suspendUsers: true,
        manageGigs: true,
        suspendGigs: true,
        manageOrders: true,
        cancelOrders: true,
        manageWithdrawals: true,
        manageWallets: true,
        viewAnalytics: true,
        manageTeam: true
      },
      profileCompletion: 100
    };

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.permissions = adminData.permissions;
        await existingAdmin.save();
        console.log('✅ User updated to admin!');
      }
    } else {
      // Create new admin
      const admin = await User.create(adminData);
      console.log('✅ Admin created successfully!');
      console.log('Email:', admin.email);
      console.log('Username:', admin.username);
      console.log('Password: Admin@123');
      console.log('Role:', admin.role);
    }

    console.log('\n🎉 Done! You can now login as admin.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
```

### **Add to package.json:**
```json
"scripts": {
  "create-admin": "node server/scripts/createAdmin.js"
}
```

### **Run Script:**
```bash
npm run create-admin
```

---

## 🎯 **Quick Method (If User Already Exists)**

### **Option A: Update Existing User**
```javascript
// In MongoDB Shell
use vyldo

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### **Option B: Using Postman/API**
```
1. Login as that user
2. Get JWT token
3. Manually update in database
```

---

## ✅ **After Making Admin**

### **1. Login:**
```
Email: admin@vyldo.com (or your email)
Password: your-password
```

### **2. Verify Admin Access:**
```
GET /api/admin/stats

Should return dashboard statistics
```

### **3. Add Team Members:**
```
POST /api/admin/team
{
  "email": "team@vyldo.com",
  "username": "team_member",
  "displayName": "Team Member",
  "password": "SecurePass123",
  "permissions": {
    "manageWithdrawals": true,
    "viewAnalytics": true
  }
}
```

---

## 🔐 **Default Admin Credentials**

If you use the script:
```
Email: admin@vyldo.com
Username: admin
Password: Admin@123
Role: admin
```

**⚠️ IMPORTANT: Change password after first login!**

---

## 🎯 **Recommended Approach**

### **For Development:**
```
1. Register a normal user
2. Use MongoDB Compass to change role to "admin"
3. Login and test
```

### **For Production:**
```
1. Use createAdmin.js script
2. Create admin with strong password
3. Login and change password
4. Add team members via admin panel
```

---

## 📋 **Verification Checklist**

After creating admin:

```
✅ User role is "admin"
✅ Can access /api/admin/stats
✅ Can view dashboard
✅ Can add team members
✅ Can suspend users
✅ Can manage gigs
✅ Can approve withdrawals
```

---

## 🚀 **Example: Complete Flow**

### **1. Create Admin:**
```bash
npm run create-admin
```

Output:
```
🔄 Connecting to database...
✅ Connected to database
✅ Admin created successfully!
Email: admin@vyldo.com
Username: admin
Password: Admin@123
Role: admin
🎉 Done! You can now login as admin.
```

### **2. Login:**
```
Go to: http://localhost:5173/login
Email: admin@vyldo.com
Password: Admin@123
```

### **3. Access Admin Panel:**
```
Go to: http://localhost:5173/admin
See dashboard with stats
```

### **4. Add Team Member:**
```
Click "Team Management"
Click "Add Team Member"
Fill form:
  Email: payment@vyldo.com
  Username: payment_team
  Display Name: Payment Team
  Password: SecurePass123
  Permissions: ✅ Manage Withdrawals
Click "Add"
```

### **5. Team Member Login:**
```
Email: payment@vyldo.com
Password: SecurePass123
Can only access withdrawal management
```

---

## 💡 **Tips**

1. **Use Strong Passwords:**
   ```
   Minimum 8 characters
   Include uppercase, lowercase, numbers
   Example: Admin@2024!
   ```

2. **Limit Admin Accounts:**
   ```
   Only 1-2 admin accounts
   Use team members for specific tasks
   ```

3. **Regular Backups:**
   ```
   Backup database regularly
   Keep admin credentials safe
   ```

4. **Monitor Activity:**
   ```
   Check who suspended what
   Track team member actions
   Review logs regularly
   ```

---

## 🎉 **You're Done!**

Admin account created and ready to use!

**Next Steps:**
1. Login as admin
2. Test admin features
3. Add team members
4. Start managing platform

---

**Created by Aftab Irshad** 🚀

**Admin setup complete! Platform ready!** ✨
