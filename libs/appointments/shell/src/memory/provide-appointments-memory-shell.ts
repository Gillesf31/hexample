import { InMemoryAppointmentsAdapter } from '@hexa/appointments-infrastructure/memory';
import { APPOINTMENTS_PORT } from '../lib/port.tokens';
import { provideAppointmentsShell } from '../lib/provide-appointments-shell';

export function provideAppointmentsMemoryShell() {
  return provideAppointmentsShell({
    provide: APPOINTMENTS_PORT,
    useFactory: () => new InMemoryAppointmentsAdapter(),
  });
}
