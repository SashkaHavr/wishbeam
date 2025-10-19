import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/shared/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/shared/"!</div>
}
