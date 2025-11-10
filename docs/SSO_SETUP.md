# Google SSO Setup for Fleet Command

This guide explains how to configure Google Single Sign-On (SSO) for internal staff authentication.

## Overview

Fleet Command supports Google OAuth for seamless internal staff login. This allows LifeLine EMS employees to sign in using their existing Google Workspace accounts.

## Prerequisites

- Admin access to Lovable Cloud backend
- Google Workspace or Google Cloud account
- Access to Google Cloud Console

## Step 1: Configure Google OAuth Provider

### In Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted:
   - User type: **Internal** (for Google Workspace) or **External**
   - Add required scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`

6. For Application Type, select **Web application**
7. Add **Authorized JavaScript origins**:
   ```
   https://yruwjmmgcsactbjgjkuh.supabase.co
   https://fleet-internal.ewproto.com
   https://fleet.ewproto.com
   ```

8. Add **Authorized redirect URIs**:
   ```
   https://yruwjmmgcsactbjgjkuh.supabase.co/auth/v1/callback
   ```

9. Click **Create** and save your:
   - Client ID
   - Client Secret

### In Lovable Cloud Backend

1. Access your backend settings via the Lovable interface
2. Navigate to **Users** → **Auth Settings** → **Google Settings**
3. Enable Google provider
4. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
5. Save the configuration

## Step 2: Configure Site URL and Redirect URLs

Lovable Cloud automatically manages these, but verify:

1. In Lovable Cloud backend, go to **Users** → **Auth Settings**
2. Ensure **Site URL** is set to your primary domain:
   ```
   https://fleet-internal.ewproto.com
   ```

3. Ensure **Redirect URLs** include:
   ```
   https://fleet-internal.ewproto.com
   https://fleet.ewproto.com
   http://localhost:5173 (for local development)
   ```

## Step 3: Test SSO

1. Navigate to your internal auth page: `https://fleet-internal.ewproto.com/auth`
2. Click **Sign in with Google**
3. Complete the Google authentication flow
4. You should be redirected back to Fleet Command dashboard

## Entry Mode Behavior

Google SSO is only available on:
- **Internal entry mode** (`VITE_ENTRY_MODE=internal`)
- **Landing entry mode** (`VITE_ENTRY_MODE=landing`) - on the internal login path

It is **NOT** available on:
- **Demo entry mode** (`VITE_ENTRY_MODE=demo`) - Demo users use standard email/password

## Security Considerations

### For Internal Mode

- **Domain Restrictions**: If using Google Workspace, configure OAuth consent screen to restrict to your organization's domain
- **Tenant Type**: Users authenticating via Google SSO are automatically assigned `tenant_type: 'internal'`
- **Role Assignment**: New SSO users will need roles assigned by an admin via the Admin panel

### Preventing Demo Users from Using SSO

The Google SSO button only appears on internal auth routes. Demo routes use separate authentication flows with email/password only.

## Troubleshooting

### "requested path is invalid" error

This usually means redirect URLs aren't configured correctly. Verify:
1. Google Cloud Console has correct redirect URI
2. Lovable Cloud backend has correct Site URL and Redirect URLs

### SSO redirects to localhost

Check that your Site URL in Lovable Cloud backend matches your production domain, not localhost.

### Users can't access features after SSO login

New SSO users need:
1. A role assigned in the `user_roles` table
2. Verify their `tenant_type` is set to `'internal'` in the `profiles` table

Contact your admin to assign appropriate roles (admin, supervisor, technician, or viewer).

## Local Development

For local testing:

1. Add `http://localhost:5173` to Google Cloud Console authorized origins and redirect URIs
2. Ensure `.env.local` has correct Supabase credentials
3. Run with internal mode:
   ```bash
   VITE_ENTRY_MODE=internal npm run dev
   ```

## Reference

- [Supabase Google OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
