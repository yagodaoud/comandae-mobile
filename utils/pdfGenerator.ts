import * as FileSystem from 'expo-file-system';
import { jsPDF } from 'jspdf';
import { Doc } from '@/convex/_generated/dataModel';

interface CategoryGroup {
    rice_and_beans: (Doc<'dishes'> & { categoryName: string })[];
    meats: (Doc<'dishes'> & { categoryName: string })[];
    sides: (Doc<'dishes'> & { categoryName: string })[];
    salads: (Doc<'dishes'> & { categoryName: string })[];
}

const PAGE_WIDTH = 595.0;
const PAGE_HEIGHT = 842.0;
const QUADRANT_WIDTH = PAGE_WIDTH / 2;
const QUADRANT_HEIGHT = PAGE_HEIGHT / 2;
const MARGIN = 30.0;
const FONT_SIZE = 14;
const LINE_HEIGHT = 14;

const findOptimalSaladCombinations = (items: Doc<'dishes'>[], doc: jsPDF, maxWidth: number) => {
    const optimalCombinations: Doc<'dishes'>[][] = [];
    const currentLine: Doc<'dishes'>[] = [];
    let currentLineWidth = 0;

    for (const item of items) {
        const itemWidth = doc.getTextWidth(item.name);
        const spaceWidth = doc.getTextWidth('      ');

        if (currentLine.length > 0 && (currentLineWidth + spaceWidth + itemWidth > maxWidth)) {
            optimalCombinations.push([...currentLine]);
            currentLine.length = 0;
            currentLineWidth = 0;
        }

        currentLine.push(item);
        currentLineWidth += (currentLine.length > 1 ? spaceWidth : 0) + itemWidth;
    }

    if (currentLine.length > 0) {
        optimalCombinations.push(currentLine);
    }

    return optimalCombinations;
};

const writeCategory = (
    doc: jsPDF,
    categoryName: string,
    items: Doc<'dishes'>[],
    x: number,
    y: number
): number => {
    if (!items || items.length === 0) return y;

    let currentY = y - LINE_HEIGHT;

    if (categoryName === 'Salads') {
        const optimalCombinations = findOptimalSaladCombinations(
            items,
            doc,
            QUADRANT_WIDTH - (2 * MARGIN) - 10
        );

        for (const combination of optimalCombinations) {
            let text = '';
            for (let i = 0; i < combination.length; i++) {
                text += combination[i].name;
                if (i < combination.length - 1) {
                    text += '      ';
                }
            }
            doc.text(text, x, currentY);
            currentY -= LINE_HEIGHT;
        }
    } else if (categoryName === 'Meats') {
        for (let i = 0; i < items.length; i++) {
            let text = items[i].name;

            if (i + 1 < items.length) {
                const combinedText = `${items[i].name} | ${items[i + 1].name}`;
                if (combinedText.length <= 35) {
                    text = combinedText;
                    i++;
                }
            }

            doc.text(text, x, currentY);
            currentY -= LINE_HEIGHT;
        }
    } else {
        for (const item of items) {
            doc.text(item.name, x, currentY);
            currentY -= LINE_HEIGHT;
        }
    }

    return currentY - 10;
};

const writeRiceAndBeansCategory = (
    doc: jsPDF,
    items: (Doc<'dishes'> & { categoryName: string })[],
    x: number,
    y: number
): number => {
    const riceItems = items.filter(item => item.categoryName.toLowerCase() === 'arroz');
    const beansItems = items.filter(item => item.categoryName.toLowerCase() === 'feijão');

    let currentY = y - LINE_HEIGHT;

    if (beansItems.length > 0) {
        const beansText = beansItems.map(item => item.name).join(' | ');
        doc.text(beansText, x, currentY);
        currentY -= LINE_HEIGHT;
    }

    if (riceItems.length > 0) {
        const riceText = riceItems.map(item => item.name).join(' | ');
        doc.text(riceText, x, currentY);
        currentY -= LINE_HEIGHT;
    }

    return currentY - 10;
};

const populateQuadrant = (
    doc: jsPDF,
    categories: CategoryGroup,
    row: number,
    col: number
) => {
    const x = col * QUADRANT_WIDTH + MARGIN;
    const y = PAGE_HEIGHT - (row * QUADRANT_HEIGHT + (4 * MARGIN) - 70);

    let currentY = writeCategory(doc, 'Salads', categories.salads, x, y);

    currentY = writeCategory(doc, 'Sides', categories.sides, x, currentY);

    currentY = writeCategory(doc, 'Meats', categories.meats, x, currentY);

    currentY = writeRiceAndBeansCategory(doc, categories.rice_and_beans, x, currentY);
};

const drawQuadrants = (doc: jsPDF) => {
    doc.setLineWidth(0.5);
    doc.line(QUADRANT_WIDTH, MARGIN, QUADRANT_WIDTH, PAGE_HEIGHT - MARGIN);
};

export const generateMenuPDF = async (
    dishes: (Doc<'dishes'> & { categoryName: string })[],
    categories: Doc<'dish_categories'>[]
) => {
    try {
        console.log('Starting PDF generation with dishes:', dishes);
        console.log('Dishes count:', dishes.length);
        console.log('First dish sample:', dishes[0]);
        console.log('Categories:', categories);

        if (!categories) {
            throw new Error('Categories are required');
        }

        const categoryMap = new Map(categories.map(cat => [cat._id, cat.name.toLowerCase()]));
        console.log('Category map:', Object.fromEntries(categoryMap));

        const categorizedDishes: CategoryGroup = {
            rice_and_beans: [],
            meats: [],
            sides: [],
            salads: []
        };

        dishes.forEach(dish => {
            const categoryName = categoryMap.get(dish.categoryId);
            console.log('Processing dish:', {
                name: dish.name,
                categoryId: dish.categoryId,
                categoryName
            });

            if (!categoryName) {
                console.log('Unknown category:', dish.categoryId);
                return;
            }

            dish.categoryName = categoryName;

            switch (categoryName) {
                case 'arroz':
                case 'feijão':
                    categorizedDishes.rice_and_beans.push(dish);
                    break;
                case 'carnes':
                    categorizedDishes.meats.push(dish);
                    break;
                case 'guarnições':
                    categorizedDishes.sides.push(dish);
                    break;
                case 'saladas':
                    categorizedDishes.salads.push(dish);
                    break;
                default:
                    console.log('Unhandled category:', categoryName);
            }
        });

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(FONT_SIZE);

        drawQuadrants(doc);

        populateQuadrant(doc, categorizedDishes, 0, 0);
        populateQuadrant(doc, categorizedDishes, 0, 1);
        populateQuadrant(doc, categorizedDishes, 1, 0);
        populateQuadrant(doc, categorizedDishes, 1, 1);

        const pdfOutput = doc.output('datauristring');
        const base64Data = pdfOutput.split(',')[1];
        const pdfPath = `${FileSystem.cacheDirectory}menu.pdf`;

        await FileSystem.writeAsStringAsync(pdfPath, base64Data, {
            encoding: FileSystem.EncodingType.Base64
        });

        console.log('PDF generated successfully at:', pdfPath);
        return pdfPath;
    } catch (error) {
        console.error('Error in generateMenuPDF:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
        throw error;
    }
};