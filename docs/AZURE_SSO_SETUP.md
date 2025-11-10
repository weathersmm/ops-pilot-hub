# Azure/Microsoft SSO Setup for Fleet Command

This guide explains how to configure Microsoft Azure AD Single Sign-On (SSO) for internal staff authentication.

## Overview

Fleet Command supports Azure AD OAuth for seamless internal staff login using Microsoft 365 or Azure AD accounts.

## Prerequisites

- Admin access to Lovable Cloud backend
- Azure AD admin access (Global Administrator or Application Administrator role)
- Microsoft 365 or Azure AD tenant

## Step 1: Register Application in Azure Portal

### Create App Registration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure the application:
   - **Name**: Fleet Command (or your preferred name)
   - **Supported account types**: 
     - Select "Accounts in this organizational directory only" for single-tenant (recommended)
     - Or "Accounts in any organizational directory" for multi-tenant
   - **Redirect URI**: Select **Web** and enter:
     ```
     https://yruwjmmgcsactbjgjkuh.supabase.co/auth/v1/callback
     ```
5. Click **Register**

### Configure Authentication

1. In your app registration, go to **Authentication**
2. Under **Implicit grant and hybrid flows**, enable:
   - ✅ **ID tokens** (used for implicit and hybrid flows)
3. Under **Advanced settings**:
   - Allow public client flows: **No**
4. Click **Save**

### Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: "Fleet Command Auth"
4. Choose expiration (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the secret **Value** immediately (you won't see it again)
7. Also copy the **Application (client) ID** from the Overview page
8. Copy the **Directory (tenant) ID** from the Overview page

### Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
4. Click **Add permissions**
5. (Optional) Click **Grant admin consent** to pre-approve for all users

## Step 2: Configure in Lovable Cloud Backend

1. Access your backend settings via the Lovable interface
2. Navigate to **Users** → **Auth Settings** → **Azure Settings**
3. Enable the Azure provider
4. Enter your Azure credentials:
   - **Client ID**: Your Application (client) ID
   - **Client Secret**: The secret value you copied
   - **Azure Tenant**: Your Directory (tenant) ID or your tenant domain (e.g., `yourdomain.onmicrosoft.com`)
5. Save the configuration

### Configuration Format

In Supabase/Lovable Cloud, the Azure provider typically needs:

```
Client ID: <your-application-client-id>
Secret: <your-client-secret>
Azure Tenant: <tenant-id-or-domain>
```

For single-tenant apps, use your specific tenant ID. For multi-tenant, you can use `common`, `organizations`, or `consumers`.

## Step 3: Configure Site URL and Redirect URLs

Lovable Cloud automatically manages these, but verify:

1. In Lovable Cloud backend, go to **Users** → **Auth Settings**
2. Ensure **Site URL** is set to:
   ```
   https://fleet-internal.ewproto.com
   ```

3. Ensure **Redirect URLs** include:
   ```
   https://fleet-internal.ewproto.com
   https://fleet.ewproto.com
   http://localhost:5173 (for local development)
   ```

## Step 4: Test Azure SSO

1. Navigate to: `https://fleet-internal.ewproto.com/auth`
2. Click **Microsoft** button
3. Complete the Microsoft authentication flow
4. You should be redirected back to Fleet Command dashboard

## Entry Mode Behavior

Azure/Microsoft SSO is available on:
- **Internal entry mode** (`VITE_ENTRY_MODE=internal`)
- **Landing entry mode** (`VITE_ENTRY_MODE=landing`) - on internal login path

It is **NOT** available on:
- **Demo entry mode** (`VITE_ENTRY_MODE=demo`) - Demo uses email/password only

## Security Considerations

### For Internal Mode

- **Tenant Restrictions**: Single-tenant configuration restricts to your organization only
- **Conditional Access**: Configure Azure AD Conditional Access policies for additional security:
  - Multi-factor authentication (MFA)
  - Device compliance requirements
  - Location-based access
- **Tenant Type**: Users authenticating via Azure SSO are automatically assigned `tenant_type: 'internal'`
- **Role Assignment**: New SSO users need roles assigned by admin

### Admin Consent

If you grant admin consent for the API permissions, users won't see a consent screen. Otherwise, each user must consent on first login.

## Organizational Configuration

### Restrict to Specific Users/Groups

1. In Azure Portal → **Enterprise applications** → Find your app
2. Go to **Properties**
3. Set **User assignment required**: **Yes**
4. Go to **Users and groups**
5. Add the users or groups who should have access
6. Users not in this list won't be able to authenticate

### Conditional Access Policies

Create Azure AD Conditional Access policy:
1. Go to **Azure AD** → **Security** → **Conditional Access**
2. Create a new policy targeting your Fleet Command app
3. Configure conditions (e.g., MFA requirement, trusted locations)

## Troubleshooting

### "AADSTS700016: Application not found in directory"

The app registration is in wrong tenant or client ID is incorrect. Verify:
- Correct tenant ID in Lovable Cloud config
- Application client ID matches Azure portal

### "AADSTS50011: Redirect URI mismatch"

The redirect URI doesn't match. Ensure:
- Azure app registration has exact redirect URI: `https://yruwjmmgcsactbjgjkuh.supabase.co/auth/v1/callback`
- No trailing slashes or typos

### "User cannot access the application"

User assignment is required. Either:
- Add user to the app's user/group assignments in Azure AD, or
- Set "User assignment required" to **No** in app properties

### SSO works but user has no access to features

New SSO users need:
1. A role assigned in the `user_roles` table
2. Verify `tenant_type` is `'internal'` in `profiles` table

Contact your admin to assign roles.

## Local Development

For local testing:

1. Add `http://localhost:5173` to Azure app registration redirect URIs
2. Ensure your `.env.local` has correct Supabase credentials
3. Run with internal mode:
   ```bash
   VITE_ENTRY_MODE=internal npm run dev
   ```

## Multi-Tenant vs Single-Tenant

**Single-Tenant (Recommended for Internal Apps)**:
- Only users from your organization can sign in
- Use your specific tenant ID
- Best for internal staff access

**Multi-Tenant**:
- Users from any Azure AD tenant can sign in
- Use "common" or "organizations" as tenant value
- Requires additional user validation in your app

## Reference

- [Supabase Azure OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-azure)
- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Azure AD Conditional Access](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/)
