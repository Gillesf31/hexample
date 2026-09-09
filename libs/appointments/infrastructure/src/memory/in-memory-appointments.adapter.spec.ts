import { describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';
import { InMemoryAppointmentsAdapter } from './in-memory-appointments.adapter';

describe('InMemoryAppointmentsAdapter', () => {
  it('emits its seeded appointments', async () => {
    const appointments = await firstValueFrom(
      new InMemoryAppointmentsAdapter().getAppointments(),
    );

    expect(appointments).toHaveLength(7);
    expect(appointments.map((appointment) => appointment.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
    ]);
  });

  it('emits appointments that satisfy the Appointment contract', async () => {
    const appointments = await firstValueFrom(
      new InMemoryAppointmentsAdapter().getAppointments(),
    );

    appointments.forEach((appointment: Appointment) => {
      expect(appointment.id).toBeTruthy();
      expect(appointment.customerName).toBeTruthy();
      expect(appointment.startsAt).toBeInstanceOf(Date);
      expect(Number.isNaN(appointment.startsAt.getTime())).toBe(false);
      expect(appointment.durationMinutes).toBeGreaterThan(0);
    });
  });

  it('spreads appointment start times around the current day', async () => {
    const adapter = new InMemoryAppointmentsAdapter(
      () => new Date(2026, 7, 7, 12, 0),
    );

    const appointments = await firstValueFrom(adapter.getAppointments());

    expect(appointments.map((appointment) => appointment.startsAt)).toEqual([
      new Date(2026, 7, 1, 9, 0),
      new Date(2026, 7, 6, 10, 0),
      new Date(2026, 7, 7, 12, 30), // half an hour after the injected instant
      new Date(2026, 7, 7, 16, 30),
      new Date(2026, 7, 9, 11, 0),
      new Date(2026, 7, 16, 8, 30),
      new Date(2026, 7, 8, 9, 15),
    ]);
  });

  // The demo has to show the "starting soon" notice at any hour, and a fixed
  // start time cannot: it is imminent for one hour a day and stale for the
  // other twenty-three. Both instants below are deliberately awkward — one
  // before the working day, one where the next hour falls on the following
  // date.
  it.each([
    ['before the working day', new Date(2026, 7, 7, 3, 10)],
    ['just before midnight', new Date(2026, 7, 7, 23, 50)],
  ])('starts one appointment within the hour, seen %s', async (_, now) => {
    const adapter = new InMemoryAppointmentsAdapter(() => now);
    const anHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const appointments = await firstValueFrom(adapter.getAppointments());

    expect(
      appointments.some(
        (appointment) =>
          appointment.startsAt >= now && appointment.startsAt <= anHourFromNow,
      ),
    ).toBe(true);
  });

  it('always emits appointments at or after the start of today', async () => {
    const appointments = await firstValueFrom(
      new InMemoryAppointmentsAdapter().getAppointments(),
    );
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    expect(
      appointments.some((appointment) => appointment.startsAt >= startOfToday),
    ).toBe(true);
  });
});
