export function* animationFrameSequencer(frames: number[], interval: number, isRepeat?: boolean): Generator<number> {
  let renderFrame = 0;
  const endRenderFrame = frames.length * interval - 1;
  while (true) {
    yield frames[Math.floor(renderFrame / interval)];
    renderFrame++;
    if (renderFrame > endRenderFrame) {
      renderFrame = endRenderFrame;
      if (isRepeat) {
        renderFrame = 0;
      }
    }
  }
}
