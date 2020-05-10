import React, { useRef, useEffect, useState } from 'react';
import {
  PanelProps,
  LoadingState,
  DataFrame,
  DataQueryRequest,
  DataQueryError,
  TimeRange,
  // SelectableValue,
  // TimeZone,
  // AbsoluteTimeRange,
  // InterpolateFunction,
  // ScopedVars,
} from '@grafana/data';
// import { DataFrame } from '@grafana/dataFrame';
import { SimpleOptions } from 'types';
import { Tooltip, Button, Select,  } from '@grafana/ui';

import * as d3 from 'd3';
import axios from 'axios';

// import { DataQueryResponse, DataSourceApi } from '@grafana/data';
// import { MetricsPanelCtrl, QeuryCtrl } from '@grafana/app/plugins/sdk';
// import appEvents from 'grafana/app/core/app_events';
// import {loadPluginCss} from 'grafana/app/plugins/sdk';
// loadPluginCss({
//   dark: 'plugins/grafana-worldmap-panel/css/worldmap.dark.css',
//   light: 'plugins/grafana-worldmap-panel/css/worldmap.light.css'
// });

// import { Select, SelectOptionItem } from '@grafana/ui';

// export interface VariableQueryState {
//   selectedQueryType: SelectOptionItem<string>;
//   selectedTagType: SelectOptionItem<string>;
// }
/**
 * Used in select elements
 */

// interface MyOptionsOfSelect {
//   fieldKey?: string;
//   label?: string;
//   value?: string;
//   imgUrl?: string;  
//   description?: string;
//   [key: string]: any;
// }

export interface SelectableValue<T = any> {
  label?: string;
  value?: T;
  imgUrl?: string;
  description?: string;
  [key: string]: any;
}


interface MyPropsType {
  date?: Date;
  volume?: number;
}

export interface PanelData {
  state: LoadingState;
  series: DataFrame[];
  request?: DataQueryRequest;
  error?: DataQueryError;
  // Contains the range from the request or a shifted time range if a request uses relative time
  timeRange: TimeRange;
}
// export type InterpolateFunction = (value: string, scopedVars?: ScopedVars, format?: string | Function) => string;
interface Props extends PanelProps<SimpleOptions> { }

export const SimplePanel: React.FC<Props> = (props: Props, { options,  width, height }) => {

  // SELECT "_componentManager/_PropertyEnabled" FROM data WHERE time > now() - 30s
  // SELECT /meter/ FROM data WHERE time > now() - 40s
  // SELECT /Simul/ FROM (SELECT /meter/ FROM data WHERE  time > now() - 40s)
  // SELECT /1|5/ FROM (SELECT /meter/ FROM data WHERE  time > now() - 40s)
  // SELECT /\d/ FROM (SELECT /meter/ FROM data WHERE  time > now() - 40s)
  // SELECT * FROM "h2o_feet" WHERE "water_level" + 2 > 11.9
  // SELECT /\d/ FROM (SELECT /meter/ FROM data WHERE   time > now() - 40s)  limit 1

  const [selectVal, setSelectVal] = useState<string | null>(null);
  // const [fieldKeys, setFieldKeys] = useState<SelectableValue<{}>[]>();
  const [fieldKeys, setFieldKeys] = useState<SelectableValue<string>[]>();
  
  // const theme = useTheme();
  // const styles = getStyles();
  const d3Container = useRef(null);
  // const values = [4, 8, 15, 16, 23, 42];
  useEffect(() => {
    axios({
      method: 'get',
      url: 'http://49.50.164.177:8086/query?pretty=true',
      params: {
        u: 'admin',
        p: 'admin',
        db: 'emsdb',
        // q: 'SELECT median("meter0/ActivePower") FROM data WHERE time >= now() - 10m GROUP BY time(30s)',
        q: 'SELECT /\d/ FROM (SELECT /meter/ FROM data WHERE time > now() - 40s)  limit 1',
        epoch: 'ms',
      },
    })
    .then(function(response) {
      console.log(response.data.results[0].series[0].columns)
      // const arr : SelectableValue<string>[] = 
      // response.data.results[0].series[0].columns.map( (curElement: any, index: any) => ({
      //     label : curElement,
      //     description: curElement,
      //     value: index
      //   } as SelectableValue<string>)
      // );

      const returnArr : SelectableValue<string>[] = 
      response.data.results[0].series[0].columns.reduce((acc: any, curArr: any, index: any) => {
        if (!curArr.includes("time")) {
          acc.push({
            label : curArr,
            description: curArr,
            value: index
          })
        }
        return acc;
      }, [])
    

      console.log("returnArr : ", returnArr);
      
      setFieldKeys(returnArr);
      // setFieldKeys(response.data.results[0].series[0].columns)
           
    })
    .catch(function(error) {
      console.log(error);
    });

  }, []);

  const onInput = (event: any) => {
    setSelectVal(event.target.value);
  };


  const updatePoint = () => {
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
          // let myHistory = props.data.series;
          // console.log("props: ", props)
          // console.log("props.data.state: ", props.data.state)
          // console.log('myHistory : ', props.data.series);
          // console.log("data: ", data);

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
  };

  // return <svg id="chart" viewBox="0 0 1000 500" ref={d3Container}></svg>;
  return (
    <div
        style={{
          position: 'relative',
          width,
          height,
        }}
      >
        <div>
          <h3>{"측정값을 선택하세요(10분 예측)"}</h3>
          <h4>{fieldKeys?.length}</h4>
          <h5>{fieldKeys?.values}</h5>
          <Select
            // value={fieldKeys}
            // options={myOptions}
            options={fieldKeys}
            placeholder="예측할 측정값 선택"
            onChange={item => onInput(item.value)} />

          <input type="text" placeholder="측정값 선택" value={selectVal as any} ng-change={() => onInput} />
          <Tooltip
            content={
              <div>
                {"선택 가능한 측정값을 선택하세요"}
              </div>
            }
          >
            <Button onClick={  () => updatePoint()} children={'Update'} />
          </Tooltip>
        </div>
        <svg id="chart" viewBox="0 0 1000 500" ref={d3Container}></svg>
    </div>
  )
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
