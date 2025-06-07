// Insert image in the card
async function insertImage({ name, format, altText, webZoom, mobileZoom }) {

  console.log(`Trying to insert image: ${name}.${format}`);

  const isMobile = window.innerWidth <= 768;
  const scale = isMobile ? mobileZoom : webZoom;
  const imagePath = `images/${name}.${format}`;
  const targetEl = document.getElementById(name);

  if (!targetEl) {
    console.warn(`insertImage: No element found with id="${name}"`);
    return;
  }

  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error(`Image not found at path: ${imagePath}`);
    }
    console.log(`Image found at ${imagePath}`);
  } catch (error) {
    console.error(error.message);
    return;
  }

  // Create container div
  const container = document.createElement('div');
  container.className = 'post-image-container';
  container.style.setProperty('--container-scale', scale);
  container.style.transform = `scale(${scale})`;
  container.style.transformOrigin = 'center';
  container.setAttribute('onclick', `expandImage('${imagePath}')`);
  container.style.border = '2px dashed red'; // TEMP border for visibility

  // Create img element
  const img = document.createElement('img');
  img.className = 'post-image';
  img.alt = altText;
  img.src = imagePath;
  img.onerror = () => {
    console.error(`Failed to load image: ${img.src}`);
    img.style.border = '2px solid red';
    img.alt = 'Image failed to load';
  };

  // Create button element
  const btn = document.createElement('button');
  btn.className = 'expand-btn';
  btn.style.transform = `scale(${1 / scale})`;
  btn.style.transformOrigin = 'center';
  btn.textContent = 'Expand';

  container.appendChild(img);
  container.appendChild(btn);

  targetEl.replaceWith(container);

  console.log(`Image inserted into DOM for id="${name}"`);
  
  console.log("insertImage() called for", name);
  console.log("Target element is:", targetEl);
}
