export class User {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  isAway: boolean;
  statusEmoji: string | null;

  constructor(id: string, name: string, avatar: string) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.isBot = false;
    this.isAway = true;
    this.statusEmoji = null;
  }
}
