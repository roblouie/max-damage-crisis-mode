export function* animationFrameSequencer(frames: any[], intervals: number[], isRepeat?: boolean): Generator<any> {
  let renderFrame = 0;
  let currentInteval = 0;
  const endRenderFrame = frames.length * intervals.reduce((acc, a) => acc + 1) - 1;
  while (true) {
    const index = Math.floor(renderFrame / intervals[currentInteval]);
    yield frames[index];
    if (index > currentInteval) {
      currentInteval++;
    }
    renderFrame++;
    if (renderFrame > endRenderFrame) {
      renderFrame = endRenderFrame;
      if (isRepeat) {
        renderFrame = 0;
      }
    }
  }
}
