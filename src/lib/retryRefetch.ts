export function retryRefetch(
  refetchFn: () => Promise<unknown> | void,
  delays = [1000, 2000, 4000],
) {
  for (const delay of delays) {
    setTimeout(() => refetchFn(), delay);
  }
}
