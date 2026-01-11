import { GoogleGenAI } from '@google/genai';
import { config } from '../config/config';
import { AIAnalysisResult } from '../types';

export class AIService {
    private genAI: any | null = null;
    private requestCount = 0;
    private lastRequestTime = Date.now();

    constructor() {
        try {
            this.genAI = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
            console.log('✅ Gemini AI initialized');
        } catch (error: any) {
            console.error('❌ Gemini AI failed:', error.message);
        }
    }

    public async runAnalysis(moisture: number, historyData: any[] = [], plantName: string): Promise<AIAnalysisResult> {
        if (!this.genAI) {
            // throw new Error('Gemini AI not available');
            // Fail gracefully if not available
            console.warn('⚠️ Gemini AI not initialized, returning fallback.');
            return {
                plant_name: plantName,
                plant_identified: plantName,
                recommendation: "AI sedang tidak aktif.",
                health_status: "Unknown"
            };
        }

        const now = Date.now();
        if (now - this.lastRequestTime < 60000) {
            if (this.requestCount >= 10) {
                throw new Error('Rate limit: Too many AI requests. Please wait.');
            }
        } else {
            this.requestCount = 0;
            this.lastRequestTime = now;
        }
        this.requestCount++;

        const historyStr = historyData.length > 0
            ? historyData.slice(-24).map(d => d.moisture).join(', ')
            : 'Tidak ada data';

        const prompt = `Anda adalah ahli pertanian dan spesialis perawatan tanaman.

TANAMAN: ${plantName}

KONDISI SAAT INI:
- Kelembaban tanah: ${moisture}%
- Riwayat kelembaban 24 jam terakhir: ${historyStr}

TUGAS ANDA:
1. Identifikasi karakteristik tanaman "${plantName}"
2. Analisis apakah kelembaban ${moisture}% sesuai untuk "${plantName}"
3. Berikan rekomendasi perawatan yang SPESIFIK
4. Berikan tips praktis

Format JSON (HANYA JSON, tanpa markdown):
{
  "plant_identified": "Nama lengkap tanaman",
  "recommendation": "Rekomendasi singkat dan actionable",
  "watering_schedule": "Jadwal penyiraman",
  "moisture_analysis": "Analisis kelembaban",
  "optimal_moisture_range": "Rentang optimal",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "health_status": "Sangat Baik/Baik/Perlu Perhatian/Buruk",
  "urgent_action": "Tindakan segera atau null",
  "sunlight_needs": "Kebutuhan cahaya",
  "ideal_temperature": "Suhu ideal"
}`;

        try {
            const response = await this.genAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            // @ts-ignore
            let text = response.text ? response.text() : (response as any).response.text();
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                result.plant_name = plantName;
                return result;
            } else {
                throw new Error('Failed to parse JSON response');
            }
        } catch (error: any) {
            console.error('❌ AI Analysis error:', error);
            // Fallback object
            return {
                plant_name: plantName,
                plant_identified: plantName,
                recommendation: "Gagal analisis AI",
                health_status: "Unknown"
            };
        }
    }
}

export const aiService = new AIService();
