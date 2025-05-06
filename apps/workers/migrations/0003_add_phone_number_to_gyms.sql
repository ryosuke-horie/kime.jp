-- Migration to add phone_number column to gyms table
ALTER TABLE gyms ADD COLUMN phone_number TEXT;