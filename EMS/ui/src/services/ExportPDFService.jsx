// ExportPDFService.jsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { FileText, Loader2 } from "lucide-react";
import JSZip from "jszip";
import html2canvas from "html2canvas";

/**
 * PDFExporter Component - Exports payroll data to professional PDF
 * @param {Array} data - Array of payroll transaction objects
 * @param {Object} stats - { netSalary, totalTransactions, avgSalary }
 * @param {Number} year - Payroll year
 * @param {Number} month - Payroll month
 * @param {String} fileName - Name of the PDF file
 * @param {Boolean} disabled - Disable button
 * @param {Array} sheetConfigs - [{ sheetName: string, filter: (row)=>boolean }] for bank-wise separation
 */
const PDFExporter = ({ 
  data, 
  stats, 
  year, 
  month, 
  fileName = "Payroll_Report.pdf", 
  disabled = false,
  sheetConfigs = []
}) => {
  const [exportMode, setExportMode] = useState("comprehensive"); // "comprehensive" or "per-bank"
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const formatCurrency = (value) => 
    `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)}`;

  const generatePDFContent = (pdfData, bankName = null) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Header Section
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("PAYROLL REPORT", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text(
      `Period: ${monthNames[month - 1]} ${year}${bankName ? ` | ${bankName}` : ""}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 10;

    // Add horizontal line
    doc.setDrawColor(100, 100, 100);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 8;

    // Summary Statistics Section
    // doc.setFont("times", "bold");
    // doc.setFontSize(11);
    // doc.text("SUMMARY", 10, yPosition);
    // yPosition += 7;

    // doc.setFont("times", "normal");
    // doc.setFontSize(10);
    
    // const summaryStartY = yPosition;
    // const colWidth = (pageWidth - 30) / 3;
    
    // Net Salary Box
    // doc.setFillColor(76, 175, 80); // Green
    // doc.rect(10, yPosition, colWidth, 20, "F");
    // doc.setTextColor(255, 255, 255);
    // doc.setFont("times", "normal");
    // doc.text("Net Salary Transferred", 10 + colWidth / 2, yPosition + 5, { align: "center" });
    // doc.setFont("times", "bold");
    // doc.setFontSize(12);
    // doc.text(formatCurrency(stats.netSalary), 10 + colWidth / 2, yPosition + 15, { align: "center" });

    // // Employees Processed Box
    // doc.setTextColor(0, 0, 0);
    // doc.setFillColor(33, 150, 243); // Blue
    // doc.rect(10 + colWidth + 5, yPosition, colWidth, 20, "F");
    // doc.setTextColor(255, 255, 255);
    // doc.setFont("times", "normal");
    // doc.text("Employees Processed", 10 + colWidth + 5 + colWidth / 2, yPosition + 5, { align: "center" });
    // doc.setFont("times", "bold");
    // doc.setFontSize(12);
    // doc.text(String(stats.totalTransactions), 10 + colWidth + 5 + colWidth / 2, yPosition + 15, { align: "center" });

    // // Average Salary Box
    // doc.setTextColor(0, 0, 0);
    // doc.setFillColor(156, 39, 176); // Purple
    // doc.rect(10 + (colWidth + 5) * 2, yPosition, colWidth, 20, "F");
    // doc.setTextColor(255, 255, 255);
    // doc.setFont("times", "normal");
    // doc.text("Average Salary", 10 + (colWidth + 5) * 2 + colWidth / 2, yPosition + 5, { align: "center" });
    // doc.setFont("times", "bold");
    // doc.setFontSize(12);
    // doc.text(formatCurrency(stats.avgSalary), 10 + (colWidth + 5) * 2 + colWidth / 2, yPosition + 15, { align: "center" });

    // yPosition += 30;
    // doc.setTextColor(0, 0, 0);

    // // Add horizontal line
    // doc.setDrawColor(100, 100, 100);
    // doc.line(10, yPosition, pageWidth - 10, yPosition);
    // yPosition += 8;

    // Data Table Section
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("TRANSACTION DETAILS", 10, yPosition);
    yPosition += 5;

    // Prepare table data
    const tableColumns = [
      { header: "Employee Name", dataKey: "EmployeeName", width: 70 },
      { header: "Net Pay", dataKey: "NetPay", width: 60 },
    ];

    const tableData = pdfData.map((row) => ({
      EmployeeName: row.EmployeeName || "N/A",
      NetPay: formatCurrency(row.NetPay),
    }));

    // Calculate total payable
    const totalPayable = pdfData.reduce((sum, row) => sum + (row.NetPay || 0), 0);

    autoTable(doc, {
      columns: tableColumns,
      body: tableData,
      startY: yPosition,
      margin: { top: 10, right: 10, bottom: 30, left: 10 },
      headerStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
        font: "times",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [0, 0, 0],
        font: "times",
      },
      alternateRowStyles: {
        fillColor: [242, 242, 242],
      },
      didDrawPage: (data) => {
        // Add page number
        const pageCount = doc.internal.pages.length - 1;
        const pageNum = doc.internal.getNumberOfPages();
        doc.setFont("times", "normal");
        doc.setFontSize(8);
        doc.text(
          `Page ${pageNum}`,
          pageWidth - 15,
          pageHeight - 10,
          { align: "right" }
        );
      },
    });

    // Total Payable Section
    let summaryY = doc.lastAutoTable.finalY + 15;
    
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setFillColor(76, 175, 80);
    doc.setTextColor(255, 255, 255);
    const totalBoxHeight = 12;
    doc.rect(10, summaryY, pageWidth - 20, totalBoxHeight, "F");
    doc.text("TOTAL PAYABLE", 15, summaryY + 8);
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text(formatCurrency(totalPayable), pageWidth - 15, summaryY + 8, { align: "right" });
    
    summaryY += 20;
    doc.setTextColor(0, 0, 0);

    // Signature Section
    const finalY = summaryY;
    
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("APPROVALS & SIGNATURES", 10, finalY);

    const signatureY = finalY + 10;
    const signatureBoxWidth = 50;
    const signatureBoxHeight = 25;
    const gap = (pageWidth - 30 - signatureBoxWidth * 2) / 3;

    // Prepared By Box
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    // doc.setDrawColor(0, 0, 0);
    // doc.rect(10 + gap, signatureY, signatureBoxWidth, signatureBoxHeight);
    doc.text("Prepared By", 10 + gap + 5, signatureY + 20, { align: "left" });
    doc.setFont("times", "normal");
    doc.setFontSize(7);
    doc.text("Date:______________", 10 + gap + 5, signatureY + 25);
    // doc.text("Sign:", 10 + gap + 5, signatureY + 28);

    // Approved By Box
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    // doc.rect(10 + gap * 2 + signatureBoxWidth, signatureY, signatureBoxWidth, signatureBoxHeight);
    doc.text("Approved By", 10 + gap * 2 + signatureBoxWidth + 5, signatureY + 20, { align: "left" });
    doc.setFont("times", "normal");
    doc.setFontSize(7);
    doc.text("Date:______________", 10 + gap * 2 + signatureBoxWidth + 5, signatureY + 25);
    // doc.text("Sign:", 10 + gap * 2 + signatureBoxWidth + 5, signatureY + 28);

    // Footer
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );

    return doc;
  };

  const handleExportComprehensive = () => {
    const doc = generatePDFContent(data, null);
    const finalFileName = `${fileName.replace('.pdf', '')}_${monthNames[month - 1]}_${year}.pdf`;
    doc.save(finalFileName);
    setShowModeSelector(false);
  };

  const handleExportPerBank = async () => {
    setIsExporting(true);
    const zip = new JSZip();
    let hasFiles = false;

    try {
      sheetConfigs.forEach((config) => {
        const filteredData = data.filter(config.filter);
        if (filteredData.length > 0) {
          const doc = generatePDFContent(filteredData, config.sheetName);
          const pdfBlob = doc.output('blob');
          const finalFileName = `${fileName.replace('.pdf', '')}_${config.sheetName}_${monthNames[month - 1]}_${year}.pdf`;
          zip.file(finalFileName, pdfBlob);
          hasFiles = true;
        }
      });

      if (hasFiles) {
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipFileName = `${fileName.replace('.pdf', '')}_PerBank_${monthNames[month - 1]}_${year}.zip`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = zipFileName;
        link.click();
      }
    } catch (error) {
      console.error("Zip generation failed:", error);
    } finally {
      setIsExporting(false);
      setShowModeSelector(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowModeSelector(!showModeSelector)}
        disabled={disabled || isExporting}
        className={`flex items-center justify-center gap-2 rounded-sm ${
          (disabled || isExporting) ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 active:bg-green-700'
        } ${(disabled || isExporting) ? '' : 'cursor-pointer'} text-white px-4 py-2 font-medium shadow-md transition`}
        title="Export payroll to PDF for stakeholder signatures"
      >
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {isExporting ? "Processing..." : "Export to PDF"}
      </button>

      {showModeSelector && !disabled && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-max">
          <button
            onClick={handleExportComprehensive}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 font-medium text-sm text-gray-800 transition"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Comprehensive PDF
            <span className="text-xs text-gray-600 block">All employees in one document</span>
          </button>
          <button
            onClick={handleExportPerBank}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 font-medium text-sm text-gray-800 transition"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Per-Bank PDFs
            <span className="text-xs text-gray-600 block">Separate PDF for each bank</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const generateFromHtml = async (htmlContent, fileName) => {
    // Create a temporary container with proper styling
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '794px'; // A4 width in pixels at 96 DPI
    container.style.padding = '0';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
        // Use html2canvas to render the HTML with proper fonts
        const canvas = await html2canvas(container, {
            scale: 2.5, // Higher quality
            useCORS: true, // Allow cross-origin images
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add additional pages if content is significantly longer than one page
        // Added a 2mm threshold to avoid ghost second page from minor rounding differences
        while (heightLeft > 3) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(fileName);
    } catch (e) {
        console.error("PDF generation failed:", e);
        alert("Failed to generate PDF. Please try again.");
    } finally {
        document.body.removeChild(container);
    }
};

export const generateFromHtmlAsBlob = async (htmlContent) => {
    return new Promise(async (resolve, reject) => {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '794px'; // A4 width in pixels at 96 DPI
        container.style.padding = '40px';
        container.style.backgroundColor = 'white';
        container.style.fontFamily = 'Arial, sans-serif';
        container.innerHTML = htmlContent;
        document.body.appendChild(container);

        try {
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const blob = pdf.output('blob');
            resolve(blob);
        } catch (e) {
            reject(e);
        } finally {
            document.body.removeChild(container);
        }
    });
};

export default PDFExporter;
