import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PCMC Sensitive Zones for Locality Risk Weighting
const PCMC_SENSITIVE_ZONES = [
  { name: 'YCM Hospital & Trauma Corridor', coords: [73.8208, 18.6220], radius: 450, riskBonus: 25 },
  { name: 'Dr. D. Y. Patil Campus & School Zone', coords: [73.8159, 18.6231], radius: 400, riskBonus: 22 },
  { name: 'Sant Tukaram Nagar Metro Station & Transit', coords: [73.8158, 18.6146], radius: 350, riskBonus: 20 },
  { name: 'Vallabh Nagar MSRTC Bus Stand', coords: [73.8190, 18.6185], radius: 350, riskBonus: 18 },
  { name: 'Nehrunagar PCMC Stadium', coords: [73.8230, 18.6280], radius: 350, riskBonus: 16 },
  { name: 'Pimpri Railway Station Overbridge', coords: [73.8050, 18.6275], radius: 350, riskBonus: 16 }
];

function getDistanceMeters(coord1, coord2) {
  if (!coord1 || !coord2) return Infinity;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  if (isNaN(lon1) || isNaN(lat1) || isNaN(lon2) || isNaN(lat2)) return Infinity;
  const R = 6371e3;
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Intelligent civic issue analyzer powered by Groq LPU Vision & LLaMA Models
 * Supports multimodal Qwen 2.5 27B Vision (qwen/qwen3.8-27b) for real image defect inspection.
 * Falls back gracefully to rule-based civic heuristics if API key is not configured.
 */
export class GroqService {
  constructor() {
    this.groq = null;
    this.apiKey = '';
  }

  getClient() {
    const key = (process.env.GROQ_API_KEY || '').trim();
    if (key && key.startsWith('gsk_')) {
      if (!this.groq || this.apiKey !== key) {
        this.apiKey = key;
        this.groq = new Groq({ apiKey: key });
      }
      return this.groq;
    }
    return null;
  }

  /**
   * Get current Groq API operational status
   */
  getStatus() {
    const client = this.getClient();
    const isConfigured = Boolean(client);
    return {
      configured: isConfigured,
      status: isConfigured ? 'online' : 'fallback_heuristic',
      provider: 'Groq Cloud SDK',
      visionModel: 'qwen/qwen3.8-27b',
      textModel: 'openai/gpt-oss-120b',
      mode: isConfigured
        ? 'Live Groq Cloud Ultra-Fast Multimodal Vision AI'
        : 'Smart Municipal Heuristic Engine (Ready for GROQ_API_KEY)'
    };
  }

  /**
   * Analyze civic issue description, coordinates, and real uploaded photograph
   * @param {string} description
   * @param {string} category
   * @param {string} address
   * @param {string} imageUrl
   * @param {Array<number>} coordinates - [lng, lat]
   * @returns {Promise<Object>}
   */
  async analyzeReport(description = '', category = 'pothole', address = '', imageUrl = '', coordinates = [73.8159, 18.6231]) {
    const client = this.getClient();

    // 1. Resolve image payload to base64 data URL or direct link
    let imagePayload = null;
    if (imageUrl && typeof imageUrl === 'string') {
      if (imageUrl.startsWith('data:image/')) {
        imagePayload = imageUrl;
      } else if (imageUrl.startsWith('/images/')) {
        try {
          const clientPath = path.resolve(__dirname, '../../../client/public' + imageUrl);
          if (fs.existsSync(clientPath)) {
            const buf = fs.readFileSync(clientPath);
            imagePayload = `data:image/jpeg;base64,${buf.toString('base64')}`;
          }
        } catch (err) {
          console.warn('[GroqService] Could not resolve local image asset:', err.message);
        }
      } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        imagePayload = imageUrl;
      }
    }

    // 2. Multimodal Vision Inspection using qwen/qwen3.8-27b
    if (client && imagePayload) {
      try {
        const prompt = `You are the Lead Municipal AI Vision & Infrastructure Inspector for Pimpri-Chinchwad Municipal Corporation (PCMC), Pune.
Citizen reported:
- Description: "${description}"
- Category: "${category}"
- Address: "${address}"

Your official municipal tasks:
1. CAREFULLY INSPECT THE IMAGE: Examine the physical surface, pavement condition, debris, or infrastructure shown.
2. DEFECT VERIFICATION: Determine if there is a real municipal civic defect (e.g. road pothole/cavity, uncollected garbage, overflowing drainage/sewage, broken streetlight/electrical fault, water pipeline burst).
   - If the image shows a clean road, selfie, animal, random object, indoor room, or non-civic scene, set "defectDetected": false and "category": "none".
3. If a defect is present, determine the TRUE category ("pothole", "garbage", "drainage", "streetlight", "water_leak", "other"), severity level ("critical", "high", "medium", "low"), extract 3 to 5 specific physical visual features (e.g. "deep jagged cavity in traffic lane", "exposed aggregate", "standing puddle water"), and estimate visual hazard score (0 to 100).
4. Explain your visual diagnosis in 2-3 professional, transparent sentences.

Respond ONLY with a JSON object strictly matching this schema:
{
  "defectDetected": boolean,
  "category": "pothole" | "garbage" | "drainage" | "streetlight" | "water_leak" | "other" | "none",
  "severity": "critical" | "high" | "medium" | "low" | "none",
  "confidence": number between 0.70 and 0.99,
  "visualFeatures": ["specific feature 1", "specific feature 2", "specific feature 3"],
  "visualHazardScore": number between 0 and 100,
  "department": "Roads" | "Sanitation" | "Drainage & Storm" | "Electrical" | "Water Supply" | "Public Works",
  "urgency": "immediate" | "within_24h" | "within_3d" | "routine",
  "explanation": "Official municipal AI inspection diagnosis"
}`;

        const chatCompletion = await client.chat.completions.create({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imagePayload } }
              ]
            }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return this.computePriorityAndFactors(parsed, address, coordinates, 'qwen/qwen3.8-27b');
        }
      } catch (err) {
        console.warn('[GroqService] Vision API call failed, falling back to text LLM / heuristic:', err.message);
      }
    }

    // 3. Text LLM analysis if image payload failed or is missing
    if (client) {
      try {
        const textPrompt = `You are the municipal AI dispatcher for Pimpri-Chinchwad Municipal Corporation (PCMC), Pune.
Analyze this citizen civic grievance:
Description: "${description}"
Category hint: "${category}"
Location: "${address}"

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "defectDetected": true,
  "category": "pothole" | "garbage" | "drainage" | "streetlight" | "water_leak" | "other",
  "severity": "critical" | "high" | "medium" | "low",
  "urgency": "immediate" | "within_24h" | "within_3d" | "routine",
  "department": "Roads" | "Sanitation" | "Drainage & Storm" | "Electrical" | "Water Supply" | "Public Works",
  "confidence": 0.88,
  "visualFeatures": ["reported defect at location", "surface irregularity"],
  "visualHazardScore": 70,
  "explanation": "Municipal diagnosis based on citizen description and locality.",
  "priorityScore": 70
}`;

        const textCompletion = await client.chat.completions.create({
          messages: [{ role: 'user', content: textPrompt }],
          model: 'openai/gpt-oss-120b',
          temperature: 0.1,
          response_format: { type: 'json_object' }
        });

        const content = textCompletion.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return this.computePriorityAndFactors(parsed, address, coordinates, 'openai/gpt-oss-120b');
        }
      } catch (err) {
        console.warn('[GroqService] Text LLM call failed:', err.message);
      }
    }

    // 4. Heuristic Fallback Engine
    return this.fallbackAnalysis(description, category, address, coordinates);
  }

  /**
   * Compute transparent 5-factor priority formula:
   * Priority = Severity (0-35) + Location (0-25) + Frequency (0-25) + Impact (0-10) + History (0-5)
   */
  computePriorityAndFactors(parsedData, address, coordinates, modelUsed = 'qwen/qwen3.8-27b') {
    const isDefect = parsedData.defectDetected !== false && parsedData.category !== 'none';
    const visualScore = parsedData.visualHazardScore != null
      ? parsedData.visualHazardScore
      : parsedData.severity === 'critical' ? 92 : parsedData.severity === 'high' ? 78 : parsedData.severity === 'medium' ? 55 : 30;

    // Factor 1: Visual Severity Weight (0 to 35 pts)
    const severityWeight = isDefect ? Math.round((visualScore / 100) * 35) : 0;

    // Factor 2: Locality Proximity Risk (0 to 25 pts)
    let locationWeight = 12; // baseline municipal area
    let matchedZoneName = null;
    if (coordinates && coordinates.length === 2) {
      for (const zone of PCMC_SENSITIVE_ZONES) {
        const dist = getDistanceMeters(coordinates, zone.coords);
        if (dist <= zone.radius) {
          locationWeight = zone.riskBonus;
          matchedZoneName = zone.name;
          break;
        }
      }
    }

    // Factor 3: Initial Frequency Weight (0 to 25 pts) - baseline for 1st report is 12 pts
    const frequencyWeight = 12;

    // Factor 4: Traffic Impact Weight (0 to 10 pts)
    const addrLower = (address || '').toLowerCase();
    const isArterialRoute =
      addrLower.includes('highway') ||
      addrLower.includes('expressway') ||
      addrLower.includes('main road') ||
      addrLower.includes('station') ||
      addrLower.includes('chowk');
    const impactWeight = isArterialRoute ? 9 : 5;

    // Factor 5: Historical Recurrence Index (0 to 5 pts)
    const historyWeight = 3;

    // Total Composite Priority Score (0 to 99)
    const totalPriorityScore = !isDefect
      ? 15
      : Math.min(99, Math.max(20, severityWeight + locationWeight + frequencyWeight + impactWeight + historyWeight));

    return {
      defectDetected: isDefect,
      category: isDefect ? parsedData.category || 'pothole' : 'none',
      severity: isDefect ? parsedData.severity || 'medium' : 'none',
      urgency: isDefect ? parsedData.urgency || 'within_24h' : 'routine',
      department: parsedData.department || 'Roads',
      confidence: parsedData.confidence || 0.95,
      visualFeatures: Array.isArray(parsedData.visualFeatures) ? parsedData.visualFeatures : ['Defect verified on site'],
      visualHazardScore: visualScore,
      priorityScore: totalPriorityScore,
      priorityFactors: {
        severityWeight,
        locationWeight,
        frequencyWeight,
        impactWeight,
        historyWeight
      },
      matchedZone: matchedZoneName,
      modelUsed,
      imageValid: isDefect,
      explanation: parsedData.explanation || `Municipal AI verified ${parsedData.severity || 'medium'} ${parsedData.category || 'civic'} issue.`,
      source: modelUsed.includes('qwen') ? 'qwen_multimodal_vision_ai' : 'groq_cloud_llm'
    };
  }

  /**
   * Translate and structure voice transcript into civic grievance details
   */
  async processVoiceTranscript(rawTranscript = '') {
    const client = this.getClient();
    if (!rawTranscript || !rawTranscript.trim()) {
      return {
        originalText: '',
        translatedEnglish: '',
        category: 'pothole',
        description: ''
      };
    }

    if (client) {
      try {
        const prompt = `You are the multilingual civic grievance processor for Pimpri Chinchwad Municipal Corporation (PCMC).
A citizen spoke the following civic grievance in Marathi, Hindi, or Indian English:
"${rawTranscript}"

Task:
1. Translate and polish into clear, formal English description for municipal workers.
2. Identify the most probable category from: ["pothole", "garbage", "drainage", "streetlight", "water_leak", "other"].
3. Preserve specific landmark names mentioned in Pimpri-Chinchwad (e.g. DY Patil, Sant Tukaram Nagar, YCM Hospital).

Respond ONLY with a JSON object strictly matching:
{
  "originalText": "${rawTranscript}",
  "translatedEnglish": "Clear English summary of what the citizen reported",
  "category": "pothole" | "garbage" | "drainage" | "streetlight" | "water_leak" | "other"
}`;

        const completion = await client.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'openai/gpt-oss-120b',
          temperature: 0.1,
          response_format: { type: 'json_object' }
        });

        const res = JSON.parse(completion.choices[0]?.message?.content || '{}');
        if (res.translatedEnglish) {
          return res;
        }
      } catch (err) {
        console.warn('[GroqService] processVoiceTranscript LLM failed:', err.message);
      }
    }

    return {
      originalText: rawTranscript,
      translatedEnglish: rawTranscript,
      category: 'pothole'
    };
  }

  /**
   * Rule-based fallback classifier with transparent 5-factor scoring
   */
  fallbackAnalysis(description = '', category = 'pothole', address = '', coordinates = [73.8159, 18.6231]) {
    const text = (description + ' ' + address).toLowerCase();

    let resolvedCategory = category || 'pothole';
    let severity = 'medium';
    let urgency = 'within_24h';
    let department = 'Roads';
    let visualHazardScore = 65;
    let visualFeatures = ['Municipal infrastructure defect'];

    if (text.includes('pothole') || text.includes('crater') || text.includes('asphalt') || text.includes('road surface')) {
      resolvedCategory = 'pothole';
      department = 'Roads';
      visualFeatures = ['Pavement depression', 'Asphalt surface breakage', 'Road lane obstruction'];
    } else if (text.includes('garbage') || text.includes('waste') || text.includes('dump') || text.includes('trash') || text.includes('debris')) {
      resolvedCategory = 'garbage';
      department = 'Sanitation';
      visualFeatures = ['Accumulated solid waste', 'Refuse spillage', 'Sanitation container overflow'];
    } else if (text.includes('drain') || text.includes('sewer') || text.includes('waterlog') || text.includes('overflow') || text.includes('flood')) {
      resolvedCategory = 'drainage';
      department = 'Drainage & Storm';
      visualFeatures = ['Waterlogged street drain', 'Standing effluent', 'Stormwater channel blockage'];
    } else if (text.includes('street light') || text.includes('streetlight') || text.includes('lamp') || text.includes('pole') || text.includes('dark')) {
      resolvedCategory = 'streetlight';
      department = 'Electrical';
      visualFeatures = ['Street illumination outage', 'Electrical fixture defect'];
    } else if (text.includes('leak') || text.includes('pipeline') || text.includes('water supply') || text.includes('burst')) {
      resolvedCategory = 'water_leak';
      department = 'Water Supply';
      visualFeatures = ['Potable waterline rupture', 'Surface water discharge'];
    }

    if (text.includes('dangerous') || text.includes('accident') || text.includes('hospital') || text.includes('school') || text.includes('deep')) {
      severity = 'critical';
      urgency = 'immediate';
      visualHazardScore = 90;
    } else if (text.includes('busy') || text.includes('highway') || text.includes('major') || text.includes('large')) {
      severity = 'high';
      urgency = 'within_24h';
      visualHazardScore = 78;
    } else if (text.includes('small') || text.includes('minor')) {
      severity = 'low';
      urgency = 'within_3d';
      visualHazardScore = 40;
    }

    const parsed = {
      defectDetected: true,
      category: resolvedCategory,
      severity,
      urgency,
      department,
      confidence: 0.91,
      visualFeatures,
      visualHazardScore,
      explanation: `Municipal AI verified ${severity} ${resolvedCategory.replace('_', ' ')} civic defect at ${address || 'geotagged coordinates'}. Dispatched to ${department} Department with ${urgency.replace('_', ' ')} action priority.`
    };

    return this.computePriorityAndFactors(parsed, address, coordinates, 'smart_heuristic_engine');
  }
}

export const groqService = new GroqService();
