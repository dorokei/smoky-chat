export default class User {
  public name: string;
  public uid: string;
  public thumbUrl: string | null;

  constructor(name: string | null, uid: string, thumbUrl: string | null) {
    this.name = name || "No name";
    this.uid = uid;
    this.thumbUrl = thumbUrl || null;
  }
}