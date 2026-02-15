# 🎯 PAYROLL SALARY TEMPLATES API DOCUMENTATION

## Base URL
```
/api/payroll/templates
```

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>`

---

## 📋 API ENDPOINTS

### 1️⃣ CREATE TEMPLATE
**Endpoint:** `POST /api/payroll/templates/create`

**Purpose:** Create a new salary template with earnings and deductions configuration

**Request Body:**
```json
{
  "template_name": "Senior Developer Template",
  "template_code": "SENIOR_DEV_T1",
  "description": "Template for senior developers",
  "effective_from": "2024-01-01T00:00:00.000Z",
  "status": "ACTIVE",
  "earnings": [
    {
      "component_id": "674a1b2c3d4e5f6g7h8i9j0k",
      "value_type": "FIXED",
      "fixed_amount": 50000,
      "override_allowed": false,
      "calculation_order": 1,
      "is_mandatory": true
    },
    {
      "component_id": "674a1b2c3d4e5f6g7h8i9j0l",
      "value_type": "PERCENTAGE",
      "percentage": 20,
      "override_allowed": true,
      "calculation_order": 2,
      "is_mandatory": false
    }
  ],
  "deductions": [
    {
      "component_id": "674a1b2c3d4e5f6g7h8i9j0m",
      "override_allowed": false
    }
  ],
  "ctc_preview": {
    "annual_ctc": 1200000,
    "monthly_gross": 100000,
    "total_annual_earnings": 1200000,
    "total_monthly_earnings": 100000,
    "total_annual_deductions": 144000,
    "total_monthly_deductions": 12000,
    "annual_net_salary": 1056000,
    "monthly_net_salary": 88000
  },
  "allow_manual_override": false,
  "lock_after_assignment": false,
  "version_control_enabled": true
}
```

**Business Rules Enforced:**
- ✅ Template code must be unique per organization
- ✅ At least ONE earning component required
- ✅ Must have exactly ONE BASIC earning component
- ✅ No duplicate components allowed
- ✅ Total percentage cannot exceed 100%
- ✅ All components must exist and belong to organization
- ✅ If value_type is FIXED → fixed_amount required
- ✅ If value_type is PERCENTAGE → percentage required

**Response (201):**
```json
{
  "status_code": 201,
  "message": "Template created successfully",
  "data": {
    "template_id": "674a1b2c3d4e5f6g7h8i9j0n"
  }
}
```

---

### 2️⃣ GET ALL TEMPLATES
**Endpoint:** `POST /api/payroll/templates/get-all`

**Purpose:** Retrieve all templates with filtering, search, and pagination

**Request Body:**
```json
{
  "status": "ACTIVE",
  "search": "developer",
  "page": "1",
  "limit": "10"
}
```

**Query Parameters:**
- `status` (optional): ACTIVE | INACTIVE
- `search` (optional): Search by template name or code
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "status_code": 200,
  "message": "Success",
  "data": {
    "templates": [
      {
        "_id": "674a1b2c3d4e5f6g7h8i9j0n",
        "template_name": "Senior Developer Template",
        "template_code": "SENIOR_DEV_T1",
        "status": "ACTIVE",
        "total_earnings_count": 5,
        "total_deductions_count": 3,
        "monthly_ctc_preview": 100000,
        "used_by": 12,
        "employees_count": 12,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 48,
      "limit": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

### 3️⃣ GET TEMPLATE BY ID
**Endpoint:** `POST /api/payroll/templates/get`

**Purpose:** Get detailed information about a specific template with populated component details

**Request Body:**
```json
{
  "id": "674a1b2c3d4e5f6g7h8i9j0n"
}
```

**Response (200):**
```json
{
  "status_code": 200,
  "message": "Success",
  "data": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0n",
    "organization_id": "674a1b2c3d4e5f6g7h8i9j0o",
    "template_name": "Senior Developer Template",
    "template_code": "SENIOR_DEV_T1",
    "description": "Template for senior developers",
    "effective_from": "2024-01-01T00:00:00.000Z",
    "status": "ACTIVE",
    "earnings": [
      {
        "component_id": {
          "_id": "674a1b2c3d4e5f6g7h8i9j0k",
          "component_name": "Basic Salary",
          "component_code": "BASIC",
          "component_type": "EARNINGS",
          "calculation_type": "fixed",
          "is_basic": true
        },
        "value_type": "FIXED",
        "fixed_amount": 50000,
        "override_allowed": false,
        "calculation_order": 1,
        "is_mandatory": true
      }
    ],
    "deductions": [
      {
        "component_id": {
          "_id": "674a1b2c3d4e5f6g7h8i9j0m",
          "component_name": "Provident Fund",
          "component_code": "PF",
          "component_type": "DEDUCTIONS",
          "deduction_nature": "statutory"
        },
        "override_allowed": false
      }
    ],
    "ctc_preview": {
      "annual_ctc": 1200000,
      "monthly_gross": 100000,
      "total_annual_earnings": 1200000,
      "total_monthly_earnings": 100000,
      "total_annual_deductions": 144000,
      "total_monthly_deductions": 12000,
      "annual_net_salary": 1056000,
      "monthly_net_salary": 88000
    },
    "allow_manual_override": false,
    "lock_after_assignment": false,
    "version_control_enabled": true,
    "version": 1,
    "employees_count": 12,
    "total_earnings_count": 5,
    "total_deductions_count": 3,
    "used_by": 12,
    "is_deleted": false,
    "created_by": "674a1b2c3d4e5f6g7h8i9j0p",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 4️⃣ UPDATE TEMPLATE
**Endpoint:** `POST /api/payroll/templates/update`

**Purpose:** Update existing template configuration

**Request Body:**
```json
{
  "id": "674a1b2c3d4e5f6g7h8i9j0n",
  "template_name": "Senior Developer Template V2",
  "description": "Updated template",
  "status": "ACTIVE",
  "earnings": [
    {
      "component_id": "674a1b2c3d4e5f6g7h8i9j0k",
      "value_type": "FIXED",
      "fixed_amount": 55000,
      "override_allowed": false,
      "calculation_order": 1,
      "is_mandatory": true
    }
  ],
  "allow_manual_override": true
}
```

**Business Rules Enforced:**
- ✅ **VERSION CONTROL**: If template is assigned to employees AND version_control_enabled = true → Creates NEW VERSION instead of updating
- ✅ Cannot change effective_from if template assigned to employees
- ✅ Template code uniqueness validation (if changing code)
- ✅ Same validation as CREATE for earnings/deductions
- ✅ Must maintain one BASIC component

**Response (200) - Normal Update:**
```json
{
  "status_code": 200,
  "message": "Template updated successfully"
}
```

**Response (201) - Version Created:**
```json
{
  "status_code": 201,
  "message": "New version (v2) created successfully. Old assignments preserved.",
  "data": {
    "template_id": "674a1b2c3d4e5f6g7h8i9j0q",
    "version": 2,
    "parent_template_id": "674a1b2c3d4e5f6g7h8i9j0n"
  }
}
```

---

### 5️⃣ DUPLICATE TEMPLATE
**Endpoint:** `POST /api/payroll/templates/duplicate`

**Purpose:** Create a copy of existing template with new name and code

**Request Body:**
```json
{
  "id": "674a1b2c3d4e5f6g7h8i9j0n",
  "new_template_name": "Junior Developer Template",
  "new_template_code": "JUNIOR_DEV_T1"
}
```

**Business Rules:**
- ✅ Duplicates all configuration (earnings, deductions, settings)
- ✅ New template starts with version 1
- ✅ Status set to INACTIVE
- ✅ employees_count reset to 0
- ✅ effective_from set to current date
- ✅ New template code must be unique

**Response (201):**
```json
{
  "status_code": 201,
  "message": "Template duplicated successfully",
  "data": {
    "template_id": "674a1b2c3d4e5f6g7h8i9j0r",
    "template_name": "Junior Developer Template",
    "template_code": "JUNIOR_DEV_T1"
  }
}
```

---

### 6️⃣ TOGGLE STATUS
**Endpoint:** `POST /api/payroll/templates/toggle-status`

**Purpose:** Toggle template status between ACTIVE and INACTIVE

**Request Body:**
```json
{
  "id": "674a1b2c3d4e5f6g7h8i9j0n"
}
```

**Response (200):**
```json
{
  "status_code": 200,
  "message": "Template inactive",
  "data": {
    "new_status": "INACTIVE"
  }
}
```

---

### 7️⃣ SOFT DELETE
**Endpoint:** `POST /api/payroll/templates/delete`

**Purpose:** Soft delete a template (sets is_deleted flag)

**Request Body:**
```json
{
  "id": "674a1b2c3d4e5f6g7h8i9j0n"
}
```

**Business Rules:**
- ✅ **CANNOT DELETE** if template assigned to employees (employees_count > 0)
- ✅ Soft delete only (is_deleted flag)

**Response (200):**
```json
{
  "status_code": 200,
  "message": "Template deleted successfully"
}
```

**Response (403) - If Assigned:**
```json
{
  "status_code": 403,
  "message": "Cannot delete template. Currently assigned to 12 employee(s)"
}
```

---

## 🔐 BUSINESS LOGIC IMPLEMENTED

### Critical Rules
1. ✅ **Template Code Uniqueness**: Per organization
2. ✅ **Version Control**: Auto-creates new version if assigned to employees
3. ✅ **Basic Component**: Must have exactly ONE BASIC earning
4. ✅ **Component Validation**: All components must exist and be active
5. ✅ **Percentage Limit**: Total earnings percentage ≤ 100%
6. ✅ **Duplicate Prevention**: Cannot add same component twice
7. ✅ **Delete Protection**: Cannot delete if assigned to employees
8. ✅ **Effective Date Lock**: Cannot change if assigned to employees
9. ✅ **Multi-Tenant Isolation**: All operations scoped to organization_id

### Enhanced Features
- 📊 **CTC Preview Calculation**
- 🔄 **Automatic Versioning**
- 📑 **Component Population** (get by ID returns full component details)
- 🔍 **Advanced Filtering** (status, search)
- 📄 **Pagination Support**
- 📈 **Usage Tracking** (employees_count)

---

## 📊 DATA MODEL

### Template Schema Structure
```typescript
{
  _id: ObjectId,
  organization_id: ObjectId,
  template_name: string,
  template_code: string (unique per org),
  description?: string,
  effective_from: Date,
  status: 'ACTIVE' | 'INACTIVE',
  
  earnings: [
    {
      component_id: ObjectId,
      value_type: 'FIXED' | 'PERCENTAGE',
      fixed_amount?: number,
      percentage?: number,
      override_allowed: boolean,
      calculation_order: number,
      is_mandatory: boolean
    }
  ],
  
  deductions: [
    {
      component_id: ObjectId,
      override_allowed: boolean
    }
  ],
  
  ctc_preview: {
    annual_ctc?: number,
    monthly_gross?: number,
    total_annual_earnings: number,
    total_monthly_earnings: number,
    total_annual_deductions: number,
    total_monthly_deductions: number,
    annual_net_salary: number,
    monthly_net_salary: number
  },
  
  allow_manual_override: boolean,
  lock_after_assignment: boolean,
  version_control_enabled: boolean,
  version: number,
  parent_template_id?: ObjectId,
  employees_count: number,
  is_deleted: boolean,
  
  created_by: ObjectId,
  updated_by?: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 IMPLEMENTATION STATUS

### ✅ Completed Features
- [x] Template CRUD operations
- [x] Version control system
- [x] Component validation
- [x] Basic component enforcement
- [x] Duplicate prevention
- [x] Percentage validation
- [x] Delete protection
- [x] Multi-tenant isolation
- [x] Pagination & filtering
- [x] Search functionality
- [x] CTC preview structure
- [x] Usage tracking (employees_count)
- [x] Duplicate template feature
- [x] Status toggle

### 📋 Next Module Dependencies
1. **Employee Assignment Module** - Assign templates to employees
2. **Payroll Settings Module** - PF/ESI/Tax configurations
3. **Run Payroll Module** - Actual payroll calculation engine
4. **Payslip Generation** - Generate payslips from templates
5. **Compliance Reports** - Statutory reports

---

## 🧪 TESTING CHECKLIST

### Create Template Tests
- [ ] Create with valid data
- [ ] Fail on duplicate template code
- [ ] Fail without BASIC component
- [ ] Fail with multiple BASIC components
- [ ] Fail with percentage > 100%
- [ ] Fail with duplicate components
- [ ] Fail with invalid component IDs

### Update Template Tests
- [ ] Normal update (not assigned)
- [ ] Version creation (assigned + version control)
- [ ] Fail on changing effective_from when assigned
- [ ] Fail on invalid component validation

### Delete Template Tests
- [ ] Success when not assigned
- [ ] Fail when assigned to employees

### Duplicate Template Tests
- [ ] Success with unique code
- [ ] Fail with duplicate code
- [ ] Verify all configs copied

---

## 📞 SUPPORT

For any issues or questions, contact the development team.

**Module:** Payroll Templates  
**Version:** 1.0.0  
**Last Updated:** February 2026
