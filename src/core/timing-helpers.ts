let debounceTimeout: number;

export const debounce = (callback: Function, wait: number) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(callback, wait);
}

export function runOnce(toRunOnce: Function) {
  let hasRun = false;
  return () => {
    if (!hasRun) {
      toRunOnce();
      hasRun = true;
    }
  }
}

// At the time of implementation, using this everywhere there was a generic loop
// took the minified size from 22,063 bytes to 21,877 bytes, saving 186 bytes
export const doTimes = (times: number, callback: Function) => {
  for (let i = 0; i < times; i++) {
    callback(i);
  }
}
