# jma-subscriber

気象庁が[公開](http://xml.kishou.go.jp/open_trial/index.html)している「気象庁防災情報XMLフォーマット形式電文」を受信してPushbullet経由で通知するプログラム(AWS API Gateway + Lambda)。

## Description

気象庁では、PubSubHubbubという仕組みを使ってpublisher(気象庁)がHUB(Google Alert Hub)に登録した情報をsubscriber(利用者)へpush配信しています。
![jma-PubSubHubbub](http://xml.kishou.go.jp/open_trial/pubsub.png)

このsubscriber登録と実際の配信をAWS API GatewayとLambdaを使って受信し、Pushbullet経由でpush通知します。

## Features

- publisherからのsubscriber登録確認に応答する
- publisherから配信されるXML電文をPushbulletに通知する

## Requirement

- AWS CLI
- AWS API Gateway
- AWS Lambda (nodejs4.3)
- Pushbullet Access Token
- Node 4.3+

## Installation

1. 事前作業
  - PushbulletのAccess Tokenを取得しておく
  - AWS CLIが使えるようにしておく(CLIユーザーには**iam:PassRole**と**lambda:UpdateFunctionCode**の許可が必要)

2. API Gatewayの作成
  - リソースは作っても作らなくてもいい
  - メソッド**GET**の作成。Lambda関数は`jma-subscriber`、統合リクエストのマッピングテンプレート`application/json`に以下を指定

    ```javascript
    {
      "hub.verify_token": "$input.params('hub.verify_token')",
      "hub.challenge": "$input.params('hub.challenge')",
      "hub.topic": "$input.params('hub.topic')",
      "hub.mode": "$input.params('hub.mode')",
      "hub.lease_seconds": "$input.params('hub.lease_seconds')"
    }
    ```

  - 統合レスポンスのコード200のマッピングテンプレートを`text/plain`に変更して、以下を指定。

    ```
    #set($allParams = $input.params())
    #set($query = $allParams.get('querystring'))
    $util.escapeJavaScript($query.get('hub.challenge'))
    ```

  - メソッド**POST**の作成。Lambda関数は`jma-subscriber`、統合リクエストのマッピングテンプレート`application/atom+xml`に以下を指定

    `{"body" : $input.json('$')}`

  - APIをデプロイするとEndpointのURLが作られるのでメモしておく、このアドレスを気象庁へメールする。

3. Lambda関数の作成
  - 関数名は「jma-subscriber」、Descriptionを`{"pushbullet_key":"YOUR_ACCESS_TOKEN"}`とする。（Lambdaが環境変数を扱えないため）
  - Runtimeは**Node.js 4.3**、Memoryは128MBで十分、Timeoutは10秒くらいでいいと思う
  - ロール（Basic Execution Roleにしたなら**lambda_basic_execution**のはず）には**iam:PassRole**と**lambda:GetFunctionConfiguration**の許可しておく

4. Lambda関数のアップロード
    ```
    $ git clone https://github.com/hiro88hyo/node-jma-subscriber.git
    $ cd node-jma-subscriber
    $ npm install
    $ npm run build
    $ npm run publish
    ```

## その他

  - subscriberの構築ついては[ここ](http://xml.kishou.go.jp/open_trial/detailinformation.pdf)に記載があります
  - 通知にはPushbulletを使っていますが、LINEなりtwitterなりにもできると思います

## License

[MIT](http://b4b4r07.mit-license.org)
