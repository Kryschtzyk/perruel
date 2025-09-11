declare module 'leaflet' {
  export type LatLngExpression = [number, number] | { lat: number; lng: number };
  export type LatLngBoundsExpression = LatLngExpression[] | [LatLngExpression, LatLngExpression];
  export interface MapOptions {
    center?: LatLngExpression;
    zoom?: number;
  }
  export interface CircleOptions {
    radius?: number;
  }
}
