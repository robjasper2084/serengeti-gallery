import {defineConfig} from 'vite';
import {checkoutMiddleware} from './server/checkout.js';
export default defineConfig({define:{"import.meta.env.VITE_STATIC_HOST":JSON.stringify("true")},base:"/serengeti-gallery/",optimizeDeps:{noDiscovery:true,include:[]},server:{watch:{ignored:['**/unity/**','**/blender/**','**/.npm-cache/**']}},plugins:[{name:'gallery-checkout',configureServer(server){server.middlewares.use(checkoutMiddleware());},configurePreviewServer(server){server.middlewares.use(checkoutMiddleware());}}],build:{chunkSizeWarningLimit:650}});
