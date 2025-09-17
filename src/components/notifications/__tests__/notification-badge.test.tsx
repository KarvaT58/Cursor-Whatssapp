import { render, screen } from '@/test/test-utils'
import { NotificationBadge } from '../notification-badge'

describe('NotificationBadge', () => {
  it('should render with count', () => {
    render(<NotificationBadge count={5} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should render with zero count', () => {
    render(<NotificationBadge count={0} showIcon={false} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should render with large count', () => {
    render(<NotificationBadge count={999} />)

    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('should render with 99+ for large numbers', () => {
    render(<NotificationBadge count={150} />)

    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<NotificationBadge count={3} className="custom-class" />)

    const icon = document.querySelector('svg.custom-class')
    expect(icon).toBeInTheDocument()
  })

  it('should be hidden when count is 0 and hideWhenZero is true', () => {
    render(<NotificationBadge count={0} hideWhenZero />)

    const badge = screen.queryByText('0')
    expect(badge).not.toBeInTheDocument()
  })

  it('should show when count is 0 and hideWhenZero is false', () => {
    render(<NotificationBadge count={0} hideWhenZero={false} showIcon={false} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should show when count is greater than 0 regardless of hideWhenZero', () => {
    render(<NotificationBadge count={1} hideWhenZero />)

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<NotificationBadge count={5} />)

    const badge = screen.getByText('5')
    expect(badge).toHaveAttribute('aria-label', '5 unread notifications')
  })

  it('should handle negative count gracefully', () => {
    render(<NotificationBadge count={-1} />)

    expect(screen.getByText('-1')).toBeInTheDocument()
  })
})
