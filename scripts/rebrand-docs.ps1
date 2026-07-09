param()

$docsPath = "docs"

Get-ChildItem -Path $docsPath -Recurse -Include "*.md" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw -Encoding UTF8
    if ($null -eq $content) { return }

    $updated = $content
    $updated = $updated -replace 'OpenClaw', 'Agent-I'
    $updated = $updated -replace '~/.openclaw/', '~/.agenti/'
    $updated = $updated -replace '`openclaw ', '`agenti '
    $updated = $updated -replace 'openclaw onboard', 'agenti onboard'
    $updated = $updated -replace 'openclaw gateway', 'agenti gateway'
    $updated = $updated -replace 'openclaw channels', 'agenti channels'
    $updated = $updated -replace 'openclaw pairing', 'agenti pairing'
    $updated = $updated -replace 'openclaw doctor', 'agenti doctor'
    $updated = $updated -replace 'openclaw logs', 'agenti logs'
    $updated = $updated -replace 'openclaw agent', 'agenti agent'
    $updated = $updated -replace 'openclaw message', 'agenti message'
    $updated = $updated -replace 'openclaw models', 'agenti models'
    $updated = $updated -replace 'openclaw config', 'agenti config'
    $updated = $updated -replace 'openclaw update', 'agenti update'
    $updated = $updated -replace 'openclaw status', 'agenti status'
    $updated = $updated -replace 'openclaw health', 'agenti health'
    $updated = $updated -replace 'openclaw nodes', 'agenti nodes'
    $updated = $updated -replace 'openclaw secrets', 'agenti secrets'
    $updated = $updated -replace 'openclaw sessions', 'agenti sessions'
    $updated = $updated -replace 'openclaw skills', 'agenti skills'
    $updated = $updated -replace 'openclaw plugins', 'agenti plugins'
    $updated = $updated -replace 'openclaw hooks', 'agenti hooks'
    $updated = $updated -replace 'openclaw cron', 'agenti cron'
    $updated = $updated -replace 'openclaw login', 'agenti login'
    $updated = $updated -replace 'openclaw logout', 'agenti logout'
    $updated = $updated -replace 'openclaw tui', 'agenti tui'
    $updated = $updated -replace 'openclaw browser', 'agenti browser'
    $updated = $updated -replace 'openclaw sandbox', 'agenti sandbox'
    $updated = $updated -replace 'npm install -g openclaw', 'npm install -g agenti'
    $updated = $updated -replace 'openclaw@latest', 'agenti@latest'

    if ($updated -ne $content) {
        Set-Content -Path $file -Value $updated -Encoding UTF8 -NoNewline
        Write-Host "Updated: $file"
    }
}

Write-Host "Docs update complete."
