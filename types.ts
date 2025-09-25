export interface ImageData {
  id: string;
  base64: string;
  mimeType: string;
}

export interface AlbumFolder {
  id: string;
  name: string;
  images: ImageData[];
}

export interface AlbumState {
  rootImages: ImageData[];
  folders: AlbumFolder[];
}

export interface ResultData {
  image: string | null;
  text: string | null;
}
