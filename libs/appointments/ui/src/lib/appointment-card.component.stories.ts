import type { Meta, StoryObj } from '@storybook/angular-vite';
import { AppointmentCardComponent } from './appointment-card.component';

const meta: Meta<AppointmentCardComponent> = {
  component: AppointmentCardComponent,
  title: 'Appointments/Card',
  args: {
    appointment: {
      id: '1',
      customerName: 'Ada Lovelace',
      startsAt: new Date(2026, 7, 6, 9),
      durationMinutes: 60,
      startingSoon: false,
    },
  },
};
export default meta;

type Story = StoryObj<AppointmentCardComponent>;

export const Standard: Story = {};

export const ReroutedAndStartingSoon: Story = {
  args: {
    appointment: {
      id: '2',
      customerName: 'Grace Hopper',
      startsAt: new Date(2026, 7, 6, 9, 30),
      durationMinutes: 30,
      startingSoon: true,
    },
  },
};
