import * as ImageManipulator from 'expo-image-manipulator';

interface Dish {
    id: string;
    name: string;
    category?: string;
}

interface ImageManipulationOptions {
    resize?: { width: number };
    format?: ImageManipulator.SaveFormat;
    compress?: number;
}

// OCR Processing optimized for Portuguese handwritten menus
export const processImageWithOCR = async (imageUri: string): Promise<string[]> => {
    try {
        // 1. Enhanced image preprocessing
        const preprocessedUri = await preprocessHandwrittenImage(imageUri);
        const base64Image = await convertImageToBase64(preprocessedUri);

        // 2. Validate base64 image
        if (!base64Image || typeof base64Image !== 'string' || base64Image.length < 100) {
            throw new Error('Invalid image data');
        }

        // 3. API configuration
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;
        console.log(process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY);

        if (!apiKey) throw new Error('API key missing');

        const apiUrl = 'https://vision.googleapis.com/v1/images:annotate';

        const requestBody = {
            requests: [{
                image: { content: base64Image },
                features: [{
                    type: 'DOCUMENT_TEXT_DETECTION',
                    maxResults: 50
                }],
                imageContext: {
                    languageHints: ['pt-BR', 'pt'],
                    textDetectionParams: {
                        enableTextDetectionConfidenceScore: true
                    }
                }
            }]
        };

        // 4. API request with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        console.log('API response:', response);


        clearTimeout(timeout);

        // 5. Response handling
        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || `HTTP ${response.status}`;
            throw new Error(`API error: ${errorMsg}`);
        }

        // Get the first text annotation (full text)
        const fullText = data.responses?.[0]?.textAnnotations?.[0]?.description;
        if (!fullText) {
            throw new Error('No text detected');
        }

        // Split by newlines and clean each line
        const menuItems: string[] = fullText
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)
            .map((line: string) => cleanPortugueseMenuText(line));

        // Filter out empty strings and return unique items
        return [...new Set(menuItems.filter((text: string) => text.length > 0))];

    } catch (error) {
        console.error('OCR Processing Error:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
};

// Specialized image preprocessing for handwritten Portuguese
export const preprocessHandwrittenImage = async (uri: string): Promise<string> => {
    try {
        // First pass: Convert to grayscale and enhance contrast
        const grayscaleResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 2000 } }], // Increased resolution
            { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
        );

        // Second pass: Further enhance contrast and sharpness
        const result = await ImageManipulator.manipulateAsync(
            grayscaleResult.uri,
            [{ resize: { width: 2000 } }],
            { format: ImageManipulator.SaveFormat.JPEG, compress: 0.9 }
        );
        return result.uri;
    } catch (error) {
        console.warn('Image processing failed, using original', error);
        return uri;
    }
};

// Specialized cleaner for Portuguese menu text
export const cleanPortugueseMenuText = (ocrText: string): string => {
    if (!ocrText) return '';

    // Common Portuguese menu corrections
    const portugueseCorrections: Record<string, string> = {
        // Common OCR errors in Portuguese handwriting
        'feiJio': 'feijão',
        'arros': 'arroz',
        'frang': 'frango',
        'bif': 'bife',
        'salda': 'salada',
        'sobrmsa': 'sobremesa',
        // Add more based on your specific menu items
    };

    // Common Portuguese stopwords to remove
    const portugueseStopwords = new Set([
        'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
        'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem'
    ]);

    let cleanedText = ocrText;

    // 1. Apply language-specific corrections
    Object.entries(portugueseCorrections).forEach(([wrong, correct]) => {
        cleanedText = cleanedText.replace(new RegExp(wrong, 'gi'), correct);
    });

    // 2. Remove special characters but keep Portuguese diacritics
    cleanedText = cleanedText.replace(/[^\w\sáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ\-.,]/g, '');

    // 3. Fix common spacing issues in Portuguese
    cleanedText = cleanedText.replace(/([a-zA-ZÇç])- ([a-zA-ZÇç])/g, '$1$2'); // Fix hyphenated words
    cleanedText = cleanedText.replace(/\b([aA])\b/g, 'à'); // Common single-letter OCR error

    // 4. Remove stopwords and short meaningless strings
    cleanedText = cleanedText.split('\n')
        .map(line => line.trim())
        .filter(line => {
            const words = line.split(/\s+/);
            return words.some(word =>
                word.length > 2 && !portugueseStopwords.has(word.toLowerCase())
            );
        })
        .join('\n');

    // 5. Normalize whitespace
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    cleanedText = cleanedText.replace(/\n+/g, '\n').trim();

    return cleanedText;
};

// Enhanced base64 conversion with validation
export const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
        const response = await fetch(uri);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        if (blob.size < 1024) throw new Error('Image too small');

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                if (typeof result !== 'string') return reject('No data');
                const base64data = result.split(',')[1];
                if (!base64data) reject('Invalid base64 data');
                resolve(base64data);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Base64 conversion error:', error);
        throw error;
    }
};

// Enhanced dish matching for Portuguese menus
export const matchDishesWithOCR = (ocrTexts: string[], storedDishes: Dish[]): Dish[] => {
    console.log('\n🔍 Starting dish matching process...');
    console.log('📝 OCR Texts received:', JSON.stringify(ocrTexts, null, 2));
    console.log('🍽️ Total dishes to match against:', storedDishes.length);

    if (!storedDishes || !ocrTexts || ocrTexts.length === 0) return [];

    const matchedDishes: Dish[] = [];
    const unmatchedWords: string[] = [];

    // Helper function to normalize text (remove accents and convert to uppercase)
    const normalizeText = (text: string): string => {
        return text
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    };

    // Clean and normalize OCR texts
    const cleanedTexts = ocrTexts.map(text => ({
        original: text,
        normalized: normalizeText(text)
    })).filter(item => item.normalized.length > 2); // Skip very short words

    console.log('🧹 Cleaned texts:', cleanedTexts.map(t => `${t.original} -> ${t.normalized}`));

    // Prepare normalized stored dishes for better matching
    const normalizedDishes = storedDishes.map(dish => ({
        ...dish,
        normalizedName: normalizeText(dish.name)
    }));

    // Try to match each OCR text with stored dishes
    cleanedTexts.forEach(({ original, normalized }) => {
        if (normalized.length < 3) return; // Skip very short words

        console.log(`\n👀 Checking word: "${original}" (normalized: "${normalized}")`);

        // First, try to find exact matches
        let matches = normalizedDishes.filter(dish => {
            const isExactMatch = dish.normalizedName === normalized;
            if (isExactMatch) {
                console.log(`   🔍 Exact match found: "${dish.name}"`);
            }
            return isExactMatch;
        });

        // If no exact matches found, try partial matches
        if (matches.length === 0) {
            matches = normalizedDishes.filter(dish => {
                // Check if the OCR text is a substring of the dish name or vice versa
                const isSubstring = dish.normalizedName.includes(normalized) ||
                    normalized.includes(dish.normalizedName);

                if (isSubstring) {
                    console.log(`   🔍 Partial match found: "${dish.name}" (${dish.normalizedName})`);
                    return true;
                }

                return false;
            });
        }

        if (matches.length > 0) {
            // Sort matches by relevance
            matches.sort((a, b) => {
                // Exact matches first
                if (a.normalizedName === normalized) return -1;
                if (b.normalizedName === normalized) return 1;

                // Then by length difference
                const diffA = Math.abs(a.normalizedName.length - normalized.length);
                const diffB = Math.abs(b.normalizedName.length - normalized.length);
                return diffA - diffB;
            });

            const bestMatch = matches[0];
            // Check if we already have this exact dish name (case-insensitive)
            const isDuplicate = matchedDishes.some(dish =>
                normalizeText(dish.name) === normalizeText(bestMatch.name)
            );

            if (!isDuplicate) {
                matchedDishes.push(bestMatch);
                console.log(`   ✅ Added match: "${bestMatch.name}" (normalized: "${bestMatch.normalizedName}")`);
            } else {
                console.log(`   ⚠️ Skipping duplicate match: "${bestMatch.name}"`);
            }
        } else {
            unmatchedWords.push(original);
            console.log(`   ❌ No matches found for: "${original}"`);
        }
    });

    console.log('\n📊 Matching Summary:');
    console.log(`✅ Matched dishes: ${matchedDishes.length}`);
    console.log('   Matches:', matchedDishes.map(d => d.name));
    console.log(`❌ Unmatched words: ${unmatchedWords.length}`);
    if (unmatchedWords.length > 0) {
        console.log('   Unmatched:', unmatchedWords);
    }

    return matchedDishes;
};

// Generate formatted menu content
export const generateMenuContent = (matchedDishes: Dish[]): string => {
    let menuContent = '';

    // Group dishes by category
    const categorizedDishes = matchedDishes.reduce((acc, dish) => {
        const category = dish.category || 'other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(dish);
        return acc;
    }, {} as Record<string, Dish[]>);

    // Define category order and labels
    const categoryOrder = ['main', 'side', 'salad', 'dessert', 'other'];
    const categoryLabels: Record<string, string> = {
        main: '🥩 Prato Principal',
        side: '🍚 Acompanhamentos',
        salad: '🥗 Saladas',
        dessert: '🍮 Sobremesa',
        other: '🍽️ Outros'
    };

    // Add dishes by category
    categoryOrder.forEach(category => {
        const dishes = categorizedDishes[category];
        if (dishes && dishes.length > 0) {
            menuContent += `${categoryLabels[category]}:\n`;
            dishes.forEach(dish => {
                menuContent += `• ${dish.name}\n`;
            });
            menuContent += '\n';
        }
    });

    return menuContent;
};

// Levenshtein distance for string similarity
export function levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }

    return dp[m][n];
}