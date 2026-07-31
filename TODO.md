# Admin Registration Form - Implementation TODO

## Steps

### Step 1: Backend - Add admin registration support

- [x] File: `RegistrationFormBackend/admin-dashboard.php`
  - Add `ensureAdminAccountsTable()` function to create `admin_accounts` table
  - Add `register` action handler for POST requests
  - Store admin_block in session on login
  - Updated login to support both env-based and DB-based admin accounts

### Step 2: Frontend - Create AdminRegistration.jsx

- [x] File: `src/AdminRegistration.jsx`
  - Registration form with fields: Full Name, Email, Password, Confirm Password, Admin Block (dropdown)
  - Form validation, loading states, success/error messages
  - Consistent styling with AdminLogin.jsx

### Step 3: Frontend - Add route in App.jsx

- [x] File: `src/App.jsx`
  - Import `AdminRegistration` component
  - Add `<Route path="/admin/register" element={<AdminRegistration />} />`

### Step 4: Frontend - Add link in AdminLogin.jsx

- [x] File: `src/AdminLogin.jsx`
  - Add "Create an account / Register as admin" link below the sign-in form

### Step 5: Frontend - Show admin block in Dashboard

- [x] File: `src/RegistrationAdminDashboard.jsx`
  - Display the admin's assigned block in the dashboard header
