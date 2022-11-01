export class Attachment {
  text: string;

  preText: string | null = null;
  color = "#e8e8e8";
  title: string | null = null;
  titleLink: string | null = null;
  author: string | null = null;
  authorLink: string | null = null;
  authorIcon: string | null = null;
  image: string | null = null;
  imageUrl: string | null = null;
  imageWidth: string | null = null;
  imageHeight: string | null = null;

  constructor(text: string) {
    this.text = text;
  }
}
