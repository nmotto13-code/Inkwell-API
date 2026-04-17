import { Button } from '@/components/ui/button';

export default function UserNotRegisteredError() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Account setup problem</h1>
      <p className="text-sm text-slate-600">
        Authentication succeeded, but the app could not load your profile data.
      </p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );
}
