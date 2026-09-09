import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { filter, firstValueFrom, take } from 'rxjs';
import { describe, expect, it } from 'vitest';
import {
  appointmentsFeature,
  appointmentsPageActions,
} from '@hexa/appointments-state';
import { appointmentsRoutes } from './index';

describe('the appointments memory entry point', () => {
  it('loads seeded appointments through the shell effect', async () => {
    const [route] = appointmentsRoutes();

    TestBed.configureTestingModule({
      providers: [provideStore(), ...(route.providers ?? [])],
    });

    const store = TestBed.inject(Store);
    const loadedAppointments = firstValueFrom(
      store.select(appointmentsFeature.selectAppointments).pipe(
        filter((appointments) => appointments.length === 5),
        take(1),
      ),
    );

    store.dispatch(appointmentsPageActions.opened());

    expect(await loadedAppointments).toHaveLength(5);
  });
});
