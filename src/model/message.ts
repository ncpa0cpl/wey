const WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function ordinalSuffixOf(i: number) {
  const j = i % 10;
  const k = i % 100;
  if (j == 1 && k != 11) {
    return `${i}st`;
  }
  if (j == 2 && k != 12) {
    return `${i}nd`;
  }
  if (j == 3 && k != 13) {
    return `${i}rd`;
  }
  return `${i}th`;
}

export class Message {
  id: string;
  text: string;
  date: Date;
  timestamp: number;
  shortTime: string;
  isEdited: boolean;
  isFolded: boolean;
  isDayMarker: boolean;
  isBot: boolean;
  isSub: boolean;
  isThreadParent: boolean;
  threadId: string | null;
  attachments: Array<any>;
  files: Array<any>;
  replyCount: number;
  reactions: Array<any>;
  user: any | null;
  hasMention: boolean;
  hasStar: boolean;
  dayTime: string | null = null;

  constructor(id: string, text: string, timestamp: number) {
    this.id = String(id);
    this.text = text ? text : "";
    this.date = new Date(timestamp * 1000);
    this.timestamp = timestamp;
    this.shortTime =
      `0${this.date.getHours()}`.substr(-2) +
      ":" +
      `0${this.date.getMinutes()}`.substr(-2);
    this.isEdited = false;
    this.isFolded = false;
    this.isDayMarker = false;
    this.isBot = false;
    this.isSub = false;
    this.isThreadParent = false;
    this.threadId = null;
    this.attachments = [];
    this.files = [];
    this.replyCount = 0;
    this.reactions = [];
    this.user = null;
    this.hasMention = false;
    this.hasStar = false;
    this.dayTime = null;
  }

  setDayMarker() {
    this.isDayMarker = true;
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (
      this.date.getDate() === now.getDate() &&
      this.date.getMonth() === now.getMonth() &&
      this.date.getFullYear() === now.getFullYear()
    ) {
      this.dayTime = "Today";
    } else if (
      this.date.getDate() == yesterday.getDate() &&
      this.date.getMonth() === now.getMonth() &&
      this.date.getFullYear() === now.getFullYear()
    ) {
      this.dayTime = "Yesterday";
    } else {
      this.dayTime = `${WEEK[this.date.getDay()]}, ${
        MONTH[this.date.getMonth()]
      } ${ordinalSuffixOf(this.date.getDate())}`;
    }
  }
}
