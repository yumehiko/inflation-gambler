import type { Meta, StoryObj } from '@storybook/react'
import { Counter } from './counter.view'
import { useCounterStore } from './counter.store'

const meta = {
  title: 'Domains/Counter',
  component: Counter,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      useCounterStore.setState({ count: 0 })
      return <Story />
    },
  ],
} satisfies Meta<typeof Counter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHighCount: Story = {
  decorators: [
    (Story) => {
      useCounterStore.setState({ count: 99 })
      return <Story />
    },
  ],
}

export const AtMaximum: Story = {
  decorators: [
    (Story) => {
      useCounterStore.setState({ count: 100 })
      return <Story />
    },
  ],
}

export const AtMinimum: Story = {
  decorators: [
    (Story) => {
      useCounterStore.setState({ count: 0 })
      return <Story />
    },
  ],
}