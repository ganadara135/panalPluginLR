# Grafana plugin 만들기
현재 @next   버전만 가능 7.0.0-beta.1
grafana docker image 버전도 7.0.0-beta1   로 맞춤

> docker pull grafana/grafana:7.0.0-beta1

> docker run -d -p 3000:3000 -v "$(pwd)":/var/lib/grafana/plugins --name=grafana grafana/grafana:7.0.0-beta1

> npx "@grafana/toolkit"@next plugin:create my-plugin

[출처] https://blog.naver.com/ganadara1379/221950835966

# Grafana Panel Plugin Template

This template is a starting point for building Grafana Panel Plugins in Grafana 7.0+


## What is Grafana Panel Plugin?
Panels are the building blocks of Grafana. They allow you to visualize data in different ways. While Grafana has several types of panels already built-in, you can also build your own panel, to add support for other visualizations.

For more information about panels, refer to the documentation on [Panels](https://grafana.com/docs/grafana/latest/features/panels/panels/)

## Getting started
1. Install dependencies
```BASH
yarn install
```
2. Build plugin in development mode or run in watch mode
```BASH
yarn dev
```
or
```BASH
yarn watch
```
3. Build plugin in production mode
```BASH
yarn build
```

## Learn more
- [Build a panel plugin tutorial](https://grafana.com/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System
