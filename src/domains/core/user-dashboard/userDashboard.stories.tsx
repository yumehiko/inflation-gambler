import type { Meta, StoryObj } from '@storybook/react'
import { UserDashboardView } from './userDashboard.view'
import { useUserStore } from '../user/user.store'
import { createCoin } from '../coin/coin.utils'

const meta = {
  title: 'Core/UserDashboard',
  component: UserDashboardView,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof UserDashboardView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => {
      useUserStore.setState({
        user: {
          id: 'user-1',
          name: 'Player 1',
          coin: createCoin(1000),
        },
      })
      return <Story />
    },
  ],
}

export const HighRoller: Story = {
  decorators: [
    (Story) => {
      useUserStore.setState({
        user: {
          id: 'user-1',
          name: 'High Roller',
          coin: createCoin(999999),
        },
      })
      return <Story />
    },
  ],
}

export const LowBalance: Story = {
  decorators: [
    (Story) => {
      useUserStore.setState({
        user: {
          id: 'user-1',
          name: 'Broke Player',
          coin: createCoin(10),
        },
      })
      return <Story />
    },
  ],
}

export const LongName: Story = {
  decorators: [
    (Story) => {
      useUserStore.setState({
        user: {
          id: 'user-1',
          name: 'Very Long Player Name That Should Wrap',
          coin: createCoin(5000),
        },
      })
      return <Story />
    },
  ],
}