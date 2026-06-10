-- server/models/schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables and types to ensure a clean slate
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

-- Create custom enum types
CREATE TYPE user_role AS ENUM ('guest', 'host', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'guest',
    avatar_url TEXT,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'user', 'property', 'booking', etc.
    message TEXT NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    property_type VARCHAR(100), -- Added from Implementation Plan
    image_urls TEXT[], -- Changed to array to support multiple images
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    max_guests INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE RESTRICT,
    guest_id UUID REFERENCES users(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'confirmed',
    payment_intent_id VARCHAR(255), -- Added for payment tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Prevent overlapping bookings for the same property
    CONSTRAINT prevent_double_booking EXCLUDE USING gist (
        property_id WITH =,
        daterange(check_in, check_out, '[]') WITH &&
    ) WHERE (status = 'confirmed')
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations table for search suggestions
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(255),
    province VARCHAR(255),
    country VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) UNIQUE NOT NULL, -- e.g. "Paris, France" or "Toronto, Ontario, Canada"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_host ON properties(host_id);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_messages_conversation ON messages(property_id, sender_id, receiver_id);

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General', -- 'Refund', 'Technical', 'Account', 'General'
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Ticket Activities (Replies and Internal Notes)
CREATE TABLE IF NOT EXISTS support_ticket_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'reply', -- 'reply' (public), 'note' (internal)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_activities_ticket ON support_ticket_activities(ticket_id);

-- Platform Settings for global configuration
CREATE TABLE IF NOT EXISTS platform_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Initial seeding for essential settings
INSERT INTO platform_settings (key, value) VALUES 
('platform_fee', '10'),
('site_name', '"LUXESTAY"'),
('maintenance_mode', 'false'),
('allow_registrations', 'true'),
('support_email', '"support@luxestay.com"')
ON CONFLICT (key) DO NOTHING;

-- Payouts table for host earnings management
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL, -- The 90% share
    platform_fee DECIMAL(10, 2) NOT NULL, -- The 10% share
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_payouts_host ON payouts(host_id);
CREATE INDEX idx_payouts_status ON payouts(status);
