// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

module.exports = function (ctx) {
    return {
        // app boot file (/src/boot)
        // --> boot files are part of "main.js"
        boot: [
            'i18n',
            'axios'
        ],

        css: [
            'app.styl'
        ],

        extras: [
            // 'ionicons-v4',
            // 'mdi-v3',
            // 'fontawesome-v5',
            // 'eva-icons',
            // 'themify',
            // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

            'roboto-font', // optional, you are not bound to it
            'material-icons' // optional, you are not bound to it
        ],

        framework: {
            // iconSet: 'ionicons-v4',
            // lang: 'de', // Quasar language

            // all: true, // --- includes everything; for dev only!

            components: [
                'QLayout',
                'QHeader',
                'QDrawer',
                'QPageContainer',
                'QPage',
                'QToolbar',
                'QToolbarTitle',
                'QBtn',
                'QIcon',
                'QList',
                'QItem',
                'QItemSection',
                'QItemLabel',
                'QInput',
                'QCard',
                'QCardSection',
                'QCardActions',
                'QSelect',
                'QSeparator',
                'QDialog',
                'QSpace'
            ],

            directives: [
                'Ripple'
            ],

            // Quasar plugins
            plugins: [
                'Notify',
                'Dialog'
            ]
        },

        supportIE: true,

        build: {
            scopeHoisting: true,
            // vueRouterMode: 'history',
            // vueCompiler: true,
            // gzip: true,
            // analyze: true,
            // extractCSS: false,
            extendWebpack (cfg) {
                cfg.module.rules.push({
                    enforce: 'pre',
                    test: /\.(js|vue)$/,
                    loader: 'eslint-loader',
                    exclude: /node_modules/,
                    options: {
                        formatter: require('eslint').CLIEngine.getFormatter('stylish')
                    }
                })
            }
        },

        devServer: {
            https: true,
            port: 8080,
            open: false, // opens browser window automatically
            proxy: {
                '/api': {
                    target: 'https://127.0.0.1:5000/',
                    ws: true,
                    secure: false,
                    changeOrigin: false,
                    logLevel: 'debug'
                },
            }
        },

        // animations: 'all', // --- includes all animations
        animations: [],

        ssr: {
            pwa: false
        },

        pwa: {
            // workboxPluginMode: 'InjectManifest',
            // workboxOptions: {}, // only for NON InjectManifest
            manifest: {
                // name: 'Vue/Quasar taxonomy editor',
                // short_name: 'Vue/Quasar taxonomy editor',
                // description: 'Vue/Quasar taxonomy editor',
                display: 'standalone',
                orientation: 'portrait',
                background_color: '#ffffff',
                theme_color: '#027be3',
                icons: [
                    {
                        'src': 'statics/icons/icon-128x128.png',
                        'sizes': '128x128',
                        'type': 'image/png'
                    },
                    {
                        'src': 'statics/icons/icon-192x192.png',
                        'sizes': '192x192',
                        'type': 'image/png'
                    },
                    {
                        'src': 'statics/icons/icon-256x256.png',
                        'sizes': '256x256',
                        'type': 'image/png'
                    },
                    {
                        'src': 'statics/icons/icon-384x384.png',
                        'sizes': '384x384',
                        'type': 'image/png'
                    },
                    {
                        'src': 'statics/icons/icon-512x512.png',
                        'sizes': '512x512',
                        'type': 'image/png'
                    }
                ]
            }
        },

        cordova: {
            // id: 'org.oarepo.vue_taxonomy_editor',
            // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
        },

        electron: {
            // bundler: 'builder', // or 'packager'

            extendWebpack (cfg) {
                // do something with Electron main process Webpack cfg
                // chainWebpack also available besides this extendWebpack
            },

            packager: {
                // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

                // OS X / Mac App Store
                // appBundleId: '',
                // appCategoryType: '',
                // osxSign: '',
                // protocol: 'myapp://path',

                // Windows only
                // win32metadata: { ... }
            },

            builder: {
                // https://www.electron.build/configuration/configuration

                // appId: 'vue-taxonomy-editor'
            }
        }
    }
}
