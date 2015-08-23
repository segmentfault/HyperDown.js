module.exports = {
    entry: "./src/Parser.js",
    output: {
        path: __dirname,
        filename: "hyperdown.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel"
            }
        ]
    }
};
