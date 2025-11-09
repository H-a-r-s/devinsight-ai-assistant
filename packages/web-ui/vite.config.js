"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ''); }
            },
            '/ws': {
                target: 'ws://localhost:3001',
                ws: true
            }
        }
    }
});
