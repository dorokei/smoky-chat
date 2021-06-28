import AudioVisualizer from '../lib/AudioVisualizer'
import styles from "../styles/VisualizedAudioStream.module.scss";

const VisualizedAudioStream = ({ stream }: { stream: MediaStream }) => {
  const visualMainElement = document.querySelector('main');
  const setVisualizer = (ref: HTMLElement | null, stream: MediaStream) => {
    if (ref) new AudioVisualizer(ref, stream);
  }
  return <div className={styles.audioVisualize} ref={ref => setVisualizer(ref, stream)}></div>
}

export default VisualizedAudioStream;