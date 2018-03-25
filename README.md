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

### 環境設定ファイル

環境設定ファイルには以下の情報を記載します。

* kintoneサイト情報
* kintoneにデプロイするファイルの情報
* アプリ内で参照する共通変数

環境設定ファイルは本番用／開発用に分けて作成できます。

* 本番用： env/prod.env.json ・・・デフォルトで参照される
* 開発用： env/dev.env.json

作成例

```prod.env.json
{
  "apps": {
    "customers": 81,
    "schedule": 85
  },
  "subdomain": "1234x",
  "auth": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "props": {
    "otherApiKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  },
  "contentsPath": "./dist/prod",
  "contents": {
    "customers": {
      "desktop": {
        "js": [
          "https://js.cybozu.com/vuejs/v2.5.11/vue.min.js",
          "js/customers.js"
        ],
        "css": [
          "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
          "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
          "css/customers.css"
        ]
      },
      "mobile": {
        "js": [
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

* apps: kintoneアプリ名（任意の名称）と、kintoneアプリIDを記載
* subdomain: kintoneサブドメイン（https://xxxxxx.cybozu.com/k/ のｘｘｘｘｘｘ部分）
* auth: BASIC認証キー（後述）
* props: アプリ内で使用する共通変数（後述）
* contentsPath: デプロイ元ソースの場所
* contents: 各アプリにデプロイするファイルの情報。外部参照の場合はURLを記載
* contents.アプリ名.desktop.js: デスクトップアプリ用JavaScriptファイル
* contents.アプリ名.desktop.css: デスクトップアプリ用CSSファイル（Sassファイルの拡張子を.scss→.cssに変えて記載）
* contents.アプリ名.mobile.js: モバイルアプリ用JavaScriptファイル

### BASIC認証キー
BASIC認証キーは、kintoneのユーザー・パスワードをBase６４エンコードして生成します。

（https://developer.cybozu.io/hc/ja/articles/201941754#step8 を参照。）

＊ Macの場合

```
$ echo 'username:password' | base64
```

＊ Windowsの場合、 https://qiita.com/Jinshichi/items/9aba17a2a06bf96c0122 等を参考にして生成してください。

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
