# WebTransportサンプル

## 準備

Mac、およびGoogle Chromeでの実行方法を記載します。
HTTP/3での接続を行うので、https接続が必須となるため、必要な手順です。

```
# 自己証明書の作成
$ openssl req -newkey rsa:2048 -nodes -keyout certificate.key -x509 -out certificate.pem -subj '/CN=Test Certificate' -addext "subjectAltName = DNS:localhost"
$ openssl x509 -pubkey -noout -in certificate.pem | openssl rsa -pubin -outform der | openssl dgst -sha256 -binary | base64
```

```
# 上記で出力された値を<FINGERPRINT>に記載して、Google Chromeを起動する
# これにより、作成した自己証明書でhttps接続ができます。
$ /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --ignore-certificate-errors-spki-list=<FIGNERPRINT> --ignore-certificate-errors --v=2 --enable-logging=stderr --origin-to-force-quic-on=127.0.0.1:4433
```

## サーバの起動

```
# サーバサイドのサーバの起動
$ cd server
$ npm run dev
```

```
# クライアントサイドのサーバの起動
$ cd client
$ npm run dev
```

## 接続

* 起動したChromeから、 `http://localhost:8080` にアクセスする
* Chromeのデベロッパーツールのコンソールを開き、ログとして受信の通知が出ていることを確認する
