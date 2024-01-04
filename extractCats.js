const productCategories = require('./productCategories');

function getProductCategoriesTitles(categoryName) {
    const menswearTitles = [];
    const menswearCategory = productCategories.find(category => category.title === 'Menswear');
    if (menswearCategory) {
        const outerwareCategory = menswearCategory.categories.find(category => category.title === categoryName);
        if (outerwareCategory) {
            outerwareCategory.categories.forEach(subCategory => {
                menswearTitles.push(subCategory.title);
            });
        }
    }
    return menswearTitles;
}



function getSecondaryCategoryTitles(categoryName) {
    const category = productCategories.find(category => category.title === categoryName);
    const secondaryCategoryTitles = [];

    if (category) {
        category.categories.forEach(subCategory => {
            secondaryCategoryTitles.push(subCategory.title);
        });
    }

    return secondaryCategoryTitles.join(', ');
}


function getTertiaryCategoryTitles(primaryCategory, secondaryCategory) {
    const category = productCategories.find(category => category.title === primaryCategory);
    let tertiaryCategoryTitles = [];

    if (category) {
        const subCategory = category.categories.find(subCategory => subCategory.title === secondaryCategory);
        if (subCategory) { // Add this condition to check if subCategory is not undefined
            tertiaryCategoryTitles = subCategory.categories.map(tertiaryCategory => tertiaryCategory.title);
        }
    }

    return tertiaryCategoryTitles.join(', '); // Remove the explicit addition of "All accessories" outside the if (subCategory) block
}

console.log(getTertiaryCategoryTitles('Menswear', 'Outerwear'));
