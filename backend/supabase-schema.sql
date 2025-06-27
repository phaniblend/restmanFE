-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create restaurants table first without owner_id
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  cuisine_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'chef' CHECK (role IN ('owner', 'manager', 'chef', 'waiter')),
  restaurant_id UUID REFERENCES restaurants(id),
  phone TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Now add owner_id to restaurants
ALTER TABLE restaurants ADD COLUMN owner_id UUID REFERENCES users(id);

-- Enhanced groceries table with perishability tracking
CREATE TABLE IF NOT EXISTS groceries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  category TEXT NOT NULL DEFAULT 'OTHER' CHECK (category IN ('MEAT', 'FISH', 'DAIRY', 'VEGETABLES', 'FRUITS', 'GRAINS', 'SPICES', 'OTHER')),
  procured_date DATE NOT NULL,
  expiry_date DATE,
  initial_amt DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_amt DECIMAL(10,2) NOT NULL DEFAULT 0,
  wastage_amt DECIMAL(10,2) NOT NULL DEFAULT 0,
  wastage_reason TEXT,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  supplier_name TEXT,
  is_perishable BOOLEAN DEFAULT false,
  shelf_life_days INTEGER,
  temperature_storage TEXT DEFAULT 'ROOM_TEMP' CHECK (temperature_storage IN ('FROZEN', 'REFRIGERATED', 'ROOM_TEMP')),
  usage_velocity DECIMAL(8,2), -- avg units used per day
  reorder_level DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI-generated and chef-customized recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'MAIN_COURSE',
  cuisine_type TEXT,
  prep_time_minutes INTEGER DEFAULT 0,
  cook_time_minutes INTEGER DEFAULT 0,
  serving_size INTEGER DEFAULT 1,
  difficulty_level TEXT DEFAULT 'MEDIUM' CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
  price DECIMAL(10,2) DEFAULT 0,
  
  -- AI vs Chef customization tracking
  is_ai_generated BOOLEAN DEFAULT false,
  original_ai_recipe JSONB, -- Store original AI suggestion
  chef_modifications JSONB, -- Track chef changes
  last_modified_by UUID REFERENCES users(id),
  modification_reason TEXT,
  
  -- Recipe performance
  popularity_score DECIMAL(3,2) DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipe-Grocery mapping with chef customization
CREATE TABLE IF NOT EXISTS recipe_grocery_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  grocery_id UUID REFERENCES groceries(id) ON DELETE CASCADE,
  
  -- Original AI suggestion vs Chef's custom amounts
  ai_suggested_qty DECIMAL(8,2), -- AI's original suggestion
  chef_custom_qty DECIMAL(8,2), -- Chef's modification
  quantity_per_order DECIMAL(8,2) NOT NULL, -- Final amount used (chef's if modified, AI's otherwise)
  
  -- Usage tracking
  is_critical_ingredient BOOLEAN DEFAULT false,
  substitution_options TEXT[], -- Alternative ingredients
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, grocery_id)
);

-- Batch production with role-based tracking
CREATE TABLE IF NOT EXISTS batch_production (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) NOT NULL,
  batch_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Yield tracking
  expected_yield INTEGER NOT NULL,
  actual_yield INTEGER NOT NULL,
  variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN expected_yield > 0 THEN ((expected_yield - actual_yield)::DECIMAL / expected_yield * 100)
      ELSE 0
    END
  ) STORED,
  
  -- Personnel tracking
  chef_id UUID REFERENCES users(id) NOT NULL,
  shift_time TEXT DEFAULT 'DAY',
  
  -- Quality & notes
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  notes TEXT,
  
  -- Cost analysis
  total_ingredient_cost DECIMAL(10,2) DEFAULT 0,
  cost_per_dish DECIMAL(8,2) GENERATED ALWAYS AS (
    CASE 
      WHEN actual_yield > 0 THEN (total_ingredient_cost / actual_yield)
      ELSE 0
    END
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced stale alerts with role-based notifications
CREATE TABLE IF NOT EXISTS stale_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  grocery_id UUID REFERENCES groceries(id) NOT NULL,
  
  -- Alert details
  alert_type TEXT NOT NULL CHECK (alert_type IN ('APPROACHING_EXPIRY', 'STALE_RISK', 'EXPIRED', 'YIELD_VARIANCE')),
  severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  quantity_at_risk DECIMAL(10,2) NOT NULL,
  days_until_expiry INTEGER,
  predicted_usage DECIMAL(10,2),
  estimated_loss DECIMAL(10,2) DEFAULT 0,
  
  -- Role-based notifications
  notify_owner BOOLEAN DEFAULT false,
  notify_manager BOOLEAN DEFAULT true,
  notify_chef BOOLEAN DEFAULT true,
  
  -- Alert management
  alert_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_action TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipe modification alerts (when chef changes AI recipes)
CREATE TABLE IF NOT EXISTS recipe_modification_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) NOT NULL,
  modified_by UUID REFERENCES users(id) NOT NULL,
  
  -- Modification details
  modification_type TEXT NOT NULL CHECK (modification_type IN ('INGREDIENT_CHANGE', 'QUANTITY_CHANGE', 'PROCESS_CHANGE', 'COMPLETE_OVERRIDE')),
  original_data JSONB,
  modified_data JSONB,
  reason TEXT,
  
  -- Impact analysis
  cost_impact DECIMAL(10,2) DEFAULT 0,
  yield_impact_estimate DECIMAL(5,2) DEFAULT 0,
  
  -- Notification tracking
  notified_owner BOOLEAN DEFAULT false,
  notified_manager BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Monthly planning with role hierarchy
CREATE TABLE IF NOT EXISTS monthly_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) NOT NULL,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  
  -- Planning data
  planned_orders INTEGER NOT NULL DEFAULT 0,
  allocation_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Approval workflow
  created_by UUID REFERENCES users(id) NOT NULL,
  approved_by UUID REFERENCES users(id),
  approval_status TEXT DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, recipe_id, month_year)
);

-- Sales tracking
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) NOT NULL,
  
  -- Sales data
  orders_sold INTEGER NOT NULL DEFAULT 0,
  orders_returned INTEGER DEFAULT 0,
  wastage INTEGER DEFAULT 0,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Performance metrics
  customer_rating DECIMAL(3,2),
  preparation_time_minutes INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Grocery usage log for tracking consumption
CREATE TABLE IF NOT EXISTS grocery_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  grocery_id UUID REFERENCES groceries(id) NOT NULL,
  batch_id UUID REFERENCES batch_production(id),
  
  -- Usage details
  quantity_used DECIMAL(10,2) NOT NULL,
  usage_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  used_by UUID REFERENCES users(id) NOT NULL,
  purpose TEXT, -- 'COOKING', 'WASTE', 'SAMPLING', etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu items for customer ordering
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  recipe_id UUID REFERENCES recipes(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'MAIN_COURSE',
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  cuisine_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table for waiter interface
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  table_number TEXT NOT NULL,
  waiter_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Recipe suggestions (before chef customization)
CREATE TABLE IF NOT EXISTS ai_recipe_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  
  -- Menu context
  menu_item_name TEXT NOT NULL,
  cuisine_type TEXT,
  dish_category TEXT,
  
  -- AI generated recipe
  suggested_recipe JSONB NOT NULL,
  suggested_ingredients JSONB NOT NULL,
  estimated_cost DECIMAL(10,2),
  estimated_prep_time INTEGER,
  
  -- Chef response
  chef_status TEXT DEFAULT 'PENDING' CHECK (chef_status IN ('PENDING', 'ACCEPTED', 'MODIFIED', 'REJECTED')),
  chef_feedback TEXT,
  final_recipe_id UUID REFERENCES recipes(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Procurement orders (manager's order bag)
CREATE TABLE IF NOT EXISTS procurement_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  ordered_by UUID REFERENCES users(id) NOT NULL,
  
  -- Order details
  total_cost DECIMAL(10,2) NOT NULL,
  supplier_name TEXT,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expected_delivery TIMESTAMP WITH TIME ZONE,
  
  -- Order status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ORDERED', 'DELIVERED', 'CANCELLED')),
  
  -- Items in order (stored as JSON for simplicity)
  order_items JSONB NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_groceries_restaurant_category ON groceries(restaurant_id, category);
CREATE INDEX idx_groceries_expiry_date ON groceries(expiry_date) WHERE is_perishable = true;
CREATE INDEX idx_recipes_restaurant ON recipes(restaurant_id);
CREATE INDEX idx_batch_production_date ON batch_production(batch_date);
CREATE INDEX idx_stale_alerts_unresolved ON stale_alerts(restaurant_id, resolved) WHERE resolved = false;
CREATE INDEX idx_sales_date ON sales(sale_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE groceries ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_grocery_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE stale_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_modification_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recipe_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- For now, we'll create simple policies that allow access
-- These will be updated when we implement proper auth
CREATE POLICY "Users temporary access" ON users
  FOR ALL USING (true);

CREATE POLICY "Restaurants temporary access" ON restaurants
  FOR ALL USING (true);

CREATE POLICY "Groceries temporary access" ON groceries
  FOR ALL USING (true);

CREATE POLICY "Recipes temporary access" ON recipes
  FOR ALL USING (true);

CREATE POLICY "Recipe grocery map temporary access" ON recipe_grocery_map
  FOR ALL USING (true);

CREATE POLICY "Batch production temporary access" ON batch_production
  FOR ALL USING (true);

CREATE POLICY "Stale alerts temporary access" ON stale_alerts
  FOR ALL USING (true);

CREATE POLICY "Recipe modification alerts temporary access" ON recipe_modification_alerts
  FOR ALL USING (true);

CREATE POLICY "Monthly plan temporary access" ON monthly_plan
  FOR ALL USING (true);

CREATE POLICY "Sales temporary access" ON sales
  FOR ALL USING (true);

CREATE POLICY "Grocery usage log temporary access" ON grocery_usage_log
  FOR ALL USING (true);

CREATE POLICY "AI recipe suggestions temporary access" ON ai_recipe_suggestions
  FOR ALL USING (true);

CREATE POLICY "Menu items temporary access" ON menu_items
  FOR ALL USING (true);

CREATE POLICY "Orders temporary access" ON orders
  FOR ALL USING (true);

CREATE POLICY "Order items temporary access" ON order_items
  FOR ALL USING (true);

-- Create trigger functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groceries_updated_at BEFORE UPDATE ON groceries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for multi-cuisine menu items
INSERT INTO menu_items (id, restaurant_id, name, description, category, price, is_available, image_url, cuisine_type, created_at, updated_at)
VALUES
  (gen_random_uuid(), NULL, 'Butter Chicken', 'Classic Indian chicken curry', 'Main Course', 12.99, true, NULL, 'Indian', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Chicken Biryani', 'Aromatic rice with chicken', 'Main Course', 13.99, true, NULL, 'Indian', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Paneer Tikka Masala', 'Paneer in creamy tomato sauce', 'Main Course', 11.99, true, NULL, 'Indian', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Dal Makhani', 'Slow-cooked black lentils', 'Main Course', 9.99, true, NULL, 'Indian', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Samosa', 'Crispy pastry with spiced potatoes', 'Appetizers', 3.99, true, NULL, 'Indian', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Masala Chai', 'Spiced Indian tea', 'Beverages', 2.49, true, NULL, 'Indian', NOW(), NOW()),

  (gen_random_uuid(), NULL, 'Chicken Fried Rice', 'Fried rice with chicken and vegetables', 'Main Course', 10.99, true, NULL, 'Chinese', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Veg Chow Mein', 'Stir-fried noodles with vegetables', 'Main Course', 9.99, true, NULL, 'Chinese', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Spring Rolls', 'Crispy rolls with veggie filling', 'Appetizers', 4.99, true, NULL, 'Chinese', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Sweet & Sour Chicken', 'Chicken in sweet and sour sauce', 'Main Course', 11.99, true, NULL, 'Chinese', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Green Tea', 'Traditional Chinese green tea', 'Beverages', 2.99, true, NULL, 'Chinese', NOW(), NOW()),

  (gen_random_uuid(), NULL, 'Margherita Pizza', 'Classic Italian pizza with tomatoes and cheese', 'Main Course', 12.49, true, NULL, 'Italian', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Pasta Alfredo', 'Creamy Alfredo pasta', 'Main Course', 11.99, true, NULL, 'Italian', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Bruschetta', 'Grilled bread with tomato and basil', 'Appetizers', 5.99, true, NULL, 'Italian', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Tiramisu', 'Coffee-flavored Italian dessert', 'Desserts', 6.99, true, NULL, 'Italian', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Espresso', 'Strong Italian coffee', 'Beverages', 2.99, true, NULL, 'Italian', NOW(), NOW()),

  (gen_random_uuid(), NULL, 'Tacos', 'Mexican tortillas with fillings', 'Main Course', 10.49, true, NULL, 'Mexican', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Burrito', 'Flour tortilla with meat and beans', 'Main Course', 11.49, true, NULL, 'Mexican', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Nachos', 'Tortilla chips with cheese and salsa', 'Appetizers', 6.49, true, NULL, 'Mexican', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Churros', 'Fried-dough pastry with sugar', 'Desserts', 4.99, true, NULL, 'Mexican', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Horchata', 'Sweet rice milk drink', 'Beverages', 3.49, true, NULL, 'Mexican', NOW(), NOW()),

  (gen_random_uuid(), NULL, 'Pad Thai', 'Stir-fried rice noodle dish', 'Main Course', 12.99, true, NULL, 'Thai', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Green Curry', 'Spicy Thai green curry', 'Main Course', 13.49, true, NULL, 'Thai', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Satay', 'Grilled meat skewers', 'Appetizers', 7.49, true, NULL, 'Thai', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Mango Sticky Rice', 'Sweet sticky rice with mango', 'Desserts', 5.99, true, NULL, 'Thai', NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Thai Iced Tea', 'Sweetened Thai tea with milk', 'Beverages', 3.49, true, NULL, 'Thai', NOW(), NOW()); 