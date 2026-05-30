$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $repoRoot "docs\AgriculNet_Academic_Presentation.pptx"

$imageRoot = "C:\Users\PC\3D Objects"
$screenshots = @{
  BuyerHelpSupport    = Join-Path $imageRoot "BuyerHelpSupport.png"
  BuyerMessages       = Join-Path $imageRoot "BuyerMessages.png"
  BuyerSettings       = Join-Path $imageRoot "BuyerSettings.png"
  InternationalExport = Join-Path $imageRoot "InternationalExport.png"
  ONCCMINADER         = Join-Path $imageRoot "ONCCMINADER.png"
  OurMission          = Join-Path $imageRoot "OurMission.png"
}

foreach ($pair in $screenshots.GetEnumerator()) {
  if (-not (Test-Path -LiteralPath $pair.Value)) {
    throw "Missing screenshot asset: $($pair.Value)"
  }
}

function Get-OfficeRgb([int]$r, [int]$g, [int]$b) {
  return $r + ($g -shl 8) + ($b -shl 16)
}

$colors = @{
  Green       = Get-OfficeRgb 20 93 55
  GreenDark   = Get-OfficeRgb 11 59 34
  GreenSoft   = Get-OfficeRgb 236 246 240
  Gold        = Get-OfficeRgb 214 171 39
  GoldSoft    = Get-OfficeRgb 250 241 207
  Ink         = Get-OfficeRgb 31 41 55
  Muted       = Get-OfficeRgb 107 114 128
  Border      = Get-OfficeRgb 225 231 235
  White       = Get-OfficeRgb 255 255 255
  RedSoft     = Get-OfficeRgb 253 242 242
}

$fonts = @{
  Display = "DM Serif Display"
  Sans    = "DM Sans"
}

function Set-ShapeLine($shape, [int]$rgb, [double]$weight = 1) {
  $shape.Line.Visible = -1
  $shape.Line.ForeColor.RGB = $rgb
  $shape.Line.Weight = $weight
}

function Set-ShapeFill($shape, [int]$rgb) {
  $shape.Fill.Visible = -1
  $shape.Fill.Solid()
  $shape.Fill.ForeColor.RGB = $rgb
}

function Add-TextBox {
  param(
    $slide,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height,
    [string]$text,
    [int]$fontSize = 20,
    [string]$fontName = "DM Sans",
    [int]$color,
    [bool]$bold = $false,
    [int]$align = 1,
    [double]$margin = 0
  )

  $shape = $slide.Shapes.AddTextbox(1, $left, $top, $width, $height)
  $shape.TextFrame2.WordWrap = -1
  $shape.TextFrame2.MarginLeft = $margin
  $shape.TextFrame2.MarginRight = $margin
  $shape.TextFrame2.MarginTop = $margin
  $shape.TextFrame2.MarginBottom = $margin
  $shape.TextFrame.TextRange.Text = $text
  $range = $shape.TextFrame.TextRange
  $range.Font.Name = $fontName
  $range.Font.Size = $fontSize
  $range.Font.Color.RGB = $color
  $range.Font.Bold = [int]$bold
  $range.ParagraphFormat.Alignment = $align
  return $shape
}

function Add-Title {
  param($slide, [string]$title, [string]$eyebrow = "")
  if ($eyebrow) {
    Add-TextBox -slide $slide -left 42 -top 28 -width 600 -height 24 -text $eyebrow.ToUpper() -fontSize 12 -fontName $fonts.Sans -color $colors.Green -bold $true | Out-Null
  }
  Add-TextBox -slide $slide -left 42 -top 52 -width 840 -height 52 -text $title -fontSize 25 -fontName $fonts.Display -color $colors.Ink -bold $true | Out-Null
}

function Add-BulletBlock {
  param(
    $slide,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height,
    [string[]]$items,
    [int]$fontSize = 17,
    [int]$color = $colors.Ink
  )
  $text = ($items | ForEach-Object { "• $_" }) -join "`r`n"
  $shape = Add-TextBox -slide $slide -left $left -top $top -width $width -height $height -text $text -fontSize $fontSize -fontName $fonts.Sans -color $color
  $shape.TextFrame2.VerticalAnchor = 1
  return $shape
}

function Add-SectionCard {
  param(
    $slide,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height,
    [string]$title,
    [string]$body,
    [int]$fillColor = $colors.White,
    [int]$lineColor = $colors.Border,
    [int]$titleColor = $colors.Ink
  )
  $card = $slide.Shapes.AddShape(1, $left, $top, $width, $height)
  Set-ShapeFill $card $fillColor
  Set-ShapeLine $card $lineColor 1
  Add-TextBox -slide $slide -left ($left + 14) -top ($top + 12) -width ($width - 28) -height 26 -text $title -fontSize 18 -fontName $fonts.Sans -color $titleColor -bold $true | Out-Null
  Add-TextBox -slide $slide -left ($left + 14) -top ($top + 42) -width ($width - 28) -height ($height - 52) -text $body -fontSize 14 -fontName $fonts.Sans -color $colors.Muted | Out-Null
  return $card
}

function Add-ImageCover {
  param(
    $slide,
    [string]$path,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height
  )

  $img = $slide.Shapes.AddPicture($path, $false, $true, $left, $top, $width, $height)
  Set-ShapeLine $img $colors.Border 0.75
  return $img
}

function Add-TopBand {
  param($slide, [int]$color = $colors.GreenDark)
  $band = $slide.Shapes.AddShape(1, 0, 0, 960, 18)
  $band.Line.Visible = 0
  Set-ShapeFill $band $color
}

function Add-Footer {
  param($slide, [int]$index)
  Add-TextBox -slide $slide -left 42 -top 512 -width 700 -height 14 -text "AgriculNet | Academic Presentation | 2026" -fontSize 9 -fontName $fonts.Sans -color $colors.Muted | Out-Null
  Add-TextBox -slide $slide -left 890 -top 510 -width 30 -height 14 -text "$index" -fontSize 10 -fontName $fonts.Sans -color $colors.Muted -align 3 | Out-Null
}

function Add-FlowStep {
  param($slide, [double]$left, [double]$top, [double]$width, [double]$height, [string]$number, [string]$title, [string]$body)
  $shape = $slide.Shapes.AddShape(1, $left, $top, $width, $height)
  Set-ShapeFill $shape $colors.White
  Set-ShapeLine $shape $colors.Border 1
  Add-TextBox -slide $slide -left ($left + 10) -top ($top + 10) -width 30 -height 26 -text $number -fontSize 18 -fontName $fonts.Display -color $colors.Green -bold $true | Out-Null
  Add-TextBox -slide $slide -left ($left + 42) -top ($top + 10) -width ($width - 52) -height 24 -text $title -fontSize 16 -fontName $fonts.Sans -color $colors.Ink -bold $true | Out-Null
  Add-TextBox -slide $slide -left ($left + 10) -top ($top + 38) -width ($width - 20) -height ($height - 48) -text $body -fontSize 13 -fontName $fonts.Sans -color $colors.Muted | Out-Null
  return $shape
}

function Add-ArrowLine {
  param($slide, [double]$x1, [double]$y1, [double]$x2, [double]$y2)
  $line = $slide.Shapes.AddLine($x1, $y1, $x2, $y2)
  $line.Line.EndArrowheadStyle = 3
  $line.Line.ForeColor.RGB = $colors.Green
  $line.Line.Weight = 1.5
  return $line
}

$ppt = $null
$presentation = $null

try {
  $ppt = New-Object -ComObject PowerPoint.Application
  $ppt.Visible = -1
  $presentation = $ppt.Presentations.Add()
  $presentation.PageSetup.SlideWidth = 960
  $presentation.PageSetup.SlideHeight = 540

  if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
  }

  # Slide 1 - Title
  $slide = $presentation.Slides.Add(1, 12)
  Add-TopBand $slide
  $bg = $slide.Shapes.AddShape(1, 0, 18, 960, 522)
  $bg.Line.Visible = 0
  Set-ShapeFill $bg $colors.GreenDark
  $accent = $slide.Shapes.AddShape(1, 0, 414, 960, 126)
  $accent.Line.Visible = 0
  Set-ShapeFill $accent $colors.Green
  Add-TextBox -slide $slide -left 54 -top 70 -width 500 -height 28 -text "FINAL YEAR PROJECT PRESENTATION" -fontSize 13 -fontName $fonts.Sans -color $colors.Gold -bold $true | Out-Null
  Add-TextBox -slide $slide -left 54 -top 105 -width 560 -height 90 -text "AgriculNet" -fontSize 34 -fontName $fonts.Display -color $colors.White -bold $true | Out-Null
  Add-TextBox -slide $slide -left 54 -top 190 -width 500 -height 90 -text "A digital platform connecting Cameroonian farmers, resellers, buyers, and administrators through verified sourcing, protected trade workflows, and export support." -fontSize 18 -fontName $fonts.Sans -color $colors.White | Out-Null
  Add-TextBox -slide $slide -left 54 -top 434 -width 540 -height 38 -text "Prepared for academic panel review | Cameroon-focused agricultural trade system" -fontSize 16 -fontName $fonts.Sans -color $colors.White | Out-Null
  Add-TextBox -slide $slide -left 54 -top 474 -width 430 -height 24 -text "Stack: Next.js, Express, Supabase, Railway, Vercel" -fontSize 13 -fontName $fonts.Sans -color $colors.White | Out-Null
  Add-ImageCover -slide $slide -path $screenshots.InternationalExport -left 610 -top 70 -width 300 -height 390 | Out-Null

  # Slide 2
  $slide = $presentation.Slides.Add(2, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Problem Statement" -title "Why AgriculNet matters"
  Add-SectionCard -slide $slide -left 42 -top 118 -width 420 -height 300 -title "Current trade pain points" -body "Many Cameroonian farmers still depend on fragmented buyer networks, weak price visibility, informal payment practices, and poor access to export-ready workflows. These issues reduce trust, margin, and delivery confidence." -fillColor $colors.White | Out-Null
  Add-BulletBlock -slide $slide -left 500 -top 126 -width 380 -height 220 -items @(
    "No reliable digital marketplace tied to real farmer verification",
    "Limited coordination for documentation, inspection, and export readiness",
    "Payment uncertainty between buyer and seller",
    "Weak visibility for verified farmers and cooperatives",
    "Few digital tools adapted to local agricultural trade realities"
  ) | Out-Null
  Add-SectionCard -slide $slide -left 500 -top 360 -width 380 -height 110 -title "Academic framing" -body "The project addresses a real business and logistics problem with a software system that combines marketplace access, verification, communication, and protected trade operations." -fillColor $colors.GoldSoft -lineColor $colors.Gold | Out-Null
  Add-Footer -slide $slide -index 2

  # Slide 3
  $slide = $presentation.Slides.Add(3, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Objectives" -title "What the system was designed to achieve"
  Add-BulletBlock -slide $slide -left 50 -top 122 -width 390 -height 320 -items @(
    "Digitize crop sourcing between farmers, resellers, and buyers",
    "Provide verified farmer and listing visibility",
    "Support buyer protection and controlled payment release",
    "Create a structured communication path for quotes, orders, and support",
    "Enable international export workflows and compliance-aware sourcing",
    "Give administrators operational oversight over users, listings, orders, disputes, and payments"
  ) | Out-Null
  Add-SectionCard -slide $slide -left 490 -top 122 -width 360 -height 128 -title "Primary users" -body "Farmers, resellers, buyers, and admins all operate on the same platform with role-specific dashboards and permissions." -fillColor $colors.GreenSoft -lineColor $colors.Green | Out-Null
  Add-SectionCard -slide $slide -left 490 -top 268 -width 360 -height 160 -title "Expected outcomes" -body "Higher trade trust, better sourcing visibility, clearer operational workflows, and a platform that reflects Cameroonian agricultural realities rather than generic marketplace assumptions." -fillColor $colors.White | Out-Null
  Add-Footer -slide $slide -index 3

  # Slide 4
  $slide = $presentation.Slides.Add(4, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Users and Scope" -title "Who uses AgriculNet and what each role does"
  Add-SectionCard -slide $slide -left 42 -top 122 -width 205 -height 250 -title "Farmers" -body "Create and manage listings, complete identity verification, respond to inquiries, track orders, and receive controlled payout visibility." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 265 -top 122 -width 205 -height 250 -title "Resellers" -body "Source and resell crop supply, publish trade-ready inventory, coordinate with buyers, and operate like sellers within marketplace controls." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 488 -top 122 -width 205 -height 250 -title "Buyers" -body "Browse crops, find farmers, save listings, place orders, communicate with sellers, manage support issues, and initiate payment." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 711 -top 122 -width 205 -height 250 -title "Admins" -body "Review users and verification submissions, oversee listings and operations, monitor payments, and resolve disputes or inspections." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 42 -top 396 -width 874 -height 74 -title "Scope boundary" -body "AgriculNet is not just a public catalogue. It combines public discovery pages with authenticated operational dashboards, internal order/payment records, and verification governance." -fillColor $colors.GoldSoft -lineColor $colors.Gold | Out-Null
  Add-Footer -slide $slide -index 4

  # Slide 5
  $slide = $presentation.Slides.Add(5, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "System Overview" -title "Core platform features"
  Add-SectionCard -slide $slide -left 42 -top 118 -width 270 -height 120 -title "Marketplace discovery" -body "Browse crops, find verified farmers, inspect listing detail, and search international export-ready supply." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 330 -top 118 -width 270 -height 120 -title "Role-based dashboards" -body "Buyer, farmer, reseller, and admin workspaces present different controls, metrics, and operational flows." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 618 -top 118 -width 270 -height 120 -title "Protected operations" -body "Orders, payments, support requests, verification review, and admin oversight are all tracked through backend workflows." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 42 -top 260 -width 270 -height 140 -title "Communication layer" -body "Inquiries, messages, support tickets, and order-related conversation flows reduce transaction friction." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 330 -top 260 -width 270 -height 140 -title "Export readiness" -body "Public pages explain international sourcing, documentation, and ONCC / MINADER-aligned compliance expectations." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 618 -top 260 -width 270 -height 140 -title "Deployment" -body "Frontend is deployed on Vercel, backend on Railway, with Supabase for database and storage services." -fillColor $colors.White | Out-Null
  Add-Footer -slide $slide -index 5

  # Slide 6
  $slide = $presentation.Slides.Add(6, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Public Experience" -title "Public marketplace and export-facing presentation"
  Add-ImageCover -slide $slide -path $screenshots.InternationalExport -left 42 -top 118 -width 560 -height 330 | Out-Null
  Add-BulletBlock -slide $slide -left 628 -top 126 -width 278 -height 200 -items @(
    "Export-focused public page for international buyers",
    "Showcases export-ready listings and sourcing process",
    "Explains logistics, documentation, and payment protection",
    "Uses branded green and gold visual identity"
  ) | Out-Null
  Add-SectionCard -slide $slide -left 628 -top 338 -width 278 -height 110 -title "Presenter cue" -body "Use this slide to explain how AgriculNet attracts and informs buyers before they enter authenticated workflows." -fillColor $colors.GreenSoft -lineColor $colors.Green | Out-Null
  Add-Footer -slide $slide -index 6

  # Slide 7
  $slide = $presentation.Slides.Add(7, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Buyer Dashboard" -title "Buyer workflows: support, communication, and preferences"
  Add-ImageCover -slide $slide -path $screenshots.BuyerHelpSupport -left 42 -top 118 -width 275 -height 154 | Out-Null
  Add-ImageCover -slide $slide -path $screenshots.BuyerMessages -left 330 -top 118 -width 275 -height 154 | Out-Null
  Add-ImageCover -slide $slide -path $screenshots.BuyerSettings -left 618 -top 118 -width 288 -height 300 | Out-Null
  Add-BulletBlock -slide $slide -left 42 -top 292 -width 560 -height 150 -items @(
    "Help & Support page combines FAQ, guides, live support categories, and ticket submission",
    "Messages page keeps conversation context tied to order and listing activity",
    "Settings page centralizes account preferences, payment-method preference, language, privacy, and security surfaces"
  ) | Out-Null
  Add-Footer -slide $slide -index 7

  # Slide 8
  $slide = $presentation.Slides.Add(8, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Seller Operations" -title "Farmer and reseller workflows"
  Add-SectionCard -slide $slide -left 42 -top 122 -width 270 -height 140 -title "Listing management" -body "Sellers create listings, upload media, manage crop details, track availability, and present inventory to buyers." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 330 -top 122 -width 270 -height 140 -title "Order visibility" -body "Farmer and reseller dashboards track active orders, communication with buyers, and payout-related operational state." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 618 -top 122 -width 270 -height 140 -title "Verification controls" -body "Seller trust is tied to account state, identity verification, and listing-readiness review rather than open anonymous selling." -fillColor $colors.White | Out-Null
  Add-FlowStep -slide $slide -left 64 -top 312 -width 180 -height 94 -number "1" -title "Register" -body "Seller account created and role assigned."
  Add-FlowStep -slide $slide -left 274 -top 312 -width 180 -height 94 -number "2" -title "Verify" -body "Identity and profile workflow completed."
  Add-FlowStep -slide $slide -left 484 -top 312 -width 180 -height 94 -number "3" -title "List" -body "Crop inventory becomes visible to buyers."
  Add-FlowStep -slide $slide -left 694 -top 312 -width 180 -height 94 -number "4" -title "Fulfill" -body "Seller responds, confirms, and delivers against the order."
  Add-ArrowLine -slide $slide -x1 244 -y1 359 -x2 274 -y2 359 | Out-Null
  Add-ArrowLine -slide $slide -x1 454 -y1 359 -x2 484 -y2 359 | Out-Null
  Add-ArrowLine -slide $slide -x1 664 -y1 359 -x2 694 -y2 359 | Out-Null
  Add-Footer -slide $slide -index 8

  # Slide 9
  $slide = $presentation.Slides.Add(9, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Administration" -title "Admin and verification workflows"
  Add-ImageCover -slide $slide -path $screenshots.ONCCMINADER -left 560 -top 118 -width 350 -height 275 | Out-Null
  Add-BulletBlock -slide $slide -left 42 -top 126 -width 470 -height 170 -items @(
    "Admins review operational data across users, listings, payments, disputes, and inspections",
    "Verification evidence and account states are controlled from the backend",
    "Admin role maintains platform trust by deciding review, approval, rejection, and operational escalation paths"
  ) | Out-Null
  Add-SectionCard -slide $slide -left 42 -top 316 -width 470 -height 112 -title "Verification flow" -body "Registration -> email and phone verification -> identity review where required -> active dashboard access -> ongoing operational oversight." -fillColor $colors.GreenSoft -lineColor $colors.Green | Out-Null
  Add-Footer -slide $slide -index 9

  # Slide 10
  $slide = $presentation.Slides.Add(10, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Architecture" -title "System architecture and technology stack"
  $frontend = Add-SectionCard -slide $slide -left 42 -top 150 -width 180 -height 92 -title "Frontend" -body "Next.js 14 app router, Tailwind CSS, Zustand, React Query" -fillColor $colors.GreenSoft -lineColor $colors.Green
  $backend = Add-SectionCard -slide $slide -left 276 -top 150 -width 180 -height 92 -title "Backend API" -body "Express.js services, auth, orders, payments, messaging" -fillColor $colors.White -lineColor $colors.Green
  $supabase = Add-SectionCard -slide $slide -left 510 -top 150 -width 180 -height 92 -title "Supabase" -body "Database, storage, and supporting backend data services" -fillColor $colors.White -lineColor $colors.Green
  $fapshi = Add-SectionCard -slide $slide -left 744 -top 150 -width 150 -height 92 -title "Fapshi" -body "Hosted mobile-money checkout for MTN MoMo and Orange Money" -fillColor $colors.GoldSoft -lineColor $colors.Gold
  Add-ArrowLine -slide $slide -x1 222 -y1 196 -x2 276 -y2 196 | Out-Null
  Add-ArrowLine -slide $slide -x1 456 -y1 196 -x2 510 -y2 196 | Out-Null
  Add-ArrowLine -slide $slide -x1 456 -y1 222 -x2 744 -y2 222 | Out-Null
  Add-SectionCard -slide $slide -left 90 -top 302 -width 220 -height 96 -title "Frontend hosting" -body "Vercel serves the public site and authenticated dashboards." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 370 -top 302 -width 220 -height 96 -title "Backend hosting" -body "Railway runs the production API with environment-based configuration." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 650 -top 302 -width 220 -height 96 -title "Integration model" -body "Role-based dashboards talk to the API, which persists orders, payments, preferences, and messages." -fillColor $colors.White | Out-Null
  Add-Footer -slide $slide -index 10

  # Slide 11
  $slide = $presentation.Slides.Add(11, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Payment Flow" -title "From checkout to payment confirmation"
  Add-FlowStep -slide $slide -left 38 -top 160 -width 155 -height 110 -number "1" -title "Browse" -body "Buyer reviews listing detail and selects crop to source."
  Add-FlowStep -slide $slide -left 212 -top 160 -width 155 -height 110 -number "2" -title "Checkout" -body "Quantity, address, notes, and channel preference are entered."
  Add-FlowStep -slide $slide -left 386 -top 160 -width 155 -height 110 -number "3" -title "Create Order" -body "Backend creates order and payment intent."
  Add-FlowStep -slide $slide -left 560 -top 160 -width 155 -height 110 -number "4" -title "Hosted Pay" -body "Buyer is redirected to Fapshi for MoMo or Orange Money payment."
  Add-FlowStep -slide $slide -left 734 -top 160 -width 155 -height 110 -number "5" -title "Webhook" -body "Fapshi confirms payment status back to AgriculNet."
  Add-ArrowLine -slide $slide -x1 193 -y1 215 -x2 212 -y2 215 | Out-Null
  Add-ArrowLine -slide $slide -x1 367 -y1 215 -x2 386 -y2 215 | Out-Null
  Add-ArrowLine -slide $slide -x1 541 -y1 215 -x2 560 -y2 215 | Out-Null
  Add-ArrowLine -slide $slide -x1 715 -y1 215 -x2 734 -y2 215 | Out-Null
  Add-SectionCard -slide $slide -left 42 -top 320 -width 408 -height 110 -title "Business meaning" -body "Payment is initiated by buyers only. Farmers and resellers remain sellers and do not use buyer checkout surfaces. Admin controls later payout/release oversight." -fillColor $colors.GreenSoft -lineColor $colors.Green | Out-Null
  Add-SectionCard -slide $slide -left 490 -top 320 -width 398 -height 110 -title "Near-term direction" -body "The current integration direction uses hosted checkout, transaction tracking, and webhook confirmation rather than direct card-wallet capture inside the frontend." -fillColor $colors.GoldSoft -lineColor $colors.Gold | Out-Null
  Add-Footer -slide $slide -index 11

  # Slide 12
  $slide = $presentation.Slides.Add(12, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Deployment" -title "How the system is hosted and delivered"
  Add-SectionCard -slide $slide -left 42 -top 122 -width 255 -height 122 -title "Frontend" -body "Hosted on Vercel under the AgriculNet web domain, serving public pages and dashboard routes." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 352 -top 122 -width 255 -height 122 -title "Backend" -body "Hosted on Railway with environment-based configuration for API routing, auth, email, SMS, and payment services." -fillColor $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 662 -top 122 -width 255 -height 122 -title "Data Layer" -body "Supabase provides database persistence and storage for platform records and assets." -fillColor $colors.White | Out-Null
  Add-BulletBlock -slide $slide -left 58 -top 286 -width 846 -height 125 -items @(
    "Vercel frontend calls the Railway API through configured environment variables",
    "Railway handles protected backend routes and webhook endpoints",
    "Supabase stores marketplace data, profiles, listings, orders, and asset references",
    "This split improves delivery speed while keeping database and file workflows centralized"
  ) | Out-Null
  Add-Footer -slide $slide -index 12

  # Slide 13
  $slide = $presentation.Slides.Add(13, 12)
  Add-TopBand $slide
  Add-Title -slide $slide -eyebrow "Challenges and Limitations" -title "What was solved and what still needs refinement"
  Add-SectionCard -slide $slide -left 42 -top 122 -width 410 -height 150 -title "Challenges solved" -body "Frontend-to-backend integration is now live, domain routing is configured, buyer/public experiences are much stronger, and the platform reflects real roles and workflows rather than static demo-only pages." -fillColor $colors.GreenSoft -lineColor $colors.Green | Out-Null
  Add-BulletBlock -slide $slide -left 490 -top 130 -width 380 -height 138 -items @(
    "Authentication and dashboard routing alignment",
    "Hosted frontend/backend deployment path",
    "Role-aware marketplace and admin separation",
    "Preparation for real mobile-money integration"
  ) | Out-Null
  Add-SectionCard -slide $slide -left 42 -top 300 -width 846 -height 120 -title "Current limitations" -body "Some provider credentials and live payment-account details still need to be finalized. Some operational areas remain iterative, including deeper analytics, broader CMS-driven content, and production-hardening around provider integrations." -fillColor $colors.RedSoft -lineColor (Get-OfficeRgb 239 68 68) | Out-Null
  Add-Footer -slide $slide -index 13

  # Slide 14
  $slide = $presentation.Slides.Add(14, 12)
  Add-TopBand $slide
  $bg2 = $slide.Shapes.AddShape(1, 0, 18, 960, 522)
  $bg2.Line.Visible = 0
  Set-ShapeFill $bg2 $colors.GreenDark
  Add-TextBox -slide $slide -left 60 -top 82 -width 620 -height 34 -text "Conclusion and Demo Cue" -fontSize 14 -fontName $fonts.Sans -color $colors.Gold -bold $true | Out-Null
  Add-TextBox -slide $slide -left 60 -top 124 -width 620 -height 70 -text "AgriculNet shows how software can structure agricultural trade around trust, visibility, and operational control." -fontSize 30 -fontName $fonts.Display -color $colors.White -bold $true | Out-Null
  Add-BulletBlock -slide $slide -left 60 -top 228 -width 470 -height 130 -items @(
    "The platform is designed around real user roles and real trade workflows",
    "It combines marketplace access, verification, communication, and protected operations",
    "It is relevant to Cameroon’s current agricultural and export context"
  ) -fontSize 16 -color $colors.White | Out-Null
  Add-SectionCard -slide $slide -left 580 -top 210 -width 280 -height 150 -title "Live demo cue" -body "Recommended walkthrough: home page -> browse -> crop detail -> buyer dashboard -> support/messages/settings -> admin overview." -fillColor $colors.GoldSoft -lineColor $colors.Gold | Out-Null
  Add-TextBox -slide $slide -left 60 -top 434 -width 420 -height 32 -text "Thank you" -fontSize 28 -fontName $fonts.Display -color $colors.White -bold $true | Out-Null
  Add-TextBox -slide $slide -left 60 -top 470 -width 520 -height 24 -text "Questions and discussion" -fontSize 18 -fontName $fonts.Sans -color $colors.White | Out-Null

  $presentation.SaveAs($outputPath)
  $presentation.Close()
  $ppt.Quit()

  "Created: $outputPath"
}
finally {
  if ($presentation -ne $null) {
    try { $presentation.Close() } catch {}
  }
  if ($ppt -ne $null) {
    try { $ppt.Quit() } catch {}
  }
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}
