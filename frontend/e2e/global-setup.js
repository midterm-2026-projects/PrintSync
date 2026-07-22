export default async function globalSetup() {
  if (process.env.E2E_RUN !== 'true') {
    throw new Error(
      'Refusing to run E2E tests. Set E2E_RUN=true and point E2E_DATABASE_URL to a dedicated test database.'
    );
  }

  const usesBackendEnvironment = process.env.E2E_USE_BACKEND_ENV === 'true';

  if (!process.env.E2E_BASE_URL && !process.env.E2E_DATABASE_URL && !usesBackendEnvironment) {
    throw new Error(
      'E2E_DATABASE_URL is required unless E2E_USE_BACKEND_ENV=true authorizes the backend/.env database.'
    );
  }
}
