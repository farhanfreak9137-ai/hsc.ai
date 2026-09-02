Add-Type -AssemblyName System.Drawing

$srcIcon = "C:\Users\RCP\.gemini\antigravity-ide\brain\ab4554f7-687d-4cf8-b02b-ec760934e553\hsc_ai_symbol_icon_1788366972608.jpg"
$srcAppCard = "C:\Users\RCP\.gemini\antigravity-ide\brain\ab4554f7-687d-4cf8-b02b-ec760934e553\hsc_ai_app_icon_1788366928643.jpg"

function Resize-Image {
    param (
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$Width,
        [int]$Height
    )

    $dir = [System.IO.Path]::GetDirectoryName($TargetPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $srcBmp = [System.Drawing.Bitmap]::FromFile($SourcePath)
    $destBmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($destBmp)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($srcBmp, 0, 0, $Width, $Height)
    $destBmp.Save($TargetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $destBmp.Dispose()
    $srcBmp.Dispose()
    Write-Output "Created: $TargetPath ($Width x $Height)"
}

# 1. Web / Public Icons
Resize-Image -SourcePath $srcAppCard -TargetPath "public\icon.png" -Width 512 -Height 512
Resize-Image -SourcePath $srcIcon -TargetPath "public\favicon.png" -Width 64 -Height 64
Resize-Image -SourcePath $srcAppCard -TargetPath "public\apple-touch-icon.png" -Width 180 -Height 180
Resize-Image -SourcePath $srcAppCard -TargetPath "public\app-icon.png" -Width 1024 -Height 1024

# 2. Android Mipmaps
$densities = @(
    @{ Folder = "mipmap-mdpi"; LauncherSize = 48; ForegroundSize = 108 },
    @{ Folder = "mipmap-hdpi"; LauncherSize = 72; ForegroundSize = 162 },
    @{ Folder = "mipmap-xhdpi"; LauncherSize = 96; ForegroundSize = 216 },
    @{ Folder = "mipmap-xxhdpi"; LauncherSize = 144; ForegroundSize = 324 },
    @{ Folder = "mipmap-xxxhdpi"; LauncherSize = 192; ForegroundSize = 432 }
)

foreach ($d in $densities) {
    $folder = "android\app\src\main\res\" + $d.Folder
    Resize-Image -SourcePath $srcAppCard -TargetPath "$folder\ic_launcher.png" -Width $d.LauncherSize -Height $d.LauncherSize
    Resize-Image -SourcePath $srcAppCard -TargetPath "$folder\ic_launcher_round.png" -Width $d.LauncherSize -Height $d.LauncherSize
    Resize-Image -SourcePath $srcIcon -TargetPath "$folder\ic_launcher_foreground.png" -Width $d.ForegroundSize -Height $d.ForegroundSize
}

Write-Output "All icons generated successfully!"
