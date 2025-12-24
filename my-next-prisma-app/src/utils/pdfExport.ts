"use client";

import jsPDF from "jspdf";

/**
 * PDF Export Utility for Quiz Results
 *
 * Uses jsPDF for client-side PDF generation
 */

export interface QuizResultData {
  quizTitle: string;
  attemptId: string;
  dateTaken: string;
  autoMarks: number;
  revisedMarks?: number;
  totalMarks?: number;
  allReviewed: boolean;
  userName?: string;
  manualReviews: Array<{
    questionId: string;
    questionText?: string;
    userAnswer?: string;
    correctAnswer?: string;
    marksAwarded: number | null;
    maxMarks?: number;
    reviewed: boolean;
    feedback: string | null;
    type: string;
  }>;
}

/**
 * Generate a PDF for quiz results
 */
export function generateQuizResultPDF(data: QuizResultData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to check and add new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Quiz Result Certificate", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("QuizMania - Test Your Knowledge", pageWidth / 2, 30, {
    align: "center",
  });

  yPosition = 50;

  // Quiz Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(data.quizTitle, contentWidth);
  doc.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 8 + 5;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Summary Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const summaryData: [string, string | number | undefined][] = [
    ["Attempt ID:", data.attemptId],
    ["Date:", new Date(data.dateTaken).toLocaleString()],
    [
      "Score:",
      `${data.revisedMarks ?? data.autoMarks} / ${data.totalMarks ?? "N/A"}`,
    ],
    ["Status:", data.allReviewed ? "✓ Fully Reviewed" : "⏳ Pending Review"],
  ];

  if (data.userName) {
    summaryData.unshift(["Student:", data.userName]);
  }

  summaryData.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label || "", margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(String(value ?? ""), margin + 35, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Score Badge
  const scorePercent =
    data.totalMarks && data.totalMarks > 0
      ? ((data.revisedMarks ?? data.autoMarks) / data.totalMarks) * 100
      : 0;

  const badgeColor: [number, number, number] =
    scorePercent >= 80
      ? [34, 197, 94] // Green
      : scorePercent >= 60
      ? [234, 179, 8] // Yellow
      : scorePercent >= 40
      ? [249, 115, 22] // Orange
      : [239, 68, 68]; // Red

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(pageWidth / 2 - 25, yPosition - 5, 50, 20, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${scorePercent.toFixed(1)}%`, pageWidth / 2, yPosition + 7, {
    align: "center",
  });

  yPosition += 25;

  // Question Breakdown
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Question Breakdown", margin, yPosition);
  yPosition += 10;

  data.manualReviews.forEach((review, index) => {
    checkNewPage(40);

    // Question header
    doc.setFillColor(243, 244, 246); // Gray-100
    doc.rect(margin, yPosition - 4, contentWidth, 8, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`Question ${index + 1}`, margin + 2, yPosition);

    // Marks badge
    const marks = review.marksAwarded ?? 0;
    const maxMarks = review.maxMarks ?? 1;
    const markColor: [number, number, number] =
      marks >= maxMarks
        ? [34, 197, 94]
        : marks > 0
        ? [234, 179, 8]
        : [239, 68, 68];
    doc.setFillColor(markColor[0], markColor[1], markColor[2]);
    doc.roundedRect(pageWidth - margin - 25, yPosition - 4, 23, 7, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`${marks}/${maxMarks}`, pageWidth - margin - 13.5, yPosition, {
      align: "center",
    });

    yPosition += 8;

    // Question text (if available)
    if (review.questionText) {
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const questionLines = doc.splitTextToSize(
        review.questionText,
        contentWidth - 10
      );
      checkNewPage(questionLines.length * 5);
      doc.text(questionLines, margin + 2, yPosition);
      yPosition += questionLines.length * 5 + 3;
    }

    // User's answer
    if (review.userAnswer) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("Your Answer:", margin + 2, yPosition);
      doc.setFont("helvetica", "normal");
      const answerLines = doc.splitTextToSize(
        review.userAnswer,
        contentWidth - 30
      );
      doc.text(answerLines, margin + 30, yPosition);
      yPosition += Math.max(answerLines.length * 5, 5) + 2;
    }

    // Feedback
    if (review.feedback) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(79, 70, 229);
      const feedbackLines = doc.splitTextToSize(
        `Feedback: ${review.feedback}`,
        contentWidth - 10
      );
      checkNewPage(feedbackLines.length * 5);
      doc.text(feedbackLines, margin + 2, yPosition);
      yPosition += feedbackLines.length * 5 + 3;
    }

    yPosition += 5;
  });

  // Footer
  checkNewPage(30);
  yPosition = pageHeight - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition - 10, pageWidth - margin, yPosition - 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated by QuizMania on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );

  return doc;
}

/**
 * Download quiz result as PDF
 */
export function downloadQuizResultPDF(data: QuizResultData): void {
  const doc = generateQuizResultPDF(data);
  doc.save(`quiz-result-${data.attemptId}.pdf`);
}

/**
 * Generate a certificate PDF for quiz completion
 */
export function generateCertificatePDF(data: {
  userName: string;
  quizTitle: string;
  score: number;
  totalScore: number;
  completionDate: string;
  certificateId: string;
}): jsPDF {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient effect (using rectangles)
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // White certificate area
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 15, pageWidth - 30, pageHeight - 30, 5, 5, "F");

  // Border
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(2);
  doc.roundedRect(20, 20, pageWidth - 40, pageHeight - 40, 3, 3, "S");

  // Title
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("Certificate of Completion", pageWidth / 2, 50, { align: "center" });

  // QuizMania logo text
  doc.setFontSize(14);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("QuizMania - Test Your Knowledge", pageWidth / 2, 62, {
    align: "center",
  });

  // Name
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("This is to certify that", pageWidth / 2, 85, { align: "center" });

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(data.userName, pageWidth / 2, 100, { align: "center" });

  // Quiz completion
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("has successfully completed the quiz", pageWidth / 2, 115, {
    align: "center",
  });

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  const quizTitleLines = doc.splitTextToSize(data.quizTitle, pageWidth - 80);
  doc.text(quizTitleLines, pageWidth / 2, 128, { align: "center" });

  // Score
  const scoreY = 128 + quizTitleLines.length * 10 + 10;
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(
    `with a score of ${data.score}/${data.totalScore} (${(
      (data.score / data.totalScore) *
      100
    ).toFixed(1)}%)`,
    pageWidth / 2,
    scoreY,
    { align: "center" }
  );

  // Date
  doc.setFontSize(12);
  doc.text(
    `Date: ${new Date(data.completionDate).toLocaleDateString()}`,
    pageWidth / 2,
    scoreY + 15,
    { align: "center" }
  );

  // Certificate ID
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Certificate ID: ${data.certificateId}`,
    pageWidth / 2,
    pageHeight - 35,
    {
      align: "center",
    }
  );

  return doc;
}

/**
 * Download certificate as PDF
 */
export function downloadCertificatePDF(data: {
  userName: string;
  quizTitle: string;
  score: number;
  totalScore: number;
  completionDate: string;
  certificateId: string;
}): void {
  const doc = generateCertificatePDF(data);
  doc.save(`certificate-${data.certificateId}.pdf`);
}
