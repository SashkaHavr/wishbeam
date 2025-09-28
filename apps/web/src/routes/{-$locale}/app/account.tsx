import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$locale}/app/account')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/-$locale/app/account"!</div>
}
