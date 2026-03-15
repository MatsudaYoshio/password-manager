# Testing Strategy (テスト戦略・ガイドライン)

本リポジトリでは、**Jest** および **React Testing Library** を用いた自動テストにより、コードベースの信頼性を維持します。AIエージェントがテストコードを生成・レビューする際は、全てにおいて**可読性・一貫性・保守性**を重視し、以下のガイドラインに従うこと。

## 🧩 テスト構造の基本 (Test Structure)

### Given-When-Thenパターンの適用
すべてのテストケースは以下の3つのフェーズに従う：

```typescript
// Given: 前提条件の設定
// When: テスト対象の実行
// Then: 結果の検証
```

- 各フェーズを明確にコメントで区切ること。
- フェーズが複数回出てくる場合は、**テストが複数のユニットの振る舞いを一度に検証している可能性**が高いため、可能な限りテストケースを分割すること。

### 実行フェーズのシンプルさ
- `When`フェーズが1行で記述できない場合、**テスト対象のAPI設計に問題がある可能性**が高い。
- その場合、不変条件の侵害やカプセル化の欠如を疑うこと（※ユーティリティやインフラ系コードは例外あり）。

---

## 🧠 テスト記述の原則 (Testing Principles)

### System Under Test（SUT）
- テスト対象システム（コンポーネントや関数など）は必ず `sut` という変数名で表すこと。これによりテストの可読性が向上する。

### テストの独立性と制御構文の制限
- **1つのテストケースの修正が他のテストケースに影響を与えない**ようにする。
- テストメソッド内では **`if`文を使用しない**。条件分岐が必要な場合は別のテストケースに分離する。

### 変化しないテストを目指す
- 実装詳細ではなく、公開される振る舞いに対してテストを書く。挙動の変更以外の不具合修正、リファクタリング、新機能追加では、既存テストをできるだけ修正せずに済む設計を目指す。

### テスト内ロジックは自明にする
- テストに複雑なロジックや、ひと目で理解しにくいロジックを持ち込まない。
- テストコードを見た瞬間に、期待値が妥当か判断できる記述を優先する。

```typescript
// 悪い例（計算ロジックを持ち込んでいる）
expect(nav.getCurrentUrl()).toBe(baseUrl + "/albums");

// 良い例（具体的な期待値を直接書いている）
expect(nav.getCurrentUrl()).toBe("http://photos.google.com/albums");
```

### DRYとDAMPはWhatとHowで使い分ける
- `What（何をテストしているか／何をするコードか）` は **DAMP** (Descriptive And Meaningful Phrases) を重視し、意図が一目で伝わる記述にする（例：「0で割るとエラーになる」）。
- `How（どう実現するか／実装の細部）` は **DRY** (Don't Repeat Yourself) を重視し、テストデータ生成や共通セットアップ関数を適切に共通化する。ただし過度な抽象化で意図が読みにくくなる共通化は避ける。

---

## 🧰 テストデータ（Fixture）の扱い

### Fixtureの共通化
- 複数のテストから同じFixtureを使う場合は、**コンストラクタ(`beforeEach`等)ではなくファクトリメソッド**で共通化する。
- ただし、すべてのテストケースで同一Fixtureを使う場合に限り、`beforeEach` などのセットアップフェーズを使用しても良い。

---

## 🏷️ テストメソッド命名規則 (Naming Conventions)

### 命名の基本方針
- 厳格な命名規則に縛られず、**自然言語に近い表現**で振る舞いを記述する。
- **非開発者（ドメインエキスパート）でも意味がわかる名前**を心がける。
- 1つのテストは「1単位の振る舞い」を検証するもの。複数の責務を含むテストは分割する。
- 単語の区切りには **アンダースコア `_`** を使用する。

```typescript
// 悪い例
it('isDeliveryValid_InvalidDate_ReturnsFalse', () => { ... })

// 良い例
it('delivery_with_a_past_date_is_invalid', () => { ... })
```

---

## 🧾 アサーションと表現力 (Assertions)

- Jestの `expect` や `@testing-library/jest-dom` など、自然言語的なアサーションAPIを活用し、可能な限り「英文のように読めるテストコード」を目指す。

---

## 🧪 テストの種類と選択指針

1. **出力値ベーステスト（推奨）**: `sut` に入力を与え、戻り値を検証するシンプルなテスト。隠れた入出力がないコードに適している。
2. **状態ベーステスト**: `sut` と協力者オブジェクト（例：DB）の状態変化を検証するテスト。
3. **コミュニケーションベーステスト**: モックを使用して通信内容を検証するテスト。
> 原則として、できるだけ多くのテストケースを出力値ベースにすること。

---

## 🧱 モック利用の方針 (Mocking Strategy)

### モックを使う条件
- **システム間コミュニケーション（アプリケーション境界を超える通信）**に限定する。
- その通信の副作用が**外部から観察可能な場合**のみモックを使用する。

### 管理下にある依存とない依存
- **管理下にある依存**：テスト対象アプリケーション経由でしかアクセスできないプロセス外依存（例：アプリケーション専用のDB）。
  → **実際の依存を使用する**
- **管理下にない依存**：他アプリケーションからもアクセスされるプロセス外依存（例：外部APIやメールサービス）。
  → **モックを使用する**

### モックの使用ルール
- モック対象はシステム境界の型に限定。サードパーティ製ライブラリを直接モックせず、アダプタ層などを挟んでモックする。
- モック呼び出し回数（`toHaveBeenCalledTimes`）を**常に検証**し、想定外の呼び出しがないかも保証する。

### Electronと環境面へのモック
- レンダラープロセスのテストはjsdom（DOM環境）で動くため、ElectronネイティブのAPIが存在しない。必ず `window.electronAPI` などを `jest.mock()` やダミー関数でモックする。

---

## 🚫 プライベートメソッド / 💡 ドメイン知識

- **プライベートメソッド**: 原則として単体テストを作成せず、公開API(public)を通じて間接的に検証する。
- **ドメイン知識**: テストコードにドメイン知識を漏洩させない。プロダクションコードのロジックをコピーせず、期待値は直接記述する。テストのためにプロダクションコードを改変しないこと。

---

## ⚛️ React Components (Renderer Process) Guidelines

Reactコンポーネントのテストには `@testing-library/react` を使用する。

1. **Rendering**: `render` 関数を使用する。Redux等のプロバイダが必要な場合は、適宜ラップ関数を用意する。
2. **User Interaction**: raw `fireEvent` ではなく `@testing-library/user-event` を使用して、実ブラウザの挙動を模倣する。
3. **Assertions**: `@testing-library/jest-dom` のマッチャー（ `toBeInTheDocument()` や `toHaveTextContent()` ）を利用する。

**📝 実装例:**
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
    it('calls_onClick_when_button_is_pressed', async () => {
        // Given
        const user = userEvent.setup();
        const mockFn = jest.fn();
        render(<MyComponent onClick={mockFn} />);
        const sut = screen.getByRole('button', { name: /Submit/i });
        
        // When
        await user.click(sut);
        
        // Then
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});
```

---

## ⚙️ Runner & Structure
- **CI / Build**: テストはGitHub Actions (`npm run test:ci`) により自動実行される。ローカルで成功しCIで落ちる場合は、依存先ノードの型（`@types/jest`等）を疑うこと。
- **配置**: テストファイルは対象ソースと同ディレクトリの `__tests__` に `[filename].test.ts` か `.tsx` として配置する。
