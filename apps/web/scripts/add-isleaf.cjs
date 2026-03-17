/* global require, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const studyplanDir = path.join(__dirname, '../public/studyplan');

// Function to add isLeaf property to a section recursively
function addIsLeafProperty(section) {
  // Determine if this section is a leaf (has no children or empty children array)
  const hasChildren = section.children && section.children.length > 0;
  section.isLeaf = !hasChildren;

  // Recursively process children if they exist
  if (hasChildren) {
    section.children = section.children.map(child => addIsLeafProperty(child));
  }

  return section;
}

// Get all JSON files in the studyplan directory
const files = fs.readdirSync(studyplanDir).filter(file => file.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(studyplanDir, file);
  console.log(`Processing ${file}...`);

  try {
    // Read the JSON file
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // Check if isLeaf is already present in the first child
    if (data.children && data.children.length > 0) {
      const firstChild = data.children[0];
      if (firstChild.isLeaf !== undefined) {
        console.log(`  ✓ ${file} already has isLeaf property, skipping`);
        return;
      }
    }

    // Add isLeaf property to all sections
    if (data.children) {
      data.children = data.children.map(section => addIsLeafProperty(section));
    }

    // Write the updated JSON back to the file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`  ✓ ${file} updated successfully`);
  } catch (error) {
    console.error(`  ✗ Error processing ${file}:`, error.message);
  }
});

console.log('\nDone!');
