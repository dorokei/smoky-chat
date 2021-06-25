import firebase from '../lib/Firebase';

export default class Room {
  public roomId: string;
  public finishAt: Date;
  public maxUserCount: number;
  public ref: firebase.firestore.DocumentReference;

  constructor(roomId: string, finishAt: Date, maxUserCount: number, ref: firebase.firestore.DocumentReference) {
    this.roomId = roomId;
    this.finishAt = finishAt;
    this.maxUserCount = maxUserCount;
    this.ref = ref;
  }

  public static createByDoc(doc: firebase.firestore.DocumentSnapshot): Room {
    const data = doc.data();
    if (data && 'finishAt' in data && 'maxUsersCount' in data) {
      const finishAt: Date = data.finishAt.toDate();
      const maxUsersCount: number = data.maxUsersCount;
      return new Room(doc.id, finishAt, maxUsersCount, doc.ref);
    }
    throw new Error("Data format error");
  }
}