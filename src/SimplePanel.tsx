import React, { useRef, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
// import { css, cx } from 'emotion';
// import { stylesFactory, useTheme } from '@grafana/ui';
// import { useTheme } from '@grafana/ui';
// import { select } from 'd3';
import * as d3 from 'd3';
import axios from 'axios';

// interface Annotation {
//   Id: string;
//   Description: string;
//   UserDescription: string;
//   Data: {
//     Hives: number;
//   };
// }
// interface Device {
//   Id: string;
//   Device: string;
//   Annotations: Annotation[];
//   Meta: { UserDescription: string };
// }

// interface Error {
//   status?: number;
//   statusText?: string;
//   message: string;
// }

interface MyPropsType {
  date?: Date;
  volume?: number;
}
interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = (props: Props, { options, data, width, height }) => {
  // const { options, width, height } = props;
  // const [deviceName, setDeviceName] = useState<string | null>(null);
  // const [device, setDevice] = useState<Device | null>(null);
  // const [userdesc, setUserDesc] = useState('');
  // const [hives, setHives] = useState(0);
  // const [description, setDescription] = useState('');
  // const [begin, setBegin] = useState(moment());
  // const [editing, setEditing] = useState(false);
  // const [error, setError] = useState<Error | null>(null);

  // const theme = useTheme();
  // const styles = getStyles();
  const d3Container = useRef(null);
  // const values = [4, 8, 15, 16, 23, 42];
  useEffect(() => {
    if (d3Container.current) {
      axios({
        method: 'get',
        url: 'http://49.50.164.177:8086/query?pretty=true',
        params: {
          u: 'admin',
          p: 'admin',
          db: 'emsdb',
          q: 'SELECT median("meter0/ActivePower") FROM data WHERE time >= now() - 10m GROUP BY time(30s)',
          epoch: 'ms',
        },
      })
        .then(function(response) {
          let myHistory = response.data.results[0].series[0].values;

          const history5 = myHistory.map((d: any) => {
            // let myDate = new Date(d[0]);
            return {
              // date: new Date(parseTimeDate(myDate)),
              date: d[0],
              volume: d[1],
            };
          });
          console.log('history5 : ', history5);
          console.log('history5.length : ', history5.length);
          console.log('max Date or last Date of history5: ', history5[history5.length - 1].date);
          let forecast5 = history5.map((d: { date: string | number | Date }) => {
            // let stDate = new Date(history5[history5.length-1].date)
            let dyDate = new Date(d.date);
            let plusTime = dyDate.valueOf() + 600000; // 쿼리해 오는 시간 간격보다 충분히 길게 1분 앞 선다
            return {
              date: plusTime,
            };
          });
          console.log('forecast5 : ', forecast5);

          const historyIndex = history5.map((d: { volume: any }, i: any) => [i, d.volume]);
          const forecastResult = forecast5.map((d: { date: string | number | Date }, i: number) => {
            // console.log("in forecatt d: " + d.date + "/ i: ", i)
            return {
              // date: parseTimeDate(d.date),
              date: new Date(d.date),
              volume: predict(historyIndex, historyIndex.length - 1 + i),
            };
          });

          // forecastResult.map(d => console.log('volume: ', d.volume, ' time: ', d.date));
          console.log('result : ', forecastResult.volume);

          forecastResult.unshift(history5[history5.length - 1]);

          // 화면 지우기
          const svg = d3.select('svg');
          svg.selectAll('*').remove();
          const chart = d3.select('#chart');
          const margin = { top: 20, right: 20, bottom: 30, left: 70 };
          const width = 1000 - margin.left - margin.right;
          const height = 500 - margin.top - margin.bottom;
          const innerChart = chart.append('g').attr('transform', `translate(${margin.left} ${margin.top})`);

          const x = d3.scaleTime().rangeRound([0, width]);
          const y = d3.scaleLinear().rangeRound([height, 0]);

          const line = d3
            .line<MyPropsType>()
            .x((d: { date: number | Date | { valueOf(): number } }) => x(d.date))
            // .x(d =>  !isNaN(d.date.valueOf()) ? d.date.valueOf() : console.log("X 에러발생") )
            .y((d: { volume: number | { valueOf(): number } }) => y(d.volume));

          x.domain([d3.min<MyPropsType>(history5, d => d.date), d3.max<any>(forecastResult, d => d.date)]);
          y.domain([0, d3.max<MyPropsType>(history5, d => d.volume)]);

          innerChart
            .append('g')
            .attr('transform', `translate(0 ${height})`)
            .call(d3.axisBottom(x));

          innerChart
            .append('g')
            .call(d3.axisLeft(y))
            .append('text')
            .attr('fill', '#fff')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('text-anchor', 'end')
            .text('측정 전력');

          innerChart
            .append('path')
            .datum(history5)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 3.5)
            .attr('d', line);

          innerChart
            .append('path')
            .datum(forecastResult)
            .attr('fill', 'none')
            .attr('stroke', 'tomato')
            .attr('stroke-dasharray', '10,7')
            .attr('stroke-width', 5.5)
            .attr('d', line);
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }, [width, height, d3Container.current]);

  return <svg id="chart" viewBox="0 0 1000 500" ref={d3Container}></svg>;
};

const predict = (data: any[], newX: number) => {
  const round = (n: number) => Math.round(n);
  // const round = (n) => Math.round(n * 100) / 100;
  const sum = data.reduce(
    (acc, pair) => {
      const x = pair[0];
      const y = pair[1];

      if (y !== null) {
        acc.x += x;
        acc.y += y;
        acc.squareX += x * x;
        acc.product += x * y;
        acc.len += 1;
      }

      return acc;
    },
    { x: 0, y: 0, squareX: 0, product: 0, len: 0 }
  );

  const rise = sum.len * sum.product - sum.x * sum.y;
  const run = sum.len * sum.squareX - sum.x * sum.x;
  const gradient = run === 0 ? 0 : round(rise / run);
  const intercept = round(sum.y / sum.len - (gradient * sum.x) / sum.len);

  return round(gradient * newX + intercept);
};
