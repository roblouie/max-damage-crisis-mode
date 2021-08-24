export const audioContext = new AudioContext();

export const whiteNoiseLoading = initializeWhiteNoiseProcessor();

async function initializeWhiteNoiseProcessor() {
  const whiteNoiseText = 'class WhiteNoiseGainProcessor extends AudioWorkletProcessor{constructor(){super(),this.linearFeedbackShift=32767,this.samplesElapsed=0}stepLinearFeedbackShift(e){const t=this.getBit(this.linearFeedbackShift,0),a=this.getBit(this.linearFeedbackShift,1)^t;this.linearFeedbackShift>>=1,this.linearFeedbackShift=this.setBit(this.linearFeedbackShift,14,a),7===e&&(this.linearFeedbackShift=this.setBit(this.linearFeedbackShift,6,a))}getValue(){return 1&~(1&this.linearFeedbackShift)}setBit(e,t,a){let i=this.clearBit(e,t);return 1===a&&(i|=1<<t),i}clearBit(e,t){return e&~(1<<t)}getBit(e,t){return e>>t&1}process(e,t,a){const i=a.sampleRate/a.changesPerSecond;return t[0].forEach(e=>{for(let t=0;t<e.length;t++)e[t]=this.getValue(),e[t]=this.getValue(),this.samplesElapsed++,this.samplesElapsed>=i&&(this.stepLinearFeedbackShift(a.counterWidth),this.samplesElapsed=0)}),!0}static get parameterDescriptors(){return[{name:"customGain",defaultValue:1,minValue:0,maxValue:1,automationRate:"a-rate"},{name:"sampleRate",defaultValue:44100,automationRate:"k-rate"},{name:"changesPerSecond",defaultValue:500,automationRate:"k-rate"},{name:"counterWidth",defaultValue:15,minValue:7,maxValue:15,automationRate:"k-rate"}]}}registerProcessor("white-noise-gain-processor",WhiteNoiseGainProcessor);';
  const blob = new Blob([whiteNoiseText], { type: 'application/javascript' });
  await audioContext.audioWorklet.addModule(URL.createObjectURL(blob));
}
