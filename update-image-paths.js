// Run this AFTER downloading images to update projects.json
// node update-image-paths.js

const fs = require('fs');
const path = require('path');

const projects = JSON.parse(fs.readFileSync('data/projects.json', 'utf8'));

// Map project names to image filenames
const imageMap = {
    "The Aldenz @ Central Park Damansara": "aldenz.jpeg",
    "The Queenswoodz": "queenswoodz.jpg",
    "The Vividz": "vividz.jpeg",
    "OAKA Residences": "oaka.jpg",
    "Park Green": "parkgreen.jpg",
    "REN Residence": "ren.avif",
    "Maple Residences": "maple.jpg",
    "Ayanna": "ayanna.webp",
    "Gen Starz": "genstarz.webp",
    "Riverville 2": "riverville2.jpg",
    "Aster Hill": "asterhill.jpg",
    "Aurum 2": "aurum2.jpg",
    "Arte Star": "artestar.jpg",
    "Arte Solaris": "artesolaris.jpg",
    "Aricia": "aricia.jpg",
    "Ambience": "ambience.jpg",
    "Alamanda Height": "alamandaheight.jpg",
    "Quaver": "quaver.jpg",
    "Avantro": "avantro.jpg",
    "The Wyn": "thewyn.jpg",
    "Kensho Residence": "kensho.jpg",
    "M Aspira": "maspira.jpg",
    "Tria Seputeh Residences": "tria.jpg",
    "One Seputeh": "oneseputeh.jpg",
    "Est8": "est8.jpg",
    "D'Nuri": "dnuri.jpg",
    "D'Evia": "devia.jpg",
    "Forest Hill": "foresthill.jpg",
    "The Atera": "atera.jpg",
    "Parkside Residence": "parkside.jpg",
    "River Park": "riverpark.jpg",
    "Colonial Infinite": "colonial.jpg",
    "Alora": "alora.jpg",
    "ARRA Residence": "arra.jpg",
    "Amara Residence": "amara.jpg",
    "Mahogany Residence": "mahogany.jpg",
    "CloutHaus": "clouthaus.jpg",
    "Phoeniz Suites": "phoeniz.jpg",
    "Aras Residence": "aras.jpg"
};

let updated = 0;
projects.forEach(p => {
    const filename = imageMap[p.name];
    if (filename) {
        const imgPath = `assets/images/${filename}`;
        if (p.image !== imgPath) {
            p.image = imgPath;
            updated++;
        }
    }
});

fs.writeFileSync('data/projects.json', JSON.stringify(projects, null, 2));
console.log(`Updated ${updated} image paths in projects.json`);
