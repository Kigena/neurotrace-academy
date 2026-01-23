import { mdToPdf } from 'md-to-pdf';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const studyGuidesDir = join(__dirname, '../public/study-guides');

// PDF configuration
const pdfConfig = {
  pdf_options: {
    format: 'Letter',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    },
    printBackground: true,
  },
  stylesheet_encoding: 'utf8',
};

async function findMarkdownFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await findMarkdownFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && extname(entry.name) === '.md') {
      files.push(fullPath);
    }
  }

  return files;
}

async function convertToPdf(mdPath, index) {
  try {
    console.log(`Converting: ${mdPath}`);
    
    // Read the markdown content
    const mdContent = await readFile(mdPath, 'utf-8');
    
    // Convert to PDF with unique userDataDir to avoid locks
    // Set basedir to public folder so /images/ paths resolve correctly
    const publicDir = join(__dirname, '../public');
    const pdf = await mdToPdf({ content: mdContent }, { 
      ...pdfConfig,
      basedir: publicDir,
      launch_options: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      pdf_options: {
        ...pdfConfig.pdf_options,
        preferCSSPageSize: true,
      },
    });
    
    if (pdf) {
      const pdfPath = mdPath.replace('.md', '.pdf');
      await writeFile(pdfPath, pdf.content);
      console.log(`✅ Created: ${pdfPath}`);
      
      // Small delay to allow browser cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } else {
      console.log(`❌ Failed to convert: ${mdPath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error converting ${mdPath}:`, error.message);
    // Wait a bit longer on error before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    return false;
  }
}

async function main() {
  console.log('📚 Converting Markdown Study Guides to PDF...\n');
  
  const mdFiles = await findMarkdownFiles(studyGuidesDir);
  console.log(`Found ${mdFiles.length} markdown files to convert.\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < mdFiles.length; i++) {
    const mdFile = mdFiles[i];
    const success = await convertToPdf(mdFile, i);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n✅ Conversion complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
}

main().catch(console.error);

