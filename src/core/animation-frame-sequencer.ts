export function singleIntervalFrameSequencer(frames: any[], interval: number, isRepeat?: boolean): Generator<any> {
  return multiIntervalFrameSequencer(frames, new Array(frames.length).fill(interval), isRepeat);
}

export function* multiIntervalFrameSequencer(frames: any[], intervals: number[], isRepeat?: boolean): Generator<any> {
  let renderFrame = 0;
  let index = 0;
  while (true) {
    yield frames[index];
    renderFrame++;
    if (renderFrame >= intervals[index]) {
      index++;
      renderFrame = 0;
      if (index >= frames.length) {
        index = frames.length - 1;

        if (isRepeat) {
          renderFrame = 0;
          index = 0;
        }
      }
    }
  }
}
