Add-Type -AssemblyName System.Drawing
$src = "d:\AndroidStudioProjects\DusMint\dusmint_android\assets\images\dusmint_logo.jpg"
$dst = "d:\AndroidStudioProjects\DusMint\dusmint_android\assets\images\dusmint_logo.png"

$img = [System.Drawing.Bitmap]::FromFile($src)
# Quick MakeTransparent with White or threshold
$out = New-Object System.Drawing.Bitmap($img)
$out.MakeTransparent([System.Drawing.Color]::White)

# Also check corners to ensure no residual white edges
$rect = New-Object System.Drawing.Rectangle(0, 0, $out.Width, $out.Height)
$bmpData = $out.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$ptr = $bmpData.Scan0
$bytes = [Math]::Abs($bmpData.Stride) * $out.Height
$rgbValues = New-Object byte[] $bytes
[System.Runtime.InteropServices.Marshal]::Copy($ptr, $rgbValues, 0, $bytes)

# Format32bppArgb in memory is BGRA
for ($i = 0; $i -lt $bytes; $i += 4) {
    $b = $rgbValues[$i]
    $g = $rgbValues[$i + 1]
    $r = $rgbValues[$i + 2]
    # If near white (R > 238 and G > 238 and B > 238), set alpha to 0
    if ($r -gt 235 -and $g -gt 235 -and $b -gt 235) {
        $rgbValues[$i + 3] = 0
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $ptr, $bytes)
$out.UnlockBits($bmpData)

$img.Dispose()
$out.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()
Write-Output "TRANSPARENT_LOGO_GENERATED_SUCCESSFULLY"
