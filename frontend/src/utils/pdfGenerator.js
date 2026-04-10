import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Generate PDF for sample results
export const generateSampleResultsPDF = (sample, tests, results, user) => {
  const doc = new jsPDF()
  
  // Set up the document
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Laboratory Test Results', 105, 20, { align: 'center' })
  
  // Lab information
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('CycleCoreLIMS Laboratory', 20, 35)
  doc.text('123 Medical Center Drive', 20, 42)
  doc.text('City, State 12345', 20, 49)
  doc.text('Phone: (555) 123-4567', 20, 56)
  
  // Patient information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient Information', 20, 70)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Sample ID: ${sample.id}`, 20, 80)
  doc.text(`Patient Name: ${sample.source}`, 20, 87)
  doc.text(`Sample Type: ${sample.type}`, 20, 94)
  doc.text(`Collection Date: ${sample.collectionDate}`, 20, 101)
  doc.text(`Status: ${sample.status}`, 20, 108)
  
  // Test results table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Test Results', 20, 125)
  
  // Prepare table data
  const tableData = []
  tests.forEach(test => {
    const testResults = results.filter(result => result.testId === test.id)
    if (testResults.length > 0) {
      testResults.forEach(result => {
        tableData.push([
          test.name,
          test.type,
          result.value,
          result.unit,
          result.status,
          result.complianceFlag ? 'Yes' : 'No'
        ])
      })
    } else {
      tableData.push([
        test.name,
        test.type,
        'Pending',
        '-',
        '-',
        '-'
      ])
    }
  })
  
  // Add table using autoTable
  autoTable(doc, {
    head: [['Test Name', 'Type', 'Value', 'Unit', 'Status', 'Compliant']],
    body: tableData,
    startY: 135,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  })
  
  // Add summary
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 200
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 20, finalY + 15)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const completedTests = tableData.filter(row => row[3] !== '-').length
  const passedTests = tableData.filter(row => row[4] === 'Pass').length
  const failedTests = tableData.filter(row => row[4] === 'Fail').length
  
  doc.text(`Total Tests: ${tests.length}`, 20, finalY + 25)
  doc.text(`Completed: ${completedTests}`, 20, finalY + 32)
  doc.text(`Passed: ${passedTests}`, 20, finalY + 39)
  doc.text(`Failed: ${failedTests}`, 20, finalY + 46)
  
  // Add footer
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.text('This document is generated electronically and is valid without signature.', 105, 280, { align: 'center' })
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 285, { align: 'center' })
  
  // Add page numbers
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Page 1 of 1', 105, 290, { align: 'center' })
  
  return doc
}

// Generate PDF for single test result
export const generateTestResultPDF = (sample, test, results, user) => {
  const doc = new jsPDF()
  
  // Set up the document
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Test Result Report', 105, 20, { align: 'center' })
  
  // Lab information
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('CycleCoreLIMS Laboratory', 20, 35)
  doc.text('123 Medical Center Drive', 20, 42)
  doc.text('City, State 12345', 20, 49)
  doc.text('Phone: (555) 123-4567', 20, 56)
  
  // Patient information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient Information', 20, 70)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Sample ID: ${sample.id}`, 20, 80)
  doc.text(`Patient Name: ${sample.source}`, 20, 87)
  doc.text(`Sample Type: ${sample.type}`, 20, 94)
  doc.text(`Collection Date: ${sample.collectionDate}`, 20, 101)
  
  // Test information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Test Information', 20, 120)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Test Name: ${test.name}`, 20, 130)
  doc.text(`Test Type: ${test.type}`, 20, 137)
  doc.text(`Method: ${test.method}`, 20, 144)
  doc.text(`Test Date: ${test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}`, 20, 151)
  
  // Result information
  const testResult = results.find(result => result.testId === test.id)
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Test Result', 20, 175)
  
  if (testResult) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Result Value: ${testResult.value}`, 20, 185)
    doc.text(`Unit: ${testResult.unit}`, 20, 192)
    doc.text(`Status: ${testResult.status}`, 20, 199)
    doc.text(`Compliance: ${testResult.complianceFlag ? 'Compliant' : 'Non-Compliant'}`, 20, 206)
    doc.text(`Result Date: ${testResult.createdAt ? new Date(testResult.createdAt).toLocaleDateString() : 'N/A'}`, 20, 213)
    
    // Status indicator
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    if (testResult.status === 'Pass') {
      doc.setTextColor(0, 128, 0)
      doc.text('✓ PASSED', 105, 235, { align: 'center' })
    } else if (testResult.status === 'Fail') {
      doc.setTextColor(255, 0, 0)
      doc.text('✗ FAILED', 105, 235, { align: 'center' })
    }
  } else {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(128, 128, 128)
    doc.text('Result pending...', 20, 185)
  }
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  // Add footer
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.text('This document is generated electronically and is valid without signature.', 105, 270, { align: 'center' })
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 275, { align: 'center' })
  
  return doc
}

// Download PDF
export const downloadPDF = (doc, filename) => {
  doc.save(filename)
}
