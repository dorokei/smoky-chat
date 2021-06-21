import firebase from '../lib/Firebase';
import { compareAsc, format } from 'date-fns'
import ja from 'date-fns/locale/ja'
import CountDownTimer from './CountDownTimer';
import CountUsers from './CountUsers';

const RoomInfo = ({ doc }: { doc: firebase.firestore.DocumentSnapshot }) => {
  console.log(doc.data());
  const finishAt: Date = doc.data().finishAt.toDate();
  return (
    <>
      <div>
        finish at: {format(finishAt, 'PPpp', { locale: ja })}
        (<CountDownTimer finishAt={finishAt} />)
      </div>
      <div>
        room capacity: {doc.data().maxUsersCount}
        (<CountUsers doc={doc} />)
      </div>
    </>
  );
}

export default RoomInfo;