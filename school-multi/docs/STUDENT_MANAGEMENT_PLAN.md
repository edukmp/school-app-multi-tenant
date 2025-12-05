# Student Management Feature - Implementation Plan

## 📋 Overview
Complete CRUD feature for Student Management with multi-tenant support.

## ✅ Completed
1. ✅ Database Schema (`database/setup/04_students_table.sql`)
2. ✅ TypeScript Types (`src/types/index.ts`)

## 🚀 Implementation Steps

### Step 1: Create Service Layer
**File**: `src/services/studentService.ts`

Create CRUD functions:
- `getStudents(tenantId, filters?)` - List with pagination
- `getStudentById(id)` - Get single student
- `createStudent(data)` - Add new student
- `updateStudent(id, data)` - Update student
- `deleteStudent(id)` - Delete student

### Step 2: Create List View Component
**File**: `src/pages/admin/students/StudentsList.tsx`

Features:
- Data table with sorting
- Search & filter (by class, status, name)
- Pagination
- Action buttons (View, Edit, Delete)
- Add Student button
- Export to Excel/PDF

### Step 3: Create Form Component
**File**: `src/pages/admin/students/StudentForm.tsx`

Features:
- Multi-step form or tabbed layout:
  - Tab 1: Personal Info (NIS, Name, Gender, Birth, Religion)
  - Tab 2: Contact (Phone, Email, Address)
  - Tab 3: Academic (Class, Major, Year)
  - Tab 4: Parents (Father, Mother, Guardian)
- Form validation
- Photo upload
- Save & Cancel buttons

### Step 4: Create Detail View Component
**File**: `src/pages/admin/students/StudentDetail.tsx`

Features:
- Display all student information
- Edit & Delete buttons
- Student photo
- Tab layout for organized view
- Back button

### Step 5: Create Styling
**File**: `src/styles/students.scss`

Styling for:
- Table layout
- Form layout
- Cards
- Responsive design

### Step 6: Add Routing
**File**: `src/App.tsx`

Add routes:
```tsx
<Route path="/admin/students" element={<StudentsList />} />
<Route path="/admin/students/add" element={<StudentForm />} />
<Route path="/admin/students/:id" element={<StudentDetail />} />
<Route path="/admin/students/:id/edit" element={<StudentForm />} />
```

### Step 7: Update Dashboard
**File**: `src/pages/admin/AdminDashboard.tsx`

Replace:
```tsx
onClick={() => alert('Add Student feature coming soon!')}
```

With:
```tsx
onClick={() => navigate('/admin/students/add')}
```

### Step 8: Run Database Migration
Execute SQL:
```bash
# Connect to Supabase
psql postgres://user:pass@host:5432/dbname

# Run migration
\i database/setup/04_students_table.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy content of `04_students_table.sql`
3. Execute

## 📦 Required Dependencies
Already installed (verify in package.json):
- `react-router-dom` - Routing
- `lucide-react` - Icons
- `@supabase/supabase-js` - Database

May need to add:
```bash
npm install react-hook-form
npm install date-fns  # For date formatting
```

## 🎨 UI/UX Considerations

### List View
- Use table with sticky header
- Show: Photo, NIS, Name, Class, Status
- Sort by: Name, NIS, Class
- Filter by: Status, Class, Academic Year
- Pagination: 20 items per page

### Form
- Use controlled inputs
- Real-time validation
- Required fields marked with *
- NIS auto-generate option
- Date picker for birth_date
- Dropdown for: gender, religion, status

### Detail View
- Card layout
- Profile picture prominent
- Organized tabs
- Print-friendly layout

## 🔐 Security (Already Implemented)
- RLS policies ensure tenant isolation
- Only admins can create/edit/delete
- All users in tenant can view

## 📊 Data Validation Rules

### Required Fields
- `nis` (unique per tenant)
- `full_name`
- `status`

### Optional but Recommended
- `class`
- `nisn`
- `gender`
- `father_name` or `mother_name`

### Format Validations
- `email`: Valid email format
- `phone`: 10-15 digits
- `nis`: Alphanumeric, max 50 chars
- `birth_date`: Not in future

## 🧪 Testing Checklist
- [ ] Create student
- [ ] List students (pagination works)
- [ ] Search/filter students
- [ ] View student detail
- [ ] Edit student
- [ ] Delete student
- [ ] Verify RLS (can't see other tenant's students)
- [ ] Form validation works
- [ ] Responsive on mobile

## 📈 Future Enhancements
- Bulk import from Excel
- Student report cards
- Attendance tracking
- Grade management
- Student card printing
- Parent portal integration

## 🔄 Next Actions
1. Run database migration (`04_students_table.sql`)
2. Create `studentService.ts`
3. Create `StudentsList.tsx`
4. Create `StudentForm.tsx`
5. Create `StudentDetail.tsx`
6. Add routing
7. Test thoroughly

---

**Need Help?**
Ask me to:
- "Create studentService.ts"
- "Create StudentsList component"
- "Create StudentForm component"
- "Create StudentDetail component"
- "Create students.scss"

One at a time for better code quality! 🚀
