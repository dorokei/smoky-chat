import AudioVisualizer from '../lib/AudioVisualizer'
import styles from "../styles/VisualizedAudioStream.module.scss";

const VisualizedAudioStream = ({ stream }: { stream: MediaStream }) => {
  const visualMainElement = document.querySelector('main');

  // const setSrcObject = (ref: HTMLAudioElement | null, stream: MediaStream) => {
  //   if (ref) {
  //     ref.srcObject = stream;
  //   }
  // }
  // return <div>
  //   <audio ref={ref => setSrcObject(ref, stream)} autoPlay />
  // </div>;
  const setVisualizer = (ref: HTMLElement | null, stream: MediaStream) => {
    if (ref) new AudioVisualizer(ref, stream);
  }
  return <div className={styles.audioVisualize} ref={ref => setVisualizer(ref, stream)}></div>
}

export default VisualizedAudioStream;