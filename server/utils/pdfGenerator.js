import PDFDocument from 'pdfkit';

export function generateAnalyticsReport(member, performance, withdrawals, tickets, period, dateRange, exportedBy) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

  // Header with professional design
  doc.rect(40, 40, 515, 70).fillAndStroke('#1e40af', '#1e40af');
  doc.fontSize(32).fillColor('#ffffff').text('VYLDO', 50, 50);
  doc.fontSize(12).fillColor('#e0e7ff').text('Freelancing Platform', 50, 85);
  doc.fontSize(10).fillColor('#bfdbfe').text('Team Analytics Report', 450, 85);
  
  // Report Info Box
  doc.rect(40, 125, 515, 70).fillAndStroke('#f3f4f6', '#e5e7eb');
  doc.fontSize(9).fillColor('#374151');
  doc.text(`Report Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}`, 50, 135);
  doc.text(`Exported By: ${exportedBy?.displayName || 'Admin'} (${exportedBy?.email || 'admin@vyldo.com'})`, 50, 150);
  doc.text(`Period: ${period === 'daily' ? 'Today' : period === 'weekly' ? 'Last 7 Days' : period === 'monthly' ? 'Last 30 Days' : 'Custom Range'}`, 50, 165);
  if (dateRange) {
    doc.text(`Date Range: ${new Date(dateRange.start).toLocaleDateString('en-US', { dateStyle: 'medium' })} - ${new Date(dateRange.end).toLocaleDateString('en-US', { dateStyle: 'medium' })}`, 50, 180);
  }
  
  // Team Member Info
  doc.fontSize(14).fillColor('#111827').text('Report For:', 50, 210);
  doc.fontSize(11).fillColor('#374151');
  doc.text(`${member.displayName}`, 50, 230);
  doc.fontSize(9).fillColor('#6b7280');
  doc.text(`${member.email}`, 50, 245);
  
  // Performance Summary Box
  doc.rect(50, 290, 495, 120).fillAndStroke('#f3f4f6', '#e5e7eb');
  doc.fontSize(14).fillColor('#111827').text('Performance Summary', 60, 300);
  
  // Performance stats in grid
  doc.fontSize(10).fillColor('#374151');
  doc.text(`Total Withdrawals Processed: ${performance.withdrawalsProcessed}`, 60, 325);
  doc.text(`Completed: ${performance.withdrawalsCompleted}`, 60, 345);
  doc.text(`Rejected: ${performance.withdrawalsRejected}`, 60, 365);
  doc.text(`Success Rate: ${performance.withdrawalsProcessed > 0 ? ((performance.withdrawalsCompleted / performance.withdrawalsProcessed) * 100).toFixed(1) : 0}%`, 60, 385);
  
  doc.text(`Completed Value: ${performance.withdrawalsValue.toFixed(2)} HIVE`, 300, 325);
  doc.text(`Rejected Value: ${(performance.withdrawalsRejectedValue || 0).toFixed(2)} HIVE`, 300, 345);
  doc.text(`Total Value: ${(performance.totalValue || 0).toFixed(2)} HIVE`, 300, 365);
  doc.text(`Tickets Resolved: ${performance.ticketsResolved}`, 300, 385);
  
  // Separate withdrawals by status
  const completedWithdrawals = withdrawals?.filter(w => w.status === 'completed') || [];
  const rejectedWithdrawals = withdrawals?.filter(w => w.status === 'rejected') || [];
  
  // COMPLETED Withdrawals Section
  let yPosition = 430;
  doc.fontSize(14).fillColor('#10b981').text('✓ Completed Withdrawals', 50, yPosition);
  doc.fontSize(9).fillColor('#6b7280').text(`Total: ${completedWithdrawals.length} transactions`, 250, yPosition + 2);
  yPosition += 20;
  
  if (completedWithdrawals.length > 0) {
    // Table Header
    doc.rect(50, yPosition, 505, 25).fillAndStroke('#10b981', '#10b981');
    doc.fontSize(8).fillColor('#ffffff');
    doc.text('User', 55, yPosition + 8);
    doc.text('Amount', 130, yPosition + 8);
    doc.text('Processed By', 190, yPosition + 8);
    doc.text('Date', 280, yPosition + 8);
    doc.text('Transaction ID', 350, yPosition + 8);
    doc.text('Block', 490, yPosition + 8);
    yPosition += 25;
    
    for (let i = 0; i < completedWithdrawals.length; i++) {
      const w = completedWithdrawals[i];
      
      // Check if we need a new page
      if (yPosition > 720) {
        doc.addPage();
        yPosition = 50;
        
        // Redraw header on new page
        doc.rect(50, yPosition, 505, 25).fillAndStroke('#10b981', '#10b981');
        doc.fontSize(8).fillColor('#ffffff');
        doc.text('User', 55, yPosition + 8);
        doc.text('Amount', 130, yPosition + 8);
        doc.text('Processed By', 190, yPosition + 8);
        doc.text('Date', 280, yPosition + 8);
        doc.text('Transaction ID', 350, yPosition + 8);
        doc.text('Block', 490, yPosition + 8);
        yPosition += 25;
      }
      
      // Alternate row colors
      if (i % 2 === 0) {
        doc.rect(50, yPosition, 505, 22).fillAndStroke('#f0fdf4', '#d1fae5');
      } else {
        doc.rect(50, yPosition, 505, 22).fillAndStroke('#ffffff', '#d1fae5');
      }
      
      doc.fontSize(7).fillColor('#374151');
      doc.text(w.user?.displayName?.substring(0, 15) || 'N/A', 55, yPosition + 7);
      doc.fillColor('#10b981').text(`${w.amount} HIVE`, 130, yPosition + 7);
      doc.fillColor('#374151').text(w.processedBy?.displayName?.substring(0, 13) || 'N/A', 190, yPosition + 7);
      doc.text(new Date(w.processedAt).toLocaleDateString(), 280, yPosition + 7);
      
      if (w.hiveTransaction?.txId) {
        doc.fontSize(6).fillColor('#059669').text(w.hiveTransaction.txId, 350, yPosition + 7, { width: 130 });
        if (w.hiveTransaction.blockNum) {
          doc.text(`#${w.hiveTransaction.blockNum}`, 490, yPosition + 7);
        }
      } else {
        doc.text('-', 350, yPosition + 7);
      }
      
      yPosition += 22;
    }
  } else {
    doc.fontSize(9).fillColor('#6b7280').text('No completed withdrawals in this period', 55, yPosition + 10);
    yPosition += 35;
  }
  
  // REJECTED Withdrawals Section
  yPosition += 20;
  if (yPosition > 650) {
    doc.addPage();
    yPosition = 50;
  }
  
  doc.fontSize(14).fillColor('#ef4444').text('✗ Rejected Withdrawals', 50, yPosition);
  doc.fontSize(9).fillColor('#6b7280').text(`Total: ${rejectedWithdrawals.length} transactions`, 250, yPosition + 2);
  yPosition += 20;
  
  if (rejectedWithdrawals.length > 0) {
    // Table Header
    doc.rect(50, yPosition, 505, 25).fillAndStroke('#ef4444', '#ef4444');
    doc.fontSize(8).fillColor('#ffffff');
    doc.text('User', 55, yPosition + 8);
    doc.text('Amount', 130, yPosition + 8);
    doc.text('Processed By', 190, yPosition + 8);
    doc.text('Date', 280, yPosition + 8);
    doc.text('Rejection Reason', 350, yPosition + 8);
    yPosition += 25;
    
    for (let i = 0; i < rejectedWithdrawals.length; i++) {
      const w = rejectedWithdrawals[i];
      
      // Check if we need a new page
      if (yPosition > 720) {
        doc.addPage();
        yPosition = 50;
        
        // Redraw header on new page
        doc.rect(50, yPosition, 505, 25).fillAndStroke('#ef4444', '#ef4444');
        doc.fontSize(8).fillColor('#ffffff');
        doc.text('User', 55, yPosition + 8);
        doc.text('Amount', 130, yPosition + 8);
        doc.text('Processed By', 190, yPosition + 8);
        doc.text('Date', 280, yPosition + 8);
        doc.text('Rejection Reason', 350, yPosition + 8);
        yPosition += 25;
      }
      
      // Alternate row colors
      if (i % 2 === 0) {
        doc.rect(50, yPosition, 505, 22).fillAndStroke('#fef2f2', '#fecaca');
      } else {
        doc.rect(50, yPosition, 505, 22).fillAndStroke('#ffffff', '#fecaca');
      }
      
      doc.fontSize(7).fillColor('#374151');
      doc.text(w.user?.displayName?.substring(0, 15) || 'N/A', 55, yPosition + 7);
      doc.fillColor('#ef4444').text(`${w.amount} HIVE`, 130, yPosition + 7);
      doc.fillColor('#374151').text(w.processedBy?.displayName?.substring(0, 13) || 'N/A', 190, yPosition + 7);
      doc.text(new Date(w.processedAt).toLocaleDateString(), 280, yPosition + 7);
      
      if (w.rejectionReason) {
        doc.fontSize(6).fillColor('#dc2626').text(w.rejectionReason, 350, yPosition + 7, { width: 200 });
      } else {
        doc.text('No reason provided', 350, yPosition + 7);
      }
      
      yPosition += 22;
    }
  } else {
    doc.fontSize(9).fillColor('#6b7280').text('No rejected withdrawals in this period', 55, yPosition + 10);
    yPosition += 35;
  }
  
  // Support Tickets Table
  yPosition += 20;
  if (yPosition > 650) {
    doc.addPage();
    yPosition = 50;
  }
  
  doc.fontSize(14).fillColor('#111827').text('Support Tickets Resolved', 50, yPosition);
  yPosition += 20;
  
  if (tickets && tickets.length > 0) {
    // Table Header
    doc.rect(50, yPosition, 505, 25).fillAndStroke('#0891b2', '#0891b2');
    doc.fontSize(8).fillColor('#ffffff');
    doc.text('Subject', 55, yPosition + 8);
    doc.text('User', 200, yPosition + 8);
    doc.text('Resolved By', 300, yPosition + 8);
    doc.text('Status', 400, yPosition + 8);
    doc.text('Date', 470, yPosition + 8);
    yPosition += 25;
    
    const maxTickets = Math.min(tickets.length, 20);
    for (let i = 0; i < maxTickets; i++) {
      const t = tickets[i];
      
      if (yPosition > 720) {
        doc.addPage();
        yPosition = 50;
        
        // Redraw header on new page
        doc.rect(50, yPosition, 505, 25).fillAndStroke('#0891b2', '#0891b2');
        doc.fontSize(8).fillColor('#ffffff');
        doc.text('Subject', 55, yPosition + 8);
        doc.text('User', 200, yPosition + 8);
        doc.text('Resolved By', 300, yPosition + 8);
        doc.text('Status', 400, yPosition + 8);
        doc.text('Date', 470, yPosition + 8);
        yPosition += 25;
      }
      
      // Alternate row colors
      if (i % 2 === 0) {
        doc.rect(50, yPosition, 505, 20).fillAndStroke('#f0fdfa', '#e5e7eb');
      } else {
        doc.rect(50, yPosition, 505, 20).fillAndStroke('#ffffff', '#e5e7eb');
      }
      
      doc.fontSize(7).fillColor('#374151');
      doc.text(t.subject?.substring(0, 20) || 'N/A', 55, yPosition + 6);
      doc.text(t.user?.displayName?.substring(0, 12) || 'N/A', 200, yPosition + 6);
      doc.text(t.resolvedBy?.displayName?.substring(0, 12) || 'N/A', 300, yPosition + 6);
      
      // Status with color
      if (t.status === 'solved') {
        doc.fillColor('#10b981').text('Solved', 400, yPosition + 6);
      } else {
        doc.fillColor('#6b7280').text('Closed', 400, yPosition + 6);
      }
      
      doc.fillColor('#374151');
      doc.text(new Date(t.resolvedAt).toLocaleDateString(), 470, yPosition + 6);
      
      yPosition += 20;
    }
    
    if (tickets.length > 20) {
      yPosition += 5;
      doc.fontSize(9).fillColor('#6b7280');
      doc.text(`... and ${tickets.length - 20} more tickets`, 55, yPosition);
      yPosition += 15;
    }
  } else {
    doc.fontSize(9).fillColor('#6b7280').text('No support tickets in this period', 55, yPosition + 10);
    yPosition += 35;
  }
  
  // Footer with digital stamp
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Footer line
    doc.moveTo(40, 770).lineTo(555, 770).stroke('#e5e7eb');
    
    // Digital Stamp Box
    doc.rect(380, 775, 175, 25).fillAndStroke('#eff6ff', '#3b82f6');
    doc.fontSize(8).fillColor('#1e40af');
    doc.text('✓ VERIFIED ANALYTICS REPORT', 390, 783);
    
    // Footer info
    doc.fontSize(7).fillColor('#6b7280');
    doc.text('This is a digitally generated report by VYLDO Platform', 50, 783);
    doc.text(`Generated by: ${member.displayName}`, 50, 793);
    doc.text(`Page ${i + 1} of ${pageCount}`, 500, 793);
  }
  
  return doc;
}
