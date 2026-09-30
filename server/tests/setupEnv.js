// Test-only configuration. These are throwaway values, not real secrets.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-jwt-secret-000000000000000000000000';
process.env.CLIENT_URL = 'http://localhost:5173';
delete process.env.CLOUDINARY_CLOUD_NAME;
delete process.env.CLOUDINARY_API_KEY;
delete process.env.CLOUDINARY_API_SECRET;
