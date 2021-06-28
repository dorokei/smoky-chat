export default class AudioVisualizer {
  private audioContext: AudioContext;
  private processFrame: (data: Uint8Array) => void;
  constructor(targetHtml: HTMLElement, stream: MediaStream) {
    const audioContext = new AudioContext();
    // Swapping values around for a better visual effect
    const dataMap = [15, 10, 8, 9, 6, 5, 2, 1, 0, 4, 3, 7, 11, 12, 13, 14];
    const visualValueCount = 16;

    let visualElements: NodeListOf<HTMLElement>;
    const createDOMElements = () => {
      let i;
      for (i = 0; i < visualValueCount; ++i) {
        const elm = document.createElement('div');
        targetHtml.appendChild(elm);
      }

      visualElements = targetHtml.querySelectorAll('div');
    };

    targetHtml.innerHTML = '';
    createDOMElements();

    const processFrame = (data: Uint8Array) => {
      const values = Object.values(data);
      let i;
      for (i = 0; i < visualValueCount; ++i) {
        const value = values[dataMap[i]] / 255;
        const elmStyles = visualElements[i].style;
        elmStyles.transform = `scaleY( ${value} )`;
        elmStyles.opacity = `${Math.max(.25, value)}`;;
      }
    };

    this.audioContext = audioContext;
    this.processFrame = processFrame;
    this.connectStream(stream);
  }

  connectStream(stream: MediaStream) {
    const analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.smoothingTimeConstant = 0.5;
    analyser.fftSize = 32;

    this.initRenderLoop(analyser);
  }

  initRenderLoop(analyser: AnalyserNode) {
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const processFrame = this.processFrame || (() => { });

    const renderFrame = () => {
      analyser.getByteFrequencyData(frequencyData);
      processFrame(frequencyData);

      requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);
  }
}
