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
  export function icon(options: any): any;
  export function divIcon(options: any): any;
  export function marker(latlng: LatLngExpression, options?: any): Marker;
  export class Marker {
    constructor(latlng: LatLngExpression, options?: any);
    addTo(map: any): this;
    remove(): void;
    bindPopup(content: string): this;
  }
}
