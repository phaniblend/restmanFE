# 🧪 RestMan Test Users Guide

## 📱 **Test User Accounts**

### **Owner Account**
- **Phone:** `+1234567890`
- **Name:** Restaurant Owner
- **Role:** Owner
- **Access:** Full system access, financial data, user management

### **Manager Account**
- **Phone:** `+1234567891`
- **Name:** Kitchen Manager
- **Role:** Manager
- **Access:** Operations management, financial data, procurement

### **Chef Account**
- **Phone:** `+1234567892`
- **Name:** Head Chef
- **Role:** Chef
- **Access:** Kitchen operations, recipes, inventory (no financial data)

### **Waiter 1 Account**
- **Phone:** `+1234567893`
- **Name:** Waiter John
- **Role:** Waiter
- **Access:** Table management, order taking, customer service

### **Waiter 2 Account**
- **Phone:** `+1234567894`
- **Name:** Waiter Sarah
- **Role:** Waiter
- **Access:** Table management, order taking, customer service

---

## 🔐 **Login Instructions**

1. **Go to the login page**
2. **Enter any test phone number above**
3. **Use OTP:** `123456`
4. **You'll be logged in as the corresponding test user**

---

## 🧪 **Test Scenarios**

### **1. Waiter Table Conflict Test**
**Goal:** Verify that when Waiter 1 allocates a table, Waiter 2 sees it as occupied

**Steps:**
1. Login as **Waiter John** (`+1234567893`)
2. Go to Tables page
3. Allocate Table T01 to a customer
4. Logout
5. Login as **Waiter Sarah** (`+1234567894`)
6. Go to Tables page
7. **Verify:** Table T01 shows as "occupied"

**Expected Result:** Table T01 should appear occupied to Waiter Sarah

---

### **2. Chef Order Receipt Test**
**Goal:** Verify that chef receives orders with waiter and table information

**Steps:**
1. Login as **Waiter John** (`+1234567893`)
2. Go to Tables page
3. Select Table T01
4. Add items to cart (e.g., Butter Chicken, Naan)
5. Place the order
6. Logout
7. Login as **Chef** (`+1234567892`)
8. Go to Chef Dashboard or Orders page
9. **Verify:** Order shows with:
   - Waiter name: "Waiter John"
   - Table: "T01"
   - Order items
   - Order status

**Expected Result:** Chef should see the order with complete waiter and table details

---

### **3. Role-Based Access Test**
**Goal:** Verify financial data restrictions for different roles

**Steps:**

#### **Chef Access Test:**
1. Login as **Chef** (`+1234567892`)
2. Navigate through the app
3. **Verify:** No profit margins, costs, or financial data visible
4. **Verify:** Can see inventory levels, recipes, kitchen operations

#### **Manager Access Test:**
1. Login as **Manager** (`+1234567891`)
2. Navigate through the app
3. **Verify:** Can see profit margins, costs, financial reports
4. **Verify:** Can manage procurement, inventory, operations

#### **Owner Access Test:**
1. Login as **Owner** (`+1234567890`)
2. Navigate through the app
3. **Verify:** Full access to all financial data
4. **Verify:** Can manage users, see all reports, system settings

**Expected Result:** 
- Chef: No financial data visible
- Manager: Financial data visible
- Owner: Full financial access

---

### **4. Multi-Waiter Order Management Test**
**Goal:** Test concurrent waiter operations

**Steps:**
1. Open two browser windows/tabs
2. Login as **Waiter John** in Window 1
3. Login as **Waiter Sarah** in Window 2
4. In Window 1: Allocate Table T02 and place an order
5. In Window 2: Check if Table T02 shows as occupied
6. In Window 2: Allocate Table T03 and place a different order
7. **Verify:** Both waiters can work independently
8. **Verify:** Tables allocated by one waiter show as occupied to the other

**Expected Result:** Waiters can work concurrently without conflicts

---

### **5. Real-Time Updates Test**
**Goal:** Verify real-time synchronization between roles

**Steps:**
1. Login as **Waiter John** in Window 1
2. Login as **Chef** in Window 2
3. In Window 1: Place a new order
4. **Verify:** Order appears immediately in Chef's dashboard in Window 2
5. In Window 2: Update order status to "Preparing"
6. **Verify:** Status update reflects in Waiter's view

**Expected Result:** Real-time updates work across different roles

---

## 🔧 **Technical Testing Notes**

### **Demo Mode Features:**
- All test users work in demo mode
- No real SMS required
- OTP is always `123456`
- Data persists in localStorage during session
- Real-time updates work between browser tabs

### **Data Persistence:**
- Test data is stored in localStorage
- Orders and table status persist during testing
- Logout clears session data
- Each test user has separate data

### **Role Permissions:**
- **Chef:** Cannot see costs, profit margins, or financial data
- **Manager:** Can see financial data but cannot manage users
- **Owner:** Full access to all features
- **Waiter:** Limited to table and order management

---

## 🐛 **Troubleshooting**

### **Login Issues:**
- Ensure you're using the exact phone numbers
- Use OTP `123456` for all test users
- Clear browser cache if needed
- Check browser console for errors

### **Real-Time Issues:**
- Ensure both browser windows are on the same domain
- Check if localStorage is enabled
- Verify no browser extensions are blocking storage

### **Data Issues:**
- Clear localStorage to reset test data
- Refresh page after role changes
- Check browser console for data errors

---

## 📊 **Expected Test Results**

| Test Scenario | Expected Result | Status |
|---------------|----------------|---------|
| Waiter Table Conflict | Table shows occupied to other waiters | ✅ |
| Chef Order Receipt | Orders show waiter and table info | ✅ |
| Role-Based Access | Financial data restricted appropriately | ✅ |
| Multi-Waiter Operations | Concurrent operations work | ✅ |
| Real-Time Updates | Changes sync across roles | ✅ |

---

## 🎯 **Next Steps After Testing**

1. **Verify all scenarios work as expected**
2. **Test edge cases and error conditions**
3. **Validate role permissions are correctly enforced**
4. **Check real-time synchronization**
5. **Test with different browsers/devices**

---

**Happy Testing! 🚀** 