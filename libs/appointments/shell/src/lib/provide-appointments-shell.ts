import { inject, makeEnvironmentProviders, type Provider } from '@angular/core';
import { Actions, createEffect, provideEffects } from '@ngrx/effects';
import { SystemClockAdapter } from '@hexa/appointments-infrastructure';
import {
  loadAppointments,
  provideAppointmentsState,
} from '@hexa/appointments-state';
import { APPOINTMENTS_PORT, CLOCK_PORT } from './port.tokens';

const appointmentsEffects = {
  loadAppointments: createEffect(
    (
      actions$ = inject(Actions),
      appointmentsPort = inject(APPOINTMENTS_PORT),
      clock = inject(CLOCK_PORT),
    ) => loadAppointments(actions$, appointmentsPort, clock),
    { functional: true },
  ),
};

export function provideAppointmentsShell(appointmentsPortProvider: Provider) {
  return makeEnvironmentProviders([
    {
      provide: CLOCK_PORT,
      useFactory: () => new SystemClockAdapter(),
    },
    appointmentsPortProvider,
    provideAppointmentsState(),
    provideEffects(appointmentsEffects),
  ]);
}
