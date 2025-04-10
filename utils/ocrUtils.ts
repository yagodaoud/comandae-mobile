import * as ImageManipulator from 'expo-image-manipulator';
// OCR Processing optimized for Portuguese handwritten menus
export const processImageWithOCR = async (imageUri) => {
    try {
        // 1. Enhanced image preprocessing
        const preprocessedUri = await preprocessHandwrittenImage(imageUri);
        const base64Image = await convertImageToBase64(preprocessedUri);

        // 2. Validate base64 image
        if (!base64Image || base64Image.length < 100) {
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
                    maxResults: 1
                }],
                imageContext: {
                    languageHints: ['pt'], // Focus on Portuguese
                    textDetectionParams: {
                        enableTextDetectionConfidenceScore: true,
                        advancedOcrOptions: ['legacy_cjk_alt'] // Helps with handwriting
                    }
                }
            }]
        };

        // 4. API request with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        console.log('API request:', JSON.stringify(requestBody));
        return;

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

        const rawText = data.responses?.[0]?.fullTextAnnotation?.text;
        if (!rawText) throw new Error('No text detected');

        // 6. Specialized cleaning for Portuguese menus
        const cleanedText = cleanPortugueseMenuText(rawText);
        return cleanedText;

    } catch (error) {
        console.error('OCR Processing Error:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

// Specialized image preprocessing for handwritten Portuguese
export const preprocessHandwrittenImage = async (uri) => {
    try {
        // Convert to grayscale first for better contrast with blue/black ink
        const grayscaleResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1600 } }],
            { format: ImageManipulator.SaveFormat.JPEG }
        );

        // Then enhance contrast and sharpness
        const result = await ImageManipulator.manipulateAsync(
            grayscaleResult.uri,
            [
                { contrast: 0.5 },
                { brightness: 0.1 },
                { sharpen: 0.3 } // Add sharpening for handwritten text
            ],
            { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.warn('Image processing failed, using original', error);
        return uri;
    }
};

// Specialized cleaner for Portuguese menu text
export const cleanPortugueseMenuText = (ocrText) => {
    if (!ocrText) return '';

    // Common Portuguese menu corrections
    const portugueseCorrections = {
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
export const convertImageToBase64 = async (uri) => {
    try {
        const response = await fetch(uri);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        if (blob.size < 1024) throw new Error('Image too small');

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                if (!result) return reject('No data');
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
export const matchDishesWithOCR = (ocrText, storedDishes) => {
    if (!storedDishes || !ocrText) return [];

    // First clean the OCR text specifically for matching
    const cleanedText = cleanForMatching(ocrText);
    const extractedLines = cleanedText.split('\n').filter(line => line.trim().length > 0);
    const matchedDishes = [];

    extractedLines.forEach(line => {
        const trimmedLine = line.trim().toLowerCase();

        // Skip lines that are prices only (e.g., "R$ 20,00")
        if (/^r\$\s*\d+[\.,]\d{2}$/i.test(trimmedLine)) return;

        // Skip very short lines or common non-dish text
        if (trimmedLine.length < 3 || /^(e|ou|com|sem)$/i.test(trimmedLine)) return;

        // Find closest match using Portuguese-specific matching
        const matches = storedDishes.filter(dish => {
            const dishName = dish.name.toLowerCase();

            // Special handling for Portuguese compound words
            const normalizedLine = trimmedLine.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const normalizedDish = dishName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            // Check for partial matches considering Portuguese word variations
            return (
                normalizedDish.includes(normalizedLine) ||
                normalizedLine.includes(normalizedDish) ||
                portuguesePartialMatch(normalizedLine, normalizedDish)
            );
        });

        if (matches.length > 0) {
            // Sort by similarity score (improved for Portuguese)
            matches.sort((a, b) => {
                const aScore = portugueseSimilarityScore(trimmedLine, a.name.toLowerCase());
                const bScore = portugueseSimilarityScore(trimmedLine, b.name.toLowerCase());
                return bScore - aScore; // Higher score first
            });

            if (!matchedDishes.some(dish => dish.id === matches[0].id)) {
                matchedDishes.push(matches[0]);
            }
        }
    });

    return matchedDishes;
};

// Helper function for Portuguese-specific matching
function portuguesePartialMatch(text, dishName) {
    const textWords = text.split(/\s+/);
    const dishWords = dishName.split(/\s+/);

    return textWords.some(tWord =>
        dishWords.some(dWord =>
            dWord.startsWith(tWord) ||
            tWord.startsWith(dWord) ||
            levenshteinDistance(tWord, dWord) <= 2
        )
    );
}

// Similarity score considering Portuguese language characteristics
function portugueseSimilarityScore(text, dishName) {
    // Base score from Levenshtein
    let score = 1 - (levenshteinDistance(text, dishName) / Math.max(text.length, dishName.length));

    // Bonus for matching at start (common in Portuguese dishes)
    if (dishName.startsWith(text) || text.startsWith(dishName)) {
        score += 0.3;
    }

    // Bonus for matching root words
    if (text.length > 3 && dishName.includes(text.substring(0, 3))) {
        score += 0.2;
    }

    return Math.min(1, score); // Cap at 1
}

// Generate formatted menu content
export const generateMenuContent = (matchedDishes) => {
    let menuContent = '';

    // Group dishes by category
    const categorizedDishes = {
        mainDishes: matchedDishes.filter(dish => dish.category === 'main'),
        sides: matchedDishes.filter(dish => dish.category === 'side'),
        salads: matchedDishes.filter(dish => dish.category === 'salad'),
        desserts: matchedDishes.filter(dish => dish.category === 'dessert')
    };

    // Generate formatted menu text
    menuContent += '🍽️ OPÇÕES DO DIA:\n\n';

    if (categorizedDishes.mainDishes.length > 0) {
        menuContent += '🥩 Prato Principal:\n';
        categorizedDishes.mainDishes.forEach(dish => {
            menuContent += `• ${dish.name}\n`;
        });
        menuContent += '\n';
    }

    if (categorizedDishes.sides.length > 0) {
        menuContent += '🍚 Acompanhamentos:\n';
        categorizedDishes.sides.forEach(dish => {
            menuContent += `• ${dish.name}\n`;
        });
        menuContent += '\n';
    }

    if (categorizedDishes.salads.length > 0) {
        menuContent += '🥗 Saladas:\n';
        categorizedDishes.salads.forEach(dish => {
            menuContent += `• ${dish.name}\n`;
        });
        menuContent += '\n';
    }

    if (categorizedDishes.desserts.length > 0) {
        menuContent += '🍮 Sobremesa:\n';
        categorizedDishes.desserts.forEach(dish => {
            menuContent += `• ${dish.name}\n`;
        });
        menuContent += '\n';
    }

    // If no dishes were matched, provide a message
    if (Object.values(categorizedDishes).every(category => category.length === 0)) {
        menuContent += '⚠️ Nenhum prato foi reconhecido na imagem.\n\n';
        menuContent += 'Por favor, tente tirar uma foto mais clara ou adicionar pratos manualmente.\n\n';
    }

    menuContent += '💰 Valores:\n';
    menuContent += '• Marmitex P: R$ 18,00\n';
    menuContent += '• Marmitex M: R$ 22,00\n';
    menuContent += '• Marmitex G: R$ 26,00';

    return menuContent;
};

// Levenshtein distance for string similarity
export function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

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