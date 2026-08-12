param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("blue", "noir")]
    [string]$Theme
)

$ProjectRoot = "C:\Users\VASANTH RAO\Downloads\SYNYCS_PRO_MAIN"
$ThemeFile = "$ProjectRoot\frontend\src\themes\$Theme.css"
$DestFile = "$ProjectRoot\frontend\src\index.css"

if (Test-Path $ThemeFile) {
    Copy-Item $ThemeFile $DestFile -Force
    Write-Host "Successfully applied $Theme theme!" -ForegroundColor Green
} else {
    Write-Error "Theme file not found: $ThemeFile"
}
