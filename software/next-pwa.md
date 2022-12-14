# 从零搭建Next-PWA
## （1）next脚手架
```txt
npx create-next-app@latest --typescript
# or
yarn create next-app --typescript
```
[参考地址: next脚手架](https://www.nextjs.cn/docs/getting-started)

## （2）安装next-pwa
```txt
yarn add next-pwa
```
[参考地址：next-pwa](https://www.npmjs.com/package/next-pwa)
## (3) 配置manifest
```json
{
  "name": "dane-next-pwa",
  "short_name": "Dnp",
  "icons": [
    {
      "src": "/icons/fox-icon.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "theme_color": "#FFFFFF",
  "background_color": "lightblue",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait"
}
```
[参考地址](https://developer.mozilla.org/zh-CN/docs/Web/Manifest)
## (4) 配置service-worker
```js
// next.config.js
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')
const withNextPlugins = require('next-compose-plugins')
const nextConfig = {
  distDir: 'build',
  // reactStrictMode: true,
  pwa: {
    dest: 'public',
    swSrc: 'service-worker.js'
  },
  webpack: (config, options) => {
    return config
  }
}

module.exports = withNextPlugins([withPWA], nextConfig)
```
```js
// service-worker.js

//service-worker.js建议放在根目录
import { skipWaiting, clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { NetworkOnly, NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { registerRoute, setDefaultHandler, setCatchHandler } from 'workbox-routing'
import { matchPrecache, precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
 
skipWaiting()
clientsClaim()
 
// must include following lines when using inject manifest module from workbox
// https://developers.google.com/web/tools/workbox/guides/precache-files/workbox-build#add_an_injection_point
const WB_MANIFEST = self.__WB_MANIFEST
// Precache fallback route and image
WB_MANIFEST.push(
  {
    url: '/offline',  //这里是重点，主要方式断网后呈现的自定义页面（page/offline.js）
    revision: '1234567890'
  }
)
precacheAndRoute(WB_MANIFEST)
 
cleanupOutdatedCaches()
registerRoute(
  '/',
  new NetworkFirst({
    cacheName: 'start-url',
    plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })]
  }),
  'GET'
)
registerRoute(
  /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3, purgeOnQuotaError: !0 })]
  }),
  'GET'
)
registerRoute(
  /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-font-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800, purgeOnQuotaError: !0 })]
  }),
  'GET'
)
// disable image cache, so we could observe the placeholder image when offline
registerRoute(
  /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
  new NetworkOnly({
    cacheName: 'static-image-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })]
  }),
  'GET'
)
registerRoute(
  /\.(?:js)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-js-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })]
  }),
  'GET'
)
registerRoute(
  /\.(?:css|less)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-style-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })]
  }),
  'GET'
)
registerRoute(
  /\.(?:json|xml|csv)$/i,
  new NetworkFirst({
    cacheName: 'static-data-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })]
  }),
  'GET'
)
registerRoute(
  /\/api\/.*$/i,
  new NetworkFirst({
    cacheName: 'apis',
    networkTimeoutSeconds: 10,
    plugins: [new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })]
  }),
  'GET'
)
registerRoute(
  /.*/i,
  new NetworkFirst({
    cacheName: 'others',
    networkTimeoutSeconds: 10,
    plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })]
  }),
  'GET'
)
 
// following lines gives you control of the offline fallback strategies
// https://developers.google.com/web/tools/workbox/guides/advanced-recipes#comprehensive_fallbacks
 
// Use a stale-while-revalidate strategy for all other requests.
setDefaultHandler(new StaleWhileRevalidate())
 
// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
setCatchHandler(({ event }) => {
  // The FALLBACK_URL entries must be added to the cache ahead of time, either
  // via runtime or precaching. If they are precached, then call
  // `matchPrecache(FALLBACK_URL)` (from the `workbox-precaching` package)
  // to get the response from the correct cache.
  //
  // Use event, request, and url to figure out how to respond.
  // One approach would be to use request.destination, see
  // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
  switch (event.request.destination) {
    case 'document':
      // If using precached URLs:
      return matchPrecache('/offline');
      // return caches.match('/fallback')
      break
    case 'image':
    // // If using precached URLs:
    // return matchPrecache('/static/images/fallback.png');
    // // return caches.match('/static/images/fallback.png')
    // break
    case 'font':
    // If using precached URLs:
    // return matchPrecache(FALLBACK_FONT_URL);
    //return caches.match('/static/fonts/fallback.otf')
    //break
    default:
      // If we don't have a fallback, just return an error response.
      return Response.error()
  }
})
```
```txt
tips： 配置完后需在https服务器上打包运行, localhost环境无法启动next-pwa。
       demo地址的service-worker服务，需在https环境下才能运行
```
[参考文献](https://blog.csdn.net/qq_41211900/article/details/113252995)

[demo地址](https://github.com/shotH240Dane/shotH240Dane.github.io/tree/master/next-demo)

