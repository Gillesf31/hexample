import type { Routes } from '@angular/router';
import { AppointmentsPageComponent } from '@hexa/appointments-feature';
import { provideAppointmentsMemoryShell } from './provide-appointments-memory-shell';

export function appointmentsRoutes(): Routes {
  return [
    {
      path: '',
      providers: [provideAppointmentsMemoryShell()],
      children: [{ path: '', component: AppointmentsPageComponent }],
    },
  ];
}
