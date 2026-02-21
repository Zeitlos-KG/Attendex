# Security Policy

## Supported Versions

Only the latest version of Attendex is supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Attendex seriously. If you find a security vulnerability, please do NOT open a public issue. 

Instead, please report it privately via email to the project maintainers. We will acknowledge your report within 48 hours and provide a timeline for a fix if necessary.

### Security Best Practices for Users
1. **Never share your `.env` file**: This contains your `SUPABASE_JWT_SECRET`.
2. **Environment Variables**: Always set secrets via the Render/Vercel dashboard, never hardcode them in the repository.
3. **Database Privacy**: Attendex uses row-level isolation. Ensure your Supabase RLS (Row Level Security) policies are enabled for the `profiles` table.
