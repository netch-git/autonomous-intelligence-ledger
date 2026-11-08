@echo off
chcp 65001 > nul
echo ========================================================
echo  Autonomous Intelligence Ledger: Cloudflare Pages Deploy
echo ========================================================
echo.
echo 初回実行時はブラウザが開き Cloudflare の認証画面が表示されます。
echo 認証後、自動的にサイトが世界規模のエッジ CDN にデプロイされます。
echo.
npx wrangler pages deploy . --project-name=autonomous-intelligence-ledger --commit-dirty=true
echo.
echo [完了] Cloudflare Pages へのデプロイが完了しました。
pause
