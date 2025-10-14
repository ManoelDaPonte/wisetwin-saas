import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createHash } from "crypto";
import QRCode from "qrcode";

interface CertificateData {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  formationName: string;
  completionDate: string;
  organizationName: string;
  certificateId: string;
  buildType: "wisetrainer" | "wisetour";
  verificationUrl: string;
  verificationCode: string;
  qrCodeDataUrl: string;
}

function generateVerificationCode(trainingAnalyticsId: string): string {
  const hash = createHash("sha256")
    .update(trainingAnalyticsId)
    .digest("base64url")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  return `WT-${hash.slice(0, 12)}`;
}

function resolveUserNames(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback?: string
): { firstName: string; lastName: string; fullName: string } {
  let resolvedFirst = firstName?.trim() ?? "";
  let resolvedLast = lastName?.trim() ?? "";

  const safeFallback = fallback?.trim();
  const canSplitFallback =
    safeFallback && safeFallback.length > 0 && !safeFallback.includes("@");

  if (canSplitFallback) {
    const parts = safeFallback!.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      if (!resolvedFirst) {
        resolvedFirst = parts[0];
      }
    } else if (parts.length > 1) {
      if (!resolvedFirst) {
        resolvedFirst = parts[0];
      }
      if (!resolvedLast) {
        resolvedLast = parts.slice(1).join(" ");
      }
    }
  }

  if (!resolvedFirst) {
    resolvedFirst = "Prénom non renseigné";
  }
  if (!resolvedLast) {
    resolvedLast = "Nom non renseigné";
  }

  const fullNameParts = [resolvedFirst, resolvedLast].filter(Boolean);
  const fullName =
    fullNameParts.length > 0
      ? fullNameParts.join(" ")
      : fallback || "Identité non renseignée";

  return {
    firstName: resolvedFirst,
    lastName: resolvedLast,
    fullName,
  };
}

function getCertificateTemplate(data: CertificateData): string {
  const typeLabel = data.buildType === "wisetrainer" ? "Formation" : "Visite Virtuelle";
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificat WiseTwin</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: white;
      width: 210mm;
      height: 297mm;
      padding: 25mm;
      line-height: 1.6;
      color: #333;
    }
    
    .certificate {
      max-width: 160mm;
      margin: 0 auto;
      position: relative;
      min-height: 240mm;
    }
    
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 15px;
    }
    
    .document-title {
      font-size: 32px;
      font-weight: 700;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 20px;
    }
    
    .subtitle {
      font-size: 16px;
      color: #666;
      font-style: italic;
      margin-top: 5px;
    }
    
    .content {
      margin: 40px 0;
      text-align: justify;
    }
    
    .certification-text {
      font-size: 14px;
      line-height: 1.8;
      margin-bottom: 25px;
    }
    
    .user-info {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border: 1px solid #ddd;
    }
    
    .user-info-row {
      display: flex;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }

    .info-label {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-weight: 500;
      color: #000;
    }
    
    .user-email {
      font-size: 14px;
      color: #666;
      font-family: 'Courier New', monospace;
    }
    
    .formation-details {
      margin: 25px 0;
      padding: 22px;
      border: 1px solid #ddd;
      background: #f8f9fa;
      text-align: center;
    }
    
    .formation-name {
      font-size: 20px;
      font-weight: 700;
      color: #000;
      margin-bottom: 10px;
    }
    
    .formation-meta {
      display: inline-flex;
      flex-direction: column;
      gap: 8px;
      font-size: 13px;
      color: #333;
      text-align: left;
    }

    .meta-label {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .certificate-info {
      text-align: center;
      font-size: 10px;
      color: #666;
      font-family: 'Courier New', monospace;
    }
    
    .verification-section {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      padding: 20px;
      border: 1px solid #ddd;
      background: #f8f9fa;
    }

    .qr-wrapper {
      border: 1px solid #000;
      padding: 12px;
      background: #fff;
    }

    .qr-code {
      width: 120px;
      height: 120px;
      object-fit: contain;
      display: block;
    }

    .verification-text {
      font-size: 12px;
      color: #333;
      line-height: 1.6;
    }

    .verification-url {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #000;
      text-decoration: underline;
      white-space: nowrap;
    }

  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <img src="https://res.cloudinary.com/dhojbmhmr/image/upload/v1748940258/logo_wisetwin_dark_atpnkr.svg" alt="WiseTwin Logo" class="logo">
      <h1 class="document-title">Certificat</h1>
      <p class="subtitle">de réussite de formation</p>
    </div>
    
    <div class="content">
      <p class="certification-text">
        Le soussigné certifie par les présentes que :
      </p>
      
      <div class="user-info">
        <div class="user-info-row">
          <span class="info-label">Nom :</span>
          <span class="info-value">${data.userLastName}</span>
        </div>
        <div class="user-info-row">
          <span class="info-label">Prénom :</span>
          <span class="info-value">${data.userFirstName}</span>
        </div>
        <div class="user-email">${data.userEmail}</div>
      </div>
      
      <p class="certification-text">
        a suivi et validé avec succès la ${typeLabel.toLowerCase()} ci-dessous mentionnée, 
        en respectant tous les critères d'évaluation et objectifs pédagogiques définis.
      </p>
      
      <div class="formation-details">
        <div class="formation-name">${data.formationName}</div>
        <div class="formation-meta">
          <div><span class="meta-label">Organisation :</span> ${data.organizationName}</div>
          <div><span class="meta-label">Date de validation :</span> ${data.completionDate}</div>
        </div>
      </div>
      
      <p class="certification-text">
        Cette attestation est délivrée pour valoir ce que de droit.
      </p>
    </div>
    
    <div class="footer">
      <div class="verification-section">
        <div class="qr-wrapper">
          <img src="${data.qrCodeDataUrl}" alt="Vérification du certificat" class="qr-code" />
        </div>
        <div class="verification-text">
          <p>Scannez ce code pour vérifier l'authenticité de ce certificat.</p>
          <p>Code de vérification : <strong>${data.verificationCode}</strong></p>
          <p>Ou visitez :
            <a href="${data.verificationUrl}" class="verification-url">${data.verificationUrl}</a>
          </p>
        </div>
      </div>
      
      <div class="certificate-info">
        Numéro de certificat : ${data.certificateId}<br>
        Document généré automatiquement - Authenticité vérifiable en ligne
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export const GET = withOrgAuth(async (request) => {
  try {
    const url = new URL(request.url);
    const buildName = url.searchParams.get("buildName");
    const buildType = url.searchParams.get("buildType") as "wisetrainer" | "wisetour";
    const providedDisplayName = url.searchParams.get("displayName")?.trim();

    if (!buildName || !buildType) {
      return NextResponse.json(
        { error: "buildName et buildType sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a bien terminé cette formation via TrainingAnalytics
    const completedAnalytics = await prisma.trainingAnalytics.findFirst({
      where: {
        userId: request.user.id,
        buildName: buildName,
        buildType: buildType.toUpperCase() as "WISETOUR" | "WISETRAINER",
        containerId: request.organization.azureContainerId,
        completionStatus: 'COMPLETED',
      },
      orderBy: {
        endTime: 'desc', // Prendre la plus récente
      },
      include: {
        user: true,
      },
    });

    if (!completedAnalytics) {
      return NextResponse.json(
        { error: "Formation non terminée ou non trouvée" },
        { status: 404 }
      );
    }

    let formationName =
      providedDisplayName && providedDisplayName.length > 0
        ? providedDisplayName
        : buildName;

    if (
      (!providedDisplayName || providedDisplayName.length === 0) &&
      completedAnalytics.trainingId
    ) {
      const trainingPlan = await prisma.trainingTag.findUnique({
        where: { id: completedAnalytics.trainingId },
      });
      if (trainingPlan?.name) {
        formationName = trainingPlan.name;
      }
    }

    if (!formationName) {
      formationName = "Formation non renseignée";
    }

    const verificationRecord = await prisma.certificateVerification.upsert({
      where: {
        trainingAnalyticsId: completedAnalytics.id,
      },
      update: {
        formationName,
      },
      create: {
        trainingAnalyticsId: completedAnalytics.id,
        code: generateVerificationCode(completedAnalytics.id),
        formationName,
      },
    });

    const resolvedNames = resolveUserNames(
      completedAnalytics.user?.firstName,
      completedAnalytics.user?.name,
      [request.user.firstName, request.user.name].filter(Boolean).join(" ") ||
        request.user.email
    );

    const verificationUrl = `${request.nextUrl.origin}/certifications/verification/${verificationRecord.code}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 240,
      margin: 1,
    });

    // Préparer les données du certificat
    const certificateData: CertificateData = {
      userFirstName: resolvedNames.firstName,
      userLastName: resolvedNames.lastName,
      userEmail: request.user.email,
      formationName,
      completionDate: format(
        completedAnalytics.endTime,
        "d MMMM yyyy",
        { locale: fr }
      ),
      organizationName: request.organization.name,
      certificateId: verificationRecord.code,
      buildType: buildType,
      verificationUrl,
      verificationCode: verificationRecord.code,
      qrCodeDataUrl,
    };

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    
    // Charger le template HTML
    const html = getCertificateTemplate(certificateData);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Générer le PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0', 
        bottom: '0',
        left: '0',
      },
    });

    await browser.close();

    // Nom du fichier
    const filename = `Certificat-${buildName.replace(/[^a-zA-Z0-9]/g, '-')}-${certificateData.certificateId}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Erreur génération certificat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du certificat" },
      { status: 500 }
    );
  }
});
