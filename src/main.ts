import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { startMocks } from './app/core/mocks/browser';

startMocks()
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
