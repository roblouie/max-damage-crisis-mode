export const audioContext = new AudioContext();
export const masterGainNode = new GainNode(audioContext, { gain: 0 })
masterGainNode.connect(audioContext.destination);

export const whiteNoiseLoading = initializeWhiteNoiseProcessor();

async function initializeWhiteNoiseProcessor() {
  const whiteNoiseText = 'class WNP extends AudioWorkletProcessor{constructor(){super();this.shift=4626;this.se=0}slfs(b){var a=this.gb(this.shift,0);a^=this.gb(this.shift,1);this.shift>>=1;this.shift=this.sb(this.shift,14,a);7===b&&(this.shift=this.sb(this.shift,6,a))}gv(){return~(this.shift&1)&1}sb(b,a,c){b=this.cb(b,a);1===c&&(b|=1<<a);return b}cb(b,a){return b&~(1<<a)}gb(b,a){return b>>a&1}process(b,a,c){const f=44100/c.freq[0];a[0].forEach(e=>{for(let d=0;d<e.length;d++)e[d]=this.gv(),e[d]=this.gv(),this.se++,this.se>=f&&(this.slfs(c.width[0]),this.se=0)});return!0}static get parameterDescriptors(){return[{name:"freq",defaultValue:500,automationRate:"k-rate"},{name:"width",defaultValue:15,automationRate:"k-rate"}]}}registerProcessor("wn",WNP);'
  const blob = new Blob([whiteNoiseText], { type: 'application/javascript' });
  await audioContext.audioWorklet.addModule(URL.createObjectURL(blob));
}

// masterGainNode.gain itself is source of truth for muted state
export function toggleMute() {
  masterGainNode.gain.value = masterGainNode.gain.value === 0 ? 1 : 0;
}
