import { of } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';
import type { AppointmentsPort } from '@hexa/appointments-ports';

// Seeds are relative so the demo cannot rot against rules that ask what time
// it is. A day offset is enough for a rule that filters on today; the
// "starting soon" rule reads the hour, and a fixed `startTime` is imminent for
// one hour a day and stale for the other twenty-three. `minutesFromNow` is the
// same idea one unit down.
//
// This is the in-memory adapter only. `server/db.seed.json` is a payload for an
// API owned by another team, and the Bruno collection derives its dates from
// that same seed — see CLAUDE.md.
type AppointmentSeed = Omit<Appointment, 'startsAt'> &
  ({ dayOffset: number; startTime: string } | { minutesFromNow: number });

const appointmentSeeds: AppointmentSeed[] = [
  {
    id: '1',
    customerName: 'Gilles',
    dayOffset: -6,
    startTime: '09:00',
    durationMinutes: 60,
  },
  {
    id: '2',
    customerName: 'Malo',
    dayOffset: -1,
    startTime: '10:00',
    durationMinutes: 45,
  },
  // Half an hour away and half an hour long, so the list says both things
  // about it at once: re-routed, and starting soon.
  {
    id: '3',
    customerName: 'Alice',
    minutesFromNow: 30,
    durationMinutes: 30,
  },
  {
    id: '4',
    customerName: 'Bob',
    dayOffset: 0,
    startTime: '16:30',
    durationMinutes: 60,
  },
  {
    id: '5',
    customerName: 'Clara',
    dayOffset: 2,
    startTime: '11:00',
    durationMinutes: 90,
  },
  {
    id: '6',
    customerName: 'David',
    dayOffset: 9,
    startTime: '08:30',
    durationMinutes: 30,
  },
  {
    id: '7',
    customerName: 'Elena',
    dayOffset: 1,
    startTime: '09:15',
    durationMinutes: 15,
  },
];

export class InMemoryAppointmentsAdapter implements AppointmentsPort {
  constructor(private readonly now: () => Date = () => new Date()) {}

  getAppointments = () =>
    of<Appointment[]>(
      appointmentSeeds.map((seed) => ({
        id: seed.id,
        customerName: seed.customerName,
        durationMinutes: seed.durationMinutes,
        startsAt: this.startsAtFrom(seed),
      })),
    );

  private startsAtFrom(seed: AppointmentSeed): Date {
    return 'minutesFromNow' in seed
      ? this.startsAtInMinutes(seed.minutesFromNow)
      : this.startsAtFromToday(seed.dayOffset, seed.startTime);
  }

  private startsAtInMinutes(minutesFromNow: number): Date {
    const startsAt = new Date(this.now());
    startsAt.setMinutes(startsAt.getMinutes() + minutesFromNow, 0, 0);

    return startsAt;
  }

  private startsAtFromToday(dayOffset: number, startTime: string): Date {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startsAt = new Date(this.now());
    startsAt.setDate(startsAt.getDate() + dayOffset);
    startsAt.setHours(hours, minutes, 0, 0);

    return startsAt;
  }
}
