type SignOutButtonProps = {
  className?: string;
};

const defaultClassName =
  "rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-200 hover:border-stone-500";

export function SignOutButton({ className = defaultClassName }: SignOutButtonProps) {
  return (
    <form action="/logout" method="post">
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}
