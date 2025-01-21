exports.onCreateWebpackConfig = ({ actions }) => {
    actions.setWebpackConfig({
      resolve: {
        fallback: {
          crypto: require.resolve('crypto-browserify'),
        },
      },
      plugins: [
        new (require('webpack')).DefinePlugin({
          'process.env.NODE_OPTIONS': JSON.stringify('--openssl-legacy-provider'),
        }),
      ],
    });
  };
  