import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { filter, firstValueFrom, take } from 'rxjs';
import { describe, expect, it } from 'vitest';
import {
  appointmentsFeature,
  appointmentsPageActions,
} from '@hexa/appointments-state';
import { appointmentsRoutes } from '../index';

function localDateIn(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

describe('the appointments HTTP entry point', () => {
  it('loads API appointments through the shell effect', async () => {
    const [route] = appointmentsRoutes({
      apiBaseUrl: 'https://appointments.example.test',
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore(),
        ...(route.providers ?? []),
      ],
    });

    const store = TestBed.inject(Store);
    const loadedAppointments = firstValueFrom(
      store.select(appointmentsFeature.selectAppointments).pipe(
        filter((appointments) => appointments.length === 1),
        take(1),
      ),
    );

    store.dispatch(appointmentsPageActions.opened());

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('https://appointments.example.test/appointments').flush([
      {
        id: 'api-appointment',
        customerName: 'API customer',
        date: localDateIn(1),
        startTime: '09:00',
        durationMinutes: 30,
      },
    ]);

    expect(await loadedAppointments).toEqual([
      expect.objectContaining({
        id: 'api-appointment',
        customerName: 'API customer',
      }),
    ]);
    http.verify();
  });
});
