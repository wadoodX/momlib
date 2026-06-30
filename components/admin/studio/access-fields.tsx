"use client";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-sage focus-visible:ring-2 focus-visible:ring-sage";

/**
 * Free / Paid → Payhip access controls, shared by the add-form and the per-card
 * editor. Controlled by the parent (`paid` + `onPaid`) so the parent can show a
 * client-side "paid needs a Payhip URL" guard; the Payhip input is only rendered
 * (and only `required`) when Paid is selected. Submits `access` (free|paid) and,
 * when paid, `payhip_url`.
 */
export function AccessFields({
  paid,
  onPaid,
  defaultPayhipUrl = "",
}: {
  paid: boolean;
  onPaid: (paid: boolean) => void;
  defaultPayhipUrl?: string;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-ink">Access</span>
      <div className="flex flex-wrap gap-4 text-sm text-ink">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="access"
            value="free"
            checked={!paid}
            onChange={() => onPaid(false)}
            className="size-4 accent-sage"
          />
          Free
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="access"
            value="paid"
            checked={paid}
            onChange={() => onPaid(true)}
            className="size-4 accent-sage"
          />
          Paid → Payhip
        </label>
      </div>

      {paid ? (
        <label className="block">
          <span className="text-xs font-medium text-ink">Payhip link</span>
          <input
            required
            name="payhip_url"
            type="url"
            defaultValue={defaultPayhipUrl}
            placeholder="https://payhip.com/b/..."
            className={inputClass}
          />
        </label>
      ) : null}
    </div>
  );
}
