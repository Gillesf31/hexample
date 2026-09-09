import type { Routes } from '@angular/router';
import { AppointmentsPageComponent } from '@hexa/appointments-feature';
import type { AppointmentsApiConfig } from './appointments-api.config';
import { provideAppointmentsApiShell } from './provide-appointments-api-shell';

export function appointmentsRoutes(config: AppointmentsApiConfig): Routes {
  return [
    {
      path: '',
      providers: [provideAppointmentsApiShell(config)],
      children: [{ path: '', component: AppointmentsPageComponent }],
    },
  ];
}
