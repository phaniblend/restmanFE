# RestMan - Professional Restaurant Management System 🍽️

A production-ready, mobile-first restaurant management system designed for US restaurants. Built with Next.js 15, TypeScript, and TailwindCSS.

![RestMan Banner](https://via.placeholder.com/1200x400/f97316/ffffff?text=RestMan+Restaurant+Management+System)

## 🚀 Features

### Role-Based Access Control
- **Owner**: Complete system access, user management, business analytics
- **Manager**: Operations oversight, staff management, reports
- **Chef**: Kitchen operations, inventory tracking, wastage logging
- **Waiter**: Table management, order taking, billing

### Core Functionality
- 📊 **Real-time Dashboard** - Live statistics and performance metrics
- 📦 **Inventory Management** - Track stock levels with visual indicators
- 👨‍🍳 **Recipe Management** - AI-powered recipe generation and customization
- 🍽️ **Table Management** - Real-time table status and order tracking
- 📱 **PWA Ready** - Install as mobile app for tablet/phone use
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations

### Smart Features
- 🤖 AI-powered menu suggestions based on cuisine type
- 📊 Automatic wastage tracking and reporting
- 🔔 Smart alerts for low stock and anomalies
- 📈 Business analytics and performance metrics
- 🌐 Multi-cuisine support (Indian, Chinese, American, etc.)

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + DaisyUI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/restman.git
cd restman/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3500](http://localhost:3500) in your browser

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts and set your environment variables in Vercel dashboard

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 📱 PWA Installation

The app is PWA-ready and can be installed on mobile devices:

1. Open the app in Chrome/Edge on mobile
2. Tap the menu (⋮) and select "Add to Home screen"
3. The app will install and be available offline

## 🎯 Usage Guide

### Initial Setup
1. Navigate to `/setup` to configure your restaurant
2. Complete the 5-step setup process:
   - Restaurant details
   - Cuisine selection (multi-select supported)
   - Menu creation with AI suggestions
   - Recipe customization
   - User management

### Daily Operations

#### For Chefs:
- Start shift from dashboard
- Check live stock warnings
- Log wastage (burnt/returned items)
- Request stock from manager
- View AI-suggested specials

#### For Managers:
- Review operations dashboard
- Approve/deny stock requisitions
- Monitor audit logs
- Generate reports
- Manage suppliers

#### For Owners:
- View business snapshot
- Approve large purchases
- Monitor all alerts
- Manage users
- Access full analytics

#### For Waiters:
- Manage table status
- Take orders
- Generate bills
- Handle customer requests

## 🔧 Configuration

### Customize Theme
Edit `tailwind.config.js` to modify the color scheme:
```js
theme: {
  extend: {
    colors: {
      primary: '#f97316', // Orange
      secondary: '#dc2626', // Red
    }
  }
}
```

### Add Custom Cuisines
Extend the cuisine types in `src/app/setup/page.tsx`:
```typescript
const cuisineTypes = [
  { id: 'custom', name: 'Custom Cuisine', icon: '🍴', desc: 'Your description' },
  // ... existing cuisines
]
```

## 📊 API Integration

The app is designed to work with a REST API. Key endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/inventory` - Fetch inventory
- `POST /api/orders` - Create order
- `GET /api/analytics` - Business metrics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspired by modern restaurant management best practices
- Icons by [Lucide](https://lucide.dev)
- UI components from [DaisyUI](https://daisyui.com)

## 📞 Support

For support, email support@restman.app or join our Slack channel.

---

Built with ❤️ for the restaurant industry 