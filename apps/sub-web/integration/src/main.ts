import { bootIntegration } from './boot';

document.documentElement.dataset.platform = 'web';

void bootIntegration({ mode: 'standalone' });
