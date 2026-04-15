# 実装計画：定点撮影ガイドWebアプリ（construction-photo-guide）

## 概要

React + TypeScript によるフロントエンド専用Webアプリの実装計画。  
バックエンド・DBは使用せず、全処理をブラウザ内で完結させる。  
モバイルファースト設計で、スマートフォン（375px〜430px幅）での動作を優先する。

---

## タスク一覧

- [x] 1. プロジェクト基盤のセットアップ
  - Vite + React + TypeScript でプロジェクトを初期化する
  - `fast-check`（プロパティテスト）、`vitest`、`@testing-library/react` をインストールする
  - `heic2any` ライブラリをインストールする
  - `src/types/index.ts` に `Marker` 型と `AppContextValue` 型を定義する
  - `src/context/AppContext.tsx` に React Context と Provider を実装する（`referenceImage`、`referenceImageUrl`、`markers`、`showMarkers` を管理）
  - グローバルCSSリセットとモバイルファーストの基本スタイルを設定する（`viewport` メタタグ含む）
  - _要件: 11章（状態管理）、8-1（ユーザビリティ）_

- [x] 2. 座標変換ユーティリティの実装
  - [x] 2.1 座標変換関数を実装する
    - `src/utils/coordinates.ts` を作成する
    - `normalizeCoordinate(pixelX, pixelY, containerWidth, containerHeight): { x: number; y: number }` を実装する（クリック座標 → 相対座標 0.0〜1.0）
    - `toPixelCoordinate(relX, relY, containerWidth, containerHeight): { x: number; y: number }` を実装する（相対座標 → ピクセル座標）
    - _要件: 8-3（目印座標の精度）、12-3（目印の座標管理）_

  - [x] 2.2 Property 1 のプロパティテストを書く
    - **Property 1: 目印座標の正規化**
    - 任意の表示サイズと任意のクリック座標に対して、正規化後の座標が [0.0, 1.0] の範囲内であることを検証する
    - **Validates: Requirements 8-3.1**

  - [x] 2.3 Property 2 のプロパティテストを書く
    - **Property 2: 目印座標のラウンドトリップ**
    - 任意の相対座標と任意の表示サイズに対して、ピクセル変換 → 相対座標変換のラウンドトリップが元の値を保持することを検証する
    - **Validates: Requirements 8-3.2**

- [x] 3. 目印（Marker）状態管理の実装
  - [x] 3.1 AppContext に目印の追加・削除ロジックを実装する
    - `addMarker(x: number, y: number): void` を実装する（`crypto.randomUUID()` でIDを生成）
    - `removeMarker(id: string): void` を実装する
    - _要件: F-02、F-03、11章_

  - [x] 3.2 Property 3 のプロパティテストを書く
    - **Property 3: 目印追加の不変条件**
    - 任意の目印リストに対して、有効な相対座標で追加した後にリスト長が1増加し、追加した目印が含まれることを検証する
    - **Validates: Requirements F-02**

  - [x] 3.3 Property 4 のプロパティテストを書く
    - **Property 4: 目印削除の不変条件**
    - 任意の目印リストに対して、存在するIDで削除した後にリスト長が1減少し、削除した目印が含まれないことを検証する
    - **Validates: Requirements F-03**

- [x] 4. チェックポイント — ユーティリティとContext のテストが通ることを確認する
  - 全テストが通ることを確認する。問題があればユーザーに確認する。

- [x] 5. 画像アップロード機能の実装（F-01）
  - [x] 5.1 `ImageUploader` コンポーネントを実装する
    - `src/components/ImageUploader.tsx` を作成する
    - `<input type="file" accept="image/*">` でファイル選択UIを実装する
    - HEIC形式を検出し `heic2any` でJPEGに変換する処理を実装する
    - `URL.createObjectURL()` でObjectURLを生成し、`onImageSelected` コールバックを呼び出す
    - 前のObjectURLを `URL.revokeObjectURL()` で解放するメモリ管理を実装する
    - 大容量画像（10MB超）は `<canvas>` を使って最大2048pxにリサイズしてから使用する
    - ローディング状態とエラーメッセージの表示を実装する
    - _要件: F-01、12-5（HEIC対応）、13章（リスク対策）_

  - [x] 5.2 `ImageUploader` のユニットテストを書く
    - ファイル選択時にObjectURLが生成されること
    - HEIC変換失敗時にエラーメッセージが表示されること
    - _要件: F-01_

- [x] 6. 目印配置・削除UIの実装（F-02、F-03）
  - [x] 6.1 `MarkerDot` コンポーネントを実装する
    - `src/components/MarkerDot.tsx` を作成する
    - `marker.x * containerSize.width`、`marker.y * containerSize.height` で絶対配置する
    - タップ/クリックで `onRemove(marker.id)` を呼び出す
    - 最小タップ領域 44×44px を確保する
    - _要件: F-03、8-1（タップ領域）_

  - [x] 6.2 `MarkerCanvas` コンポーネントを実装する
    - `src/components/MarkerCanvas.tsx` を作成する
    - 参照画像を `<img>` で表示し、その上に `MarkerDot` を絶対配置で重ねる
    - `getBoundingClientRect()` でコンテナサイズを取得し、クリック座標を相対座標に変換する
    - `ResizeObserver` でコンテナサイズ変更を監視し、目印位置を再計算する
    - 画像未選択時はプレースホルダーを表示する
    - _要件: F-02、F-03、8-3（座標精度）、12-3（座標管理）_

  - [x] 6.3 `MarkerCanvas` のユニットテストを書く
    - クリック座標が正しく相対座標に変換されること（具体的な数値例）
    - _要件: F-02、8-3_

- [x] 7. ホーム画面（SCR-01）の組み立て
  - [x] 7.1 `ActionBar` コンポーネントを実装する
    - `src/components/ActionBar.tsx` を作成する
    - 目印表示切替ボタン（トグル）を実装する
    - 「撮影開始」ボタンを実装する（参照画像未選択時は `disabled`）
    - _要件: F-04、F-05、8-1_

  - [x] 7.2 `HomeScreen` ページコンポーネントを実装する
    - `src/screens/HomeScreen.tsx` を作成する
    - `ImageUploader`、`MarkerCanvas`、`ActionBar` を縦1カラムで配置する
    - 「撮影開始」ボタンを画面下部に sticky 配置する
    - AppContext から `referenceImageUrl`、`markers`、`showMarkers` を取得して各コンポーネントに渡す
    - _要件: SCR-01、7-2、9章_

  - [x] 7.3 `ActionBar` のユニットテストを書く
    - 参照画像未選択時に撮影開始ボタンが disabled になること
    - _要件: F-05_

- [x] 8. チェックポイント — ホーム画面の動作確認
  - 全テストが通ることを確認する。問題があればユーザーに確認する。

- [x] 9. カメラ起動機能の実装（F-06）
  - [x] 9.1 `CameraView` コンポーネントを実装する
    - `src/components/CameraView.tsx` を作成する
    - `useEffect` でマウント時に `getUserMedia({ video: { facingMode: 'environment' } })` を呼び出す
    - 取得したストリームを `<video>` 要素にセットし、`onStreamReady` コールバックを呼び出す
    - アンマウント時のクリーンアップで `stream.getTracks().forEach(t => t.stop())` を実行する
    - getUserMedia 非対応ブラウザ・権限拒否時は `onError` でエラーメッセージを通知する
    - カメラ起動中はローディング表示を行う
    - _要件: F-06、8-2（互換性）、12-1（カメラ制御）、13章（リスク対策）_

  - [x] 9.2 `CameraView` のユニットテストを書く
    - getUserMedia 非対応時にエラーコールバックが呼ばれること
    - アンマウント時にストリームが停止されること
    - _要件: F-06、8-2_

- [x] 10. オーバーレイ描画機能の実装（F-07、F-09、F-10）
  - [x] 10.1 `OverlayCanvas` コンポーネントを実装する
    - `src/components/OverlayCanvas.tsx` を作成する
    - `requestAnimationFrame` ループで毎フレーム以下の順で描画する:
      1. `ctx.drawImage(videoEl, ...)` でカメラ映像を描画
      2. `ctx.globalAlpha = opacity` を設定し `ctx.drawImage(refImage, ...)` で参照画像を描画
      3. `showMarkers` が true なら目印を円で描画
      4. `showGrid` が true なら三分割グリッドを描画
    - `ResizeObserver` で canvas サイズを video 要素に同期する
    - コンポーネントのアンマウント時に `cancelAnimationFrame` でループを停止する
    - _要件: F-07、F-09、F-10、12-2（オーバーレイ描画）_

  - [x] 10.2 透明度調整スライダー `OpacitySlider` を実装する
    - `src/components/OpacitySlider.tsx` を作成する
    - `<input type="range" min="0" max="100">` で透明度（0〜100%）を調整する
    - `onChange` で `value / 100` を親に渡す（0.0〜1.0 に変換）
    - _要件: F-08_

- [x] 11. 撮影・ダウンロード機能の実装（F-11、F-12）
  - [x] 11.1 `ShutterButton` コンポーネントを実装する
    - `src/components/ShutterButton.tsx` を作成する
    - 直径72px以上の円形ボタンを実装する
    - `disabled` 時（カメラ未起動）はタップ不可にする
    - _要件: F-11、8-1（タップ領域）_

  - [x] 11.2 `OverlayCanvas` に撮影処理を追加する
    - `canvas.toBlob('image/jpeg', 0.95)` で撮影画像を取得する処理を実装する
    - 取得した Blob を `onCapture` コールバックで親に渡す
    - _要件: F-11、12-4（撮影処理）_

  - [x] 11.3 ダウンロードユーティリティを実装する
    - `src/utils/download.ts` を作成する
    - `downloadBlob(blob: Blob, filename: string): void` を実装する（`<a download>` 要素を動的生成してクリック）
    - _要件: F-12、12-4（ダウンロード処理）_

  - [x] 11.4 ダウンロードユーティリティのユニットテストを書く
    - `downloadBlob` が `<a>` 要素を生成してクリックすること
    - _要件: F-12_

- [x] 12. カメラ撮影画面（SCR-02）の組み立て
  - [x] 12.1 `CameraScreen` ページコンポーネントを実装する
    - `src/screens/CameraScreen.tsx` を作成する
    - `<video>` と `<canvas>` を同一の親要素内に `position: absolute` で重ねる（親は `aspect-ratio: 4/3`）
    - `CameraView`、`OverlayCanvas`、`OpacitySlider`、`ShutterButton` を配置する
    - `streamRef`（useRef）でカメラストリームを管理し、戻るボタン押下時に停止する
    - `overlayOpacity`、`showGrid`、`capturedBlob`、`showModal`、`cameraError` をローカル state で管理する
    - AppContext から `referenceImageUrl`、`markers`、`showMarkers` を取得する
    - _要件: SCR-02、7-3、12-1〜12-4_

  - [x] 12.2 `App.tsx` に画面遷移ロジックを実装する
    - `currentScreen` state（`'home' | 'camera'`）で画面を切り替える
    - `HomeScreen` → `CameraScreen` への遷移（参照画像選択済みの場合のみ）
    - `CameraScreen` → `HomeScreen` への戻り（参照画像・目印を保持）
    - `AppContext.Provider` でアプリ全体をラップする
    - _要件: 10章（画面遷移）_

- [x] 13. チェックポイント — カメラ撮影画面の動作確認
  - 全テストが通ることを確認する。問題があればユーザーに確認する。

- [ ] 14. 撮影結果確認モーダルの実装（SCR-03、F-14〜F-16）（任意）
  - [ ] 14.1 `ResultModal` コンポーネントを実装する
    - `src/components/ResultModal.tsx` を作成する
    - 撮影結果画像のプレビューを表示する（`URL.createObjectURL(blob)` でURL生成）
    - 「撮影結果のみ」「ガイド付き（オーバーレイ込み）」のダウンロード種別選択UIを実装する
    - ダウンロードボタンで `downloadBlob` を呼び出す
    - 再撮影ボタンでモーダルを閉じる
    - アンマウント時に `URL.revokeObjectURL()` で解放する
    - _要件: SCR-03、F-14、F-15、F-16_

  - [ ] 14.2 `ResultModal` のユニットテストを書く
    - ダウンロード種別の選択が正しく反映されること
    - _要件: F-15_

  - [ ] 14.3 `CameraScreen` に `ResultModal` を組み込む
    - シャッター後に `showModal: true` にしてモーダルを表示する
    - ガイド付き画像用に `overlayBlob`（canvas 全体のキャプチャ）を生成する処理を追加する
    - _要件: SCR-03、F-14〜F-16_

- [x] 15. モバイルブラウザ対応の確認と調整
  - [x] 15.1 レスポンシブレイアウトを調整する
    - 375px〜430px幅での表示を確認し、はみ出しや操作しにくい箇所を修正する
    - 768px以上でのタブレット/PCレイアウトを調整する
    - `<meta name="viewport" content="width=device-width, initial-scale=1">` が設定されていることを確認する
    - _要件: 8-1、8-2_

  - [x] 15.2 画面向き変更（Portrait/Landscape）対応を実装する
    - `ResizeObserver` でコンテナサイズ変更を検知し、canvas サイズを再計算する処理を確認・修正する
    - Landscape モードでカメラ映像エリアが正しく拡張されることを確認する
    - _要件: 12-6（レスポンシブ対応）、13章（向き変更リスク）_

  - [x] 15.3 iOS Safari 固有の対応を確認する
    - HTTPS 環境でカメラ権限が正しく要求されることを確認する
    - カメラ停止時にiOSのカメラインジケーターが消えることを確認する（`useEffect` クリーンアップ）
    - HEIC形式の画像が正しく変換・表示されることを確認する
    - _要件: 8-2（iOS Safari対応）、13章（iOSリスク）_

  - [x] 15.4 統合テストを書く
    - カメラ起動〜撮影〜ダウンロードの一連フロー（getUserMedia モック使用）
    - 画面遷移時の状態保持（参照画像・目印が SCR-01↔SCR-02 間で保持されること）
    - _要件: 8-2、10章_

- [x] 16. 最終チェックポイント — 全テストが通ることを確認する
  - 全テストが通ることを確認する。問題があればユーザーに確認する。

- [x] 17. GitHub Pages デプロイ用 GitHub Actions の設定
  - [x] 17.1 Vite のベースパスを設定する
    - `vite.config.ts` の `base` オプションにリポジトリ名を設定する（例: `base: '/construction-photo-guide/'`）
    - _要件: デプロイ環境でのアセットパス解決_

  - [x] 17.2 GitHub Actions ワークフローファイルを作成する
    - `.github/workflows/deploy.yml` を作成する
    - トリガー: `main` ブランチへの push
    - ジョブ: `build-and-deploy`
      - `actions/checkout@v4` でリポジトリをチェックアウト
      - `actions/setup-node@v4`（Node.js 20）でセットアップ
      - `npm ci` で依存関係をインストール
      - `npm run build` でビルド
      - `actions/upload-pages-artifact@v3` で `dist/` をアーティファクトとしてアップロード
      - `actions/deploy-pages@v4` で GitHub Pages にデプロイ
    - パーミッション: `contents: read`、`pages: write`、`id-token: write`
    - 環境: `github-pages`
    - _要件: CI/CD、GitHub Pages デプロイ_

---

## 実装順序と依存関係

```
1（基盤）
  └─ 2（座標変換）
       └─ 3（Marker状態管理）
            └─ 5（ImageUploader）
                 └─ 6（MarkerCanvas）
                      └─ 7（HomeScreen）
                           └─ 9（CameraView）
                                └─ 10（OverlayCanvas）
                                     └─ 11（撮影・DL）
                                          └─ 12（CameraScreen）
                                               └─ 14（ResultModal）※任意
                                                    └─ 15（モバイル対応確認）
```

## 備考

- `*` が付いたサブタスクは任意（スキップ可能）
- 各タスクは前のタスクの完了を前提とする
- プロパティテストは `fast-check` を使用し、最低100回のイテレーションで実行する
- チェックポイントで問題が発生した場合は、前のタスクに戻って修正する
