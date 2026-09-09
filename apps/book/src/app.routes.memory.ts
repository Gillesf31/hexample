import type { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@hexa/appointments-shell/memory').then((m) =>
        m.appointmentsRoutes(),
      ),
  },
];
