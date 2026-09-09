import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpAppointmentsAdapter } from '@hexa/appointments-infrastructure';
import type { AppointmentsApiConfig } from './appointments-api.config';
import { APPOINTMENTS_PORT } from './port.tokens';
import { provideAppointmentsShell } from './provide-appointments-shell';

export function provideAppointmentsApiShell(config: AppointmentsApiConfig) {
  return provideAppointmentsShell({
    provide: APPOINTMENTS_PORT,
    useFactory: () =>
      new HttpAppointmentsAdapter(inject(HttpClient), config.apiBaseUrl),
  });
}
