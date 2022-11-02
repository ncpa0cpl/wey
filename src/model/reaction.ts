export class Reaction {
  name: string;
  count: number;
  content: string;
  reacted: boolean;

  constructor(name: string, count: number, content: string) {
    this.name = name;
    this.count = count;
    this.content = content;
    this.reacted = false;
  }
}
