# RESTMAN UAT Test Paths & Installation Guide

## 📱 How to Install RESTMAN as an App (PWA)

You can install RESTMAN directly from your browser on your phone—no app store needed!

### For Android (Chrome, Edge, Brave, etc.):
1. Open [https://restman-fe.vercel.app](https://restman-fe.vercel.app) in your browser.
2. Tap the three-dot menu (⋮) in the top-right corner.
3. Tap **"Add to Home screen"** or **"Install app"**.
4. Confirm the install. The RESTMAN icon will appear on your home screen.

### For iPhone (Safari):
1. Open [https://restman-fe.vercel.app](https://restman-fe.vercel.app) in Safari.
2. Tap the **Share** button (the square with an arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm and tap **Add**. The RESTMAN icon will appear on your home screen.

---

## Test User Credentials

| Role     | Phone Number   | OTP     | Restaurant ID |
|----------|---------------|---------|--------------|
| Owner    | +911111111111  | 123456  | 1            |
| Manager  | +912222222222  | 123456  | 1            |
| Chef     | +913333333333  | 123456  | 1            |
| Waiter 1 | +914444444444  | 123456  | 1            |
| Waiter 2 | +915555555555  | 123456  | 1            |

---

## Login Path
- **Login Page:** `/en-US/login` (replace `en-US` with your language/locale if needed)

---

## Main Navigation/Test Paths by Role

| Role     | Dashboard/Home                | Orders/Tasks                | Menu/Inventory           | Customizer/Premium        | Admin/Analytics           | Profile/Settings          |
|----------|------------------------------|-----------------------------|--------------------------|---------------------------|---------------------------|---------------------------|
| Owner    | `/en-US/owner/analytics`     | `/en-US/owner/branches`     | `/en-US/menu`            | `/en-US/customizer`       | `/en-US/admin/customizations` | `/en-US/profile`      |
| Manager  | `/en-US/manager/procurement` | `/en-US/owner/branches`     | `/en-US/inventory`       | `/en-US/customizer`       | `/en-US/admin/customizations` | `/en-US/profile`      |
| Chef     | `/en-US/chef/dashboard`      | `/en-US/chef/orders`        | `/en-US/menu`            | N/A                       | N/A                       | `/en-US/profile`          |
| Waiter   | `/en-US/waiter/tables`       | `/en-US/chef/orders`        | `/en-US/menu`            | N/A                       | N/A                       | `/en-US/profile`          |
| Demo Premium | `/en-US/demo-premium`     |                             |                          | `/en-US/customizer`       |                           |                           |

---

## Feature/Scenario Checklist

- **Owner**
  - View analytics, manage branches, access all admin and customizer features
- **Manager**
  - Manage procurement, branches, inventory, access customizer and admin customizations
- **Chef**
  - View dashboard, manage orders, view menu (no profit margin)
- **Waiter**
  - Manage tables, view orders, view menu
- **Demo Premium**
  - Explore premium features and overlays
- **Admin Customizer**
  - Manage customization requests: `/en-US/admin/customizations`

---

## Notes
- Replace `en-US` in the paths with your desired locale (e.g., `es`, `hi`).
- All test users use OTP: `123456`.
- Use the Language Selector to test i18n.
- For customization requests, use `/en-US/customizer` as Owner/Manager.

---

**Happy Testing!** 