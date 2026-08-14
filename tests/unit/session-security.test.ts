import { describe, expect, it } from 'vitest';

import { parseOAuthRedirect } from '../../lib/auth/oauth-redirect';
import { isPublicAuthPath } from '../../lib/auth/public-auth-path';
import { toBackendServiceSlug } from '../../features/bookings/in-app-booking';
import { isAllowedDocumentUpload, MAX_DOCUMENT_BYTES } from '../../features/documents/document-upload-rules';

describe('parseOAuthRedirect', () => {
  it('prefers an authorization code over a query-string access token', () => {
    const result = parseOAuthRedirect(
      'siamez://auth?code=abc123&accessToken=should-not-win',
    );
    expect(result.code).toBe('abc123');
    expect(result.accessToken).toBe('should-not-win');
  });

  it('reads access tokens from the URL hash first', () => {
    const result = parseOAuthRedirect('siamez://auth#access_token=hashed-token');
    expect(result.accessToken).toBe('hashed-token');
    expect(result.code).toBeNull();
  });
});

describe('isPublicAuthPath', () => {
  it('treats login and register as public credential routes', () => {
    expect(isPublicAuthPath('/api/auth/login')).toBe(true);
    expect(isPublicAuthPath('/api/auth/register')).toBe(true);
    expect(isPublicAuthPath('/api/cases')).toBe(false);
  });
});

describe('toBackendServiceSlug', () => {
  it('maps app catalog slugs to the website canonical service slugs', () => {
    expect(toBackendServiceSlug('car-motorbike-finding-selling')).toBe(
      'car-motorbike-finder-selling-service',
    );
    expect(toBackendServiceSlug('basic-translation-fixed-price')).toBe('basic-translation');
  });

  it('passes through slugs that already match the backend', () => {
    expect(toBackendServiceSlug('translation-services')).toBe('translation-services');
    expect(toBackendServiceSlug('visa-services')).toBe('visa-services');
  });
});

describe('document upload rules', () => {
  it('accepts pdf and images under the size cap', () => {
    expect(isAllowedDocumentUpload({ name: 'passport.pdf', mimeType: 'application/pdf', size: 1024 })).toEqual({
      ok: true,
    });
    expect(isAllowedDocumentUpload({ name: 'scan.jpg', mimeType: 'image/jpeg', size: 2048 })).toEqual({
      ok: true,
    });
  });

  it('rejects oversized or unsupported files', () => {
    expect(isAllowedDocumentUpload({ name: 'huge.pdf', mimeType: 'application/pdf', size: MAX_DOCUMENT_BYTES + 1 })).toEqual({
      ok: false,
      reason: 'size',
    });
    expect(isAllowedDocumentUpload({ name: 'notes.exe', mimeType: 'application/x-msdownload', size: 100 })).toEqual({
      ok: false,
      reason: 'type',
    });
  });
});
