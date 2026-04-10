// Test constants for dropdown selections

export const TEST_UNITS = {
  HEMATOLOGY: [
    { value: 'million/uL', label: 'million/uL (WBC)' },
    { value: 'g/dL', label: 'g/dL (Hemoglobin)' },
    { value: 'million/uL', label: 'million/uL (RBC)' },
    { value: '%', label: '% (Hematocrit)' },
    { value: 'fL', label: 'fL (MCV)' },
    { value: 'pg', label: 'pg (MCH)' },
    { value: 'g/dL', label: 'g/dL (MCHC)' },
    { value: 'k/uL', label: 'k/uL (Platelets)' }
  ],
  CHEMISTRY: [
    { value: 'mg/dL', label: 'mg/dL (Glucose)' },
    { value: 'mg/dL', label: 'mg/dL (Creatinine)' },
    { value: 'mg/dL', label: 'mg/dL (BUN)' },
    { value: 'mEq/L', label: 'mEq/L (Sodium)' },
    { value: 'mEq/L', label: 'mEq/L (Potassium)' },
    { value: 'mg/dL', label: 'mg/dL (Calcium)' },
    { value: 'U/L', label: 'U/L (ALT)' },
    { value: 'U/L', label: 'U/L (AST)' },
    { value: 'U/L', label: 'U/L (Alkaline Phosphatase)' },
    { value: 'U/L', label: 'U/L (GGT)' },
    { value: 'g/dL', label: 'g/dL (Total Protein)' },
    { value: 'g/dL', label: 'g/dL (Albumin)' }
  ],
  MICROBIOLOGY: [
    { value: 'CFU/mL', label: 'CFU/mL (Colony Forming Units)' },
    { value: 'copies/mL', label: 'copies/mL (Viral Load)' },
    { value: 'IU/mL', label: 'IU/mL (International Units)' },
    { value: 'ng/mL', label: 'ng/mL (Antigen)' }
  ],
  IMMUNOLOGY: [
    { value: 'mg/dL', label: 'mg/dL (IgG)' },
    { value: 'mg/dL', label: 'mg/dL (IgA)' },
    { value: 'mg/dL', label: 'mg/dL (IgM)' },
    { value: 'IU/mL', label: 'IU/mL (Antibodies)' },
    { value: 'ng/mL', label: 'ng/mL (Cytokines)' }
  ],
  ENDOCRINOLOGY: [
    { value: 'mIU/L', label: 'mIU/L (TSH)' },
    { value: 'pmol/L', label: 'pmol/L (T4)' },
    { value: 'pmol/L', label: 'pmol/L (T3)' },
    { value: 'ng/mL', label: 'ng/mL (Cortisol)' },
    { value: 'pg/mL', label: 'pg/mL (Insulin)' },
    { value: 'nmol/L', label: 'nmol/L (Testosterone)' },
    { value: 'pmol/L', label: 'pmol/L (Estradiol)' }
  ],
  COAGULATION: [
    { value: 'seconds', label: 'seconds (PT)' },
    { value: 'seconds', label: 'seconds (aPTT)' },
    { value: 'seconds', label: 'seconds (TT)' },
    { value: 'IU/dL', label: 'IU/dL (Fibrinogen)' },
    { value: 'ng/mL', label: 'ng/mL (D-dimer)' }
  ],
  URINALYSIS: [
    { value: 'mg/dL', label: 'mg/dL (Protein)' },
    { value: 'mg/dL', label: 'mg/dL (Glucose)' },
    { value: 'mg/dL', label: 'mg/dL (Ketones)' },
    { value: 'mg/dL', label: 'mg/dL (Blood)' },
    { value: 'mg/dL', label: 'mg/dL (Bilirubin)' },
    { value: 'mg/dL', label: 'mg/dL (Urobilinogen)' },
    { value: 'pH units', label: 'pH units' },
    { value: 'cells/HPF', label: 'cells/HPF (Cells)' },
    { value: 'casts/LPF', label: 'casts/LPF (Casts)' }
  ],
  GENERAL: [
    { value: 'mg/dL', label: 'mg/dL' },
    { value: 'g/L', label: 'g/L' },
    { value: 'mmol/L', label: 'mmol/L' },
    { value: 'µmol/L', label: 'µmol/L' },
    { value: 'ng/mL', label: 'ng/mL' },
    { value: 'pg/mL', label: 'pg/mL' },
    { value: 'U/L', label: 'U/L' },
    { value: 'U/mL', label: 'U/mL' },
    { value: 'mEq/L', label: 'mEq/L' },
    { value: '%', label: '%' },
    { value: 'ratio', label: 'ratio' },
    { value: 'titer', label: 'titer' },
    { value: 'index', label: 'index' }
  ]
}

export const COMMON_TEST_VALUES = {
  HEMATOLOGY: {
    'WBC': [
      { value: '4.5', label: 'Normal (4.5-11.0)' },
      { value: '3.8', label: 'Low Normal' },
      { value: '12.5', label: 'High Normal' },
      { value: '2.8', label: 'Low' },
      { value: '15.2', label: 'High' }
    ],
    'Hemoglobin': [
      { value: '14.5', label: 'Normal Male (13.5-17.5)' },
      { value: '12.8', label: 'Normal Female (11.5-15.5)' },
      { value: '10.2', label: 'Low' },
      { value: '16.8', label: 'High' }
    ],
    'Platelets': [
      { value: '250', label: 'Normal (150-450)' },
      { value: '120', label: 'Low Normal' },
      { value: '480', label: 'High Normal' },
      { value: '80', label: 'Low' },
      { value: '550', label: 'High' }
    ]
  },
  CHEMISTRY: {
    'Glucose': [
      { value: '85', label: 'Normal Fasting (70-99)' },
      { value: '110', label: 'Impaired Fasting (100-125)' },
      { value: '140', label: 'Diabetic (>126)' },
      { value: '65', label: 'Low' }
    ],
    'Creatinine': [
      { value: '0.9', label: 'Normal Male (0.7-1.3)' },
      { value: '0.8', label: 'Normal Female (0.5-1.1)' },
      { value: '1.5', label: 'Elevated' },
      { value: '0.4', label: 'Low' }
    ],
    'Sodium': [
      { value: '140', label: 'Normal (135-145)' },
      { value: '132', label: 'Low Normal' },
      { value: '148', label: 'High Normal' },
      { value: '128', label: 'Low' },
      { value: '152', label: 'High' }
    ]
  },
  GENERAL: [
    { value: 'Normal', label: 'Normal' },
    { value: 'Positive', label: 'Positive' },
    { value: 'Negative', label: 'Negative' },
    { value: 'Detected', label: 'Detected' },
    { value: 'Not Detected', label: 'Not Detected' },
    { value: 'Reactive', label: 'Reactive' },
    { value: 'Non-Reactive', label: 'Non-Reactive' },
    { value: 'Equivocal', label: 'Equivocal' }
  ]
}

export const getUnitsForTestType = (testType) => {
  return TEST_UNITS[testType] || TEST_UNITS.GENERAL
}

export const getCommonValuesForTest = (testName, testType) => {
  if (COMMON_TEST_VALUES[testType] && COMMON_TEST_VALUES[testType][testName]) {
    return COMMON_TEST_VALUES[testType][testName]
  }
  return COMMON_TEST_VALUES.GENERAL
}
