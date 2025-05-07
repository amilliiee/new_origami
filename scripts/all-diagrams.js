import {
  DIAGRAM_BASE_PATH,
  fetchData,
  ROWS_PER_PAGE,
  DIFFICULTY_MAP
} from "./shared.js";

// Global sort state
let currentSort = 'title';

async function loadDiagrams() {
  try {
      const data = await fetchData();
      const tableBody = document.querySelector("#diagram-table tbody");
      const paginationContainer = document.getElementById("diagram-table-pagination");

      // Populate filter dropdowns
      populateFilters(data);

      document.getElementById('diagram-count').textContent =
      `Currently Hosting: ${data.diagrams.length} Diagrams`;

      // Store the full dataset
      let filteredDiagrams = [...data.diagrams];
      let currentPage = 1;

      function populateFilters(data) {
          // Categories
          const categoryFilter = document.getElementById("category-filter");
          const uniqueCategories = [...new Set(data.categories)].sort();
          uniqueCategories.forEach((category) => {
              const option = document.createElement("option");
              option.value = category;
              option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
              categoryFilter.appendChild(option);
          });

          // Creators
          const creatorFilter = document.getElementById("creator-filter");
          data.creators
              .sort((a, b) => a.name.localeCompare(b.name))
              .forEach((creator) => {
                  const option = document.createElement("option");
                  option.value = creator.id;
                  option.textContent = creator.name;
                  creatorFilter.appendChild(option);
              });
      }

      // Auto-apply filters when any selection changes
      function setupEventListeners() {
          // Filter change events
          document.getElementById("difficulty-filter").addEventListener("change", applyFilters);
          document.getElementById("category-filter").addEventListener("change", applyFilters);
          document.getElementById("creator-filter").addEventListener("change", applyFilters);
          
          // Sort button events
          document.querySelectorAll('.sort-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
                  this.classList.add('active');
                  currentSort = this.dataset.sort;
                  applyFilters();
              });
          });
          
          // Reset button
          document.getElementById("reset-filters").addEventListener("click", () => {
              document.getElementById("difficulty-filter").value = "all";
              document.getElementById("category-filter").value = "all";
              document.getElementById("creator-filter").value = "all";
              document.querySelector('.sort-btn.active').classList.remove('active');
              document.querySelector('.sort-btn[data-sort="title"]').classList.add('active');
              currentSort = 'title';
              applyFilters();
          });
      }

      function applyFilters() {
          const difficultyFilter = document.getElementById("difficulty-filter").value;
          const categoryFilter = document.getElementById("category-filter").value;
          const creatorFilter = document.getElementById("creator-filter").value;

          filteredDiagrams = data.diagrams.filter((diagram) => {
              // Difficulty filter
              if (difficultyFilter !== "all" && diagram.difficulty !== DIFFICULTY_MAP[difficultyFilter]) {
                  return false;
              }

              // Category filter
              if (categoryFilter !== "all" && !diagram.categories.includes(categoryFilter)) {
                  return false;
              }

              // Creator filter
              if (creatorFilter !== "all" && diagram.creatorId !== creatorFilter) {
                  return false;
              }

              return true;
          });

          // Apply current sort
          sortDiagrams();
          
          // Reset to first page and update display
          currentPage = 1;
          displayDiagrams();
      }

      function sortDiagrams() {
          switch(currentSort) {
              case 'title':
                  filteredDiagrams.sort((a, b) => a.title.localeCompare(b.title));
                  break;
                  
              case 'category':
                  filteredDiagrams.sort((a, b) => {
                      const aCat = a.categories[0] || '';
                      const bCat = b.categories[0] || '';
                      return aCat.localeCompare(bCat) || a.title.localeCompare(b.title);
                  });
                  break;
                  
              case 'difficulty':
                  const difficultyOrder = ['★', '★★', '★★★'];
                  filteredDiagrams.sort((a, b) => {
                      return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty) 
                          || a.title.localeCompare(b.title);
                  });
                  break;
          }
      }

      function displayDiagrams() {
          const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
          const endIndex = startIndex + ROWS_PER_PAGE;
          const paginatedDiagrams = filteredDiagrams.slice(startIndex, endIndex);

          // Clear table
          tableBody.innerHTML = "";

          if (paginatedDiagrams.length === 0) {
              tableBody.innerHTML = `
                  <tr>
                      <td colspan="5">No diagrams found matching your criteria.</td>
                  </tr>
              `;
              return;
          }

          paginatedDiagrams.forEach((diagram) => {
              const creator = data.creators.find((c) => c.id === diagram.creatorId);
              const row = document.createElement("tr");
              const cats = [];

              for (let cat of diagram.categories) {
                  cats.push(cat.charAt(0).toUpperCase() + cat.slice(1));
              }

              row.innerHTML = `
                  <td>
                      <a href="${DIAGRAM_BASE_PATH}${diagram.filename}">PDF</a>
                  </td>
                  <td id="difficulty-row">${diagram.difficulty}</td>
                  <td>${diagram.title}</td>
                  <td>${cats.join(", ")}</td>
                  <td>${creator?.name || "Unknown Creator"}</td>
              `;
              tableBody.appendChild(row);
          });

          updatePaginationControls();
      }

      function updatePaginationControls() {
          const totalPages = Math.ceil(filteredDiagrams.length / ROWS_PER_PAGE);
          paginationContainer.innerHTML = 'Page:';
      
          if (totalPages > 1) {
              // Previous arrow (hidden on first page)
              const prevButton = document.createElement('button');
              prevButton.textContent = '←';
              prevButton.className = 'pagination-arrow';
              if (currentPage === 1) {
                  prevButton.style.visibility = 'hidden';
              } else {
                  prevButton.addEventListener('click', () => {
                      currentPage--;
                      displayDiagrams();
                  });
              }
              paginationContainer.appendChild(prevButton);
      
              // Page numbers
              for (let i = 1; i <= totalPages; i++) {
                  const pageButton = document.createElement('button');
                  pageButton.textContent = i;
                  pageButton.className = 'pagination-number';
                  if (i === currentPage) {
                      pageButton.classList.add('active');
                      pageButton.setAttribute('aria-current', 'page');
                  }
                  pageButton.addEventListener('click', () => {
                      currentPage = i;
                      displayDiagrams();
                  });
                  paginationContainer.appendChild(pageButton);
              }
      
              // Next arrow (hidden on last page)
              const nextButton = document.createElement('button');
              nextButton.textContent = '→';
              nextButton.className = 'pagination-arrow';
              if (currentPage === totalPages) {
                  nextButton.style.visibility = 'hidden';
              } else {
                  nextButton.addEventListener('click', () => {
                      currentPage++;
                      displayDiagrams();
                  });
              }
              paginationContainer.appendChild(nextButton);
          }
      }
      document.getElementById("page-title").textContent = "";

      // Set up event listeners and initial display
      setupEventListeners();
      applyFilters();

  } catch (e) {
      console.error("Error:", e);
      document.querySelector("#diagram-table tbody").innerHTML = `
          <tr>
              <td colspan="5" class="error">Error loading diagrams: ${e.message}</td>
          </tr>
      `;
      document.getElementById("page-title").textContent = "";
  }
}

document.addEventListener("DOMContentLoaded", loadDiagrams);