# Input Validation Guide

## Overview

This application uses comprehensive input validation to ensure data quality and prevent security vulnerabilities. All user inputs must be validated both client-side (for user experience) and server-side (for security).

## Security Principles

### Critical Security Rules

1. **Never trust client-side validation alone** - Always validate on the server/database side via RLS policies
2. **Set reasonable length limits** - Prevent storage overflow and DoS attacks
3. **Sanitize all inputs** - Prevent injection attacks (SQL, XSS, CSV formula injection)
4. **Use proper type checking** - Ensure data types match expected values
5. **Validate before external API calls** - Never pass unvalidated user input to external services

## Validation Library Location

All validation schemas and utilities are centralized in:
```
src/lib/validation.ts
```

## Common Validation Schemas

### Vehicle Fields

```typescript
import { vinSchema, yearSchema, vehicleFormSchema } from "@/lib/validation";

// Individual field validation
const vin = vinSchema.parse("1FDXE45P84HB12345"); // Validates 17-char VIN
const year = yearSchema.parse(2024); // Validates year between 1900-2100

// Complete vehicle form validation
const vehicleData = vehicleFormSchema.parse({
  vehicle_id: "E450-OC-1023",
  vin: "1FDXE45P84HB12345",
  plate: "AMB-1023",
  make: "Ford",
  model: "E-450",
  year: 2024,
  type: "ALS",
  region_id: "uuid-here"
});
```

### User Authentication

```typescript
import { emailSchema, passwordSchema, signupFormSchema } from "@/lib/validation";

// Validate email
const email = emailSchema.parse("user@example.com");

// Validate password strength
const password = passwordSchema.parse("SecurePass123!");

// Complete signup validation
const signupData = signupFormSchema.parse({
  email: "user@example.com",
  password: "SecurePass123!",
  fullName: "John Doe"
});
```

### Text Fields

```typescript
import { shortTextField, mediumTextField, longTextField } from "@/lib/validation";

// Short text (max 50 chars by default)
const vehicleId = shortTextField("Vehicle ID").parse("E450-OC-1023");

// Medium text (max 200 chars)
const description = mediumTextField("Description").parse("Some description");

// Long text (max 1000 chars, optional)
const notes = longTextField("Notes").parse("Extended notes...");
```

### Numeric Fields

```typescript
import { positiveInteger, percentageSchema } from "@/lib/validation";

// Positive integer with optional max
const odometer = positiveInteger("Odometer", 999999).parse(50000);

// Percentage (0-100)
const completion = percentageSchema.parse(75);
```

## Form Validation Pattern

### Standard Form Validation Flow

```typescript
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { vehicleFormSchema } from "@/lib/validation";

export function MyForm() {
  const [formData, setFormData] = useState({...});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate form data
    const validation = vehicleFormSchema.safeParse(formData);
    
    if (!validation.success) {
      // 2. Show validation error to user
      toast({
        title: "Validation error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // 3. Proceed with database operation
    try {
      const { error } = await supabase.from("vehicles").insert([validation.data]);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## CSV Import Validation

For CSV imports, use the sanitization functions to prevent injection attacks:

```typescript
import { sanitizeCsvCell } from "@/lib/validation";

const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => sanitizeCsvCell(v));
    return headers.reduce((obj, header, idx) => {
      obj[header] = values[idx] || '';
      return obj;
    }, {} as Record<string, string>);
  });
};
```

## File Upload Validation

```typescript
import { validateFileSize, validateFileType } from "@/lib/validation";

const handleFileUpload = (file: File) => {
  // Check file size (max 5MB)
  if (!validateFileSize(file, 5)) {
    toast({
      title: "File too large",
      description: "File must be less than 5MB",
      variant: "destructive"
    });
    return;
  }

  // Check file type
  if (!validateFileType(file, ["text/csv"])) {
    toast({
      title: "Invalid file type",
      description: "Only CSV files are allowed",
      variant: "destructive"
    });
    return;
  }

  // Proceed with upload
};
```

## Custom Validation Schemas

When creating new forms, follow this pattern:

```typescript
import { z } from "zod";
import { shortTextField, emailSchema, uuidSchema } from "@/lib/validation";

// Define your schema
const myFormSchema = z.object({
  name: shortTextField("Name", 100),
  email: emailSchema,
  department_id: uuidSchema,
  notes: z.string().trim().max(500).optional(),
  is_active: z.boolean(),
  priority: z.number().int().min(1).max(10),
});

// Export for reuse
export { myFormSchema };
```

## Validation Error Handling

### Display Validation Errors

```typescript
const validation = schema.safeParse(data);

if (!validation.success) {
  // Get first error message
  const firstError = validation.error.errors[0].message;
  
  // Or get all errors
  const allErrors = validation.error.errors.map(e => 
    `${e.path.join('.')}: ${e.message}`
  ).join(', ');
  
  toast({
    title: "Validation error",
    description: firstError,
    variant: "destructive"
  });
}
```

## Security Best Practices

### ✅ DO

- Validate all user inputs before database operations
- Set reasonable maximum lengths for all text fields
- Use proper type checking (string, number, boolean)
- Sanitize inputs before passing to external APIs
- Provide clear error messages to users
- Use server-side validation (RLS policies) as primary defense

### ❌ DON'T

- Trust client-side validation alone for security
- Allow unlimited input lengths
- Pass unvalidated data to external services
- Use `dangerouslySetInnerHTML` with user content
- Log sensitive user data to console
- Skip validation for "admin-only" forms

## Testing Validation

When adding new forms, test these scenarios:

1. **Empty fields** - Required fields should show appropriate errors
2. **Too long inputs** - Should be truncated or rejected
3. **Invalid formats** - Should show format-specific errors (e.g., VIN length)
4. **SQL injection attempts** - Should be safely escaped
5. **XSS attempts** - Should be sanitized
6. **CSV formula injection** - Should be escaped with single quote
7. **Type mismatches** - Numbers as strings, etc.

## Examples of Validated Forms

Current forms with validation:

1. **AddVehicleDialog.tsx** - Vehicle creation form
   - VIN: 17 characters, alphanumeric
   - Year: 1900-2100
   - Text fields: Proper length limits

2. **CsvImport.tsx** - CSV import
   - File size limit: 5MB
   - Row limit: 1000 rows
   - Formula injection protection
   - Type validation for all fields

3. **Auth.tsx** - User authentication
   - Email format validation
   - Password strength requirements
   - Full name length limits

## Adding Validation to New Forms

When creating a new form:

1. Define validation schema in `src/lib/validation.ts` (if reusable) or in the component file
2. Use `safeParse()` to validate form data before submission
3. Display validation errors using toast notifications
4. Add inline help text for complex validation rules (e.g., password requirements)
5. Test all validation scenarios
6. Document any custom validation logic

## Resources

- [Zod Documentation](https://zod.dev/)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Security Best Practices](https://docs.lovable.dev/features/security)
