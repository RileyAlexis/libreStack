export interface BookLocationsType {
  stack: LocationStackType[];
  readingCfiLocation: string;
}

export interface LocationStackType {
  title: string;
  cfiLocation: string;
}
