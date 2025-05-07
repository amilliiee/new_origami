import {
	CREATOR_BASE_PATH,
	fetchData,
	displayError,
	sortByName,
	ROWS_PER_PAGE,
} from "./shared.js";

async function loadCreators() {
	try {
		const data = await fetchData();
		const creators = sortByName(data.creators);
		const creatorsList = document.getElementById("creators-list");
		const paginationContainer = document.getElementById("creators-pagination");

		let currentPage = 1;

		function displayCreators(page) {
			currentPage = page;
			const startIndex = (page - 1) * ROWS_PER_PAGE;
			const endIndex = startIndex + ROWS_PER_PAGE;
			const paginatedCreators = creators.slice(startIndex, endIndex);

			creatorsList.innerHTML = paginatedCreators
				.map(
					(c) => `
                    <li>
                        ${c.name}
                    </li>
                `
				)
				.join("");

			// Update pagination controls
			updatePaginationControls(creators.length, page);
		}

		function updatePaginationControls(totalItems, currentPage) {
			const totalPages = Math.ceil(totalItems / ROWS_PER_PAGE);
			paginationContainer.innerHTML = "Page:";

			if (totalPages > 1) {
				// Previous button
				const prevButton = document.createElement("button");
				prevButton.textContent = "←";
				prevButton.className = "pagination-arrow";
				if (currentPage === 1) {
					prevButton.style.visibility = "hidden";
				} else {
					prevButton.addEventListener("click", () => {
						displayCreators(currentPage - 1);
					});
				}
				paginationContainer.appendChild(prevButton);

				// Page numbers
				for (let i = 1; i <= totalPages; i++) {
					const pageButton = document.createElement("button");
					pageButton.textContent = i;
					pageButton.className = "pagination-number";
					if (i === currentPage) {
						pageButton.classList.add("active");
						pageButton.setAttribute("aria-current", "page");
					}
					pageButton.addEventListener("click", () => displayCreators(i));
					paginationContainer.appendChild(pageButton);
				}

				// Next button
				const nextButton = document.createElement("button");
				nextButton.textContent = "→";
				nextButton.className = "pagination-arrow";
				if (currentPage === totalPages) {
					nextButton.style.visibility = "hidden";
				} else {
					nextButton.addEventListener("click", () => {
						displayCreators(currentPage + 1);
					});
				}
				paginationContainer.appendChild(nextButton);
			}
		}
		displayCreators(1);
	} catch (e) {
		console.error("Error:", e);
		displayError("creators-list", "Failed to load creators");
	}
}

async function updateDate() {
	const updateDiv = document.getElementById("update-date");
	const date = new Date();
	const year = date.getFullYear();
	const month = date.toLocaleString("default", { month: "short" });
	const day = date.getDate();

	updateDiv.textContent = `${month} ${day}, ${year}`;
}

document.addEventListener("DOMContentLoaded", loadCreators);
document.addEventListener("DOMContentLoaded", updateDate);
