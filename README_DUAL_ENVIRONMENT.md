# Fleet Command - Dual Environment & Entry Modes

## Overview

Fleet Command supports **three deployment patterns** within a single codebase, controlled by environment variables:

1. **Landing Entry** (`fleet.ewproto.com`) - Choice between internal and demo
2. **Internal Entry** (`fleet-internal.ewproto.com`) - Direct staff access
3. **Demo Entry** (`fleet-demo.ewproto.com`) - Direct public demo access

Each mode accesses the same data layer but with different entry points and user experiences.

## Domains & Entry Modes (ewproto.com)

### Entry Modes Configuration

Set `VITE_ENTRY_MODE` to control how users enter the application:

| URL | Entry Mode | Behavior |
|-----|------------|----------|
| `fleet.ewproto.com` | `landing` | Shows landing page with choice: Internal or Demo |
| `fleet-internal.ewproto.com` | `internal` | Direct redirect to internal dashboard (auth required) |
| `fleet-demo.ewproto.com` | `demo` | Direct redirect to demo experience (public signup) |

### Local Development with Entry Modes

```bash
# Landing mode - shows choice screen at /
VITE_ENTRY_MODE=landing npm run dev

# Internal-only mode - / redirects to /auth
VITE_ENTRY_MODE=internal npm run dev

# Demo-only mode - / redirects to /demo/login
VITE_ENTRY_MODE=demo npm run dev
```

**Note**: Entry mode controls the routing/entry point. Data separation is controlled by `VITE_APP_MODE` and tenant type (see Data Isolation below).

## Architecture

### Data Isolation

- **Tenant Type System**: Users are tagged as either `internal` or `demo` in their profile
- **Separate Tables**: Demo users access `demo_*` prefixed tables (demo_vehicles, demo_vehicle_tasks, etc.)
- **RLS Enforcement**: Row-Level Security policies ensure complete data separation at the database level
- **No Cross-Contamination**: Demo users cannot access internal data, internal users cannot access demo data

### Environment Configuration

Set the `VITE_APP_MODE` environment variable to control which mode the app runs in:

```bash
# Internal mode (production)
VITE_APP_MODE=internal

# Demo mode (public)
VITE_APP_MODE=demo
```

## Running Each Mode

### Internal Mode (Default)

**Purpose**: Daily work app for LifeLine EMS staff

**Behavior**:
- No public signup (users must be invited/created by admins)
- Auth route: `/auth`
- Connects to real production data
- Full feature access based on role (admin, supervisor, technician, viewer)

**To Run Locally**:
```bash
# Make sure VITE_APP_MODE is not set or set to 'internal'
npm run dev
# Access at http://localhost:8080
```

**To Deploy**:
- Ensure `VITE_APP_MODE=internal` in Lovable Cloud environment variables
- Deploy normally through Lovable

### Demo Mode

**Purpose**: Public-facing demo for prospects

**Behavior**:
- Public signup enabled
- Landing page at `/demo`
- Auth routes: `/demo/login` and `/demo/signup`
- New signups automatically:
  - Tagged as `tenant_type: 'demo'`
  - Get demo data seeded via edge function
- Only accesses demo tables with mock data

**To Run Locally**:
```bash
# Set environment variable
export VITE_APP_MODE=demo
npm run dev
# Access at http://localhost:8080/demo
```

**To Deploy**:
1. Create a separate Lovable project or deployment for the demo
2. Set `VITE_APP_MODE=demo` in environment variables
3. Deploy through Lovable
4. The demo will be publicly accessible

## How Demo Data Works

### Signup Flow

1. User visits `/demo` and clicks "Try Demo"
2. User creates account at `/demo/signup`
3. On signup:
   - User metadata includes `tenant_type: 'demo'`
   - Profile is created with `tenant_type = 'demo'`
4. After auth, `seed-demo-data` edge function is called
5. Demo data is inserted into `demo_*` tables:
   - 3 sample vehicles
   - Sample commissioning tasks
   - Mock equipment and inspections

### Demo Data Tables

All demo data lives in separate tables:
- `demo_vehicles`
- `demo_vehicle_tasks`
- `demo_vehicle_equipment`
- `demo_inspections`
- `demo_evidence_files`

Shared reference tables (equipment_catalog, regions, vendors) are read-only for demo users.

## Security

### Enforced Separation

**Database Level**:
- RLS policies check `tenant_type` in profiles table
- Demo users CANNOT query internal tables
- Internal users CANNOT query demo tables
- Enforced via PostgreSQL policies, not application code

**Application Level**:
- `TenantRoute` component guards routes by tenant type
- `useTenantType` hook provides tenant context
- Config system (`appMode.ts`) controls mode-specific behavior

### Important Security Notes

⚠️ **Never expose internal mode publicly** - Internal mode should only be accessible via:
- Internal network
- VPN
- Private endpoints in Lovable Cloud

✅ **Demo mode is safe to expose** - Demo mode can be publicly accessible because:
- Demo users cannot access internal data (enforced by RLS)
- Demo data is synthetic/mock only
- No production secrets or sensitive info in demo environment

## Development Workflow

### Adding Features

When adding new features, consider both modes:

```typescript
import { isDemoMode, isInternalMode } from "@/config/appMode";
import { useTenantType } from "@/hooks/useTenantType";

function MyComponent() {
  const { isDemo, isInternal } = useTenantType();
  
  // Mode-based UI
  if (isDemoMode) {
    return <DemoFeature />;
  }
  
  // Tenant-based data
  const tableName = isDemo ? 'demo_vehicles' : 'vehicles';
}
```

### Testing Both Modes

1. **Test Internal Mode**:
   ```bash
   unset VITE_APP_MODE  # or set to 'internal'
   npm run dev
   ```

2. **Test Demo Mode**:
   ```bash
   export VITE_APP_MODE=demo
   npm run dev
   ```

### Database Changes

When adding new tables that need demo equivalents:

1. Create the internal table normally
2. Create a demo version in migration:
   ```sql
   CREATE TABLE public.demo_my_table (LIKE public.my_table INCLUDING ALL);
   ALTER TABLE public.demo_my_table ENABLE ROW LEVEL SECURITY;
   
   -- Add demo RLS policy
   CREATE POLICY "Demo users can access demo data"
   ON public.demo_my_table FOR ALL
   USING (
     EXISTS (
       SELECT 1 FROM public.profiles 
       WHERE profiles.id = auth.uid() 
       AND profiles.tenant_type = 'demo'
     )
   );
   ```

## Deployment Scenarios

### Scenario 1: Single Deployment (Internal Only)
- Set `VITE_APP_MODE=internal`
- Lock down with network security
- Current setup

### Scenario 2: Separate Deployments (Recommended)
- **Internal Deployment**: `VITE_APP_MODE=internal`, private access
- **Demo Deployment**: `VITE_APP_MODE=demo`, public access
- Same codebase, different configs
- Each points to same Supabase but enforces tenant isolation

### Scenario 3: Separate Supabase Projects (Maximum Isolation)
- Internal: Own Supabase project with production data
- Demo: Own Supabase project with demo schema only
- Complete infrastructure isolation
- Higher maintenance overhead

## Troubleshooting

### Issue: Demo signup fails
- Check that `handle_new_user` function sets `tenant_type` from metadata
- Verify `seed-demo-data` edge function is deployed

### Issue: Demo users see no data
- Verify RLS policies on `demo_*` tables
- Check that `seed-demo-data` actually inserted records
- Confirm user's `tenant_type` is set to 'demo' in profiles

### Issue: Internal users blocked from data
- Verify RLS policies check for `tenant_type = 'internal'`
- Ensure existing users have `tenant_type` set (defaults to 'internal')

## Configuration Reference

### Environment Variables

```bash
# Required for mode switching
VITE_APP_MODE=internal  # or 'demo'

# Standard Supabase vars (already configured)
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Key Files

- `src/config/entryMode.ts` - Entry mode detection (landing/internal/demo)
- `src/config/appMode.ts` - App mode detection (internal/demo data)
- `src/hooks/useTenantType.tsx` - Tenant type hook
- `src/components/TenantRoute.tsx` - Route guard with entry mode enforcement
- `src/pages/Landing.tsx` - Landing page (choice screen)
- `src/pages/Auth.tsx` - Internal auth with Google SSO
- `src/pages/DemoLanding.tsx` - Demo landing page
- `src/pages/DemoAuth.tsx` - Demo signup/login
- `supabase/functions/seed-demo-data/index.ts` - Demo data seeding
- `docs/SSO_SETUP.md` - Google SSO configuration guide

## Future Enhancements

Potential improvements:
- Custom demo scenarios per signup
- Demo data refresh/reset capability
- Demo session time limits
- Analytics for demo usage
- Guided demo tours
