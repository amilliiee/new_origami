import {
    CATEGORY_BASE_PATH,
    CREATOR_BASE_PATH,
    DIAGRAM_BASE_PATH,
    DIFFICULTY_BASE_PATH,
    fetchData,
    displayError,
    sortByName,
    sortByCategory
} from './shared.js';

async function loadCreators() {
    try {
        const data = await fetchData();
        const creators = sortByName(data.creators);

        document.getElementById('creators-list').innerHTML = creators
            .map(c => `
                <li>
                    <a href="${CREATOR_BASE_PATH}${c.id}">
                        ${c.name}
                    </a>
                </li>
            `).join('');
    } catch (e) {
        console.error('Error:', e);
        displayError('creators-list', 'Failed to load creators');
    }
};

async function loadCategories() {
    try {
        const data = await fetchData();
        const categories = sortByCategory(data.categories);
    

        document.getElementById('categories-list').innerHTML = categories
            .map(c => `
                <li>
                    <a href="${CATEGORY_BASE_PATH}${c}">
                        ${c.charAt(0).toUpperCase() + c.slice(1)}
                    </a>
                </li>
            `).join('');
    } catch (e) {
        console.error('Error:', e);
        displayError('categories-list', 'Failed to load categories');
    }
};

async function loadDifficulties() {
    try {
        const data = await fetchData();
        const difficulties = data.difficulties; // just created as an ordered array to save headache

        document.getElementById('difficulty-list').innerHTML = difficulties
            .map(diff => `
                <li>
                    <a href="${DIFFICULTY_BASE_PATH}${diff}">
                        ${diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </a>
                </li>
            `).join('')
    } catch (e) {
        console.error('Error:', e);
        displayError('difficulty-list', 'Failed to load difficulties');
    }
};

async function seeAll() {
    try {
        const data = await fetchData();
        const all = sortByName(data.diagrams);

        document.getElementById('full-list').innerHTML = all
            .map(d => `
                <li>
                    <a href="${DIAGRAM_BASE_PATH}${d.name}">
                        ${d.name}
                    </a>
                </li>
            `).join('')
    } catch (e) {
        console.error('Error:', e);
        displayError('all-diagrams', 'Failed to load diagrams');
    }
};

document.addEventListener('DOMContentLoaded', loadCreators);
document.addEventListener('DOMContentLoaded', loadCategories);
document.addEventListener('DOMContentLoaded', loadDifficulties);
//document.addEventListener('DOMContentLoaded', seeAll);