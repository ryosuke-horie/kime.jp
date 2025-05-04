import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="font-bold text-lg">Kime.jp</div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 container">
        <div className="flex flex-col gap-8 items-center">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Shadcn/UI コンポーネント
          </h1>
          <p className="text-xl text-muted-foreground">
            Next.js + Tailwind CSS + Shadcn/UI のデモページです
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full">
            <Card>
              <CardHeader>
                <CardTitle>ボタンコンポーネント</CardTitle>
                <CardDescription>
                  様々なスタイルと状態のボタンを使用できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button>デフォルト</Button>
                  <Button variant="secondary">セカンダリ</Button>
                  <Button variant="outline">アウトライン</Button>
                  <Button variant="destructive">デストラクティブ</Button>
                  <Button variant="ghost">ゴースト</Button>
                  <Button variant="link">リンク</Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/reserve">予約ページへ</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>カードコンポーネント</CardTitle>
                <CardDescription>
                  情報を整理して表示するためのカードUIです
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  カードはコンテンツを整理するための基本的なUIコンポーネントです。
                  ヘッダー、コンテンツ、フッターなどのセクションに分かれています。
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">キャンセル</Button>
                <Button size="sm">保存</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>テーマ切り替え</CardTitle>
                <CardDescription>
                  ライト/ダークモードに対応しています
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  右上のアイコンをクリックするとテーマを切り替えることができます。
                  システム設定に合わせた自動切り替えにも対応しています。
                </p>
              </CardContent>
              <CardFooter>
                <ThemeToggle />
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex h-16 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Kime.jp All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
