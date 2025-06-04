/**
 * Buttonコンポーネントのテスト
 * Issue #360 フロントエンドテスト環境構築の実装例
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('基本的なレンダリングが正しく動作する', () => {
    render(<Button>テストボタン</Button>)
    
    const button = screen.getByRole('button', { name: 'テストボタン' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('テストボタン')
  })

  it('異なるvariantが正しく適用される', () => {
    const { rerender } = render(<Button variant="default">デフォルト</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    
    rerender(<Button variant="destructive">削除</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive', 'text-white')
    
    rerender(<Button variant="outline">アウトライン</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'bg-background')
  })

  it('異なるsizeが正しく適用される', () => {
    const { rerender } = render(<Button size="default">デフォルト</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-9', 'px-4', 'py-2')
    
    rerender(<Button size="sm">小さい</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-8', 'px-3')
    
    rerender(<Button size="lg">大きい</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'px-6')
  })

  it('クリックイベントが正しく動作する', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick}>クリック</Button>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled状態が正しく動作する', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Button disabled onClick={handleClick}>無効</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    
    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('asChildプロパティが正しく動作する', () => {
    render(
      <Button asChild>
        <a href="/test">リンクボタン</a>
      </Button>
    )
    
    const link = screen.getByRole('link', { name: 'リンクボタン' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('カスタムclassNameが正しく適用される', () => {
    render(<Button className="custom-class">カスタム</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('inline-flex') // 基本クラスも保持
  })

  it('data-slot属性が設定される', () => {
    render(<Button>テスト</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-slot', 'button')
  })
})