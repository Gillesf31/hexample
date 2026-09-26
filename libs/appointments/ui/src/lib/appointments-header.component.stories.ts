import type { Meta, StoryObj } from '@storybook/angular-vite';
import { AppointmentsHeaderComponent } from './appointments-header.component';

const meta: Meta<AppointmentsHeaderComponent> = {
  component: AppointmentsHeaderComponent,
  title: 'Appointments/Header',
  render: (args) => ({
    props: args,
    template:
      '<app-appointments-header [busy]="busy">Appointments</app-appointments-header>',
  }),
};
export default meta;

type Story = StoryObj<AppointmentsHeaderComponent>;

export const Ready: Story = { args: { busy: false } };

export const Busy: Story = { args: { busy: true } };
