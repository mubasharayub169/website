$ErrorActionPreference = "Stop"
$baseUrl = "https://ikramhospital.com"
$today = Get-Date -Format "yyyy-MM-dd"

$htmlFiles = Get-ChildItem -Filter *.html | Sort-Object Name

$rxDesc = New-Object System.Text.RegularExpressions.Regex('<meta\s+name="description"[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxViewport = New-Object System.Text.RegularExpressions.Regex('<meta\s+name="viewport"[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxCanonicalTag = New-Object System.Text.RegularExpressions.Regex('<link\s+rel="canonical"[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxOgTitleTag = New-Object System.Text.RegularExpressions.Regex('property="og:title"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxTwitterCardTag = New-Object System.Text.RegularExpressions.Regex('name="twitter:card"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxRobots = New-Object System.Text.RegularExpressions.Regex('<meta\s+name="robots"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxSchema = New-Object System.Text.RegularExpressions.Regex('application/ld\+json', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxHeadClose = New-Object System.Text.RegularExpressions.Regex('</head>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxTitle = New-Object System.Text.RegularExpressions.Regex('<title>(.*?)</title>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxCanonical = New-Object System.Text.RegularExpressions.Regex('<link\s+rel="canonical"\s+href="([^"]*)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxDescriptionContent = New-Object System.Text.RegularExpressions.Regex('<meta\s+name="description"\s+content="([^"]*)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxHasH1 = New-Object System.Text.RegularExpressions.Regex('<h1[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxFirstH2Open = New-Object System.Text.RegularExpressions.Regex('<h2([^>]*)>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$rxFirstH2Close = New-Object System.Text.RegularExpressions.Regex('</h2>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

foreach ($file in $htmlFiles) {
    $path = $file.FullName
    $content = Get-Content -Raw -Path $path

    if (-not $content -or $content.Length -lt 200 -or $content -notmatch '<!DOCTYPE html>') {
        throw "Refusing to edit suspicious/short file: $($file.Name)"
    }

    $title = "Ikram Hospital"
    $description = "Ikram Hospital healthcare services in Gujrat."
    $url = "$baseUrl/$($file.Name)"

    $mt = $rxTitle.Match($content)
    if ($mt.Success) { $title = $mt.Groups[1].Value.Trim() }

    $md = $rxDescriptionContent.Match($content)
    if ($md.Success) {
        $description = $md.Groups[1].Value.Trim()
    } elseif ($title -match '^(.*)\s*-\s*Ikram Hospital\s*$') {
        $description = "Ikram Hospital $($matches[1]) services in Gujrat. Expert doctors, modern facilities, and easy appointment booking."
    }

    $mc = $rxCanonical.Match($content)
    if ($mc.Success -and -not [string]::IsNullOrWhiteSpace($mc.Groups[1].Value)) {
        $url = $mc.Groups[1].Value.Trim()
    }

    if (-not $rxDesc.IsMatch($content)) {
        $descriptionMeta = ('    <meta name="description" content="{0}">' -f $description)
        if ($rxViewport.IsMatch($content)) {
            $m = $rxViewport.Match($content)
            $content = $content.Insert($m.Index + $m.Length, "`r`n$descriptionMeta")
        }
    }

    if (-not $rxCanonicalTag.IsMatch($content)) {
        $canonicalTag = ('    <link rel="canonical" href="{0}">' -f $url)
        $m = $rxTitle.Match($content)
        if ($m.Success) {
            $content = $content.Insert($m.Index + $m.Length, "`r`n$canonicalTag")
        }
    }

    if (-not $rxOgTitleTag.IsMatch($content)) {
        $ogBlock = @(
            ('    <meta property="og:title" content="{0}">' -f $title),
            ('    <meta property="og:description" content="{0}">' -f $description),
            '    <meta property="og:type" content="website">',
            ('    <meta property="og:url" content="{0}">' -f $url),
            ('    <meta property="og:image" content="{0}/images/IKRAM%20HOSPITAL%20HERO%20IMAGE.jpg">' -f $baseUrl)
        ) -join "`r`n"
        $m = $rxCanonicalTag.Match($content)
        if ($m.Success) {
            $content = $content.Insert($m.Index + $m.Length, "`r`n$ogBlock")
        }
    }

    if (-not $rxTwitterCardTag.IsMatch($content)) {
        $twitterBlock = @(
            '    <meta name="twitter:card" content="summary_large_image">',
            ('    <meta name="twitter:title" content="{0}">' -f $title),
            ('    <meta name="twitter:description" content="{0}">' -f $description),
            ('    <meta name="twitter:image" content="{0}/images/IKRAM%20HOSPITAL%20HERO%20IMAGE.jpg">' -f $baseUrl)
        ) -join "`r`n"
        $m = $rxHeadClose.Match($content)
        if ($m.Success) {
            $content = $content.Insert($m.Index, "$twitterBlock`r`n")
        }
    }

    if (-not $rxRobots.IsMatch($content)) {
        $robotsMeta = '    <meta name="robots" content="index,follow,max-image-preview:large">'
        if ($rxDesc.IsMatch($content)) {
            $m = $rxDesc.Match($content)
            $content = $content.Insert($m.Index + $m.Length, "`r`n$robotsMeta")
        } elseif ($rxViewport.IsMatch($content)) {
            $m = $rxViewport.Match($content)
            $content = $content.Insert($m.Index + $m.Length, "`r`n$robotsMeta")
        }
    }

    if (-not $rxSchema.IsMatch($content)) {

        $schema = [ordered]@{
            "@context" = "https://schema.org"
            "@graph" = @(
                [ordered]@{
                    "@type" = "MedicalOrganization"
                    "@id" = "$baseUrl/#organization"
                    "name" = "Ikram Hospital"
                    "url" = $baseUrl
                    "telephone" = "(053) 3605377"
                    "address" = [ordered]@{
                        "@type" = "PostalAddress"
                        "streetAddress" = "Bhimber Road"
                        "addressLocality" = "Gujrat"
                        "addressCountry" = "PK"
                    }
                },
                [ordered]@{
                    "@type" = "WebSite"
                    "@id" = "$baseUrl/#website"
                    "url" = $baseUrl
                    "name" = "Ikram Hospital"
                    "publisher" = [ordered]@{
                        "@id" = "$baseUrl/#organization"
                    }
                },
                [ordered]@{
                    "@type" = "WebPage"
                    "name" = $title
                    "url" = $url
                    "description" = $description
                    "isPartOf" = [ordered]@{
                        "@id" = "$baseUrl/#website"
                    }
                    "about" = [ordered]@{
                        "@id" = "$baseUrl/#organization"
                    }
                }
            )
        }

        $json = $schema | ConvertTo-Json -Depth 10 -Compress
        $scriptTag = "    <script type=`"application/ld+json`">$json</script>"

        $mh = $rxHeadClose.Match($content)
        if ($mh.Success) {
            $content = $content.Insert($mh.Index, "$scriptTag`r`n")
        }
    }

    if (-not $rxHasH1.IsMatch($content)) {
        $content = $rxFirstH2Open.Replace($content, '<h1$1>', 1)
        $content = $rxFirstH2Close.Replace($content, '</h1>', 1)
    }

    if ($content -notmatch '<!DOCTYPE html>' -or $content -notmatch '<html') {
        throw "Post-edit validation failed for $($file.Name)"
    }

    Set-Content -Path $path -Value $content -Encoding utf8
}

$robotsText = @(
    'User-agent: *',
    'Allow: /',
    '',
    'Sitemap: https://ikramhospital.com/sitemap.xml'
) -join "`r`n"
Set-Content -Path "robots.txt" -Value $robotsText -Encoding utf8

$xml = [System.Collections.Generic.List[string]]::new()
$xml.Add('<?xml version="1.0" encoding="UTF-8"?>')
$xml.Add('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
foreach ($f in $htmlFiles) {
    $xml.Add('  <url>')
    $xml.Add("    <loc>$baseUrl/$($f.Name)</loc>")
    $xml.Add("    <lastmod>$today</lastmod>")
    $xml.Add('    <changefreq>weekly</changefreq>')
    $xml.Add('    <priority>0.80</priority>')
    $xml.Add('  </url>')
}
$xml.Add('</urlset>')
Set-Content -Path "sitemap.xml" -Value ($xml -join "`r`n") -Encoding utf8

Write-Output "complete-seo-safe-done"
