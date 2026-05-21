/**
 * Tiny `classnames` helper — joins truthy strings with a space.
 *
 *   cn("a", false, "b", isActive && "active")  →  "a b active" (when isActive)
 *                                              →  "a b"        (when not)
 *
 * Lets us write conditional Tailwind classes without pulling in clsx.
 */
export function cn(
  ...args: Array<string | false | null | undefined>
): string {
  return args.filter(Boolean).join(" ");
}
