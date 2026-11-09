@echo off
chcp 65001 > nul
echo ========================================================
echo  Autonomous Intelligence Ledger: Cloudflare Pages Deploy
echo ========================================================
echo.
echo 認証後、自動的にサイトが世界規模のエッジ CDN にデプロイされます。
echo.
npx wrangler pages deploy . --project-name=world-pulse-chronicle --commit-dirty=true
echo.
echo [完了] Cloudflare Pages (world-pulse-chronicle) へのデプロイが完了しました。
pause
