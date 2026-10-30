Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$projectRoot = Split-Path -Parent $PSScriptRoot
$window = New-Object System.Windows.Forms.Form
$window.Text = 'Malagasy Adventure - Avancement des voix'
$window.ClientSize = New-Object System.Drawing.Size(560, 265)
$window.StartPosition = 'CenterScreen'
$window.FormBorderStyle = 'FixedDialog'
$window.MaximizeBox = $false
$window.Font = New-Object System.Drawing.Font('Segoe UI', 11)
function New-Label($top, $height) {
  $label = New-Object System.Windows.Forms.Label
  $label.Location = New-Object System.Drawing.Point(24, $top)
  $label.Size = New-Object System.Drawing.Size(512, $height)
  $window.Controls.Add($label)
  return $label
}
$heading = New-Label 22 30
$heading.Text = 'Preparation des nouvelles voix'
$heading.Font = New-Object System.Drawing.Font('Segoe UI', 15, [System.Drawing.FontStyle]::Bold)
$counter = New-Label 66 28
$bar = New-Object System.Windows.Forms.ProgressBar
$bar.Location = New-Object System.Drawing.Point(24, 102)
$bar.Size = New-Object System.Drawing.Size(512, 26)
$bar.Maximum = 566
$window.Controls.Add($bar)
$stage = New-Label 144 60
$footer = New-Label 215 40
$footer.Font = New-Object System.Drawing.Font('Segoe UI', 9)
$footer.Text = 'Actualisation toutes les 3 secondes. Fermer cette fenetre ne coupe pas la generation.'
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 3000
$update = {
  try {
    $manifestPath = Join-Path $projectRoot 'audio-workbench/generated/omnivoice/manifest.json'
    $sharing = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
    $stream = [System.IO.File]::Open($manifestPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, $sharing)
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
    try { $manifestText = $reader.ReadToEnd() } finally { $reader.Dispose() }
    $manifest = $manifestText | ConvertFrom-Json
    $newCount = [Math]::Min(566, [Math]::Max(0, $manifest.recordings.Count - 470))
    $bar.Value = $newCount
    $percent = [Math]::Floor(100 * $newCount / 566)
    $counter.Text = "$newCount / 566 nouvelles voix ($percent %) - reste : $(566 - $newCount)"
    $stage.Text = if ($newCount -lt 566) { 'Generation en cours. Le compteur avance par lots ; un lot peut prendre plusieurs minutes.' } else { 'Voix terminees. Verifications et mise en ligne en cours.' }
    $resultPath = Join-Path $projectRoot '.tools/world2-release-result.json'
    if (Test-Path -LiteralPath $resultPath) {
      $result = Get-Content -LiteralPath $resultPath -Raw -Encoding UTF8 | ConvertFrom-Json
      if ($result.status -eq 'complete') { $stage.Text = 'TERMINE : voix, tests et publication verifies. Le monde 2 est en ligne.'; $stage.ForeColor = [System.Drawing.Color]::DarkGreen }
      elseif ($result.status -eq 'failed') { $stage.Text = 'Une verification a arrete la publication. Signale ce message a Codex pour reprendre.'; $stage.ForeColor = [System.Drawing.Color]::DarkRed }
    }
  } catch { $stage.Text = 'Lecture du compteur en cours. Nouvelle tentative dans 3 secondes.' }
}
$timer.Add_Tick($update)
$window.Add_Shown({ & $update; $timer.Start() })
$window.Add_FormClosed({ $timer.Stop(); $timer.Dispose() })
[void]$window.ShowDialog()
