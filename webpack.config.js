const path = require('path')
const webpackConfig = require('@nextcloud/webpack-vue-config')

const isDev = process.env.NODE_ENV === 'development'

webpackConfig.devtool = isDev ? 'cheap-source-map' : 'source-map'

webpackConfig.stats = {
    colors: true,
    modules: false,
}

const appId = 'mediadc'

webpackConfig.entry = {
    main: {
        import: path.join(__dirname, 'src', 'main.js'),
        filename: `${appId}-main.js`,
    },
    settings: {
        import: path.join(__dirname, 'src', 'main-admin-settings.js'),
        filename: `${appId}-settings.js`,
    },
    dashboard: {
        import: path.join(__dirname, 'src', 'main-dashboard.js'),
        filename: `${appId}-dashboard.js`,
    },
    filesplugin: {
        import: path.join(__dirname, 'src', 'filesplugin.js'),
        filename: `${appId}-filesplugin.js`,
    },
}

module.exports = webpackConfig
