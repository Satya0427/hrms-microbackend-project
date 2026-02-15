# 🎯 EMPLOYEE SALARY ASSIGNMENT API DOCUMENTATION

## Base URL
```
/api/payroll/employee-assignment
```

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>`

---

## 📋 API ENDPOINTS

### 1️⃣ ASSIGN SALARY TO EMPLOYEE
**Endpoint:** `POST /api/payroll/employee-assignment/assign`

**Purpose:** Assign a salary template to an employee with CTC configuration

**Request Body:**
```json
{
  "employee_id": "674a1b2c3d4e5f6g7h8i9j0k",
  "template_id": "674a1b2c3d4e5f6g7h8i9j0l",
  "annual_ctc": 1200000,
  "monthly_gross": 100000,
  "effective_from": "2024-02-01T00:00:00.000Z",
  "payroll_start_month": "2024-02",
  "status": "ACTIVE"
}
```

**Business Rules Enforced:**
- ✅ Only ONE active salary per employee per organization
- ✅ Template must be ACTIVE and have earnings components
- ✅ Monthly Gross ≈ Annual CTC / 12 (with 2% tolerance)
- ✅ All components in template must exist
- ✅ Earnings snapshot created with calculated values
- ✅ Deductions snapshot created with calculated values
- ✅ CTC validates against total earnings (2% tolerance)
- ✅ Template employees_count incremented

**Response (201):**
```json
{
  "status_code": 201,
  "message": "Salary assigned successfully",
  "data": {
    "assignment_id": "674a1b2c3d4e5f6g7h8i9j0m",
    "version": 1,
    "annual_ctc": 1200000,
    "monthly_gross": 100000
  }
}
```

**Error (409) - Already Assigned:**
```json
{
  "status_code": 409,
  "message": "Employee already has an active salary assignment. Revise instead of creating new."
}
```

---

### 2️⃣ GET EMPLOYEE CURRENT SALARY
**Endpoint:** `POST /api/payroll/employee-assignment/get-salary`

**Purpose:** Get the currently active salary assignment for an employee

**Request Body:**
```json
{
  "employee_id": "674a1b2c3d4e5f6g7h8i9j0k"
}
```

**Response (200):**
```json
{
  "status_code": 200,
  "message": "Success",
  "data": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0m",
    "organization_id": "674a1b2c3d4e5f6g7h8i9j0n",
    "employee_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "template_id": {
      "_id": "674a1b2c3d4e5f6g7h8i9j0l",
      "template_name": "Senior Developer Template",
      "template_code": "SENIOR_DEV_T1",
      "status": "ACTIVE"
    },
    "annual_ctc": 1200000,
    "monthly_gross": 100000,
    "effective_from": "2024-02-01T00:00:00.000Z",
    "status": "ACTIVE",
    "version": 1,
    "earnings_snapshot": [
      {
        "component_id": "674a1b2c3d4e5f6g7h8i9j0o",
        "component_code": "BASIC",
        "component_name": "Basic Salary",
        "value_type": "fixed",
        "fixed_amount": 50000,
        "monthly_value": 50000,
        "annual_value": 600000,
        "override_allowed": false,
        "is_mandatory": true,
        "calculation_order": 1
      },
      {
        "component_code": "HRA",
        "component_name": "House Rent Allowance",
        "value_type": "percentage",
        "percentage": 20,
        "monthly_value": 10000,
        "annual_value": 120000,
        "override_allowed": true,
        "is_mandatory": false,
        "calculation_order": 2
      }
    ],
    "deductions_snapshot": [
      {
        "component_code": "PF",
        "component_name": "Provident Fund",
        "deduction_nature": "statutory",
        "calculation_type": "percentage_of_basic",
        "percentage": 12,
        "monthly_value": 6000,
        "override_allowed": false
      }
    ],
    "earnings_summary": {
      "total_monthly": 100000,
      "total_annual": 1200000,
      "count": 5
    },
    "deductions_summary": {
      "total_monthly": 12000,
      "count": 3
    },
    "net_salary": {
      "monthly": 88000,
      "annual": 1056000
    },
    "is_active": true,
    "is_deleted": false,
    "createdAt": "2024-02-01T00:00:00.000Z",
    "updatedAt": "2024-02-01T00:00:00.000Z"
  }
}
```

---

### 3️⃣ REVISE SALARY (Create New Version)
**Endpoint:** `POST /api/payroll/employee-assignment/revise`

**Purpose:** Revise salary without deleting history (creates new version)

**Request Body:**
```json
{
  "employee_id": "674a1b2c3d4e5f6g7h8i9j0k",
  "template_id": "674a1b2c3d4e5f6g7h8i9j0l",
  "annual_ctc": 1320000,
  "monthly_gross": 110000,
  "effective_from": "2024-06-01T00:00:00.000Z",
  "earnings_overrides": [
    {
      "component_id": "674a1b2c3d4e5f6g7h8i9j0o",
      "monthly_value": 55000,
      "annual_value": 660000
    }
  ],
  "reason": "Promotion and salary increment"
}
```

**Business Rules Enforced:**
- ✅ Current assignment must exist and be ACTIVE
- ✅ Effective date cannot be before current assignment date
- ✅ Current assignment marked as REVISED and deactivated (is_active = false)
- ✅ New assignment created with version incremented
- ✅ Full snapshots recreated with new values
- ✅ Component overrides applied if provided
- ✅ Payroll history preserved (old assignment not deleted)

**Response (201):**
```json
{
  "status_code": 201,
  "message": "Salary revised successfully",
  "data": {
    "assignment_id": "674a1b2c3d4e5f6g7h8i9j0p",
    "version": 2,
    "previous_version": 1
  }
}
```

---

### 4️⃣ GET SALARY HISTORY
**Endpoint:** `POST /api/payroll/employee-assignment/history`

**Purpose:** Get complete salary revision history for an employee

**Request Body:**
```json
{
  "employee_id": "674a1b2c3d4e5f6g7h8i9j0k",
  "page": "1",
  "limit": "10"
}
```

**Response (200):**
```json
{
  "status_code": 200,
  "message": "Success",
  "data": {
    "history": [
      {
        "_id": "674a1b2c3d4e5f6g7h8i9j0p",
        "version": 2,
        "status": "ACTIVE",
        "effective_from": "2024-06-01T00:00:00.000Z",
        "annual_ctc": 1320000,
        "monthly_gross": 110000,
        "is_active": true,
        "createdAt": "2024-06-01T00:00:00.000Z"
      },
      {
        "_id": "674a1b2c3d4e5f6g7h8i9j0m",
        "version": 1,
        "status": "REVISED",
        "effective_from": "2024-02-01T00:00:00.000Z",
        "annual_ctc": 1200000,
        "monthly_gross": 100000,
        "is_active": false,
        "createdAt": "2024-02-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 2,
      "limit": 10,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

---

### 5️⃣ GET ALL ASSIGNMENTS (Employee List)
**Endpoint:** `POST /api/payroll/employee-assignment/list`

**Purpose:** Get list of all salary assignments with employee details

**Request Body:**
```json
{
  "status": "ASSIGNED",
  "search": "John Doe",
  "department_id": "674a1b2c3d4e5f6g7h8i9j0q",
  "page": "1",
  "limit": "10"
}
```

**Query Parameters:**
- `status` (optional): ASSIGNED | NOT_ASSIGNED | ALL
- `search` (optional): Search by employee name or ID
- `department_id` (optional): Filter by department
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "status_code": 200,
  "message": "Success",
  "data": {
    "assignments": [
      {
        "_id": "674a1b2c3d4e5f6g7h8i9j0m",
        "employee_id": {
          "_id": "674a1b2c3d4e5f6g7h8i9j0k",
          "employee_name": "John Doe",
          "employee_id": "EMP001",
          "department_id": "674a1b2c3d4e5f6g7h8i9j0q",
          "designation_id": "674a1b2c3d4e5f6g7h8i9j0r"
        },
        "template_id": {
          "_id": "674a1b2c3d4e5f6g7h8i9j0l",
          "template_name": "Senior Developer Template",
          "template_code": "SENIOR_DEV_T1"
        },
        "annual_ctc": 1200000,
        "monthly_gross": 100000,
        "effective_from": "2024-02-01T00:00:00.000Z",
        "status": "ACTIVE",
        "version": 1,
        "is_active": true,
        "status_display": "ACTIVE",
        "createdAt": "2024-02-01T00:00:00.000Z"
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

### 6️⃣ GET ASSIGNMENT BY ID
**Endpoint:** `POST /api/payroll/employee-assignment/get`

**Purpose:** Get detailed assignment information with all snapshots

**Request Body:**
```json
{
  "id": "674a1b2c3d4e5f6g7h8i9j0m"
}
```

**Response (200):**
```json
{
  "status_code": 200,
  "message": "Success",
  "data": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0m",
    "organization_id": "674a1b2c3d4e5f6g7h8i9j0n",
    "employee_id": {
      "_id": "674a1b2c3d4e5f6g7h8i9j0k",
      "employee_name": "John Doe",
      "employee_id": "EMP001",
      "department_id": "674a1b2c3d4e5f6g7h8i9j0q",
      "designation_id": "674a1b2c3d4e5f6g7h8i9j0r",
      "email": "john.doe@example.com"
    },
    "template_id": {
      "_id": "674a1b2c3d4e5f6g7h8i9j0l",
      "template_name": "Senior Developer Template",
      "template_code": "SENIOR_DEV_T1",
      "status": "ACTIVE"
    },
    "annual_ctc": 1200000,
    "monthly_gross": 100000,
    "effective_from": "2024-02-01T00:00:00.000Z",
    "status": "ACTIVE",
    "version": 1,
    "earnings_snapshot": [
      {
        "component_id": "674a1b2c3d4e5f6g7h8i9j0o",
        "component_code": "BASIC",
        "component_name": "Basic Salary",
        "value_type": "fixed",
        "fixed_amount": 50000,
        "monthly_value": 50000,
        "annual_value": 600000,
        "override_allowed": false,
        "is_mandatory": true,
        "calculation_order": 1
      }
    ],
    "deductions_snapshot": [
      {
        "component_id": "674a1b2c3d4e5f6g7h8i9j0s",
        "component_code": "PF",
        "component_name": "Provident Fund",
        "deduction_nature": "statutory",
        "calculation_type": "percentage_of_basic",
        "percentage": 12,
        "monthly_value": 6000,
        "override_allowed": false
      }
    ],
    "earnings_summary": {
      "total_monthly": 100000,
      "total_annual": 1200000,
      "components": 5
    },
    "deductions_summary": {
      "total_monthly": 12000,
      "total_annual": 144000,
      "components": 3
    },
    "net_salary": {
      "monthly": 88000,
      "annual": 1056000
    },
    "is_active": true,
    "is_deleted": false,
    "created_by": "674a1b2c3d4e5f6g7h8i9j0t",
    "createdAt": "2024-02-01T00:00:00.000Z",
    "updatedAt": "2024-02-01T00:00:00.000Z"
  }
}
```

---

### 7️⃣ DEACTIVATE SALARY
**Endpoint:** `POST /api/payroll/employee-assignment/deactivate`

**Purpose:** Deactivate current salary assignment (employee exit/termination)

**Request Body:**
```json
{
  "id": "674a1b2c3d4e5f6g7h8i9j0m",
  "reason": "Employee resignation"
}
```

**Business Rules:**
- ✅ Sets is_active = false
- ✅ Sets status = INACTIVE
- ✅ Template employees_count decremented

**Response (200):**
```json
{
  "status_code": 200,
  "message": "Salary assignment deactivated successfully"
}
```

---

## 🔐 BUSINESS LOGIC IMPLEMENTED

### Critical Rules
1. ✅ **Single Active Assignment**: Only ONE is_active=true per employee per organization
2. ✅ **Template Validation**: Template must be ACTIVE with components
3. ✅ **Snapshot Storage**: Complete data snapshot stored (not referencing template)
4. ✅ **Calculation Automation**: Monthly/Annual values auto-calculated from template
5. ✅ **Component Support**:
   - FIXED type → use fixed_amount
   - PERCENTAGE type → calculate % of annual CTC
   - FORMULA type → use fixed_amount as fallback
6. ✅ **Deduction Calculation**: 
   - FIXED deductions use fixed_amount
   - PERCENTAGE deductions calculated from basic component
   - Max caps applied
7. ✅ **Revision Management**: New version created, old marked as REVISED
8. ✅ **History Preservation**: All versions stored, payroll-safe updates
9. ✅ **CTC Validation**: Earnings total validates against provided CTC (2% tolerance)
10. ✅ **Multi-tenant Isolation**: All operations scoped to organization_id

### Snapshot Architecture
**Why Snapshots?**
- If template changes later, employee's salary remains unchanged (frozen)
- Payroll calculations use snapshots, not live template
- Version history has complete configuration at time of creation
- Prevents retroactive payroll recalculation

---

## 📊 DATA MODEL

### Assignment Schema Structure
```typescript
{
  _id: ObjectId,
  organization_id: ObjectId,
  employee_id: ObjectId,
  template_id: ObjectId,
  
  annual_ctc: number,
  monthly_gross: number,
  effective_from: Date,
  status: 'ACTIVE' | 'INACTIVE' | 'REVISED',
  version: number,
  
  earnings_snapshot: [
    {
      component_id: ObjectId,
      component_code: string,
      component_name: string,
      value_type: 'fixed' | 'percentage' | 'formula',
      fixed_amount?: number,
      percentage?: number,
      formula?: string,
      monthly_value: number,  // Calculated
      annual_value: number,   // Calculated
      override_allowed: boolean,
      is_mandatory: boolean,
      calculation_order: number
    }
  ],
  
  deductions_snapshot: [
    {
      component_id: ObjectId,
      component_code: string,
      component_name: string,
      deduction_nature?: 'statutory' | 'non_statutory',
      calculation_type: 'fixed' | 'percentage_of_basic' | 'formula',
      percentage?: number,
      fixed_amount?: number,
      formula?: string,
      employer_contribution?: boolean,
      employee_contribution?: boolean,
      max_cap?: number,
      monthly_value: number,  // Calculated
      override_allowed: boolean
    }
  ],
  
  is_active: boolean,
  is_deleted: boolean,
  
  payroll_lock_date?: Date,
  last_processed_date?: Date,
  
  created_by: ObjectId,
  updated_by?: ObjectId,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 IMPLEMENTATION STATUS

### ✅ Completed Features
- [x] Assign salary to employee
- [x] CTC breakdown with auto-calculation
- [x] Earnings snapshot generation
- [x] Deductions snapshot generation
- [x] Percentage calculations (PERCENTAGE type)
- [x] PF/ESI maximum cap enforcement
- [x] Get employee current salary
- [x] Salary revision (version control)
- [x] Salary history
- [x] Get all assignments (list with filters)
- [x] Get assignment by ID
- [x] Deactivate salary
- [x] Multi-tenant isolation
- [x] Snapshot-based architecture

### 📋 Next Module Dependencies
1. **Payroll Settings** - PF/ESI/Tax configurations
2. **Leave Module** - LOP calculations
3. **Attendance Module** - Working days
4. **Run Payroll Engine** - Calculate payroll using assignments
5. **Payslip Generation** - Generate from payroll results
6. **Compliance Reports** - PF/ESI declarations

---

## 🧪 TESTING CHECKLIST

### Assign Salary Tests
- [ ] Assign with valid template and CTC
- [ ] Fail when employee already has active salary
- [ ] Fail with inactive template
- [ ] Fail when template has no earnings
- [ ] Fail with invalid CTC (not matching monthly gross)
- [ ] Verify earnings snapshot calculated correctly
- [ ] Verify deductions snapshot calculated correctly

### Revise Salary Tests
- [ ] Create new version on revision
- [ ] Deactivate old version (is_active = false)
- [ ] Effective date validation
- [ ] Earnings overrides applied
- [ ] Version number incremented
- [ ] Template employees_count unchanged (revision only deactivates)

### History Tests
- [ ] Get all versions ordered by version DESC
- [ ] Pagination working
- [ ] Old versions marked as REVISED

### Edge Cases
- [ ] Component formula evaluation
- [ ] Percentage cap validations
- [ ] Multiple deductions to same employee
- [ ] Override allowed vs not allowed

---

## 📞 SUPPORT

For any issues or questions, contact the development team.

**Module:** Employee Salary Assignment  
**Version:** 1.0.0  
**Last Updated:** February 2026
