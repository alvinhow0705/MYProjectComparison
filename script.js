let projects = [];
let selected = [];
let activeArea = "All";
let activeTitle = "All";
let activeSort = "default";

/* =========================
   TAG HELPER
========================= */
function getTagClass(tag) {
    const map = {
        "Freehold": "tag-freehold",
        "Near MRT/LRT": "tag-near-mrt",
        "Low Density": "tag-low-density",
        "Low PSF": "tag-low-psf",
        "Family Size": "tag-family-size",
        "Below 450K": "tag-below-450k",
        "Premium": "tag-premium",
        "Ready Move In": "tag-ready-move-in",
        "Branded Developer": "tag-branded"
    };
    return map[tag] || "tag-default";
}

function renderTags(tags) {
    if (!tags || tags.length === 0) return "";
    return `<div class="tag-row">${tags.map(t =>
        `<span class="tag ${getTagClass(t)}">${t}</span>`
    ).join("")}</div>`;
}

/* =========================
   LOAD PROJECTS
========================= */
/* =========================
   STICKY TOP CALC
========================= */
function setStickyTops() {
    const nav = document.querySelector('nav');
    const areaBar = document.querySelector('.area-filter-bar');
    const filterBar = document.querySelector('.filter-bar');
    if (!nav || !areaBar || !filterBar) return;

    const navH = nav.offsetHeight;
    areaBar.style.top = navH + 'px';

    const areaH = areaBar.offsetHeight;
    filterBar.style.top = (navH + areaH) + 'px';
}

async function loadProjects() {
    try {
        const res = await fetch('data/projects.json');
        projects = await res.json();
        renderAreaFilter();
        initFilterSort();
        renderProjects();
        updateUI();
        setStickyTops();
        window.addEventListener('resize', setStickyTops);
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

/* =========================
   FILTER + SORT INIT
========================= */
function initFilterSort() {
    // Title filter buttons (Freehold / Leasehold)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTitle = btn.dataset.filter;
            if (typeof gtag === 'function') gtag('event', 'filter_title', { filter_value: btn.dataset.filter });
            renderProjects();
        });
    });

    // Sort dropdown
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            activeSort = sortSelect.value;
            if (typeof gtag === 'function') gtag('event', 'sort_changed', { sort_value: sortSelect.value });
            renderProjects();
        });
    }
}

/* =========================
   PARSE NUMBER HELPERS
========================= */
function parsePrice(str) {
    return parseInt((str || "").replace(/\D/g, "")) || 0;
}

function parsePSF(str) {
    return parseInt((str || "").replace(/[^\d]/g, "")) || 0;
}

function parseTotalUnits(str) {
    return parseInt((str || "").replace(/,/g, "")) || 0;
}

function parseCompletion(str) {
    if (!str) return 9999;
    if (str.toLowerCase() === "completed") return 0;
    const match = str.match(/\d{4}/);
    return match ? parseInt(match[0]) : 9999;
}

/* Priority developers — these always appear first in default order */
const PRIORITY_DEVS = ["Mightprop - Exsim", "Exsim", "Malton Group", "Berjaya Group", "Chin Hin Group", "UOA", "SPC", "Paramount Property"];

function sortProjects(list) {
    const sorted = [...list];
    switch (activeSort) {
        case "default": {
            // Priority developers first (keep original order), rest sorted by price low → high
            const priority = sorted.filter(p => PRIORITY_DEVS.includes(p.developer));
            const rest = sorted.filter(p => !PRIORITY_DEVS.includes(p.developer));
            rest.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
            return [...priority, ...rest];
        }
        case "price-asc":
            sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
            break;
        case "price-desc":
            sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
            break;
        case "psf-asc":
            sorted.sort((a, b) => parsePSF(a.psf) - parsePSF(b.psf));
            break;
        case "completion":
            sorted.sort((a, b) => parseCompletion(a["completion Year"]) - parseCompletion(b["completion Year"]));
            break;
        case "units-asc":
            sorted.sort((a, b) => parseTotalUnits(a["total unit"]) - parseTotalUnits(b["total unit"]));
            break;
    }
    return sorted;
}

/* =========================
   AREA FILTER BAR
========================= */
function renderAreaFilter() {
    const container = document.getElementById('areaFilter');
    if (!container) return;

    // Group locations and count, merging similar areas
    const areaGroups = {
        "Bukit Jalil": ["Bukit Jalil"],
        "Seri Kembangan": ["Seri Kembangan"],
        "OUG": ["OUG"],
        "Bukit Serdang": ["Bukit Serdang"],
        "Sri Petaling": ["Sri Petaling"],
        "Sungai Besi": ["Sungai Besi"],
        "Old Klang Road": ["Old Klang Road"],
        "Taman Desa": ["Taman Danau Desa"],
        "Cheras": ["Cheras"],
        "Subang & Puchong": ["Subang", "Subang Jaya", "Puchong"],
        "PJ & Damansara": ["Petaling Jaya", "Kota Damansara", "Kwasa Damansara", "Ara Damansara"],
        "Bangsar": ["Bangsar", "Bangsar South"],
        "Seputeh": ["Seputeh"],
        "Mont Kiara": ["Mont Kiara"],
        "KLCC": ["KLCC"]
    };

    // Count per group
    const areaCounts = {};
    for (const [group, locations] of Object.entries(areaGroups)) {
        const count = projects.filter(p => locations.includes(p.location)).length;
        if (count > 0) areaCounts[group] = count;
    }

    // Check for ungrouped locations
    const allGrouped = Object.values(areaGroups).flat();
    const ungrouped = projects.filter(p => !allGrouped.includes(p.location));
    ungrouped.forEach(p => {
        if (!areaCounts[p.location]) areaCounts[p.location] = 0;
        areaCounts[p.location]++;
    });

    // Build buttons
    const total = projects.length;
    const areaKeys = Object.keys(areaCounts);
    // Count how many have 10+ areas
    const multiCount = areaKeys.length >= 10 ? "10+" : areaKeys.length;

    let html = `<button class="area-btn active" data-area="All">
        <span>🏠</span> All Areas (${multiCount} Areas)
        <span class="area-count">${total}</span>
    </button>`;

    // Sort by count descending
    const sorted = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([area, count]) => {
        html += `<button class="area-btn" data-area="${area}">
            <span>📍</span> ${area}
            <span class="area-count">${count}</span>
        </button>`;
    });

    container.innerHTML = html;

    // Store area groups for filtering
    container._areaGroups = areaGroups;

    // Add click handlers
    container.querySelectorAll('.area-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.area-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeArea = btn.dataset.area;
            if (typeof gtag === 'function') gtag('event', 'filter_area', { area_value: btn.dataset.area });
            renderProjects();
        });
    });

    // Scroll buttons + fade edges
    const scrollL = document.getElementById('areaScrollL');
    const scrollR = document.getElementById('areaScrollR');
    const fadeL = document.getElementById('areaFadeL');
    const fadeR = document.getElementById('areaFadeR');

    if (scrollL && scrollR) {
        const step = 240;

        scrollL.addEventListener('click', () => {
            container.scrollBy({ left: -step, behavior: 'smooth' });
        });
        scrollR.addEventListener('click', () => {
            container.scrollBy({ left: step, behavior: 'smooth' });
        });

        function updateScrollIndicators() {
            const atStart = container.scrollLeft <= 10;
            const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

            scrollL.classList.toggle('hidden', atStart);
            scrollR.classList.toggle('hidden', atEnd);
            if (fadeL) fadeL.style.opacity = atStart ? '0' : '1';
            if (fadeR) fadeR.style.opacity = atEnd ? '0' : '1';
        }

        container.addEventListener('scroll', updateScrollIndicators);
        setTimeout(updateScrollIndicators, 100);
    }
}

/* =========================
   RENDER PROJECT CARDS
========================= */
function renderProjects() {
    const container = document.getElementById('projectList');
    if (!container) return;

    container.innerHTML = '';

    // Get area groups from filter
    const filterContainer = document.getElementById('areaFilter');
    const areaGroups = filterContainer?._areaGroups || {};

    // Filter by area
    let filtered = activeArea === "All"
        ? [...projects]
        : projects.filter(p => {
            if (areaGroups[activeArea]) {
                return areaGroups[activeArea].includes(p.location);
            }
            return p.location === activeArea;
        });

    // Filter by title (Freehold / Leasehold)
    if (activeTitle !== "All") {
        filtered = filtered.filter(p => p.title === activeTitle);
    }

    // Sort
    filtered = sortProjects(filtered);

    // Update project count
    const countEl = document.getElementById('projectCount');
    if (countEl) countEl.textContent = `Showing ${filtered.length} project${filtered.length !== 1 ? 's' : ''}`;

    filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = project.id;

        const titleClass = project.title === "Freehold" ? "freehold" : "leasehold";
        const titleLabel = project.title || "—";
        const imageTag = project.tag ? `<span class="card-img-tag">${project.tag}</span>` : "";

        // Build images array — support both "images" array and single "image"
        const images = project.images && project.images.length > 0
            ? project.images
            : [project.image];
        const hasMultiple = images.length > 1;

        const carouselImgs = images.map((src, i) => `
            <img src="${src}" alt="${project.name} ${i+1}"
                onload="this.closest('.card-img-wrap').classList.add('loaded')"
                onerror="this.style.display='none'">`
        ).join('');

        const dotsHtml = hasMultiple ? `
            <div class="card-carousel-dots">
                ${images.map((_, i) => `<span class="card-carousel-dot${i === 0 ? ' active' : ''}"></span>`).join('')}
            </div>` : '';

        const navHtml = hasMultiple ? `
            <div class="card-carousel-nav">
                <button class="card-carousel-btn carousel-prev" data-dir="-1">‹</button>
                <button class="card-carousel-btn carousel-next" data-dir="1">›</button>
            </div>` : '';

        card.innerHTML = `
            <div class="card-img-wrap" data-index="0" data-count="${images.length}">
                <div class="card-img-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span>Loading image…</span>
                </div>
                <div class="card-carousel">${carouselImgs}</div>
                ${imageTag}
                ${dotsHtml}
                ${navHtml}
                <span class="card-img-tag-selected">✓ Selected</span>
            </div>
            <div class="card-body">
                <div class="card-top-row">
                    <h3>${project.name}</h3>
                    <span class="card-title-tag ${titleClass}">${titleLabel}</span>
                </div>
                <div class="card-meta">
                    <span class="card-loc">${project.location}</span> · ${project.developer || "—"}
                </div>
                <div class="card-price-row">
                    <span class="card-price">${project.price}</span>
                    <span class="card-psf">${project.psf || ""}</span>
                </div>
                <div class="card-stats">
                    <div class="card-stat">
                        <div class="card-stat-label">Units</div>
                        <div class="card-stat-value">${project["total unit"] || "—"}</div>
                    </div>
                    <div class="card-stat">
                        <div class="card-stat-label">Size (sqft)</div>
                        <div class="card-stat-value">${(project["unit size"] || "—").replace(/\s*sqft/i, "")}</div>
                    </div>
                    <div class="card-stat">
                        <div class="card-stat-label">Completion</div>
                        <div class="card-stat-value">${project["completion Year"] || "—"}</div>
                    </div>
                </div>
                <button class="select-btn">Select</button>
            </div>
        `;

        const btn = card.querySelector(".select-btn");
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleSelect(project, card, btn);
        });

        // Carousel navigation
        card.querySelectorAll('.card-carousel-btn').forEach(navBtn => {
            navBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const wrap = card.querySelector('.card-img-wrap');
                const carousel = card.querySelector('.card-carousel');
                const count = parseInt(wrap.dataset.count);
                let idx = parseInt(wrap.dataset.index);
                const dir = parseInt(navBtn.dataset.dir);

                idx = Math.max(0, Math.min(count - 1, idx + dir));
                wrap.dataset.index = idx;
                carousel.style.transform = `translateX(-${idx * 100}%)`;

                // Update dots
                card.querySelectorAll('.card-carousel-dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === idx);
                });
            });
        });

        container.appendChild(card);
    });

    // Scroll reveal animation with stagger
    revealCards();
}

function revealCards() {
    const cards = document.querySelectorAll('.card:not(.revealed)');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const delay = Array.from(cards).indexOf(card) % 3 * 80;
                setTimeout(() => card.classList.add('revealed'), delay);
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
}

/* =========================
   SELECT / UNSELECT
========================= */
function toggleSelect(project, card, btn) {
    const exists = selected.find(p => p.id === project.id);

    if (exists) {
        selected = selected.filter(p => p.id !== project.id);
        card.classList.remove('selected');
        btn.innerText = "Select";
        if (typeof gtag === 'function') gtag('event', 'project_deselected', { project_name: project.name, project_location: project.location });
    } else {
        if (selected.length >= 2) {
            alert("You can only select up to 2 projects to compare.\nDeselect one first.");
            return;
        }
        selected.push(project);
        card.classList.add('selected');
        btn.innerText = "Deselect";
        if (typeof gtag === 'function') gtag('event', 'project_selected', { project_name: project.name, project_location: project.location, project_price: project.price });
    }

    updateUI();
}

/* =========================
   UI UPDATE
========================= */
function updateUI() {
    const count = document.getElementById('count');
    const btn   = document.getElementById('compareBtn');
    const hint  = document.getElementById("hint");

    if (count) count.innerText = selected.length;

    if (btn) {
        if (selected.length === 0) {
            btn.innerText = "Select a Project";
            btn.disabled = true;
        } else if (selected.length === 1) {
            btn.innerText = "View Project Details →";
            btn.disabled = false;
        } else {
            btn.innerText = "Compare Projects →";
            btn.disabled = false;
        }
    }

    if (hint) {
        if (selected.length === 0) hint.innerText = "Tip: Select 1 project to view details or 2 to compare";
        if (selected.length === 1) hint.innerText = "1 project selected — click to view full details";
        if (selected.length === 2) hint.innerText = "2 projects selected — ready to compare!";
    }
}

/* =========================
   COMPARE / DETAIL ROUTING
========================= */
document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("compareBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
        if (selected.length === 0) return;

        localStorage.setItem("selectedProjects", JSON.stringify(selected));
        // Clear finderData since user browsed directly (not via Smart Finder)
        localStorage.removeItem("finderData");

        if (selected.length === 1) {
            if (typeof gtag === 'function') gtag('event', 'view_project_detail', { project_name: selected[0].name });
            window.location.href = "pages/detail.html";
        } else {
            if (typeof gtag === 'function') gtag('event', 'compare_projects', { project_1: selected[0].name, project_2: selected[1].name });
            window.location.href = "pages/compare.html";
        }
    });
});

/* =========================
   BUDGET PARSER (500000 / 500k / 50w)
========================= */
function parseBudget(val) {
    val = val.toLowerCase().replace(/[\s,]/g, "");
    if (/^[\d.]+k$/.test(val)) {
        return parseFloat(val) * 1000;
    }
    if (/^[\d.]+w$/.test(val)) {
        return parseFloat(val) * 10000;
    }
    if (/^[\d.]+m$/.test(val)) {
        return parseFloat(val) * 1000000;
    }
    return parseFloat(val) || 0;
}

/* =========================
   SMART FINDER (find.html)
========================= */
document.addEventListener("DOMContentLoaded", async function () {
    const findBtn = document.getElementById("findBtn");
    if (!findBtn) return;

    // Auto-populate location dropdown from projects data
    if (projects.length === 0) {
        try {
            const res = await fetch('../data/projects.json');
            projects = await res.json();
        } catch (e) {
            console.error("Could not load projects", e);
        }
    }

    const locationSelect = document.getElementById("location");
    if (locationSelect && projects.length > 0) {
        const locations = [...new Set(projects.map(p => p.location))].sort();
        locations.forEach(loc => {
            const opt = document.createElement("option");
            opt.value = loc;
            opt.textContent = loc;
            locationSelect.appendChild(opt);
        });
    }

    findBtn.addEventListener("click", async function () {
        const budgetVal  = document.getElementById("budget")?.value.trim();
        const locationVal = document.getElementById("location")?.value;
        const purposeVal  = document.getElementById("purpose")?.value;

        if (!budgetVal) {
            alert("Please enter your budget.");
            return;
        }

        const budget = parseBudget(budgetVal);
        if (!budget || budget <= 0) {
            alert("Please enter a valid budget (e.g. 500000, 500k, or 50w).");
            return;
        }

        // Load projects fresh if not already loaded
        if (projects.length === 0) {
            try {
                const res = await fetch('../data/projects.json');
                projects = await res.json();
            } catch (e) {
                console.error("Could not load projects", e);
                return;
            }
        }

        // Filter by budget and location
        let filtered = projects.filter(p => {
            const price = parseInt(p.price.replace(/\D/g, "")) || 0;
            const withinBudget = price <= budget;
            const matchLocation = !locationVal || locationVal === "Any" || p.location === locationVal;
            return withinBudget && matchLocation;
        });

        // Show "no results" message if nothing matches
        if (filtered.length < 1) {
            const resultsDiv = document.getElementById("finderResults");
            if (resultsDiv) {
                resultsDiv.innerHTML = `<p style="text-align:center;color:#888;margin-top:20px;">No projects found within RM${budget.toLocaleString()}. Try a higher budget.</p>`;
            }
            return;
        }

        localStorage.setItem("selectedProjects", JSON.stringify(filtered.slice(0, 2)));

        // Save finder data for lead tracking
        localStorage.setItem("finderData", JSON.stringify({
            budget: budgetVal,
            location: locationVal || "Any"
        }));

        if (typeof gtag === 'function') gtag('event', 'smart_finder_search', { budget: budgetVal, location: locationVal || "Any", results_count: filtered.length });

        // Show all matching results inline
        const resultsDiv = document.getElementById("finderResults");
        if (resultsDiv) {
            showFinderResults(filtered, resultsDiv);
        } else {
            window.location.href = "compare.html";
        }
    });
});

let finderSelected = [];

function showFinderResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = `<p style="text-align:center;color:#888;">No matching projects found. Try a higher budget or different location.</p>`;
        return;
    }

    finderSelected = [];
    const imagePrefix = window.location.pathname.includes('/pages/') ? '../' : '';

    container.innerHTML = `
        <h3 style="text-align:center; margin-bottom:16px;">${results.length} project${results.length > 1 ? 's' : ''} found within your budget</h3>
        <div class="projects" style="padding:28px 0;"></div>
    `;

    const grid = container.querySelector('.projects');

    results.forEach(project => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = project.id;

        const titleClass = project.title === "Freehold" ? "freehold" : "leasehold";
        const titleLabel = project.title || "—";
        const imageTag = project.tag ? `<span class="card-img-tag">${project.tag}</span>` : "";

        // Build images array
        const images = project.images && project.images.length > 0
            ? project.images
            : [project.image];
        const hasMultiple = images.length > 1;

        const carouselImgs = images.map((src, i) => `
            <img src="${imagePrefix}${src}" alt="${project.name} ${i+1}"
                onload="this.closest('.card-img-wrap').classList.add('loaded')"
                onerror="this.style.display='none'">`
        ).join('');

        const dotsHtml = hasMultiple ? `
            <div class="card-carousel-dots">
                ${images.map((_, i) => `<span class="card-carousel-dot${i === 0 ? ' active' : ''}"></span>`).join('')}
            </div>` : '';

        const navHtml = hasMultiple ? `
            <div class="card-carousel-nav">
                <button class="card-carousel-btn carousel-prev" data-dir="-1">‹</button>
                <button class="card-carousel-btn carousel-next" data-dir="1">›</button>
            </div>` : '';

        card.innerHTML = `
            <div class="card-img-wrap" data-index="0" data-count="${images.length}">
                <div class="card-img-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span>Loading image…</span>
                </div>
                <div class="card-carousel">${carouselImgs}</div>
                ${imageTag}
                ${dotsHtml}
                ${navHtml}
                <span class="card-img-tag-selected">✓ Selected</span>
            </div>
            <div class="card-body">
                <div class="card-top-row">
                    <h3>${project.name}</h3>
                    <span class="card-title-tag ${titleClass}">${titleLabel}</span>
                </div>
                <div class="card-meta">
                    <span class="card-loc">${project.location}</span> · ${project.developer || "—"}
                </div>
                <div class="card-price-row">
                    <span class="card-price">${project.price}</span>
                    <span class="card-psf">${project.psf || ""}</span>
                </div>
                <div class="card-stats">
                    <div class="card-stat">
                        <div class="card-stat-label">Units</div>
                        <div class="card-stat-value">${project["total unit"] || "—"}</div>
                    </div>
                    <div class="card-stat">
                        <div class="card-stat-label">Size (sqft)</div>
                        <div class="card-stat-value">${(project["unit size"] || "—").replace(/\s*sqft/i, "")}</div>
                    </div>
                    <div class="card-stat">
                        <div class="card-stat-label">Completion</div>
                        <div class="card-stat-value">${project["completion Year"] || "—"}</div>
                    </div>
                </div>
                <button class="select-btn">Select</button>
            </div>
        `;

        const btn = card.querySelector(".select-btn");
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFinderSelect(project, card, btn);
        });

        // Carousel navigation
        card.querySelectorAll('.card-carousel-btn').forEach(navBtn => {
            navBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const wrap = card.querySelector('.card-img-wrap');
                const carousel = card.querySelector('.card-carousel');
                const count = parseInt(wrap.dataset.count);
                let idx = parseInt(wrap.dataset.index);
                const dir = parseInt(navBtn.dataset.dir);

                idx = Math.max(0, Math.min(count - 1, idx + dir));
                wrap.dataset.index = idx;
                carousel.style.transform = `translateX(-${idx * 100}%)`;

                card.querySelectorAll('.card-carousel-dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === idx);
                });
            });
        });

        grid.appendChild(card);
    });

    // Show bottom bar
    const bar = document.getElementById("finderBar");
    if (bar) bar.style.display = "";

    // Attach compare button
    const compareBtn = document.getElementById("finderCompareBtn");
    if (compareBtn) {
        compareBtn.onclick = function () {
            if (finderSelected.length === 0) return;
            localStorage.setItem("selectedProjects", JSON.stringify(finderSelected));
            if (finderSelected.length === 1) {
                if (typeof gtag === 'function') gtag('event', 'finder_view_detail', { project_name: finderSelected[0].name });
                window.location.href = "detail.html";
            } else {
                if (typeof gtag === 'function') gtag('event', 'finder_compare_projects', { project_1: finderSelected[0].name, project_2: finderSelected[1].name });
                window.location.href = "compare.html";
            }
        };
    }

    updateFinderUI();
    revealCards();
}

function toggleFinderSelect(project, card, btn) {
    const exists = finderSelected.find(p => p.id === project.id);
    if (exists) {
        finderSelected = finderSelected.filter(p => p.id !== project.id);
        card.classList.remove('selected');
        btn.innerText = "Select";
        if (typeof gtag === 'function') gtag('event', 'finder_project_deselected', { project_name: project.name });
    } else {
        if (finderSelected.length >= 2) {
            alert("You can only select up to 2 projects to compare.\nDeselect one first.");
            return;
        }
        finderSelected.push(project);
        card.classList.add('selected');
        btn.innerText = "Deselect";
        if (typeof gtag === 'function') gtag('event', 'finder_project_selected', { project_name: project.name, project_price: project.price });
    }
    updateFinderUI();
}

function updateFinderUI() {
    const count = document.getElementById("finderCount");
    const btn = document.getElementById("finderCompareBtn");
    const hint = document.getElementById("finderHint");

    if (count) count.innerText = finderSelected.length;

    if (btn) {
        if (finderSelected.length === 0) {
            btn.innerText = "Select a Project";
            btn.disabled = true;
        } else if (finderSelected.length === 1) {
            btn.innerText = "View Project Details →";
            btn.disabled = false;
        } else {
            btn.innerText = "Compare Projects →";
            btn.disabled = false;
        }
    }

    if (hint) {
        if (finderSelected.length === 0) hint.innerText = "Tip: Select 1 project to view details or 2 to compare";
        if (finderSelected.length === 1) hint.innerText = "1 project selected — click to view full details";
        if (finderSelected.length === 2) hint.innerText = "2 projects selected — ready to compare!";
    }
}

/* =========================
   INIT
========================= */
loadProjects();
