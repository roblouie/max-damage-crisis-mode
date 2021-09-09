export const audioContext = new AudioContext();
export const masterGainNode = new GainNode(audioContext, { gain: 0 })
masterGainNode.connect(audioContext.destination);

export const whiteNoiseLoading = initializeWhiteNoiseProcessor();

async function initializeWhiteNoiseProcessor() {
  const whiteNoiseText = 'class WNP extends AudioWorkletProcessor{constructor(){super();this.lfs=17958;this.z=44100;this.w=0}u(b){var a=this.y(this.lfs,0);a^=this.y(this.lfs,1);this.lfs>>=1;this.lfs=this.v(this.lfs,14,a);7===b&&(this.lfs=this.v(this.lfs,6,a))}x(){return~(this.lfs&1)&1}v(b,a,c){b&=~(1<<a);1===c&&(b|=1<<a);return b}y(b,a){return b>>a&1}process(b,a,c){const f=this.z/c.freq[0];a[0].forEach(e=>{for(let d=0;d<e.length;d++)e[d]=this.x(),e[d]=this.x(),this.w++,this.w>=f&&(this.u(c.width[0]),this.w=0)});return!0}static get parameterDescriptors(){return[{name:"freq"},{name:"width"}]}}registerProcessor("wn",WNP);'
  const blob = new Blob([whiteNoiseText], { type: 'application/javascript' });
  await audioContext.audioWorklet.addModule(URL.createObjectURL(blob));
}

// masterGainNode.gain itself is source of truth for muted state
export function toggleMute() {
  masterGainNode.gain.value = masterGainNode.gain.value === 0 ? 1 : 0;
}
