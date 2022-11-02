import readableSize from "readable-size";

export class File {
  name: string;
  size: number;
  type: string;
  isImageCached: boolean;
  downloadUrl: string | null;
  image: null;
  imageWidth: number;
  imageHeight: number;
  readableSize: string;
  typeName: string;

  constructor(name: string, size: number, type: string) {
    this.name = name;
    this.size = size;
    this.type = type;
    this.isImageCached = false;
    this.downloadUrl = null;
    this.image = null;
    this.imageWidth = null;
    this.imageHeight = null;

    this.readableSize = readableSize(size);

    // Certain services provide a pretty name for file types.
    this.typeName = type;
  }
}
