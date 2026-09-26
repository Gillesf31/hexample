import type { Meta, StoryObj } from '@storybook/angular-vite';
import { AppointmentListComponent } from './appointment-list.component';

const meta: Meta<AppointmentListComponent> = {
  component: AppointmentListComponent,
  title: 'Appointments/List',
  args: {
    appointments: [
      {
        id: '1',
        customerName: 'Ada Lovelace',
        startsAt: new Date(2026, 7, 6, 9),
        durationMinutes: 30,
        startingSoon: false,
      },
      {
        id: '2',
        customerName: 'Grace Hopper',
        startsAt: new Date(2026, 7, 7, 14),
        durationMinutes: 60,
        startingSoon: true,
      },
    ],
  },
};
export default meta;

type Story = StoryObj<AppointmentListComponent>;

export const Populated: Story = {};

export const Empty: Story = {
  args: { appointments: [] },
};
