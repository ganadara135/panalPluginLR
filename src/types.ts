// type SeriesSize = 'sm' | 'md' | 'lg';
// type CircleColor = 'red' | 'green' | 'blue';

// export interface SimpleOptions {
//   text: string;
//   showSeriesCount: boolean;
//   seriesCountSize: SeriesSize;
//   color: CircleColor;
// }

export interface SimpleOptions {
  title: string;
  api: string;
  apiKey: string;
  device: string;
  mode: number;
}

export const defaults: SimpleOptions = {
  title: 'Dettagli Bilancia',
  api: 'http://localhost:8888',
  apiKey: '',
  device: '',
  mode: 0,
};
