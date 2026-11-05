Add-Type -AssemblyName System.Drawing
$src = "d:\AndroidStudioProjects\DusMint\dusmint_android\assets\images\dusmint_logo.jpg"
$dst = "d:\AndroidStudioProjects\DusMint\dusmint_android\assets\images\dusmint_logo.png"

$orig = [System.Drawing.Image]::FromFile($src)
$bmp = New-Object System.Drawing.Bitmap($orig.Width, $orig.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($orig, 0, 0, $orig.Width, $orig.Height)
$g.Dispose()
$orig.Dispose()

$rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$ptr = $bmpData.Scan0
$bytes = [Math]::Abs($bmpData.Stride) * $bmp.Height
$rgbValues = New-Object byte[] $bytes
[System.Runtime.InteropServices.Marshal]::Copy($ptr, $rgbValues, 0, $bytes)

for ($i = 0; $i -lt $bytes; $i += 4) {
    $b = $rgbValues[$i]
    $g = $rgbValues[$i + 1]
    $r = $rgbValues[$i + 2]
    if ($r -gt 235 -and $g -gt 235 -and $b -gt 235) {
        $rgbValues[$i + 3] = 0
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $ptr, $bytes)
$bmp.UnlockBits($bmpData)

if (Test-Path $dst) { Remove-Item $dst -Force }
$fs = New-Object System.IO.FileStream($dst, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
$bmp.Save($fs, [System.Drawing.Imaging.ImageFormat]::Png)
$fs.Close()
$bmp.Dispose()
Write-Output "PNG_SAVED_SUCCESS"
