import { describe, expect, it } from 'vitest';
import {
  filterAppointmentsWithCustomerName,
  filterCurrentAndFutureAppointments,
  isReroutedToAnotherAdvisor,
  isStartingSoon,
} from './appointment.rules';
import type { Appointment } from './appointment';

describe('filterCurrentAndFutureAppointments', () => {
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      customerName: 'Past',
      startsAt: new Date(2026, 6, 29, 9, 0),
      durationMinutes: 60,
    },
    {
      id: '2',
      customerName: 'Today',
      startsAt: new Date(2026, 6, 31, 10, 0),
      durationMinutes: 45,
    },
    {
      id: '3',
      customerName: 'Future',
      startsAt: new Date(2026, 7, 5, 14, 0),
      durationMinutes: 30,
    },
  ];

  it('keeps appointments on or after today', () => {
    expect(
      filterCurrentAndFutureAppointments(
        mockAppointments,
        new Date(2026, 6, 31),
      ).map((appointment) => appointment.id),
    ).toEqual(['2', '3']);
  });

  it('keeps appointments from earlier today when the current time is later', () => {
    expect(
      filterCurrentAndFutureAppointments(
        mockAppointments,
        new Date(2026, 6, 31, 16, 0),
      ).map((appointment) => appointment.id),
    ).toEqual(['2', '3']);
  });

  it('keeps an appointment starting exactly at midnight today', () => {
    const appointment: Appointment = {
      id: '4',
      customerName: 'Midnight',
      startsAt: new Date(2026, 6, 31),
      durationMinutes: 30,
    };

    expect(
      filterCurrentAndFutureAppointments(
        [appointment],
        new Date(2026, 6, 31, 16, 0),
      ),
    ).toEqual([appointment]);
  });

  it('keeps every appointment when today is before all appointments', () => {
    expect(
      filterCurrentAndFutureAppointments(
        mockAppointments,
        new Date(2026, 6, 1),
      ),
    ).toHaveLength(3);
  });

  it('returns no appointments when today is after all appointments', () => {
    expect(
      filterCurrentAndFutureAppointments(
        mockAppointments,
        new Date(2026, 8, 1),
      ),
    ).toEqual([]);
  });

  it('returns no appointments when none are supplied', () => {
    expect(
      filterCurrentAndFutureAppointments([], new Date(2026, 6, 31)),
    ).toEqual([]);
  });
});

describe('filterAppointmentsWithCustomerName', () => {
  it('should exclude an appointment when its customer name is empty', () => {
    const appointment: Appointment = {
      id: '4',
      customerName: '',
      startsAt: new Date(2026, 6, 31, 16, 0),
      durationMinutes: 30,
    };

    expect(filterAppointmentsWithCustomerName([appointment])).toEqual([]);
  });

  it('should exclude an appointment when its customer name contains only whitespace', () => {
    const appointment: Appointment = {
      id: '5',
      customerName: '   ',
      startsAt: new Date(2026, 7, 5, 16, 0),
      durationMinutes: 30,
    };

    expect(filterAppointmentsWithCustomerName([appointment])).toEqual([]);
  });

  it('should keep appointments when customer names contain text with or without surrounding whitespace', () => {
    const appointments: Appointment[] = [
      {
        id: '6',
        customerName: 'Alice',
        startsAt: new Date(2026, 6, 31, 9, 0),
        durationMinutes: 30,
      },
      {
        id: '7',
        customerName: '  Alice  ',
        startsAt: new Date(2026, 7, 5, 10, 0),
        durationMinutes: 30,
      },
    ];

    expect(
      filterAppointmentsWithCustomerName(appointments).map(
        (appointment) => appointment.id,
      ),
    ).toEqual(['6', '7']);
  });
});

describe('isReroutedToAnotherAdvisor', () => {
  function appointmentLasting(durationMinutes: number): Appointment {
    return {
      id: '8',
      customerName: 'Alice',
      startsAt: new Date(2026, 6, 31, 9, 0),
      durationMinutes,
    };
  }

  it('re-routes an appointment shorter than half an hour', () => {
    expect(isReroutedToAnotherAdvisor(appointmentLasting(15))).toBe(true);
  });

  // The boundary is the whole rule: `<` instead of `<=` here would silently stop
  // re-routing the shortest appointments the business cares about.
  it('re-routes an appointment lasting exactly half an hour', () => {
    expect(isReroutedToAnotherAdvisor(appointmentLasting(30))).toBe(true);
  });

  it('keeps an appointment longer than half an hour', () => {
    expect(isReroutedToAnotherAdvisor(appointmentLasting(31))).toBe(false);
  });
});

describe('isStartingSoon', () => {
  const now = new Date(2026, 6, 31, 9, 0);

  function appointmentStartingAt(startsAt: Date): Appointment {
    return {
      id: '9',
      customerName: 'Alice',
      startsAt,
      durationMinutes: 60,
    };
  }

  it('announces an appointment that begins twenty minutes from now as starting soon', () => {
    expect(
      isStartingSoon(appointmentStartingAt(new Date(2026, 6, 31, 9, 20)), now),
    ).toBe(true);
  });

  it('announces an appointment starting now as starting soon', () => {
    expect(isStartingSoon(appointmentStartingAt(now), now)).toBe(true);
  });

  it('does not announce an appointment that begins sixty-one minutes from now', () => {
    expect(
      isStartingSoon(appointmentStartingAt(new Date(2026, 6, 31, 10, 1)), now),
    ).toBe(false);
  });

  // The boundary is the whole rule, as it is for re-routing: `<` instead of
  // `<=` here would silently stop announcing an appointment exactly an hour
  // away, which the requirement says is close enough.
  it('announces an appointment that begins in exactly one hour', () => {
    expect(
      isStartingSoon(appointmentStartingAt(new Date(2026, 6, 31, 10, 0)), now),
    ).toBe(true);
  });

  // Appointments are excluded by day, not by instant, so a nine o'clock
  // appointment is still displayed at four in the afternoon. It has already
  // started, and "within the next hour" is a window with two ends.
  it('does not announce an appointment that already started earlier today', () => {
    expect(
      isStartingSoon(
        appointmentStartingAt(new Date(2026, 6, 31, 9, 0)),
        new Date(2026, 6, 31, 16, 0),
      ),
    ).toBe(false);
  });
});
