import type { Meta, StoryObj } from '@storybook/angular-vite';
import { StatusMessageComponent } from './status-message.component';

const meta: Meta<StatusMessageComponent> = {
  component: StatusMessageComponent,
  title: 'Appointments/Status Message',
};
export default meta;

type Story = StoryObj<StatusMessageComponent>;

export const Info: Story = {
  args: { variant: 'info' },
  render: (args) => ({
    props: args,
    template:
      '<app-status-message [variant]="variant">Loading appointments…</app-status-message>',
  }),
};

export const Error: Story = {
  args: { variant: 'error' },
  render: (args) => ({
    props: args,
    template:
      '<app-status-message [variant]="variant">Could not load appointments.</app-status-message>',
  }),
};
