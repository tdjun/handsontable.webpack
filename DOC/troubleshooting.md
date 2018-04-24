### 트러블슈팅

#### build시 에러 발생
```
ERROR in Cannot find module 'babel-core'
해결책
npm install --save-dev babel-core
```

```
ERROR in ./~/handsontable/dist/handsontable.full.css
You may need an appropriate loader to handle this file type
해결책
npm install --save-dev style-loader
npm install --save-dev css-loader

webpack.config.js 수정
    module: {
        loaders: [{
            test: /\.css$/,
            include: /node_modules/,
            loaders: ['style-loader', 'css-loader'],
        }],
    }
```