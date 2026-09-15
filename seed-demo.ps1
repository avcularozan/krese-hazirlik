$ErrorActionPreference = "Stop"
$base = "https://krese-hazirlik.onrender.com/api/v1"
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "demo$ts@example.com"
$password = "DemoPass1234!"

Write-Output "1) Kayit olunuyor: $email"
$reg = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -ContentType "application/json" -Body (@{
  email = $email; password = $password; displayName = "Demo Ebeveyn"
} | ConvertTo-Json)
$token = $reg.accessToken
$headers = @{ Authorization = "Bearer $token" }

Write-Output "2) Cocuk profili olusturuluyor"
$birthDate = (Get-Date).AddYears(-3).ToString("yyyy-MM-dd")
$child = Invoke-RestMethod -Uri "$base/children" -Method Post -Headers $headers -ContentType "application/json" -Body (@{
  nickname = "Deniz"; birthDate = $birthDate; usesRealName = $false
} | ConvertTo-Json)
$childId = $child.id

Write-Output "3) Okul bilgisi kaydediliyor (30 gundur okulda)"
$startDate = (Get-Date).AddDays(-29).ToString("yyyy-MM-dd")
Invoke-RestMethod -Uri "$base/children/$childId/enrollment" -Method Post -Headers $headers -ContentType "application/json" -Body (@{
  schoolName = "Demo Anaokulu"; startDate = $startDate; groupName = "Minik Kelebekler"
  hadPreviousSchool = "YOK"; dailyHours = "YARIM_GUN"; focusAreas = @("DUYGU","SOSYAL")
} | ConvertTo-Json) | Out-Null

# alan bazli hedef degerler (0-3 olcek): ozbakim guclu, dikkat/oyun/bilis gelisiyor, sosyal/duygu/dil desteklenebilir
$areaValue = @{
  "evden"="duygu"; "ayrilik"="duygu"; "sakin"="duygu"; "donus"="duygu"; "duyguduz"="duygu"; "hayal"="duygu"
  "destek"="sosyal"; "ogrt"="sosyal"; "akranilgi"="sosyal"; "aidiyet"="sosyal"; "guven"="sosyal"; "giris"="sosyal"; "akran"="sosyal"; "sira"="sosyal"; "paylasma"="sosyal"
  "oyun"="oyun"; "secme"="oyun"
  "yemek"="ozbakim"; "uyku"="ozbakim"; "sabah"="ozbakim"; "ozbakim"="ozbakim"; "tuvalet"="ozbakim"; "bagimsiz"="ozbakim"
  "rutin"="dikkat"; "yonerge"="dikkat"; "gecis"="dikkat"
  "etkinlik"="bilis"; "esya"="bilis"
  "konusma"="dil"; "anlatim"="dil"
  "enerji"="kaba"
}

function Get-ValueForArea($area, $day) {
  switch ($area) {
    "ozbakim" { if ($day % 3 -eq 0) { return 2 } else { return 3 } }
    "dikkat"  { return @(2,2,1)[$day % 3] }
    "oyun"    { return 2 }
    "bilis"   { return 2 }
    "sosyal"  { if ($day % 4 -eq 0) { return 0 } else { return 1 } }
    "duygu"   { return @(0,1)[$day % 2] }
    "dil"     { return 1 }
    "kaba"    { return 1 }
    default   { return 2 }
  }
}

Write-Output "4) 30 gunluk check-in kaydediliyor..."
for ($d = 0; $d -lt 30; $d++) {
  $date = (Get-Date $startDate).AddDays($d).ToString("yyyy-MM-dd")
  $items = @{}
  foreach ($code in $areaValue.Keys) {
    $items[$code] = Get-ValueForArea $areaValue[$code] $d
  }
  $mood = (($d % 4) + 1)
  Invoke-RestMethod -Uri "$base/children/$childId/checkins" -Method Post -Headers $headers -ContentType "application/json" -Body (@{
    date = $date; overallMood = $mood; items = $items; note = $null
  } | ConvertTo-Json) | Out-Null
  Write-Host "." -NoNewline
}
Write-Output ""

Write-Output "5) Aylik rapor olusturuluyor"
Invoke-RestMethod -Uri "$base/children/$childId/reports/monthly/generate" -Method Post -Headers $headers | Out-Null

Write-Output "6) Ogretmen kodu olusturuluyor"
$teacherCode = Invoke-RestMethod -Uri "$base/children/$childId/teacher-codes" -Method Post -Headers $headers

Write-Output ""
Write-Output "===== HAZIR ====="
Write-Output "E-posta:    $email"
Write-Output "Sifre:      $password"
Write-Output "Cocuk:      Deniz (id: $childId)"
Write-Output "Ogretmen linki: $($teacherCode.url)"
Write-Output "Ogretmen kodu:  $($teacherCode.code)"
