import { compareAsc, format } from 'date-fns'
import ja from 'date-fns/locale/ja'
import CountDownTimer from './CountDownTimer';
import CountUsers from './CountUsers';
import RoomModel from '../models/Room'

const RoomInfo = ({ room }: { room: RoomModel }) => {
  return (
    <>
      <div>
        finish at: {format(room.finishAt, 'PPpp', { locale: ja })}
        (<CountDownTimer finishAt={room.finishAt} />)
      </div>
      <div>
        room capacity: {room.maxUserCount}
        (<CountUsers room={room} />)
      </div>
    </>
  );
}

export default RoomInfo;