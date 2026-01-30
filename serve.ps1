# serve.ps1 - minimal HTTP server using HttpListener
$prefix = 'http://localhost:8008/'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $PWD at $prefix - press CTRL+C to stop"
while ($listener.IsListening) {
  $context = $listener.GetContext()
  $req = $context.Request
  $path = $req.Url.LocalPath.TrimStart('/')
  if ($path -eq '') { $path = 'Natya Ramam School of Dance.html' }  # default file
  $file = Join-Path $PWD $path
  if (Test-Path $file) {
    $ext = [IO.Path]::GetExtension($file).ToLower()
    switch ($ext) {
      '.html' { $context.Response.ContentType = 'text/html' }
      '.htm'  { $context.Response.ContentType = 'text/html' }
      '.css'  { $context.Response.ContentType = 'text/css' }
      '.js'   { $context.Response.ContentType = 'application/javascript' }
      '.png'  { $context.Response.ContentType = 'image/png' }
      '.jpg'  { $context.Response.ContentType = 'image/jpeg' }
      '.jpeg' { $context.Response.ContentType = 'image/jpeg' }
      '.gif'  { $context.Response.ContentType = 'image/gif' }
      default { $context.Response.ContentType = 'application/octet-stream' }
    }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $context.Response.StatusCode = 404
    $msg = \"Not found\"
    $b = [System.Text.Encoding]::UTF8.GetBytes($msg)
    $context.Response.OutputStream.Write($b,0,$b.Length)
  }
  $context.Response.Close()
}
$listener.Stop()
