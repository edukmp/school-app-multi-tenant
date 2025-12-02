# Database Scripts Management

This directory contains SQL scripts for managing the application's database schema, maintenance, performance tuning, and diagnostics.

## Directory Structure

### 📁 setup/
Contains scripts for initial database setup and schema creation.
- `01_profiles_setup.sql`: Initial setup for the profiles table and related security policies.

### 📁 migrations/
Contains scripts for schema changes and updates.
- `01_update_profiles_table.sql`: Updates to the profiles table structure.
- `02_add_role_and_policies.sql`: Adds role column and configures RLS policies.

### 📁 maintenance/
Contains scripts for routine maintenance and fixing common data/role issues.
- `fix_admin_role.sql`: Simple SQL script for manual role updates (good for quick fixes).
- `manage_admin_roles.sql`: Creates a database function (`assign_user_role`) to manage roles programmatically. **Recommended for production/scaling.**

### 📁 performance/
Contains scripts for performance optimization, such as RLS (Row Level Security) policies and indexing.
- `fix_rls_performance.sql`: Optimizes RLS policies for better query performance.
- `verify_rls_optimization.sql`: Verifies that RLS optimizations are working as expected.

### 📁 diagnostics/
Contains scripts for checking database state and debugging issues.
- `check_profiles_table.sql`: Diagnostic queries to inspect the state of the profiles table.

## Usage Guide

### Running Scripts via Supabase Dashboard
1. Go to the SQL Editor in your Supabase Dashboard.
2. Copy the content of the script you need.
3. Paste it into the editor and run.

### Maintenance Workflow
If a user reports issues with permissions:
1. Run `diagnostics/check_profiles_table.sql` to verify their current state.
2. **Preferred Method:** Use the `assign_user_role` function (setup via `maintenance/manage_admin_roles.sql`).
   ```sql
   SELECT public.assign_user_role('user@example.com', 'admin');
   ```
3. **Manual Method:** Use `maintenance/fix_admin_role.sql` for one-off manual fixes.

### Performance Tuning
If queries seem slow:
1. Check `performance/verify_rls_optimization.sql` to see query plans.
2. Apply `performance/fix_rls_performance.sql` if optimizations are missing.
