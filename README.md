# 🍽️ RestMan - Restaurant Manager

**Complete restaurant inventory and recipe management system with AI-powered features**

RestMan is a comprehensive, mobile-first restaurant management platform that helps restaurant owners, managers, and chefs optimize inventory, track yields, prevent food waste, and manage recipes with AI assistance.

## 🌟 Key Features

### 📱 **Mobile-First PWA**
- Installable on phones as native app
- Offline functionality for critical operations
- Touch-optimized interface for kitchen use
- Voice commands for hands-free operation

### 🎭 **Role-Based Access Control**
- **👑 Owner**: Strategic insights, cost analysis, staff performance
- **📊 Manager**: Operational oversight, inventory management, all alerts
- **👨‍🍳 Chef**: Recipe customization, batch tracking, AI suggestions

### 🤖 **AI-Powered Intelligence**
- **Smart Recipe Generation**: AI creates initial recipes from menu items
- **Yield Variance Detection**: Alerts on production inconsistencies
- **Stale Food Prevention**: Predict spoilage and suggest menu optimization
- **Smart Procurement**: AI-optimized purchasing recommendations
- **Menu Optimization**: Suggest dishes to use expiring ingredients

### 📊 **Advanced Analytics**
- Real-time inventory tracking
- Yield performance monitoring
- Cost variance analysis
- Waste reduction metrics
- Chef performance insights

### 🚨 **Intelligent Alert System**
- **Stale Risk Alerts**: Prevent food spoilage with predictive analytics
- **Yield Variance Alerts**: Detect theft or recipe deviations
- **Stock Level Monitoring**: Smart reorder point notifications
- **Recipe Modification Tracking**: Alert owners/managers when chefs modify AI recipes

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js PWA   │◄──►│   Supabase API   │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)      │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐
│  Mobile Native  │    │   AI Services    │
│   Experience    │    │  (Recipe Gen)    │
└─────────────────┘    └──────────────────┘
```

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS + DaisyUI
- **State Management**: React Hooks + Supabase Realtime
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Notifications**: React Hot Toast

### **Backend & Database**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RLS
- **Real-time**: WebSocket subscriptions
- **Storage**: Supabase Storage (for images)

### **AI & Analytics**
- **Recipe Generation**: Custom AI engine with Indian cuisine knowledge
- **Analytics**: Built-in dashboard with role-based metrics
- **Notifications**: Smart alert routing system

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

### **1. Clone & Install**
```bash
git clone <repository-url>
cd restman

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies  
cd ../backend
npm install
```

### **2. Environment Setup**

Create `.env.local` in frontend directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Database Setup**

1. Create new Supabase project
2. Run the SQL schema from `backend/supabase-schema.sql`
3. Enable Row Level Security policies

### **4. Run Development**

```bash
# Frontend (Next.js)
cd frontend
npm run dev

# Backend setup is handled by Supabase
```

Visit `http://localhost:3000` to see RestMan in action!

## 📋 **Core Features Breakdown**

### **1. Inventory Management**
- Real-time stock tracking
- Automatic expiry monitoring
- Category-based organization
- Supplier management
- Cost tracking per unit

### **2. Recipe System**
- AI-generated initial recipes
- Chef customization workflow
- Ingredient mapping and costing
- Yield tracking and optimization
- Recipe performance analytics

### **3. Batch Production Tracking**
- Expected vs actual yield monitoring
- Cost per dish calculation
- Chef performance tracking
- Quality rating system
- Variance alert system

### **4. Smart Alerts**
```typescript
// Alert Types & Routing
STALE_RISK → Manager ✓, Chef ✓, Owner ✗
YIELD_VARIANCE → Owner ✓, Manager ✓, Chef ✓  
RECIPE_MODIFICATION → Owner ✓, Manager ✓, Chef ✗
COST_VARIANCE → Owner ✓, Manager ✓, Chef ✗
```

### **5. AI Recipe Generation Workflow**
```
1. Owner/Manager inputs menu items
2. AI generates recipes with ingredient mapping
3. Chef reviews and customizes recipes
4. System tracks modifications and alerts stakeholders
5. Yield calculations based on chef's final recipe
```

## 🎯 **User Workflows**

### **👑 Owner Dashboard**
- Financial overview and profit analysis
- Staff performance metrics
- Recipe modification alerts
- Strategic cost insights

### **📊 Manager Dashboard**
- Operational metrics and inventory status
- All alert types and procurement planning
- Staff activity monitoring
- Recipe approval workflow

### **👨‍🍳 Chef Dashboard**
- AI recipe suggestions for review
- Batch tracking and yield entry
- Ingredient status for cooking
- Personal recipe performance

## 🔐 **Security & Permissions**

- **Row Level Security (RLS)** on all database tables
- **Role-based access control** with granular permissions
- **Audit logging** for all inventory changes
- **Secure API endpoints** with authentication
- **Data encryption** at rest and in transit

## 📊 **Sample Data**

The system includes realistic sample data:
- Indian cuisine recipes (Biryani, Curry, etc.)
- Common restaurant ingredients
- Mock yield variance scenarios
- Sample alert conditions

## 🚀 **Deployment**

### **Frontend (Vercel)**
```bash
cd frontend
npm run build
# Deploy to Vercel (automatic via Git)
```

### **Database (Supabase)**
- Production database already configured
- Automatic scaling and backups
- Built-in monitoring

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see LICENSE file for details.

## 🎉 **Key Benefits for Restaurant Owners**

- **💰 Reduce Food Waste**: AI predicts spoilage, saves 60-80% waste costs
- **📈 Optimize Yields**: Track chef performance, identify training needs
- **🚨 Prevent Theft**: Detect yield variances that indicate misappropriation
- **📱 Mobile Access**: Manage restaurant from anywhere, kitchen-friendly interface
- **🤖 AI Assistant**: Get recipe suggestions, cost optimization, menu planning
- **⚡ Real-time**: Instant notifications, live inventory updates
- **💡 Smart Insights**: Data-driven decisions for procurement and menu planning

## 🆘 **Support**

For support and questions:
- Create an issue in this repository
- Check the documentation wiki
- Contact the development team

---

**Built with ❤️ for restaurant owners who want to optimize their operations with modern technology and AI assistance.** 