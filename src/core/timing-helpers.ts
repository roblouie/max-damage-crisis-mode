let debounceTimeout: number;

export function debounce(callback: Function, wait: number) {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(callback, wait);
}

// At the time of implementation, using this everywhere there was a generic loop
// took the minified size from 22,063 bytes to 21,877 bytes, saving 186 bytes
export function doTimes(times: number, callback: Function) {
  for (let i = 0; i < times; i++) {
    callback(i);
  }
}
