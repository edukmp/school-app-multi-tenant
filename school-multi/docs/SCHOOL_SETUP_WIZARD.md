# School Setup Wizard Guide

Welcome to the School Setup Wizard! This guide will walk you through the three simple steps to configure your new school platform.

## Overview
The wizard consists of three main steps:
1.  **Database Configuration**: Setting up your data storage.
2.  **System Initialization**: Installing necessary tables and data.
3.  **Branding & Modules**: Customizing the look and feel of your school.

---

## Step 1: Database Configuration
In this step, you will connect your application to a PostgreSQL database. You have two options:

### Option A: Simple Configuration (Recommended)
Use this if you have standard database credentials.
*   **Host**: The address of your database server (e.g., `localhost` or an IP address).
*   **Database Name**: The name of the database you want to use (e.g., `school_db`).
*   **User**: Your database username (e.g., `postgres`).
*   **Password**: Your database password.

### Option B: Connection String (Advanced)
Use this if you have a full connection URL, often provided by cloud database providers (like Supabase, Neon, or AWS RDS).
*   **Format**: `postgresql://user:password@host:port/dbname`

> **Note**: Ensure your database user has permissions to create tables and schemas.

---

## Step 2: System Initialization
This step prepares the database for use.

1.  **Install Example Data**: Check this box if you want to populate your system with dummy data (students, teachers, classes) for testing purposes. Uncheck it for a clean production install.
2.  **Start Installation**: Click this button to begin the process.
    *   The system will connect to the database.
    *   It will create the necessary schemas and tables.
    *   If selected, it will seed the example data.
3.  **Wait for Completion**: A progress bar will show the status. Once it reaches 100% and says "Database is ready!", you can proceed to the next step.

---

## Step 3: Branding & Modules
Customize the platform to match your school's identity.

### Branding
*   **School Name**: Enter the official name of your school.
*   **Primary Color**: Choose your school's main color. This will be used for buttons, headers, and active states.
*   **Secondary Color**: Choose an accent color.
*   **School Logo**: Upload your school's logo (PNG or JPG recommended).

### Active Modules
Select the features you want to enable for your school:
*   **Academic**: Grading, curriculum, and subject management.
*   **Students**: Student enrollment and profiles.
*   **Teachers**: Staff management.
*   **Finance**: Fee collection and expense tracking.
*   **Library**: Book management and lending.
*   **Transport**: Bus routes and tracking.

---

## Completion
Once you have finished Step 3:
1.  Click the **"Launch Dashboard"** button.
2.  The system will save your configuration.
3.  You will be redirected to the **Admin Dashboard**.

## Troubleshooting
*   **Database Connection Failed**: Double-check your credentials in Step 1. Ensure your database server is running and accessible.
*   **Stuck at 100%**: If the installation finishes but you can't click Next, try refreshing the page.
*   **Logout**: If you need to switch accounts or restart, use the **"Sign Out"** button in the top-right corner.
