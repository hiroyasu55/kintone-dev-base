# kintone-dev-base
kintoneアプリ開発用ベース

## Description
kintoneアプリ開発の雛形です。

* webpack/gulpによる、ES６・SASSのトランスパイル
* kintoneへのデプロイをスクリプトにより実行

## Requirement
* Node.js
* npm
* npx (npm 5.2.0以上ならnpmにバンドルされる）

## Download
このリポジトリをダウンロードし、フォルダ名をアプリ名称に変更します。

```
$ git clone git://github.com/logicheart/kintone-dev-base.git
$ mv kintone-dev-base my-app
```

##　Directory
```
kintone-dev-base (my-app)
├── env
│   ├── dev.env.json ・・・環境設定ファイル（開発環境用） ←自分で作成
│   ├── prod.env.json ・・・環境設定ファイル（本番環境用） ←自分で作成
│   └── prod.env.json.sample ・・・環境設定ファイル（本番環境用）のサンプル
├── src
│   ├── app ・・・kintoneアプリJavaScriptファイル
│   │   ├── customers.js
│   │   ├── customersMobile.js
│   │   └── schedule.js
│   └── styles ・・・kintoneアプリsassファイル
│       └── customers.scss
├── dist ・・・kintoneにデプロイするJavaScriptファイル （ビルド後に生成）
│   ├── dev
│   │   ├── js
│   │   │   ├── customers.js
│   │   │   ├── customersMobile.js
│   │   │   └── schedule.js
│   │   └── css
│   │       └── customers.css
│   └── prod
│       ├── js
│       │   ├── customers.js
│       │   ├── customersMobile.js
│       │   └── schedule.js
│       └── css
│           └── customers.css
├── .env ・・・環境設定ファイル ←自分で作成
├── .env.sample ・・・環境設定ファイルのサンプル
├── deploy.sh ・・・デプロイ用スクリプト
└── README.md
```

（主要なファイルを抜粋）

## Development　works

### npmライブラリインストール
必要なライブラリをインストールします。

```
$ cd my-app
$ npm install
```

### BASIC認証キー作成
BASIC認証キーは kintoneのユーザー・パスワードをBase６４エンコードした文字列です。

BASIC認証については https://developer.cybozu.io/hc/ja/articles/201941754#step8 を参照。

＊ Macの場合

```
$ echo "Basic $(echo 'username:password' | base64)"
```

＊ Windowsの場合、 https://qiita.com/Jinshichi/items/9aba17a2a06bf96c0122 等を参考にして生成してください。

### 環境設定ファイル

環境設定ファイルには以下の情報を記載します。

* kintoneサイト情報
* kintoneにデプロイするファイルの情報
* アプリ内で参照する共通変数

本番用： env/prod.env.json  ・・・env/prod.env.json.sampleをコピーして作成します。
開発用： env/dev.env.json

```prod.env.json
{
  "apps": {  ・・・ "kintoneアプリ名（任意の名称）": kintoneアプリID の形で記載する
    "customers": 81,
    "schedule": 85
  },
  "subdomain": "1234x",　　　　  ・・・ kintoneサブドメイン
  "auth": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",  ・・・ BASIC認証キー（上記で作成したもの）
  "props": {  ・・・ アプリ内で使用する共通変数。kintoneEnv.propsで参照できる（後述）
    "otherApiKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  },
  // デプロイ元ソースの場所
  "contentsPath": "./dist/prod",
  // 各アプリにデプロイするファイルの情報
  "contents": {
    "customers": {
      "desktop": {
        "js": [  ・・・デスクトップアプリ用JavaScriptファイル。外部参照の場合はURLを記載
          "https://js.cybozu.com/vuejs/v2.5.11/vue.min.js",
          "js/customers.js"
        ],
        "css": [  ・・・デスクトップアプリ用CSSファイル（Sassファイルの拡張子を.scss→.cssに変えて記載）
          "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
          "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
          "css/customers.css"
        ]
      },
      "mobile": {
        "js": [  ・・・モバイルアプリ用JavaScriptファイル
          "js/customersMobile.js"
        ]
      }
    },
    "schedule": {
      "desktop": {
        "js": [
          "https://apis.google.com/js/api.js",
          "js/schedule.js"
        ],
        "css": [
        ]
      }
    }
  }
}
```

### 共通変数
環境設定ファイルに記載したapps、propsの値は、グローバル変数"kintoneEnv"として各kintone JavaScriptで参照できます。

```
console.log(kintoneEnv.apps.customers)  // ８１
console.log(kintoneEnv.props.otherApiKey)  // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ビルド
srcディレクトリ下のファイルを編集した後、gulpを実行してビルドします。

```
$ npx gulp
```

dist/prod（またはdist/dev）下にビルド後のJavaScript・CSSファイルが出力されます。

* ソースの変更を監視しプラグインファイルを自動生成する場合

```
$ npx gulp　ｗａｔｃｈ
```

### デプロイ
dist下に出力されたJavaScript/CSSファイルをkintoneにデプロイします。

```
$ node deploy.js  # 全アプリのデプロイ
$ node deploy.js customers # アプリ名を指定してデプロイ
```

### 本番／開発環境の切り替え
デフォルトでは本番用環境設定ファイル（prod.env.json）を参照しますが、環境変数KINTONE_ENV=developmentを指定することで開発用環境設定ファイル（dev.env.json）の設定が有効になります。

環境変数KINTONE_ENVは.envファイルに記述します。

```.env
KINTONE_ENV=development
```

もしくはビルド・デプロイの実行時コマンドに環境変数KINTONE_ENV=developmentを付与します。

```
$ KINTONE_ENV=development npx gulp
$ KINTONE_ENV=development node deploy.js
```

## Reference
* kintone JavaScriptカスタマイズのためのwebpackビルド環境（Dropbox併用） https://qiita.com/the_red/items/bd5270099443dc21410e
* R3 kintone js deployerを使ってkintoneカスタマイズをハッピーに！ https://qiita.com/ha_ru_ma_ki/items/d7c58a2929c14a55fb5e

## Licence

MIT License

## Copyright

Copyright(c) LogicHeart
