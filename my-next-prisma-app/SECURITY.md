# Security Policy

## Reporting a Vulnerability

We take the security of QuizMania seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, email us at: **security@quizmania.com**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Critical issues within 30 days

### Scope

**In Scope:**

- Authentication bypass
- SQL injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- IDOR (Insecure Direct Object References)
- SSRF (Server-Side Request Forgery)
- Sensitive data exposure
- Rate limiting bypass

**Out of Scope:**

- Denial of Service (DoS) attacks
- Social engineering
- Physical attacks
- Issues in third-party dependencies (report to maintainers)

## Security Measures

### Authentication & Authorization

- **Clerk Authentication**: Industry-standard OAuth 2.0 / OIDC
- **Session Management**: Secure, HttpOnly cookies with SameSite protection
- **Role-Based Access Control (RBAC)**: Admin, Moderator, User roles
- **IDOR Protection**: Resource ownership verification on all user-owned content

### Data Protection

- **Database**: PostgreSQL with Prisma ORM (parameterized queries prevent SQL injection)
- **Encryption**: TLS 1.3 for data in transit
- **Sensitive Data**: Redacted from logs and error messages
- **PII Handling**: Email/phone masking in analytics

### Input Validation

- **Server-Side**: Zod schema validation on all API inputs
- **XSS Prevention**: DOMPurify + sanitize-html on user-generated content
- **Path Traversal**: Filename sanitization on file uploads
- **SSRF Protection**: URL validation for external requests

### API Security

- **Rate Limiting**:
  - API: 100 req/15min
  - Auth: 5 attempts/15min
  - AI Quiz: 10/hour
  - File Upload: 20/hour
- **CORS**: Strict origin whitelisting
- **CSRF**: Double-submit cookie pattern

### Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.clerk.accounts.dev; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### File Upload Security

- **Type Validation**: MIME type verification (prevents spoofing)
- **Size Limits**: Images 5MB, Audio 10MB
- **Malicious Content**: Script tag detection in SVGs
- **Storage**: Isolated public/user_resources directory

### Third-Party Integrations

- **Clerk**: Auth0-equivalent authentication
- **Razorpay**: PCI-compliant payment processing
- **OpenAI/Anthropic**: API key rotation, request logging

## Security Best Practices

### For Developers

1. **Never commit secrets** to version control
2. **Use `.env.local`** for local development keys
3. **Rotate API keys** every 90 days
4. **Review dependencies** with `npm audit` monthly
5. **Test security** with OWASP ZAP before major releases

### For Users

1. **Enable 2FA** on your account
2. **Use strong passwords** (12+ characters)
3. **Don't share credentials** with others
4. **Report suspicious activity** immediately

## Compliance

- **OWASP Top 10**: Protected against all 10 categories
- **GDPR**: User data export/deletion on request
- **CCPA**: California residents' privacy rights respected
- **PCI DSS**: Payment data never stored (handled by Razorpay)

## Security Contacts

- **Security Team**: security@quizmania.com
- **Bug Bounty**: Coming soon
- **PGP Key**: [Link to public key]

---

**Last Updated**: January 2025
