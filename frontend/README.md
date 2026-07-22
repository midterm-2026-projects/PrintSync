# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Inventory end-to-end test

The Playwright suite tests one real inventory workflow: load live data, add an item, search for it, adjust its stock, reload, and verify the persisted result. It uses the Express API and PostgreSQL; it does not intercept API calls in the browser.

Create `frontend/.env.e2e` from `.env.e2e.example`, using a dedicated disposable database. Then run the following in PowerShell:

```powershell
$env:E2E_RUN = 'true'
$env:E2E_DATABASE_URL = 'postgresql://USER:PASSWORD@HOST:PORT/DATABASE'
npm run test:e2e
```

If the deliberately approved test database is already configured in `backend/.env`, replace `E2E_DATABASE_URL` with `$env:E2E_USE_BACKEND_ENV = 'true'`.

The test refuses to run without `E2E_RUN=true`. It creates one uniquely named item and soft-deletes it during cleanup. Never provide a production database URL.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
