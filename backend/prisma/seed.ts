import { PrismaClient, TestCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lims.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@lims.com',
      password,
      role: 'ADMIN',
    },
  });

  const receptionPassword = await bcrypt.hash('reception123', 10);
  const reception = await prisma.user.upsert({
    where: { email: 'reception@lims.com' },
    update: {},
    create: {
      name: 'Resepsiyon',
      email: 'reception@lims.com',
      password: receptionPassword,
      role: 'RECEPTION',
    },
  });

  // Test Parametreleri Oluştur
  // BIO - Biyokimya Parametreleri (Genişletilmiş)
  const bioParams = [
    // Temel Metabolik Panel
    { code: 'GLU', name: 'Glukoz', unit: 'mg/dL', referenceRange: '70-100' },
    { code: 'URE', name: 'Üre', unit: 'mg/dL', referenceRange: '15-45' },
    { code: 'CRE', name: 'Kreatinin', unit: 'mg/dL', referenceRange: '0.6-1.2' },
    { code: 'UA', name: 'Ürik Asit', unit: 'mg/dL', referenceRange: 'Kadın: 2.5-6.0, Erkek: 3.5-7.0' },
    { code: 'NA', name: 'Sodyum (Na)', unit: 'mEq/L', referenceRange: '136-145' },
    { code: 'K', name: 'Potasyum (K)', unit: 'mEq/L', referenceRange: '3.5-5.0' },
    { code: 'CL', name: 'Klor (Cl)', unit: 'mEq/L', referenceRange: '98-107' },
    { code: 'CA', name: 'Kalsiyum (Ca)', unit: 'mg/dL', referenceRange: '8.5-10.5' },
    { code: 'P', name: 'Fosfor (P)', unit: 'mg/dL', referenceRange: '2.5-4.5' },
    { code: 'MG', name: 'Magnezyum (Mg)', unit: 'mg/dL', referenceRange: '1.7-2.2' },
    // Karaciğer Fonksiyon Testleri
    { code: 'AST', name: 'AST (SGOT)', unit: 'U/L', referenceRange: '10-40' },
    { code: 'ALT', name: 'ALT (SGPT)', unit: 'U/L', referenceRange: '10-40' },
    { code: 'GGT', name: 'GGT', unit: 'U/L', referenceRange: 'Kadın: 5-36, Erkek: 8-61' },
    { code: 'ALP', name: 'Alkalen Fosfataz', unit: 'U/L', referenceRange: '44-147' },
    { code: 'BIL-T', name: 'Total Bilirubin', unit: 'mg/dL', referenceRange: '0.2-1.2' },
    { code: 'BIL-D', name: 'Direkt Bilirubin', unit: 'mg/dL', referenceRange: '0-0.3' },
    { code: 'LDH', name: 'LDH', unit: 'U/L', referenceRange: '140-280' },
    { code: 'AMY', name: 'Amilaz', unit: 'U/L', referenceRange: '28-100' },
    { code: 'LIP', name: 'Lipaz', unit: 'U/L', referenceRange: '13-60' },
    // Proteinler
    { code: 'TP', name: 'Total Protein', unit: 'g/dL', referenceRange: '6.0-8.0' },
    { code: 'ALB', name: 'Albumin', unit: 'g/dL', referenceRange: '3.5-5.0' },
    { code: 'GLOB', name: 'Globulin', unit: 'g/dL', referenceRange: '2.0-3.5' },
    { code: 'A-G', name: 'A/G Ratio', unit: '', referenceRange: '1.0-2.0' },
    // Lipid Panel
    { code: 'CHOL', name: 'Total Kolesterol', unit: 'mg/dL', referenceRange: '<200' },
    { code: 'HDL', name: 'HDL Kolesterol', unit: 'mg/dL', referenceRange: '>40' },
    { code: 'LDL', name: 'LDL Kolesterol', unit: 'mg/dL', referenceRange: '<100' },
    { code: 'TG', name: 'Trigliserd', unit: 'mg/dL', referenceRange: '<150' },
    { code: 'VLDL', name: 'VLDL', unit: 'mg/dL', referenceRange: '5-40' },
    // Böbrek Fonksiyonları
    { code: 'EGFR', name: 'eGFR', unit: 'mL/min/1.73m²', referenceRange: '>60' },
    { code: 'MA', name: 'Mikroalbuminüri', unit: 'mg/24h', referenceRange: '<30' },
    { code: 'BUN-CRE', name: 'BUN/CREA Ratio', unit: '', referenceRange: '10-20' },
    // Diğer
    { code: 'CRP', name: 'CRP', unit: 'mg/L', referenceRange: '<3' },
    { code: 'HS-CRP', name: 'hs-CRP', unit: 'mg/L', referenceRange: '<1' },
    { code: 'FERR', name: 'Ferritin', unit: 'ng/mL', referenceRange: 'Kadın: 15-150, Erkek: 20-300' },
    { code: 'CK', name: 'CK', unit: 'U/L', referenceRange: 'Kadın: 26-140, Erkek: 39-308' },
    { code: 'CK-MB', name: 'CK-MB', unit: 'U/L', referenceRange: '<25' },
    { code: 'TROP-I', name: 'Troponin-I', unit: 'ng/mL', referenceRange: '<0.04' },
    { code: 'TROP-T', name: 'Troponin-T', unit: 'ng/mL', referenceRange: '<0.01' },
    { code: 'BNP', name: 'BNP / NT-proBNP', unit: 'pg/mL', referenceRange: '<100' },
  ];

  // HEM - Hematoloji Parametreleri (Genişletilmiş)
  const hemParams = [
    { code: 'WBC', name: 'WBC', unit: '10³/µL', referenceRange: '4.0-11.0' },
    { code: 'RBC', name: 'RBC', unit: '10⁶/µL', referenceRange: '4.5-5.5' },
    { code: 'HGB', name: 'HGB', unit: 'g/dL', referenceRange: '12-16' },
    { code: 'HCT', name: 'HCT', unit: '%', referenceRange: '36-48' },
    { code: 'MCV', name: 'MCV', unit: 'fL', referenceRange: '80-100' },
    { code: 'MCH', name: 'MCH', unit: 'pg', referenceRange: '27-31' },
    { code: 'MCHC', name: 'MCHC', unit: 'g/dL', referenceRange: '32-36' },
    { code: 'RDW-SD', name: 'RDW-SD', unit: 'fL', referenceRange: '39-46' },
    { code: 'RDW-CV', name: 'RDW-CV', unit: '%', referenceRange: '11.5-14.5' },
    { code: 'PLT', name: 'PLT', unit: '10³/µL', referenceRange: '150-450' },
    { code: 'MPV', name: 'MPV', unit: 'fL', referenceRange: '7.5-11.5' },
    { code: 'PDW', name: 'PDW', unit: '%', referenceRange: '10-17' },
    { code: 'PCT', name: 'PCT', unit: '%', referenceRange: '0.15-0.35' },
    { code: 'NEU-P', name: 'NEU %', unit: '%', referenceRange: '40-75' },
    { code: 'NEU-A', name: 'NEU abs', unit: '10³/µL', referenceRange: '1.8-7.0' },
    { code: 'LYM-P', name: 'LYM %', unit: '%', referenceRange: '20-45' },
    { code: 'LYM-A', name: 'LYM abs', unit: '10³/µL', referenceRange: '1.0-4.0' },
    { code: 'MONO-P', name: 'MONO %', unit: '%', referenceRange: '2-10' },
    { code: 'MONO-A', name: 'MONO abs', unit: '10³/µL', referenceRange: '0.2-1.0' },
    { code: 'EOS-P', name: 'EOS %', unit: '%', referenceRange: '0-6' },
    { code: 'EOS-A', name: 'EOS abs', unit: '10³/µL', referenceRange: '0-0.5' },
    { code: 'BASO-P', name: 'BASO %', unit: '%', referenceRange: '0-1' },
    { code: 'BASO-A', name: 'BASO abs', unit: '10³/µL', referenceRange: '0-0.1' },
    { code: 'IG', name: 'IG (Immature Granules)', unit: '%', referenceRange: '<1' },
    { code: 'RET', name: 'Retikülosit (RET)', unit: '%', referenceRange: '0.5-2.0' },
  ];

  // URI - İdrar Parametreleri (Genişletilmiş)
  const uriParams = [
    // İdrar Kimyası
    { code: 'UR-GLU', name: 'Glukoz', unit: '', referenceRange: 'Negatif' },
    { code: 'UR-PRO', name: 'Protein', unit: '', referenceRange: 'Negatif' },
    { code: 'UR-BIL', name: 'Bilirubin', unit: '', referenceRange: 'Negatif' },
    { code: 'UR-KET', name: 'Ketone', unit: '', referenceRange: 'Negatif' },
    { code: 'UR-BLD', name: 'Kan (HB)', unit: '/HPF', referenceRange: '0-2' },
    { code: 'UR-NIT', name: 'Nitrit', unit: '', referenceRange: 'Negatif' },
    { code: 'UR-LE', name: 'Lökosit Esteraz', unit: '', referenceRange: 'Negatif' },
    { code: 'UR-SG', name: 'Dansite', unit: '', referenceRange: '1.003-1.030' },
    { code: 'UR-pH', name: 'pH', unit: '', referenceRange: '5.0-8.0' },
    // Mikroskopi
    { code: 'UR-RBC', name: 'Eritrosit (RBC)', unit: '/HPF', referenceRange: '0-2' },
    { code: 'UR-WBC', name: 'Lökosit (WBC)', unit: '/HPF', referenceRange: '0-5' },
    { code: 'UR-EPI', name: 'Epitelyum', unit: '/HPF', referenceRange: 'Az' },
    { code: 'UR-CYL', name: 'Silendir', unit: '/LPF', referenceRange: '0' },
    { code: 'UR-CRY', name: 'Kristaller', unit: '', referenceRange: 'Yok' },
    { code: 'UR-BAC', name: 'Bakteri', unit: '', referenceRange: 'Yok' },
    // 24 Saatlik İdrar
    { code: 'UR-24P', name: '24h Protein', unit: 'mg/24h', referenceRange: '<150' },
    { code: 'UR-24C', name: '24h Kreatinin', unit: 'mg/24h', referenceRange: '800-2000' },
    { code: 'UR-24CA', name: '24h Kalsiyum', unit: 'mg/24h', referenceRange: '100-300' },
    { code: 'UR-24UA', name: '24h Ürik Asit', unit: 'mg/24h', referenceRange: '250-750' },
    { code: 'UR-24NA', name: '24h Sodyum-Potasyum', unit: 'mEq/24h', referenceRange: 'Na: 40-220, K: 25-125' },
  ];

  // HOR - Hormon Parametreleri (Genişletilmiş)
  const horParams = [
    // Tiroid Paneli
    { code: 'TSH', name: 'TSH', unit: 'mIU/L', referenceRange: '0.4-4.0' },
    { code: 'FT3', name: 'fT3', unit: 'pg/mL', referenceRange: '2.3-4.2' },
    { code: 'FT4', name: 'fT4', unit: 'ng/dL', referenceRange: '0.8-1.8' },
    { code: 'T3', name: 'T3', unit: 'ng/dL', referenceRange: '80-200' },
    { code: 'T4', name: 'T4', unit: 'µg/dL', referenceRange: '4.5-12.0' },
    { code: 'ANTI-TPO', name: 'Anti-TPO', unit: 'IU/mL', referenceRange: '<60' },
    { code: 'ANTI-TG', name: 'Anti-TG', unit: 'IU/mL', referenceRange: '<60' },
    // Üreme Hormonları
    { code: 'FSH', name: 'FSH', unit: 'mIU/mL', referenceRange: 'Kadın: 3.5-12.5, Erkek: 1.5-12.4' },
    { code: 'LH', name: 'LH', unit: 'mIU/mL', referenceRange: 'Kadın: 2.4-12.6, Erkek: 1.7-8.6' },
    { code: 'E2', name: 'Estradiol (E2)', unit: 'pg/mL', referenceRange: 'Kadın: 30-400, Erkek: 10-50' },
    { code: 'PROG', name: 'Progesteron', unit: 'ng/mL', referenceRange: 'Kadın: 0.1-25, Erkek: <0.2' },
    { code: 'PRL', name: 'Prolaktin', unit: 'ng/mL', referenceRange: 'Kadın: 4.8-23.3, Erkek: 4.0-15.2' },
    { code: 'TES', name: 'Testosteron', unit: 'ng/dL', referenceRange: 'Kadın: 15-70, Erkek: 300-1000' },
    { code: 'AMH', name: 'AMH', unit: 'ng/mL', referenceRange: 'Kadın: 1.0-4.0' },
    // Adrenal / Kortizol
    { code: 'CORT', name: 'Kortizol', unit: 'µg/dL', referenceRange: '5-25' },
    { code: 'ACTH', name: 'ACTH', unit: 'pg/mL', referenceRange: '7.2-63.3' },
    { code: 'DHEA-S', name: 'DHEA-S', unit: 'µg/dL', referenceRange: 'Kadın: 35-430, Erkek: 80-560' },
    // Diğer
    { code: 'VIT-D', name: 'Vitamin D (25-OH)', unit: 'ng/mL', referenceRange: '30-100' },
    { code: 'PTH', name: 'PTH', unit: 'pg/mL', referenceRange: '10-65' },
    { code: 'INS', name: 'Insulin', unit: 'µIU/mL', referenceRange: '2.6-24.9' },
    { code: 'C-PEP', name: 'C-Peptid', unit: 'ng/mL', referenceRange: '0.9-7.1' },
  ];

  // KOA - Koagülasyon Parametreleri
  const coaParams = [
    { code: 'PT', name: 'PT', unit: 'sn', referenceRange: '11-13' },
    { code: 'INR', name: 'INR', unit: '', referenceRange: '0.9-1.2' },
    { code: 'APTT', name: 'aPTT', unit: 'sn', referenceRange: '25-35' },
    { code: 'FIB', name: 'Fibrinojen', unit: 'mg/dL', referenceRange: '200-400' },
    { code: 'D-DIM', name: 'D-Dimer', unit: 'µg/mL', referenceRange: '<0.5' },
  ];

  // KAN - Kan Grubu Parametreleri
  const kanParams = [
    { code: 'ABO', name: 'Kan Grubu (ABO)', unit: '', referenceRange: 'A, B, AB, O' },
    { code: 'RH', name: 'Rh (D)', unit: '', referenceRange: 'Pozitif/Negatif' },
    { code: 'COOMBS-D', name: 'Coombs Testi (Direkt)', unit: '', referenceRange: 'Negatif' },
    { code: 'COOMBS-I', name: 'Coombs Testi (İndirekt)', unit: '', referenceRange: 'Negatif' },
    { code: 'ANTI-SCR', name: 'Antikor Taraması', unit: '', referenceRange: 'Negatif' },
  ];

  // MİKRO - Mikrobiyoloji Parametreleri
  const micParams = [
    { code: 'CULT-TH', name: 'Boğaz Kültürü', unit: '', referenceRange: 'Normal flora' },
    { code: 'CULT-UR', name: 'İdrar Kültürü', unit: '', referenceRange: '<10⁵ CFU/mL' },
    { code: 'CULT-ST', name: 'Gaita Kültürü', unit: '', referenceRange: 'Negatif' },
    { code: 'CULT-BL', name: 'Kan Kültürü', unit: '', referenceRange: 'Negatif' },
    { code: 'CULT-VA', name: 'Vajinal Kültür', unit: '', referenceRange: 'Normal flora' },
    { code: 'CULT-SP', name: 'Sperm Kültürü', unit: '', referenceRange: '<10³ CFU/mL' },
    { code: 'ANTI-W', name: 'Antibiyogram (Geniş Panel)', unit: '', referenceRange: 'Duyarlılık testi' },
    { code: 'ANTI-S', name: 'Antibiyogram (Seçili Panel)', unit: '', referenceRange: 'Duyarlılık testi' },
  ];

  // İMM - İmmünoloji/Seroloji Parametreleri
  const immParams = [
    { code: 'HBSAG', name: 'HBsAg', unit: '', referenceRange: 'Negatif' },
    { code: 'ANTI-HBS', name: 'Anti-HBs', unit: 'mIU/mL', referenceRange: '<10' },
    { code: 'ANTI-HBC', name: 'Anti-HBc Total', unit: '', referenceRange: 'Negatif' },
    { code: 'ANTI-HCV', name: 'Anti-HCV', unit: '', referenceRange: 'Negatif' },
    { code: 'HIV-COMBO', name: 'HIV Combo Ag/Ab', unit: '', referenceRange: 'Negatif' },
    { code: 'RPR', name: 'RPR (Sifiliz)', unit: '', referenceRange: 'Negatif' },
    { code: 'RUB-IgM', name: 'Rubella IgM', unit: '', referenceRange: 'Negatif' },
    { code: 'RUB-IgG', name: 'Rubella IgG', unit: 'IU/mL', referenceRange: '<10' },
    { code: 'TOX-IgM', name: 'Toxoplasma IgM', unit: '', referenceRange: 'Negatif' },
    { code: 'TOX-IgG', name: 'Toxoplasma IgG', unit: 'IU/mL', referenceRange: '<3' },
    { code: 'CMV-IgM', name: 'CMV IgM', unit: '', referenceRange: 'Negatif' },
    { code: 'CMV-IgG', name: 'CMV IgG', unit: 'AU/mL', referenceRange: '<0.5' },
    { code: 'EBV-VCA-IgM', name: 'EBV VCA IgM', unit: '', referenceRange: 'Negatif' },
    { code: 'EBV-VCA-IgG', name: 'EBV VCA IgG', unit: '', referenceRange: 'Negatif' },
    { code: 'RF', name: 'RF (Romatoid faktör)', unit: 'IU/mL', referenceRange: '<15' },
    { code: 'ANA', name: 'ANA', unit: '', referenceRange: 'Negatif' },
    { code: 'ANTI-dsDNA', name: 'Anti-dsDNA', unit: 'IU/mL', referenceRange: '<30' },
  ];

  // PCR - Moleküler Test Parametreleri (Genişletilmiş)
  const pcrParams = [
    { code: 'COVID', name: 'COVID-19 PCR', unit: '', referenceRange: 'Negatif/Pozitif' },
    { code: 'FLU-A', name: 'Influenza A/B PCR', unit: '', referenceRange: 'Negatif' },
    { code: 'RSV', name: 'RSV PCR', unit: '', referenceRange: 'Negatif' },
    { code: 'HPV', name: 'HPV PCR (tipli)', unit: '', referenceRange: 'Negatif' },
    { code: 'CMV-DNA', name: 'CMV DNA', unit: 'IU/mL', referenceRange: '<500' },
    { code: 'EBV-DNA', name: 'EBV DNA', unit: 'copies/mL', referenceRange: '<500' },
    { code: 'HSV-1', name: 'HSV-1 DNA', unit: 'copies/mL', referenceRange: 'Negatif' },
    { code: 'HSV-2', name: 'HSV-2 DNA', unit: 'copies/mL', referenceRange: 'Negatif' },
    { code: 'HCV-RNA', name: 'HCV RNA', unit: 'IU/mL', referenceRange: '<15' },
    { code: 'HBV-DNA', name: 'HBV DNA', unit: 'IU/mL', referenceRange: '<20' },
    { code: 'HIV-RNA', name: 'HIV RNA', unit: 'copies/mL', referenceRange: '<20' },
    { code: 'CHLAM', name: 'Chlamydia trachomatis PCR', unit: '', referenceRange: 'Negatif' },
    { code: 'GONO', name: 'Gonorrhea PCR', unit: '', referenceRange: 'Negatif' },
    { code: 'MTB', name: 'Tuberculosis PCR (MTB)', unit: '', referenceRange: 'Negatif' },
  ];

  // Parametreleri oluştur
  const createdBioParams = await Promise.all(
    bioParams.map(param =>
      prisma.testParameter.upsert({
        where: { code: param.code },
        update: {},
        create: param,
      })
    )
  );

  const createdHemParams = await Promise.all(
    hemParams.map(param =>
      prisma.testParameter.upsert({
        where: { code: param.code },
        update: {},
        create: param,
      })
    )
  );

  const createdUriParams = await Promise.all(
    uriParams.map(param =>
      prisma.testParameter.upsert({
        where: { code: param.code },
        update: {},
        create: param,
      })
    )
  );

  const createdHorParams = await Promise.all(
    horParams.map(param =>
      prisma.testParameter.upsert({
        where: { code: param.code },
        update: {},
        create: param,
      })
    )
  );

  const createdCoaParams = await Promise.all(
    coaParams.map(param =>
      prisma.testParameter.upsert({
        where: { code: param.code },
        update: {},
        create: param,
      })
    )
  );

  const createdPcrParams = await Promise.all(
    pcrParams.map(param =>
      prisma.testParameter.upsert({
        where: { code: param.code },
        update: {},
        create: param,
      })
    )
  );

  const createdKanParams = await Promise.all(
    kanParams.map(param =>
      prisma.testParameter.upsert({
        where: { code: param.code },
        update: {},
        create: param,
      })
    )
  );

  const createdMicParams = await Promise.all(
    micParams.map(param =>
      prisma.testParameter.upsert({
        where: { code: param.code },
        update: {},
        create: param,
      })
    )
  );

  const createdImmParams = await Promise.all(
    immParams.map(param =>
      prisma.testParameter.upsert({
        where: { code: param.code },
        update: {},
        create: param,
      })
    )
  );

  // Testleri oluştur
  const bioTest = await prisma.test.upsert({
    where: { code: 'BIO' },
    update: {},
    create: {
      code: 'BIO',
      name: 'Biyokimya Paneli',
      category: TestCategory.BIO,
      price: 150.0,
      sampleType: 'Serum',
      parameters: {
        connect: createdBioParams.map(p => ({ id: p.id })),
      },
    },
  });

  const hemTest = await prisma.test.upsert({
    where: { code: 'HEM' },
    update: {},
    create: {
      code: 'HEM',
      name: 'Tam Kan Sayımı (Hemogram)',
      category: TestCategory.HEM,
      price: 80.0,
      sampleType: 'Tam Kan (EDTA)',
      parameters: {
        connect: createdHemParams.map(p => ({ id: p.id })),
      },
    },
  });

  const uriTest = await prisma.test.upsert({
    where: { code: 'URI' },
    update: {},
    create: {
      code: 'URI',
      name: 'İdrar Tahlili',
      category: TestCategory.URI,
      price: 40.0,
      sampleType: 'İdrar',
      parameters: {
        connect: createdUriParams.map(p => ({ id: p.id })),
      },
    },
  });

  const horTest = await prisma.test.upsert({
    where: { code: 'HOR' },
    update: {},
    create: {
      code: 'HOR',
      name: 'Hormon Paneli',
      category: TestCategory.HOR,
      price: 200.0,
      sampleType: 'Serum',
      parameters: {
        connect: createdHorParams.map(p => ({ id: p.id })),
      },
    },
  });

  const coaTest = await prisma.test.upsert({
    where: { code: 'COA' },
    update: {},
    create: {
      code: 'COA',
      name: 'Koagülasyon Paneli',
      category: TestCategory.COA,
      price: 120.0,
      sampleType: 'Sitratlı Plazma',
      parameters: {
        connect: createdCoaParams.map(p => ({ id: p.id })),
      },
    },
  });

  const pcrTest = await prisma.test.upsert({
    where: { code: 'PCR' },
    update: {},
    create: {
      code: 'PCR',
      name: 'PCR Testi',
      category: TestCategory.PCR,
      price: 300.0,
      sampleType: 'Swab/Kan',
      parameters: {
        connect: createdPcrParams.map(p => ({ id: p.id })),
      },
    },
  });

  const a1cTest = await prisma.test.upsert({
    where: { code: 'A1C' },
    update: {},
    create: {
      code: 'A1C',
      name: 'HbA1c (Glikozile Hemoglobin)',
      category: TestCategory.A1C,
      price: 100.0,
      sampleType: 'Tam Kan (EDTA)',
    },
  });

  const esrTest = await prisma.test.upsert({
    where: { code: 'ESR' },
    update: {},
    create: {
      code: 'ESR',
      name: 'Sedimantasyon (ESR)',
      category: TestCategory.ESR,
      price: 30.0,
      sampleType: 'Tam Kan (Sitratlı)',
    },
  });

  const kanTest = await prisma.test.upsert({
    where: { code: 'KAN' },
    update: {},
    create: {
      code: 'KAN',
      name: 'Kan Grubu ve Antikor Testleri',
      category: TestCategory.KAN,
      price: 50.0,
      sampleType: 'Tam Kan (EDTA)',
      parameters: {
        connect: createdKanParams.map(p => ({ id: p.id })),
      },
    },
  });

  const micTest = await prisma.test.upsert({
    where: { code: 'MIC' },
    update: {},
    create: {
      code: 'MIC',
      name: 'Mikrobiyoloji Kültür ve Antibiyogram',
      category: TestCategory.MIC,
      price: 150.0,
      sampleType: 'Numune tipine göre',
      parameters: {
        connect: createdMicParams.map(p => ({ id: p.id })),
      },
    },
  });

  const immTest = await prisma.test.upsert({
    where: { code: 'IMM' },
    update: {},
    create: {
      code: 'IMM',
      name: 'İmmünoloji / Seroloji Paneli',
      category: TestCategory.IMM,
      price: 180.0,
      sampleType: 'Serum',
      parameters: {
        connect: createdImmParams.map(p => ({ id: p.id })),
      },
    },
  });

  const koaTest = await prisma.test.upsert({
    where: { code: 'KOA' },
    update: {},
    create: {
      code: 'KOA',
      name: 'Koagülasyon Paneli',
      category: TestCategory.KOA,
      price: 120.0,
      sampleType: 'Sitratlı Plazma',
      parameters: {
        connect: createdCoaParams.map(p => ({ id: p.id })),
      },
    },
  });

  console.log('Seed completed:', {
    users: { admin, reception },
    tests: { bioTest, hemTest, uriTest, horTest, coaTest, pcrTest, a1cTest, esrTest, kanTest, micTest, immTest, koaTest },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

