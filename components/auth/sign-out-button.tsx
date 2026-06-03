type SignOutButtonProps = {
  className?: string;
};

const defaultClassName =
  "rounded-md border border-line px-4 py-2 text-sm text-muted hover:border-ink hover:text-ink";

export function SignOutButton({ className = defaultClassName }: SignOutButtonProps) {
  return (
    <form action="/logout" method="post">
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}
