import * as FileSystem from 'expo-file-system';
import { Doc } from '@/convex/_generated/dataModel';

interface CategoryGroup {
    rice_and_beans: Doc<'dishes'>[];
    meats: Doc<'dishes'>[];
    sides: Doc<'dishes'>[];
    salads: Doc<'dishes'>[];
}

const generateQuadrantHTML = (categories: CategoryGroup) => {
    const riceAndBeans = categories.rice_and_beans
        .reduce((acc, item) => {
            if (item.categoryId === 'rice') {
                acc.rice.push(item.name);
            } else if (item.categoryId === 'beans') {
                acc.beans.push(item.name);
            }
            return acc;
        }, { rice: [] as string[], beans: [] as string[] });

    const meatsHtml = categories.meats
        .reduce((acc: string[], item, index, array) => {
            if (index % 2 === 0) {
                const nextItem = array[index + 1];
                if (nextItem && (item.name.length + nextItem.name.length) <= 35) {
                    acc.push(`${item.name} | ${nextItem.name}`);
                } else {
                    acc.push(item.name);
                }
            } else if (index === array.length - 1) {
                acc.push(item.name);
            }
            return acc;
        }, [])
        .map(text => `<div class="dish-item">${text}</div>`)
        .join('');

    const sidesHtml = categories.sides
        .map(item => `<div class="dish-item">${item.name}</div>`)
        .join('');

    const saladsHtml = categories.salads
        .reduce((acc: string[], item, index, array) => {
            const currentLine = acc[acc.length - 1] || '';
            const newText = currentLine ? `${currentLine}      ${item.name}` : item.name;

            if (newText.length <= 35) {
                acc[acc.length - 1] = newText;
            } else {
                acc.push(item.name);
            }
            return acc;
        }, [''])
        .map(text => `<div class="dish-item">${text}</div>`)
        .join('');

    return `
        <div class="quadrant">
            ${riceAndBeans.rice.length > 0 ?
            `<div class="dish-item">${riceAndBeans.rice.join(' | ')}</div>` : ''}
            ${riceAndBeans.beans.length > 0 ?
            `<div class="dish-item">${riceAndBeans.beans.join(' | ')}</div>` : ''}
            ${meatsHtml}
            ${sidesHtml}
            ${saladsHtml}
        </div>
    `;
};

export const generateMenuPDF = async (menuText: string) => {
    try {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        white-space: pre-wrap;
                    }
                    .menu-content {
                        font-size: 14px;
                        line-height: 1.5;
                    }
                </style>
            </head>
            <body>
                <div class="menu-content">
                    ${menuText}
                </div>
            </body>
            </html>
        `;
        ;

        // Move the file to a more permanent location if needed
        const destinationUri = `${FileSystem.cacheDirectory}menu.pdf`;


        return destinationUri;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

const categorizeDishes = (dishes: Doc<'dishes'>[]) => {
    const categories: CategoryGroup = {
        rice_and_beans: [],
        meats: [],
        sides: [],
        salads: []
    };

    for (const dish of dishes) {
        switch (dish.categoryId) {
            case 'rice':
            case 'beans':
                categories.rice_and_beans.push(dish);
                break;
            case 'meats':
                categories.meats.push(dish);
                break;
            case 'sides':
                categories.sides.push(dish);
                break;
            case 'salads':
                categories.salads.push(dish);
                break;
        }
    }

    return categories;
}; 