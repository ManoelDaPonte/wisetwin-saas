import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CertificateData {
  userName: string;
  userEmail: string;
  formationName: string;
  completionDate: string;
  organizationName: string;
  certificateId: string;
  buildType: 'wisetrainer' | 'wisetour';
}

function getCertificateTemplate(data: CertificateData): string {
  const typeLabel = data.buildType === 'wisetrainer' ? 'Formation' : 'Visite Virtuelle';
  
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
    
    .organization-name {
      font-size: 18px;
      font-weight: 600;
      color: #000;
      margin-bottom: 5px;
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
    
    .user-name {
      font-size: 20px;
      font-weight: 600;
      color: #000;
      margin-bottom: 5px;
    }
    
    .user-email {
      font-size: 14px;
      color: #666;
      font-family: 'Courier New', monospace;
    }
    
    .formation-details {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #000;
      background: #fafafa;
    }
    
    .formation-type {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    
    .formation-name {
      font-size: 18px;
      font-weight: 600;
      color: #000;
      margin-bottom: 10px;
    }
    
    .completion-info {
      font-size: 14px;
      color: #333;
    }
    
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding-top: 20px;
    }
    
    .signature-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
    }
    
    .signature-left {
      flex: 1;
    }
    
    .signature-right {
      flex: 1;
      text-align: right;
    }
    
    .wisetwin-stamp {
      width: 100px;
      height: 100px;
      border: 3px solid #000;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      line-height: 1.2;
    }
    
    .stamp-text-1 {
      font-size: 8px;
      margin-bottom: 2px;
    }
    
    .stamp-text-2 {
      font-size: 12px;
      font-weight: 900;
    }
    
    .stamp-text-3 {
      font-size: 8px;
      margin-top: 2px;
    }
    
    .certificate-info {
      text-align: center;
      font-size: 10px;
      color: #666;
      font-family: 'Courier New', monospace;
    }
    
    .date-location {
      text-align: right;
      margin-bottom: 10px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <img src="https://res.cloudinary.com/dhojbmhmr/image/upload/v1748940258/logo_wisetwin_dark_atpnkr.svg" alt="WiseTwin Logo" class="logo">
      <div class="organization-name">${data.organizationName}</div>
      <h1 class="document-title">Certificat</h1>
      <p class="subtitle">de réussite de formation</p>
    </div>
    
    <div class="content">
      <p class="certification-text">
        Le soussigné certifie par les présentes que :
      </p>
      
      <div class="user-info">
        <div class="user-name">${data.userName || 'Non spécifié'}</div>
        <div class="user-email">${data.userEmail}</div>
      </div>
      
      <p class="certification-text">
        a suivi et validé avec succès la ${typeLabel.toLowerCase()} ci-dessous mentionnée, 
        en respectant tous les critères d'évaluation et objectifs pédagogiques définis.
      </p>
      
      <div class="formation-details">
        <div class="formation-type">${typeLabel}</div>
        <div class="formation-name">${data.formationName}</div>
        <div class="completion-info">
          Terminée avec succès le ${data.completionDate}
        </div>
      </div>
      
      <p class="certification-text">
        Cette attestation est délivrée pour valoir ce que de droit.
      </p>
    </div>
    
    <div class="footer">
      <div class="date-location">
        Fait le ${data.completionDate}
      </div>
      
      <div class="signature-section">
        <div class="signature-left">
          <p style="font-size: 12px; margin-bottom: 40px;">Signature et cachet :</p>
          <div class="wisetwin-stamp">
            <div class="stamp-text-1">CERTIFIÉ PAR</div>
            <div class="stamp-text-2">WISETWIN</div>
            <div class="stamp-text-3">PLATFORM</div>
          </div>
        </div>
        
        <div class="signature-right">
          <p style="font-size: 12px; font-weight: 600;">WiseTwin Platform</p>
          <p style="font-size: 10px; color: #666; margin-top: 5px;">Plateforme de formation certifiée</p>
        </div>
      </div>
      
      <div class="certificate-info">
        Numéro de certificat : ${data.certificateId}<br>
        Document généré automatiquement - Authenticité vérifiable
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export const GET = withAuth(async (request) => {
  try {
    const url = new URL(request.url);
    const buildName = url.searchParams.get("buildName");
    const buildType = url.searchParams.get("buildType") as 'wisetrainer' | 'wisetour';

    if (!buildName || !buildType) {
      return NextResponse.json(
        { error: "buildName et buildType sont requis" },
        { status: 400 }
      );
    }

    // Pour l'espace personnel, utiliser l'azureContainerId de l'utilisateur
    const containerId = request.user.azureContainerId;
    if (!containerId) {
      return NextResponse.json(
        { error: "Container personnel non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a bien terminé cette formation
    const completionRecord = await prisma.trainingAnalytics.findFirst({
      where: {
        userId: request.user.id,
        buildName,
        buildType: buildType.toUpperCase() as "WISETOUR" | "WISETRAINER",
        containerId,
        completionStatus: "COMPLETED",
      },
      orderBy: {
        endTime: "desc",
      },
    });

    if (!completionRecord) {
      return NextResponse.json(
        { error: "Formation non terminée ou non trouvée" },
        { status: 404 }
      );
    }

    // Préparer les données du certificat
    const certificateData: CertificateData = {
      userName: request.user.name || request.user.email,
      userEmail: request.user.email,
      formationName: buildName,
      completionDate: format(
        completionRecord.endTime || completionRecord.updatedAt,
        "d MMMM yyyy",
        { locale: fr }
      ),
      organizationName: "Espace Personnel", // Pour l'espace personnel
      certificateId: `WT-${completionRecord.id.slice(-8).toUpperCase()}`,
      buildType: buildType,
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
    console.error("Erreur génération certificat personnel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du certificat" },
      { status: 500 }
    );
  }
});
