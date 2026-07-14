# Components

## Layout

- `Navbar`: public top navigation, notifications, profile menu, and auth actions.
- `Sidebar`: dashboard navigation for authenticated role pages.
- `DashboardLayout`: shared shell for dashboard pages with sidebar, header, and content region.
- `ProtectedRoute`: guards authenticated and role-specific routes.

## Feature Components

- `TaskCard`: renders marketplace task summaries and payout metadata.
- `StatCard`: animated dashboard KPI card.
- `EarningsChart`: six-month earnings area chart.
- `ActivityFeed`: recent task activity list.
- `ChatWindow`: task-specific Socket.IO chat.
- `PremiumDesignSection`: landing-page premium design showcase.

## UI Components

- `Button`: reusable styled button variants.
- `Badge`: status and category labels.
- `Card`: reusable content container.
- `Feedback`: spinner, skeleton, empty state, and loading primitives.
- `Modal`: reusable modal shell.
- `Orb`, `Waves`, `Hyperspeed`, `LiquidEther`, `Ballpit`: visual effects used by public pages.

## Example Usage

```jsx
<DashboardLayout title="My Tasks">
  <StatCard title="Completed" value={12} icon="task_alt" variant="success" />
</DashboardLayout>
```
