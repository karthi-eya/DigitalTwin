const PDFDocument = require('pdfkit');

/**
 * Generate a patient health report PDF
 * @param {object} patient - Patient info + profile merged
 * @param {array} logs - HealthLog documents
 * @param {array} recommendations - MonitoringLog documents
 * @param {string} period - 'weekly' or 'monthly'
 * @returns {Buffer} PDF buffer
 */
const generatePatientReport = (patient, logs, recommendations, period) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // ─── HEADER ───
            doc.rect(50, 50, 495, 60).fill('#0ea5e9');
            doc.fontSize(24).fillColor('#ffffff').text('Health Progress Report', 70, 65);
            doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()} | Period: ${period === 'weekly' ? 'Weekly' : 'Monthly'}`, 70, 93);

            doc.moveDown(3);

            // ─── PATIENT INFO ───
            doc.fillColor('#1e293b').fontSize(14).text('Patient Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#334155');
            doc.text(`Name: ${patient.name || 'N/A'}`, { continued: true });
            doc.text(`    |    Age: ${patient.age || 'N/A'}`, { continued: true });
            doc.text(`    |    Gender: ${patient.gender || 'N/A'}`);
            doc.text(`BMI: ${patient.bmi || 'N/A'} (${patient.bmiCategory || 'N/A'})`, { continued: true });
            doc.text(`    |    Goal: ${(patient.goal || 'maintain').replace('_', ' ')}`);
            doc.text(`Health Score: ${patient.baselineHealthScore || 'N/A'}/100`);

            doc.moveDown(1.5);

            // ─── SUMMARY STATS ───
            if (logs.length > 0) {
                const avgCalories = Math.round(logs.reduce((s, l) => s + l.totalCalories, 0) / logs.length);
                const avgSteps = Math.round(logs.reduce((s, l) => s + l.steps, 0) / logs.length);
                const avgSleep = (logs.reduce((s, l) => s + (l.sleepHours || 0), 0) / logs.length).toFixed(1);
                const avgScore = Math.round(logs.reduce((s, l) => s + l.healthScore, 0) / logs.length);

                doc.fontSize(14).fillColor('#1e293b').text('Summary Statistics', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10).fillColor('#334155');
                doc.text(`Average Calories: ${avgCalories} kcal/day (Goal: ${patient.tdee || 2000} kcal)`);
                doc.text(`Average Steps: ${avgSteps.toLocaleString()}/day (Target: 10,000)`);
                doc.text(`Average Sleep: ${avgSleep} hrs/night (Target: 8 hrs)`);
                doc.text(`Average Health Score: ${avgScore}/100`);

                doc.moveDown(1.5);

                // ─── LOG TABLE ───
                doc.fontSize(14).fillColor('#1e293b').text('Daily Log Data', { underline: true });
                doc.moveDown(0.5);

                // Table header
                const tableTop = doc.y;
                const colWidths = [80, 70, 70, 60, 60, 60, 60];
                const headers = ['Date', 'Calories', 'Steps', 'Sleep', 'Water', 'Workout', 'Score'];

                doc.fontSize(8).fillColor('#ffffff');
                doc.rect(50, tableTop, 495, 18).fill('#0ea5e9');
                let xPos = 55;
                headers.forEach((header, i) => {
                    doc.fillColor('#ffffff').text(header, xPos, tableTop + 4, { width: colWidths[i], align: 'center' });
                    xPos += colWidths[i];
                });

                // Table rows
                let yPos = tableTop + 20;
                logs.slice(0, 25).forEach((log, index) => {
                    if (yPos > 700) {
                        doc.addPage();
                        yPos = 50;
                    }

                    const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
                    doc.rect(50, yPos, 495, 16).fill(bgColor);

                    const row = [
                        new Date(log.date).toLocaleDateString(),
                        `${log.totalCalories}`,
                        `${log.steps.toLocaleString()}`,
                        `${log.sleepHours || 0}h`,
                        `${log.waterGlasses || 0}`,
                        log.workoutType || 'none',
                        `${log.healthScore}`
                    ];

                    xPos = 55;
                    doc.fontSize(8).fillColor('#334155');
                    row.forEach((cell, i) => {
                        doc.text(cell, xPos, yPos + 3, { width: colWidths[i], align: 'center' });
                        xPos += colWidths[i];
                    });

                    yPos += 16;
                });

                doc.moveDown(2);
            }

            // ─── RECOMMENDATIONS ───
            if (recommendations && recommendations.length > 0) {
                if (doc.y > 650) doc.addPage();
                doc.fontSize(14).fillColor('#1e293b').text("Doctor's Recommendations", { underline: true });
                doc.moveDown(0.5);

                recommendations.forEach((rec, i) => {
                    if (doc.y > 700) doc.addPage();
                    doc.fontSize(9).fillColor('#475569');
                    doc.text(`${i + 1}. [${new Date(rec.date).toLocaleDateString()}] ${rec.doctorRecommendation || 'No text'}`);
                    doc.moveDown(0.3);
                });
            }

            // ─── FOOTER ───
            doc.moveDown(2);
            doc.fontSize(8).fillColor('#94a3b8');
            doc.text('Generated by Human Body Digital Twin Simulator', 50, doc.page.height - 60, { align: 'center' });
            doc.text('This report is for informational purposes only. Consult your healthcare provider for medical advice.', 50, doc.page.height - 45, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generatePatientReport };
