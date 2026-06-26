# ============================================
# MYProjectComparison - Download Facade Images
# ============================================
# Run this in PowerShell from your project folder:
#   cd C:\Users\USER1\Documents\MYProjectComparison
#   .\download-images.ps1
# ============================================

$imageDir = "assets\images"
if (-not (Test-Path $imageDir)) { New-Item -ItemType Directory -Path $imageDir -Force }

$images = @(
    # Already have: aldenz.jpeg, queenswoodz.jpg

    @{ Name = "vividz.jpg";       URL = "https://realty.ericanfly.com/wp-content/uploads/2024/12/The-Vividz-@-Bukit-Jalil-Proposed-Park-02.jpg" },
    @{ Name = "oaka.jpg";         URL = "https://realty.ericanfly.com/wp-content/uploads/2025/11/OAKA-Residences-@-Bukit-Jalil-08.jpg" },
    @{ Name = "parkgreen.jpg";    URL = "https://www.malton.com.my/wp-content/uploads/2024/01/Park-Green-Feature-Aug-03-copy.jpg" },
    @{ Name = "ren.avif";         URL = "https://ren-residence-bukitjalil.com/wp-content/uploads/2025/10/5fae5d_f2803b9cc7714b8db9e7fa2a7fe48fb7mv2.avif" },
    @{ Name = "maple.jpg";        URL = "https://mapleresidences-oug.com/wp-content/uploads/2025/03/Facade.jpg" },
    @{ Name = "ayanna.webp";      URL = "https://ayannaresidence.com/m1/wp-content/uploads/2023/05/ayanna3.webp" },
    @{ Name = "genstarz.webp";    URL = "https://majestic-genstarz.com/wp-content/uploads/2025/07/slider-seven.webp" }
)

# === REMAINING PROJECTS - You need to find these manually ===
# Search Google Images for "[project name] facade" and save to assets/images/
#
# riverville2.jpg    - Riverville 2, Old Klang Road (alzac.com.my)
# asterhill.jpg      - Aster Hill, Sri Petaling (UOA)
# aurum2.jpg         - Aurum 2, Sri Petaling (Amber Homes)
# artestar.jpg       - Arte Star, Sungai Besi (Arte Group)
# artesolaris.jpg    - Arte Solaris, Mont Kiara (Arte Group)
# aricia.jpg         - Aricia, Sungai Besi (Chin Hin)
# ambience.jpg       - Ambience, Sungai Besi (Faithview)
# alamandaheight.jpg - Alamanda Height, Seri Kembangan (Multiplex Land)
# quaver.jpg         - Quaver, Seri Kembangan (Chin Hin)
# avantro.jpg        - Avantro, Puchong (Chin Hin)
# thewyn.jpg         - The Wyn, Puchong (Land & General)
# kensho.jpg         - Kensho Residence, Taman Danau Desa (SPC)
# maspira.jpg        - M Aspira, Taman Danau Desa (Mah Sing)
# tria.jpg           - Tria Seputeh Residences (MRCB)
# oneseputeh.jpg     - One Seputeh (Asiabina)
# est8.jpg           - Est8, Seputeh (Titian Sama)
# dnuri.jpg          - D'Nuri, Kwasa Damansara (Exsim)
# devia.jpg          - D'Evia, Kwasa Damansara (Exsim)
# foresthill.jpg     - Forest Hill, Petaling Jaya (Ehsan Bina)
# atera.jpg          - The Atera, Petaling Jaya (Paramount)
# parkside.jpg       - Parkside Residence, Bangsar (SP Setia)
# riverpark.jpg      - River Park, Bangsar South (Malton)
# colonial.jpg       - Colonial Infinite, Subang (HCK)
# alora.jpg          - Alora, Subang (Avaland)
# arra.jpg           - ARRA Residence, Ara Damansara (Puncakdana)
# amara.jpg          - Amara Residence, Ara Damansara (Puncakdana)
# mahogany.jpg       - Mahogany Residence, Kota Damansara (Everest Pioneer)
# clouthaus.jpg      - CloutHaus, KLCC (TA Global)
# phoeniz.jpg        - Phoeniz Suites, KLCC (Exsim)
# aras.jpg           - Aras Residence, OUG (WCT)
# ========================================================

Write-Host "`n=== Downloading Project Facade Images ===" -ForegroundColor Cyan
Write-Host "Saving to: $imageDir`n"

$client = New-Object System.Net.WebClient
$client.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

$success = 0
$failed = 0

foreach ($img in $images) {
    $outPath = Join-Path $imageDir $img.Name
    Write-Host "Downloading $($img.Name)..." -NoNewline
    try {
        $client.DownloadFile($img.URL, $outPath)
        Write-Host " OK" -ForegroundColor Green
        $success++
    } catch {
        Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n=== Done! ===" -ForegroundColor Cyan
Write-Host "Downloaded: $success | Failed: $failed"
Write-Host "`nRemaining projects need manual image download (see comments in script)."
Write-Host "Search Google Images for '[project name] condo facade' and save to $imageDir"
