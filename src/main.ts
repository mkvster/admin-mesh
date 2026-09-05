import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { Root } from './app/root/root';
import { ADMINMESH_CONFIG, AdminMeshConfig } from './app/config/adminmesh-config';
import { normalizeBaseUrl } from './app/shared/api-url';

const rawConfig: AdminMeshConfig = await fetch(
  new URL('adminmesh-config.json', document.baseURI),
).then((response) => response.json());

const config: AdminMeshConfig = {
  ...rawConfig,
  apiBaseUrl: normalizeBaseUrl(rawConfig.apiBaseUrl),
};

if (config.mockApi) {
  const { createWorker } = await import('./mocks/browser');

  await createWorker(config.apiBaseUrl).start({
    serviceWorker: {
      url: new URL('mockServiceWorker.js', document.baseURI).toString(),
    },
  });
}

bootstrapApplication(Root, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    {
      provide: ADMINMESH_CONFIG,
      useValue: config,
    },
  ],
}).catch((err) => console.error(err));
