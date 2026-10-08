import { lazy } from 'react';

// Application registry slug → simulator. Adding an app = one line here
// plus a row in the applications table; no page code changes.
export const SIMULATORS = {
  whatsapp: lazy(() => import('./WhatsAppSim')),
  facebook: lazy(() => import('./FacebookSim')),
  messenger: lazy(() => import('./MessengerSim')),
  imo: lazy(() => import('./ImoSim')),
  gmail: lazy(() => import('./GmailSim')),
  bkash: lazy(() => import('./BkashSim')),
  nagad: lazy(() => import('./NagadSim')),
  momo: lazy(() => import('./MoMoSim')),
  googlepay: lazy(() => import('./GPaySim')),
  paypal: lazy(() => import('./PayPalSim')),
  booking: lazy(() => import('./BookingSim')),
  practo: lazy(() => import('./PractoSim')),
  amazon: lazy(() => import('./AmazonSim')),
};

