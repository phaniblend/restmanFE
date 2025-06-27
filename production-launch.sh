#!/bin/bash

# 🚀 RestMan Production Launch Script
# Option B + D: Production Setup with Advanced Features

echo "🚀 Starting RestMan Production Launch..."
echo "🎯 Target: Production-ready deployment with advanced AI features"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Environment Check
echo -e "\n${BLUE}📋 Step 1: Environment Check${NC}"
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating template...${NC}"
    cp frontend/env.example frontend/.env.local
    echo -e "${RED}❗ Please update frontend/.env.local with your credentials before continuing${NC}"
    echo -e "${YELLOW}Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
    echo -e "${YELLOW}Optional: OPENAI_API_KEY, TWILIO credentials, SMTP settings${NC}"
    read -p "Press Enter after updating .env.local..."
fi

# Step 2: Dependencies
echo -e "\n${BLUE}📦 Step 2: Installing Dependencies${NC}"
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Step 3: Build Check
echo -e "\n${BLUE}🔨 Step 3: Build Verification${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix errors before deployment${NC}"
    exit 1
fi

# Step 4: Production Options
echo -e "\n${GREEN}✅ Build successful!${NC}"
echo -e "\n${BLUE}🎯 Step 4: Choose Deployment Option${NC}"
echo "1. 🔧 Development Server (test locally first)"
echo "2. 🚀 Deploy to Vercel (recommended)"
echo "3. 📦 Build Static Export (for other hosting)"
echo "4. 🔍 Just show deployment info"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "\n${GREEN}🔧 Starting Development Server...${NC}"
        echo -e "${YELLOW}🌐 Access at: http://localhost:3000${NC}"
        npm run dev
        ;;
    2)
        echo -e "\n${GREEN}🚀 Deploying to Vercel...${NC}"
        echo -e "${YELLOW}📋 Instructions:${NC}"
        echo "1. Install Vercel CLI: npm i -g vercel"
        echo "2. Run: vercel"
        echo "3. Follow prompts to deploy"
        echo "4. Add environment variables in Vercel dashboard"
        echo -e "${BLUE}💡 Auto-deploy on GitHub push once connected${NC}"
        ;;
    3)
        echo -e "\n${GREEN}📦 Building Static Export...${NC}"
        npm run export
        echo -e "${GREEN}✅ Static files ready in ./out/ directory${NC}"
        echo -e "${YELLOW}📋 Upload ./out/ contents to any static hosting${NC}"
        ;;
    4)
        echo -e "\n${BLUE}📊 Deployment Information${NC}"
        ;;
esac

# Step 5: Post-Deployment Checklist
echo -e "\n${BLUE}📋 Post-Deployment Checklist${NC}"
echo "□ Supabase project created and schema deployed"
echo "□ Environment variables configured"
echo "□ Domain name configured (if using custom domain)"
echo "□ SSL certificate active"
echo "□ Test user accounts created"
echo "□ Mobile PWA installation tested"
echo "□ AI features working (if OpenAI key provided)"
echo "□ Notification channels tested (if configured)"

echo -e "\n${GREEN}🎉 RestMan Production Launch Complete!${NC}"
echo -e "\n${BLUE}📈 Expected Results:${NC}"
echo "• 📱 Mobile-first restaurant management"
echo "• 🤖 AI-powered recipe generation"
echo "• 🔔 Real-time alerts and notifications"
echo "• 📊 Yield tracking and waste reduction"
echo "• 💰 Cost optimization insights"
echo "• 🎯 Role-based access control"

echo -e "\n${YELLOW}📞 Need help? Check:${NC}"
echo "• Documentation: backend/deployment-guide.md"
echo "• Supabase dashboard for database issues"
echo "• Vercel dashboard for deployment status"
echo "• Browser console for client-side errors"

echo -e "\n${GREEN}🚀 Your restaurant is now digitally optimized!${NC}" 