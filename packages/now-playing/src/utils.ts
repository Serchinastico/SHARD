export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
  options: { discardNullables: true },
): { [P in K]-?: NonNullable<T[P]> };
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
  options: { discardNullables: false },
): Pick<T, K>;
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
  options: { discardNullables: boolean },
): Pick<T, K> | { [P in K]-?: NonNullable<T[P]> } {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) {
        if (options.discardNullables && obj[key] !== null && obj[key] !== undefined) {
          acc[key] = obj[key];
        } else if (!options.discardNullables) {
          acc[key] = obj[key];
        }
      }

      return acc;
    },
    {} as Pick<T, K>,
  );
}

/**
 * Creates a watcher for a given signal that changes over time. Only when the condition is stable for
 * the provided delay time, the callback is called. This resembles a debounce function with a cancellable
 * mechanism that can be either explicit (by calling .cancel) or implicit (by making the observed condition false)
 */
export const createStableWatcher = ({ delayMs }: { delayMs: number } = { delayMs: 1000 }) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function watch(condition: boolean, onStable: () => void) {
    if (!condition) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      return;
    }

    // Condition is true again so we debounce the signal and restart the timer
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      onStable();
    }, delayMs);
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return { watch, cancel };
};
