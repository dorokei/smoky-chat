import firebase from '../lib/Firebase';

const RoomInfo = ({ doc }: { doc: firebase.firestore.DocumentSnapshot }) => {
  console.log(doc.data());
  return (
    <>
      <div>finish at: {doc.data().finishAt.toDate().toISOString()}</div>
      <div>room capacity: {doc.data().maxUsersCount}</div>
    </>
  );
}

export default RoomInfo;