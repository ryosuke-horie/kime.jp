指定されたURLにアクセスしてPlaywright MCPを利用した探索的テストを行います。: $ARGUMENTS

## 前提条件

- 単体テストや型定義はチェックにパスしていることとします。
- ローカルサーバーは別セッションにおいて起動済みです。

## STEP

以下STEPに従います。

1. 指定したURLにアクセスします。
2. UIなどを触りながらシステムの動作やバグを探索的に発見します。
3. 発見したバグはghコマンドを利用しIssueに1つずつ起票します。
4. 動作によってリダイレクトしたり関連のある機能だと判断できる場合、ページ遷移しても構いません
5. 必要であればスクリーンショットを撮って比較やIssueの説明等に利用してください。
