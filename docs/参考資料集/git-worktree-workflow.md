# Gitワークツリーを活用した複数Issue並行開発手順書

## 概要

この手順書は、Gitワークツリー機能を使用して複数のIssueを同時に進行させるワークフローを説明します。ブランチの切り替えなしで、異なるディレクトリで独立して作業できるため、コンテキスト切り替えのオーバーヘッドを減らし、効率的に開発を進められます。

## 前提条件

- Git 2.5以降がインストールされていること
- メインリポジトリがローカルにクローンされていること

## 1. ワークツリーの基本コマンド

```bash
# ワークツリーの一覧表示
git worktree list

# 新しいワークツリーの追加（既存ブランチ）
git worktree add <パス> <ブランチ名>

# 新しいブランチを作成してワークツリーを追加
git worktree add -b <新ブランチ名> <パス> <作成元ブランチ>

# ワークツリーの削除
git worktree remove <パス>

# 不要なワークツリー参照の削除
git worktree prune
```

## 2. 開発開始時の設定

### 2.1 最初のIssue作業用ブランチの作成（通常の方法）

```bash
# リポジトリのメインディレクトリで
git checkout main
git pull origin main  # 最新の状態に更新
git checkout -b issue1  # 1つ目のIssueブランチを作成
```

### 2.2 2つ目以降のIssue用ワークツリーの作成

```bash
# メインリポジトリディレクトリから実行
# ../project-issue2: 親ディレクトリに新しいディレクトリを作成
# -b issue2: 新しいブランチ名
# main: ブランチの作成元（mainから分岐）
git worktree add ../project-issue2 -b issue2 main

# 同様に3つ目以降のIssueも作成可能
git worktree add ../project-issue3 -b issue3 main
```

### 2.3 各ワークツリーでの開発環境セットアップ

各ワークツリーディレクトリで個別に開発環境をセットアップする必要があります。

```bash
# 例: Node.jsプロジェクトの場合
cd ../project-issue2
npm install  # または yarn

# 例: Pythonプロジェクトの場合
cd ../project-issue2
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 3. 日常の開発ワークフロー

### 3.1 Issue間の移動

ブランチの切り替えではなく、ディレクトリの移動で作業対象を切り替えます。

```bash
# 1つ目のIssue作業
cd /path/to/main-repo  # 元のリポジトリディレクトリ

# 2つ目のIssue作業
cd ../project-issue2

# 3つ目のIssue作業
cd ../project-issue3
```

### 3.2 mainブランチの更新を各ワークツリーに反映

メインブランチに更新があった場合、各ワークツリーで個別にマージまたはリベースする必要があります。

```bash
# 各ワークツリーディレクトリで実行
git fetch origin
git merge origin/main  # または git rebase origin/main
```

### 3.3 コミットと変更の保存

各ワークツリーで通常通りGitコマンドを使用します。

```bash
# 変更をステージング
git add .

# コミット
git commit -m "Issue #XXX: 実装内容の説明"

# リモートにプッシュ
git push origin issue2  # ブランチ名を指定
```

## 4. プルリクエスト作成と完了後の処理

### 4.1 プルリクエストの作成

各Issueブランチに対して、通常通りプルリクエストを作成します。

```bash
# GitHub CLIを使用する場合
gh pr create --base main --head issue2 --title "Issue #XXX: タイトル" --body "説明"
```

または、GitHubウェブインターフェイスからプルリクエストを作成します。

### 4.2 レビュー後の変更対応

レビューでの修正が必要な場合、該当するワークツリーディレクトリで変更を加えます。

```bash
cd ../project-issue2
# 修正作業
git add .
git commit -m "レビュー対応: XXXを修正"
git push origin issue2
```

### 4.3 マージ完了後のクリーンアップ

プルリクエストがマージされた後、不要になったワークツリーとブランチを削除します。

```bash
# ワークツリーの削除
git worktree remove ../project-issue2

# リモートブランチの削除（オプション）
git push origin --delete issue2

# ローカルブランチの削除（オプション）
git branch -d issue2

# ワークツリー参照のクリーンアップ
git worktree prune
```

## 5. 応用テクニック

### 5.1 複数人での開発時のワークフロー

チームメンバー間で作業を共有する場合は、以下の点に注意します：

- 各ワークツリーのブランチは通常のGitブランチと同様にリモートと同期できます
- チームメンバーには、このワークフロー全体を説明し、従来のブランチ切り替えとの違いを理解してもらいます

### 5.2 複数のリリースラインの並行管理

製品の複数バージョンを同時にサポートする場合にも有効です：

```bash
# 製品バージョン1.0のサポートブランチ
git worktree add ../product-v1.0 release-1.0

# 製品バージョン2.0の開発ブランチ
git worktree add ../product-v2.0 develop-2.0
```

### 5.3 Claude Codeとの併用

複数のワークツリーで作業を進める場合、Claude Codeも活用できます：

```bash
# 各ワークツリーで別々のClaude Codeセッションを起動
cd /path/to/main-repo
claude

# 別のターミナルウィンドウで
cd ../project-issue2
claude
```

## 6. トラブルシューティング

### 6.1 ワークツリーの移動

ワークツリーのパスを変更する必要がある場合：

```bash
git worktree move ../project-issue2 ../new-location
```

### 6.2 ロックされたワークツリー

何らかの理由でワークツリーがロックされた場合：

```bash
git worktree lock ../project-issue2  # 手動でロック
git worktree unlock ../project-issue2  # ロック解除
```

### 6.3 壊れたワークツリーの修復

ワークツリーが壊れた場合の修復：

```bash
git worktree repair ../project-issue2
```

## 7. ワークツリー管理のベストプラクティス

1. **ディレクトリ名の一貫性**: Issueやタスクを識別しやすい命名規則を使用する
2. **定期的な同期**: 各ワークツリーで定期的に `git fetch` を実行し、リモートの変更を同期する
3. **不要なワークツリーの削除**: 完了したタスクのワークツリーは速やかに削除する
4. **ワークツリーの数の管理**: あまりに多くのワークツリーを作成しないよう注意する（5〜10個程度が管理しやすい）
5. **IDE設定の分離**: 各ワークツリーで個別のIDE設定を持たせる（可能な場合）
